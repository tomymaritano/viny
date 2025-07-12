/**
 * NotesListSearchBar - Search bar for notes list
 * Extracted from NotesListSimple.tsx
 */

import React from 'react'
import Icons from '../../Icons'

interface NotesListSearchBarProps {
  searchTerm: string
  onSearchChange: (term: string) => void
  placeholder?: string
}

const NotesListSearchBar: React.FC<NotesListSearchBarProps> = ({
  searchTerm,
  onSearchChange,
  placeholder = "Search notes..."
}) => {
  return (
    <div className="p-3 border-b border-theme-border-primary">
      <div className="relative">
        <Icons.Search 
          size={16} 
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-text-muted" 
        />
        <input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-theme-bg-secondary border border-theme-border-primary rounded-md text-sm text-theme-text-primary placeholder:text-theme-text-muted focus:outline-none focus:ring-2 focus:ring-theme-accent-primary focus:border-theme-accent-primary transition-colors"
        />
        
        {/* Keyboard shortcut hint */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <span className="text-xs text-theme-text-muted bg-theme-bg-tertiary px-1.5 py-0.5 rounded border border-theme-border-primary">
            ⌘K
          </span>
        </div>
      </div>
    </div>
  )
}

export default NotesListSearchBar
