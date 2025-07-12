/**
 * StatusSection - Status filtering section with expand/collapse
 * Extracted from SidebarSimple.tsx
 */

import React from 'react'
import Icons from '../../Icons'

interface StatusSectionItem {
  id: string
  label: string
  icon: string
  count: number
  color?: string
}

interface StatusSectionProps {
  sections: StatusSectionItem[]
  isExpanded: boolean
  activeSection: string
  onToggleExpansion: () => void
  onSectionClick: (sectionId: string) => void
  renderIcon: (iconName: string, size?: number) => React.ReactNode
}

const StatusSection: React.FC<StatusSectionProps> = ({
  sections,
  isExpanded,
  activeSection,
  onToggleExpansion,
  onSectionClick,
  renderIcon
}) => {
  return (
    <div className="px-2">
      {/* Section Header */}
      <button
        onClick={onToggleExpansion}
        className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-theme-text-muted hover:text-theme-text-secondary transition-colors"
      >
        <span>Status</span>
        <span className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
          {renderIcon('ChevronDown', 12)}
        </span>
      </button>

      {/* Section Content */}
      {isExpanded && (
        <div className="space-y-1 mt-1">
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
                <div className={`w-2 h-2 rounded-full ${section.color || 'bg-gray-400'}`} />
                <span className="font-medium">{section.label}</span>
              </div>
              <span className="text-xs bg-theme-bg-tertiary text-theme-text-muted px-1.5 py-0.5 rounded">
                {section.count}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default StatusSection
