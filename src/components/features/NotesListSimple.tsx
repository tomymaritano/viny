// Simplified NotesList component with Smart Search & Debouncing
import React, { memo, useState, useCallback, useMemo } from 'react'
import type { Note } from '../../types'
import { useNotesListLogic } from '../../hooks/useNotesListLogic'
import { useAppStore } from '../../stores/newSimpleStore'
import { useSmartSearch } from '../../hooks/useSmartSearch'
import { useDebounce } from '../../hooks/useDebounce'
import { useNotebooks } from '../../hooks/useNotebooks'
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

const NotesListSimple: React.FC<NotesListSimpleProps> = memo(
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
    const {
      sortBy,
      sortDirection,
      setSortBy,
      setSortDirection,
      notebookFilter,
      focusedNotebookId,
    } = useAppStore()
    const [searchTerm, setSearchTerm] = useState('')
    const { getNotebook } = useNotebooks()

    // Debounce search input for performance (300ms delay for optimal UX)
    const debouncedSearchTerm = useDebounce(searchTerm, 300)

    // Memoize smart search options to prevent infinite re-renders
    const smartSearchOptions = useMemo(
      () => ({
        threshold: 0.3,
        keys: [
          { name: 'title', weight: 3 },
          { name: 'content', weight: 1 },
          { name: 'tags', weight: 2 },
          { name: 'notebook', weight: 1.5 },
        ],
      }),
      []
    )

    // Smart Search with Fuse.js for large datasets
    const { search, isIndexing, searchStats } = useSmartSearch(
      notes,
      smartSearchOptions
    )

    // Performance-optimized filtering: use smart search for large datasets
    const SMART_SEARCH_THRESHOLD = 200 // Use smart search when more than 200 notes
    const shouldUseSmartSearch = notes.length > SMART_SEARCH_THRESHOLD

    const filteredNotes = useMemo(() => {
      if (!debouncedSearchTerm.trim()) return notes

      if (shouldUseSmartSearch) {
        // Use smart search for large datasets
        return search(debouncedSearchTerm)
      } else {
        // Use simple search for small datasets (faster for < 200 notes)
        const searchLower = debouncedSearchTerm.toLowerCase()
        return notes.filter(note => {
          // Early return optimizations
          if (note.title.toLowerCase().includes(searchLower)) return true
          if (note.content.toLowerCase().includes(searchLower)) return true
          return note.tags.some(tag => tag.toLowerCase().includes(searchLower))
        })
      }
    }, [notes, debouncedSearchTerm, search, shouldUseSmartSearch])

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
      // If in focus mode (detail view), show the focused notebook name
      if (focusedNotebookId) {
        const focusedNotebook = getNotebook(focusedNotebookId)
        if (focusedNotebook) {
          // Just show the notebook name when in focus mode
          return (
            focusedNotebook.name.charAt(0).toUpperCase() +
            focusedNotebook.name.slice(1)
          )
        }
      }

      // If a notebook filter is active, show it in the title
      if (notebookFilter) {
        const filteredNotebook = getNotebook(notebookFilter)
        if (filteredNotebook) {
          const prefix = filteredNotebook.name + ' / '

          if (currentSection === 'all-notes') return prefix + 'All Notes'
          if (currentSection === 'pinned') return prefix + 'Pinned'
          if (currentSection === 'trash') return prefix + 'Trash'
          if (currentSection?.startsWith('status-')) {
            const status = currentSection.replace('status-', '')
            return prefix + status.charAt(0).toUpperCase() + status.slice(1)
          }
          if (currentSection?.startsWith('tag-')) {
            const tagName = currentSection.replace('tag-', '')
            return prefix + `#${tagName}`
          }

          return filteredNotebook.name
        }
      }

      // Normal titles when not focused
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
    }, [currentSection, notebookFilter, getNotebook, focusedNotebookId])

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

NotesListSimple.displayName = 'NotesListSimple'

export default NotesListSimple
