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
    <div className="flex justify-end p-3 border-b border-theme-border-primary">
      <IconButton
        icon={Icons.Settings}
        onClick={onClick}
        size={16}
        title="Settings"
      />
    </div>
  )
}

export default SettingsButton