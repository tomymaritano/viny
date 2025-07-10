// Simplified NotesList component
import React, { memo } from 'react'
import { ArrowDownAZ, ArrowUpAZ, NotebookPen } from 'lucide-react'
import { Note } from '../../types'
import { useNotesListLogic } from '../../hooks/useNotesListLogic'
import TaskProgress from '../ui/TaskProgress'

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
  const { isEmpty, notesCount, formatDate, getPreviewText } = useNotesListLogic(notes)

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
    if (currentSection === 'active') return 'Active'
    if (currentSection === 'on-hold') return 'On Hold'
    if (currentSection === 'completed') return 'Completed'
    if (currentSection === 'dropped') return 'Dropped'
    return 'Notes'
  }

  if (isEmpty) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="text-theme-text-muted mb-4">
          <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
    )
  }

  return (
    <div className="flex-1 flex flex-col" style={{ backgroundColor: '#1D1C1D' }}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-theme-border-primary">
        {/* Sort button */}
        <button
          onClick={onSortNotes}
          className="p-2 rounded hover:bg-theme-bg-tertiary transition-colors text-theme-text-secondary hover:text-theme-text-primary"
          title="Sort alphabetically"
        >
          <ArrowDownAZ size={16} />
        </button>

        {/* Centered title */}
        <div className="flex-1 text-center">
          <h2 className="text-lg font-semibold text-theme-text-primary">
            {getDynamicTitle()} ({notesCount})
          </h2>
        </div>

        {/* New note button */}
        <button
          onClick={onNewNote}
          className="p-2 hover:bg-theme-bg-tertiary transition-colors text-theme-text-secondary hover:text-theme-text-primary"
          title="Create new note"
        >
          <NotebookPen size={16} />
        </button>
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto">
        {notes.length === 0 ? (
          <div className="flex-1 flex items-center justify-center h-full">
            <div className="text-theme-text-muted text-center">
              <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-medium text-theme-text-secondary mb-2">No notes here</h3>
              <p className="text-sm text-theme-text-muted mb-4">No notes match the current filter</p>
              <button
                onClick={onNewNote}
                className="px-4 py-2 bg-theme-accent-primary text-white rounded-lg hover:bg-theme-accent-primary/90 transition-colors"
              >
                Create Note
              </button>
            </div>
          </div>
        ) : (
          notes.map((note) => (
          <div
            key={note.id}
            className={`group relative border-b border-theme-border-primary hover:bg-theme-bg-tertiary transition-colors cursor-pointer ${
              selectedNoteId === note.id ? 'bg-[#323D4B]' : ''
            }`}
            onClick={() => onOpenNote(note.id)}
            style={selectedNoteId === note.id ? {
              boxShadow: 'inset 3px 0 0 #ED6E3F'
            } : {}}
          >
            <div className="p-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center flex-1 mr-2">
                  {/* Status Circle */}
                  {note.status && note.status !== 'none' && (
                    <div className={`w-2 h-2 rounded-full mr-2 flex-shrink-0 ${
                      note.status === 'active' ? 'bg-blue-500' :
                      note.status === 'on-hold' ? 'bg-yellow-500' :
                      note.status === 'completed' ? 'bg-green-500' :
                      note.status === 'dropped' ? 'bg-red-500' :
                      'bg-gray-500'
                    }`} title={note.status} />
                  )}
                  
                  <h3 className="font-semibold text-theme-text-primary truncate flex-1">
                    {note.title}
                  </h3>
                </div>
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onTogglePin(note)
                    }}
                    className="p-1 rounded hover:bg-theme-bg-secondary transition-colors"
                    title={note.isPinned ? "Unpin note" : "Pin to top"}
                  >
                    <svg 
                      className={`w-4 h-4 transition-colors ${
                        note.isPinned 
                          ? 'text-theme-accent-yellow' 
                          : 'text-theme-text-muted hover:text-theme-accent-yellow'
                      }`} 
                      fill={note.isPinned ? "currentColor" : "none"} 
                      viewBox="0 0 20 20"
                      stroke={note.isPinned ? "none" : "currentColor"}
                      strokeWidth={note.isPinned ? 0 : 1.5}
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteNote(note)
                    }}
                    className="p-1 rounded hover:bg-theme-bg-secondary transition-colors"
                    title="Delete note"
                  >
                    <svg className="w-4 h-4 text-theme-text-muted hover:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
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
                    <>
                      <span className="px-2 py-1 bg-[#DA5677] text-white rounded">
                        {note.tags[0]}
                      </span>
                      {note.tags.length > 1 && (
                        <span className="text-[#DA5677]">
                          +{note.tags.length - 1}
                        </span>
                      )}
                    </>
                  )}
                </div>
                <span className="text-theme-text-muted">{formatDate(note.updatedAt)}</span>
              </div>
            </div>
          </div>
          ))
        )}
      </div>
    </div>
  )
})

NotesListSimple.displayName = 'NotesListSimple'

export default NotesListSimple