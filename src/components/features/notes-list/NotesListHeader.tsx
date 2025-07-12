/**
 * NotesListHeader - Header for notes list with title, sort, and actions
 * Extracted from NotesListSimple.tsx
 */

import React, { useState } from 'react'
import Icons from '../../Icons'
import IconButton from '../../ui/IconButton'
import DropdownMenu, { DropdownMenuItem } from '../../ui/DropdownMenu'

interface NotesListHeaderProps {
  title: string
  count: number
  sortBy: 'title' | 'date' | 'updated' | 'notebook'
  sortDirection: 'asc' | 'desc'
  onSort: (field: 'title' | 'date' | 'updated' | 'notebook') => void
  onSortDirectionToggle: () => void
  onNewNote: () => void
}

const NotesListHeader: React.FC<NotesListHeaderProps> = ({
  title,
  count,
  sortBy,
  sortDirection,
  onSort,
  onSortDirectionToggle,
  onNewNote
}) => {
  const [showSortMenu, setShowSortMenu] = useState(false)

  const sortOptions = [
    { id: 'updated', label: 'Last Updated', icon: 'Clock' },
    { id: 'title', label: 'Title', icon: 'Type' },
    { id: 'date', label: 'Created Date', icon: 'Calendar' },
    { id: 'notebook', label: 'Notebook', icon: 'Book' },
  ] as const

  const currentSortLabel = sortOptions.find(option => option.id === sortBy)?.label || 'Last Updated'

  return (
    <div className="flex items-center justify-between p-3 border-b border-theme-border-primary bg-theme-bg-secondary/30">
      {/* Left side: Title and count */}
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold text-theme-text-primary truncate">
          {title}
        </h2>
        <span className="text-sm text-theme-text-muted bg-theme-bg-tertiary px-2 py-0.5 rounded">
          {count}
        </span>
      </div>

      {/* Right side: Sort and actions */}
      <div className="flex items-center gap-1">
        {/* Sort dropdown */}
        <div className="relative">
          <IconButton
            icon={Icons.SortDesc}
            onClick={() => setShowSortMenu(!showSortMenu)}
            title={`Sort by ${currentSortLabel} (${sortDirection === 'asc' ? 'A-Z' : 'Z-A'})`}
            size={16}
            variant="default"
            className="text-theme-text-secondary hover:text-theme-text-primary"
          />
          
          <DropdownMenu
            isOpen={showSortMenu}
            onClose={() => setShowSortMenu(false)}
            position={{ x: 0, y: 30 }}
            width="w-48"
          >
            {sortOptions.map((option) => {
              const IconComponent = Icons[option.icon as keyof typeof Icons]
              return (
                <DropdownMenuItem
                  key={option.id}
                  onClick={() => {
                    onSort(option.id)
                    setShowSortMenu(false)
                  }}
                  icon={IconComponent ? <IconComponent size={14} /> : null}
                  className={sortBy === option.id ? 'bg-theme-bg-tertiary' : ''}
                >
                  {option.label}
                </DropdownMenuItem>
              )
            })}
            
            {/* Sort direction toggle */}
            <div className="border-t border-theme-border-primary my-1" />
            <DropdownMenuItem
              onClick={() => {
                onSortDirectionToggle()
                setShowSortMenu(false)
              }}
              icon={sortDirection === 'asc' ? <Icons.ArrowUp size={14} /> : <Icons.ArrowDown size={14} />}
            >
              {sortDirection === 'asc' ? 'A → Z' : 'Z → A'}
            </DropdownMenuItem>
          </DropdownMenu>
        </div>

        {/* New note button */}
        <IconButton
          icon={Icons.Plus}
          onClick={onNewNote}
          title="Create new note"
          size={16}
          variant="default"
          className="text-theme-text-secondary hover:text-theme-accent-primary"
        />
      </div>
    </div>
  )
}

export default NotesListHeader
