/**
 * NotesListSimpleRefactored - Refactored notes list using component composition
 * Replaces NotesListSimple.tsx with smaller, focused components
 */

import React, { memo, useState, useCallback, useMemo } from 'react'
import { Note } from '../../types'
import { useNotesListLogic } from '../../hooks/useNotesListLogic'
import { useSimpleStore } from '../../stores/simpleStore'

// Import refactored components
import NotesListHeader from './notes-list/NotesListHeader'
import NotesListSearchBar from './notes-list/NotesListSearchBar'
import NotesListContent from './notes-list/NotesListContent'
import EmptyState from './notes-list/EmptyState'

interface NotesListSimpleProps {
  notes: Note[]
  onOpenNote: (noteId: string) => void
  onNewNote: () => void
  selectedNoteId: string | null
  onDeleteNote: (note: Note) => void
  onTogglePin: (note: Note) => void
  currentSection?: string
  onSortNotes?: () => void
}

const NotesListSimpleRefactored: React.FC<NotesListSimpleProps> = memo(({
  notes,
  onOpenNote,
  onNewNote,
  selectedNoteId,
  onDeleteNote,
  onTogglePin,
  currentSection = 'notes',
  onSortNotes
}) => {
  const { isEmpty, formatDate, getPreviewText } = useNotesListLogic(notes)
  const { sortBy, sortDirection, setSortBy, setSortDirection, sortNotes } = useSimpleStore()
  const [searchTerm, setSearchTerm] = useState('')

  // Filter notes based on search term
  const filteredNotes = useMemo(() => {
    if (!searchTerm.trim()) return notes
    
    const searchLower = searchTerm.toLowerCase()
    return notes.filter(note => 
      note.title.toLowerCase().includes(searchLower) ||
      note.content.toLowerCase().includes(searchLower) ||
      note.tags.some(tag => tag.toLowerCase().includes(searchLower))
    )
  }, [notes, searchTerm])

  // Get dynamic title based on current section
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

  // Handle sorting
  const handleSort = useCallback((field: 'title' | 'date' | 'updated' | 'notebook') => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortDirection('desc')
    }
    sortNotes()
  }, [sortBy, sortDirection, setSortBy, setSortDirection, sortNotes])

  const handleSortDirectionToggle = useCallback(() => {
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    sortNotes()
  }, [sortDirection, setSortDirection, sortNotes])

  // Handle note interactions
  const handleNoteClick = useCallback((noteId: string) => {
    onOpenNote(noteId)
  }, [onOpenNote])

  const handlePinToggle = useCallback((note: Note) => {
    onTogglePin(note)
  }, [onTogglePin])

  const handleDelete = useCallback((note: Note) => {
    onDeleteNote(note)
  }, [onDeleteNote])

  const handleTagClick = useCallback((tag: string) => {
    // Optional: Add functionality to filter by tag
    setSearchTerm(tag)
  }, [])

  // Show empty state for empty notes list
  if (isEmpty) {
    return (
      <div className="h-full flex flex-col" style={{ backgroundColor: '#1D1C1D' }}>
        <NotesListHeader
          title={getDynamicTitle()}
          count={0}
          sortBy={sortBy}
          sortDirection={sortDirection}
          onSort={handleSort}
          onSortDirectionToggle={handleSortDirectionToggle}
          onNewNote={onNewNote}
        />

        <EmptyState
          type="initial"
          currentSection={currentSection}
          onNewNote={onNewNote}
        />
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: '#1D1C1D' }}>
      {/* Header with title, count, sort, and actions */}
      <NotesListHeader
        title={getDynamicTitle()}
        count={filteredNotes.length}
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSort={handleSort}
        onSortDirectionToggle={handleSortDirectionToggle}
        onNewNote={onNewNote}
      />

      {/* Search bar */}
      <NotesListSearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder="Search notes..."
      />

      {/* Main content area with notes or empty state */}
      <NotesListContent
        filteredNotes={filteredNotes}
        selectedNoteId={selectedNoteId}
        currentSection={currentSection}
        searchTerm={searchTerm}
        onNoteClick={handleNoteClick}
        onPinToggle={handlePinToggle}
        onDelete={handleDelete}
        onNewNote={onNewNote}
        formatDate={formatDate}
        getPreviewText={getPreviewText}
        onTagClick={handleTagClick}
      />
    </div>
  )
})

NotesListSimpleRefactored.displayName = 'NotesListSimpleRefactored'

export default NotesListSimpleRefactored
