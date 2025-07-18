// Simplified NotesList component
import React, { memo, useState, useCallback, useMemo } from 'react'
import { Note } from '../../types'
import { useNotesListLogic } from '../../hooks/useNotesListLogic'
import { useAppStore } from '../../stores/newSimpleStore'
import NotesHeader from '../notes/NotesHeader'
import EmptyNotesState from '../notes/EmptyNotesState'
import NotesList from '../notes/NotesList'
import VirtualizedNotesList from '../notes/VirtualizedNotesList'

type SortField = 'title' | 'date' | 'updated' | 'notebook'
type SortDirection = 'asc' | 'desc'

interface NotesListSimpleProps {
  notes: Note[]
  selectedNoteId?: string
  onOpenNote: (noteId: string) => void
  onNewNote: () => void
  onTogglePin: (note: Note) => void
  onDeleteNote: (note: Note) => void
  onDuplicateNote: (note: Note) => void
  onMoveToNotebook?: (note: Note) => void
  onRestoreNote?: (note: Note) => void
  onPermanentDelete?: (note: Note) => void
  currentSection?: string
  isTrashView?: boolean
  onSortNotes?: (sortBy: string) => void
}

const NotesListSimple: React.FC<NotesListSimpleProps> = memo(({
  notes,
  selectedNoteId,
  onOpenNote,
  onNewNote,
  onTogglePin,
  onDeleteNote,
  onDuplicateNote,
  onMoveToNotebook,
  onRestoreNote,
  onPermanentDelete,
  currentSection = 'notes',
  isTrashView = false,
  onSortNotes
}) => {
  const { isEmpty } = useNotesListLogic(notes)
  const { sortBy, sortDirection, setSortBy, setSortDirection } = useAppStore()
  const [searchTerm, setSearchTerm] = useState('')

  // Memoized filter function to avoid recreating on every render
  const filteredNotes = useMemo(() => {
    if (!searchTerm.trim()) return notes
    
    const searchLower = searchTerm.toLowerCase()
    return notes.filter(note => {
      // Early return optimizations
      if (note.title.toLowerCase().includes(searchLower)) return true
      if (note.content.toLowerCase().includes(searchLower)) return true
      return note.tags.some(tag => tag.toLowerCase().includes(searchLower))
    })
  }, [notes, searchTerm])

  // Optimized sort function with cached date parsing
  const filteredAndSortedNotes = useMemo(() => {
    // Create a copy to sort
    const notesToSort = [...filteredNotes]
    
    // Pre-calculate sort values to avoid repeated calculations
    const sortValueCache = new Map()
    
    const getSortValue = (note: Note) => {
      if (sortValueCache.has(note.id)) {
        return sortValueCache.get(note.id)
      }
      
      let value: string | number
      switch (sortBy) {
        case 'title':
          value = note.title.toLowerCase()
          break
        case 'date':
          value = new Date(note.createdAt).getTime()
          break
        case 'updated':
          value = new Date(note.updatedAt).getTime()
          break
        case 'notebook':
          value = note.notebook?.toLowerCase() || ''
          break
        default:
          value = new Date(note.updatedAt).getTime()
      }
      
      sortValueCache.set(note.id, value)
      return value
    }
    
    return notesToSort.sort((a, b) => {
      const aValue = getSortValue(a)
      const bValue = getSortValue(b)
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [filteredNotes, sortBy, sortDirection])

  // Performance settings
  const VIRTUALIZATION_THRESHOLD = 100 // Use virtualization when more than 100 notes
  const shouldUseVirtualization = filteredAndSortedNotes.length > VIRTUALIZATION_THRESHOLD
  
  const notesCount = filteredAndSortedNotes.length

  const handleSort = useCallback((field: SortField, direction: SortDirection) => {
    setSortBy(field)
    setSortDirection(direction)
  }, [setSortBy, setSortDirection])

  const handleNoteClick = useCallback((noteId: string) => {
    onOpenNote(noteId)
  }, [onOpenNote])

  const getDynamicTitle = useCallback(() => {
    if (currentSection === 'all-notes') return 'All Notes'
    if (currentSection === 'recent') return 'Recent'
    if (currentSection === 'pinned') return 'Pinned'
    if (currentSection === 'trash') return 'Trash'
    if (currentSection?.startsWith('notebook-')) {
      const notebookName = currentSection.replace('notebook-', '').replace('-', ' ')
      return notebookName.charAt(0).toUpperCase() + notebookName.slice(1)
    }
    if (currentSection?.startsWith('tag-')) {
      const tagName = currentSection.replace('tag-', '')
      return `#${tagName}`
    }
    if (currentSection === 'in-progress') return 'In Progress'
    if (currentSection === 'review') return 'Review'
    if (currentSection === 'completed') return 'Completed'
    if (currentSection === 'archived') return 'Archived'
    return 'Notes'
  }, [currentSection])

  if (isEmpty) {
    return (
      <EmptyNotesState
        title={getDynamicTitle()}
        currentSection={currentSection}
        currentSortBy={sortBy}
        currentSortDirection={sortDirection}
        onSort={handleSort}
        onNewNote={onNewNote}
      />
    )
  }

  return (
    <div className="h-full flex flex-col bg-theme-bg-primary">
      {/* Header */}
      <NotesHeader
        title={getDynamicTitle()}
        notesCount={notesCount}
        currentSortBy={sortBy}
        currentSortDirection={sortDirection}
        onSort={handleSort}
        onNewNote={onNewNote}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      {/* Notes List */}
      <div className="flex-1 overflow-hidden min-h-0">
        {shouldUseVirtualization ? (
          <VirtualizedNotesList
            notes={filteredAndSortedNotes}
            selectedNote={filteredAndSortedNotes.find(n => n.id === selectedNoteId) || null}
            onNoteSelect={(note) => handleNoteClick(note.id)}
            onNoteDelete={(noteId) => {
              const note = filteredAndSortedNotes.find(n => n.id === noteId)
              if (note) onDeleteNote(note)
            }}
            onNoteDuplicate={onDuplicateNote}
            searchQuery={searchTerm}
            className="h-full"
          />
        ) : (
          <div className="h-full overflow-y-auto overflow-x-hidden custom-scrollbar">
            <NotesList
              notes={filteredAndSortedNotes}
              selectedNoteId={selectedNoteId}
              onNoteClick={handleNoteClick}
              onTogglePin={onTogglePin}
              onDeleteNote={onDeleteNote}
              onDuplicateNote={onDuplicateNote}
              onMoveToNotebook={onMoveToNotebook}
              onRestoreNote={onRestoreNote}
              onPermanentDelete={onPermanentDelete}
              isTrashView={isTrashView}
            />
          </div>
        )}
      </div>
    </div>
  )
})

NotesListSimple.displayName = 'NotesListSimple'

export default NotesListSimple