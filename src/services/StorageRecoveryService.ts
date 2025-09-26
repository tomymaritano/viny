/**
 * Storage Recovery Service
 * Handles storage corruption detection, data recovery, and backup management
 */

import { logger } from '../utils/logger'
import type { Note } from '../types'

export interface StorageValidationResult {
  isValid: boolean
  errors: string[]
  corruptedKeys: string[]
  recoverableData: Record<string, any>
}

export interface BackupMetadata {
  timestamp: string
  version: string
  dataSize: number
  checksum: string
}

export interface RecoveryOptions {
  clearCorrupted?: boolean
  preserveUserData?: boolean
  createBackup?: boolean
  autoRecover?: boolean
}

export class StorageRecoveryService {
  private static instance: StorageRecoveryService
  private readonly BACKUP_PREFIX = 'viny_backup_'
  private readonly RECOVERY_PREFIX = 'viny_recovery_'
  private readonly MAX_BACKUPS = 5

  private constructor() {}

  public static getInstance(): StorageRecoveryService {
    if (!StorageRecoveryService.instance) {
      StorageRecoveryService.instance = new StorageRecoveryService()
    }
    return StorageRecoveryService.instance
  }

  /**
   * Validates storage integrity and detects corruption
   */
  public async validateStorage(): Promise<StorageValidationResult> {
    const result: StorageValidationResult = {
      isValid: true,
      errors: [],
      corruptedKeys: [],
      recoverableData: {},
    }

    try {
      logger.debug('Starting storage validation')

      // Check if localStorage is accessible
      try {
        localStorage.setItem('storage_test', 'test')
        localStorage.removeItem('storage_test')
      } catch (error) {
        result.isValid = false
        result.errors.push('localStorage is not accessible')
        return result
      }

      // Validate each storage item
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (!key) continue

        try {
          const value = localStorage.getItem(key)
          if (value === null) {
            continue
          }

          // Try to parse JSON values
          if (this.isJSONKey(key)) {
            JSON.parse(value)
          }

          // Validate specific data structures
          if (key === 'viny-notes') {
            this.validateNotesData(value)
          } else if (key === 'viny-settings') {
            this.validateSettingsData(value)
          } else if (key === 'viny-notebooks') {
            this.validateNotebooksData(value)
          }
        } catch (error) {
          logger.warn('Storage validation error for key', {
            key,
            error: (error as Error).message,
          })

          result.isValid = false
          result.errors.push(`Corrupted data in key: ${key}`)
          result.corruptedKeys.push(key)

          // Try to recover what we can
          try {
            const rawValue = localStorage.getItem(key)
            if (rawValue) {
              result.recoverableData[key] = this.attemptDataRecovery(
                key,
                rawValue
              )
            }
          } catch (recoveryError) {
            logger.error('Failed to recover data for key', {
              key,
              error: (recoveryError as Error).message,
            })
          }
        }
      }

      logger.info('Storage validation completed', {
        isValid: result.isValid,
        errorCount: result.errors.length,
        corruptedKeys: result.corruptedKeys.length,
      })

      return result
    } catch (error) {
      logger.error('Storage validation failed', {
        error: (error as Error).message,
      })

      result.isValid = false
      result.errors.push(`Validation failed: ${(error as Error).message}`)
      return result
    }
  }

  /**
   * Creates a backup of current storage
   */
  public async createBackup(): Promise<string> {
    try {
      const timestamp = new Date().toISOString()
      const backupKey = `${this.BACKUP_PREFIX}${timestamp}`

      const backup: Record<string, any> = {}
      const metadata: BackupMetadata = {
        timestamp,
        version: '1.5.0', // Current app version
        dataSize: 0,
        checksum: '',
      }

      // Collect all storage data
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (
          key &&
          !key.startsWith(this.BACKUP_PREFIX) &&
          !key.startsWith(this.RECOVERY_PREFIX)
        ) {
          const value = localStorage.getItem(key)
          if (value) {
            backup[key] = value
          }
        }
      }

      // Calculate metadata
      const backupString = JSON.stringify(backup)
      metadata.dataSize = backupString.length
      metadata.checksum = this.calculateChecksum(backupString)

      // Store backup
      const backupData = {
        metadata,
        data: backup,
      }

      localStorage.setItem(backupKey, JSON.stringify(backupData))

      // Clean up old backups
      await this.cleanupOldBackups()

      logger.info('Storage backup created', {
        backupKey,
        dataSize: metadata.dataSize,
        checksum: metadata.checksum,
      })

      return backupKey
    } catch (error) {
      logger.error('Failed to create storage backup', {
        error: (error as Error).message,
      })
      throw new Error(`Backup creation failed: ${(error as Error).message}`)
    }
  }

  /**
   * Recovers storage from corruption
   */
  public async recoverStorage(options: RecoveryOptions = {}): Promise<boolean> {
    const {
      clearCorrupted = true,
      preserveUserData = true,
      createBackup = true,
      autoRecover = false,
    } = options

    try {
      logger.info('Starting storage recovery', options)

      // Create backup before recovery
      if (createBackup) {
        await this.createBackup()
      }

      // Validate current storage
      const validation = await this.validateStorage()

      if (validation.isValid) {
        logger.info('Storage is already valid, no recovery needed')
        return true
      }

      // Clear corrupted keys
      if (clearCorrupted) {
        for (const key of validation.corruptedKeys) {
          try {
            localStorage.removeItem(key)
            logger.debug('Removed corrupted key', { key })
          } catch (error) {
            logger.warn('Failed to remove corrupted key', {
              key,
              error: (error as Error).message,
            })
          }
        }
      }

      // Attempt to restore from recoverable data
      if (
        preserveUserData &&
        Object.keys(validation.recoverableData).length > 0
      ) {
        for (const [key, data] of Object.entries(validation.recoverableData)) {
          if (data) {
            try {
              localStorage.setItem(
                key,
                typeof data === 'string' ? data : JSON.stringify(data)
              )
              logger.debug('Restored data for key', { key })
            } catch (error) {
              logger.warn('Failed to restore data for key', {
                key,
                error: (error as Error).message,
              })
            }
          }
        }
      }

      // Try to restore from latest backup if auto-recovery is enabled
      if (autoRecover) {
        const restored = await this.restoreFromLatestBackup()
        if (restored) {
          logger.info('Auto-recovery from backup successful')
          return true
        }
      }

      // Final validation
      const finalValidation = await this.validateStorage()
      const recoverySuccessful = finalValidation.isValid

      logger.info('Storage recovery completed', {
        successful: recoverySuccessful,
        clearedKeys: validation.corruptedKeys.length,
        restoredKeys: Object.keys(validation.recoverableData).length,
      })

      return recoverySuccessful
    } catch (error) {
      logger.error('Storage recovery failed', {
        error: (error as Error).message,
      })
      return false
    }
  }

  /**
   * Restores storage from the latest backup
   */
  public async restoreFromLatestBackup(): Promise<boolean> {
    try {
      const backups = this.getAvailableBackups()

      if (backups.length === 0) {
        logger.warn('No backups available for restoration')
        return false
      }

      // Get the most recent backup
      const latestBackup = backups[0]

      const backupData = localStorage.getItem(latestBackup)
      if (!backupData) {
        logger.error('Backup data not found', { backupKey: latestBackup })
        return false
      }

      const backup = JSON.parse(backupData)

      // Verify backup integrity
      const calculatedChecksum = this.calculateChecksum(
        JSON.stringify(backup.data)
      )
      if (calculatedChecksum !== backup.metadata.checksum) {
        logger.error('Backup checksum mismatch', {
          expected: backup.metadata.checksum,
          calculated: calculatedChecksum,
        })
        return false
      }

      // Clear current storage (except backups)
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i)
        if (
          key &&
          !key.startsWith(this.BACKUP_PREFIX) &&
          !key.startsWith(this.RECOVERY_PREFIX)
        ) {
          localStorage.removeItem(key)
        }
      }

      // Restore data
      for (const [key, value] of Object.entries(backup.data)) {
        localStorage.setItem(key, value as string)
      }

      logger.info('Storage restored from backup', {
        backupKey: latestBackup,
        timestamp: backup.metadata.timestamp,
        dataSize: backup.metadata.dataSize,
      })

      return true
    } catch (error) {
      logger.error('Failed to restore from backup', {
        error: (error as Error).message,
      })
      return false
    }
  }

  /**
   * Gets list of available backups
   */
  public getAvailableBackups(): string[] {
    const backups: string[] = []

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(this.BACKUP_PREFIX)) {
        backups.push(key)
      }
    }

    // Sort by timestamp (newest first)
    return backups.sort((a, b) => {
      const timestampA = a.replace(this.BACKUP_PREFIX, '')
      const timestampB = b.replace(this.BACKUP_PREFIX, '')
      return timestampB.localeCompare(timestampA)
    })
  }

  // Private helper methods

  private isJSONKey(key: string): boolean {
    const jsonKeys = [
      'viny-notes',
      'viny-settings',
      'viny-notebooks',
      'viny-templates',
    ]
    return jsonKeys.some(pattern => key.includes(pattern))
  }

  private validateNotesData(data: string): void {
    const notes = JSON.parse(data)

    if (!Array.isArray(notes)) {
      throw new Error('Notes data must be an array')
    }

    for (const note of notes) {
      if (!note.id || typeof note.id !== 'string') {
        throw new Error('Note missing valid ID')
      }
      if (!note.title || typeof note.title !== 'string') {
        throw new Error('Note missing valid title')
      }
    }
  }

  private validateSettingsData(data: string): void {
    const settings = JSON.parse(data)

    if (typeof settings !== 'object' || settings === null) {
      throw new Error('Settings data must be an object')
    }
  }

  private validateNotebooksData(data: string): void {
    const notebooks = JSON.parse(data)

    if (!Array.isArray(notebooks)) {
      throw new Error('Notebooks data must be an array')
    }
  }

  private attemptDataRecovery(key: string, value: string): any {
    // Try to extract partial JSON data
    if (this.isJSONKey(key)) {
      try {
        // Try to fix common JSON issues
        const fixedValue = value
          .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
          .replace(/([{,]\s*)(\w+):/g, '$1"$2":') // Quote unquoted keys
          .replace(/'/g, '"') // Replace single quotes with double quotes

        return JSON.parse(fixedValue)
      } catch (error) {
        // If JSON recovery fails, try to extract readable content
        const matches = value.match(/"([^"]*)":\s*"([^"]*)"/g)
        if (matches) {
          const recovered: Record<string, string> = {}
          for (const match of matches) {
            const [, k, v] = match.match(/"([^"]*)":\s*"([^"]*)"/) || []
            if (k && v) {
              recovered[k] = v
            }
          }
          return recovered
        }
      }
    }

    return value // Return as-is if no recovery possible
  }

  private calculateChecksum(data: string): string {
    // Simple hash function for checksum
    let hash = 0
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return hash.toString(36)
  }

  private async cleanupOldBackups(): Promise<void> {
    const backups = this.getAvailableBackups()

    if (backups.length <= this.MAX_BACKUPS) {
      return
    }

    const backupsToRemove = backups.slice(this.MAX_BACKUPS)

    for (const backup of backupsToRemove) {
      try {
        localStorage.removeItem(backup)
        logger.debug('Removed old backup', { backupKey: backup })
      } catch (error) {
        logger.warn('Failed to remove old backup', {
          backupKey: backup,
          error: (error as Error).message,
        })
      }
    }
  }
}

// Export singleton instance
export const storageRecovery = StorageRecoveryService.getInstance()
