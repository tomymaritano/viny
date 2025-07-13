import React from 'react'
import Icons from '../Icons'

interface SettingsButtonProps {
  onClick: () => void
}

/**
 * Settings button component for the sidebar header
 */
const SettingsButton: React.FC<SettingsButtonProps> = ({ onClick }) => {
  return (
    <div className="flex justify-end p-3 border-b border-theme-border-primary">
      <button
        onClick={onClick}
        className="p-1.5 text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg-tertiary rounded-md transition-colors"
        title="Settings"
      >
        <Icons.Settings size={16} />
      </button>
    </div>
  )
}

export default SettingsButton