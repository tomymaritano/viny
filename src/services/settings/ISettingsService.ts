/**
 * Settings Service Interface
 * Defines the contract for settings business logic operations
 */

import type { AppSettings } from '../../types/settings'

export interface UpdateSettingsDto extends Partial<AppSettings> {}

export interface ImportSettingsResult {
  success: boolean
  settings: AppSettings
  warnings?: string[]
}

export interface ExportSettingsOptions {
  includeSecrets?: boolean
  format?: 'json' | 'yaml'
}

export interface ISettingsService {
  // Basic operations
  getSettings(): Promise<AppSettings>
  updateSettings(updates: UpdateSettingsDto): Promise<AppSettings>
  resetSettings(): Promise<AppSettings>
  
  // Specific setting getters
  getSetting<K extends keyof AppSettings>(key: K): Promise<AppSettings[K]>
  setSetting<K extends keyof AppSettings>(key: K, value: AppSettings[K]): Promise<void>
  
  // Theme management
  getCurrentTheme(): Promise<string>
  setTheme(theme: string): Promise<void>
  getAvailableThemes(): Promise<string[]>
  
  // Tag colors
  getTagColors(): Promise<Record<string, string>>
  setTagColor(tag: string, color: string): Promise<void>
  removeTagColor(tag: string): Promise<void>
  resetTagColors(): Promise<void>
  
  // Import/Export
  exportSettings(options?: ExportSettingsOptions): Promise<string>
  importSettings(data: string): Promise<ImportSettingsResult>
  validateSettings(settings: unknown): Promise<boolean>
  
  // Backup/Restore
  createBackup(): Promise<string>
  restoreFromBackup(backup: string): Promise<void>
  getBackupHistory(): Promise<Array<{ id: string; date: string; size: number }>>
  
  // Advanced settings
  getDefaultSettings(): AppSettings
  mergeSettings(current: AppSettings, updates: UpdateSettingsDto): AppSettings
  migrateSettings(oldSettings: any): AppSettings
  
  // Sync
  syncSettings(): Promise<void>
  getLastSyncTime(): Promise<Date | null>
  hasUnsyncedChanges(): Promise<boolean>
}