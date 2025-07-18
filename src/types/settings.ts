/**
 * Type definitions for Settings system
 */

// Storage information interface
export interface StorageInfo {
  used: number
  total: number
  free: number
  notes: number
  notebooks: number
  tags: number
  lastBackup?: string
  backupSize?: number
}

// Plugin settings interface
export interface PluginSettings {
  [pluginId: string]: {
    enabled: boolean
    config: Record<string, unknown>
    version?: string
    lastUpdated?: string
  }
}

// Electron API interface
export interface ElectronAPI {
  isElectron: boolean
  openConfigFolder?: () => Promise<void>
  getStorageInfo?: () => Promise<StorageInfo>
  exportSettings?: (settings: object) => Promise<void>
  importSettings?: () => Promise<object | null>
  openExternalLink?: (url: string) => Promise<void>
  getSystemInfo?: () => Promise<{
    platform: string
    version: string
    arch: string
  }>
}

// UNIFIED SETTINGS INTERFACE - Single source of truth for all settings
export interface AppSettings {
  // General
  defaultNotebook: string
  language: 'en' | 'en-gb' | 'es' | 'es-mx' | 'fr' | 'de' | 'it' | 'pt-br' | 'zh-cn' | 'ja' | 'ko'
  autoUpdates: boolean
  developmentMode: boolean
  
  // Theme & UI
  theme: 'light' | 'dark' | 'solarized' | 'hacklab' | 'system'
  syntaxTheme: 'default-dark' | 'default-light' | 'github' | 'monokai' | 'solarized'
  previewTheme: 'github' | 'gitlab' | 'minimal' | 'academic'
  customCSS: string
  customCSSEnabled: boolean
  autoToggleLightDark: boolean
  
  // Editor preferences
  fontSize: number
  fontFamily: string
  fontWeight: 'normal' | 'bold' | '300' | '400' | '500' | '600'
  lineHeight: number
  tabSize: number
  indentUnit: number
  wordWrap: boolean
  showLineNumbers: boolean
  showToolbar: boolean
  showInvisibleCharacters: boolean
  highlightActiveLine: boolean
  readableLineLength: boolean
  scrollPastEnd: boolean
  cursorScrollMargin: number
  pasteURLAsLink: boolean
  vimMode: boolean
  
  // Preview preferences
  previewFontSize: number
  previewPosition: 'right' | 'bottom' | 'hidden'
  livePreview: boolean
  mathJax: boolean
  mermaidDiagrams: boolean
  syntaxHighlighting: boolean
  isPreviewOpen: boolean
  
  // Keybindings
  keymapPreset: 'default' | 'vim' | 'vscode' | 'sublime'
  customKeybindings: Record<string, string>
  enableCustomKeybindings: boolean
  showKeybindingsInTooltips: boolean
  enableGlobalShortcuts: boolean
  
  // UI Layout
  sidebarWidth: number
  notesListWidth: number
  
  // Plugins
  enabledPlugins: string[]
  pluginSettings: PluginSettings
  
  // Sync
  syncProvider: 'none' | 'viny-sync' | 'custom'
  syncUrl: string
  syncEncryption: boolean
  autoSync: boolean
  
  // Backup
  autoBackup: boolean
  backupLocation: string
  backupRetentionDays: number
  backupFrequency: 'hourly' | 'daily' | 'weekly'
  
  // Behavior
  autoSave: boolean
  autoSaveInterval: number
  spellCheck: boolean
  defaultEditorMode: 'markdown' | 'monaco'
  
  // Privacy & Security
  analyticsEnabled: boolean
  crashReporting: boolean
  usageStatistics: boolean
  improveDataSharing: boolean
  localDataOnly: boolean
  encryptLocalStorage: boolean
  clearDataOnExit: boolean
  anonymousMode: boolean
  trackingProtection: boolean
  exportIncludeMetadata: boolean
  exportIncludeHistory: boolean
  dataRetentionDays: number
  autoDeleteOldData: boolean
  secureNoteDeletion: boolean
  lockAfterInactivity: boolean
  inactivityTimeoutMinutes: number
  requirePasswordOnStart: boolean
  biometricUnlock: boolean
  
  // Window state (Electron only)
  windowBounds: {
    x: number
    y: number
    width: number
    height: number
  }
  isMaximized: boolean
  
  // Tag customization
  tagColors: Record<string, string>
  customColors: Record<string, string>
}

// Default settings - consolidated from all sources
export const defaultAppSettings: AppSettings = {
  // General
  defaultNotebook: 'inbox',
  language: 'en',
  autoUpdates: true,
  developmentMode: false,
  
  // Theme & UI
  theme: 'hacklab',
  syntaxTheme: 'default-dark',
  previewTheme: 'github',
  customCSS: '',
  customCSSEnabled: false,
  autoToggleLightDark: false,
  
  // Editor preferences
  fontSize: 14,
  fontFamily: 'SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace',
  fontWeight: 'normal',
  lineHeight: 1.6,
  tabSize: 2,
  indentUnit: 2,
  wordWrap: true,
  showLineNumbers: true,
  showToolbar: true,
  showInvisibleCharacters: false,
  highlightActiveLine: false,
  readableLineLength: false,
  scrollPastEnd: true,
  cursorScrollMargin: 100,
  pasteURLAsLink: true,
  vimMode: false,
  
  // Preview preferences
  previewFontSize: 16,
  previewPosition: 'right',
  livePreview: true,
  mathJax: true,
  mermaidDiagrams: true,
  syntaxHighlighting: true,
  isPreviewOpen: true,
  
  // Keybindings
  keymapPreset: 'default',
  customKeybindings: {},
  enableCustomKeybindings: false,
  showKeybindingsInTooltips: false,
  enableGlobalShortcuts: false,
  
  // UI Layout
  sidebarWidth: 250,
  notesListWidth: 300,
  
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
  autoSaveInterval: 2000,
  spellCheck: true,
  defaultEditorMode: 'markdown',
  
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
  
  // Window state (Electron only)
  windowBounds: {
    x: 0,
    y: 0,
    width: 1200,
    height: 800
  },
  isMaximized: false,
  
  // Tag customization
  tagColors: {},
  customColors: {}
}


// Editing settings data interface
export interface EditingSettingsData {
  fontSize: number
  fontFamily: string
  fontWeight: string
  lineHeight: number
  tabSize: number
  indentUnit: number
  pasteURLAsLink: boolean
  showInvisibleCharacters: boolean
  showToolbar: boolean
  showLineNumbers: boolean
  wordWrap: boolean
  highlightActiveLine: boolean
  readableLineLength: boolean
  scrollPastEnd: boolean
  cursorScrollMargin: number
}

// Preview settings data interface
export interface PreviewSettingsData {
  previewFontSize: number
  livePreview: boolean
  mathJax: boolean
  mermaidDiagrams: boolean
  syntaxHighlighting: boolean
}

// Keybindings settings data interface
export interface KeybindingsSettingsData {
  keymapPreset: 'default' | 'vim' | 'vscode' | 'sublime'
  customKeybindings: Record<string, string>
}

// Backup settings data interface
export interface BackupSettingsData {
  autoBackup: boolean
  backupLocation: string
  backupRetentionDays: number
  backupFrequency: 'hourly' | 'daily' | 'weekly'
}

// Sync settings data interface
export interface SyncSettingsData {
  syncProvider: 'none' | 'viny-sync' | 'custom'
  syncUrl: string
  syncEncryption: boolean
  autoSync: boolean
}

// Type guard for window.electronAPI
export function isElectronAPI(obj: unknown): obj is ElectronAPI {
  return typeof obj === 'object' && obj !== null && 'isElectron' in obj
}

// Settings update callback types
export type SettingsUpdateCallback<T> = (updates: Partial<T>) => void
export type SettingsResetCallback = () => void