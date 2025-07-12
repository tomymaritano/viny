import React, { useState, useRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import Icons from '../../Icons'
import TagContextMenu from '../../ui/TagContextMenu'
import TagEditInput from '../../ui/TagEditInput'
import DropdownMenu, { DropdownMenuItem } from '../../ui/DropdownMenu'
import CustomTag from '../../ui/CustomTag'
import TagColorPicker from '../../ui/TagColorPicker'
import TagSettingsModal from './TagSettingsModal'
import { useAppStore } from '../../../stores/newSimpleStore'
import { useTagEdit } from '../../../hooks/useTagEdit'
import { addTag, removeTag } from '../../../utils/tagValidation'
import { Z_INDEX, THEME_COLORS } from '../../../constants/theme'

const TagManager = ({
  tags = [],
  availableTags = [],
  onTagsChange,
  disabled = false,
  placeholder = 'Add tags...',
}) => {
  const [inputValue, setInputValue] = useState('')
  const [isInputVisible, setIsInputVisible] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1)
  const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0, tag: null, index: null })
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [tagSettingsModal, setTagSettingsModal] = useState({ show: false, tagName: '' })
  const inputRef = useRef(null)
  const { setTagColor } = useAppStore()

  // Use the custom tag editing hook
  const {
    editingTag,
    editValue,
    editInputRef,
    handleEditTag,
    handleSaveEdit,
    handleCancelEdit,
    handleEditKeyDown,
    setEditValue,
    isEditing,
  } = useTagEdit(tags, onTagsChange)

  // Filter suggestions based on input
  useEffect(() => {
    if (inputValue.trim()) {
      const filtered = availableTags
        .filter(
          tag =>
            tag.toLowerCase().includes(inputValue.toLowerCase()) &&
            !tags.map(t => t.toLowerCase()).includes(tag.toLowerCase())
        )
        .slice(0, 5) // Limit to 5 suggestions
      setSuggestions(filtered)
      setSelectedSuggestionIndex(-1)
    } else {
      setSuggestions([])
      setSelectedSuggestionIndex(-1)
    }
  }, [inputValue, availableTags, tags])

  // Focus input when visible
  useEffect(() => {
    if (isInputVisible && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isInputVisible])

  const handleAddTag = tagName => {
    const updatedTags = addTag(tagName, tags)
    if (updatedTags !== tags) {
      onTagsChange(updatedTags)
    }
    setInputValue('')
    setIsInputVisible(false)
    setSuggestions([])
  }

  const handleRemoveTag = tagIndex => {
    const updatedTags = removeTag(tagIndex, tags)
    onTagsChange(updatedTags)
    setContextMenu({ show: false, x: 0, y: 0, tag: null, index: null })
  }

  const handleKeyDown = e => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (
        selectedSuggestionIndex >= 0 &&
        suggestions[selectedSuggestionIndex]
      ) {
        handleAddTag(suggestions[selectedSuggestionIndex])
      } else if (inputValue.trim()) {
        handleAddTag(inputValue)
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedSuggestionIndex(prev =>
        Math.min(prev + 1, suggestions.length - 1)
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedSuggestionIndex(prev => Math.max(prev - 1, -1))
    } else if (e.key === 'Escape') {
      setInputValue('')
      setIsInputVisible(false)
      setSuggestions([])
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      // Remove last tag if input is empty
      handleRemoveTag(tags[tags.length - 1])
    }
  }

  // Handle tag right-click context menu
  const handleTagRightClick = (e, tag, index) => {
    e.preventDefault()
    setContextMenu({
      show: true,
      x: e.clientX,
      y: e.clientY,
      tag,
      index,
    })
  }

  // Close context menu when clicking elsewhere
  useEffect(() => {
    const handleClickOutside = () => {
      setContextMenu({ show: false, x: 0, y: 0, tag: null, index: null })
      setShowColorPicker(false)
    }

    if (contextMenu.show) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [contextMenu.show])

  // Context menu handlers
  const handleContextEdit = () => {
    if (contextMenu.tag && contextMenu.index !== null) {
      handleEditTag(contextMenu.index, contextMenu.tag)
      setContextMenu({ show: false, x: 0, y: 0, tag: null, index: null })
    }
  }

  const handleToggleColorPicker = () => {
    setShowColorPicker(!showColorPicker)
  }

  const handleSelectColor = colorClass => {
    if (contextMenu.tag) {
      setTagColor(contextMenu.tag, colorClass)
    }
    setShowColorPicker(false)
    setContextMenu({ show: false, x: 0, y: 0, tag: null, index: null })
  }

  const handleContextRemove = () => {
    if (contextMenu.index !== null) {
      handleRemoveTag(contextMenu.index)
    }
  }

  const handleTagSettings = () => {
    setTagSettingsModal({ show: true, tagName: contextMenu.tag })
    setContextMenu({ show: false, x: 0, y: 0, tag: null, index: null })
  }

  const handleTagNameChange = (oldName, newName) => {
    if (oldName !== newName && contextMenu.index !== null) {
      const updatedTags = [...tags]
      updatedTags[contextMenu.index] = newName
      onTagsChange(updatedTags)
    }
  }

  return (
    <div className="relative">
      <div className="flex flex-wrap items-center gap-1 p-2 min-h-[36px] border border-theme-border-primary rounded-md bg-theme-bg-secondary">
        {/* Existing Tags */}
        {tags.map((tag, index) => (
          <div key={`${tag}-${index}`} className="relative">
            {isEditing(index) ? (
              <div className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md border transition-colors ${THEME_COLORS.RING_FOCUS}`}>
                <TagEditInput
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={handleEditKeyDown}
                  onBlur={handleSaveEdit}
                  inputRef={editInputRef}
                  className="min-w-[40px] max-w-[100px]"
                />
              </div>
            ) : (
              <div
                onContextMenu={e => handleTagRightClick(e, tag, index)}
                title="Right-click for options"
              >
                <CustomTag
                  tagName={tag}
                  size="sm"
                  removable={!disabled}
                  onRemove={() => handleRemoveTag(index)}
                  onClick={(e) => {
                    if (e && e.detail === 2) { // Double click to edit
                      handleEditTag(index, tag)
                    }
                  }}
                  className="cursor-pointer"
                />
              </div>
            )}
          </div>
        ))}

        {/* Input or Add Button */}
        {!disabled && (
          <>
            {isInputVisible ? (
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={() => {
                  // Delay hiding to allow clicking suggestions
                  setTimeout(() => {
                    if (inputValue.trim()) {
                      handleAddTag(inputValue)
                    }
                    setIsInputVisible(false)
                  }, 200)
                }}
                placeholder={placeholder}
                className="outline-none bg-transparent text-sm text-theme-text-primary placeholder-theme-text-muted min-w-[120px] max-w-[200px]"
              />
            ) : (
              <button
                type="button"
                onClick={() => setIsInputVisible(true)}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs text-theme-text-muted hover:text-theme-text-secondary border border-dashed border-theme-border-primary hover:border-theme-border-secondary rounded-md transition-colors"
              >
                <Icons.Plus size={12} />
                Add tag
              </button>
            )}
          </>
        )}
      </div>

      {/* Suggestions Dropdown */}
      <DropdownMenu
        isOpen={suggestions.length > 0 && isInputVisible}
        width="w-full"
        maxHeight="max-h-32"
      >
        {suggestions.map((suggestion, index) => (
          <DropdownMenuItem
            key={suggestion}
            onClick={() => handleAddTag(suggestion)}
            selected={index === selectedSuggestionIndex}
          >
            #{suggestion}
          </DropdownMenuItem>
        ))}
      </DropdownMenu>

      {/* Tag Context Menu */}
      <TagContextMenu
        isVisible={contextMenu.show}
        position={{ x: contextMenu.x, y: contextMenu.y }}
        tagName={contextMenu.tag || ''}
        onRemove={handleContextRemove}
        onClose={() => setContextMenu({ show: false, x: 0, y: 0, tag: null, index: null })}
        onTagSettings={handleTagSettings}
      />
    </div>
  )
}

TagManager.propTypes = {
  tags: PropTypes.arrayOf(PropTypes.string),
  availableTags: PropTypes.arrayOf(PropTypes.string),
  onTagsChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  placeholder: PropTypes.string,
}

export default TagManager
