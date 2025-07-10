// Simplified NotesList component
import React, { memo } from 'react'
import { Note } from '../../types'
import { useNotesListLogic } from '../../hooks/useNotesListLogic'

interface NotesListSimpleProps {
  notes: Note[]
  onOpenNote: (noteId: string) => void
  onNewNote: () => void
  selectedNoteId: string | null
  onDeleteNote: (note: Note) => void
}

const NotesListSimple: React.FC<NotesListSimpleProps> = memo(({
  notes,
  onOpenNote,
  onNewNote,
  selectedNoteId,
  onDeleteNote
}) => {
  const { isEmpty, notesCount, formatDate, getPreviewText } = useNotesListLogic(notes)

  if (isEmpty) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="text-theme-text-muted mb-4">
          <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium text-theme-text-secondary mb-2">No notes yet</h3>
          <p className="text-sm text-theme-text-muted mb-4">Create your first note to get started</p>
          <button
            onClick={onNewNote}
            className="px-4 py-2 bg-theme-accent-primary text-white rounded-lg hover:bg-theme-accent-primary/90 transition-colors"
          >
            Create Note
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-theme-border-primary">
        <h2 className="text-lg font-semibold text-theme-text-primary">
          Notes ({notesCount})
        </h2>
        <button
          onClick={onNewNote}
          className="px-3 py-1.5 bg-theme-accent-primary text-white text-sm rounded-md hover:bg-theme-accent-primary/90 transition-colors"
          title="Create new note"
        >
          + New
        </button>
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto">
        {notes.map((note) => (
          <div
            key={note.id}
            className={`group relative border-b border-theme-border-primary hover:bg-theme-bg-tertiary transition-colors cursor-pointer ${
              selectedNoteId === note.id ? 'bg-theme-bg-tertiary' : ''
            }`}
            onClick={() => onOpenNote(note.id)}
          >
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-theme-text-primary truncate flex-1 mr-2">
                  {note.title}
                </h3>
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {note.isPinned && (
                    <svg className="w-4 h-4 text-theme-accent-yellow" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteNote(note)
                    }}
                    className="p-1 rounded hover:bg-theme-bg-secondary transition-colors"
                    title="Delete note"
                  >
                    <svg className="w-4 h-4 text-theme-text-muted hover:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <p className="text-sm text-theme-text-muted line-clamp-2 mb-2">
                {getPreviewText(note.content)}
              </p>
              
              <div className="flex items-center justify-between text-xs text-theme-text-muted">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 bg-theme-bg-secondary rounded-full">
                    {note.notebook}
                  </span>
                  {note.tags.length > 0 && (
                    <span className="text-theme-accent-primary">
                      #{note.tags[0]}
                    </span>
                  )}
                </div>
                <span>{formatDate(note.updatedAt)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
})

NotesListSimple.displayName = 'NotesListSimple'

export default NotesListSimple