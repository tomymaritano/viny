import React, { useState } from 'react'
import StandardModal from '../ui/StandardModal'
import SettingsTabs from './SettingsTabs'
import Icons from '../Icons'
import GeneralSettings from './tabs/GeneralSettings'
import EditorSettings from './tabs/EditorSettings'
import StorageSettings from './tabs/StorageSettings'
import KeyboardSettings from './tabs/KeyboardSettings'
import TagsSettingsSimple from './tabs/TagsSettingsSimple'
import AboutSettings from './tabs/AboutSettings'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<string>('general')
  
  // Check if running in standalone mode (settings window)
  const isStandalone = window.location.hash === '#/settings'

  const tabs = [
    { id: 'general', label: 'General', icon: 'Settings' },
    { id: 'editor', label: 'Editor', icon: 'FileEdit' },
    { id: 'storage', label: 'Storage', icon: 'Database' },
    { id: 'keyboard', label: 'Keyboard', icon: 'Command' },
    { id: 'tags', label: 'Tags', icon: 'Tag' },
    { id: 'plugins', label: 'Plugins', icon: 'Package' },
    { id: 'about', label: 'About', icon: 'Info' },
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return <GeneralSettings />
      case 'editor':
        return <EditorSettings />
      case 'storage':
        return <StorageSettings />
      case 'keyboard':
        return <KeyboardSettings />
      case 'tags':
        return <TagsSettingsSimple />
      case 'plugins':
        return <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-theme-text-primary mb-4">
              Plugins
            </h3>
            <p className="text-sm text-theme-text-secondary mb-4">
              Extend Nototo with community plugins and integrations.
            </p>
          </div>
          <div className="bg-theme-bg-secondary rounded-lg p-6 border border-theme-border-primary">
            <div className="text-center">
              <Icons.Package size={48} className="mx-auto mb-4 text-theme-text-muted opacity-50" />
              <h4 className="text-lg font-medium text-theme-text-primary mb-2">
                Plugin System
              </h4>
              <p className="text-sm text-theme-text-secondary mb-4">
                The plugin system is currently in development. Soon you'll be able to install and manage plugins to extend Nototo's functionality.
              </p>
              <p className="text-xs text-theme-text-muted">
                Coming in version 2.0
              </p>
            </div>
          </div>
        </div>
      case 'about':
        return <AboutSettings />
      default:
        return <GeneralSettings />
    }
  }

  // If in standalone mode, render without modal wrapper
  if (isStandalone) {
    return (
      <div className="flex h-screen w-full bg-theme-bg-primary">
        {/* Sidebar with tabs */}
        <div className="w-56 bg-theme-bg-secondary border-r border-theme-border-primary">
          <SettingsTabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto bg-theme-bg-primary">
          <div className="p-8">
            {renderTabContent()}
          </div>
        </div>
      </div>
    )
  }

  // Normal modal mode
  return (
    <StandardModal
      isOpen={isOpen}
      onClose={onClose}
      title="Settings"
      size="large"
    >
      <div className="flex h-[600px]">
        {/* Sidebar with tabs */}
        <div className="w-48 border-r border-theme-border-primary">
          <SettingsTabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </StandardModal>
  )
}

export default SettingsModal