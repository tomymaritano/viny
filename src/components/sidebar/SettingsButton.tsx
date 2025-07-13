import React from 'react'
import Icons from '../Icons'
import IconButton from '../ui/IconButton'

interface SettingsButtonProps {
  onClick: () => void
}

/**
 * Settings button component for the sidebar header
 */
const SettingsButton: React.FC<SettingsButtonProps> = ({ onClick }) => {
  return (
    <div className="flex justify-end p-1 pr-3">
      <IconButton
        icon={Icons.Settings}
        onClick={onClick}
        size={16}
        title="Settings"
        className="text-theme-text-muted hover:text-theme-text-primary"
      />
    </div>
  )
}

export default SettingsButton