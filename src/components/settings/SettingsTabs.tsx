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
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`
            w-full flex items-center space-x-3 px-4 py-2 text-sm transition-colors
            ${
              activeTab === tab.id
                ? 'bg-theme-bg-tertiary text-theme-text-primary'
                : 'text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg-secondary'
            }
          `}
        >
          <span className="flex-shrink-0">
            {getIcon(tab.icon)}
          </span>
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  )
}

export default SettingsTabs