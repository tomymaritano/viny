// NotesListSimple with TanStack Query Integration
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
import LoadingSpinner from '../LoadingSpinner'

// Import TanStack Query hooks
import { 
  useNotesQuery, 
  useDeleteNoteMutation, 
  useTogglePinMutation,
  useSaveNoteMutation 
} from '../../hooks/queries'

type SortField = 'title' | 'date' | 'updated' | 'notebook'
type SortDirection = 'asc' | 'desc'

interface NotesListSimpleQueryProps {
  selectedNoteId?: string
  onOpenNote: (noteId: string) => void
  onNewNote: () => void
  onMoveToNotebook?: (note: Note) => void
  onRestoreNote?: (note: Note) => void
  onPermanentDelete?: (note: Note) => void
  currentSection?: string
  isTrashView?: boolean
  onSortNotes?: (sortBy: string) => void
}

const NotesListSimpleQuery: React.FC<NotesListSimpleQueryProps> = memo(
  ({
    selectedNoteId,
    onOpenNote,
    onNewNote,
    onMoveToNotebook,
    onRestoreNote,
    onPermanentDelete,
    currentSection = 'notes',
    isTrashView = false,
    onSortNotes,
  }) => {
    // Fetch notes using React Query
    const { data: allNotes = [], isLoading, error } = useNotesQuery()
    
    // Mutations
    const deleteMutation = useDeleteNoteMutation()
    const togglePinMutation = useTogglePinMutation()
    const saveMutation = useSaveNoteMutation()
    
    // Filter notes based on current section
    const notes = useMemo(() => {
      switch (currentSection) {
        case 'all-notes':
          return allNotes.filter(n => !n.isTrashed)
        case 'trash':
          return allNotes.filter(n => n.isTrashed)
        case 'pinned':
          return allNotes.filter(n => n.isPinned && !n.isTrashed)
        case 'recent':
          return allNotes
            .filter(n => !n.isTrashed)
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
            .slice(0, 20)
        default:
          if (currentSection.startsWith('notebook-')) {
            const notebookId = currentSection.replace('notebook-', '')
            return allNotes.filter(n => n.notebook === notebookId && !n.isTrashed)
          }
          if (currentSection.startsWith('tag-')) {
            const tag = currentSection.replace('tag-', '')
            return allNotes.filter(n => n.tags?.includes(tag) && !n.isTrashed)
          }
          if (currentSection.startsWith('status-')) {
            const status = currentSection.replace('status-', '')
            return allNotes.filter(n => n.status === status && !n.isTrashed)
          }
          return allNotes.filter(n => !n.isTrashed)
      }
    }, [allNotes, currentSection])
    
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

    // Debounce search input for performance
    const debouncedSearchTerm = useDebounce(searchTerm, 300)

    // Memoize smart search options
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

    // Smart Search with Fuse.js
    const { search, isIndexing, searchStats } = useSmartSearch(
      notes,
      smartSearchOptions
    )

    // Performance-optimized filtering
    const SMART_SEARCH_THRESHOLD = 200
    const shouldUseSmartSearch = notes.length > SMART_SEARCH_THRESHOLD

    const filteredNotes = useMemo(() => {
      if (!debouncedSearchTerm.trim()) return notes

      if (shouldUseSmartSearch) {
        return search(debouncedSearchTerm)
      } else {
        const searchLower = debouncedSearchTerm.toLowerCase()
        return notes.filter(note => {
          if (note.title.toLowerCase().includes(searchLower)) return true
          if (note.content.toLowerCase().includes(searchLower)) return true
          return note.tags.some(tag => tag.toLowerCase().includes(searchLower))
        })
      }
    }, [notes, debouncedSearchTerm, search, shouldUseSmartSearch])

    // Optimized sort function
    const filteredAndSortedNotes = useMemo(() => {
      const notesToSort = [...filteredNotes]
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
    const VIRTUALIZATION_THRESHOLD = 100
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

    // Mutation handlers
    const handleTogglePin = useCallback((note: Note) => {
      togglePinMutation.mutate(note)
    }, [togglePinMutation])
    
    const handleDeleteNote = useCallback((note: Note) => {
      deleteMutation.mutate(note)
    }, [deleteMutation])
    
    const handleDuplicateNote = useCallback(async (note: Note) => {
      const duplicatedNote: Note = {
        ...note,
        id: `note-${Date.now()}`,
        title: `${note.title} (Copy)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isPinned: false,
        isTrashed: false,
      }
      saveMutation.mutate(duplicatedNote)
    }, [saveMutation])

    const getDynamicTitle = useCallback(() => {
      if (focusedNotebookId) {
        const focusedNotebook = getNotebook(focusedNotebookId)
        if (focusedNotebook) {
          return (
            focusedNotebook.name.charAt(0).toUpperCase() +
            focusedNotebook.name.slice(1)
          )
        }
      }

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

    // Handle loading state
    if (isLoading) {
      return (
        <div className="h-full flex items-center justify-center bg-theme-bg-primary">
          <LoadingSpinner text="Loading notes..." />
        </div>
      )
    }

    // Handle error state
    if (error) {
      return (
        <div className="h-full flex items-center justify-center bg-theme-bg-primary">
          <div className="text-center">
            <p className="text-theme-error mb-2">Failed to load notes</p>
            <button
              onClick={() => window.location.reload()}
              className="text-sm text-theme-primary hover:underline"
            >
              Reload
            </button>
          </div>
        </div>
      )
    }

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
                if (note) handleDeleteNote(note)
              }}
              onNoteDuplicate={handleDuplicateNote}
              searchQuery={searchTerm}
              className="h-full"
            />
          ) : (
            <div className="h-full overflow-y-auto overflow-x-hidden custom-scrollbar">
              <NotesList
                notes={filteredAndSortedNotes}
                selectedNoteId={selectedNoteId}
                onNoteClick={handleNoteClick}
                onTogglePin={handleTogglePin}
                onDeleteNote={handleDeleteNote}
                onDuplicateNote={handleDuplicateNote}
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

NotesListSimpleQuery.displayName = 'NotesListSimpleQuery'

export default NotesListSimpleQuery