import React from 'react'
import { Note } from '../../types'
import { useNotesListLogic } from '../../hooks/useNotesListLogic'
import NoteListItem from '../features/notes-list/NoteListItem'

interface NotesListProps {
  notes: Note[]
  selectedNoteId?: string
  onNoteClick: (noteId: string) => void
  onTogglePin: (note: Note) => void
  onDeleteNote: (note: Note) => void
  onDuplicateNote: (note: Note) => void
  onMoveToNotebook?: (note: Note) => void
  onRestoreNote?: (note: Note) => void
  onPermanentDelete?: (note: Note) => void
  isTrashView?: boolean
}

const NotesList: React.FC<NotesListProps> = ({
  notes,
  selectedNoteId,
  onNoteClick,
  onTogglePin,
  onDeleteNote,
  onDuplicateNote,
  onMoveToNotebook,
  onRestoreNote,
  onPermanentDelete,
  isTrashView = false
}) => {
  const { getPreviewText, formatDate } = useNotesListLogic(notes)
  if (notes.length === 0) {
    return (
      <div className="h-full flex items-center justify-center" data-testid="notes-list">
        <div className="text-theme-text-muted text-center">
          <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium text-theme-text-secondary mb-2">No notes here</h3>
          <p className="text-sm text-theme-text-muted max-w-xs">
            Your filtered or searched notes will appear here when available.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-0" data-testid="notes-list">
      {notes.map((note) => (
        <NoteListItem 
          key={note.id} 
          note={note}
          isSelected={selectedNoteId === note.id}
          onNoteClick={onNoteClick}
          onPinToggle={(e) => {
            e.stopPropagation()
            onTogglePin(note)
          }}
          onDelete={(e) => {
            e.stopPropagation()
            onDeleteNote(note)
          }}
          onDuplicate={(e) => {
            e.stopPropagation()
            onDuplicateNote(note)
          }}
          onMoveToNotebook={onMoveToNotebook ? (e) => {
            e.stopPropagation()
            onMoveToNotebook(note)
          } : undefined}
          onRestoreNote={onRestoreNote ? (e) => {
            e.stopPropagation()
            onRestoreNote(note)
          } : undefined}
          onPermanentDelete={onPermanentDelete ? (e) => {
            e.stopPropagation()
            onPermanentDelete(note)
          } : undefined}
          isTrashView={isTrashView}
          formatDate={formatDate}
          getPreviewText={getPreviewText}
        />
      ))}
    </div>
  )
}

export default NotesList