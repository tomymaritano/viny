/**
 * NoteTags - Tag display component for notes
 * Extracted from NotesListSimple.tsx
 */

import React from 'react'
import CustomTag from '../../ui/CustomTag'

interface NoteTagsProps {
  tags: string[]
  maxVisible?: number
  onTagClick?: (tag: string) => void
}

const NoteTags: React.FC<NoteTagsProps> = ({ 
  tags, 
  maxVisible = 2, 
  onTagClick 
}) => {
  if (!tags || tags.length === 0) {
    return null
  }

  const visibleTags = tags.slice(0, maxVisible)
  const remainingCount = tags.length - maxVisible

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {visibleTags.map((tag, index) => (
        <CustomTag
          key={index}
          tagName={tag}
          size="xs"
          onClick={onTagClick ? () => onTagClick(tag) : undefined}
          className={onTagClick ? 'cursor-pointer hover:scale-105 transition-transform' : ''}
        />
      ))}
      
      {remainingCount > 0 && (
        <span className="text-xs text-theme-text-muted bg-theme-bg-tertiary/50 px-1.5 py-0.5 rounded">
          +{remainingCount}
        </span>
      )}
    </div>
  )
}

export default NoteTags
