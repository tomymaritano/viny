import React, { forwardRef } from 'react'
import { Icons } from '../Icons'
import IconButton from '../ui/IconButton'

interface SearchInputProps {
  query: string
  onQueryChange: (query: string) => void
  onClear: () => void
  placeholder?: string
}

const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  (
    { query, onQueryChange, onClear, placeholder = 'Search notes...' },
    ref
  ) => {
    return (
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <Icons.Search size={14} className="text-theme-text-muted opacity-50" />
        </div>
        <input
          ref={ref}
          type="text"
          value={query}
          onChange={e => onQueryChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-9 pr-9 py-1.5 bg-transparent border-0 text-theme-text-primary placeholder-theme-text-muted focus:outline-none text-sm"
          autoComplete="off"
          spellCheck="false"
          data-testid="search-input"
        />
        {query && (
          <button
            onClick={onClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-theme-text-muted hover:text-theme-text-primary p-0.5"
            aria-label="Clear search"
          >
            <Icons.X size={14} />
          </button>
        )}
      </div>
    )
  }
)

SearchInput.displayName = 'SearchInput'

export default SearchInput
