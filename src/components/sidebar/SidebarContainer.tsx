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
      data-testid="sidebar"
      className="w-full sidebar-modern flex flex-col h-full ui-font bg-theme-bg-secondary border-r border-theme-border-primary"
      onClick={(e) => {
        // Don't close context menus if clicking on context menu items
        if (!(e.target as Element)?.closest('.dropdown-menu')) {
          onContextMenuClose()
        }
      }}
      onContextMenu={(e) => {
        // Check if right-click is on empty area of sidebar
        const target = e.target as HTMLElement
        const isEmptyArea = target.classList.contains('sidebar-modern') || 
                           target.classList.contains('sidebar-content') ||
                           (!target.closest('[data-context-menu]') && 
                            !target.closest('.notebook-item') && 
                            !target.closest('.tag-item'))
        
        if (isEmptyArea && window.electronAPI?.isElectron) {
          e.preventDefault()
          window.electronAPI.showContextMenu('sidebar')
        }
      }}
      data-context-menu="sidebar"
    >
      {children}
    </nav>
  )
}

export default SidebarContainer