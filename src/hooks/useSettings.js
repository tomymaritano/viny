import { useState, useEffect } from 'react'
import { defaultEditorColors, applyEditorColors } from '../config/editorColors'

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
let globalSettings = null
const subscribers = new Set()

const loadSettings = () => {
  if (globalSettings) return globalSettings

  try {
    const saved = localStorage.getItem('nototo-settings')
    globalSettings = saved
      ? { ...defaultSettings, ...JSON.parse(saved) }
      : defaultSettings
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

const saveSettings = newSettings => {
  try {
    localStorage.setItem('nototo-settings', JSON.stringify(newSettings))
    globalSettings = newSettings

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

    // Notify all subscribers
    subscribers.forEach(callback => callback(newSettings))
  } catch (error) {
    console.warn('Failed to save settings:', error)
  }
}

export const useSettings = () => {
  const [settings, setSettings] = useState(() => loadSettings())

  // Subscribe to global settings changes
  useEffect(() => {
    const callback = newSettings => {
      setSettings(newSettings)
    }

    subscribers.add(callback)

    return () => {
      subscribers.delete(callback)
    }
  }, [])

  const updateSetting = (key, value) => {
    const newSettings = {
      ...globalSettings,
      [key]: value,
    }
    saveSettings(newSettings)
  }

  const updateSettings = newSettings => {
    const mergedSettings = {
      ...globalSettings,
      ...newSettings,
    }
    saveSettings(mergedSettings)
  }

  const resetSettings = () => {
    saveSettings(defaultSettings)
  }

  const getSetting = key => {
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
