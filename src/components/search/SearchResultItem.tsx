import React from 'react'
import type { Note } from '../../types'
import { formatDate } from '../../utils/dateUtils'
import { Icons } from '../Icons'

interface SearchResultItemProps {
  note: Note
  isSelected: boolean
  highlightMatches: (text: string, matches?: any[]) => string
  onSelect: (noteId: string) => void
}

const SearchResultItem: React.FC<SearchResultItemProps> = ({
  note,
  isSelected,
  highlightMatches,
  onSelect,
}) => {
  return (
    <div
      className={`p-4 cursor-pointer rounded-lg border-l-2 transition-all duration-150 ${
        isSelected
          ? 'bg-theme-bg-tertiary border-theme-accent-primary'
          : 'hover:bg-theme-bg-secondary border-transparent'
      }`}
      onClick={() => onSelect(note.id)}
      data-testid="search-result-item"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3
            className="text-sm font-medium text-theme-text-primary truncate mb-1"
            dangerouslySetInnerHTML={{
              __html: highlightMatches(note.title),
            }}
          />

          <div className="text-xs text-theme-text-muted mb-2 space-y-1">
            <div className="flex items-center gap-2">
              <span>{formatDate(note.updatedAt)}</span>
              {note.notebook && (
                <>
                  <span>•</span>
                  <span>{note.notebook}</span>
                </>
              )}
            </div>

            {note.isPinned && (
              <div className="flex items-center gap-1">
                <Icons.Star size={12} className="text-theme-accent-primary" />
                <span>Pinned</span>
              </div>
            )}
          </div>

          {note.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {note.tags.slice(0, 3).map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-theme-bg-tertiary text-theme-text-secondary"
                >
                  #{tag}
                </span>
              ))}
              {note.tags.length > 3 && (
                <span className="text-xs text-theme-text-muted">
                  +{note.tags.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SearchResultItem
