import React, { forwardRef } from 'react'
import Icons from '../Icons'
import IconButton from '../ui/IconButton'

interface SearchInputProps {
  query: string
  onQueryChange: (query: string) => void
  onClear: () => void
  onClose: () => void
  placeholder?: string
}

const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(({
  query,
  onQueryChange,
  onClear,
  onClose,
  placeholder = "Search notes..."
}, ref) => {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          <Icons.Search size={16} className="text-theme-text-muted" />
        </div>
        <input
          ref={ref}
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2.5 bg-transparent border-0 text-theme-text-primary placeholder-theme-text-muted focus:outline-none focus:ring-0"
          autoComplete="off"
          spellCheck="false"
        />
        {query && (
          <button
            onClick={onClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-theme-text-muted hover:text-theme-text-primary transition-colors"
          >
            <Icons.X size={16} />
          </button>
        )}
      </div>
      
      <IconButton
        icon={Icons.X}
        onClick={onClose}
        title="Close search"
        size={16}
        variant="default"
        aria-label="Close search modal"
      />
    </div>
  )
})

SearchInput.displayName = 'SearchInput'

export default SearchInput