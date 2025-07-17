import type { SettingValue } from './types'
import { SettingsBackupManager } from './backup'

export interface AutoBackupConfig {
  enabled: boolean
  intervalHours: number
  maxBackups: number
  onSuccess?: (backupId: string) => void
  onError?: (error: Error) => void
}

export class AutoBackupService {
  private static instance: AutoBackupService | null = null
  private intervalId: NodeJS.Timeout | null = null
  private config: AutoBackupConfig
  private isRunning = false

  private constructor(config: AutoBackupConfig) {
    this.config = config
  }

  static getInstance(config?: AutoBackupConfig): AutoBackupService {
    if (!AutoBackupService.instance && config) {
      AutoBackupService.instance = new AutoBackupService(config)
    }
    return AutoBackupService.instance!
  }

  /**
   * Start automatic backup service
   */
  start(settings: Record<string, SettingValue>): void {
    if (this.isRunning || !this.config.enabled) {
      return
    }

    this.isRunning = true
    const intervalMs = this.config.intervalHours * 60 * 60 * 1000

    // Create initial backup
    this.createBackup(settings)

    // Schedule recurring backups
    this.intervalId = setInterval(() => {
      this.createBackup(settings)
    }, intervalMs)

    console.info(`Auto backup started: every ${this.config.intervalHours} hours`)
  }

  /**
   * Stop automatic backup service
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
    this.isRunning = false
    console.info('Auto backup stopped')
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<AutoBackupConfig>): void {
    const wasRunning = this.isRunning
    
    if (wasRunning) {
      this.stop()
    }

    this.config = { ...this.config, ...newConfig }

    // Restart if it was running and still enabled
    if (wasRunning && this.config.enabled) {
      // We need the current settings to restart - this should be handled by the caller
      console.info('Auto backup config updated - manual restart required')
    }
  }

  /**
   * Create a backup with cleanup
   */
  private async createBackup(settings: Record<string, SettingValue>): Promise<void> {
    try {
      const backupId = await SettingsBackupManager.createBackup(settings, {
        description: `Auto backup - ${new Date().toLocaleString()}`
      })

      // Clean up old backups if we exceed the limit
      await this.cleanupOldBackups()

      this.config.onSuccess?.(backupId)
      console.info(`Auto backup created: ${backupId}`)
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Auto backup failed')
      this.config.onError?.(err)
      console.error('Auto backup failed:', err)
    }
  }

  /**
   * Remove old backups to stay within the limit
   */
  private async cleanupOldBackups(): Promise<void> {
    try {
      const backups = await SettingsBackupManager.getBackups()
      
      // Filter auto backups (those with "Auto backup" in description)
      const autoBackups = backups
        .filter(backup => backup.metadata?.description?.includes('Auto backup'))
        .sort((a, b) => b.timestamp - a.timestamp) // Sort by newest first

      // Remove excess backups
      if (autoBackups.length > this.config.maxBackups) {
        const toDelete = autoBackups.slice(this.config.maxBackups)
        
        for (const backup of toDelete) {
          await SettingsBackupManager.deleteBackup(backup.id)
          console.info(`Auto cleanup: deleted backup ${backup.id}`)
        }
      }
    } catch (error) {
      console.error('Auto backup cleanup failed:', error)
    }
  }

  /**
   * Get current status
   */
  getStatus(): {
    isRunning: boolean
    config: AutoBackupConfig
    nextBackupIn?: number // milliseconds
  } {
    let nextBackupIn: number | undefined

    if (this.isRunning && this.intervalId) {
      // This is an approximation - we don't track exact next backup time
      nextBackupIn = this.config.intervalHours * 60 * 60 * 1000
    }

    return {
      isRunning: this.isRunning,
      config: this.config,
      nextBackupIn
    }
  }

  /**
   * Force a manual backup (doesn't count against auto backup limit)
   */
  async forceBackup(settings: Record<string, SettingValue>, description?: string): Promise<string> {
    return SettingsBackupManager.createBackup(settings, {
      description: description || `Manual backup - ${new Date().toLocaleString()}`
    })
  }

  /**
   * Get recommended backup interval based on usage patterns
   */
  static getRecommendedInterval(settingsChangeFrequency: 'low' | 'medium' | 'high'): number {
    switch (settingsChangeFrequency) {
      case 'low':
        return 168 // 1 week
      case 'medium':
        return 24 // 1 day
      case 'high':
        return 6 // 6 hours
      default:
        return 24
    }
  }

  /**
   * Initialize with default configuration
   */
  static createWithDefaults(): AutoBackupService {
    return AutoBackupService.getInstance({
      enabled: true,
      intervalHours: 24, // Daily backups
      maxBackups: 7, // Keep 1 week of daily backups
      onSuccess: (backupId) => {
        console.info(`Auto backup successful: ${backupId}`)
      },
      onError: (error) => {
        console.error('Auto backup error:', error)
      }
    })
  }
}