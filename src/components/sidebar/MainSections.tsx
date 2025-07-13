import React, { memo } from 'react'
import Icons from '../Icons'

interface MainSection {
  id: string
  label: string
  icon: string
  count?: number
  onRightClick?: (e: React.MouseEvent) => void
}

interface MainSectionsProps {
  sections: MainSection[]
  activeSection: string
  onSectionClick: (section: string) => void
  onTrashRightClick?: (e: React.MouseEvent) => void
}

const MainSections: React.FC<MainSectionsProps> = memo(({
  sections,
  activeSection,
  onSectionClick,
  onTrashRightClick
}) => {
  const renderIcon = (iconName: string, size = 16) => {
    const IconComponent = Icons[iconName as keyof typeof Icons] as any
    return IconComponent ? <IconComponent size={size} /> : null
  }

  return (
    <div className="space-y-0.5">
      {sections.map((section) => {
        const isActive = activeSection === section.id

        return (
          <button
            key={section.id}
            className={`w-full flex items-center justify-between px-3 py-2 text-sm text-left transition-all duration-200 ${
              isActive
                ? 'text-theme-text-primary relative'
                : 'text-theme-text-tertiary hover:text-theme-text-secondary hover:bg-theme-bg-tertiary'
            }`}
            style={isActive ? {
              backgroundColor: 'var(--color-active-bg)',
              boxShadow: 'inset 3px 0 0 var(--color-active-border)'
            } : {}}
            onClick={() => onSectionClick(section.id)}
            onContextMenu={section.onRightClick || (section.id === 'trash' ? onTrashRightClick : undefined)}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-4 h-4 flex-shrink-0 ${
                isActive ? 'text-theme-accent-primary' : 'text-theme-text-muted'
              }`}>
                {renderIcon(section.icon)}
              </div>
              <span className="text-sm">{section.label}</span>
            </div>
            
            {section.count !== undefined && section.count > 0 && (
              <span 
                className="text-xs px-1.5 py-0.5 bg-theme-accent-primary/20 text-theme-accent-primary rounded-full min-w-[20px] text-center"
                title={`${section.count} items`}
              >
                {section.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
})

MainSections.displayName = 'MainSections'

export default MainSections