import React from 'react'
import { Icons } from '../Icons'

interface SidebarSettingsButtonProps {
  onClick: () => void
}

const SidebarSettingsButton: React.FC<SidebarSettingsButtonProps> = ({
  onClick,
}) => {
  return (
    <div className="absolute top-1 right-2 z-50">
      <button
        onClick={onClick}
        className="p-1.5 text-theme-text-muted hover:text-theme-text-primary hover:bg-theme-bg-tertiary/30 rounded transition-colors duration-150"
        title="Settings"
        aria-label="Open settings"
        type="button"
      >
        <Icons.Settings size={16} />
      </button>
    </div>
  )
}

export default SidebarSettingsButton
