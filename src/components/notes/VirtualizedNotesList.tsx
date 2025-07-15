/**
 * Virtualized notes list for handling thousands of notes efficiently
 */
import React, { useRef, useMemo } from 'react'
import { Note } from '../../types'
import VirtualizedList, { useVirtualization } from '../ui/VirtualizedList'
import NoteListItem from '../features/notes-list/NoteListItem'

interface VirtualizedNotesListProps {
  notes: Note[]
  selectedNote: Note | null
  onNoteSelect: (note: Note) => void
  onNoteDelete: (noteId: string) => void
  onNoteDuplicate: (note: Note) => void
  searchQuery?: string
  className?: string
  itemHeight?: number
}

const VirtualizedNotesList: React.FC<VirtualizedNotesListProps> = ({
  notes,
  selectedNote,
  onNoteSelect,
  onNoteDelete,
  onNoteDuplicate,
  searchQuery = '',
  className = '',
  itemHeight = 120, // Height for each note item
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Use virtualization hook
  const { containerHeight } = useVirtualization({
    items: notes,
    containerRef,
    itemHeight,
  })

  // Memoize render function for performance
  const renderNoteItem = useMemo(() => {
    return (note: Note, index: number) => (
      <NoteListItem
        key={note.id}
        note={note}
        isSelected={selectedNote?.id === note.id}
        onSelect={() => onNoteSelect(note)}
        onDelete={() => onNoteDelete(note.id)}
        onDuplicate={() => onNoteDuplicate(note)}
        searchQuery={searchQuery}
        className="border-b border-theme-border-primary last:border-b-0"
      />
    )
  }, [selectedNote?.id, onNoteSelect, onNoteDelete, onNoteDuplicate, searchQuery])

  // Get unique ID for each note
  const getItemId = useMemo(() => {
    return (note: Note, index: number) => note.id
  }, [])

  return (
    <div ref={containerRef} className={`flex-1 ${className}`}>
      {notes.length > 0 ? (
        <VirtualizedList
          items={notes}
          itemHeight={itemHeight}
          containerHeight={containerHeight}
          renderItem={renderNoteItem}
          getItemId={getItemId}
          overscan={3}
          className="custom-scrollbar"
        />
      ) : (
        <div className="flex items-center justify-center h-full text-theme-text-muted">
          <div className="text-center">
            <p className="text-lg mb-2">No notes found</p>
            {searchQuery && (
              <p className="text-sm">Try adjusting your search query</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default VirtualizedNotesList

// Performance comparison component for testing
export const PerformanceComparison: React.FC<{
  notes: Note[]
  useVirtualization: boolean
  onToggle: () => void
}> = ({ notes, useVirtualization, onToggle }) => {
  return (
    <div className="mb-4 p-3 bg-theme-bg-secondary rounded-md border border-theme-border-primary">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm font-medium text-theme-text-primary">
            Performance Mode: {useVirtualization ? 'Virtualized' : 'Standard'}
          </span>
          <p className="text-xs text-theme-text-muted mt-1">
            {notes.length} notes • {useVirtualization ? 'Only visible items rendered' : 'All items rendered'}
          </p>
        </div>
        <button
          onClick={onToggle}
          className="px-3 py-1 text-xs bg-theme-accent-primary text-white rounded-md hover:bg-theme-accent-secondary transition-colors"
        >
          Toggle
        </button>
      </div>
    </div>
  )
}