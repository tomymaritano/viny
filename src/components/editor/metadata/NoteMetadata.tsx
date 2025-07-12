import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import Icons from '../../Icons'
import TagContextMenu from '../../ui/TagContextMenu'
import TagEditInput from '../../ui/TagEditInput'
import DropdownMenu, { DropdownMenuItem } from '../../ui/DropdownMenu'
import CustomTag from '../../ui/CustomTag'
import TagSettingsModal from '../tags/TagSettingsModal'
import { useSimpleStore } from '../../../stores/simpleStore'
import { useNotebooks } from '../../../hooks/useNotebooks'
import { useTagEdit } from '../../../hooks/useTagEdit'
import { addTag, removeTag } from '../../../utils/tagValidation'
import { THEME_COLORS } from '../../../constants/theme'

const NoteMetadata = ({
  note,
  onTitleChange,
  onNotebookChange,
  onStatusChange,
  onTagsChange,
  isPreviewMode = false,
}) => {
  const [showNotebookDropdown, setShowNotebookDropdown] = useState(false)
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
  const [localTitle, setLocalTitle] = useState(note?.title || '')
  const [contextMenu, setContextMenu] = useState({
    show: false,
    x: 0,
    y: 0,
    tag: null,
    index: null,
  })
  const [tagSettingsModal, setTagSettingsModal] = useState({ show: false, tagName: '' })
  const { setTagColor, setModal } = useSimpleStore()
  const { flatNotebooks } = useNotebooks()

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

  const statusOptions = [
    { value: 'draft', label: 'Draft', color: 'bg-gray-400', icon: 'FileText' },
    { value: 'in-progress', label: 'In Progress', color: 'bg-blue-400', icon: 'Clock' },
    { value: 'review', label: 'Review', color: 'bg-yellow-400', icon: 'Eye' },
    { value: 'completed', label: 'Completed', color: 'bg-green-400', icon: 'CheckCircle' },
    { value: 'archived', label: 'Archived', color: 'bg-red-400', icon: 'Archive' },
  ]

  // Prepare notebook options for dropdown using data from store
  const notebookOptions = flatNotebooks.map(notebook => ({
    value: notebook.name, // Use name for compatibility
    label: notebook.name.charAt(0).toUpperCase() + notebook.name.slice(1),
    icon: 'Book'
  }))

  const handleTagsInput = e => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const newTags = e.target.value
        .split(/[,\n]/)
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)

      let updatedTags = note?.tags || []
      newTags.forEach(tag => {
        updatedTags = addTag(tag, updatedTags)
      })

      onTagsChange(updatedTags)
      e.target.value = ''
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
        setShowNotebookDropdown(false)
        setShowStatusDropdown(false)
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
    setTagSettingsModal({ show: true, tagName: contextMenu.tag })
    closeContextMenu()
  }

  const handleTagNameChange = (oldName, newName) => {
    if (oldName !== newName && contextMenu.index !== null) {
      const updatedTags = [...(note?.tags || [])]
      updatedTags[contextMenu.index] = newName
      onTagsChange(updatedTags)
    }
  }

  const formatDate = dateString => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
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

  const formatDatetime = dateString => {
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

          {/* Metadata Controls - Improved compact layout */}
          <div className="space-y-2">
            {/* First row: Notebook and Status - consistent height and spacing */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {/* Notebook selector */}
                <div className="relative dropdown-container">
                  <button
                    onClick={() => setShowNotebookDropdown(!showNotebookDropdown)}
                    className="flex items-center space-x-2 px-3 py-2 text-xs bg-theme-bg-secondary/30 text-theme-text-secondary rounded-lg hover:bg-theme-bg-secondary/50 transition-colors border border-theme-border-primary/30"
                  >
                    <Icons.Book size={12} className="text-theme-accent-primary" />
                    <span className="max-w-24 truncate font-medium">
                      {note?.notebook?.name || note?.notebook || 'Select notebook'}
                    </span>
                    <Icons.ChevronDown size={10} className={`transition-transform ${showNotebookDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  
                  <DropdownMenu
                    isOpen={showNotebookDropdown}
                    width="w-48"
                  >
                    {notebookOptions.map((option) => (
                      <DropdownMenuItem
                        key={option.value}
                        onClick={() => {
                          onNotebookChange({ target: { value: option.value } })
                          setShowNotebookDropdown(false)
                        }}
                        icon={<Icons.Book size={12} />}
                      >
                        {option.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenu>
                </div>

                {/* Status selector */}
                <div className="relative dropdown-container">
                  <button
                    onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                    className="flex items-center space-x-2 px-3 py-2 text-xs bg-theme-bg-secondary/30 text-theme-text-secondary rounded-lg hover:bg-theme-bg-secondary/50 transition-colors border border-theme-border-primary/30"
                  >
                    {(() => {
                      const currentStatus = statusOptions.find(s => s.value === note?.status)
                      return (
                        <>
                          <div className={`w-2 h-2 rounded-full ${currentStatus?.color || 'bg-gray-400'}`} />
                          <span className="font-medium">
                            {currentStatus?.label || 'Set status'}
                          </span>
                          <Icons.ChevronDown size={10} className={`transition-transform ${showStatusDropdown ? 'rotate-180' : ''}`} />
                        </>
                      )
                    })()}
                  </button>
                  
                  <DropdownMenu
                    isOpen={showStatusDropdown}
                    width="w-40"
                  >
                    {statusOptions.map((option) => (
                      <DropdownMenuItem
                        key={option.value}
                        onClick={() => {
                          onStatusChange({ target: { value: option.value } })
                          setShowStatusDropdown(false)
                        }}
                        icon={<div className={`w-2 h-2 rounded-full ${option.color}`} />}
                      >
                        {option.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenu>
                </div>
              </div>

              {/* Date Information - Compact on right */}
              <div className="flex items-center space-x-3 text-xs text-theme-text-muted">
                {note?.createdAt && (
                  <div className="flex items-center space-x-1">
                    <Icons.Plus size={11} className="text-theme-accent-green" />
                    <span>{formatDate(note.createdAt)}</span>
                  </div>
                )}
                {note?.updatedAt && (
                  <div className="flex items-center space-x-1">
                    <Icons.Clock size={11} className="text-theme-accent-cyan" />
                    <span>{formatDate(note.updatedAt)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Second row: Tags - full width for better tag management */}
            <div className="flex items-center space-x-2 px-3 py-2 bg-theme-bg-secondary/20 rounded-lg border border-theme-border-primary/20 hover:bg-theme-bg-secondary/30 transition-colors">
              <Icons.Tag size={12} className="text-theme-accent-secondary flex-shrink-0" />
              
              {/* Existing tags */}
              <div className="flex items-center flex-wrap gap-1 flex-1">
                {note?.tags && note.tags.length > 0 && note.tags.map((tag, index) => (
                  <div key={`${tag}-${index}`} className="relative">
                    {isEditing(index) ? (
                      <div className={`inline-flex items-center px-2 py-1 text-xs rounded-lg border flex-shrink-0 transition-opacity ${THEME_COLORS.RING_FOCUS}`}>
                        <TagEditInput
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={handleEditKeyDown}
                          onBlur={handleSaveEdit}
                          inputRef={editInputRef}
                          className="min-w-[40px] max-w-[100px]"
                        />
                      </div>
                    ) : (
                      <div
                        onContextMenu={e => handleTagRightClick(e, tag, index)}
                        title="Right-click for options, double-click to edit"
                      >
                        <CustomTag
                          tagName={tag}
                          size="sm"
                          onClick={(e) => {
                            if (e && e.detail === 2) { // Double click to edit
                              handleEditTag(index, tag)
                            }
                          }}
                          className="cursor-pointer hover:scale-105 transition-transform"
                        />
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Tag input */}
                <input
                  type="text"
                  placeholder={note?.tags?.length > 0 ? "Add more tags..." : "Add tags..."}
                  onKeyDown={handleTagsInput}
                  className="flex-1 min-w-24 bg-transparent text-xs text-theme-text-secondary border-none outline-none placeholder-theme-text-muted/60"
                />
              </div>
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
        onClose={() => setTagSettingsModal({ show: false, tagName: '' })}
        tagName={tagSettingsModal.tagName}
        onTagNameChange={handleTagNameChange}
      />
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
