// Simplified NotesList component
import React, { memo, useState, useCallback, useMemo } from 'react'
import { Note } from '../../types'
import { useNotesListLogic } from '../../hooks/useNotesListLogic'
import { useAppStore } from '../../stores/newSimpleStore'
import Icons from '../Icons'
import IconButton from '../ui/IconButton'
import NoteListItem from './notes-list/NoteListItem'

interface NotesListSimpleProps {
  notes: Note[]
  onOpenNote: (noteId: string) => void
  onNewNote: () => void
  selectedNoteId: string | null
  onDeleteNote: (note: Note) => void
  onTogglePin: (note: Note) => void
  onDuplicateNote?: (note: Note) => void
  onMoveToNotebook?: (note: Note) => void
  currentSection?: string
  onSortNotes?: () => void
}

const NotesListSimple: React.FC<NotesListSimpleProps> = memo(({
  notes,
  onOpenNote,
  onNewNote,
  selectedNoteId,
  onDeleteNote,
  onTogglePin,
  onDuplicateNote,
  onMoveToNotebook,
  currentSection = 'notes',
  onSortNotes
}) => {
  const { isEmpty, formatDate, getPreviewText } = useNotesListLogic(notes)
  const { sortBy, sortDirection, setSortBy, setSortDirection, sortNotes, setModal, setActiveSection } = useAppStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [showSortMenu, setShowSortMenu] = useState(false)

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

  const notesCount = filteredNotes.length


  const handleSort = useCallback((field: 'title' | 'date' | 'updated' | 'notebook') => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortDirection('desc')
    }
    sortNotes()
    setShowSortMenu(false)
  }, [sortBy, sortDirection, setSortBy, setSortDirection, sortNotes])


  const handleNoteClick = useCallback((noteId: string) => {
    onOpenNote(noteId)
  }, [onOpenNote])

  const handlePinToggle = useCallback((e: React.MouseEvent, note: Note) => {
    e.stopPropagation()
    onTogglePin(note)
  }, [onTogglePin])

  const handleDelete = useCallback((e: React.MouseEvent, note: Note) => {
    e.stopPropagation()
    onDeleteNote(note)
  }, [onDeleteNote])

  const handleTagClick = useCallback((tag: string) => {
    // Filter by tag when clicking on a tag
    setActiveSection(`tag-${tag.toLowerCase()}`)
  }, [setActiveSection])

  const handleDuplicate = useCallback((e: React.MouseEvent, note: Note) => {
    e.stopPropagation()
    if (onDuplicateNote) {
      onDuplicateNote(note)
    }
  }, [onDuplicateNote])

  const handleMoveToNotebook = useCallback((e: React.MouseEvent, note: Note) => {
    e.stopPropagation()
    if (onMoveToNotebook) {
      onMoveToNotebook(note)
    }
  }, [onMoveToNotebook])

  const getDynamicTitle = () => {
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
  }

  if (isEmpty) {
    return (
      <div className="h-full flex flex-col bg-theme-bg-primary">
        {/* Header */}
        <div className="relative flex items-center justify-between p-2 border-b border-theme-border-primary flex-shrink-0">
          {/* Sort by title */}
          <IconButton
            icon={sortDirection === 'asc' ? Icons.ArrowUpAZ : Icons.ArrowDownAZ}
            onClick={() => handleSort('title')}
            title={`Sort by title ${sortDirection === 'asc' ? 'A-Z' : 'Z-A'}`}
            size={16}
            variant="default"
            aria-label="Sort by title"
            aria-pressed={false}
            aria-keyshortcuts=""
          />

          {/* Centered title */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <h2 className="text-lg font-semibold text-theme-text-primary m-0">
              {getDynamicTitle()} (0)
            </h2>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-1">
            <IconButton
              icon={Icons.NotebookPen}
              onClick={onNewNote}
              title="Create new note"
              size={16}
              variant="default"
              aria-label="Create new note"
              aria-pressed={false}
              aria-keyshortcuts=""
            />
          </div>
        </div>

        {/* Empty state content */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 mx-auto mb-6 bg-theme-bg-secondary/30 rounded-full flex items-center justify-center">
              <Icons.NotebookText size={32} className="text-theme-text-muted/50" />
            </div>
            <h3 className="text-xl font-medium text-theme-text-secondary mb-3">
              {currentSection === 'trash' ? 'Trash is empty' : 'No notes found'}
            </h3>
            <p className="text-sm text-theme-text-muted mb-6 leading-relaxed">
              {currentSection === 'trash' 
                ? 'Deleted notes will appear here. You can restore them or delete them permanently.'
                : currentSection?.startsWith('tag-')
                ? `No notes with the tag "${currentSection.replace('tag-', '')}" yet.`
                : currentSection?.startsWith('notebook-')
                ? `No notes in this notebook yet.`
                : 'Create your first note to get started with Nototo.'
              }
            </p>
            
            {currentSection !== 'trash' && (
              <div className="space-y-4">
                <button
                  onClick={onNewNote}
                  className="px-6 py-3 bg-theme-accent-primary text-white rounded-lg hover:bg-theme-accent-primary/90 transition-colors font-medium"
                >
                  <Icons.Plus size={16} className="inline mr-2" />
                  Create your first note
                </button>
                
                <div className="text-xs text-theme-text-muted">
                  <div className="flex items-center justify-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <kbd className="px-2 py-1 bg-theme-bg-tertiary text-theme-text-muted rounded text-xs">⌘</kbd>
                      <span>+</span>
                      <kbd className="px-2 py-1 bg-theme-bg-tertiary text-theme-text-muted rounded text-xs">N</kbd>
                      <span className="ml-1">to create</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <kbd className="px-2 py-1 bg-theme-bg-tertiary text-theme-text-muted rounded text-xs">⌘</kbd>
                      <span>+</span>
                      <kbd className="px-2 py-1 bg-theme-bg-tertiary text-theme-text-muted rounded text-xs">K</kbd>
                      <span className="ml-1">to search</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-theme-bg-primary">
      {/* Header */}
      <div className="relative flex items-center justify-between p-2 border-b border-theme-border-primary flex-shrink-0">
        {/* Sort by title */}
        <IconButton
          icon={sortDirection === 'asc' ? Icons.ArrowUpAZ : Icons.ArrowDownAZ}
          onClick={() => handleSort('title')}
          title={`Sort by title ${sortDirection === 'asc' ? 'A-Z' : 'Z-A'}`}
          size={16}
          variant="default"
          aria-label="Sort by title"
          aria-pressed={false}
          aria-keyshortcuts=""
        />

        {/* Centered title */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <h2 className="text-lg font-semibold text-theme-text-primary m-0">
            {getDynamicTitle()} ({notesCount})
          </h2>
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-1">
          <IconButton
            icon={Icons.NotebookPen}
            onClick={onNewNote}
            title="Create new note"
            size={16}
            variant="default"
            aria-label="Create new note"
            aria-pressed={false}
            aria-keyshortcuts=""
          />
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-2 border-b border-theme-border-primary flex-shrink-0">
        <div className="relative">
          <Icons.Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-text-muted" />
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-16 py-1.5 border border-theme-border-primary rounded-md text-white placeholder-theme-text-muted focus:outline-none focus:border-theme-accent-primary"
            style={{ backgroundColor: '#161616' }}
          />
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-theme-text-muted text-xs">⌘K</span>
        </div>
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 custom-scrollbar">
        {filteredNotes.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-theme-text-muted text-center">
              <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-medium text-theme-text-secondary mb-2">No notes here</h3>
              <p className="text-sm text-theme-text-muted mb-4">No notes match the current filter</p>
              <div className="flex items-center justify-center">
                <button
                  onClick={onNewNote}
                  className="px-4 py-2 bg-theme-accent-primary text-white rounded-lg hover:bg-theme-accent-primary/90 transition-colors"
                >
                  Create Note
                </button>
              </div>
            </div>
          </div>
        ) : (
          filteredNotes.map((note) => (
            <NoteListItem 
              key={note.id} 
              note={note}
              isSelected={selectedNoteId === note.id}
              onNoteClick={handleNoteClick}
              onPinToggle={handlePinToggle}
              onDelete={handleDelete}
              onDuplicate={onDuplicateNote ? handleDuplicate : undefined}
              onMoveToNotebook={onMoveToNotebook ? handleMoveToNotebook : undefined}
              formatDate={formatDate}
              getPreviewText={getPreviewText}
              onTagClick={handleTagClick}
            />
          ))
        )}
      </div>
    </div>
  )
})

NotesListSimple.displayName = 'NotesListSimple'

export default NotesListSimple
