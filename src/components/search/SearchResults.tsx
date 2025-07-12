/**
 * Search results container component
 */
import { forwardRef } from 'react'
import SearchResultItem from './SearchResultItem'
import SearchHistory from './SearchHistory'
import { formatKeyboardShortcut } from '../../utils/searchUtils'

const SearchResults = forwardRef(({
  results = [],
  searchHistory = [],
  searchTerm = '',
  selectedIndex = -1,
  isOpen = false,
  showHistory = true,
  onSelectResult,
  onSelectHistory,
  onPinNote,
  onDeleteNote,
  onMoveNote,
}, ref) => {
  if (!isOpen) return null

  const hasResults = results.length > 0
  const hasHistory = searchHistory.length > 0 && showHistory
  const showHistorySection = !searchTerm.trim() && hasHistory

  return (
    <div ref={ref} className="search-results-container">
      {hasResults && (
        <div className="search-results-section">
          <div className="search-results-header">
            <span className="search-results-title">
              Search Results ({results.length})
            </span>
            <div className="search-results-shortcuts">
              <span className="search-shortcut">
                {formatKeyboardShortcut(['up', 'down'])} navigate
              </span>
              <span className="search-shortcut">
                {formatKeyboardShortcut(['enter'])} select
              </span>
              <span className="search-shortcut">
                {formatKeyboardShortcut(['escape'])} close
              </span>
            </div>
          </div>
          
          <div className="search-results-list">
            {results.map((note, index) => (
              <SearchResultItem
                key={note.id}
                note={note}
                searchTerm={searchTerm}
                isSelected={selectedIndex === index}
                index={index}
                onClick={onSelectResult}
                onPinNote={onPinNote}
                onDeleteNote={onDeleteNote}
                onMoveNote={onMoveNote}
              />
            ))}
          </div>
        </div>
      )}

      {showHistorySection && (
        <SearchHistory
          history={searchHistory}
          selectedIndex={hasResults ? -1 : selectedIndex - results.length}
          startIndex={results.length}
          onSelectHistory={onSelectHistory}
        />
      )}

      {!hasResults && !showHistorySection && searchTerm.trim() && (
        <div className="search-no-results">
          <div className="search-no-results-content">
            <div className="search-no-results-icon">
              🔍
            </div>
            <div className="search-no-results-text">
              <div className="search-no-results-title">
                No notes found
              </div>
              <div className="search-no-results-subtitle">
                Try different keywords or check your spelling
              </div>
            </div>
          </div>
        </div>
      )}

      {!hasResults && !showHistorySection && !searchTerm.trim() && (
        <div className="search-empty-state">
          <div className="search-empty-state-content">
            <div className="search-empty-state-icon">
              ⌨️
            </div>
            <div className="search-empty-state-text">
              <div className="search-empty-state-title">
                Start typing to search
              </div>
              <div className="search-empty-state-subtitle">
                Search through your notes, titles, and tags
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
})

SearchResults.displayName = 'SearchResults'

export default SearchResults
