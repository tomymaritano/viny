import React, { memo } from 'react'
import { Note } from '../../../types'
import { Icons } from '../../Icons'
import CustomTag from '../../ui/CustomTag'
// import TaskProgress from '../../ui/TaskProgress' // removed
import NoteActionsDropdown from '../../ui/NoteActionsDropdown'
import { STATUS_BG_COLORS, THEME_CLASSES, CSS_THEME_VARS } from '../../../theme/themeConstants'

interface NoteListItemProps {
  note: Note
  isSelected: boolean
  onNoteClick: (noteId: string) => void
  onPinToggle: (e: React.MouseEvent, note: Note) => void
  onDelete: (e: React.MouseEvent, note: Note) => void
  onDuplicate?: (e: React.MouseEvent, note: Note) => void
  onMoveToNotebook?: (e: React.MouseEvent, note: Note) => void
  onRestoreNote?: (e: React.MouseEvent, note: Note) => void
  onPermanentDelete?: (e: React.MouseEvent, note: Note) => void
  isTrashView?: boolean
  formatDate: (date: string) => string
  getPreviewText: (content: string) => string
  onTagClick?: (tag: string) => void
}

// Status color mapping using centralized theme constants
const getStatusColor = (status: Note['status']): string => {
  switch (status) {
    case 'in-progress':
      return STATUS_BG_COLORS.IN_PROGRESS
    case 'review':
      return STATUS_BG_COLORS.REVIEW
    case 'completed':
      return STATUS_BG_COLORS.COMPLETED
    case 'archived':
      return STATUS_BG_COLORS.ARCHIVED
    default:
      return THEME_CLASSES.ACCENT.PRIMARY
  }
}

const NoteListItem: React.FC<NoteListItemProps> = memo(({
  note,
  isSelected,
  onNoteClick,
  onPinToggle,
  onDelete,
  onDuplicate,
  onMoveToNotebook,
  onRestoreNote,
  onPermanentDelete,
  isTrashView = false,
  formatDate,
  getPreviewText,
  onTagClick
}) => {
  const handleClick = () => {
    onNoteClick(note.id)
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    
    // Check if we're in test environment - force web dropdown for E2E tests
    const isTestEnvironment = window.navigator.userAgent.includes('Playwright') || 
                              window.navigator.userAgent.includes('Test') ||
                              process.env.NODE_ENV === 'test'
    
    // Check if we're in Electron and not in test environment
    if (window.electronAPI?.isElectron && !isTestEnvironment) {
      window.electronAPI.showNoteContextMenu(note)
    }
    // Otherwise let the NoteActionsDropdown handle it
  }

  const handleTagClick = (tag: string) => {
    if (onTagClick) {
      onTagClick(tag)
    }
  }

  return (
    <NoteActionsDropdown
      note={note}
      onPinToggle={onPinToggle}
      onDelete={onDelete}
      onDuplicate={onDuplicate}
      onMoveToNotebook={onMoveToNotebook}
      onRestoreNote={onRestoreNote}
      onPermanentDelete={onPermanentDelete}
      isTrashView={isTrashView}
    >
      <div
        data-testid="note-item"
        data-note-id={note.id}
        className={`group relative ${THEME_CLASSES.BORDER.PRIMARY} border-b hover:${THEME_CLASSES.BG.TERTIARY} transition-colors cursor-pointer overflow-hidden`}
        style={isSelected ? {
          backgroundColor: CSS_THEME_VARS.ACTIVE_BG,
          boxShadow: `inset 3px 0 0 ${CSS_THEME_VARS.ACTIVE_BORDER}`
        } : {}}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
      >
      <div className="p-3">
        {/* Header with title and actions */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center flex-1 mr-2 min-w-0">
            {/* Status indicator */}
            {note.status && note.status !== 'draft' && (
              <div 
                className={`w-2 h-2 rounded-full mr-2 flex-shrink-0 ${getStatusColor(note.status)}`}
                title={note.status}
              />
            )}
            
            {/* Pin indicator (always visible for pinned notes) */}
            {note.isPinned && (
              <Icons.Pin 
                size={14} 
                className="mr-2 flex-shrink-0 text-theme-accent-primary" 
                title="Pinned note"
              />
            )}
            
            {/* Note title */}
            <h3 className="text-sm font-medium text-theme-text-primary truncate flex-1">
              {note.title}
            </h3>
          </div>
          
        </div>
        
        {/* Preview text */}
        <p className="text-sm text-theme-text-secondary line-clamp-2 mb-2 overflow-hidden">
          {getPreviewText(note.content)}
        </p>
        
        {/* Task progress */}
        <div className="mb-2">
          {/* <TaskProgress content={note.content} size="xs" /> */}
        </div>
        
        {/* Footer with tags and date */}
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
                    onClick={() => handleTagClick(tag)}
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
          
          {/* Updated date */}
          <span className="text-theme-text-muted flex-shrink-0">
            {formatDate(note.updatedAt)}
          </span>
        </div>
      </div>
      </div>
    </NoteActionsDropdown>
  )
})

NoteListItem.displayName = 'NoteListItem'

export default NoteListItem