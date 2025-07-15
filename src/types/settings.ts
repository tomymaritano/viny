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

// General settings data interface
export interface GeneralSettingsData {
  defaultNotebook: string
  language: string
  autoUpdates: boolean
  developmentMode: boolean
}

// Theme settings data interface
export interface ThemeSettingsData {
  uiTheme: 'light' | 'dark' | 'solarized' | 'system'
  syntaxTheme: string
  previewTheme: string
  customCSS: string
  autoToggleLightDark: boolean
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
  previewPosition: 'right' | 'bottom' | 'hidden'
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