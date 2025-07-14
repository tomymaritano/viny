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

// New advanced tabs (to be created)
import ThemesSettings from './tabs/ThemesSettings'
import EditingSettings from './tabs/EditingSettings'
import PreviewSettings from './tabs/PreviewSettings'
import KeybindingsSettings from './tabs/KeybindingsSettings'
import PluginsSettings from './tabs/PluginsSettings'
import InstallSettings from './tabs/InstallSettings'
import UpdatesSettings from './tabs/UpdatesSettings'
import SyncSettings from './tabs/SyncSettings'
import BackupSettings from './tabs/BackupSettings'

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
    { id: 'themes', label: 'Themes', icon: 'Palette' },
    { id: 'editing', label: 'Editing', icon: 'FileEdit' },
    { id: 'preview', label: 'Preview', icon: 'Eye' },
    { id: 'keybindings', label: 'Keybindings', icon: 'Command' },
    { id: 'plugins', label: 'Plugins', icon: 'Package' },
    { id: 'install', label: 'Install', icon: 'Download' },
    { id: 'updates', label: 'Updates', icon: 'RefreshCw' },
    { id: 'sync', label: 'Sync', icon: 'Cloud' },
    { id: 'backup', label: 'Backup', icon: 'HardDrive' },
    { id: 'tags', label: 'Tags', icon: 'Tag' },
    { id: 'about', label: 'About', icon: 'Info' },
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return <GeneralSettings />
      case 'themes':
        return <ThemesSettings />
      case 'editing':
        return <EditingSettings />
      case 'preview':
        return <PreviewSettings />
      case 'keybindings':
        return <KeybindingsSettings />
      case 'plugins':
        return <PluginsSettings />
      case 'install':
        return <InstallSettings />
      case 'updates':
        return <UpdatesSettings />
      case 'sync':
        return <SyncSettings />
      case 'backup':
        return <BackupSettings />
      case 'tags':
        return <TagsSettingsSimple />
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