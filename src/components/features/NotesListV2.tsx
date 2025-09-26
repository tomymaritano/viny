/**
 * NotesListV2 - Clean Architecture Implementation
 * Uses Service Layer + TanStack Query V2 + UI-only Store
 */

import React, { memo, useCallback, useMemo } from 'react'
import type { Note } from '../../types'
import { useSmartSearch } from '../../hooks/useSmartSearch'
import { useDebounce } from '../../hooks/useDebounce'
import NotesHeader from '../notes/NotesHeader'
import EmptyNotesState from '../notes/EmptyNotesState'
import NotesList from '../notes/NotesList'
import VirtualizedNotesList from '../notes/VirtualizedNotesList'
import LoadingSpinner from '../LoadingSpinner'

// Clean Architecture imports
import { 
  useActiveNotesQueryV2,
  useTrashedNotesQueryV2,
  useNotebookNotesQueryV2,
  useTaggedNotesQueryV2,
  usePinnedNotesQueryV2,
  useDeleteNotePermanentlyMutationV2,
  useTogglePinMutationV2,
  useMoveToTrashMutationV2,
  useRestoreNoteMutationV2,
  useDuplicateNoteMutationV2,
  useUpdateNoteMutationV2,
} from '../../hooks/queries/useNotesServiceQueryV2'
import { useNoteUI, useNavigationStore, useNotebookUI } from '../../stores/cleanUIStore'
import { useNotebooksQuery } from '../../hooks/queries'

type SortField = 'title' | 'date' | 'updated' | 'notebook'
type SortDirection = 'asc' | 'desc'

interface NotesListV2Props {
  onNewNote: () => void
}

const NotesListV2: React.FC<NotesListV2Props> = memo(({ onNewNote }) => {
  // UI State from clean store
  const {
    selectedNoteId,
    setSelectedNoteId,
    openEditor,
    sortBy,
    sortDirection,
    setSortBy,
    setSortDirection,
  } = useNoteUI()
  
  const { activeSection } = useNavigationStore()
  const { data: notebooks = [] } = useNotebooksQuery()
  
  // Search state (UI only)
  const [searchTerm, setSearchTerm] = React.useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  
  // Determine which query to use based on active section
  const isTrashView = activeSection === 'trash'
  const isPinnedView = activeSection === 'pinned'
  const isNotebookView = activeSection?.startsWith('notebook-')
  const isTagView = activeSection?.startsWith('tag-')
  const isStatusView = activeSection?.startsWith('status-')
  
  // Conditional queries based on section
  const activeNotesQuery = useActiveNotesQueryV2()
  const trashedNotesQuery = useTrashedNotesQueryV2()
  const pinnedNotesQuery = usePinnedNotesQueryV2()
  
  // Get notebook/tag ID from section
  const notebookName = isNotebookView ? activeSection.replace('notebook-', '') : ''
  const tag = isTagView ? activeSection.replace('tag-', '') : ''
  
  // Find notebook ID from name
  const targetNotebook = notebooks.find(nb => 
    nb.name.toLowerCase() === notebookName.toLowerCase()
  )
  const notebookId = targetNotebook?.id || ''
  
  // Notebook-specific query
  const notebookNotesQuery = useNotebookNotesQueryV2(notebookId)
  const taggedNotesQuery = useTaggedNotesQueryV2(tag)
  
  // Select the appropriate query result
  let queryResult
  if (isTrashView) {
    queryResult = trashedNotesQuery
  } else if (isPinnedView) {
    queryResult = pinnedNotesQuery
  } else if (isNotebookView && notebookId) {
    queryResult = notebookNotesQuery
  } else if (isTagView && tag) {
    queryResult = taggedNotesQuery
  } else {
    queryResult = activeNotesQuery
  }
  
  const { data: notes = [], isLoading, error } = queryResult
  
  // Filter notes by status or handle recent section
  const filteredByStatus = useMemo(() => {
    if (isStatusView) {
      const status = activeSection.replace('status-', '')
      return notes.filter(note => note.status === status)
    }
    
    // Handle recent section - sort by updatedAt and limit to 20
    if (activeSection === 'recent') {
      return [...notes]
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 20)
    }
    
    return notes
  }, [notes, activeSection, isStatusView])
  
  // Mutations
  const deletePermanentlyMutation = useDeleteNotePermanentlyMutationV2()
  const togglePinMutation = useTogglePinMutationV2()
  const moveToTrashMutation = useMoveToTrashMutationV2()
  const restoreMutation = useRestoreNoteMutationV2()
  const duplicateMutation = useDuplicateNoteMutationV2()
  const updateNoteMutation = useUpdateNoteMutationV2()
  
  // Smart search setup
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
  
  const { search, isIndexing } = useSmartSearch(
    filteredByStatus,
    smartSearchOptions
  )
  
  // Search filtering
  const SMART_SEARCH_THRESHOLD = 200
  const shouldUseSmartSearch = filteredByStatus.length > SMART_SEARCH_THRESHOLD
  
  const searchedNotes = useMemo(() => {
    if (!debouncedSearchTerm.trim()) return filteredByStatus
    
    if (shouldUseSmartSearch) {
      return search(debouncedSearchTerm)
    } else {
      const searchLower = debouncedSearchTerm.toLowerCase()
      return filteredByStatus.filter(note => {
        if (note.title.toLowerCase().includes(searchLower)) return true
        if (note.content.toLowerCase().includes(searchLower)) return true
        return note.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      })
    }
  }, [filteredByStatus, debouncedSearchTerm, search, shouldUseSmartSearch])
  
  // Sorting
  const sortedNotes = useMemo(() => {
    const notesToSort = [...searchedNotes]
    
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
        case 'notebook':
          // Look up notebook name by ID for sorting
          const aNotebook = notebooks.find(n => n.id === a.notebookId)
          const bNotebook = notebooks.find(n => n.id === b.notebookId)
          aValue = aNotebook?.name?.toLowerCase() || ''
          bValue = bNotebook?.name?.toLowerCase() || ''
          break
        default: // 'updated'
          aValue = new Date(a.updatedAt).getTime()
          bValue = new Date(b.updatedAt).getTime()
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [searchedNotes, sortBy, sortDirection, notebooks])
  
  // Performance settings
  const VIRTUALIZATION_THRESHOLD = 100
  const shouldUseVirtualization = sortedNotes.length > VIRTUALIZATION_THRESHOLD
  
  // Handlers
  const handleSort = useCallback(
    (field: SortField, direction: SortDirection) => {
      setSortBy(field as any)
      setSortDirection(direction)
    },
    [setSortBy, setSortDirection]
  )
  
  const handleNoteClick = useCallback(
    (noteId: string) => {
      setSelectedNoteId(noteId)
      openEditor(noteId)
    },
    [setSelectedNoteId, openEditor]
  )
  
  const handleTogglePin = useCallback((note: Note) => {
    togglePinMutation.mutate(note.id)
  }, [togglePinMutation])
  
  const handleDeleteNote = useCallback((note: Note) => {
    if (isTrashView) {
      deletePermanentlyMutation.mutate(note.id)
    } else {
      moveToTrashMutation.mutate(note.id)
    }
  }, [isTrashView, deletePermanentlyMutation, moveToTrashMutation])
  
  const handleRestoreNote = useCallback((note: Note) => {
    restoreMutation.mutate(note.id)
  }, [restoreMutation])
  
  const handleDuplicateNote = useCallback((note: Note) => {
    duplicateMutation.mutate(note.id)
  }, [duplicateMutation])
  
  const handleMoveToNotebook = useCallback((note: Note) => {
    // This would open a modal to select notebook
    // For now, just move to default notebook
    updateNoteMutation.mutate({
      id: note.id,
      data: { notebookId: 'default' }
    })
  }, [updateNoteMutation])
  
  // Dynamic title based on section
  const getDynamicTitle = useCallback(() => {
    if (activeSection === 'all-notes') return 'All Notes'
    if (activeSection === 'recent') return 'Recent'
    if (activeSection === 'pinned') return 'Pinned'
    if (activeSection === 'trash') return 'Trash'
    
    if (isNotebookView && targetNotebook) {
      return targetNotebook.name
    }
    
    if (isTagView) {
      return `#${tag}`
    }
    
    if (isStatusView) {
      const status = activeSection.replace('status-', '')
      return status.charAt(0).toUpperCase() + status.slice(1)
    }
    
    return 'Notes'
  }, [activeSection, isNotebookView, targetNotebook, isTagView, tag, isStatusView])
  
  // Loading state
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-theme-bg-primary">
        <LoadingSpinner text="Loading notes..." />
      </div>
    )
  }
  
  // Error state
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
  
  // Empty state
  if (sortedNotes.length === 0 && !searchTerm) {
    return (
      <EmptyNotesState
        title={getDynamicTitle()}
        currentSection={activeSection}
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
        notesCount={sortedNotes.length}
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
            notes={sortedNotes}
            selectedNote={
              sortedNotes.find(n => n.id === selectedNoteId) || null
            }
            onNoteSelect={note => handleNoteClick(note.id)}
            onNoteDelete={noteId => {
              const note = sortedNotes.find(n => n.id === noteId)
              if (note) handleDeleteNote(note)
            }}
            onNoteDuplicate={handleDuplicateNote}
            searchQuery={searchTerm}
            className="h-full"
          />
        ) : (
          <div className="h-full overflow-y-auto overflow-x-hidden custom-scrollbar">
            <NotesList
              notes={sortedNotes}
              selectedNoteId={selectedNoteId}
              onNoteClick={handleNoteClick}
              onTogglePin={handleTogglePin}
              onDeleteNote={handleDeleteNote}
              onDuplicateNote={handleDuplicateNote}
              onMoveToNotebook={handleMoveToNotebook}
              onRestoreNote={isTrashView ? handleRestoreNote : undefined}
              onPermanentDelete={isTrashView ? handleDeleteNote : undefined}
              isTrashView={isTrashView}
            />
          </div>
        )}
      </div>
    </div>
  )
})

NotesListV2.displayName = 'NotesListV2'

export default NotesListV2