import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Icons from './Icons'
import { useSettings } from '../hooks/useSettings'
import { isFeatureEnabled } from '../config/features'
import UpdateSettings from './UpdateSettings'
import CustomSwitch from './ui/CustomSwitch'
import packageInfo from '../../package.json'

const SettingsPage = ({ onClose }) => {
  const { settings, updateSetting, resetSettings } = useSettings()
  const [activeTab, setActiveTab] = useState('general')

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
        description="Automatically save notes as you type"
      >
        <CustomSwitch
          checked={settings.autoSave}
          onChange={value => updateSetting('autoSave', value)}
        />
      </SettingItem>

      <SettingItem
        label="Auto Save Interval"
        description="How often to auto-save (in seconds)"
      >
        <NumberInput
          value={settings.autoSaveInterval}
          onChange={value => updateSetting('autoSaveInterval', value)}
          min={5}
          max={300}
          step={5}
        />
      </SettingItem>

      <SettingItem label="Language" description="Interface language">
        <Select
          value={settings.language}
          onChange={value => updateSetting('language', value)}
          options={[
            { value: 'en', label: 'English' },
            { value: 'es', label: 'Español' },
            { value: 'fr', label: 'Français' },
            { value: 'de', label: 'Deutsch' },
            { value: 'it', label: 'Italiano' },
            { value: 'ja', label: '日本語' },
            { value: 'ko', label: '한국어' },
            { value: 'pt', label: 'Português' },
            { value: 'ru', label: 'Русский' },
            { value: 'zh', label: '中文' },
          ]}
        />
      </SettingItem>

      <SettingItem
        label="Storage Mode"
        description="Choose between local storage and API"
      >
        <Select
          value={
            localStorage.getItem('nototo_use_api') === 'true'
              ? 'api'
              : 'localStorage'
          }
          onChange={value => {
            const useApi = value === 'api'
            localStorage.setItem('nototo_use_api', JSON.stringify(useApi))
            // Trigger a page refresh to apply the storage mode change
            window.location.reload()
          }}
          options={[
            { value: 'localStorage', label: 'Local Storage' },
            { value: 'api', label: 'API Storage' },
          ]}
        />
      </SettingItem>
    </div>
  )

  const renderEditorSettings = () => (
    <div className="space-y-1">
      <SettingItem
        label="Font Family"
        description="Choose your preferred code font"
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
            { value: 'JetBrains Mono', label: 'JetBrains Mono' },
            { value: 'Courier New', label: 'Courier New' },
          ]}
        />
      </SettingItem>

      <SettingItem label="Font Size" description="Editor font size">
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
          min={1}
          max={8}
        />
      </SettingItem>

      <SettingItem label="Word Wrap" description="Wrap long lines">
        <CustomSwitch
          checked={settings.wordWrap}
          onChange={value => updateSetting('wordWrap', value)}
        />
      </SettingItem>

      <SettingItem label="Line Numbers" description="Show line numbers">
        <CustomSwitch
          checked={settings.lineNumbers}
          onChange={value => updateSetting('lineNumbers', value)}
        />
      </SettingItem>

      <SettingItem label="Minimap" description="Show code minimap">
        <CustomSwitch
          checked={settings.minimap}
          onChange={value => updateSetting('minimap', value)}
        />
      </SettingItem>

      <SettingItem label="Vim Mode" description="Enable vim keybindings">
        <CustomSwitch
          checked={settings.vimMode}
          onChange={value => updateSetting('vimMode', value)}
        />
      </SettingItem>
    </div>
  )

  const renderTypographySettings = () => (
    <div className="space-y-1">
      <SettingItem
        label="UI Font Family"
        description="Font for user interface elements"
      >
        <Select
          value={settings.uiFontFamily}
          onChange={value => updateSetting('uiFontFamily', value)}
          options={[
            { value: 'system-ui', label: 'System UI' },
            {
              value:
                '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              label: 'System Default',
            },
            { value: 'Arial', label: 'Arial' },
            { value: 'Helvetica', label: 'Helvetica' },
            { value: 'Inter', label: 'Inter' },
            { value: 'Roboto', label: 'Roboto' },
            { value: 'Verdana', label: 'Verdana' },
          ]}
        />
      </SettingItem>

      <SettingItem label="UI Font Size" description="Size of interface text">
        <NumberInput
          value={settings.uiFontSize}
          onChange={value => updateSetting('uiFontSize', value)}
          min={10}
          max={20}
        />
      </SettingItem>

      <SettingItem
        label="Markdown Font Family"
        description="Font for markdown content"
      >
        <Select
          value={settings.markdownFontFamily}
          onChange={value => updateSetting('markdownFontFamily', value)}
          options={[
            { value: 'system-ui', label: 'System UI' },
            {
              value:
                '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              label: 'System Default',
            },
            { value: 'Georgia', label: 'Georgia' },
            { value: 'Times New Roman', label: 'Times New Roman' },
            { value: 'Charter', label: 'Charter' },
            { value: 'Source Serif Pro', label: 'Source Serif Pro' },
            { value: 'Arial', label: 'Arial' },
            { value: 'Helvetica', label: 'Helvetica' },
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
          min={10}
          max={24}
        />
      </SettingItem>

      <SettingItem label="Line Height" description="Line height multiplier">
        <NumberInput
          value={settings.lineHeight}
          onChange={value => updateSetting('lineHeight', value)}
          min={1}
          max={2}
          step={0.1}
        />
      </SettingItem>
    </div>
  )

  const renderInterfaceSettings = () => (
    <div className="space-y-1">
      <SettingItem
        label="Compact Mode"
        description="Reduce padding and spacing"
      >
        <CustomSwitch
          checked={settings.compactMode}
          onChange={value => updateSetting('compactMode', value)}
        />
      </SettingItem>

      <SettingItem
        label="Show Sidebar"
        description="Show/hide the sidebar by default"
      >
        <CustomSwitch
          checked={settings.showSidebar}
          onChange={value => updateSetting('showSidebar', value)}
        />
      </SettingItem>

      <SettingItem label="Animation Speed" description="UI animation speed">
        <Select
          value={settings.animationSpeed}
          onChange={value => updateSetting('animationSpeed', value)}
          options={[
            { value: 'slow', label: 'Slow' },
            { value: 'normal', label: 'Normal' },
            { value: 'fast', label: 'Fast' },
            { value: 'disabled', label: 'Disabled' },
          ]}
        />
      </SettingItem>

      <SettingItem
        label="Confirm Deletes"
        description="Show confirmation dialog when deleting"
      >
        <CustomSwitch
          checked={settings.confirmDeletes}
          onChange={value => updateSetting('confirmDeletes', value)}
        />
      </SettingItem>
    </div>
  )

  const renderPluginSettings = () => (
    <div className="space-y-4">
      <div className="theme-bg-tertiary rounded-lg p-4 border border-theme-border-secondary">
        <h3 className="text-lg font-medium text-theme-text-primary mb-2">
          Plugin System
        </h3>
        <p className="text-sm text-theme-text-tertiary mb-4">
          Extend Nototo with custom plugins and integrations.
        </p>
        <div className="space-y-2">
          <SettingItem
            label="Enable Plugins"
            description="Allow loading of plugins"
          >
            <CustomSwitch
              checked={settings.pluginsEnabled}
              onChange={value => updateSetting('pluginsEnabled', value)}
            />
          </SettingItem>
          <SettingItem
            label="Auto-update Plugins"
            description="Automatically update plugins"
          >
            <CustomSwitch
              checked={settings.autoUpdatePlugins}
              onChange={value => updateSetting('autoUpdatePlugins', value)}
            />
          </SettingItem>
        </div>
      </div>
    </div>
  )

  const renderExportSettings = () => (
    <div className="space-y-1">
      <SettingItem
        label="Default Export Format"
        description="Default format for exports"
      >
        <Select
          value={settings.defaultExportFormat}
          onChange={value => updateSetting('defaultExportFormat', value)}
          options={[
            { value: 'markdown', label: 'Markdown' },
            { value: 'html', label: 'HTML' },
            { value: 'pdf', label: 'PDF' },
            { value: 'json', label: 'JSON' },
            { value: 'txt', label: 'Plain Text' },
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
        />
      </SettingItem>

      <SettingItem label="Export Path" description="Default path for exports">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={settings.exportPath}
            onChange={e => updateSetting('exportPath', e.target.value)}
            className="flex-1 px-2 py-1 theme-bg-secondary border border-theme-border-primary rounded text-sm text-theme-text-secondary focus:border-theme-accent-primary focus:outline-none"
            placeholder="~/Downloads"
          />
          <button className="px-2 py-1 text-xs border border-theme-border-primary rounded hover:theme-bg-tertiary">
            Browse
          </button>
        </div>
      </SettingItem>
    </div>
  )

  const renderUpdateSettings = () => (
    <div className="space-y-4">
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
    <div className="w-full h-screen theme-bg-primary flex flex-col ui-font">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-theme-border-primary theme-bg-secondary">
        <div className="flex items-center space-x-4">
          <button
            onClick={onClose}
            className="p-2 text-theme-text-tertiary hover:text-theme-text-secondary hover:theme-bg-tertiary rounded transition-colors"
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
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 border-r border-theme-border-primary p-4 theme-bg-secondary">
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
      <div className="flex items-center justify-between p-6 border-t border-theme-border-primary theme-bg-secondary">
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
    </div>
  )
}

export default SettingsPage
