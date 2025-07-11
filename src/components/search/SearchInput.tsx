/**
 * Search input component with keyboard navigation
 */
import { useRef, useEffect } from 'react'
import Icons from '../Icons'

const SearchInput = ({
  query,
  placeholder = 'Search notes...',
  autoFocus = false,
  isSearching = false,
  onChange,
  onFocus,
  onBlur,
  onKeyDown,
  onClear,
  className = '',
}) => {
  const inputRef = useRef(null)

  // Focus input when autoFocus is true
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
    }
  }, [autoFocus])

  const handleInputChange = (e) => {
    onChange?.(e.target.value)
  }

  const handleClear = () => {
    onClear?.()
    inputRef.current?.focus()
  }

  return (
    <div className={`search-input-container ${className}`}>
      <div className="search-input-wrapper">
        <Icons.Search className="search-input-icon" />
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          placeholder={placeholder}
          onChange={handleInputChange}
          onFocus={onFocus}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
          className="search-input"
          autoComplete="off"
          spellCheck="false"
        />
        
        {isSearching && (
          <div className="search-loading">
            <Icons.Search className="search-loading-icon animate-spin" />
          </div>
        )}
        
        {query && !isSearching && (
          <button
            type="button"
            onClick={handleClear}
            className="search-clear-button"
            aria-label="Clear search"
          >
            <Icons.X />
          </button>
        )}
      </div>
    </div>
  )
}

export default SearchInput