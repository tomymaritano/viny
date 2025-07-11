// Simplified NotesList component
import React, { memo, useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { Note } from '../../types'
import { useNotesListLogic } from '../../hooks/useNotesListLogic'
import TaskProgress from '../ui/TaskProgress'
import { useSimpleStore } from '../../stores/simpleStore'
import Icons from '../Icons'
import IconButton from '../ui/IconButton'

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

const NotesListSimple: React.FC<NotesListSimpleProps> = memo(({
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
  const { sortBy, sortDirection, setSortBy, setSortDirection, sortNotes, setModal, getTagColor } = useSimpleStore()
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

  // Memoized note item component to prevent unnecessary re-renders
  const NoteItem = memo(({ note }: { note: Note }) => (
    <div
      key={note.id}
      className={`group relative border-b border-theme-border-primary hover:bg-theme-bg-tertiary transition-colors cursor-pointer ${
        selectedNoteId === note.id ? 'bg-[#323D4B]' : ''
      }`}
      onClick={() => handleNoteClick(note.id)}
      style={{}}
    >
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center flex-1 mr-2">
            {/* Status Circle */}
            {note.status && note.status !== 'draft' && (
              <div className={`w-2 h-2 rounded-full mr-2 flex-shrink-0 ${
                note.status === 'in-progress' ? 'bg-blue-500' :
                note.status === 'review' ? 'bg-yellow-500' :
                note.status === 'completed' ? 'bg-green-500' :
                note.status === 'archived' ? 'bg-red-500' :
                'bg-gray-500'
              }`} title={note.status} />
            )}
            
            <h3 className="text-sm font-medium text-theme-text-primary truncate flex-1">
              {note.title}
            </h3>
          </div>
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <IconButton
              icon={Icons.Star}
              onClick={() => handlePinToggle(null as any, note)}
              isActive={note.isPinned}
              title={note.isPinned ? "Unpin note" : "Pin to top"}
              size={16}
              variant="default"
            />
            <IconButton
              icon={Icons.Trash}
              onClick={() => handleDelete(null as any, note)}
              title="Delete note"
              size={16}
              variant="default"
            />
          </div>
        </div>
        
        <p className="text-sm text-theme-text-secondary line-clamp-2 mb-2">
          {getPreviewText(note.content)}
        </p>
        
        {/* Task Progress */}
        <div className="mb-2">
          <TaskProgress content={note.content} size="xs" />
        </div>
        
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            {/* Tags */}
            {note.tags.length > 0 && (
              <div className="flex items-center space-x-1 flex-wrap">
                {note.tags.slice(0, 3).map((tag, index) => (
                  <span key={index} className={`text-xs px-1.5 py-0.5 rounded-xl border ${getTagColor(tag)}`}>
                    #{tag}
                  </span>
                ))}
                {note.tags.length > 3 && (
                  <span className="text-theme-text-muted text-xs">
                    +{note.tags.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>
          <span className="text-theme-text-muted">{formatDate(note.updatedAt)}</span>
        </div>
      </div>
    </div>
  ))

  NoteItem.displayName = 'NoteItem'

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
      <div className="flex-1 flex flex-col" style={{ backgroundColor: '#1D1C1D' }}>
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-50 text-theme-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-theme-text-secondary mb-2">No notes yet</h3>
            <p className="text-sm text-theme-text-muted mb-4">Create your first note to get started</p>
            <button
              onClick={onNewNote}
              className="px-4 py-2 bg-theme-accent-primary text-white rounded-lg hover:bg-theme-accent-primary/90 transition-colors"
            >
              Create Note
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: '#1D1C1D' }}>
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
      <div className="flex-1 overflow-y-auto min-h-0">
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
            <NoteItem key={note.id} note={note} />
          ))
        )}
      </div>
    </div>
  )
})

NotesListSimple.displayName = 'NotesListSimple'

export default NotesListSimple