import { useState, useEffect, useMemo } from 'react'
import { Icons } from '../../Icons'
import TagContextMenu from '../../ui/TagContextMenu'
import TagSettingsModal from '../tags/TagSettingsModal'
import BaseModal from '../../ui/BaseModal'
import { useAppStore } from '../../../stores/newSimpleStore'
import { useNotebooks } from '../../../hooks/useNotebooks'
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
  icon: string
}

const NoteMetadata = ({
  note,
  onTitleChange,
  onNotebookChange,
  onStatusChange,
  onTagsChange,
  isPreviewMode = false,
}) => {
  const [showNotebookModal, setShowNotebookModal] = useState(false)
  const [notebookSearchInput, setNotebookSearchInput] = useState('')
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
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
  const [tagSettingsModal, setTagSettingsModal] = useState({ show: false, tagName: '', tagIndex: null })
  const { setTagColor, setModal, notes } = useAppStore()
  const { getFlattenedNotebooks } = useNotebooks()
  const flatNotebooks = getFlattenedNotebooks()
  
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
      .filter(tag => 
        tag.toLowerCase().includes(query) && 
        !currentTags.includes(tag) // Don't suggest tags that are already added
      )
      .slice(0, 5) // Limit to 5 suggestions
  }, [tagInput, allTags, note?.tags])

  // Prepare notebook options for dropdown using data from store
  const notebookOptions = flatNotebooks.map(notebook => ({
    value: notebook.name, // Use name for compatibility
    label: notebook.name.charAt(0).toUpperCase() + notebook.name.slice(1),
    icon: 'Book'
  }))

  // Filter notebooks based on search input
  const filteredNotebooks = useMemo((): NotebookOption[] => {
    if (!notebookSearchInput.trim()) return notebookOptions
    
    const query = notebookSearchInput.toLowerCase()
    return notebookOptions.filter(notebook => 
      notebook.label.toLowerCase().includes(query)
    )
  }, [notebookSearchInput, notebookOptions])

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

  // Notebook modal handlers
  const handleNotebookSelect = (notebookValue) => {
    onNotebookChange({ target: { value: notebookValue } })
    setShowNotebookModal(false)
    setNotebookSearchInput('')
  }

  const handleNotebookModalClose = () => {
    setShowNotebookModal(false)
    setNotebookSearchInput('')
  }

  const statusOptions = [
    { value: 'draft', label: 'Draft', color: 'bg-gray-400', icon: 'FileText' },
    { value: 'in-progress', label: 'In Progress', color: 'bg-blue-400', icon: 'Clock' },
    { value: 'review', label: 'Review', color: 'bg-yellow-400', icon: 'Eye' },
    { value: 'completed', label: 'Completed', color: 'bg-green-400', icon: 'CheckCircle' },
    { value: 'archived', label: 'Archived', color: 'bg-red-400', icon: 'Archive' },
  ]

  const handleTagsInput = e => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      
      // If there's a selected suggestion, use it
      if (showTagSuggestions && selectedSuggestionIndex >= 0 && tagSuggestions[selectedSuggestionIndex]) {
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

  const addTagFromInput = (tagToAdd) => {
    let updatedTags = note?.tags || []
    updatedTags = addTag(tagToAdd, updatedTags)
    onTagsChange(updatedTags)
    
    // Clear input and hide suggestions
    setTagInput('')
    setShowTagSuggestions(false)
    setSelectedSuggestionIndex(-1)
  }

  const handleTagInputChange = (e) => {
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
    const handleClickOutside = (event) => {
      // Close context menu
      if (contextMenu.show) {
        closeContextMenu()
      }
      
      // Close dropdowns if clicking outside
      if (!event.target.closest('.dropdown-container')) {
        setShowStatusDropdown(false)
      }
      
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
    setTagSettingsModal({ show: true, tagName: contextMenu.tag || '', tagIndex: contextMenu.index })
    closeContextMenu()
  }

  const handleTagNameChange = (oldName: string, newName: string) => {
    logger.info('[Tag Change] Updating tag', { oldName, newName, tagIndex: tagSettingsModal.tagIndex })
    
    // Use the saved tagIndex from the modal state
    if (tagSettingsModal.tagIndex !== null) {
      const currentTags = note?.tags || []
      const updatedTags = updateTag(newName, tagSettingsModal.tagIndex, currentTags)
      
      logger.debug('[Tag Change] Tag arrays', { currentTags, updatedTags })
      
      // Only update if the validation passed (updateTag returns a new array)
      if (updatedTags !== currentTags) {
        onTagsChange(updatedTags)
        logger.info('[Tag Change] Tags updated successfully')
      } else {
        logger.warn('[Tag Change] No change in tags (validation may have failed)')
      }
    } else {
      logger.error('[Tag Change] Warning: tagIndex is null')
    }
  }

  // Use centralized date utility with relative formatting
  const formatDate = (dateString: string) => utilFormatDate(dateString, { relative: true })

  return (
    <div
      className="border-b border-theme-border-primary bg-theme-bg-primary"
    >
      {/* Preview Mode Header - Shows dates and basic info */}
      {isPreviewMode && (
        <PreviewHeader note={note} formatDate={formatDate} />
      )}

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
              onShowModal={() => setShowNotebookModal(true)}
            />

            {/* Status selector - minimal */}
            <StatusSelector
              status={note?.status}
              showDropdown={showStatusDropdown}
              onToggleDropdown={() => setShowStatusDropdown(!showStatusDropdown)}
              onStatusChange={(e) => {
                onStatusChange(e)
                setShowStatusDropdown(false)
              }}
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
              onEditValueChange={(e) => setEditValue(e.target.value)}
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
        onClose={() => setTagSettingsModal({ show: false, tagName: '', tagIndex: null })}
        tagName={tagSettingsModal.tagName}
        onTagNameChange={handleTagNameChange}
      />

      {/* Notebook Selection Modal */}
      <BaseModal
        isOpen={showNotebookModal}
        onClose={handleNotebookModalClose}
        title="Move to"
        icon={<Icons.FolderOpen size={20} />}
        maxWidth="md"
      >
        {/* Search Input */}
        <div className="p-4 border-b border-theme-border-primary">
          <div className="relative">
            <Icons.Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-text-muted" />
            <input
              type="text"
              value={notebookSearchInput}
              onChange={(e) => setNotebookSearchInput(e.target.value)}
              placeholder="Search notebooks..."
              className="w-full pl-10 pr-4 py-2 bg-theme-bg-secondary border border-theme-border-primary rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-theme-accent-primary"
              autoFocus
            />
          </div>
        </div>

        {/* Notebook List */}
        <div className="max-h-64 overflow-y-auto">
          {filteredNotebooks.length > 0 ? (
            filteredNotebooks.map((notebook: NotebookOption) => {
              // Get notebook details from flatNotebooks to access level/hierarchy info
              const notebookDetails = flatNotebooks.find(nb => nb.name === notebook.value)
              const level = notebookDetails?.level || 0
              const isSelected = note?.notebook === notebook.value
              
              return (
                <button
                  key={notebook.value}
                  onClick={() => handleNotebookSelect(notebook.value)}
                  className={`w-full px-4 py-3 text-left hover:bg-theme-bg-tertiary transition-colors flex items-center gap-3 group ${
                    isSelected ? 'bg-theme-bg-tertiary/50' : ''
                  }`}
                  style={{ paddingLeft: `${16 + (level * 24)}px` }}
                >
                  {/* Hierarchy indicator */}
                  {level > 0 && (
                    <div className="flex items-center">
                      {Array.from({ length: level }).map((_, i) => (
                        <div key={i} className="w-3 h-px bg-theme-border-primary/30 mr-1" />
                      ))}
                      <Icons.ChevronRight size={10} className="text-theme-text-muted mr-1" />
                    </div>
                  )}
                  
                  <Icons.Book 
                    size={16} 
                    className={`flex-shrink-0 ${
                      level > 0 ? 'text-theme-text-muted' : 'text-theme-accent-primary'
                    }`} 
                  />
                  
                  <span className={`text-sm font-medium ${
                    isSelected 
                      ? 'text-theme-accent-primary' 
                      : level > 0 
                        ? 'text-theme-text-secondary' 
                        : 'text-theme-text-primary'
                  }`}>
                    {notebook.label}
                  </span>
                  
                  {isSelected && (
                    <Icons.Check size={16} className="text-theme-accent-primary ml-auto flex-shrink-0" />
                  )}
                </button>
              )
            })
          ) : (
            <div className="p-4 text-center text-theme-text-muted">
              <Icons.Search size={24} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">No notebooks found</p>
            </div>
          )}
        </div>
      </BaseModal>
    </div>
  )
}

export default NoteMetadata
