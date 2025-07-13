import { useState } from 'react'
import Icons from './Icons'
import GeneralSettings from './settings/sections/GeneralSettings'
import EditorSettings from './settings/sections/EditorSettings'
import TypographySettings from './settings/sections/TypographySettings'
import { useSettings } from '../hooks/useSettings'
import useAppStore from '../stores/newSimpleStore'

interface SettingsViewProps {
  onClose: () => void
}

const SettingsView: React.FC<SettingsViewProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('general')
  const {
    settings,
    updateSettings,
    resetSettings,
    exportSettings,
    importSettings,
  } = useSettings()
  const { theme } = useAppStore()

  const tabs = [
    { id: 'general', label: 'General', icon: Icons.Settings },
    { id: 'editor', label: 'Editor', icon: Icons.Edit },
    { id: 'typography', label: 'Typography', icon: Icons.Type },
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
          <GeneralSettings
            settings={settings}
            updateSettings={updateSettings}
            theme={theme}
          />
        )
      case 'editor':
        return (
          <EditorSettings settings={settings} updateSettings={updateSettings} />
        )
      case 'typography':
        return (
          <TypographySettings
            settings={settings}
            updateSettings={updateSettings}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-theme-bg-primary flex">
      {/* Sidebar */}
      <nav className="w-56 sidebar-modern flex flex-col h-full ui-font">
        {/* Header with close button */}
        <section className="space-y-0">
          <button
            onClick={onClose}
            className="w-full flex items-center justify-between px-3 py-2 text-sm text-left transition-all duration-200 text-theme-text-tertiary hover:text-theme-text-secondary hover:bg-theme-bg-tertiary"
          >
            <div className="flex items-center space-x-2">
              <span className="opacity-75">
                <Icons.ArrowLeft size={16} />
              </span>
              <span>Back</span>
            </div>
          </button>
        </section>

        {/* Settings title */}
        <section>
          <div className="px-3 py-2 text-xs uppercase tracking-wider text-theme-text-muted font-medium">
            Settings
          </div>
        </section>

        {/* Navigation tabs */}
        <section className="space-y-0">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm text-left transition-all duration-200 ${
                activeTab === tab.id
                  ? 'text-theme-text-primary bg-theme-bg-tertiary'
                  : 'text-theme-text-tertiary hover:text-theme-text-secondary hover:bg-theme-bg-tertiary'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span className="opacity-75">
                  <tab.icon size={16} />
                </span>
                <span>{tab.label}</span>
              </div>
            </button>
          ))}
        </section>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Actions */}
        <section className="space-y-0 border-t border-theme-border-primary pt-2 pb-4">
          <button
            onClick={exportSettings}
            className="w-full flex items-center justify-between px-3 py-2 text-sm text-left transition-all duration-200 text-theme-text-tertiary hover:text-theme-text-secondary hover:bg-theme-bg-tertiary"
          >
            <div className="flex items-center space-x-2">
              <span className="opacity-75">
                <Icons.Download size={16} />
              </span>
              <span>Export Settings</span>
            </div>
          </button>

          <label className="w-full flex items-center justify-between px-3 py-2 text-sm text-left transition-all duration-200 text-theme-text-tertiary hover:text-theme-text-secondary hover:bg-theme-bg-tertiary cursor-pointer">
            <div className="flex items-center space-x-2">
              <span className="opacity-75">
                <Icons.Upload size={16} />
              </span>
              <span>Import Settings</span>
            </div>
            <input
              type="file"
              accept=".json"
              onChange={handleImportSettings}
              className="hidden"
            />
          </label>

          <button
            onClick={resetSettings}
            className="w-full flex items-center justify-between px-3 py-2 text-sm text-left transition-all duration-200 text-theme-accent-red hover:bg-theme-bg-tertiary"
          >
            <div className="flex items-center space-x-2">
              <span className="opacity-75">
                <Icons.RefreshCw size={16} />
              </span>
              <span>Reset to Defaults</span>
            </div>
          </button>
        </section>
      </nav>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-8">{renderContent()}</div>
      </div>
    </div>
  )
}

export default SettingsView
