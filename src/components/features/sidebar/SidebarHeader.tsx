/**
 * SidebarHeader - Header section with settings button
 * Extracted from SidebarSimple.tsx
 */

import React from 'react'
import Icons from '../../Icons'
import IconButton from '../../ui/IconButton'

interface SidebarHeaderProps {
  onSettingsClick: () => void
}

const SidebarHeader: React.FC<SidebarHeaderProps> = ({ onSettingsClick }) => {
  return (
    <div className="p-4 border-b border-theme-border-primary flex items-center justify-between">
      <h1 className="text-lg font-semibold text-theme-text-primary">Notes</h1>
      <IconButton
        icon={Icons.Settings}
        onClick={onSettingsClick}
        title="Settings"
        size={16}
        variant="default"
        aria-label="Open settings"
      />
    </div>
  )
}

export default SidebarHeader
