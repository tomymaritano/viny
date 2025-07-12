import React, { memo } from 'react'
import { Note } from '../../../types'
import Icons from '../../Icons'
import IconButton from '../../ui/IconButton'
import CustomTag from '../../ui/CustomTag'
import TaskProgress from '../../ui/TaskProgress'
import { STATUS_BG_COLORS, THEME_CLASSES } from '../../../theme/themeConstants'

interface NoteListItemProps {
  note: Note
  isSelected: boolean
  onNoteClick: (noteId: string) => void
  onPinToggle: (e: React.MouseEvent, note: Note) => void
  onDelete: (e: React.MouseEvent, note: Note) => void
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
  formatDate,
  getPreviewText,
  onTagClick
}) => {
  const handleClick = () => {
    onNoteClick(note.id)
  }

  const handlePinClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onPinToggle(e, note)
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete(e, note)
  }

  const handleTagClick = (tag: string) => {
    if (onTagClick) {
      onTagClick(tag)
    }
  }

  return (
    <div
      className={`group relative ${THEME_CLASSES.BORDER.PRIMARY} border-b hover:${THEME_CLASSES.BG.TERTIARY} transition-colors cursor-pointer overflow-hidden ${
        isSelected ? THEME_CLASSES.BG.ACTIVE : ''
      }`}
      onClick={handleClick}
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
            
            {/* Note title */}
            <h3 className="text-sm font-medium text-theme-text-primary truncate flex-1">
              {note.title}
            </h3>
          </div>
          
          {/* Action buttons */}
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <IconButton
              icon={Icons.Star}
              onClick={handlePinClick}
              isActive={note.isPinned}
              title={note.isPinned ? "Unpin note" : "Pin to top"}
              size={16}
              variant="default"
            />
            <IconButton
              icon={Icons.Trash}
              onClick={handleDeleteClick}
              title="Delete note"
              size={16}
              variant="default"
            />
          </div>
        </div>
        
        {/* Preview text */}
        <p className="text-sm text-theme-text-secondary line-clamp-2 mb-2 overflow-hidden">
          {getPreviewText(note.content)}
        </p>
        
        {/* Task progress */}
        <div className="mb-2">
          <TaskProgress content={note.content} size="xs" />
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
  )
})

NoteListItem.displayName = 'NoteListItem'

export default NoteListItem