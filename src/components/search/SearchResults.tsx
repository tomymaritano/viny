import React from 'react'
import { Note } from '../../types'
import SearchResultItem from './SearchResultItem'
import Icons from '../Icons'

interface SearchResultsProps {
  results: Note[]
  selectedIndex: number
  highlightMatches: (text: string, matches?: any[]) => string
  onSelectNote: (noteId: string) => void
  hasQuery: boolean
  isSearching: boolean
}

const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  selectedIndex,
  highlightMatches,
  onSelectNote,
  hasQuery,
  isSearching
}) => {
  if (isSearching) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <Icons.Loader size={24} className="animate-spin text-theme-text-muted mx-auto mb-2" />
          <p className="text-sm text-theme-text-muted">Searching...</p>
        </div>
      </div>
    )
  }

  if (!hasQuery) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center max-w-sm">
          <Icons.Search size={32} className="text-theme-text-muted mx-auto mb-3 opacity-50" />
          <h3 className="text-lg font-medium text-theme-text-secondary mb-2">
            Search your notes
          </h3>
          <p className="text-sm text-theme-text-muted leading-relaxed">
            Start typing to search across titles, content, and tags. Use keywords to find exactly what you're looking for.
          </p>
        </div>
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center max-w-sm">
          <Icons.Search size={32} className="text-theme-text-muted mx-auto mb-3 opacity-50" />
          <h3 className="text-lg font-medium text-theme-text-secondary mb-2">
            No results found
          </h3>
          <p className="text-sm text-theme-text-muted leading-relaxed">
            Try adjusting your search terms or check for typos.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {results.map((note, index) => (
        <SearchResultItem
          key={note.id}
          note={note}
          isSelected={index === selectedIndex}
          highlightMatches={highlightMatches}
          onSelect={onSelectNote}
        />
      ))}
    </div>
  )
}

export default SearchResults