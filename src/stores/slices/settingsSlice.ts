import { StateCreator } from 'zustand'
import { PluginSettings } from '../../types/settings'

export interface Settings {
  // General
  defaultNotebook?: string
  autoUpdates?: boolean
  developmentMode?: boolean
  language?: 'en' | 'en-gb' | 'es' | 'es-mx' | 'fr' | 'de' | 'it' | 'pt-br' | 'zh-cn' | 'ja' | 'ko'
  
  // Themes
  uiTheme?: 'light' | 'dark' | 'solarized' | 'system'
  syntaxTheme?: 'default-dark' | 'default-light' | 'github' | 'monokai' | 'solarized'
  previewTheme?: 'github' | 'gitlab' | 'minimal' | 'academic'
  customCSS?: string
  autoToggleLightDark?: boolean
  
  // Editing
  fontSize?: number
  fontFamily?: string
  fontWeight?: 'normal' | 'bold' | '300' | '400' | '500' | '600'
  lineHeight?: number
  tabSize?: number
  indentUnit?: number
  pasteURLAsLink?: boolean
  showInvisibleCharacters?: boolean
  showToolbar?: boolean
  showLineNumbers?: boolean
  wordWrap?: boolean
  highlightActiveLine?: boolean
  readableLineLength?: boolean
  scrollPastEnd?: boolean
  cursorScrollMargin?: number
  
  // Preview
  previewFontSize?: number
  previewPosition?: 'right' | 'bottom' | 'hidden'
  livePreview?: boolean
  mathJax?: boolean
  mermaidDiagrams?: boolean
  syntaxHighlighting?: boolean
  
  // Keybindings
  keymapPreset?: 'default' | 'vim' | 'vscode' | 'sublime'
  customKeybindings?: Record<string, string>
  
  // Plugins
  enabledPlugins?: string[]
  pluginSettings?: PluginSettings
  
  // Sync
  syncProvider?: 'none' | 'viny-sync' | 'custom'
  syncUrl?: string
  syncEncryption?: boolean
  autoSync?: boolean
  
  // Backup
  autoBackup?: boolean
  backupLocation?: string
  backupRetentionDays?: number
  backupFrequency?: 'hourly' | 'daily' | 'weekly'
  
  // Behavior
  autoSave?: boolean
  spellCheck?: boolean
  defaultEditorMode?: 'markdown' | 'monaco'
  vimMode?: boolean
  
  // Privacy & Security
  analyticsEnabled?: boolean
  crashReporting?: boolean
  usageStatistics?: boolean
  improveDataSharing?: boolean
  localDataOnly?: boolean
  encryptLocalStorage?: boolean
  clearDataOnExit?: boolean
  anonymousMode?: boolean
  trackingProtection?: boolean
  exportIncludeMetadata?: boolean
  exportIncludeHistory?: boolean
  dataRetentionDays?: number
  autoDeleteOldData?: boolean
  secureNoteDeletion?: boolean
  lockAfterInactivity?: boolean
  inactivityTimeoutMinutes?: number
  requirePasswordOnStart?: boolean
  biometricUnlock?: boolean
}

export interface SettingsSlice {
  settings: Settings
  updateSettings: (updates: Partial<Settings>, skipPersist?: boolean) => void
  resetSettings: () => void
  exportSettings: () => string
  importSettings: (settingsJson: string) => boolean
}

const defaultSettings: Settings = {
  // General
  defaultNotebook: 'inbox',
  autoUpdates: true,
  developmentMode: false,
  language: 'en',
  
  // Themes
  uiTheme: 'dark',
  syntaxTheme: 'default-dark',
  previewTheme: 'github',
  customCSS: '',
  autoToggleLightDark: false,
  
  // Editing
  fontSize: 14,
  fontFamily: 'SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace',
  fontWeight: 'normal',
  lineHeight: 1.5,
  tabSize: 2,
  indentUnit: 2,
  pasteURLAsLink: true,
  showInvisibleCharacters: false,
  showToolbar: true,
  showLineNumbers: true,
  wordWrap: true,
  highlightActiveLine: false,
  readableLineLength: false,
  scrollPastEnd: true,
  cursorScrollMargin: 100,
  
  // Preview
  previewFontSize: 15,
  previewPosition: 'right',
  livePreview: true,
  mathJax: true,
  mermaidDiagrams: true,
  syntaxHighlighting: true,
  
  // Keybindings
  keymapPreset: 'default',
  customKeybindings: {},
  
  // Plugins
  enabledPlugins: [],
  pluginSettings: {},
  
  // Sync
  syncProvider: 'none',
  syncUrl: '',
  syncEncryption: true,
  autoSync: false,
  
  // Backup
  autoBackup: true,
  backupLocation: '',
  backupRetentionDays: 7,
  backupFrequency: 'daily',
  
  // Behavior
  autoSave: true,
  spellCheck: true,
  defaultEditorMode: 'markdown',
  vimMode: false,
  
  // Privacy & Security
  analyticsEnabled: false,
  crashReporting: true,
  usageStatistics: false,
  improveDataSharing: false,
  localDataOnly: true,
  encryptLocalStorage: false,
  clearDataOnExit: false,
  anonymousMode: false,
  trackingProtection: true,
  exportIncludeMetadata: true,
  exportIncludeHistory: false,
  dataRetentionDays: 365,
  autoDeleteOldData: false,
  secureNoteDeletion: true,
  lockAfterInactivity: false,
  inactivityTimeoutMinutes: 15,
  requirePasswordOnStart: false,
  biometricUnlock: false,
}

export const createSettingsSlice: StateCreator<SettingsSlice> = (set, get) => ({
  settings: { ...defaultSettings },
  
  updateSettings: (updates, skipPersist = false) => {
    set((state) => ({
      settings: { ...state.settings, ...updates }
    }))
    
    // Skip persistence during initialization or when explicitly requested
    if (skipPersist) return
    
    // Persist settings to storage
    const newSettings = { ...get().settings, ...updates }
    try {
      if (window.electronAPI?.isElectron && window.electronAPI?.saveSettings) {
        window.electronAPI.saveSettings(newSettings)
      } else {
        localStorage.setItem('viny-settings', JSON.stringify(newSettings))
      }
    } catch (error) {
      console.warn('Failed to save settings:', error)
      // Fallback to localStorage
      try {
        localStorage.setItem('viny-settings', JSON.stringify(newSettings))
      } catch (fallbackError) {
        console.error('Failed to save settings to localStorage:', fallbackError)
      }
    }
  },
  
  resetSettings: () => {
    set({ settings: { ...defaultSettings } })
    
    // Clear persisted settings
    try {
      if (window.electronAPI?.isElectron && window.electronAPI?.saveSettings) {
        window.electronAPI.saveSettings(defaultSettings)
      } else {
        localStorage.removeItem('viny-settings')
      }
    } catch (error) {
      console.warn('Failed to reset settings:', error)
      // Fallback to localStorage
      try {
        localStorage.removeItem('viny-settings')
      } catch (fallbackError) {
        console.error('Failed to clear settings from localStorage:', fallbackError)
      }
    }
  },

  exportSettings: () => {
    const settings = get().settings
    return JSON.stringify(settings, null, 2)
  },

  importSettings: (settingsJson: string) => {
    try {
      const importedSettings = JSON.parse(settingsJson)
      
      // Validate imported settings against default structure
      const validSettings: Partial<Settings> = {}
      Object.keys(defaultSettings).forEach(key => {
        if (key in importedSettings) {
          validSettings[key as keyof Settings] = importedSettings[key]
        }
      })
      
      set({ settings: { ...defaultSettings, ...validSettings } })
      
      // Persist imported settings
      const finalSettings = { ...defaultSettings, ...validSettings }
      try {
        if (window.electronAPI?.isElectron && window.electronAPI?.saveSettings) {
          window.electronAPI.saveSettings(finalSettings)
        } else {
          localStorage.setItem('viny-settings', JSON.stringify(finalSettings))
        }
      } catch (error) {
        console.warn('Failed to save imported settings:', error)
        // Fallback to localStorage
        try {
          localStorage.setItem('viny-settings', JSON.stringify(finalSettings))
        } catch (fallbackError) {
          console.error('Failed to save imported settings to localStorage:', fallbackError)
        }
      }
      
      return true
    } catch (error) {
      console.error('Failed to import settings:', error)
      return false
    }
  },
})