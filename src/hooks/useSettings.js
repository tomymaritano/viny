import { useState, useEffect } from 'react'

const defaultSettings = {
  // General
  theme: 'dark',
  language: 'en',
  autoSave: true,
  autoSaveInterval: 30, // seconds

  // Editor
  fontSize: 14,
  fontFamily: 'Fira Code',
  tabSize: 2,
  wordWrap: true,
  lineNumbers: true,
  minimap: false,

  // Interface
  sidebarWidth: 240,
  notesListWidth: 320,
  previewWidth: 350,

  // Export
  exportFormat: 'pdf',
  includeMetadata: true,
}

export const useSettings = () => {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('nototo-settings')
      return saved
        ? { ...defaultSettings, ...JSON.parse(saved) }
        : defaultSettings
    } catch (error) {
      console.warn('Failed to load settings:', error)
      return defaultSettings
    }
  })

  // Save settings to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('nototo-settings', JSON.stringify(settings))
    } catch (error) {
      console.warn('Failed to save settings:', error)
    }
  }, [settings])

  const updateSetting = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }))
  }

  const updateSettings = newSettings => {
    setSettings(prev => ({
      ...prev,
      ...newSettings,
    }))
  }

  const resetSettings = () => {
    setSettings(defaultSettings)
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
