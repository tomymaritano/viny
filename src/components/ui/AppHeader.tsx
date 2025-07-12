import React from 'react'
import Icons from '../Icons'
import IconButton from './IconButton'
import { useSimpleStore } from '../../stores/simpleStore'

interface AppHeaderProps {
  title?: string
  subtitle?: string
  showCreateButton?: boolean
  showSearchButton?: boolean
  onCreateNote?: () => void
  onSearch?: () => void
  rightContent?: React.ReactNode
}

const AppHeader: React.FC<AppHeaderProps> = ({
  title = 'Nototo',
  subtitle,
  showCreateButton = true,
  showSearchButton = true,
  onCreateNote,
  onSearch,
  rightContent
}) => {
  const { setModal } = useSimpleStore()

  const handleSearch = () => {
    if (onSearch) {
      onSearch()
    } else {
      setModal('search', true)
    }
  }

  return (
    <header className="w-full bg-theme-bg-primary border-b border-theme-border-primary flex-shrink-0">
      <div className="px-4 py-3 flex items-center justify-between">
        {/* Left section - Title */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Icons.Book size={20} className="text-theme-accent-primary" />
            <div>
              <h1 className="text-lg font-semibold text-theme-text-primary m-0">
                {title}
              </h1>
              {subtitle && (
                <p className="text-xs text-theme-text-muted m-0 mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Center section - Search */}
        {showSearchButton && (
          <div className="flex-1 max-w-md mx-6">
            <button
              onClick={handleSearch}
              className="w-full flex items-center space-x-3 px-4 py-2 bg-theme-bg-secondary/50 hover:bg-theme-bg-secondary transition-colors rounded-lg text-theme-text-muted hover:text-theme-text-secondary"
            >
              <Icons.Search size={16} />
              <span className="text-sm">Search notes...</span>
              <div className="ml-auto flex items-center space-x-1">
                <kbd className="px-1.5 py-0.5 text-xs bg-theme-bg-tertiary text-theme-text-muted rounded">
                  ⌘
                </kbd>
                <kbd className="px-1.5 py-0.5 text-xs bg-theme-bg-tertiary text-theme-text-muted rounded">
                  K
                </kbd>
              </div>
            </button>
          </div>
        )}

        {/* Right section - Actions */}
        <div className="flex items-center space-x-2">
          {rightContent}
          
          {showCreateButton && onCreateNote && (
            <IconButton
              icon={Icons.NotebookPen}
              onClick={onCreateNote}
              title="Create new note (⌘+N)"
              size={16}
              variant="primary"
              className="bg-theme-accent-primary text-white hover:bg-theme-accent-primary/90"
            />
          )}

          <IconButton
            icon={Icons.Settings}
            onClick={() => setModal('settings', true)}
            title="Settings"
            size={16}
            variant="ghost"
            className="text-theme-text-muted hover:text-theme-text-primary"
          />
        </div>
      </div>
    </header>
  )
}

export default AppHeader