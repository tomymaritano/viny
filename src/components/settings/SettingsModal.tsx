import React, { useState } from 'react'
import StandardModal from '../ui/StandardModal'
import SettingsTabs from './SettingsTabs'
import GeneralSettings from './tabs/GeneralSettings'
import EditorSettings from './tabs/EditorSettings'
import StorageSettings from './tabs/StorageSettings'
import KeyboardSettings from './tabs/KeyboardSettings'
import AboutSettings from './tabs/AboutSettings'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<string>('general')

  const tabs = [
    { id: 'general', label: 'General', icon: 'Settings' },
    { id: 'editor', label: 'Editor', icon: 'FileEdit' },
    { id: 'storage', label: 'Storage', icon: 'Database' },
    { id: 'keyboard', label: 'Keyboard', icon: 'Command' },
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
      case 'about':
        return <AboutSettings />
      default:
        return <GeneralSettings />
    }
  }

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