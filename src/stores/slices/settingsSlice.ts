import { StateCreator } from 'zustand'

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
  pluginSettings?: Record<string, any>
  
  // Sync
  syncProvider?: 'none' | 'nototo-sync' | 'custom'
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
}

export interface SettingsSlice {
  settings: Settings
  updateSettings: (updates: Partial<Settings>) => void
  resetSettings: () => void
  exportSettings: () => string
  importSettings: (settingsJson: string) => boolean
}

const defaultSettings: Settings = {
  // General
  defaultNotebook: 'personal',
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
}

export const createSettingsSlice: StateCreator<SettingsSlice> = (set, get) => ({
  settings: { ...defaultSettings },
  
  updateSettings: (updates) => {
    set((state) => ({
      settings: { ...state.settings, ...updates }
    }))
    
    // Persist settings to storage
    const newSettings = { ...get().settings, ...updates }
    if (window.electronAPI?.isElectron) {
      window.electronAPI.saveSettings(newSettings)
    } else {
      localStorage.setItem('nototo-settings', JSON.stringify(newSettings))
    }
  },
  
  resetSettings: () => {
    set({ settings: { ...defaultSettings } })
    
    // Clear persisted settings
    if (window.electronAPI?.isElectron) {
      window.electronAPI.saveSettings(defaultSettings)
    } else {
      localStorage.removeItem('nototo-settings')
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
      if (window.electronAPI?.isElectron) {
        window.electronAPI.saveSettings(finalSettings)
      } else {
        localStorage.setItem('nototo-settings', JSON.stringify(finalSettings))
      }
      
      return true
    } catch (error) {
      console.error('Failed to import settings:', error)
      return false
    }
  },
})