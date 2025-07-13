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
}

const NotesHeader: React.FC<NotesHeaderProps> = ({
  title,
  notesCount,
  currentSortBy,
  currentSortDirection,
  onSort,
  onNewNote
}) => {
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