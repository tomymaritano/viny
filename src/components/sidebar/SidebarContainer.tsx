import React from 'react'

interface SidebarContainerProps {
  children: React.ReactNode
  onContextMenuClose: () => void
}

/**
 * Container component for the sidebar
 * Handles layout and base styling
 */
const SidebarContainer: React.FC<SidebarContainerProps> = ({
  children,
  onContextMenuClose
}) => {
  return (
    <nav 
      className="w-full sidebar-modern flex flex-col h-full ui-font bg-theme-bg-secondary border-r border-theme-border-primary"
      onClick={(e) => {
        // Don't close context menus if clicking on context menu items
        if (!(e.target as Element)?.closest('.dropdown-menu')) {
          onContextMenuClose()
        }
      }}
    >
      {children}
    </nav>
  )
}

export default SidebarContainer