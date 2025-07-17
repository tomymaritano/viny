import React from 'react'
import { Icons } from '../Icons'

interface Tab {
  id: string
  label: string
  icon: string
  subItems?: Tab[]
}

interface SettingsTabsWithSectionsProps {
  tabs: Tab[]
  activeTab: string
  onTabChange: (tabId: string) => void
  expandedSections: Record<string, boolean>
  onToggleSection: (sectionId: string) => void
}

const SettingsTabsWithSections: React.FC<SettingsTabsWithSectionsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  expandedSections,
  onToggleSection,
}) => {
  const getIcon = (iconName: string) => {
    const Icon = Icons[iconName as keyof typeof Icons]
    return Icon ? <Icon size={16} /> : null
  }

  const renderTab = (tab: Tab, isSubItem = false) => {
    const isActive = activeTab === tab.id
    const hasSubItems = tab.subItems && tab.subItems.length > 0
    const isExpanded = expandedSections[tab.id] || false

    return (
      <div key={tab.id}>
        <button
          onClick={() => {
            if (hasSubItems) {
              onToggleSection(tab.id)
              // Automatically select first sub-item when expanding
              if (!isExpanded && tab.subItems && tab.subItems.length > 0) {
                onTabChange(tab.subItems[0].id)
              }
            } else {
              onTabChange(tab.id)
            }
          }}
          className={`w-full flex items-center justify-between px-3 py-2 text-sm text-left transition-all duration-200 ${
            isActive && !hasSubItems
              ? 'text-theme-text-primary relative'
              : 'text-theme-text-tertiary hover:text-theme-text-secondary hover:bg-theme-bg-tertiary'
          } ${isSubItem ? 'pl-10' : ''}`}
          style={isActive && !hasSubItems ? {
            backgroundColor: 'var(--color-active-bg)',
            boxShadow: 'inset 3px 0 0 var(--color-active-border)'
          } : {}}
        >
          <div className="flex items-center space-x-3">
            <div className={`w-4 h-4 flex-shrink-0 ${
              isActive && !hasSubItems ? 'text-theme-accent-primary' : 'text-theme-text-muted'
            }`}>
              {getIcon(tab.icon)}
            </div>
            <span className="text-sm">{tab.label}</span>
          </div>
          {hasSubItems && (
            <div className="text-theme-text-muted">
              {isExpanded ? <Icons.ChevronDown size={14} /> : <Icons.ChevronRight size={14} />}
            </div>
          )}
        </button>
        
        {/* Render sub-items if expanded */}
        {hasSubItems && isExpanded && (
          <div className="bg-theme-bg-tertiary/30">
            {tab.subItems!.map(subItem => renderTab(subItem, true))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="py-2">
      {tabs.map((tab, index) => (
        <div key={tab.id}>
          {/* Add separators for logical groupings */}
          {(tab.id === 'plugins-section' || tab.id === 'tags' || tab.id === 'about') && (
            <div className="my-2 mx-4 border-t border-theme-border-primary" />
          )}
          {renderTab(tab)}
        </div>
      ))}
    </div>
  )
}

export default SettingsTabsWithSections