import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Icons from './Icons'
import { useSettings } from '../hooks/useSettings'
import { isFeatureEnabled } from '../config/features'

const Settings = ({ isVisible, onClose }) => {
  const { settings, updateSetting, resetSettings } = useSettings()
  const [activeTab, setActiveTab] = useState('general')

  // Remove early return to allow AnimatePresence to handle exit animations

  const tabs = [
    { id: 'general', label: 'General', icon: <Icons.Settings size={16} /> },
    { id: 'editor', label: 'Editor', icon: <Icons.Edit size={16} /> },
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
  ]

  const SettingItem = ({ label, children, description }) => (
    <div className="setting-item py-3 border-b border-solarized-base01 last:border-b-0">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="text-sm font-medium text-solarized-base3">
            {label}
          </div>
          {description && (
            <div className="text-xs text-solarized-base1 mt-1">
              {description}
            </div>
          )}
        </div>
        <div className="ml-4">{children}</div>
      </div>
    </div>
  )

  const Select = ({ value, onChange, options }) => (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="px-2 py-1 bg-solarized-base02 border border-solarized-base01 rounded text-sm text-solarized-base3 focus:border-solarized-blue focus:outline-none"
    >
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )

  const Toggle = ({ checked, onChange }) => (
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
        checked ? 'bg-solarized-blue' : 'bg-solarized-base01'
      }`}
    >
      <span
        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-1'
        }`}
      />
    </button>
  )

  const NumberInput = ({ value, onChange, min, max, step = 1 }) => (
    <input
      type="number"
      value={value}
      onChange={e => onChange(Number(e.target.value))}
      min={min}
      max={max}
      step={step}
      className="px-2 py-1 bg-solarized-base02 border border-solarized-base01 rounded text-sm text-solarized-base3 focus:border-solarized-blue focus:outline-none w-16"
    />
  )

  const renderGeneralSettings = () => (
    <div className="space-y-1">
      <SettingItem
        label="Theme"
        description="Choose your preferred color scheme"
      >
        <Select
          value={settings.theme}
          onChange={value => updateSetting('theme', value)}
          options={[
            { value: 'dark', label: 'Dark' },
            { value: 'light', label: 'Light' },
            { value: 'system', label: 'System' },
          ]}
        />
      </SettingItem>

      <SettingItem
        label="Auto Save"
        description="Automatically save changes while typing"
      >
        <Toggle
          checked={settings.autoSave}
          onChange={value => updateSetting('autoSave', value)}
        />
      </SettingItem>

      {settings.autoSave && (
        <SettingItem
          label="Auto Save Interval"
          description="Seconds between automatic saves"
        >
          <NumberInput
            value={settings.autoSaveInterval}
            onChange={value => updateSetting('autoSaveInterval', value)}
            min={5}
            max={300}
            step={5}
          />
        </SettingItem>
      )}

      <SettingItem label="Language" description="Interface language">
        <Select
          value={settings.language}
          onChange={value => updateSetting('language', value)}
          options={[
            { value: 'en', label: 'English' },
            { value: 'es', label: 'Español' },
            { value: 'fr', label: 'Français' },
          ]}
        />
      </SettingItem>
    </div>
  )

  const renderEditorSettings = () => (
    <div className="space-y-1">
      <SettingItem
        label="Font Family"
        description="Editor font for code and markdown"
      >
        <Select
          value={settings.fontFamily}
          onChange={value => updateSetting('fontFamily', value)}
          options={[
            { value: 'Fira Code', label: 'Fira Code' },
            { value: 'JetBrains Mono', label: 'JetBrains Mono' },
            { value: 'Source Code Pro', label: 'Source Code Pro' },
            { value: 'Monaco', label: 'Monaco' },
            { value: 'Consolas', label: 'Consolas' },
          ]}
        />
      </SettingItem>

      <SettingItem label="Font Size" description="Size of text in the editor">
        <NumberInput
          value={settings.fontSize}
          onChange={value => updateSetting('fontSize', value)}
          min={10}
          max={24}
        />
      </SettingItem>

      <SettingItem label="Tab Size" description="Number of spaces per tab">
        <NumberInput
          value={settings.tabSize}
          onChange={value => updateSetting('tabSize', value)}
          min={2}
          max={8}
        />
      </SettingItem>

      <SettingItem
        label="Word Wrap"
        description="Wrap long lines in the editor"
      >
        <Toggle
          checked={settings.wordWrap}
          onChange={value => updateSetting('wordWrap', value)}
        />
      </SettingItem>

      <SettingItem
        label="Line Numbers"
        description="Show line numbers in editor"
      >
        <Toggle
          checked={settings.lineNumbers}
          onChange={value => updateSetting('lineNumbers', value)}
        />
      </SettingItem>

      <SettingItem label="Minimap" description="Show code minimap overview">
        <Toggle
          checked={settings.minimap}
          onChange={value => updateSetting('minimap', value)}
        />
      </SettingItem>
    </div>
  )

  const renderInterfaceSettings = () => (
    <div className="space-y-1">
      <SettingItem
        label="Sidebar Width"
        description="Default width of the sidebar"
      >
        <NumberInput
          value={settings.sidebarWidth}
          onChange={value => updateSetting('sidebarWidth', value)}
          min={200}
          max={400}
          step={10}
        />
      </SettingItem>

      <SettingItem
        label="Notes List Width"
        description="Default width of the notes list"
      >
        <NumberInput
          value={settings.notesListWidth}
          onChange={value => updateSetting('notesListWidth', value)}
          min={250}
          max={600}
          step={10}
        />
      </SettingItem>

      <SettingItem
        label="Preview Width"
        description="Default width of the preview panel"
      >
        <NumberInput
          value={settings.previewWidth}
          onChange={value => updateSetting('previewWidth', value)}
          min={250}
          max={500}
          step={10}
        />
      </SettingItem>
    </div>
  )

  const renderExportSettings = () => (
    <div className="space-y-1">
      <SettingItem label="Default Format" description="Preferred export format">
        <Select
          value={settings.exportFormat}
          onChange={value => updateSetting('exportFormat', value)}
          options={[
            { value: 'pdf', label: 'PDF' },
            { value: 'html', label: 'HTML' },
            { value: 'markdown', label: 'Markdown' },
            { value: 'docx', label: 'Word Document' },
          ]}
        />
      </SettingItem>

      <SettingItem
        label="Include Metadata"
        description="Include note metadata in exports"
      >
        <Toggle
          checked={settings.includeMetadata}
          onChange={value => updateSetting('includeMetadata', value)}
        />
      </SettingItem>
    </div>
  )

  const renderPluginSettings = () => (
    <div className="space-y-4">
      <div className="text-center py-8">
        <div className="text-4xl mb-4">🧩</div>
        <h3 className="text-lg font-semibold text-solarized-base3 mb-2">
          Plugin Management
        </h3>
        <p className="text-solarized-base1 text-sm mb-6">
          Extend Nototo's functionality with community plugins
        </p>
        <button
          onClick={() => {
            onClose()
            // Trigger plugin manager opening
            setTimeout(() => {
              const event = new CustomEvent('openPluginManager')
              window.dispatchEvent(event)
            }, 100)
          }}
          className="bg-solarized-blue text-solarized-base03 px-4 py-2 rounded font-medium hover:bg-solarized-blue/80 transition-colors"
        >
          Open Plugin Manager
        </button>
      </div>

      <div className="bg-solarized-base01 rounded-lg p-4 border border-solarized-base00">
        <h4 className="font-semibold text-solarized-base3 mb-2">
          Plugin System
        </h4>
        <p className="text-solarized-base1 text-sm mb-3">
          Plugins allow you to customize and extend Nototo with new features
          like:
        </p>
        <ul className="text-solarized-base1 text-sm space-y-1 ml-4">
          <li>• Custom export formats</li>
          <li>• Editor themes and syntax highlighting</li>
          <li>• Additional sidebar sections</li>
          <li>• Workflow automation</li>
          <li>• Third-party integrations</li>
        </ul>
      </div>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings()
      case 'editor':
        return renderEditorSettings()
      case 'interface':
        return renderInterfaceSettings()
      case 'plugins':
        return renderPluginSettings()
      case 'export':
        return renderExportSettings()
      default:
        return renderGeneralSettings()
    }
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center"
          style={{ zIndex: 9999 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-solarized-base02 border border-solarized-base01 rounded-lg shadow-xl w-full max-w-4xl h-full max-h-[80vh] flex flex-col"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-solarized-base01">
              <div>
                <h2 className="text-xl font-semibold text-solarized-base5">
                  Settings
                </h2>
                <p className="text-sm text-solarized-base1 mt-1">
                  Customize your Nototo experience
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-solarized-base1 hover:text-solarized-base3 hover:bg-solarized-base01 rounded transition-colors"
              >
                <Icons.X size={20} />
              </button>
            </div>

            <div className="flex flex-1 overflow-hidden">
              {/* Sidebar */}
              <div className="w-48 border-r border-solarized-base01 p-4">
                <div className="space-y-1">
                  {tabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded text-sm transition-colors text-left ${
                        activeTab === tab.id
                          ? 'bg-solarized-blue text-solarized-base5'
                          : 'text-solarized-base1 hover:text-solarized-base3 hover:bg-solarized-base01'
                      }`}
                    >
                      {tab.icon}
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 p-6 overflow-y-auto">
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

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-solarized-base01">
              <button
                onClick={resetSettings}
                className="px-4 py-2 text-sm text-solarized-orange border border-solarized-orange rounded hover:bg-solarized-orange hover:text-solarized-base5 transition-colors"
              >
                Reset to Defaults
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm bg-solarized-blue text-solarized-base5 rounded hover:bg-solarized-blue-hover transition-colors"
              >
                Done
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default Settings
