import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import Icons from '../../Icons'

const NoteMetadata = ({
  note,
  notebooks = [],
  onTitleChange,
  onNotebookChange,
  onStatusChange,
  onTagsChange,
}) => {
  const [showNotebookSelector, setShowNotebookSelector] = useState(false)
  const [showStatusSelector, setShowStatusSelector] = useState(false)
  const [localTitle, setLocalTitle] = useState(note?.title || '')

  // Update local title when note changes
  useEffect(() => {
    setLocalTitle(note?.title || '')
  }, [note?.id, note?.title])

  const statusOptions = [
    { value: 'none', label: 'Notes', color: 'bg-gray-400' },
    { value: 'active', label: 'Active', color: 'bg-blue-400' },
    { value: 'on-hold', label: 'On Hold', color: 'bg-yellow-400' },
    { value: 'completed', label: 'Completed', color: 'bg-green-400' },
    { value: 'dropped', label: 'Dropped', color: 'bg-red-400' },
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

  return (
    <div
      className="p-4 border-b border-theme-border-primary"
      style={{ backgroundColor: '#171617' }}
    >
      {/* Title */}
      <div className="mb-3">
        <input
          type="text"
          value={localTitle}
          onChange={e => {
            setLocalTitle(e.target.value)
            onTitleChange(e)
          }}
          placeholder="Note title..."
          className="w-full text-lg font-medium bg-transparent text-theme-text-primary border-none outline-none placeholder-theme-text-muted"
        />
      </div>

      {/* Metadata row */}
      <div className="flex items-center space-x-4 flex-wrap gap-2">
        {/* Notebook selector */}
        <div className="relative">
          <button
            onClick={() => setShowNotebookSelector(!showNotebookSelector)}
            className="flex items-center space-x-1 px-2 py-1 text-xs theme-bg-tertiary text-theme-text-secondary rounded hover:theme-bg-quaternary transition-colors"
          >
            <Icons.FolderOpen size={12} />
            <span>
              {note?.notebook?.name || note?.notebook || 'Select notebook'}
            </span>
            <Icons.ChevronDown size={12} />
          </button>

          {showNotebookSelector && (
            <div className="absolute top-full left-0 mt-1 theme-bg-secondary border border-theme-border-primary rounded shadow-lg py-1 w-48 z-10">
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
                    className="w-full px-3 py-1 text-left text-xs text-theme-text-secondary hover:theme-bg-tertiary transition-colors"
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
            className="flex items-center space-x-1 px-2 py-1 text-xs theme-bg-tertiary text-theme-text-secondary rounded hover:theme-bg-quaternary transition-colors"
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
            <Icons.ChevronDown size={12} />
          </button>

          {showStatusSelector && (
            <div className="absolute top-full left-0 mt-1 theme-bg-secondary border border-theme-border-primary rounded shadow-lg py-1 w-40 z-10">
              {statusOptions.map(status => (
                <button
                  key={status.value}
                  onClick={() => {
                    onStatusChange({ target: { value: status.value } })
                    setShowStatusSelector(false)
                  }}
                  className="w-full px-3 py-1 text-left text-xs text-theme-text-secondary hover:theme-bg-tertiary transition-colors flex items-center space-x-2"
                >
                  <div className={`w-2 h-2 rounded-full ${status.color}`} />
                  <span>{status.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Tags input */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-1">
            <Icons.Tag
              size={12}
              className="text-theme-text-muted flex-shrink-0"
            />
            <input
              type="text"
              placeholder="Add tags (press Enter or comma to add)..."
              onKeyDown={handleTagsInput}
              className="flex-1 min-w-0 px-2 py-1 text-xs theme-bg-tertiary text-theme-text-secondary rounded border-none outline-none placeholder-theme-text-muted"
            />
          </div>

          {/* Display existing tags */}
          {note?.tags && note.tags.length > 0 && (
            <div className="flex items-center space-x-1 mt-1 flex-wrap">
              {note.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-0.5 text-xs theme-bg-tertiary text-theme-accent-primary rounded"
                >
                  #{tag}
                  <button
                    onClick={() => {
                      const newTags = note.tags.filter((_, i) => i !== index)
                      onTagsChange(newTags)
                    }}
                    className="ml-1 text-theme-text-muted hover:text-theme-accent-red"
                  >
                    <Icons.X size={10} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Created/Updated info */}
        <div className="text-xs text-theme-text-muted">
          {note?.createdAt && (
            <span>Created {new Date(note.createdAt).toLocaleDateString()}</span>
          )}
          {note?.updatedAt && note.updatedAt !== note.createdAt && (
            <span className="ml-2">
              • Updated {new Date(note.updatedAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
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
}

export default NoteMetadata
