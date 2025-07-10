import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Icons from './Icons'
import { useSettings } from '../hooks/useSettings'
import { isFeatureEnabled } from '../config/features'
import UpdateSettings from './UpdateSettings'
import CustomSwitch from './ui/CustomSwitch'
import packageInfo from '../../package.json'

const Settings = ({ isVisible, onClose }) => {
  const { settings, updateSetting, resetSettings } = useSettings()
  const [activeTab, setActiveTab] = useState('general')

  // Remove early return to allow AnimatePresence to handle exit animations

  const tabs = [
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

  const SettingItem = ({ label, children, description }) => (
    <div className="setting-item py-3 border-b border-theme-border-primary last:border-b-0">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="text-sm font-medium text-theme-text-secondary">
            {label}
          </div>
          {description && (
            <div className="text-xs text-theme-text-tertiary mt-1">
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
      className="px-2 py-1 theme-bg-secondary border border-theme-border-primary rounded text-sm text-theme-text-secondary focus:border-theme-accent-primary focus:outline-none"
    >
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )

  // Using CustomSwitch directly - removed wrapper to avoid confusion

  const NumberInput = ({ value, onChange, min, max, step = 1 }) => (
    <input
      type="number"
      value={value}
      onChange={e => onChange(Number(e.target.value))}
      min={min}
      max={max}
      step={step}
      className="px-2 py-1 theme-bg-secondary border border-theme-border-primary rounded text-sm text-theme-text-secondary focus:border-theme-accent-primary focus:outline-none w-16"
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
            { value: 'solarized', label: 'Solarized' },
            { value: 'system', label: 'System' },
          ]}
        />
      </SettingItem>

      <SettingItem
        label="Auto Save"
        description="Automatically save changes while typing"
      >
        <CustomSwitch
          checked={settings.autoSave}
          onChange={value => updateSetting('autoSave', value)}
          size="md"
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
            { value: 'SF Mono', label: 'SF Mono' },
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
        <CustomSwitch
          checked={settings.wordWrap}
          onChange={value => updateSetting('wordWrap', value)}
          size="md"
        />
      </SettingItem>

      <SettingItem
        label="Line Numbers"
        description="Show line numbers in editor"
      >
        <CustomSwitch
          checked={settings.lineNumbers}
          onChange={value => updateSetting('lineNumbers', value)}
          size="md"
        />
      </SettingItem>

      <SettingItem label="Minimap" description="Show code minimap overview">
        <CustomSwitch
          checked={settings.minimap}
          onChange={value => updateSetting('minimap', value)}
          size="md"
        />
      </SettingItem>
    </div>
  )

  const renderTypographySettings = () => (
    <div className="space-y-1">
      <SettingItem
        label="UI Font Family"
        description="Font for interface elements"
      >
        <Select
          value={settings.uiFontFamily}
          onChange={value => updateSetting('uiFontFamily', value)}
          options={[
            { value: 'System', label: 'System Default' },
            { value: 'system-ui', label: 'System UI' },
            { value: 'SF Pro Display', label: 'SF Pro Display' },
            { value: 'Segoe UI', label: 'Segoe UI' },
            { value: 'Arial', label: 'Arial' },
            { value: 'Helvetica', label: 'Helvetica' },
          ]}
        />
      </SettingItem>

      <SettingItem label="UI Font Size" description="Size of UI text">
        <NumberInput
          value={settings.uiFontSize}
          onChange={value => updateSetting('uiFontSize', value)}
          min={12}
          max={18}
        />
      </SettingItem>

      <SettingItem
        label="Markdown Font Family"
        description="Font for markdown preview"
      >
        <Select
          value={settings.markdownFontFamily}
          onChange={value => updateSetting('markdownFontFamily', value)}
          options={[
            { value: 'System', label: 'System Default' },
            { value: 'Georgia', label: 'Georgia' },
            { value: 'Times New Roman', label: 'Times New Roman' },
            { value: 'Charter', label: 'Charter' },
            { value: 'Source Serif Pro', label: 'Source Serif Pro' },
            { value: 'system-ui', label: 'System UI' },
          ]}
        />
      </SettingItem>

      <SettingItem
        label="Markdown Font Size"
        description="Size of markdown text"
      >
        <NumberInput
          value={settings.markdownFontSize}
          onChange={value => updateSetting('markdownFontSize', value)}
          min={12}
          max={24}
        />
      </SettingItem>

      <SettingItem label="Line Height" description="Space between lines">
        <NumberInput
          value={settings.lineHeight}
          onChange={value => updateSetting('lineHeight', value)}
          min={1.2}
          max={2.0}
          step={0.1}
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
        <CustomSwitch
          checked={settings.includeMetadata}
          onChange={value => updateSetting('includeMetadata', value)}
          size="md"
        />
      </SettingItem>
    </div>
  )

  const renderPluginSettings = () => (
    <div className="space-y-4">
      <div className="text-center py-8">
        <div className="text-4xl mb-4">🧩</div>
        <h3 className="text-lg font-semibold text-theme-text-secondary mb-2">
          Plugin Management
        </h3>
        <p className="text-theme-text-tertiary text-sm mb-6">
          Extend Nototo's functionality with community plugins
        </p>
        <button
          onClick={() => {
            onClose()
            // Trigger plugin manager opening
            setTimeout(() => {
              if (typeof window !== 'undefined' && window.CustomEvent) {
                const event = new CustomEvent('openPluginManager')
                window.dispatchEvent(event)
              }
            }, 100)
          }}
          className="bg-theme-accent-primary text-theme-text-primary px-4 py-2 rounded font-medium hover:bg-theme-accent-primary/80 transition-colors"
        >
          Open Plugin Manager
        </button>
      </div>

      <div className="theme-bg-tertiary rounded-lg p-4 border border-theme-border-secondary">
        <h4 className="font-semibold text-theme-text-secondary mb-2">
          Plugin System
        </h4>
        <p className="text-theme-text-tertiary text-sm mb-3">
          Plugins allow you to customize and extend Nototo with new features
          like:
        </p>
        <ul className="text-theme-text-tertiary text-sm space-y-1 ml-4">
          <li>• Custom export formats</li>
          <li>• Editor themes and syntax highlighting</li>
          <li>• Additional sidebar sections</li>
          <li>• Workflow automation</li>
          <li>• Third-party integrations</li>
        </ul>
      </div>
    </div>
  )

  const renderUpdateSettings = () => (
    <div className="space-y-6">
      <UpdateSettings />
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings()
      case 'editor':
        return renderEditorSettings()
      case 'typography':
        return renderTypographySettings()
      case 'interface':
        return renderInterfaceSettings()
      case 'plugins':
        return renderPluginSettings()
      case 'export':
        return renderExportSettings()
      case 'updates':
        return renderUpdateSettings()
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
        >
          <motion.div
            className="theme-bg-primary border border-theme-border-primary rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <motion.div
              className="flex-1 flex flex-col h-full"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-theme-border-primary">
                <div>
                  <h2 className="text-xl font-semibold text-theme-text-primary">
                    Settings
                  </h2>
                  <p className="text-sm text-theme-text-tertiary mt-1">
                    Customize your Nototo experience
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-theme-text-tertiary hover:text-theme-text-secondary hover:theme-bg-tertiary rounded transition-colors"
                >
                  <Icons.X size={20} />
                </button>
              </div>

              <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <div className="w-48 border-r border-theme-border-primary p-4">
                  <div className="space-y-1">
                    {tabs.map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded text-sm transition-colors text-left ${
                          activeTab === tab.id
                            ? 'bg-theme-accent-primary text-theme-text-primary'
                            : 'text-theme-text-tertiary hover:text-theme-text-secondary hover:theme-bg-tertiary'
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
              <div className="flex items-center justify-between p-6 border-t border-theme-border-primary">
                <div className="flex items-center space-x-6">
                  <button
                    onClick={resetSettings}
                    className="px-4 py-2 text-sm text-theme-accent-yellow border border-theme-accent-yellow rounded hover:bg-theme-accent-yellow hover:text-theme-text-primary transition-colors"
                  >
                    Reset to Defaults
                  </button>

                  {/* Version Info */}
                  <div className="flex items-center space-x-2 text-sm text-theme-text-tertiary">
                    <Icons.Info size={14} />
                    <span>Nototo v{packageInfo.version}</span>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm bg-theme-accent-primary text-theme-text-primary rounded hover:bg-theme-accent-primary/80 transition-colors"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default Settings
