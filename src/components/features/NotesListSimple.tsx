// Simplified NotesList component
import React, { memo, useState, useCallback, useMemo, useEffect, useRef } from 'react'
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
  const sortMenuRef = useRef<HTMLDivElement>(null)

  // Filter and sort notes based on search term and sort criteria
  const filteredAndSortedNotes = useMemo(() => {
    // First filter by search term
    let filtered = notes
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase()
      filtered = notes.filter(note => 
        note.title.toLowerCase().includes(searchLower) ||
        note.content.toLowerCase().includes(searchLower) ||
        note.tags.some(tag => tag.toLowerCase().includes(searchLower))
      )
    }
    
    // Then sort the filtered results
    const sorted = [...filtered].sort((a, b) => {
      let aValue: string | number | Date
      let bValue: string | number | Date
      
      switch (sortBy) {
        case 'title':
          aValue = a.title.toLowerCase()
          bValue = b.title.toLowerCase()
          break
        case 'date':
          aValue = new Date(a.createdAt)
          bValue = new Date(b.createdAt)
          break
        case 'updated':
          aValue = new Date(a.updatedAt)
          bValue = new Date(b.updatedAt)
          break
        case 'notebook':
          aValue = a.notebook?.toLowerCase() || ''
          bValue = b.notebook?.toLowerCase() || ''
          break
        default:
          aValue = new Date(a.updatedAt)
          bValue = new Date(b.updatedAt)
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
    
    return sorted
  }, [notes, searchTerm, sortBy, sortDirection])

  const notesCount = filteredAndSortedNotes.length

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target as Node)) {
        setShowSortMenu(false)
      }
    }

    if (showSortMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showSortMenu])

  const handleSort = useCallback((field: 'title' | 'date' | 'updated' | 'notebook') => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortDirection('desc')
    }
    setShowSortMenu(false)
  }, [sortBy, sortDirection, setSortBy, setSortDirection])


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
          {/* Sort dropdown */}
          <div className="relative" ref={sortMenuRef}>
            <IconButton
              icon={sortBy === 'title' ? (sortDirection === 'asc' ? Icons.ArrowUpAZ : Icons.ArrowDownAZ) : Icons.ArrowDownAZ}
              onClick={() => setShowSortMenu(!showSortMenu)}
              title="Sort and filter options"
              size={16}
              variant="default"
              aria-label="Sort and filter options"
              aria-pressed={showSortMenu}
              aria-keyshortcuts=""
            />
            
            {showSortMenu && (
              <div className="absolute left-0 top-8 z-50 bg-theme-bg-primary border border-theme-border-primary rounded-lg shadow-lg min-w-48">
                <div className="py-1">
                  <div className="px-3 py-2 text-xs font-medium text-theme-text-muted border-b border-theme-border-primary">
                    Sort by
                  </div>
                  
                  {/* Title options */}
                  <button
                    onClick={() => handleSort('title')}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs hover:bg-theme-bg-tertiary ${
                      sortBy === 'title' && sortDirection === 'asc' ? 'bg-theme-bg-secondary text-theme-accent-primary' : 'text-theme-text-primary'
                    }`}
                  >
                    <span>Title: A → Z</span>
                    {sortBy === 'title' && sortDirection === 'asc' && <Icons.Check size={12} />}
                  </button>
                  
                  <button
                    onClick={() => {
                      setSortBy('title')
                      setSortDirection('desc')
                      sortNotes()
                      setShowSortMenu(false)
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs hover:bg-theme-bg-tertiary ${
                      sortBy === 'title' && sortDirection === 'desc' ? 'bg-theme-bg-secondary text-theme-accent-primary' : 'text-theme-text-primary'
                    }`}
                  >
                    <span>Title: Z → A</span>
                    {sortBy === 'title' && sortDirection === 'desc' && <Icons.Check size={12} />}
                  </button>
                  
                  {/* Date Created options */}
                  <button
                    onClick={() => {
                      setSortBy('date')
                      setSortDirection('desc')
                      sortNotes()
                      setShowSortMenu(false)
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs hover:bg-theme-bg-tertiary ${
                      sortBy === 'date' && sortDirection === 'desc' ? 'bg-theme-bg-secondary text-theme-accent-primary' : 'text-theme-text-primary'
                    }`}
                  >
                    <span>Date Created: New → Old</span>
                    {sortBy === 'date' && sortDirection === 'desc' && <Icons.Check size={12} />}
                  </button>
                  
                  <button
                    onClick={() => {
                      setSortBy('date')
                      setSortDirection('asc')
                      sortNotes()
                      setShowSortMenu(false)
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs hover:bg-theme-bg-tertiary ${
                      sortBy === 'date' && sortDirection === 'asc' ? 'bg-theme-bg-secondary text-theme-accent-primary' : 'text-theme-text-primary'
                    }`}
                  >
                    <span>Date Created: Old → New</span>
                    {sortBy === 'date' && sortDirection === 'asc' && <Icons.Check size={12} />}
                  </button>
                  
                  {/* Date Updated options */}
                  <button
                    onClick={() => {
                      setSortBy('updated')
                      setSortDirection('desc')
                      sortNotes()
                      setShowSortMenu(false)
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs hover:bg-theme-bg-tertiary ${
                      sortBy === 'updated' && sortDirection === 'desc' ? 'bg-theme-bg-secondary text-theme-accent-primary' : 'text-theme-text-primary'
                    }`}
                  >
                    <span>Date Updated: New → Old</span>
                    {sortBy === 'updated' && sortDirection === 'desc' && <Icons.Check size={12} />}
                  </button>
                  
                  <button
                    onClick={() => {
                      setSortBy('updated')
                      setSortDirection('asc')
                      sortNotes()
                      setShowSortMenu(false)
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs hover:bg-theme-bg-tertiary ${
                      sortBy === 'updated' && sortDirection === 'asc' ? 'bg-theme-bg-secondary text-theme-accent-primary' : 'text-theme-text-primary'
                    }`}
                  >
                    <span>Date Updated: Old → New</span>
                    {sortBy === 'updated' && sortDirection === 'asc' && <Icons.Check size={12} />}
                  </button>
                </div>
              </div>
            )}
          </div>

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
        {/* Sort dropdown */}
        <div className="relative" ref={sortMenuRef}>
          <IconButton
            icon={sortBy === 'title' ? (sortDirection === 'asc' ? Icons.ArrowUpAZ : Icons.ArrowDownAZ) : Icons.ArrowDownAZ}
            onClick={() => setShowSortMenu(!showSortMenu)}
            title="Sort and filter options"
            size={16}
            variant="default"
            aria-label="Sort and filter options"
            aria-pressed={showSortMenu}
            aria-keyshortcuts=""
          />
          
          {showSortMenu && (
            <div className="absolute left-0 top-8 z-50 bg-theme-bg-primary border border-theme-border-primary rounded-lg shadow-lg min-w-48">
              <div className="py-1">
                <div className="px-3 py-2 text-xs font-medium text-theme-text-muted border-b border-theme-border-primary">
                  Sort by
                </div>
                
                {/* Title options */}
                <button
                  onClick={() => handleSort('title')}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs hover:bg-theme-bg-tertiary ${
                    sortBy === 'title' && sortDirection === 'asc' ? 'bg-theme-bg-secondary text-theme-accent-primary' : 'text-theme-text-primary'
                  }`}
                >
                  <span>Title: A → Z</span>
                  {sortBy === 'title' && sortDirection === 'asc' && <Icons.Check size={12} />}
                </button>
                
                <button
                  onClick={() => {
                    setSortBy('title')
                    setSortDirection('desc')
                    setShowSortMenu(false)
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs hover:bg-theme-bg-tertiary ${
                    sortBy === 'title' && sortDirection === 'desc' ? 'bg-theme-bg-secondary text-theme-accent-primary' : 'text-theme-text-primary'
                  }`}
                >
                  <span>Title: Z → A</span>
                  {sortBy === 'title' && sortDirection === 'desc' && <Icons.Check size={12} />}
                </button>
                
                {/* Date Created options */}
                <button
                  onClick={() => {
                    setSortBy('date')
                    setSortDirection('desc')
                    setShowSortMenu(false)
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs hover:bg-theme-bg-tertiary ${
                    sortBy === 'date' && sortDirection === 'desc' ? 'bg-theme-bg-secondary text-theme-accent-primary' : 'text-theme-text-primary'
                  }`}
                >
                  <span>Date Created: New → Old</span>
                  {sortBy === 'date' && sortDirection === 'desc' && <Icons.Check size={12} />}
                </button>
                
                <button
                  onClick={() => {
                    setSortBy('date')
                    setSortDirection('asc')
                    setShowSortMenu(false)
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs hover:bg-theme-bg-tertiary ${
                    sortBy === 'date' && sortDirection === 'asc' ? 'bg-theme-bg-secondary text-theme-accent-primary' : 'text-theme-text-primary'
                  }`}
                >
                  <span>Date Created: Old → New</span>
                  {sortBy === 'date' && sortDirection === 'asc' && <Icons.Check size={12} />}
                </button>
                
                {/* Date Updated options */}
                <button
                  onClick={() => {
                    setSortBy('updated')
                    setSortDirection('desc')
                    setShowSortMenu(false)
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs hover:bg-theme-bg-tertiary ${
                    sortBy === 'updated' && sortDirection === 'desc' ? 'bg-theme-bg-secondary text-theme-accent-primary' : 'text-theme-text-primary'
                  }`}
                >
                  <span>Date Updated: New → Old</span>
                  {sortBy === 'updated' && sortDirection === 'desc' && <Icons.Check size={12} />}
                </button>
                
                <button
                  onClick={() => {
                    setSortBy('updated')
                    setSortDirection('asc')
                    setShowSortMenu(false)
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs hover:bg-theme-bg-tertiary ${
                    sortBy === 'updated' && sortDirection === 'asc' ? 'bg-theme-bg-secondary text-theme-accent-primary' : 'text-theme-text-primary'
                  }`}
                >
                  <span>Date Updated: Old → New</span>
                  {sortBy === 'updated' && sortDirection === 'asc' && <Icons.Check size={12} />}
                </button>
              </div>
            </div>
          )}
        </div>

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
        {filteredAndSortedNotes.length === 0 ? (
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
          filteredAndSortedNotes.map((note) => (
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
