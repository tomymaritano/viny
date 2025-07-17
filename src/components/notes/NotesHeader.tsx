import React, { useEffect, useRef } from 'react'
import { Icons } from '../Icons'
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
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K to focus search input
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

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
            size={14}
            variant="default"
            aria-label="Create new note"
            aria-pressed={false}
            aria-keyshortcuts=""
            className="p-1"
            data-testid="create-note-button"
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
            ref={searchInputRef}
            type="text"
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            data-testid="search-input"
            className="w-full pl-10 pr-16 py-2 bg-theme-bg-tertiary border border-theme-border-secondary 
              rounded-md text-sm text-theme-text-primary placeholder-theme-text-muted
              focus:outline-none focus:ring-2 focus:ring-theme-accent-primary focus:border-transparent"
          />
          
          {/* Right side: Clear button and Cmd+K indicator */}
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
            {searchTerm && (
              <button
                onClick={() => onSearchChange('')}
                className="text-theme-text-muted hover:text-theme-text-primary p-0.5"
                title="Clear search"
              >
                <Icons.X size={14} />
              </button>
            )}
            <kbd className="inline-flex h-5 select-none items-center gap-1 rounded border bg-theme-bg-primary px-1.5 font-mono text-[10px] font-medium text-theme-text-muted border-theme-border-secondary">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotesHeader