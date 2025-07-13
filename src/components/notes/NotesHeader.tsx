import React from 'react'
import Icons from '../Icons'
import IconButton from '../ui/IconButton'
import SortDropdown from '../ui/SortDropdown'

type SortField = 'title' | 'date' | 'updated' | 'notebook'
type SortDirection = 'asc' | 'desc'

interface NotesHeaderProps {
  title: string
  notesCount: number
  currentSortBy: SortField
  currentSortDirection: SortDirection
  onSort: (field: SortField, direction: SortDirection) => void
  onNewNote: () => void
  searchTerm: string
  onSearchChange: (term: string) => void
}

const NotesHeader: React.FC<NotesHeaderProps> = ({
  title,
  notesCount,
  currentSortBy,
  currentSortDirection,
  onSort,
  onNewNote,
  searchTerm,
  onSearchChange
}) => {
  return (
    <div className="flex flex-col border-b border-theme-border-primary flex-shrink-0">
      {/* First row: Sort and New Note */}
      <div className="relative flex items-center justify-between p-2">
        {/* Sort dropdown */}
        <SortDropdown
          currentSortBy={currentSortBy}
          currentSortDirection={currentSortDirection}
          onSort={onSort}
        />

        {/* Centered title */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <h2 className="text-lg font-semibold text-theme-text-primary m-0">
            {title} ({notesCount})
          </h2>
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-1">
          <IconButton
            icon={Icons.NotebookPen}
            onClick={onNewNote}
            title="Create new note"
            size={16}
            variant="default"
            aria-label="Create new note"
            aria-pressed={false}
            aria-keyshortcuts=""
          />
        </div>
      </div>

      {/* Second row: Search */}
      <div className="px-2 pb-2">
        <div className="relative">
          <Icons.Search 
            size={16} 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-text-muted" 
          />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-theme-bg-tertiary border border-theme-border-secondary 
              rounded-md text-sm text-theme-text-primary placeholder-theme-text-muted
              focus:outline-none focus:ring-2 focus:ring-theme-accent-primary focus:border-transparent"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-theme-text-muted hover:text-theme-text-primary"
            >
              <Icons.X size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default NotesHeader