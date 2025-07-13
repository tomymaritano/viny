import React, { useEffect } from 'react'
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
  onOpenSearch: () => void
}

const NotesHeader: React.FC<NotesHeaderProps> = ({
  title,
  notesCount,
  currentSortBy,
  currentSortDirection,
  onSort,
  onNewNote,
  searchTerm,
  onSearchChange,
  onOpenSearch
}) => {
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K to open search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        onOpenSearch()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onOpenSearch])

  return (
    <div className="flex flex-col border-b border-theme-border-primary flex-shrink-0">
      {/* First row: Sort, Title, and New Note */}
      <div className="flex items-center justify-between p-2">
        {/* Left: Sort dropdown */}
        <div className="flex items-center">
          <SortDropdown
            currentSortBy={currentSortBy}
            currentSortDirection={currentSortDirection}
            onSort={onSort}
          />
        </div>

        {/* Center: Title */}
        <div className="flex-1 flex justify-center px-4">
          <h2 className="text-lg font-semibold text-theme-text-primary m-0 truncate">
            {title} ({notesCount})
          </h2>
        </div>

        {/* Right: New Note button */}
        <div className="flex items-center">
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
            placeholder="Search notes... (Cmd+K)"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={onOpenSearch}
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