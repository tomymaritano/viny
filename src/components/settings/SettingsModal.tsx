import React, { useState, Suspense } from 'react'
import StandardModal from '../ui/StandardModal'
import SettingsTabs from './SettingsTabs'
import Icons from '../Icons'
import LoadingSpinner from '../LoadingSpinner'

// Lazy loaded settings tabs
import * as LazyTabs from './LazySettingsTabs'

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
    const TabComponent = (() => {
      switch (activeTab) {
        case 'general':
          return LazyTabs.GeneralSettings
        case 'themes':
          return LazyTabs.ThemesSettings
        case 'editing':
          return LazyTabs.EditingSettings
        case 'preview':
          return LazyTabs.PreviewSettings
        case 'keybindings':
          return LazyTabs.KeybindingsSettings
        case 'plugins':
          return LazyTabs.PluginsSettings
        case 'install':
          return LazyTabs.InstallSettings
        case 'updates':
          return LazyTabs.UpdatesSettings
        case 'sync':
          return LazyTabs.SyncSettings
        case 'backup':
          return LazyTabs.BackupSettings
        case 'tags':
          return LazyTabs.TagsSettingsSimple
        case 'about':
          return LazyTabs.AboutSettings
        default:
          return LazyTabs.GeneralSettings
      }
    })()

    return (
      <Suspense fallback={
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="sm" />
        </div>
      }>
        <TabComponent />
      </Suspense>
    )
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