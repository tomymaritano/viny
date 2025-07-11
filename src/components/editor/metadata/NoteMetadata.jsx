import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import Icons from '../../Icons'
import { useSimpleStore } from '../../../stores/simpleStore'

const NoteMetadata = ({
  note,
  notebooks = [],
  onTitleChange,
  onNotebookChange,
  onStatusChange,
  onTagsChange,
  isPreviewMode = false,
}) => {
  const [showNotebookSelector, setShowNotebookSelector] = useState(false)
  const [showStatusSelector, setShowStatusSelector] = useState(false)
  const [localTitle, setLocalTitle] = useState(note?.title || '')
  const [contextMenu, setContextMenu] = useState({
    show: false,
    x: 0,
    y: 0,
    tag: null,
    index: null,
  })
  const [showColorPicker, setShowColorPicker] = useState(false)
  const { getTagColor, setTagColor } = useSimpleStore()

  // Update local title when note changes
  useEffect(() => {
    setLocalTitle(note?.title || '')
  }, [note?.id, note?.title])

  const statusOptions = [
    { value: 'draft', label: 'Draft', color: 'bg-gray-400' },
    { value: 'in-progress', label: 'In Progress', color: 'bg-blue-400' },
    { value: 'review', label: 'Review', color: 'bg-yellow-400' },
    { value: 'completed', label: 'Completed', color: 'bg-green-400' },
    { value: 'archived', label: 'Archived', color: 'bg-red-400' },
  ]

  const handleTagsInput = e => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const newTags = e.target.value
        .split(/[,\n]/)
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)

      // Combine existing tags with new tags and remove duplicates
      const combinedTags = [...(note?.tags || []), ...newTags]
      const uniqueTags = [...new Set(combinedTags)]

      onTagsChange(uniqueTags)
      e.target.value = ''
    }
  }

  // Get tag color using centralized system
  const getTagStyle = tag => {
    return getTagColor(tag)
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

  // Close context menu when clicking elsewhere
  useEffect(() => {
    const handleClickOutside = () => {
      setContextMenu({ show: false, x: 0, y: 0, tag: null, index: null })
      setShowColorPicker(false)
    }

    if (contextMenu.show) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [contextMenu.show])

  // Remove tag
  const handleRemoveTag = () => {
    if (contextMenu.index !== null) {
      const newTags = note.tags.filter((_, i) => i !== contextMenu.index)
      onTagsChange(newTags)
    }
    setContextMenu({ show: false, x: 0, y: 0, tag: null, index: null })
  }

  // Change tag color
  const handleChangeTagColor = () => {
    setShowColorPicker(true)
  }

  // Color options for tags
  const colorOptions = [
    'bg-blue-900/40 border-blue-500/50 text-blue-300',
    'bg-green-900/40 border-green-500/50 text-green-300',
    'bg-purple-900/40 border-purple-500/50 text-purple-300',
    'bg-pink-900/40 border-pink-500/50 text-pink-300',
    'bg-yellow-900/40 border-yellow-500/50 text-yellow-300',
    'bg-indigo-900/40 border-indigo-500/50 text-indigo-300',
    'bg-red-900/40 border-red-500/50 text-red-300',
    'bg-cyan-900/40 border-cyan-500/50 text-cyan-300',
    'bg-orange-900/40 border-orange-500/50 text-orange-300',
    'bg-emerald-900/40 border-emerald-500/50 text-emerald-300',
  ]

  const handleSelectColor = colorClass => {
    if (contextMenu.tag) {
      // Store the new color for this tag
      setTagColor(contextMenu.tag, colorClass)
    }
    setShowColorPicker(false)
    setContextMenu({ show: false, x: 0, y: 0, tag: null, index: null })
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

          {/* Metadata Controls - Compact inline layout */}
          <div className="flex items-center space-x-2 flex-wrap gap-1 mb-2">
            {/* Notebook selector */}
            <div className="relative">
              <button
                onClick={() => setShowNotebookSelector(!showNotebookSelector)}
                className="flex items-center space-x-1 px-2 py-1 text-xs bg-transparent text-theme-text-muted rounded hover:bg-theme-bg-secondary/50 transition-colors border border-transparent hover:border-theme-border-primary"
              >
                <Icons.FolderOpen size={10} />
                <span className="max-w-20 truncate">
                  {note?.notebook?.name || note?.notebook || 'Notebook'}
                </span>
                <Icons.ChevronDown size={10} />
              </button>

              {showNotebookSelector && (
                <div className="absolute top-full left-0 mt-1 w-48 theme-bg-secondary border border-theme-border-primary rounded shadow-lg py-1 z-20">
                  {notebooks.map((notebook, index) => {
                    const notebookName =
                      typeof notebook === 'string'
                        ? notebook
                        : notebook.name || notebook.id
                    const notebookId =
                      typeof notebook === 'string'
                        ? notebook
                        : notebook.id || notebook.name
                    return (
                      <button
                        key={notebookId || index}
                        onClick={() => {
                          onNotebookChange({ target: { value: notebookId } })
                          setShowNotebookSelector(false)
                        }}
                        className="w-full px-2 py-1 text-left text-xs text-theme-text-secondary hover:theme-bg-tertiary transition-colors"
                      >
                        {notebookName}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Status selector */}
            <div className="relative">
              <button
                onClick={() => setShowStatusSelector(!showStatusSelector)}
                className="flex items-center space-x-1 px-2 py-1 text-xs bg-transparent text-theme-text-muted rounded hover:bg-theme-bg-secondary/50 transition-colors border border-transparent hover:border-theme-border-primary"
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    statusOptions.find(s => s.value === note?.status)?.color ||
                    'bg-gray-400'
                  }`}
                />
                <span>
                  {statusOptions.find(s => s.value === note?.status)?.label ||
                    'Notes'}
                </span>
                <Icons.ChevronDown size={10} />
              </button>

              {showStatusSelector && (
                <div className="absolute top-full left-0 mt-1 w-32 theme-bg-secondary border border-theme-border-primary rounded shadow-lg py-1 z-20">
                  {statusOptions.map(status => (
                    <button
                      key={status.value}
                      onClick={() => {
                        onStatusChange({ target: { value: status.value } })
                        setShowStatusSelector(false)
                      }}
                      className="w-full px-2 py-1 text-left text-xs text-theme-text-secondary hover:theme-bg-tertiary transition-colors flex items-center space-x-1"
                    >
                      <div className={`w-2 h-2 rounded-full ${status.color}`} />
                      <span>{status.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Tags input with inline tags */}
            <div className="flex-1 min-w-48">
              <div className="flex items-center space-x-1 px-2 py-1 bg-transparent rounded hover:bg-theme-bg-secondary/50 transition-colors border border-transparent hover:border-theme-border-primary flex-wrap gap-1">
                <Icons.Tag
                  size={10}
                  className="text-theme-text-muted flex-shrink-0"
                />

                {/* Display existing tags inline - LEFT of input */}
                {note?.tags &&
                  note.tags.length > 0 &&
                  note.tags.map((tag, index) => (
                    <span
                      key={index}
                      className={`inline-flex items-center px-1.5 py-0.5 text-xs rounded-xl border ${getTagStyle(tag)} flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity`}
                      onContextMenu={e => handleTagRightClick(e, tag, index)}
                      title="Right-click for options"
                    >
                      #{tag}
                    </span>
                  ))}

                <input
                  type="text"
                  placeholder="Add tags..."
                  onKeyDown={handleTagsInput}
                  className="flex-1 min-w-16 bg-transparent text-xs text-theme-text-muted border-none outline-none placeholder-theme-text-muted"
                />
              </div>
            </div>
          </div>

          {/* No date info in edit mode - dates shown only in preview */}
        </div>
      )}

      {/* Tag Context Menu */}
      {contextMenu.show && (
        <div
          className="fixed z-50 theme-bg-secondary border border-theme-border-primary rounded shadow-lg py-1 min-w-32"
          style={{
            left: contextMenu.x,
            top: contextMenu.y,
          }}
          onClick={e => e.stopPropagation()}
        >
          <div className="px-3 py-1 text-xs text-theme-text-muted border-b border-theme-border-primary">
            #{contextMenu.tag}
          </div>

          <button
            onClick={handleChangeTagColor}
            className="w-full px-3 py-2 text-left text-xs text-theme-text-secondary hover:theme-bg-tertiary transition-colors flex items-center space-x-2"
          >
            <div className="w-2 h-2 rounded-full bg-theme-accent-primary" />
            <span>Change Color</span>
          </button>

          {/* Color Picker */}
          {showColorPicker && (
            <div className="px-2 py-2 border-t border-theme-border-primary">
              <div className="grid grid-cols-5 gap-1">
                {colorOptions.map((colorClass, index) => {
                  const colorParts = colorClass.split(' ')
                  const bgClass = colorParts[0]
                  const borderClass = colorParts[1]
                  return (
                    <button
                      key={index}
                      onClick={() => handleSelectColor(colorClass)}
                      className={`w-4 h-4 rounded border ${bgClass} ${borderClass} hover:scale-110 transition-transform`}
                      title={`Color ${index + 1}`}
                    />
                  )
                })}
              </div>
            </div>
          )}

          <div className="border-t border-theme-border-primary my-1"></div>

          <button
            onClick={handleRemoveTag}
            className="w-full px-3 py-2 text-left text-xs text-theme-accent-red hover:theme-bg-tertiary transition-colors flex items-center space-x-2"
          >
            <Icons.Trash size={10} />
            <span>Remove Tag</span>
          </button>
        </div>
      )}
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
  notebooks: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string,
      }),
    ])
  ),
  onTitleChange: PropTypes.func.isRequired,
  onNotebookChange: PropTypes.func.isRequired,
  onStatusChange: PropTypes.func.isRequired,
  onTagsChange: PropTypes.func.isRequired,
  isPreviewMode: PropTypes.bool,
}

export default NoteMetadata
