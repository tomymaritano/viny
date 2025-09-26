import { useState, useEffect, useMemo } from 'react'
import { Icons } from '../../Icons'
import TagContextMenu from '../../ui/TagContextMenu'
import TagSettingsModal from '../tags/TagSettingsModal'
// BaseModal import removed - using inline Select instead
import { useAppStore } from '../../../stores/newSimpleStore'
import { useNotebooks } from '../../../hooks/useNotebooks'
import { getNotebookWithCounts } from '../../../utils/notebookTree'
import { useTagEdit } from '../../../hooks/useTagEdit'
import { addTag, removeTag, updateTag } from '../../../utils/tagValidation'
import { formatDate as utilFormatDate } from '../../../utils/dateUtils'
import { noteLogger as logger } from '../../../utils/logger'

// Import subcomponents
import PreviewHeader from '../../metadata/PreviewHeader'
import TitleEditor from '../../metadata/TitleEditor'
import NotebookSelector from '../../metadata/NotebookSelector'
import StatusSelector from '../../metadata/StatusSelector'
import TagsInput from '../../metadata/TagsInput'

interface NotebookOption {
  value: string
  label: string
  icon?: string
  level?: number
}

const NoteMetadata = ({
  note,
  onTitleChange,
  onNotebookChange,
  onStatusChange,
  onTagsChange,
  isPreviewMode = false,
}) => {
  // Debug: NoteMetadata mounted/updated
  // Removed notebook modal state and manual status dropdown state
  const [localTitle, setLocalTitle] = useState(note?.title || '')
  const [tagInput, setTagInput] = useState('')
  const [showTagSuggestions, setShowTagSuggestions] = useState(false)
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1)
  const [contextMenu, setContextMenu] = useState({
    show: false,
    x: 0,
    y: 0,
    tag: null,
    index: null,
  })
  const [tagSettingsModal, setTagSettingsModal] = useState({
    show: false,
    tagName: '',
    tagIndex: null,
  })
  const { setTagColor, setModal, notes } = useAppStore()
  const { notebooks: allNotebooks } = useNotebooks()

  // Use the same function as sidebar for consistent hierarchy
  const hierarchicalNotebooks = getNotebookWithCounts(allNotebooks, notes)

  // Categories are now properly hierarchical using getNotebookWithCounts

  // Get all unique tags from all notes for suggestions
  const allTags = useMemo(() => {
    const tagsSet = new Set<string>()
    notes.forEach(note => {
      note.tags?.forEach(tag => tagsSet.add(tag))
    })
    return Array.from(tagsSet).sort()
  }, [notes])

  // Filter tag suggestions based on input
  const tagSuggestions = useMemo((): string[] => {
    if (!tagInput.trim()) return []

    const currentTags = note?.tags || []
    const query = tagInput.toLowerCase()

    return allTags
      .filter(
        tag => tag.toLowerCase().includes(query) && !currentTags.includes(tag) // Don't suggest tags that are already added
      )
      .slice(0, 5) // Limit to 5 suggestions
  }, [tagInput, allTags, note?.tags])

  // Prepare notebook options with proper hierarchy and colors using NotebookWithCounts
  const notebookOptions = useMemo(() => {
    const flattenNotebookWithCounts = (
      notebooks: any[],
      parentLevel = 0,
      allNotebooksMap?: Map<string, any>
    ): any[] => {
      const result: any[] = []

      notebooks.forEach(notebook => {
        // Skip if notebook doesn't have a name
        if (!notebook || !notebook.name) {
          return
        }

        // Add the current notebook
        result.push({
          value: notebook.name,
          label: notebook.name.charAt(0).toUpperCase() + notebook.name.slice(1),
          level: parentLevel,
          color: notebook.color,
          id: notebook.id,
          hasChildren: notebook.children && notebook.children.length > 0,
          parentId: notebook.parentId,
          count: notebook.totalCount || 0,
        })

        // Add children recursively
        if (notebook.children && notebook.children.length > 0) {
          // If children are strings (IDs), convert them to notebook objects
          const childNotebooks = notebook.children
            .map(child => {
              if (typeof child === 'string' && allNotebooksMap) {
                return allNotebooksMap.get(child)
              }
              return child
            })
            .filter(Boolean) // Remove any undefined entries

          if (childNotebooks.length > 0) {
            result.push(
              ...flattenNotebookWithCounts(
                childNotebooks,
                parentLevel + 1,
                allNotebooksMap
              )
            )
          }
        }
      })

      return result
    }

    // Create a map for easy lookup
    const notebooksMap = new Map(hierarchicalNotebooks.map(nb => [nb.id, nb]))

    // Only process root notebooks (those without parentId)
    const rootNotebooks = hierarchicalNotebooks.filter(nb => !nb.parentId)

    return flattenNotebookWithCounts(rootNotebooks, 0, notebooksMap)
  }, [hierarchicalNotebooks])

  // Use the custom tag editing hook
  const {
    editingTag,
    editValue,
    editInputRef,
    handleEditTag,
    handleSaveEdit,
    handleCancelEdit,
    handleEditKeyDown,
    setEditValue,
    isEditing,
  } = useTagEdit(note?.tags || [], onTagsChange)

  // Helper function to close context menu
  const closeContextMenu = () => {
    setContextMenu({ show: false, x: 0, y: 0, tag: null, index: null })
  }

  // Update local title when note changes
  useEffect(() => {
    setLocalTitle(note?.title || '')
  }, [note?.id, note?.title])

  // Notebook selection handler
  const handleNotebookSelect = (notebookValue: string) => {
    // Debug: handleNotebookSelect called with notebookValue
    
    // Call onNotebookChange directly with the notebook value (name)
    // The handler in useMarkdownEditor expects either a direct value or an event object
    if (onNotebookChange) {
      // Call with the notebook value directly - the handler will handle both formats
      onNotebookChange(notebookValue)
      // Called onNotebookChange with notebookValue
    } else {
      logger.warn('NoteMetadata: onNotebookChange is not provided!')
    }
  }

  const statusOptions = [
    { value: 'draft', label: 'Draft', color: 'bg-gray-400', icon: 'FileText' },
    {
      value: 'in-progress',
      label: 'In Progress',
      color: 'bg-blue-400',
      icon: 'Clock',
    },
    { value: 'review', label: 'Review', color: 'bg-yellow-400', icon: 'Eye' },
    {
      value: 'completed',
      label: 'Completed',
      color: 'bg-green-400',
      icon: 'CheckCircle',
    },
    {
      value: 'archived',
      label: 'Archived',
      color: 'bg-red-400',
      icon: 'Archive',
    },
  ]

  const handleTagsInput = e => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()

      // If there's a selected suggestion, use it
      if (
        showTagSuggestions &&
        selectedSuggestionIndex >= 0 &&
        tagSuggestions[selectedSuggestionIndex]
      ) {
        addTagFromInput(tagSuggestions[selectedSuggestionIndex])
      } else if (tagInput.trim()) {
        // Otherwise, add the typed text
        addTagFromInput(tagInput.trim())
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (tagSuggestions.length > 0) {
        setSelectedSuggestionIndex(prev =>
          prev < tagSuggestions.length - 1 ? prev + 1 : 0
        )
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (tagSuggestions.length > 0) {
        setSelectedSuggestionIndex(prev =>
          prev > 0 ? prev - 1 : tagSuggestions.length - 1
        )
      }
    } else if (e.key === 'Escape') {
      setShowTagSuggestions(false)
      setSelectedSuggestionIndex(-1)
    }
  }

  const addTagFromInput = tagToAdd => {
    let updatedTags = note?.tags || []
    updatedTags = addTag(tagToAdd, updatedTags)
    onTagsChange(updatedTags)

    // Clear input and hide suggestions
    setTagInput('')
    setShowTagSuggestions(false)
    setSelectedSuggestionIndex(-1)
  }

  const handleTagInputChange = e => {
    const value = e.target.value
    setTagInput(value)

    if (value.trim()) {
      setShowTagSuggestions(true)
      setSelectedSuggestionIndex(-1)
    } else {
      setShowTagSuggestions(false)
      setSelectedSuggestionIndex(-1)
    }
  }

  // Handle tag right-click context menu
  const handleTagRightClick = (e, tag, index) => {
    e.preventDefault()
    setContextMenu({
      show: true,
      x: e.clientX,
      y: e.clientY,
      tag,
      index,
    })
  }

  // Close dropdowns and context menu when clicking elsewhere
  useEffect(() => {
    const handleClickOutside = event => {
      // Close context menu
      if (contextMenu.show) {
        closeContextMenu()
      }

      // Status dropdown is now handled automatically by Radix UI

      // Close tag suggestions if clicking outside the tag input area
      if (!event.target.closest('.relative.flex-1.min-w-24')) {
        setShowTagSuggestions(false)
        setSelectedSuggestionIndex(-1)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [contextMenu.show])

  // Context menu handlers
  const handleContextRemove = () => {
    if (contextMenu.index !== null) {
      const updatedTags = removeTag(contextMenu.index, note?.tags || [])
      onTagsChange(updatedTags)
      closeContextMenu()
    }
  }

  const handleTagSettings = () => {
    setTagSettingsModal({
      show: true,
      tagName: contextMenu.tag || '',
      tagIndex: contextMenu.index,
    })
    closeContextMenu()
  }

  const handleTagNameChange = (oldName: string, newName: string) => {
    logger.info('[Tag Change] Updating tag', {
      oldName,
      newName,
      tagIndex: tagSettingsModal.tagIndex,
    })

    // Use the saved tagIndex from the modal state
    if (tagSettingsModal.tagIndex !== null) {
      const currentTags = note?.tags || []
      const updatedTags = updateTag(
        newName,
        tagSettingsModal.tagIndex,
        currentTags
      )

      logger.debug('[Tag Change] Tag arrays', { currentTags, updatedTags })

      // Only update if the validation passed (updateTag returns a new array)
      if (updatedTags !== currentTags) {
        onTagsChange(updatedTags)
        logger.info('[Tag Change] Tags updated successfully')
      } else {
        logger.warn(
          '[Tag Change] No change in tags (validation may have failed)'
        )
      }
    } else {
      logger.error('[Tag Change] Warning: tagIndex is null')
    }
  }

  // Use centralized date utility with relative formatting
  const formatDate = (dateString: string) =>
    utilFormatDate(dateString, { relative: true })

  return (
    <div className="border-b border-theme-border-primary bg-theme-bg-primary">
      {/* Preview Mode Header - Shows dates and basic info */}
      {isPreviewMode && <PreviewHeader note={note} formatDate={formatDate} />}

      {/* Edit Mode - Full metadata controls */}
      {!isPreviewMode && (
        <div className="px-3 py-2">
          {/* Title - More prominent and accessible */}
          <TitleEditor
            title={localTitle}
            onTitleChange={onTitleChange}
            onLocalTitleChange={setLocalTitle}
          />

          {/* Metadata Controls - Ultra compact single-row layout */}
          <div className="flex items-center gap-2 px-2 py-1.5 bg-theme-bg-secondary/20 rounded-lg">
            {/* Notebook selector - minimal */}
            <NotebookSelector
              notebook={note?.notebook}
              notebooks={notebookOptions}
              onNotebookChange={handleNotebookSelect}
            />

            {/* Status selector - minimal */}
            <StatusSelector
              status={note?.status}
              onStatusChange={onStatusChange}
              statusOptions={statusOptions}
            />

            {/* Tags section - compact inline */}
            <TagsInput
              tags={note?.tags}
              tagInput={tagInput}
              showTagSuggestions={showTagSuggestions}
              selectedSuggestionIndex={selectedSuggestionIndex}
              tagSuggestions={tagSuggestions}
              isEditing={isEditing}
              editValue={editValue}
              editInputRef={editInputRef}
              onTagInputChange={handleTagInputChange}
              onTagsInput={handleTagsInput}
              onTagRightClick={handleTagRightClick}
              onEditValueChange={e => setEditValue(e.target.value)}
              onEditKeyDown={handleEditKeyDown}
              onEditSave={handleSaveEdit}
              onAddTagFromInput={addTagFromInput}
              formatDate={formatDate}
              updatedAt={note?.updatedAt}
            />
          </div>
        </div>
      )}

      {/* Tag Context Menu */}
      <TagContextMenu
        isVisible={contextMenu.show}
        position={{ x: contextMenu.x, y: contextMenu.y }}
        tagName={contextMenu.tag || ''}
        onRemove={handleContextRemove}
        onClose={closeContextMenu}
        onTagSettings={handleTagSettings}
      />

      {/* Tag Settings Modal */}
      <TagSettingsModal
        isOpen={tagSettingsModal.show}
        onClose={() =>
          setTagSettingsModal({ show: false, tagName: '', tagIndex: null })
        }
        tagName={tagSettingsModal.tagName}
        onTagNameChange={handleTagNameChange}
      />

      {/* Notebook Selection Modal removed - now using inline Select */}
    </div>
  )
}

export default NoteMetadata
