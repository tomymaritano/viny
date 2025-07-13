import React from 'react'
import Icons from '../Icons'

interface SidebarSectionProps {
  title?: string
  isExpanded?: boolean
  onToggle?: () => void
  children: React.ReactNode
  icon?: React.ReactNode
  actions?: React.ReactNode
  onHeaderRightClick?: (e: React.MouseEvent) => void
  titleActions?: React.ReactNode
}

const SidebarSection: React.FC<SidebarSectionProps> = ({
  title,
  isExpanded = true,
  onToggle,
  children,
  icon,
  actions,
  titleActions,
  onHeaderRightClick
}) => {
  // If no title, render as simple container
  if (!title) {
    return (
      <div className="pb-1">
        <div className="px-1 space-y-0.5">
          {children}
        </div>
      </div>
    )
  }

  return (
    <div className="pb-1">
      <div className="w-full flex items-center justify-between px-3 py-2 text-sm text-theme-text-tertiary">
        <button
          className="flex items-center space-x-2 hover:text-theme-text-primary transition-colors"
          onClick={onToggle}
          onContextMenu={onHeaderRightClick}
        >
          {icon}
          <span>{title}</span>
          {onToggle && (
            <Icons.ChevronDown 
              size={12} 
              className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
            />
          )}
        </button>
        
        {(actions || titleActions) && (
          <div className="flex items-center space-x-1">
            {titleActions}
            {actions}
          </div>
        )}
      </div>
      
      {isExpanded && (
        <div className="px-1 space-y-0.5">
          {children}
        </div>
      )}
    </div>
  )
}

export default SidebarSection