/**
 * MainNavigationSection - Main navigation items (All Notes, Pinned)
 * Extracted from SidebarSimple.tsx
 */

import React from 'react'
import Icons from '../../Icons'

interface NavigationSection {
  id: string
  label: string
  icon: string
  count: number
}

interface MainNavigationSectionProps {
  sections: NavigationSection[]
  activeSection: string
  onSectionClick: (sectionId: string) => void
  renderIcon: (iconName: string, size?: number) => React.ReactNode
}

const MainNavigationSection: React.FC<MainNavigationSectionProps> = ({
  sections,
  activeSection,
  onSectionClick,
  renderIcon
}) => {
  return (
    <div className="space-y-1 px-2">
      {sections.map((section) => (
        <button
          key={section.id}
          onClick={() => onSectionClick(section.id)}
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
          <span className="text-xs bg-theme-bg-tertiary text-theme-text-muted px-1.5 py-0.5 rounded">
            {section.count}
          </span>
        </button>
      ))}
    </div>
  )
}

export default MainNavigationSection
