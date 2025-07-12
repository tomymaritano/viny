// Settings types - replacing [key: string]: any

export interface EditorSettings {
  fontSize: number
  fontFamily: string
  lineHeight: number
  tabSize: number
  wordWrap: boolean
  lineNumbers: boolean
  bracketMatching: boolean
  autoCloseBrackets: boolean
  autoIndent: boolean
  theme: string
}

export interface GeneralSettings {
  theme: 'light' | 'dark' | 'solarized' | 'system'
  language: string
  timezone: string
  dateFormat: string
  timeFormat: '12h' | '24h'
  autoSave: boolean
  autoSaveDelay: number
  confirmDelete: boolean
  showLineNumbers: boolean
  spellCheck: boolean
}

export interface TypographySettings {
  editorFontSize: number
  editorFontFamily: string
  editorLineHeight: number
  previewFontSize: number
  previewFontFamily: string
  previewLineHeight: number
}

export interface UISettings {
  sidebarWidth: number
  showPreview: boolean
  previewPosition: 'right' | 'bottom'
  compactMode: boolean
  showToolbar: boolean
  showStatusBar: boolean
  animations: boolean
}

export interface PrivacySettings {
  analytics: boolean
  crashReporting: boolean
  telemetry: boolean
  shareUsageData: boolean
}

export interface BackupSettings {
  enabled: boolean
  frequency: 'daily' | 'weekly' | 'monthly'
  retention: number
  location: string
  cloudSync: boolean
}

export interface Settings {
  general: GeneralSettings
  editor: EditorSettings
  typography: TypographySettings
  ui: UISettings
  privacy: PrivacySettings
  backup: BackupSettings
  version: string
  lastModified: string
}

// Default settings
export const DEFAULT_SETTINGS: Settings = {
  general: {
    theme: 'dark',
    language: 'en',
    timezone: 'auto',
    dateFormat: 'MM/dd/yyyy',
    timeFormat: '12h',
    autoSave: true,
    autoSaveDelay: 1000,
    confirmDelete: true,
    showLineNumbers: false,
    spellCheck: true
  },
  editor: {
    fontSize: 14,
    fontFamily: 'SF Mono, Monaco, Consolas, monospace',
    lineHeight: 1.6,
    tabSize: 2,
    wordWrap: true,
    lineNumbers: false,
    bracketMatching: true,
    autoCloseBrackets: true,
    autoIndent: true,
    theme: 'dark'
  },
  typography: {
    editorFontSize: 14,
    editorFontFamily: 'SF Mono, Monaco, Consolas, monospace',
    editorLineHeight: 1.6,
    previewFontSize: 16,
    previewFontFamily: 'system-ui, -apple-system, sans-serif',
    previewLineHeight: 1.7
  },
  ui: {
    sidebarWidth: 280,
    showPreview: true,
    previewPosition: 'right',
    compactMode: false,
    showToolbar: true,
    showStatusBar: true,
    animations: true
  },
  privacy: {
    analytics: false,
    crashReporting: true,
    telemetry: false,
    shareUsageData: false
  },
  backup: {
    enabled: true,
    frequency: 'daily',
    retention: 30,
    location: 'local',
    cloudSync: false
  },
  version: '1.0.0',
  lastModified: new Date().toISOString()
}

// Type guards
export const isValidSettings = (settings: unknown): settings is Settings => {
  return (
    typeof settings === 'object' &&
    settings !== null &&
    'general' in settings &&
    'editor' in settings &&
    'typography' in settings &&
    'ui' in settings &&
    'privacy' in settings &&
    'backup' in settings
  )
}

export const isValidTheme = (theme: string): theme is GeneralSettings['theme'] => {
  return ['light', 'dark', 'solarized', 'system'].includes(theme)
}

// Settings update types
export type SettingsUpdate = Partial<Settings>
export type GeneralSettingsUpdate = Partial<GeneralSettings>
export type EditorSettingsUpdate = Partial<EditorSettings>
export type TypographySettingsUpdate = Partial<TypographySettings>
export type UISettingsUpdate = Partial<UISettings>
export type PrivacySettingsUpdate = Partial<PrivacySettings>
export type BackupSettingsUpdate = Partial<BackupSettings>