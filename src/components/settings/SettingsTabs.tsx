import React from 'react'
import Icons from '../Icons'

interface Tab {
  id: string
  label: string
  icon: string
}

interface SettingsTabsProps {
  tabs: Tab[]
  activeTab: string
  onTabChange: (tabId: string) => void
}

const SettingsTabs: React.FC<SettingsTabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
}) => {
  const getIcon = (iconName: string) => {
    const Icon = Icons[iconName as keyof typeof Icons]
    return Icon ? <Icon size={16} /> : null
  }

  return (
    <div className="py-2">
      {tabs.map((tab, index) => (
        <div key={tab.id}>
          {/* Add separator before About section */}
          {tab.id === 'about' && (
            <div className="my-2 mx-4 border-t border-theme-border-primary" />
          )}
          <button
            onClick={() => onTabChange(tab.id)}
            className={`w-full flex items-center justify-between px-3 py-2 text-sm text-left transition-all duration-200 ${
              activeTab === tab.id
                ? 'text-theme-text-primary relative'
                : 'text-theme-text-tertiary hover:text-theme-text-secondary hover:bg-theme-bg-tertiary'
            }`}
            style={activeTab === tab.id ? {
              backgroundColor: 'var(--color-active-bg)',
              boxShadow: 'inset 3px 0 0 var(--color-active-border)'
            } : {}}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-4 h-4 flex-shrink-0 ${
                activeTab === tab.id ? 'text-theme-accent-primary' : 'text-theme-text-muted'
              }`}>
                {getIcon(tab.icon)}
              </div>
              <span className="text-sm">{tab.label}</span>
            </div>
          </button>
        </div>
      ))}
    </div>
  )
}

export default SettingsTabs