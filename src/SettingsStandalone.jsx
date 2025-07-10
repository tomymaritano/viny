import { useState } from 'react'
import Icons from './components/Icons'
import GeneralSettings from './components/settings/sections/GeneralSettings'
import EditorSettings from './components/settings/sections/EditorSettings'
import TypographySettings from './components/settings/sections/TypographySettings'
import { useSettings } from './hooks/useSettings'
import useSimpleStore from './stores/simpleStore'
import './App.css'

const SettingsStandalone = () => {
  const [activeTab, setActiveTab] = useState('general')
  const {
    settings,
    updateSettings,
    resetSettings,
    exportSettings,
    importSettings,
  } = useSettings()
  const { theme } = useSimpleStore()

  const tabs = [
    { id: 'general', label: 'General', icon: Icons.Settings },
    { id: 'themes', label: 'Themes', icon: Icons.Eye },
    { id: 'editing', label: 'Editing', icon: Icons.Edit },
    { id: 'preview', label: 'Preview', icon: Icons.FileText },
    { id: 'keybinding', label: 'Keybinding', icon: Icons.Code },
    { id: 'plugins', label: 'Plugins', icon: Icons.Package },
    { id: 'sync', label: 'Sync & Backup', icon: Icons.RefreshCw },
  ]

  const handleImportSettings = async e => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = async e => {
        try {
          const imported = JSON.parse(e.target.result)
          await importSettings(imported)
        } catch (error) {
          console.error('Failed to import settings:', error)
        }
      }
      reader.readAsText(file)
    }
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-theme-text-primary mb-2">
                General
              </h2>
              <p className="text-sm text-theme-text-secondary mb-4">
                Configure general application settings
              </p>
            </div>
            <GeneralSettings
              settings={settings}
              updateSetting={updateSettings}
              theme={theme}
            />
          </div>
        )
      case 'themes':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-theme-text-primary mb-2">
                Themes
              </h2>
              <p className="text-sm text-theme-text-secondary mb-4">
                Customize the appearance of Nototo
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="theme-bg-secondary rounded-lg p-4 border-2 border-theme-accent-primary cursor-pointer">
                <h3 className="font-medium text-theme-text-primary mb-2">
                  Dark Theme
                </h3>
                <div className="space-y-2">
                  <div className="h-2 bg-gray-800 rounded"></div>
                  <div className="h-2 bg-gray-700 rounded w-3/4"></div>
                  <div className="h-2 bg-gray-600 rounded w-1/2"></div>
                </div>
              </div>
              <div className="theme-bg-secondary rounded-lg p-4 border-2 border-transparent hover:border-theme-border-primary cursor-pointer">
                <h3 className="font-medium text-theme-text-primary mb-2">
                  Light Theme
                </h3>
                <div className="space-y-2">
                  <div className="h-2 bg-gray-200 rounded"></div>
                  <div className="h-2 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-2 bg-gray-400 rounded w-1/2"></div>
                </div>
              </div>
              <div className="theme-bg-secondary rounded-lg p-4 border-2 border-transparent hover:border-theme-border-primary cursor-pointer">
                <h3 className="font-medium text-theme-text-primary mb-2">
                  Solarized
                </h3>
                <div className="space-y-2">
                  <div className="h-2 bg-yellow-800 rounded"></div>
                  <div className="h-2 bg-orange-700 rounded w-3/4"></div>
                  <div className="h-2 bg-blue-600 rounded w-1/2"></div>
                </div>
              </div>
            </div>
            <div className="mt-8">
              <h3 className="font-medium text-theme-text-primary mb-4">
                Typography Settings
              </h3>
              <TypographySettings
                settings={settings}
                updateSetting={updateSettings}
              />
            </div>
          </div>
        )
      case 'editing':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-theme-text-primary mb-2">
                Editing
              </h2>
              <p className="text-sm text-theme-text-secondary mb-4">
                Configure editor behavior and preferences
              </p>
            </div>
            <EditorSettings
              settings={settings}
              updateSetting={updateSettings}
            />
          </div>
        )
      case 'preview':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-theme-text-primary mb-2">
                Preview
              </h2>
              <p className="text-sm text-theme-text-secondary mb-4">
                Configure preview settings
              </p>
            </div>
            <div className="theme-bg-secondary rounded-lg p-6">
              <div className="flex items-center justify-center h-32">
                <div className="text-center">
                  <Icons.FileText
                    size={48}
                    className="mx-auto mb-4 text-theme-text-muted opacity-50"
                  />
                  <p className="text-lg font-medium text-theme-text-secondary mb-2">
                    Preview Settings
                  </p>
                  <p className="text-sm text-theme-text-tertiary">
                    Configure markdown rendering options, themes, and export
                    settings.
                  </p>
                  <p className="text-xs text-theme-text-muted mt-4">
                    Coming in version 2.0
                  </p>
                </div>
              </div>
            </div>
          </div>
        )
      case 'keybinding':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-theme-text-primary mb-2">
                Keybinding
              </h2>
              <p className="text-sm text-theme-text-secondary mb-4">
                Customize keyboard shortcuts
              </p>
            </div>
            <div className="theme-bg-secondary rounded-lg p-6">
              <div className="flex items-center justify-center h-32">
                <div className="text-center">
                  <Icons.Code
                    size={48}
                    className="mx-auto mb-4 text-theme-text-muted opacity-50"
                  />
                  <p className="text-lg font-medium text-theme-text-secondary mb-2">
                    Custom Keybindings
                  </p>
                  <p className="text-sm text-theme-text-tertiary">
                    Define your own keyboard shortcuts and choose from preset
                    keymaps.
                  </p>
                  <p className="text-xs text-theme-text-muted mt-4">
                    Coming in version 2.0
                  </p>
                </div>
              </div>
            </div>
          </div>
        )
      case 'plugins':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-theme-text-primary mb-2">
                Plugins
              </h2>
              <p className="text-sm text-theme-text-secondary mb-4">
                Install and manage plugins
              </p>
            </div>
            <div className="theme-bg-secondary rounded-lg p-6">
              <div className="flex items-center justify-center h-32">
                <div className="text-center">
                  <Icons.Package
                    size={48}
                    className="mx-auto mb-4 text-theme-text-muted opacity-50"
                  />
                  <p className="text-lg font-medium text-theme-text-secondary mb-2">
                    Plugin Marketplace
                  </p>
                  <p className="text-sm text-theme-text-tertiary">
                    Browse and install plugins to add new features and
                    integrations.
                  </p>
                  <p className="text-xs text-theme-text-muted mt-4">
                    Coming in version 2.0
                  </p>
                </div>
              </div>
            </div>
          </div>
        )
      case 'sync':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-theme-text-primary mb-2">
                Sync & Backup
              </h2>
              <p className="text-sm text-theme-text-secondary mb-4">
                Sync your notes across devices
              </p>
            </div>
            <div className="theme-bg-secondary rounded-lg p-6">
              <div className="flex items-center justify-center h-32">
                <div className="text-center">
                  <Icons.RefreshCw
                    size={48}
                    className="mx-auto mb-4 text-theme-text-muted opacity-50"
                  />
                  <p className="text-lg font-medium text-theme-text-secondary mb-2">
                    Cloud Sync
                  </p>
                  <p className="text-sm text-theme-text-tertiary">
                    Automatic sync with end-to-end encryption for your privacy.
                  </p>
                  <p className="text-xs text-theme-text-muted mt-4">
                    Coming in version 2.0
                  </p>
                </div>
              </div>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="app">
      <div className="flex h-screen w-full theme-bg-primary">
        {/* Sidebar */}
        <nav className="w-64 sidebar-modern flex flex-col h-full ui-font border-r border-theme-border-primary">
          {/* Navigation tabs */}
          <div className="flex-1 py-2">
            {tabs.map(tab => (
              <div key={tab.id}>
                {/* Add separator before Plugins section */}
                {tab.id === 'plugins' && (
                  <div className="my-2 mx-3 border-t border-theme-border-primary" />
                )}
                <button
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-4 py-2 text-sm text-left transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'text-theme-text-primary bg-[#323D4B] border-l-2 border-[#ED6E3F]'
                      : 'text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg-tertiary border-l-2 border-transparent'
                  }`}
                >
                  <span
                    className={`mr-3 ${activeTab === tab.id ? 'text-theme-accent-primary' : 'opacity-60'}`}
                  >
                    <tab.icon size={18} />
                  </span>
                  <span className="font-medium">{tab.label}</span>
                </button>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="border-t border-theme-border-primary p-4 space-y-2">
            <button
              onClick={exportSettings}
              className="w-full flex items-center px-3 py-2 text-sm transition-all duration-200 text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg-tertiary rounded"
            >
              <Icons.Download size={16} className="mr-2 opacity-60" />
              <span>Export Settings</span>
            </button>

            <label className="w-full flex items-center px-3 py-2 text-sm transition-all duration-200 text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg-tertiary rounded cursor-pointer">
              <Icons.Upload size={16} className="mr-2 opacity-60" />
              <span>Import Settings</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportSettings}
                className="hidden"
              />
            </label>

            <button
              onClick={resetSettings}
              className="w-full flex items-center px-3 py-2 text-sm transition-all duration-200 text-theme-accent-red hover:bg-theme-bg-tertiary rounded"
            >
              <Icons.RefreshCw size={16} className="mr-2" />
              <span>Reset All Settings</span>
            </button>
          </div>
        </nav>

        {/* Content */}
        <div className="flex-1 overflow-auto bg-theme-bg-primary min-w-0">
          <div className="w-full p-8">{renderContent()}</div>
        </div>
      </div>
    </div>
  )
}

export default SettingsStandalone
