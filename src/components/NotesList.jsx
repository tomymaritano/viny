import { useState, useMemo } from 'react'
import PropTypes from 'prop-types'
import Icons from './Icons'
import ContextMenu from './ContextMenu'
import { useContextMenu } from '../hooks/useContextMenu'

const NotesList = ({
  notes = [],
  onOpenNote,
  onNewNote,
  selectedNoteId,
  isTrashView = false,
  onRestoreNote,
  onPermanentDelete,
  onDeleteNote,
  activeSection = 'all-notes',
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const { contextMenu, showContextMenu, hideContextMenu } = useContextMenu()

  // Get section title based on activeSection
  const getSectionTitle = () => {
    if (isTrashView) return 'Trash'

    switch (activeSection) {
      case 'all-notes':
        return 'All Notes'
      case 'pinned':
        return 'Pinned Notes'
      case 'recent':
        return 'Recent Notes'
      case 'status-active':
        return 'Active Notes'
      case 'status-on-hold':
        return 'On Hold Notes'
      case 'status-completed':
        return 'Completed Notes'
      case 'status-dropped':
        return 'Dropped Notes'
      default:
        if (activeSection.startsWith('notebook-')) {
          return activeSection.replace('notebook-', '').replace('-', ' ')
        }
        if (activeSection.startsWith('tag-')) {
          return `#${activeSection.replace('tag-', '')}`
        }
        return 'All Notes'
    }
  }

  // Filter and search notes
  const filteredNotes = useMemo(() => {
    if (!searchTerm.trim()) return notes

    const search = searchTerm.toLowerCase()
    return notes.filter(note => {
      // Search in title
      if (note.title?.toLowerCase().includes(search)) return true

      // Search in content
      if (note.content?.toLowerCase().includes(search)) return true

      // Search in notebook
      if (note.notebook?.toLowerCase().includes(search)) return true

      // Search in tags
      if (note.tags?.some(tag => tag.toLowerCase().includes(search)))
        return true

      return false
    })
  }, [notes, searchTerm])

  const clearSearch = () => {
    setSearchTerm('')
  }

  return (
    <div className="w-full theme-bg-secondary border-r border-theme-border-primary flex flex-col h-full ui-font">
      {/* Header */}
      <div className="p-4 border-b border-theme-border-primary">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-theme-text-primary">
            {getSectionTitle()}
          </h2>
          {!isTrashView && (
            <button
              onClick={onNewNote}
              className="w-8 h-8 bg-theme-accent-primary text-theme-text-primary rounded-full flex items-center justify-center hover:bg-theme-accent-green transition-colors"
              title="New Note"
            >
              <Icons.Plus size={16} />
            </button>
          )}
        </div>

        {/* Search */}
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-text-muted">
              <Icons.Search size={14} />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search notes..."
              className="w-full pl-9 pr-8 py-1.5 theme-bg-tertiary border border-theme-border-secondary rounded text-sm text-theme-text-secondary placeholder-theme-text-muted focus:outline-none focus:border-theme-accent-primary focus:theme-bg-secondary"
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-theme-text-muted hover:text-theme-text-secondary transition-colors border-0 bg-transparent hover:bg-transparent p-1"
                title="Clear search"
              >
                <Icons.X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Search Results Info */}
        {searchTerm && (
          <div className="mt-2 text-xs text-theme-text-muted">
            {filteredNotes.length} of {notes.length} notes
            {filteredNotes.length === 0 && searchTerm && (
              <span className="text-theme-accent-orange">
                {' '}
                - No matches found
              </span>
            )}
          </div>
        )}
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2 space-y-1">
          {filteredNotes.map(note => (
            <div
              key={note.id}
              onClick={isTrashView ? undefined : () => onOpenNote(note.id)}
              onContextMenu={e => {
                const items = isTrashView
                  ? [
                      {
                        type: 'item',
                        label: 'Restore Note',
                        icon: <Icons.RefreshCw size={14} />,
                        onClick: () => onRestoreNote(note),
                      },
                      {
                        type: 'separator',
                      },
                      {
                        type: 'item',
                        label: 'Delete Permanently',
                        icon: <Icons.Trash size={14} />,
                        onClick: () => onPermanentDelete(note.id),
                      },
                    ]
                  : [
                      {
                        type: 'item',
                        label: 'Open Note',
                        icon: <Icons.FileEdit size={14} />,
                        onClick: () => onOpenNote(note.id),
                        shortcut: 'Enter',
                      },
                      {
                        type: 'separator',
                      },
                      {
                        type: 'item',
                        label: note.isPinned ? 'Unpin Note' : 'Pin Note',
                        icon: <Icons.Star size={14} />,
                        onClick: () => {
                          // Handle pin/unpin logic here
                          console.log('Pin/unpin note:', note.id)
                        },
                        shortcut: 'Ctrl+P',
                      },
                      {
                        type: 'item',
                        label: 'Duplicate Note',
                        icon: <Icons.Copy size={14} />,
                        onClick: () => {
                          // Handle duplicate logic here
                          console.log('Duplicate note:', note.id)
                        },
                        shortcut: 'Ctrl+D',
                      },
                      {
                        type: 'separator',
                      },
                      {
                        type: 'item',
                        label: 'Move to Trash',
                        icon: <Icons.Trash size={14} />,
                        onClick: () => onDeleteNote(note),
                        shortcut: 'Delete',
                      },
                    ]
                showContextMenu(e, items)
              }}
              className={`p-3 rounded transition-colors group ${
                isTrashView ? 'cursor-default' : 'cursor-pointer'
              } ${
                selectedNoteId === note.id
                  ? 'bg-theme-accent-primary text-theme-text-primary'
                  : 'hover:theme-bg-tertiary'
              }`}
              style={{
                backgroundColor:
                  selectedNoteId === note.id
                    ? 'var(--color-active-bg)'
                    : undefined,
                borderLeft:
                  selectedNoteId === note.id
                    ? '2px solid var(--color-active-border)'
                    : '2px solid transparent',
              }}
              onMouseEnter={e => {
                if (selectedNoteId !== note.id) {
                  e.currentTarget.style.backgroundColor =
                    'var(--color-hover-bg)'
                }
              }}
              onMouseLeave={e => {
                if (selectedNoteId !== note.id) {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }
              }}
            >
              {/* Note Header */}
              <div className="flex items-start justify-between mb-1">
                <h3
                  className={`font-medium text-sm line-clamp-1 ${
                    selectedNoteId === note.id
                      ? 'text-theme-text-primary'
                      : 'text-theme-text-primary'
                  }`}
                >
                  {note.isPinned && (
                    <span className="text-theme-accent-yellow mr-1">*</span>
                  )}
                  {note.title}
                </h3>
                <div className="flex items-center space-x-1">
                  <span
                    className={`text-xs ${
                      selectedNoteId === note.id
                        ? 'text-theme-text-primary'
                        : 'text-theme-text-muted'
                    }`}
                  >
                    {note.date}
                  </span>

                  {/* Quick Actions - Only show if not in trash view and onDeleteNote is provided */}
                  {!isTrashView && onDeleteNote && (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1 ml-2">
                      <button
                        onClick={e => {
                          e.stopPropagation()
                          onDeleteNote(note)
                        }}
                        className="p-1 text-theme-text-tertiary hover:text-theme-accent-red hover:theme-bg-tertiary rounded transition-colors"
                        title="Delete note"
                      >
                        <Icons.Trash size={12} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Preview */}
              <p
                className={`text-xs line-clamp-2 mb-2 ${
                  selectedNoteId === note.id
                    ? 'text-theme-text-primary'
                    : 'text-theme-text-tertiary'
                }`}
              >
                {note.preview}
              </p>

              {/* Meta */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      selectedNoteId === note.id
                        ? 'bg-theme-text-primary text-theme-accent-primary'
                        : 'theme-bg-tertiary text-theme-text-tertiary'
                    }`}
                  >
                    {note.notebook}
                  </span>

                  {note.status && (
                    <div className="flex items-center space-x-1">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          note.status === 'draft'
                            ? 'bg-gray-400'
                            : note.status === 'in-progress'
                              ? 'bg-yellow-400'
                              : note.status === 'review'
                                ? 'bg-blue-400'
                                : note.status === 'completed'
                                  ? 'bg-green-400'
                                  : 'bg-gray-600'
                        }`}
                      />
                      <span
                        className={`text-xs capitalize ${
                          selectedNoteId === note.id
                            ? 'text-theme-text-primary'
                            : 'text-theme-text-tertiary'
                        }`}
                      >
                        {note.status.replace('-', ' ')}
                      </span>
                    </div>
                  )}
                </div>

                {note.tags && note.tags.length > 0 && !isTrashView && (
                  <div className="flex items-center space-x-1">
                    {note.tags.slice(0, 2).map(tag => (
                      <span
                        key={tag}
                        className={`text-xs px-1 py-0.5 rounded ${
                          selectedNoteId === note.id
                            ? 'text-theme-text-primary'
                            : 'text-theme-accent-primary'
                        }`}
                      >
                        #{tag}
                      </span>
                    ))}
                    {note.tags.length > 2 && (
                      <span
                        className={`text-xs ${
                          selectedNoteId === note.id
                            ? 'text-theme-text-primary'
                            : 'text-theme-text-muted'
                        }`}
                      >
                        +{note.tags.length - 2}
                      </span>
                    )}
                  </div>
                )}

                {isTrashView && (
                  <div className="text-xs text-theme-text-muted">
                    Trashed: {new Date(note.trashedAt).toLocaleDateString()}
                  </div>
                )}
              </div>

              {/* Trash Actions */}
              {isTrashView && (
                <div className="flex items-center justify-end space-x-2 mt-3 pt-2 border-t border-theme-border-primary">
                  <button
                    onClick={e => {
                      e.stopPropagation()
                      onRestoreNote?.(note)
                    }}
                    className="px-2 py-1 text-xs bg-theme-accent-green text-theme-text-primary rounded hover:bg-theme-accent-cyan transition-colors border-0"
                    title="Restore note"
                  >
                    Restore
                  </button>
                  <button
                    onClick={e => {
                      e.stopPropagation()
                      onPermanentDelete?.(note)
                    }}
                    className="px-2 py-1 text-xs bg-theme-accent-red text-theme-text-primary rounded hover:bg-red-600 transition-colors border-0"
                    title="Delete permanently"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-theme-border-primary text-xs text-theme-text-muted">
        {searchTerm
          ? `${filteredNotes.length} of ${notes.length}`
          : `${notes.length}`}{' '}
        notes
      </div>

      {/* Context Menu */}
      <ContextMenu
        isVisible={contextMenu.isVisible}
        position={contextMenu.position}
        items={contextMenu.items}
        onClose={hideContextMenu}
      />
    </div>
  )
}

NotesList.propTypes = {
  notes: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string,
      content: PropTypes.string,
      preview: PropTypes.string,
      notebook: PropTypes.string,
      date: PropTypes.string,
      tags: PropTypes.arrayOf(PropTypes.string),
      isPinned: PropTypes.bool,
      status: PropTypes.string,
      trashedAt: PropTypes.string,
    })
  ),
  onOpenNote: PropTypes.func,
  onNewNote: PropTypes.func,
  selectedNoteId: PropTypes.string,
  isTrashView: PropTypes.bool,
  onRestoreNote: PropTypes.func,
  onPermanentDelete: PropTypes.func,
  onDeleteNote: PropTypes.func,
}

export default NotesList
