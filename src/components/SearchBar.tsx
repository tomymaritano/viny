/**
 * Refactored SearchBar component with modular architecture
 */
import React, { useEffect } from 'react'
import { useSearchBar } from '../hooks/useSearchBar'
import SearchInput from './search/SearchInput'
import SearchResults from './search/SearchResults'

interface Note {
  id: string
  title: string
  content: string
  lastModified?: string
  isPinned?: boolean
  tags?: string[]
  notebook?: string
}

interface SearchBarProps {
  notes?: Note[]
  onSelectResult?: (note: Note) => void
  placeholder?: string
  showResults?: boolean
  showHistory?: boolean
  autoFocus?: boolean
  className?: string
  onQueryChange?: ((query: string) => void) | null
  onPinNote?: ((note: Note) => void) | null
  onDeleteNote?: ((note: Note) => void) | null
  onMoveNote?: ((note: Note) => void) | null
}

const SearchBar: React.FC<SearchBarProps> = ({
  notes = [],
  onSelectResult = () => {},
  placeholder = 'Search notes...',
  showResults = true,
  showHistory = true,
  autoFocus = false,
  className = '',
  onQueryChange = null,
  onPinNote = null,
  onDeleteNote = null,
  onMoveNote = null,
}) => {
  const {
    // Search state
    query,
    results,
    isSearching,
    searchHistory,
    isOpen,
    
    // Navigation state
    selectedIndex,
    selectableItems,
    resultsRef,
    
    // Search actions
    search,
    clearSearch,
    
    // Navigation actions
    navigateNext,
    navigatePrevious,
    navigateToFirst,
    navigateToLast,
    selectCurrentItem,
    
    // Input handlers
    handleInputChange,
    handleInputFocus,
    handleInputBlur,
    
    // UI actions
    closeDropdown,
    
    // Item selection
    handleSelectItem,
  } = useSearchBar(notes)

  // External query change handler
  useEffect(() => {
    if (onQueryChange) {
      onQueryChange(query)
    }
  }, [query, onQueryChange])

  // Keyboard navigation handler
  const handleKeyDown = (e) => {
    if (!isOpen) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        navigateNext()
        break

      case 'ArrowUp':
        e.preventDefault()
        navigatePrevious()
        break

      case 'Enter':
        e.preventDefault()
        const selectedItem = selectCurrentItem()
        if (selectedItem) {
          if (selectedItem.type === 'result') {
            onSelectResult(selectedItem.data)
            closeDropdown()
          } else if (selectedItem.type === 'history') {
            // History selection is handled in the hook
          }
        } else if (query.trim()) {
          // If no item selected but have query, search and select first result
          search(query)
          if (results.length > 0) {
            const firstResult = results[0]
            onSelectResult(firstResult)
            closeDropdown()
          }
        }
        break

      case 'Tab':
        e.preventDefault()
        navigateNext()
        break

      case 'Escape':
        e.preventDefault()
        if (selectedIndex >= 0) {
          // Clear selection first
          navigateToFirst()
        } else if (query) {
          // Clear search
          clearSearch()
        } else {
          // Close dropdown and blur
          closeDropdown()
          e.target.blur()
        }
        break

      case 'Home':
        e.preventDefault()
        navigateToFirst()
        break

      case 'End':
        e.preventDefault()
        navigateToLast()
        break

      default:
        break
    }
  }

  // Handle result selection
  const handleResultSelect = (note) => {
    onSelectResult(note)
    closeDropdown()
  }

  // Handle history selection
  const handleHistorySelect = (historyItem) => {
    // The hook handles setting query and searching
    // No need to close dropdown as user might want to see results
  }

  // Handle input change
  const handleInputChangeWrapper = (value) => {
    handleInputChange(value)
  }

  return (
    <div className={`search-bar ${className}`}>
      <SearchInput
        query={query}
        placeholder={placeholder}
        autoFocus={autoFocus}
        isSearching={isSearching}
        onChange={handleInputChangeWrapper}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        onKeyDown={handleKeyDown}
        onClear={clearSearch}
      />

      {showResults && (
        <SearchResults
          ref={resultsRef}
          results={results}
          searchHistory={searchHistory}
          searchTerm={query}
          selectedIndex={selectedIndex}
          isOpen={isOpen}
          showHistory={showHistory}
          onSelectResult={handleResultSelect}
          onSelectHistory={handleHistorySelect}
          onPinNote={onPinNote}
          onDeleteNote={onDeleteNote}
          onMoveNote={onMoveNote}
        />
      )}
    </div>
  )
}

export default SearchBar
