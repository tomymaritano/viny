/**
 * Search history component
 */
import Icons from '../Icons'
import { DropdownHeader } from '../ui/DropdownMenu'

const SearchHistory = ({
  history = [],
  selectedIndex = -1,
  startIndex = 0,
  onSelectHistory,
  onClearHistory,
}) => {
  if (history.length === 0) return null

  const handleSelectHistory = (historyItem) => {
    onSelectHistory?.(historyItem)
  }

  const handleClearHistory = () => {
    onClearHistory?.()
  }

  return (
    <div className="search-history-section">
      <div className="search-history-header">
        <DropdownHeader>
          <div className="search-history-title">
            <Icons.Clock />
            Recent Searches
          </div>
          {onClearHistory && (
            <button
              onClick={handleClearHistory}
              className="search-history-clear"
              title="Clear search history"
            >
              <Icons.X />
            </button>
          )}
        </DropdownHeader>
      </div>
      
      <div className="search-history-list">
        {history.map((historyItem, index) => {
          const globalIndex = startIndex + index
          const isSelected = selectedIndex === index
          
          return (
            <div
              key={index}
              data-result-index={globalIndex}
              className={`search-history-item ${isSelected ? 'selected' : ''}`}
              onClick={() => handleSelectHistory(historyItem)}
            >
              <div className="search-history-icon">
                <Icons.Search />
              </div>
              <div className="search-history-text">
                {historyItem}
              </div>
              <div className="search-history-action">
                <Icons.ArrowUpRight />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default SearchHistory