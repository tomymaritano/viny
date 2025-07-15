import React from 'react'
import Icons from '../Icons'
import IconButton from '../ui/IconButton'

interface SidebarHeaderProps {
  onSettingsClick: () => void
  onCreateNote: () => void
}

const SidebarHeader: React.FC<SidebarHeaderProps> = ({
  onSettingsClick,
  onCreateNote
}) => {
  return (
    <div className="p-2 border-b border-theme-border-primary flex items-center justify-between flex-shrink-0">
      <div className="flex items-center space-x-2">
        <div className="flex items-center">
          <div className="w-6 h-6 bg-theme-accent-primary rounded-md flex items-center justify-center mr-2">
            <Icons.NotebookPen size={14} className="text-white" />
          </div>
          <h1 className="text-lg font-semibold text-theme-text-primary">Viny</h1>
        </div>
      </div>
      
      <div className="flex items-center space-x-1">
        <IconButton
          icon={Icons.Plus}
          onClick={onCreateNote}
          title="Create new note"
          size={16}
          variant="ghost"
          className="text-theme-text-secondary hover:text-theme-text-primary"
          aria-label="Create new note"
        />
        <IconButton
          icon={Icons.Settings}
          onClick={onSettingsClick}
          title="Settings"
          size={16}
          variant="ghost"
          className="text-theme-text-secondary hover:text-theme-text-primary"
          aria-label="Settings"
        />
      </div>
    </div>
  )
}

export default SidebarHeader