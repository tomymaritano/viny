import { motion, AnimatePresence } from 'framer-motion'
import PropTypes from 'prop-types'
import Icons from './Icons'
import packageInfo from '../../package.json'

// Settings components
import SettingsTabs from './settings/SettingsTabs'
import GeneralSettings from './settings/sections/GeneralSettings'
import EditorSettings from './settings/sections/EditorSettings'
import TypographySettings from './settings/sections/TypographySettings'
import UpdateSettings from './UpdateSettings'

// Hook
import { useSettingsForm } from './settings/hooks/useSettingsForm'

const SettingsPage = ({ onClose }) => {
  const {
    settings,
    activeTab,
    updateSetting,
    handleTabChange,
    handleResetSettings,
    handleExportSettings,
    handleImportSettings,
  } = useSettingsForm()

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <GeneralSettings settings={settings} updateSetting={updateSetting} />
        )
      case 'editor':
        return (
          <EditorSettings settings={settings} updateSetting={updateSetting} />
        )
      case 'typography':
        return (
          <TypographySettings
            settings={settings}
            updateSetting={updateSetting}
          />
        )
      case 'interface':
        return (
          <div className="text-center text-theme-text-tertiary">
            Interface settings coming soon...
          </div>
        )
      case 'plugins':
        return (
          <div className="text-center text-theme-text-tertiary">
            Plugin settings coming soon...
          </div>
        )
      case 'export':
        return (
          <div className="text-center text-theme-text-tertiary">
            Export settings coming soon...
          </div>
        )
      case 'updates':
        return <UpdateSettings />
      default:
        return (
          <GeneralSettings settings={settings} updateSetting={updateSetting} />
        )
    }
  }

  return (
    <div className="w-full h-screen bg-theme-bg-primary flex flex-col ui-font">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-theme-border-primary bg-theme-bg-secondary">
        <div className="flex items-center space-x-4">
          <button
            onClick={onClose}
            className="p-2 text-theme-text-tertiary hover:text-theme-text-secondary hover:bg-theme-bg-tertiary rounded transition-colors"
            title="Back to notes"
          >
            <Icons.ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-theme-text-primary">
              Settings
            </h1>
            <p className="text-sm text-theme-text-tertiary mt-1">
              Customize your Nototo experience
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportSettings}
            className="px-3 py-1.5 text-xs bg-theme-bg-tertiary text-theme-text-secondary rounded hover:bg-theme-bg-quaternary transition-colors"
            title="Export settings"
          >
            <Icons.Download size={14} className="inline mr-1" />
            Export
          </button>

          <label className="px-3 py-1.5 text-xs bg-theme-bg-tertiary text-theme-text-secondary rounded hover:bg-theme-bg-quaternary transition-colors cursor-pointer">
            <Icons.Upload size={14} className="inline mr-1" />
            Import
            <input
              type="file"
              accept=".json"
              onChange={handleImportSettings}
              className="hidden"
            />
          </label>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 border-r border-theme-border-primary p-4 bg-theme-bg-secondary">
          <SettingsTabs activeTab={activeTab} onTabChange={handleTabChange} />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {renderTabContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between p-6 border-t border-theme-border-primary bg-theme-bg-secondary">
        <div className="flex items-center space-x-6">
          <div className="text-xs text-theme-text-muted">
            Nototo v{packageInfo.version}
          </div>
          <button
            onClick={handleResetSettings}
            className="text-xs text-theme-accent-red hover:text-red-400 transition-colors"
          >
            Reset to Defaults
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-theme-bg-tertiary text-theme-text-secondary rounded hover:bg-theme-bg-quaternary transition-colors text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

SettingsPage.propTypes = {
  onClose: PropTypes.func.isRequired,
}

export default SettingsPage
