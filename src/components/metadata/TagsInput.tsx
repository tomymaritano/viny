import React from 'react'
import Icons from '../Icons'
import CustomTag from '../ui/CustomTag'
import TagEditInput from '../ui/TagEditInput'
import { THEME_COLORS } from '../../constants/theme'

interface TagsInputProps {
  tags?: string[]
  tagInput: string
  showTagSuggestions: boolean
  selectedSuggestionIndex: number
  tagSuggestions: string[]
  isEditing: (index: number) => boolean
  editValue: string
  editInputRef: React.RefObject<HTMLInputElement>
  onTagInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onTagsInput: (e: React.KeyboardEvent<HTMLInputElement>) => void
  onTagRightClick: (e: React.MouseEvent, tag: string, index: number) => void
  onEditValueChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onEditKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
  onEditSave: () => void
  onAddTagFromInput: (tag: string) => void
  formatDate: (dateString: string) => string
  updatedAt?: string
}

const TagsInput: React.FC<TagsInputProps> = ({
  tags,
  tagInput,
  showTagSuggestions,
  selectedSuggestionIndex,
  tagSuggestions,
  isEditing,
  editValue,
  editInputRef,
  onTagInputChange,
  onTagsInput,
  onTagRightClick,
  onEditValueChange,
  onEditKeyDown,
  onEditSave,
  onAddTagFromInput,
  formatDate,
  updatedAt
}) => {
  return (
    <div className="flex items-center gap-1 flex-1 min-w-0">
      <Icons.Tag size={10} className="text-theme-accent-secondary flex-shrink-0" />
      
      {/* Existing tags - smaller */}
      {tags && tags.length > 0 && tags.slice(0, 3).map((tag: string, index: number) => (
        <div key={`${tag}-${index}`} className="relative">
          {isEditing(index) ? (
            <div className={`inline-flex items-center px-1.5 py-0.5 text-xs rounded border ${THEME_COLORS.RING_FOCUS}`}>
              <TagEditInput
                value={editValue}
                onChange={onEditValueChange}
                onKeyDown={onEditKeyDown}
                onBlur={onEditSave}
                inputRef={editInputRef}
                className="min-w-[30px] max-w-[60px] text-xs"
              />
            </div>
          ) : (
            <div
              onContextMenu={e => onTagRightClick(e, tag, index)}
              title="Right-click for options, double-click to edit"
            >
              <CustomTag
                tagName={tag}
                size="xs"
                onClick={() => {
                  // Single click - could add functionality here if needed
                }}
                className="cursor-pointer hover:scale-105 transition-transform text-xs"
              />
            </div>
          )}
        </div>
      ))}
      
      {/* Show "+N more" if there are more than 3 tags */}
      {tags && tags.length > 3 && (
        <span className="text-xs text-theme-text-muted px-1 py-0.5 bg-theme-bg-tertiary/30 rounded">
          +{tags.length - 3}
        </span>
      )}
      
      {/* Tag input - minimal */}
      <div className="relative flex-1 min-w-16">
        <input
          type="text"
          value={tagInput}
          onChange={onTagInputChange}
          placeholder="Add tag..."
          onKeyDown={onTagsInput}
          className="w-full bg-transparent text-xs text-theme-text-secondary border-none outline-none placeholder-theme-text-muted/50"
        />
        
        {/* Tag suggestions dropdown */}
        {showTagSuggestions && tagSuggestions.length > 0 && (
          <div className="absolute top-full left-0 z-50 mt-1 bg-theme-bg-secondary border border-theme-border-primary rounded-md shadow-lg py-1 min-w-40 max-h-28 overflow-y-auto">
            {tagSuggestions.map((suggestion: string, index: number) => (
              <button
                key={suggestion}
                onClick={() => onAddTagFromInput(suggestion)}
                className={`w-full text-left px-2 py-1 text-xs transition-colors ${
                  index === selectedSuggestionIndex
                    ? 'bg-theme-accent-primary/10 text-theme-accent-primary'
                    : 'text-theme-text-secondary hover:bg-theme-bg-tertiary hover:text-theme-text-primary'
                }`}
              >
                #{suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Date info - ultra compact */}
      <div className="flex items-center gap-2 text-xs text-theme-text-muted flex-shrink-0">
        {updatedAt && (
          <div className="flex items-center gap-1" title={`Updated: ${formatDate(updatedAt)}`}>
            <Icons.Clock size={9} className="text-theme-accent-cyan" />
            <span className="hidden sm:inline">{formatDate(updatedAt)}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default TagsInput