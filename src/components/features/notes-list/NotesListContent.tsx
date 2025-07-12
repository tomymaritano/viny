/**
 * NotesListContent - Main content area for notes list
 * Extracted from NotesListSimple.tsx
 */

import React from 'react'
import { Note } from '../../../types'
import NoteItem from './NoteItem'
import EmptyState from './EmptyState'

interface NotesListContentProps {
  filteredNotes: Note[]
  selectedNoteId: string | null
  currentSection: string
  searchTerm: string
  onNoteClick: (noteId: string) => void
  onPinToggle: (note: Note) => void
  onDelete: (note: Note) => void
  onNewNote: () => void
  formatDate: (dateString: string) => string
  getPreviewText: (content: string) => string
  onTagClick?: (tag: string) => void
}

const NotesListContent: React.FC<NotesListContentProps> = ({
  filteredNotes,
  selectedNoteId,
  currentSection,
  searchTerm,
  onNoteClick,
  onPinToggle,
  onDelete,
  onNewNote,
  formatDate,
  getPreviewText,
  onTagClick
}) => {
  // Determine empty state type
  const getEmptyStateType = (): 'initial' | 'no-results' | 'trash' | 'search' => {
    if (searchTerm) return 'search'
    if (currentSection === 'Trash') return 'trash'
    if (filteredNotes.length === 0) return 'initial'
    return 'no-results'
  }

  // Show empty state if no notes
  if (filteredNotes.length === 0) {
    return (
      <EmptyState
        type={getEmptyStateType()}
        currentSection={currentSection}
        searchTerm={searchTerm}
        onNewNote={onNewNote}
      />
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {filteredNotes.map((note) => (
        <NoteItem
          key={note.id}
          note={note}
          isSelected={selectedNoteId === note.id}
          onNoteClick={onNoteClick}
          onPinToggle={onPinToggle}
          onDelete={onDelete}
          formatDate={formatDate}
          getPreviewText={getPreviewText}
          onTagClick={onTagClick}
        />
      ))}
    </div>
  )
}

export default NotesListContent
