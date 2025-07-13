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
  onOpenSearch: () => void
}

const NotesHeader: React.FC<NotesHeaderProps> = ({
  title,
  notesCount,
  currentSortBy,
  currentSortDirection,
  onSort,
  onNewNote,
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
    <div className="relative flex items-center justify-between p-2 border-b border-theme-border-primary flex-shrink-0">
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
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-theme-text-muted hover:text-theme-text-primary
            bg-theme-bg-tertiary hover:bg-theme-bg-secondary border border-theme-border-secondary rounded-md
            transition-colors duration-150"
          title="Search notes (Cmd+K)"
        >
          <Icons.Search size={14} />
          <span className="hidden sm:inline">Search</span>
          <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-theme-bg-primary px-1.5 font-mono text-[10px] font-medium text-theme-text-muted opacity-100">
            <span className="text-xs">⌘</span>K
          </kbd>
        </button>
        
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
  )
}

export default NotesHeader