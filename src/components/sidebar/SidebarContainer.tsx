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
  onContextMenuClose,
}) => {
  // Check if we're in Electron and get platform
  const isElectron =
    typeof window !== 'undefined' && window.electronAPI?.isElectron
  const platform = typeof window !== 'undefined' && window.electronAPI?.platform

  // Add padding for macOS window controls
  const electronClasses = isElectron && platform === 'darwin' ? 'pt-8' : ''

  return (
    <nav
      data-testid="sidebar"
      role="navigation"
      aria-label="Main navigation"
      className={`relative w-full sidebar-modern flex flex-col h-full ui-font bg-theme-bg-secondary border-r border-theme-border-primary ${electronClasses}`}
      onClick={e => {
        // Don't close context menus if clicking on context menu items
        if (!(e.target as Element)?.closest('.dropdown-menu')) {
          onContextMenuClose()
        }
      }}
      onContextMenu={e => {
        // Check if right-click is on empty area of sidebar
        const target = e.target as HTMLElement
        const isEmptyArea =
          target.classList.contains('sidebar-modern') ||
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
