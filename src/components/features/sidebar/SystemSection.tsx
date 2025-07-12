/**
 * SystemSection - System sections like Trash
 * Extracted from SidebarSimple.tsx
 */

import React from 'react'

interface SystemSectionItem {
  id: string
  label: string
  icon: string
  count: number
}

interface SystemSectionProps {
  sections: SystemSectionItem[]
  activeSection: string
  onSectionClick: (sectionId: string) => void
  onTrashRightClick?: (e: React.MouseEvent) => void
  renderIcon: (iconName: string, size?: number) => React.ReactNode
}

const SystemSection: React.FC<SystemSectionProps> = ({
  sections,
  activeSection,
  onSectionClick,
  onTrashRightClick,
  renderIcon
}) => {
  return (
    <div className="space-y-1 px-2">
      {sections.map((section) => (
        <button
          key={section.id}
          onClick={() => onSectionClick(section.id)}
          onContextMenu={section.id === 'trash' ? onTrashRightClick : undefined}
          className={`
            w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors
            ${activeSection === section.id
              ? 'bg-theme-bg-secondary text-theme-text-primary'
              : 'text-theme-text-secondary hover:bg-theme-bg-tertiary hover:text-theme-text-primary'
            }
          `}
        >
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 flex items-center justify-center">
              {renderIcon(section.icon, 14)}
            </span>
            <span className="font-medium">{section.label}</span>
          </div>
          {section.count > 0 && (
            <span className="text-xs bg-theme-bg-tertiary text-theme-text-muted px-1.5 py-0.5 rounded">
              {section.count}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}

export default SystemSection
