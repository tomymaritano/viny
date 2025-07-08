import { useState, useMemo } from 'react'
import Icons from './Icons'

const NotesList = ({
  notes = [],
  onOpenNote,
  onNewNote,
  selectedNoteId,
  isTrashView = false,
  onRestoreNote,
  onPermanentDelete,
  onDeleteNote,
}) => {
  const [searchTerm, setSearchTerm] = useState('')

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
    <div className="w-full bg-solarized-base02 border-r border-solarized-base01 flex flex-col h-full font-sans">
      {/* Header */}
      <div className="p-4 border-b border-solarized-base01">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-solarized-base5">
            {isTrashView ? 'Trash' : 'All Notes'}
          </h2>
        </div>

        {/* Search */}
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search notes..."
              className="w-full px-3 py-2 pr-8 bg-solarized-base01 border border-solarized-base00 rounded text-sm text-solarized-base2 placeholder-solarized-base0 focus:outline-none focus:border-solarized-blue focus:bg-solarized-base02"
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-solarized-base0 hover:text-solarized-base3 transition-colors border-0 bg-transparent hover:bg-transparent p-1"
                title="Clear search"
              >
                <Icons.X size={14} />
              </button>
            )}
          </div>
          {!isTrashView && (
            <button
              onClick={onNewNote}
              className="p-2 bg-solarized-blue text-solarized-base5 rounded hover:bg-solarized-green-hover transition-colors"
              title="New Note"
            >
              <Icons.Plus size={16} />
            </button>
          )}
        </div>

        {/* Search Results Info */}
        {searchTerm && (
          <div className="mt-2 text-xs text-solarized-base0">
            {filteredNotes.length} of {notes.length} notes
            {filteredNotes.length === 0 && searchTerm && (
              <span className="text-solarized-orange"> - No matches found</span>
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
              className={`p-3 rounded transition-colors group ${
                isTrashView ? 'cursor-default' : 'cursor-pointer'
              } ${
                selectedNoteId === note.id
                  ? 'bg-solarized-blue text-solarized-base5'
                  : 'hover:bg-solarized-base01'
              }`}
            >
              {/* Note Header */}
              <div className="flex items-start justify-between mb-1">
                <h3
                  className={`font-medium text-sm line-clamp-1 ${
                    selectedNoteId === note.id
                      ? 'text-solarized-base5'
                      : 'text-solarized-base4'
                  }`}
                >
                  {note.isPinned && (
                    <span className="text-solarized-yellow mr-1">*</span>
                  )}
                  {note.title}
                </h3>
                <div className="flex items-center space-x-1">
                  <span
                    className={`text-xs ${
                      selectedNoteId === note.id
                        ? 'text-solarized-base5'
                        : 'text-solarized-base0'
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
                        className="p-1 text-solarized-base1 hover:text-solarized-red hover:bg-solarized-base01 rounded transition-colors"
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
                    ? 'text-solarized-base5'
                    : 'text-solarized-base1'
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
                        ? 'bg-solarized-base5 text-solarized-blue'
                        : 'bg-solarized-base01 text-solarized-base1'
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
                            ? 'text-solarized-base5'
                            : 'text-solarized-base1'
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
                            ? 'text-solarized-base5'
                            : 'text-solarized-blue'
                        }`}
                      >
                        #{tag}
                      </span>
                    ))}
                    {note.tags.length > 2 && (
                      <span
                        className={`text-xs ${
                          selectedNoteId === note.id
                            ? 'text-solarized-base5'
                            : 'text-solarized-base0'
                        }`}
                      >
                        +{note.tags.length - 2}
                      </span>
                    )}
                  </div>
                )}

                {isTrashView && (
                  <div className="text-xs text-solarized-base0">
                    Trashed: {new Date(note.trashedAt).toLocaleDateString()}
                  </div>
                )}
              </div>

              {/* Trash Actions */}
              {isTrashView && (
                <div className="flex items-center justify-end space-x-2 mt-3 pt-2 border-t border-solarized-base01">
                  <button
                    onClick={e => {
                      e.stopPropagation()
                      onRestoreNote?.(note)
                    }}
                    className="px-2 py-1 text-xs bg-solarized-green text-solarized-base5 rounded hover:bg-solarized-cyan transition-colors border-0"
                    title="Restore note"
                  >
                    Restore
                  </button>
                  <button
                    onClick={e => {
                      e.stopPropagation()
                      onPermanentDelete?.(note)
                    }}
                    className="px-2 py-1 text-xs bg-solarized-red text-solarized-base5 rounded hover:bg-red-600 transition-colors border-0"
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
      <div className="p-3 border-t border-solarized-base01 text-xs text-solarized-base0">
        {searchTerm
          ? `${filteredNotes.length} of ${notes.length}`
          : `${notes.length}`}{' '}
        notes
      </div>
    </div>
  )
}

export default NotesList
