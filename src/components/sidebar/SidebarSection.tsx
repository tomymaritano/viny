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
        <div className="space-y-0.5">
          {children}
        </div>
      </div>
    )
  }

  return (
    <div className="pb-1">
      <div className="w-full flex items-center justify-between px-3 py-2 text-sm group">
        <button
          className="flex items-center space-x-3 text-theme-text-tertiary hover:text-theme-text-primary transition-colors"
          onClick={onToggle}
          onContextMenu={onHeaderRightClick}
        >
          <div className="w-4 h-4 flex-shrink-0 text-theme-text-muted">
            {icon}
          </div>
          <span className="text-sm">{title}</span>
          {onToggle && (
            <Icons.ChevronDown 
              size={12} 
              className={`transition-all duration-200 ${isExpanded ? 'rotate-180' : ''} opacity-0 group-hover:opacity-100`}
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
        <div className="px-0 space-y-0.5">
          {children}
        </div>
      )}
    </div>
  )
}

export default SidebarSection