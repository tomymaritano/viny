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
    <div className="flex justify-end pr-1">
      <button
        onClick={onClick}
        className="p-2 text-theme-text-secondary hover:text-theme-text-primary transition-colors"
        title="Settings"
      >
        <Icons.Settings size={20} />
      </button>
    </div>
  )
}

export default SettingsButton