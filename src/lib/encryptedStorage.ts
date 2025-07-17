/**
 * Viny Encrypted Storage
 * Secure wrapper for localStorage with end-to-end encryption
 */

import { encryptionService, isDataEncrypted } from '../services/EncryptionService'
import { logger } from '../utils/logger'

export interface StorageOptions {
  encrypt?: boolean
  context?: string
  fallbackToPlaintext?: boolean
}

export interface EncryptedStorageStats {
  totalKeys: number
  encryptedKeys: number
  plaintextKeys: number
  storageSize: number
  encryptionRatio: number
}

/**
 * Encrypted Storage Service
 * Provides transparent encryption/decryption for localStorage
 */
export class EncryptedStorage {
  private readonly ENCRYPTION_PREFIX = 'viny_encrypted_'
  private readonly LEGACY_PREFIX = 'viny_'
  private encryptionEnabled: boolean = false

  constructor() {
    this.initializeStorage()
  }

  private initializeStorage(): void {
    logger.info('EncryptedStorage: Initializing encrypted storage system')
    
    // Check if encryption service is available
    this.encryptionEnabled = encryptionService.isEncryptionActive()
    
    if (this.encryptionEnabled) {
      logger.info('EncryptedStorage: Encryption is active')
    } else {
      logger.warn('EncryptedStorage: Encryption not active, using plaintext storage')
    }
  }

  /**
   * Store data with optional encryption
   */
  async setItem(key: string, value: any, options: StorageOptions = {}): Promise<boolean> {
    try {
      const {
        encrypt = this.encryptionEnabled,
        context = 'storage',
        fallbackToPlaintext = true
      } = options

      logger.debug(`EncryptedStorage: Setting item ${key} (encrypt: ${encrypt})`)

      if (encrypt && encryptionService.isEncryptionActive()) {
        // Use encryption service for secure storage
        const success = await encryptionService.encryptForStorage(key, value)
        if (success) {
          logger.debug(`EncryptedStorage: Successfully encrypted and stored: ${key}`)
          return true
        } else if (fallbackToPlaintext) {
          logger.warn(`EncryptedStorage: Encryption failed for ${key}, falling back to plaintext`)
          // Fall through to plaintext storage
        } else {
          logger.error(`EncryptedStorage: Encryption failed for ${key}, no fallback allowed`)
          return false
        }
      }

      // Store as plaintext (legacy or fallback)
      const storageKey = this.LEGACY_PREFIX + key
      localStorage.setItem(storageKey, JSON.stringify({
        encrypted: false,
        data: value,
        storedAt: Date.now(),
        version: '1.0'
      }))

      logger.debug(`EncryptedStorage: Stored as plaintext: ${key}`)
      return true

    } catch (error) {
      logger.error(`EncryptedStorage: Failed to store item ${key}:`, error)
      return false
    }
  }

  /**
   * Retrieve data with automatic decryption
   */
  async getItem(key: string, options: StorageOptions = {}): Promise<any | null> {
    try {
      const { context = 'storage' } = options

      logger.debug(`EncryptedStorage: Getting item ${key}`)

      // Try encrypted storage first
      if (encryptionService.isEncryptionActive()) {
        const decrypted = await encryptionService.decryptFromStorage(key)
        if (decrypted !== null) {
          logger.debug(`EncryptedStorage: Successfully decrypted: ${key}`)
          return decrypted
        }
      }

      // Try plaintext storage (legacy)
      const plaintextKey = this.LEGACY_PREFIX + key
      const plaintextData = localStorage.getItem(plaintextKey)
      
      if (plaintextData) {
        try {
          const parsed = JSON.parse(plaintextData)
          if (parsed && typeof parsed === 'object') {
            // Check if it's our structured format
            if (parsed.hasOwnProperty('data')) {
              logger.debug(`EncryptedStorage: Retrieved plaintext data: ${key}`)
              return parsed.data
            }
            // Return raw parsed data for legacy format
            return parsed
          }
          return parsed
        } catch (parseError) {
          // Return raw string if JSON parsing fails
          logger.debug(`EncryptedStorage: Retrieved raw string data: ${key}`)
          return plaintextData
        }
      }

      // Check for raw key (very legacy)
      const rawData = localStorage.getItem(key)
      if (rawData) {
        try {
          const parsed = JSON.parse(rawData)
          logger.debug(`EncryptedStorage: Retrieved legacy raw data: ${key}`)
          return parsed
        } catch {
          return rawData
        }
      }

      logger.debug(`EncryptedStorage: No data found for key: ${key}`)
      return null

    } catch (error) {
      logger.error(`EncryptedStorage: Failed to retrieve item ${key}:`, error)
      return null
    }
  }

  /**
   * Remove item from storage
   */
  async removeItem(key: string): Promise<boolean> {
    try {
      logger.debug(`EncryptedStorage: Removing item ${key}`)

      // Remove from all possible storage locations
      localStorage.removeItem(`${this.ENCRYPTION_PREFIX}${key}`)
      localStorage.removeItem(`${this.LEGACY_PREFIX}${key}`)
      localStorage.removeItem(key) // Legacy raw key

      logger.debug(`EncryptedStorage: Successfully removed: ${key}`)
      return true

    } catch (error) {
      logger.error(`EncryptedStorage: Failed to remove item ${key}:`, error)
      return false
    }
  }

  /**
   * Clear all Viny storage data
   */
  async clear(): Promise<boolean> {
    try {
      logger.info('EncryptedStorage: Clearing all storage data')

      const keysToRemove: string[] = []
      
      // Find all Viny-related keys
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && (
          key.startsWith(this.ENCRYPTION_PREFIX) ||
          key.startsWith(this.LEGACY_PREFIX) ||
          key.startsWith('viny_')
        )) {
          keysToRemove.push(key)
        }
      }

      // Remove all found keys
      keysToRemove.forEach(key => {
        localStorage.removeItem(key)
      })

      logger.info(`EncryptedStorage: Cleared ${keysToRemove.length} storage items`)
      return true

    } catch (error) {
      logger.error('EncryptedStorage: Failed to clear storage:', error)
      return false
    }
  }

  /**
   * Get all Viny storage keys
   */
  getKeys(): string[] {
    const keys: string[] = []
    
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key) {
          if (key.startsWith(this.ENCRYPTION_PREFIX)) {
            keys.push(key.substring(this.ENCRYPTION_PREFIX.length))
          } else if (key.startsWith(this.LEGACY_PREFIX)) {
            keys.push(key.substring(this.LEGACY_PREFIX.length))
          } else if (key.startsWith('viny_') && !key.includes('master_key')) {
            keys.push(key)
          }
        }
      }
    } catch (error) {
      logger.error('EncryptedStorage: Failed to get keys:', error)
    }

    return [...new Set(keys)] // Remove duplicates
  }

  /**
   * Check if a key exists in storage
   */
  hasItem(key: string): boolean {
    try {
      return (
        localStorage.getItem(`${this.ENCRYPTION_PREFIX}${key}`) !== null ||
        localStorage.getItem(`${this.LEGACY_PREFIX}${key}`) !== null ||
        localStorage.getItem(key) !== null
      )
    } catch (error) {
      logger.error(`EncryptedStorage: Failed to check existence of ${key}:`, error)
      return false
    }
  }

  /**
   * Get storage statistics
   */
  getStorageStats(): EncryptedStorageStats {
    let totalKeys = 0
    let encryptedKeys = 0
    let plaintextKeys = 0
    let storageSize = 0

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith('viny_')) {
          totalKeys++
          const value = localStorage.getItem(key)
          if (value) {
            storageSize += value.length

            try {
              const parsed = JSON.parse(value)
              if (isDataEncrypted(parsed)) {
                encryptedKeys++
              } else {
                plaintextKeys++
              }
            } catch {
              plaintextKeys++
            }
          }
        }
      }
    } catch (error) {
      logger.error('EncryptedStorage: Failed to calculate storage stats:', error)
    }

    return {
      totalKeys,
      encryptedKeys,
      plaintextKeys,
      storageSize,
      encryptionRatio: totalKeys > 0 ? encryptedKeys / totalKeys : 0
    }
  }

  /**
   * Migrate plaintext data to encrypted storage
   */
  async migrateToEncrypted(): Promise<boolean> {
    if (!encryptionService.isEncryptionActive()) {
      logger.warn('EncryptedStorage: Cannot migrate - encryption not active')
      return false
    }

    try {
      logger.info('EncryptedStorage: Starting migration to encrypted storage')

      const keys = this.getKeys()
      let migratedCount = 0
      let failedCount = 0

      for (const key of keys) {
        try {
          // Get current data
          const data = await this.getItem(key, { encrypt: false })
          if (data !== null) {
            // Store as encrypted
            const success = await this.setItem(key, data, { encrypt: true })
            if (success) {
              // Remove old plaintext version
              localStorage.removeItem(`${this.LEGACY_PREFIX}${key}`)
              localStorage.removeItem(key)
              migratedCount++
              logger.debug(`EncryptedStorage: Migrated ${key} to encrypted storage`)
            } else {
              failedCount++
              logger.warn(`EncryptedStorage: Failed to migrate ${key}`)
            }
          }
        } catch (error) {
          failedCount++
          logger.error(`EncryptedStorage: Error migrating ${key}:`, error)
        }
      }

      logger.info(`EncryptedStorage: Migration complete - ${migratedCount} migrated, ${failedCount} failed`)
      return failedCount === 0

    } catch (error) {
      logger.error('EncryptedStorage: Migration failed:', error)
      return false
    }
  }

  /**
   * Create encrypted backup of all data
   */
  async createBackup(): Promise<string | null> {
    try {
      logger.info('EncryptedStorage: Creating encrypted backup')

      const keys = this.getKeys()
      const backupData: Record<string, any> = {}

      for (const key of keys) {
        const data = await this.getItem(key)
        if (data !== null) {
          backupData[key] = data
        }
      }

      const backupPayload = {
        version: '1.0',
        createdAt: new Date().toISOString(),
        keys: Object.keys(backupData),
        data: backupData
      }

      // Encrypt the entire backup
      const encrypted = await encryptionService.encryptData(
        JSON.stringify(backupPayload),
        'backup'
      )

      if (encrypted) {
        const backupString = JSON.stringify({
          vinyBackup: true,
          version: '1.0',
          encrypted: true,
          backup: encrypted
        })

        logger.info(`EncryptedStorage: Created backup with ${Object.keys(backupData).length} items`)
        return backupString
      }

      return null

    } catch (error) {
      logger.error('EncryptedStorage: Failed to create backup:', error)
      return null
    }
  }

  /**
   * Restore from encrypted backup
   */
  async restoreFromBackup(backupString: string): Promise<boolean> {
    try {
      logger.info('EncryptedStorage: Restoring from backup')

      const backupContainer = JSON.parse(backupString)
      
      if (!backupContainer.vinyBackup || !backupContainer.encrypted) {
        throw new Error('Invalid backup format')
      }

      // Decrypt backup data
      const decrypted = await encryptionService.decryptData(
        backupContainer.backup,
        'backup'
      )

      if (!decrypted) {
        throw new Error('Failed to decrypt backup')
      }

      const backupPayload = JSON.parse(decrypted)
      let restoredCount = 0
      let failedCount = 0

      // Restore each item
      for (const [key, value] of Object.entries(backupPayload.data)) {
        try {
          const success = await this.setItem(key, value, { encrypt: true })
          if (success) {
            restoredCount++
          } else {
            failedCount++
          }
        } catch (error) {
          failedCount++
          logger.error(`EncryptedStorage: Failed to restore ${key}:`, error)
        }
      }

      logger.info(`EncryptedStorage: Restore complete - ${restoredCount} restored, ${failedCount} failed`)
      return failedCount === 0

    } catch (error) {
      logger.error('EncryptedStorage: Failed to restore from backup:', error)
      return false
    }
  }

  /**
   * Check encryption status
   */
  getEncryptionStatus(): any {
    const stats = this.getStorageStats()
    const encryptionServiceStatus = encryptionService.getEncryptionStatus()

    return {
      encryptionActive: this.encryptionEnabled,
      encryptionService: encryptionServiceStatus,
      storage: {
        totalItems: stats.totalKeys,
        encryptedItems: stats.encryptedKeys,
        plaintextItems: stats.plaintextKeys,
        encryptionRatio: Math.round(stats.encryptionRatio * 100),
        storageSize: Math.round(stats.storageSize / 1024) // KB
      }
    }
  }
}

// Export singleton instance
export const encryptedStorage = new EncryptedStorage()

// Export utility functions
export async function migrateStorageToEncrypted(): Promise<boolean> {
  return encryptedStorage.migrateToEncrypted()
}

export function getStorageEncryptionStatus(): any {
  return encryptedStorage.getEncryptionStatus()
}

export async function createStorageBackup(): Promise<string | null> {
  return encryptedStorage.createBackup()
}

export async function restoreStorageBackup(backup: string): Promise<boolean> {
  return encryptedStorage.restoreFromBackup(backup)
}