import React, { useRef } from 'react'
import { NoteListItem } from './NoteListItem'
import { EmptyNotesState } from './EmptyNotesState'
import { useSmartPrefetch } from '../../hooks/queries/usePrefetch'
import type { Note } from '../../types'

interface NotesListWithPrefetchProps {
  notes: Note[]
  selectedNoteId: string | null
  onSelectNote: (noteId: string) => void
  onDeleteNote: (noteId: string) => void
  searchQuery?: string
}

/**
 * Enhanced NotesList with intelligent prefetching
 * Preloads note data on hover for instant navigation
 */
export const NotesListWithPrefetch: React.FC<NotesListWithPrefetchProps> = ({
  notes,
  selectedNoteId,
  onSelectNote,
  onDeleteNote,
  searchQuery = '',
}) => {
  const { onNoteHover } = useSmartPrefetch()
  const hoverTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map())

  // Clean up timeouts on unmount
  React.useEffect(() => {
    return () => {
      hoverTimeouts.current.forEach(timeout => clearTimeout(timeout))
    }
  }, [])

  const handleMouseEnter = (noteId: string) => {
    // Clear any existing timeout for this note
    const existingTimeout = hoverTimeouts.current.get(noteId)
    if (existingTimeout) {
      clearTimeout(existingTimeout)
    }

    // Set up prefetch with cleanup
    const cleanup = onNoteHover(noteId)
    hoverTimeouts.current.set(noteId, cleanup as any)
  }

  const handleMouseLeave = (noteId: string) => {
    // Cancel prefetch if user moves away quickly
    const timeout = hoverTimeouts.current.get(noteId)
    if (timeout) {
      clearTimeout(timeout)
      hoverTimeouts.current.delete(noteId)
    }
  }

  if (notes.length === 0) {
    return <EmptyNotesState searchQuery={searchQuery} />
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="divide-y divide-theme-border-secondary">
        {notes.map(note => (
          <div
            key={note.id}
            onMouseEnter={() => handleMouseEnter(note.id)}
            onMouseLeave={() => handleMouseLeave(note.id)}
          >
            <NoteListItem
              note={note}
              isSelected={selectedNoteId === note.id}
              onSelect={() => onSelectNote(note.id)}
              onDelete={() => onDeleteNote(note.id)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}