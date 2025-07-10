import React, { useState, useRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import Icons from '../../Icons'

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
  const inputRef = useRef(null)

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
    const newTag = tagName.trim()
    // Case-insensitive duplicate check
    if (
      newTag &&
      !tags.map(t => t.toLowerCase()).includes(newTag.toLowerCase())
    ) {
      const updatedTags = [...tags, newTag]
      onTagsChange(updatedTags)
    }
    setInputValue('')
    setIsInputVisible(false)
    setSuggestions([])
  }

  const handleRemoveTag = tagToRemove => {
    onTagsChange(tags.filter(tag => tag !== tagToRemove))
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

  const getTagColor = tag => {
    // Simple color assignment based on tag hash
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800',
      'bg-yellow-100 text-yellow-800',
      'bg-red-100 text-red-800',
      'bg-purple-100 text-purple-800',
      'bg-pink-100 text-pink-800',
      'bg-indigo-100 text-indigo-800',
      'bg-gray-100 text-gray-800',
    ]

    let hash = 0
    for (let i = 0; i < tag.length; i++) {
      hash = tag.charCodeAt(i) + ((hash << 5) - hash)
    }
    return colors[Math.abs(hash) % colors.length]
  }

  return (
    <div className="relative">
      <div className="flex flex-wrap items-center gap-1 p-2 min-h-[36px] border border-theme-border-primary rounded-md bg-theme-bg-secondary">
        {/* Existing Tags */}
        {tags.map(tag => (
          <span
            key={tag}
            className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md ${getTagColor(tag)} transition-colors`}
          >
            #{tag}
            {!disabled && (
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="hover:bg-black hover:bg-opacity-10 rounded-full p-0.5 transition-colors"
                title={`Remove ${tag} tag`}
              >
                <Icons.X size={12} />
              </button>
            )}
          </span>
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
      {suggestions.length > 0 && isInputVisible && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-theme-bg-primary border border-theme-border-primary rounded-md shadow-lg z-50 max-h-32 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => handleAddTag(suggestion)}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-theme-bg-tertiary transition-colors ${
                index === selectedSuggestionIndex ? 'bg-theme-bg-tertiary' : ''
              }`}
            >
              #{suggestion}
            </button>
          ))}
        </div>
      )}
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
