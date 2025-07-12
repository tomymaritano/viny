// Simplified NotesList component
import React, { memo, useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { Note } from '../../types'
import { useNotesListLogic } from '../../hooks/useNotesListLogic'
import TaskProgress from '../ui/TaskProgress'
import { useSimpleStore } from '../../stores/simpleStore'
import Icons from '../Icons'
import IconButton from '../ui/IconButton'
import CustomTag from '../ui/CustomTag'

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
  const { sortBy, sortDirection, setSortBy, setSortDirection, sortNotes, setModal } = useSimpleStore()
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
      className={`group relative border-b border-theme-border-primary hover:bg-theme-bg-tertiary transition-colors cursor-pointer overflow-hidden ${
        selectedNoteId === note.id ? 'bg-[#323D4B]' : ''
      }`}
      onClick={() => handleNoteClick(note.id)}
    >
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center flex-1 mr-2 min-w-0">
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
              onClick={(e) => handlePinToggle(e, note)}
              isActive={note.isPinned}
              title={note.isPinned ? "Unpin note" : "Pin to top"}
              size={16}
              variant="default"
            />
            <IconButton
              icon={Icons.Trash}
              onClick={(e) => handleDelete(e, note)}
              title="Delete note"
              size={16}
              variant="default"
            />
          </div>
        </div>
        
        <p className="text-sm text-theme-text-secondary line-clamp-2 mb-2 overflow-hidden">
          {getPreviewText(note.content)}
        </p>
        
        {/* Task Progress */}
        <div className="mb-2">
          <TaskProgress content={note.content} size="xs" />
        </div>
        
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            {/* Tags */}
            {note.tags.length > 0 && (
              <div className="flex items-center gap-1 flex-wrap min-w-0">
                {note.tags.slice(0, 3).map((tag, index) => (
                  <CustomTag 
                    key={index} 
                    tagName={tag} 
                    size="sm"
                    onClick={() => {
                      // Optional: Add functionality to filter by tag
                    }}
                  />
                ))}
                {note.tags.length > 3 && (
                  <span className="text-theme-text-muted text-xs ml-1">
                    +{note.tags.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>
          <span className="text-theme-text-muted flex-shrink-0">{formatDate(note.updatedAt)}</span>
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
            <NoteItem key={note.id} note={note} />
          ))
        )}
      </div>
    </div>
  )
})

NotesListSimple.displayName = 'NotesListSimple'

export default NotesListSimple
