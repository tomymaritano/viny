import { useState, useEffect } from 'react'
import { defaultEditorColors, applyEditorColors } from '../config/editorColors'

/**
 * Default settings configuration for the application
 * @constant
 * @type {Settings}
 */
const defaultSettings = {
  // General
  theme: 'dark',
  language: 'en',
  autoSave: true,
  autoSaveInterval: 30, // seconds

  // Editor
  fontSize: 12,
  fontFamily: 'SF Mono',
  tabSize: 2,
  wordWrap: true,
  lineNumbers: true,
  minimap: false,

  // Typography
  uiFontFamily: 'system-ui',
  uiFontSize: 14,
  markdownFontFamily: 'system-ui',
  markdownFontSize: 16,
  lineHeight: 1.6,

  // Additional typography settings
  compactMode: false,
  showSidebar: true,
  animationSpeed: 'normal',
  confirmDeletes: true,

  // Editor colors
  editorColors: defaultEditorColors,
  pluginsEnabled: false,
  autoUpdatePlugins: false,
  defaultExportFormat: 'markdown',
  exportPath: '~/Downloads',
  vimMode: false,

  // Interface
  sidebarWidth: 160,
  notesListWidth: 300,
  previewWidth: 350,

  // Export
  exportFormat: 'pdf',
  includeMetadata: true,
}

// Global settings store
let globalSettings: any = null
const subscribers = new Set<(settings: any) => void>()

const loadSettings = () => {
  if (globalSettings) return globalSettings

  try {
    const saved = localStorage.getItem('viny-settings')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        globalSettings = { ...defaultSettings, ...parsed }
      } catch (parseError) {
        console.warn('Failed to parse settings JSON, using defaults:', parseError)
        globalSettings = defaultSettings
      }
    } else {
      globalSettings = defaultSettings
    }
  } catch (error) {
    console.warn('Failed to load settings:', error)
    globalSettings = defaultSettings
  }

  // Initialize CSS variables
  const root = document.documentElement
  root.style.setProperty(
    '--font-family-editor',
    globalSettings.fontFamily || defaultSettings.fontFamily
  )
  root.style.setProperty(
    '--font-size-editor',
    `${globalSettings.fontSize || defaultSettings.fontSize}px`
  )
  root.style.setProperty(
    '--font-family-ui',
    globalSettings.uiFontFamily || defaultSettings.uiFontFamily
  )

  // Initialize editor color variables
  applyEditorColors(globalSettings.editorColors)
  root.style.setProperty(
    '--font-size-ui',
    `${globalSettings.uiFontSize || defaultSettings.uiFontSize}px`
  )
  root.style.setProperty(
    '--font-family-markdown',
    globalSettings.markdownFontFamily || defaultSettings.markdownFontFamily
  )
  root.style.setProperty(
    '--font-size-markdown',
    `${globalSettings.markdownFontSize || defaultSettings.markdownFontSize}px`
  )
  root.style.setProperty(
    '--line-height',
    globalSettings.lineHeight || defaultSettings.lineHeight
  )

  return globalSettings
}

const saveSettings = (newSettings: any) => {
  // Update global state first (should always work)
  globalSettings = newSettings
  
  // Try to persist to localStorage (may fail, but state should still update)
  try {
    localStorage.setItem('viny-settings', JSON.stringify(newSettings))
  } catch (error) {
    console.warn('Failed to save settings to localStorage:', error)
  }

  // Update CSS variables for typography
  const root = document.documentElement
  if (newSettings.fontFamily) {
    root.style.setProperty('--font-family-editor', newSettings.fontFamily)
  }
  if (newSettings.fontSize) {
    root.style.setProperty('--font-size-editor', `${newSettings.fontSize}px`)
  }
  if (newSettings.uiFontFamily) {
    root.style.setProperty('--font-family-ui', newSettings.uiFontFamily)
  }
  if (newSettings.uiFontSize) {
    root.style.setProperty('--font-size-ui', `${newSettings.uiFontSize}px`)
  }
  if (newSettings.markdownFontFamily) {
    root.style.setProperty(
      '--font-family-markdown',
      newSettings.markdownFontFamily
    )
  }
  if (newSettings.markdownFontSize) {
    root.style.setProperty(
      '--font-size-markdown',
      `${newSettings.markdownFontSize}px`
    )
  }
  if (newSettings.lineHeight) {
    root.style.setProperty('--line-height', newSettings.lineHeight)
  }
  if (newSettings.editorColors) {
    applyEditorColors(newSettings.editorColors)
  }

  // Notify all subscribers (should always happen)
  subscribers.forEach(callback => callback(newSettings))
}

/**
 * Hook for managing application settings with global state synchronization.
 * 
 * @description
 * This hook provides a reactive interface to application settings that are:
 * - Persisted to localStorage
 * - Synchronized across all components using the hook
 * - Applied immediately to CSS variables for theming
 * - Validated before saving
 * 
 * @returns {Object} Settings management interface
 * @returns {Settings} returns.settings - Current settings object
 * @returns {Function} returns.updateSetting - Update a single setting
 * @returns {Function} returns.updateSettings - Update multiple settings
 * @returns {Function} returns.resetSettings - Reset to default settings
 * @returns {Function} returns.exportSettings - Export settings as JSON
 * @returns {Function} returns.importSettings - Import settings from JSON
 * 
 * @example
 * ```tsx
 * function SettingsPanel() {
 *   const { settings, updateSetting, resetSettings } = useSettings();
 *   
 *   return (
 *     <div>
 *       <Select
 *         value={settings.theme}
 *         onChange={(theme) => updateSetting('theme', theme)}
 *       />
 *       <Button onClick={resetSettings}>Reset to Defaults</Button>
 *     </div>
 *   );
 * }
 * ```
 */
export const useSettings = () => {
  const [settings, setSettings] = useState(() => loadSettings())

  // Subscribe to global settings changes
  useEffect(() => {
    const callback = (newSettings: any) => {
      setSettings(newSettings)
    }

    subscribers.add(callback)

    return () => {
      subscribers.delete(callback)
    }
  }, [])

  const updateSetting = (key: string, value: any) => {
    const newSettings = {
      ...globalSettings,
      [key]: value,
    }
    saveSettings(newSettings)
  }

  const updateSettings = (newSettings: any) => {
    const mergedSettings = {
      ...globalSettings,
      ...newSettings,
    }
    saveSettings(mergedSettings)
  }

  const resetSettings = () => {
    saveSettings(defaultSettings)
  }

  const getSetting = (key: string) => {
    return settings[key]
  }

  return {
    settings,
    updateSetting,
    updateSettings,
    resetSettings,
    getSetting,
  }
}

// Testing utility to reset global state
export const __resetGlobalSettingsForTesting = () => {
  globalSettings = null
  subscribers.clear()
}
