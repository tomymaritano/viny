import { useState, useEffect, useMemo } from 'react'
import PropTypes from 'prop-types'
import Icons from '../../Icons'
import TagContextMenu from '../../ui/TagContextMenu'
import TagEditInput from '../../ui/TagEditInput'
import DropdownMenu, { DropdownMenuItem } from '../../ui/DropdownMenu'
import CustomTag from '../../ui/CustomTag'
import TagSettingsModal from '../tags/TagSettingsModal'
import BaseModal from '../../ui/BaseModal'
import { useSimpleStore } from '../../../stores/simpleStore'
import { useNotebooks } from '../../../hooks/useNotebooks'
import { useTagEdit } from '../../../hooks/useTagEdit'
import { addTag, removeTag, updateTag } from '../../../utils/tagValidation'
import { THEME_COLORS } from '../../../constants/theme'

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
  const { setTagColor, setModal, notes } = useSimpleStore()
  const { flatNotebooks } = useNotebooks()
  
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
    console.log('[Tag Change] Old:', oldName, 'New:', newName, 'Index:', tagSettingsModal.tagIndex)
    
    // Use the saved tagIndex from the modal state
    if (tagSettingsModal.tagIndex !== null) {
      const currentTags = note?.tags || []
      const updatedTags = updateTag(newName, tagSettingsModal.tagIndex, currentTags)
      
      console.log('[Tag Change] Current tags:', currentTags, 'Updated tags:', updatedTags)
      
      // Only update if the validation passed (updateTag returns a new array)
      if (updatedTags !== currentTags) {
        onTagsChange(updatedTags)
        console.log('[Tag Change] Tags updated successfully')
      } else {
        console.log('[Tag Change] No change in tags (validation may have failed)')
      }
    } else {
      console.log('[Tag Change] Warning: tagIndex is null')
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return 'Today'
    if (diffDays === 2) return 'Yesterday'
    if (diffDays <= 7) return `${diffDays} days ago`

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    })
  }

  const formatDatetime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }) + ' ' + date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  }

  return (
    <div
      className="border-b border-theme-border-primary"
      style={{ backgroundColor: '#171617' }}
    >
      {/* Preview Mode Header - Shows dates and basic info */}
      {isPreviewMode && (
        <div className="px-4 py-3 bg-theme-bg-secondary/30">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center space-x-4 flex-wrap gap-2">
              {/* Creation Date */}
              {note?.createdAt && (
                <div className="flex items-center space-x-2 text-sm text-theme-text-primary">
                  <Icons.Plus size={14} className="text-theme-accent-green" />
                  <span className="font-medium text-theme-text-secondary">
                    Created:
                  </span>
                  <span className="text-theme-text-primary">
                    {formatDate(note.createdAt)}
                  </span>
                </div>
              )}

              {/* Update Date - Always show if it exists */}
              {note?.updatedAt && (
                <div className="flex items-center space-x-2 text-sm text-theme-text-primary">
                  <Icons.Clock size={14} className="text-theme-accent-cyan" />
                  <span className="font-medium text-theme-text-secondary">
                    Updated:
                  </span>
                  <span className="text-theme-text-primary">
                    {formatDate(note.updatedAt)}
                  </span>
                </div>
              )}
            </div>

            {/* Notebook info in preview */}
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-theme-bg-tertiary/50 rounded-full text-sm text-theme-text-secondary">
              <Icons.FolderOpen
                size={14}
                className="text-theme-accent-orange"
              />
              <span className="font-medium">
                {note?.notebook?.name || note?.notebook || 'No notebook'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Edit Mode - Full metadata controls */}
      {!isPreviewMode && (
        <div className="px-3 py-2">
          {/* Title - More prominent and accessible */}
          <div className="mb-3">
            <input
              type="text"
              value={localTitle}
              onChange={e => {
                const newTitle = e.target.value
                setLocalTitle(newTitle)
                onTitleChange(e)
              }}
              onBlur={e => onTitleChange(e)}
              placeholder="Note title..."
              className="w-full text-lg font-semibold bg-transparent text-theme-text-primary border-none outline-none placeholder-theme-text-muted py-2 px-1 hover:bg-theme-bg-secondary/20 focus:bg-theme-bg-secondary/30 rounded transition-colors"
            />
          </div>

          {/* Metadata Controls - Ultra compact single-row layout */}
          <div className="flex items-center gap-2 px-2 py-1.5 bg-theme-bg-secondary/20 rounded-lg">
            {/* Notebook selector - minimal */}
            <div className="relative">
              <button
                onClick={() => setShowNotebookModal(true)}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-theme-bg-tertiary/50 text-theme-text-secondary rounded hover:bg-theme-bg-tertiary transition-colors border-none"
                title={`Notebook: ${note?.notebook?.name || note?.notebook || 'None'}`}
              >
                <Icons.Book size={10} className="text-theme-accent-primary" />
                <span className="max-w-16 truncate font-medium">
                  {note?.notebook?.name || note?.notebook || 'None'}
                </span>
                <Icons.ChevronDown size={12} />
              </button>
            </div>

            {/* Status selector - minimal */}
            <div className="relative dropdown-container">
              <button
                onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-theme-bg-tertiary/50 text-theme-text-secondary rounded hover:bg-theme-bg-tertiary transition-colors border-none"
                title={`Status: ${statusOptions.find(s => s.value === note?.status)?.label || 'None'}`}
              >
                {(() => {
                  const currentStatus = statusOptions.find(s => s.value === note?.status)
                  return (
                    <>
                      <div className={`w-1.5 h-1.5 rounded-full ${currentStatus?.color || 'bg-gray-400'}`} />
                      <span className="max-w-12 truncate font-medium">
                        {currentStatus?.label || 'Status'}
                      </span>
                      <Icons.ChevronDown size={12} className={`transition-transform ${showStatusDropdown ? 'rotate-180' : ''}`} />
                    </>
                  )
                })()}
              </button>
              
              <DropdownMenu isOpen={showStatusDropdown} width="w-36">
                {statusOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => {
                      onStatusChange({ target: { value: option.value } })
                      setShowStatusDropdown(false)
                    }}
                    icon={<div className={`w-1.5 h-1.5 rounded-full ${option.color}`} />}
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenu>
            </div>

            {/* Tags section - compact inline */}
            <div className="flex items-center gap-1 flex-1 min-w-0">
              <Icons.Tag size={10} className="text-theme-accent-secondary flex-shrink-0" />
              
              {/* Existing tags - smaller */}
              {note?.tags && note.tags.length > 0 && note.tags.slice(0, 3).map((tag: string, index: number) => (
                <div key={`${tag}-${index}`} className="relative">
                  {isEditing(index) ? (
                    <div className={`inline-flex items-center px-1.5 py-0.5 text-xs rounded border ${THEME_COLORS.RING_FOCUS}`}>
                      <TagEditInput
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={handleEditKeyDown}
                        onBlur={handleSaveEdit}
                        inputRef={editInputRef}
                        className="min-w-[30px] max-w-[60px] text-xs"
                      />
                    </div>
                  ) : (
                    <div
                      onContextMenu={e => handleTagRightClick(e, tag, index)}
                      title="Right-click for options, double-click to edit"
                    >
                      <CustomTag
                        tagName={tag}
                        size="xs"
                        onClick={() => {
                          // Single click - could add functionality here if needed
                        }}
                        className="cursor-pointer hover:scale-105 transition-transform text-xs"
                      />
                    </div>
                  )}
                </div>
              ))}
              
              {/* Show "+N more" if there are more than 3 tags */}
              {note?.tags && note.tags.length > 3 && (
                <span className="text-xs text-theme-text-muted px-1 py-0.5 bg-theme-bg-tertiary/30 rounded">
                  +{note.tags.length - 3}
                </span>
              )}
              
              {/* Tag input - minimal */}
              <div className="relative flex-1 min-w-16">
                <input
                  type="text"
                  value={tagInput}
                  onChange={handleTagInputChange}
                  placeholder="Add tag..."
                  onKeyDown={handleTagsInput}
                  className="w-full bg-transparent text-xs text-theme-text-secondary border-none outline-none placeholder-theme-text-muted/50"
                />
                
                {/* Tag suggestions dropdown */}
                {showTagSuggestions && tagSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 z-50 mt-1 bg-theme-bg-secondary border border-theme-border-primary rounded-md shadow-lg py-1 min-w-40 max-h-28 overflow-y-auto">
                    {tagSuggestions.map((suggestion: string, index: number) => (
                      <button
                        key={suggestion}
                        onClick={() => addTagFromInput(suggestion)}
                        className={`w-full text-left px-2 py-1 text-xs transition-colors ${
                          index === selectedSuggestionIndex
                            ? 'bg-theme-accent-primary/10 text-theme-accent-primary'
                            : 'text-theme-text-secondary hover:bg-theme-bg-tertiary hover:text-theme-text-primary'
                        }`}
                      >
                        #{suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Date info - ultra compact */}
            <div className="flex items-center gap-2 text-xs text-theme-text-muted flex-shrink-0">
              {note?.updatedAt && (
                <div className="flex items-center gap-1" title={`Updated: ${formatDate(note.updatedAt)}`}>
                  <Icons.Clock size={9} className="text-theme-accent-cyan" />
                  <span className="hidden sm:inline">{formatDate(note.updatedAt)}</span>
                </div>
              )}
            </div>
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

NoteMetadata.propTypes = {
  note: PropTypes.shape({
    title: PropTypes.string,
    notebook: PropTypes.string,
    status: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string),
    createdAt: PropTypes.string,
    updatedAt: PropTypes.string,
  }),
  onTitleChange: PropTypes.func.isRequired,
  onNotebookChange: PropTypes.func.isRequired,
  onStatusChange: PropTypes.func.isRequired,
  onTagsChange: PropTypes.func.isRequired,
  isPreviewMode: PropTypes.bool,
}

export default NoteMetadata
