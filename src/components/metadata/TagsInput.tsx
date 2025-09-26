import React, { useState, useRef, useEffect, useTransition } from 'react'
import { Icons } from '../Icons'
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
  updatedAt,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isPending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)

  // Control popover visibility based on input and suggestions
  useEffect(() => {
    const shouldOpen = tagInput.trim().length > 0 && tagSuggestions.length > 0
    setIsOpen(shouldOpen)
    if (shouldOpen) {
      setSelectedIndex(0) // Reset selection when suggestions change
    }
  }, [tagInput, tagSuggestions.length])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Use transition for non-urgent updates to prevent blocking
    startTransition(() => {
      onTagInputChange(e)
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || tagSuggestions.length === 0) {
      onTagsInput(e)
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev =>
          prev < tagSuggestions.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev =>
          prev > 0 ? prev - 1 : tagSuggestions.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < tagSuggestions.length) {
          handleSuggestionSelect(tagSuggestions[selectedIndex])
        }
        break
      case 'Escape':
        e.preventDefault()
        setIsOpen(false)
        break
      default:
        onTagsInput(e)
    }
  }

  const handleSuggestionSelect = (suggestion: string) => {
    onAddTagFromInput(suggestion)
    setIsOpen(false)
    // Focus back to input for continued typing
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const handleBlur = (e: React.FocusEvent) => {
    // Only close if focus is moving outside the component
    if (!popoverRef.current?.contains(e.relatedTarget as Node)) {
      setIsOpen(false)
    }
  }
  return (
    <div className="flex items-center gap-1 flex-1 min-w-0">
      <Icons.Tag
        size={10}
        className="text-theme-accent-secondary flex-shrink-0"
      />

      {/* Existing tags - smaller */}
      {tags &&
        tags.length > 0 &&
        tags.slice(0, 3).map((tag: string, index: number) => (
          <div key={`${tag}-${index}`} className="relative">
            {isEditing(index) ? (
              <div
                className={`inline-flex items-center px-1.5 py-0.5 text-xs rounded border ${THEME_COLORS.RING_FOCUS}`}
              >
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

      {/* Tag input with combobox functionality */}
      <div className="relative flex-1 min-w-16">
        <input
          ref={inputRef}
          type="text"
          value={tagInput}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder="Add tag..."
          className="w-full bg-transparent text-xs text-theme-text-secondary border-none outline-none placeholder-theme-text-muted/50"
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          aria-describedby={isOpen ? 'tag-suggestions' : undefined}
        />

        {/* Suggestions popover */}
        {isOpen && (
          <div
            ref={popoverRef}
            className="absolute top-full left-0 mt-1 bg-theme-bg-primary border border-theme-border-primary rounded-md shadow-lg z-50 min-w-40 max-h-28 overflow-y-auto"
            role="listbox"
            id="tag-suggestions"
          >
            {tagSuggestions.map((suggestion: string, index: number) => (
              <button
                key={suggestion}
                onClick={() => handleSuggestionSelect(suggestion)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`w-full text-left px-2 py-1 text-xs rounded transition-colors block ${
                  index === selectedIndex
                    ? 'bg-theme-accent-primary/10 text-theme-accent-primary'
                    : 'text-theme-text-secondary hover:bg-theme-bg-tertiary hover:text-theme-text-primary'
                }`}
                role="option"
                aria-selected={index === selectedIndex}
                tabIndex={-1}
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
          <div
            className="flex items-center gap-1"
            title={`Updated: ${formatDate(updatedAt)}`}
          >
            <Icons.Clock size={9} className="text-theme-accent-cyan" />
            <span className="hidden sm:inline">{formatDate(updatedAt)}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default TagsInput
