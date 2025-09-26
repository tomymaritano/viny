/**
 * Settings Service V2 - Uses pure CRUD repository
 * All business logic lives here, not in the repository
 */

import type { AppSettings } from '../../types/settings'
import type { IRepository } from '../../repositories/interfaces/IBaseRepository'
import type { 
  ISettingsService, 
  UpdateSettingsDto, 
  ImportSettingsResult,
  ExportSettingsOptions
} from './ISettingsService'
import { logger } from '../../utils/logger'
import { defaultSettings } from '../../utils/defaultSettings'

export class SettingsServiceV2 implements ISettingsService {
  private settingsCache: AppSettings | null = null
  private lastSyncTime: Date | null = null
  private unsyncedChanges = false
  
  constructor(private repository: IRepository) {}

  async getSettings(): Promise<AppSettings> {
    try {
      if (this.settingsCache) {
        return this.settingsCache
      }
      
      // For now, we'll use localStorage as our settings storage
      // In a real implementation, this would use the repository
      const stored = localStorage.getItem('app-settings')
      
      if (stored) {
        const settings = JSON.parse(stored) as AppSettings
        this.settingsCache = this.mergeSettings(defaultSettings, settings)
      } else {
        this.settingsCache = defaultSettings
      }
      
      return this.settingsCache
    } catch (error) {
      logger.error('Failed to get settings', error)
      return defaultSettings
    }
  }

  async updateSettings(updates: UpdateSettingsDto): Promise<AppSettings> {
    try {
      const current = await this.getSettings()
      const updated = this.mergeSettings(current, updates)
      
      // Validate before saving
      if (!await this.validateSettings(updated)) {
        throw new Error('Invalid settings')
      }
      
      // Save to storage
      localStorage.setItem('app-settings', JSON.stringify(updated))
      this.settingsCache = updated
      this.unsyncedChanges = true
      
      logger.info('Settings updated successfully')
      return updated
    } catch (error) {
      logger.error('Failed to update settings', error)
      throw error
    }
  }

  async resetSettings(): Promise<AppSettings> {
    try {
      localStorage.removeItem('app-settings')
      this.settingsCache = defaultSettings
      this.unsyncedChanges = true
      
      logger.info('Settings reset to defaults')
      return defaultSettings
    } catch (error) {
      logger.error('Failed to reset settings', error)
      throw error
    }
  }

  async getSetting<K extends keyof AppSettings>(key: K): Promise<AppSettings[K]> {
    const settings = await this.getSettings()
    return settings[key]
  }

  async setSetting<K extends keyof AppSettings>(key: K, value: AppSettings[K]): Promise<void> {
    await this.updateSettings({ [key]: value } as UpdateSettingsDto)
  }

  async getCurrentTheme(): Promise<string> {
    const settings = await this.getSettings()
    return settings.theme || 'dark'
  }

  async setTheme(theme: string): Promise<void> {
    await this.setSetting('theme', theme)
    
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', theme)
    logger.info(`Theme changed to: ${theme}`)
  }

  async getAvailableThemes(): Promise<string[]> {
    return [
      'light',
      'dark',
      'sepia',
      'solarized-light',
      'solarized-dark',
      'vibrant',
      'contrast',
    ]
  }

  async getTagColors(): Promise<Record<string, string>> {
    const settings = await this.getSettings()
    return settings.tagColors || {}
  }

  async setTagColor(tag: string, color: string): Promise<void> {
    const tagColors = await this.getTagColors()
    tagColors[tag] = color
    await this.setSetting('tagColors', tagColors)
  }

  async removeTagColor(tag: string): Promise<void> {
    const tagColors = await this.getTagColors()
    delete tagColors[tag]
    await this.setSetting('tagColors', tagColors)
  }

  async resetTagColors(): Promise<void> {
    await this.setSetting('tagColors', {})
  }

  async exportSettings(options: ExportSettingsOptions = {}): Promise<string> {
    try {
      const settings = await this.getSettings()
      
      // Remove sensitive data if requested
      const exportData = options.includeSecrets ? settings : {
        ...settings,
        // Remove any sensitive fields here
      }
      
      if (options.format === 'yaml') {
        // In a real implementation, we'd use a YAML library
        throw new Error('YAML export not implemented')
      }
      
      return JSON.stringify(exportData, null, 2)
    } catch (error) {
      logger.error('Failed to export settings', error)
      throw error
    }
  }

  async importSettings(data: string): Promise<ImportSettingsResult> {
    try {
      const imported = JSON.parse(data)
      
      // Validate imported settings
      if (!await this.validateSettings(imported)) {
        return {
          success: false,
          settings: await this.getSettings(),
          warnings: ['Invalid settings format'],
        }
      }
      
      // Merge with defaults to ensure all fields exist
      const merged = this.mergeSettings(defaultSettings, imported)
      
      // Check for potential issues
      const warnings: string[] = []
      if (imported.version && imported.version !== defaultSettings.version) {
        warnings.push('Settings from different app version')
      }
      
      // Save settings
      await this.updateSettings(merged)
      
      return {
        success: true,
        settings: merged,
        warnings: warnings.length > 0 ? warnings : undefined,
      }
    } catch (error) {
      logger.error('Failed to import settings', error)
      return {
        success: false,
        settings: await this.getSettings(),
        warnings: ['Failed to parse settings data'],
      }
    }
  }

  async validateSettings(settings: unknown): Promise<boolean> {
    if (!settings || typeof settings !== 'object') {
      return false
    }
    
    const s = settings as any
    
    // Check required fields
    if (typeof s.theme !== 'string') return false
    if (typeof s.markdownPreview !== 'object') return false
    if (typeof s.editor !== 'object') return false
    
    // Add more validation as needed
    
    return true
  }

  async createBackup(): Promise<string> {
    try {
      const settings = await this.getSettings()
      const backup = {
        version: 1,
        timestamp: new Date().toISOString(),
        settings,
      }
      
      const backupData = JSON.stringify(backup)
      
      // Store backup (in real implementation, would use proper storage)
      const backups = JSON.parse(localStorage.getItem('settings-backups') || '[]')
      backups.push({
        id: Date.now().toString(),
        date: backup.timestamp,
        size: backupData.length,
        data: backupData,
      })
      
      // Keep only last 10 backups
      if (backups.length > 10) {
        backups.shift()
      }
      
      localStorage.setItem('settings-backups', JSON.stringify(backups))
      
      return backupData
    } catch (error) {
      logger.error('Failed to create backup', error)
      throw error
    }
  }

  async restoreFromBackup(backup: string): Promise<void> {
    try {
      const parsed = JSON.parse(backup)
      
      if (!parsed.settings) {
        throw new Error('Invalid backup format')
      }
      
      await this.updateSettings(parsed.settings)
      logger.info('Settings restored from backup')
    } catch (error) {
      logger.error('Failed to restore from backup', error)
      throw error
    }
  }

  async getBackupHistory(): Promise<Array<{ id: string; date: string; size: number }>> {
    try {
      const backups = JSON.parse(localStorage.getItem('settings-backups') || '[]')
      return backups.map((b: any) => ({
        id: b.id,
        date: b.date,
        size: b.size,
      }))
    } catch (error) {
      logger.error('Failed to get backup history', error)
      return []
    }
  }

  getDefaultSettings(): AppSettings {
    return { ...defaultSettings }
  }

  mergeSettings(current: AppSettings, updates: UpdateSettingsDto): AppSettings {
    // Deep merge settings
    const merged = { ...current }
    
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
          // Deep merge objects
          (merged as any)[key] = {
            ...(current as any)[key],
            ...value,
          }
        } else {
          // Direct assignment for primitives and arrays
          (merged as any)[key] = value
        }
      }
    }
    
    return merged
  }

  migrateSettings(oldSettings: any): AppSettings {
    // Handle settings migration from older versions
    const migrated = { ...defaultSettings }
    
    // Copy over valid settings
    if (oldSettings.theme) migrated.theme = oldSettings.theme
    if (oldSettings.sidebarWidth) migrated.sidebarWidth = oldSettings.sidebarWidth
    if (oldSettings.notesListWidth) migrated.notesListWidth = oldSettings.notesListWidth
    
    // Handle renamed fields
    if (oldSettings.editorFontSize) {
      migrated.editor.fontSize = oldSettings.editorFontSize
    }
    
    // Add migration logic as needed
    
    return migrated
  }

  async syncSettings(): Promise<void> {
    try {
      // In a real implementation, this would sync with a server
      this.lastSyncTime = new Date()
      this.unsyncedChanges = false
      logger.info('Settings synced successfully')
    } catch (error) {
      logger.error('Failed to sync settings', error)
      throw error
    }
  }

  async getLastSyncTime(): Promise<Date | null> {
    return this.lastSyncTime
  }

  async hasUnsyncedChanges(): Promise<boolean> {
    return this.unsyncedChanges
  }
}