import type { SettingValue } from './types'

export interface SettingsBackup {
  id: string
  timestamp: number
  version: string
  settings: Record<string, SettingValue>
  metadata?: {
    userAgent?: string
    platform?: string
    appVersion?: string
    description?: string
  }
}

export interface BackupOptions {
  includeExperimental?: boolean
  includeSensitive?: boolean
  categories?: string[]
  description?: string
}

export class SettingsBackupManager {
  private static readonly BACKUP_KEY = 'viny_settings_backups'
  private static readonly MAX_BACKUPS = 10

  /**
   * Create a backup of current settings
   */
  static async createBackup(
    settings: Record<string, SettingValue>,
    options: BackupOptions = {}
  ): Promise<string> {
    const backupId = `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const backup: SettingsBackup = {
      id: backupId,
      timestamp: Date.now(),
      version: '1.0.0',
      settings: { ...settings },
      metadata: {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        appVersion: process.env.REACT_APP_VERSION || '1.0.0',
        description: options.description
      }
    }

    // Filter settings based on options
    if (options.categories && options.categories.length > 0) {
      // This would need access to schema registry to filter by categories
      // For now, we'll include all settings
    }

    const existingBackups = await this.getBackups()
    const updatedBackups = [backup, ...existingBackups].slice(0, this.MAX_BACKUPS)
    
    localStorage.setItem(this.BACKUP_KEY, JSON.stringify(updatedBackups))
    
    return backupId
  }

  /**
   * Get all available backups
   */
  static async getBackups(): Promise<SettingsBackup[]> {
    try {
      const backupsJson = localStorage.getItem(this.BACKUP_KEY)
      return backupsJson ? JSON.parse(backupsJson) : []
    } catch (error) {
      console.error('Failed to load backups:', error)
      return []
    }
  }

  /**
   * Get a specific backup by ID
   */
  static async getBackup(backupId: string): Promise<SettingsBackup | null> {
    const backups = await this.getBackups()
    return backups.find(backup => backup.id === backupId) || null
  }

  /**
   * Restore settings from a backup
   */
  static async restoreBackup(backupId: string): Promise<Record<string, SettingValue> | null> {
    const backup = await this.getBackup(backupId)
    if (!backup) {
      throw new Error(`Backup with ID ${backupId} not found`)
    }

    return backup.settings
  }

  /**
   * Delete a specific backup
   */
  static async deleteBackup(backupId: string): Promise<boolean> {
    const backups = await this.getBackups()
    const filteredBackups = backups.filter(backup => backup.id !== backupId)
    
    if (filteredBackups.length === backups.length) {
      return false // Backup not found
    }

    localStorage.setItem(this.BACKUP_KEY, JSON.stringify(filteredBackups))
    return true
  }

  /**
   * Delete all backups
   */
  static async clearBackups(): Promise<void> {
    localStorage.removeItem(this.BACKUP_KEY)
  }

  /**
   * Export backup to file
   */
  static async exportBackup(backupId: string): Promise<string> {
    const backup = await this.getBackup(backupId)
    if (!backup) {
      throw new Error(`Backup with ID ${backupId} not found`)
    }

    return JSON.stringify(backup, null, 2)
  }

  /**
   * Import backup from file data
   */
  static async importBackup(backupData: string): Promise<string> {
    try {
      const backup: SettingsBackup = JSON.parse(backupData)
      
      // Validate backup structure
      if (!backup.id || !backup.timestamp || !backup.settings) {
        throw new Error('Invalid backup format')
      }

      // Generate new ID to avoid conflicts
      const newId = `imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      backup.id = newId

      const existingBackups = await this.getBackups()
      const updatedBackups = [backup, ...existingBackups].slice(0, this.MAX_BACKUPS)
      
      localStorage.setItem(this.BACKUP_KEY, JSON.stringify(updatedBackups))
      
      return newId
    } catch (error) {
      throw new Error(`Failed to import backup: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get backup statistics
   */
  static async getBackupStats(): Promise<{
    totalBackups: number
    oldestBackup?: Date
    newestBackup?: Date
    totalSize: number
  }> {
    const backups = await this.getBackups()
    const totalSize = JSON.stringify(backups).length

    return {
      totalBackups: backups.length,
      oldestBackup: backups.length > 0 ? new Date(Math.min(...backups.map(b => b.timestamp))) : undefined,
      newestBackup: backups.length > 0 ? new Date(Math.max(...backups.map(b => b.timestamp))) : undefined,
      totalSize
    }
  }

  /**
   * Schedule automatic backup
   */
  static scheduleAutoBackup(settings: Record<string, SettingValue>, intervalMs: number = 24 * 60 * 60 * 1000): () => void {
    const interval = setInterval(async () => {
      try {
        await this.createBackup(settings, {
          description: 'Automatic backup'
        })
      } catch (error) {
        console.error('Auto backup failed:', error)
      }
    }, intervalMs)

    return () => clearInterval(interval)
  }
}