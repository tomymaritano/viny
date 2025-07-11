import React from 'react'
import Icons from '../Icons'
import { isFeatureEnabled } from '../../config/features'

interface Tab {
  id: string
  label: string
  icon: React.ReactNode
}

interface SettingsTabsProps {
  activeTab: string
  onTabChange: (tabId: string) => void
}

const SettingsTabs: React.FC<SettingsTabsProps> = ({ activeTab, onTabChange }) => {
  const tabs: Tab[] = [
    { id: 'general', label: 'General', icon: <Icons.Settings size={16} /> },
    { id: 'editor', label: 'Editor', icon: <Icons.Edit size={16} /> },
    {
      id: 'typography',
      label: 'Typography',
      icon: <Icons.Settings size={16} />,
    },
    { id: 'interface', label: 'Interface', icon: <Icons.Settings size={16} /> },
    ...(isFeatureEnabled('PLUGINS_ENABLED')
      ? [
          {
            id: 'plugins',
            label: 'Plugins',
            icon: <Icons.Settings size={16} />,
          },
        ]
      : []),
    { id: 'export', label: 'Export', icon: <Icons.Download size={16} /> },
    { id: 'updates', label: 'Updates', icon: <Icons.Download size={16} /> },
  ]

  return (
    <div className="flex flex-col space-y-1 border-r border-theme-border-primary pr-4 mr-6 min-w-0">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex items-center space-x-2 px-3 py-2 rounded text-sm transition-colors text-left min-w-0 ${
            activeTab === tab.id
              ? 'bg-theme-accent-primary text-theme-text-primary'
              : 'text-theme-text-secondary hover:bg-theme-bg-tertiary'
          }`}
        >
          <span className="flex-shrink-0">{tab.icon}</span>
          <span className="truncate">{tab.label}</span>
        </button>
      ))}
    </div>
  )
}

export default SettingsTabs