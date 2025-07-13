import { StateCreator } from 'zustand'

export interface Settings {
  // Appearance
  theme?: 'light' | 'dark' | 'system'
  fontSize?: number
  
  // Behavior
  autoSave?: boolean
  showLineNumbers?: boolean
  spellCheck?: boolean
  
  // Editor
  defaultEditorMode?: 'markdown' | 'monaco'
  tabSize?: number
  wordWrap?: boolean
  vimMode?: boolean
  
  // Markdown
  previewPosition?: 'right' | 'bottom' | 'hidden'
  livePreview?: boolean
  syntaxHighlighting?: boolean
  
  // Storage
  autoBackup?: boolean
  backupRetentionDays?: number
}

export interface SettingsSlice {
  settings: Settings
  updateSettings: (updates: Partial<Settings>) => void
  resetSettings: () => void
}

const defaultSettings: Settings = {
  theme: 'dark',
  fontSize: 14,
  autoSave: true,
  showLineNumbers: true,
  spellCheck: true,
  defaultEditorMode: 'markdown',
  tabSize: 2,
  wordWrap: true,
  vimMode: false,
  previewPosition: 'right',
  livePreview: true,
  syntaxHighlighting: true,
  autoBackup: true,
  backupRetentionDays: 7,
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
})