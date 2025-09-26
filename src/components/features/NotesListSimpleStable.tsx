// Simplified NotesList component - STABLE VERSION (Emergency Fallback)
import React, { memo, useState, useCallback, useMemo } from 'react'
import type { Note } from '../../types'
import { useNotesListLogic } from '../../hooks/useNotesListLogic'
import { useAppStore } from '../../stores/newSimpleStore'
import { useDebounce } from '../../hooks/useDebounce'
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

const NotesListSimpleStable: React.FC<NotesListSimpleProps> = memo(
  ({
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
    onSortNotes,
  }) => {
    const { isEmpty } = useNotesListLogic(notes)
    const { sortBy, sortDirection, setSortBy, setSortDirection } = useAppStore()
    const [searchTerm, setSearchTerm] = useState('')

    // Simple debounced search without smart search
    const debouncedSearchTerm = useDebounce(searchTerm, 300)

    // Basic filter function - stable and simple
    const filteredNotes = useMemo(() => {
      if (!debouncedSearchTerm.trim()) return notes

      const searchLower = debouncedSearchTerm.toLowerCase()
      return notes.filter(note => {
        // Simple search logic
        if (note.title.toLowerCase().includes(searchLower)) return true
        if (note.content.toLowerCase().includes(searchLower)) return true
        return note.tags.some(tag => tag.toLowerCase().includes(searchLower))
      })
    }, [notes, debouncedSearchTerm])

    // Simple sort function without complex caching
    const filteredAndSortedNotes = useMemo(() => {
      const notesToSort = [...filteredNotes]

      return notesToSort.sort((a, b) => {
        let aValue: string | number
        let bValue: string | number

        switch (sortBy) {
          case 'title':
            aValue = a.title.toLowerCase()
            bValue = b.title.toLowerCase()
            break
          case 'date':
            aValue = new Date(a.createdAt).getTime()
            bValue = new Date(b.createdAt).getTime()
            break
          case 'updated':
            aValue = new Date(a.updatedAt).getTime()
            bValue = new Date(b.updatedAt).getTime()
            break
          case 'notebook':
            aValue = a.notebook?.toLowerCase() || ''
            bValue = b.notebook?.toLowerCase() || ''
            break
          default:
            aValue = new Date(a.updatedAt).getTime()
            bValue = new Date(b.updatedAt).getTime()
        }

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
        return 0
      })
    }, [filteredNotes, sortBy, sortDirection])

    // Conservative virtualization threshold
    const VIRTUALIZATION_THRESHOLD = 500 // Higher threshold for stability
    const shouldUseVirtualization =
      filteredAndSortedNotes.length > VIRTUALIZATION_THRESHOLD

    const notesCount = filteredAndSortedNotes.length

    const handleSort = useCallback(
      (field: SortField, direction: SortDirection) => {
        setSortBy(field)
        setSortDirection(direction)
      },
      [setSortBy, setSortDirection]
    )

    const handleNoteClick = useCallback(
      (noteId: string) => {
        onOpenNote(noteId)
      },
      [onOpenNote]
    )

    const getDynamicTitle = useCallback(() => {
      if (currentSection === 'all-notes') return 'All Notes'
      if (currentSection === 'recent') return 'Recent'
      if (currentSection === 'pinned') return 'Pinned'
      if (currentSection === 'trash') return 'Trash'
      if (currentSection?.startsWith('notebook-')) {
        const notebookName = currentSection
          .replace('notebook-', '')
          .replace('-', ' ')
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
              selectedNote={
                filteredAndSortedNotes.find(n => n.id === selectedNoteId) ||
                null
              }
              onNoteSelect={note => handleNoteClick(note.id)}
              onNoteDelete={noteId => {
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
  }
)

NotesListSimpleStable.displayName = 'NotesListSimpleStable'

export default NotesListSimpleStable
