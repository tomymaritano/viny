/**
 * NoteItem - Individual note item component
 * Extracted from NotesListSimple.tsx
 */

import React from 'react'
import { Note } from '../../../types'
import NoteStatusIndicator from './NoteStatusIndicator'
import NoteTags from './NoteTags'
import NoteActions from './NoteActions'
import TaskProgress from '../../ui/TaskProgress'

interface NoteItemProps {
  note: Note
  isSelected: boolean
  onNoteClick: (noteId: string) => void
  onPinToggle: (note: Note) => void
  onDelete: (note: Note) => void
  formatDate: (dateString: string) => string
  getPreviewText: (content: string) => string
  onTagClick?: (tag: string) => void
}

const NoteItem: React.FC<NoteItemProps> = ({
  note,
  isSelected,
  onNoteClick,
  onPinToggle,
  onDelete,
  formatDate,
  getPreviewText,
  onTagClick
}) => {
  const handleClick = () => {
    onNoteClick(note.id)
  }

  const handlePinToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    onPinToggle(note)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete(note)
  }

  return (
    <div
      onClick={handleClick}
      className={`
        group relative p-3 border-b border-theme-border-primary cursor-pointer transition-colors
        ${isSelected 
          ? 'bg-theme-bg-tertiary border-l-2 border-l-theme-accent-primary' 
          : 'hover:bg-theme-bg-secondary/50'
        }
      `}
    >
      {/* Header row with status, title, and actions */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-start gap-2 min-w-0 flex-1">
          <NoteStatusIndicator status={note.status} />
          
          <div className="min-w-0 flex-1">
            <h3 className={`
              font-medium text-sm leading-tight truncate
              ${isSelected ? 'text-theme-text-primary' : 'text-theme-text-secondary'}
            `}>
              {note.title || 'Untitled'}
            </h3>
          </div>
        </div>

        <NoteActions
          note={note}
          onPinToggle={handlePinToggle}
          onDelete={handleDelete}
        />
      </div>

      {/* Content preview */}
      {note.content && (
        <p className="text-xs text-theme-text-muted leading-relaxed mb-2 line-clamp-2">
          {getPreviewText(note.content)}
        </p>
      )}

      {/* Footer with metadata */}
      <div className="flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {/* Tags */}
          <NoteTags 
            tags={note.tags || []} 
            maxVisible={2}
            onTagClick={onTagClick}
          />

          {/* Task progress if note has tasks */}
          <TaskProgress note={note} size="sm" />
        </div>

        {/* Date and metadata */}
        <div className="flex items-center gap-2 text-theme-text-muted flex-shrink-0">
          {note.notebook && (
            <span className="truncate max-w-20" title={note.notebook}>
              📁 {note.notebook}
            </span>
          )}
          
          <span title={`Updated: ${formatDate(note.updatedAt)}`}>
            {formatDate(note.updatedAt)}
          </span>
          
          {note.isPinned && (
            <span className="text-theme-accent-orange" title="Pinned">
              📌
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default NoteItem
