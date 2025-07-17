/**
 * Viny Unified Storage Service
 * Integrates encrypted storage with Electron file system and localStorage
 */

import { Note, Notebook, Settings } from '../types'
import { electronStorageService } from './electronStorage'
import { encryptedStorage } from './encryptedStorage'
import { encryptionService } from '../services/EncryptionService'
import { logger } from '../utils/logger'

export interface StorageConfig {
  encryption: {
    enabled: boolean
    autoMigrate: boolean
    backupBeforeMigration: boolean
  }
  storage: {
    preferElectron: boolean
    fallbackToLocalStorage: boolean
  }
}

export interface UnifiedStorageStats {
  storageType: 'electron' | 'localStorage' | 'hybrid'
  encryption: {
    enabled: boolean
    coverage: number // percentage
  }
  data: {
    notes: number
    notebooks: number
    hasSettings: boolean
    tagColors: number
  }
  fileSystem?: {
    dataDirectory: string
    notesPath: string
    backupsPath: string
  }
}

/**
 * Unified Storage Service
 * Provides a single interface for all storage operations with encryption support
 */
export class UnifiedStorage {
  private config: StorageConfig
  private isElectron: boolean
  private encryptionActive: boolean

  constructor(config: Partial<StorageConfig> = {}) {
    this.config = {
      encryption: {
        enabled: true,
        autoMigrate: true,
        backupBeforeMigration: true
      },
      storage: {
        preferElectron: true,
        fallbackToLocalStorage: true
      },
      ...config
    }

    this.isElectron = electronStorageService.isElectronEnvironment
    this.encryptionActive = encryptionService.isEncryptionActive()

    logger.info('UnifiedStorage: Initializing unified storage system', {
      isElectron: this.isElectron,
      encryptionActive: this.encryptionActive
    })

    this.initializeStorage()
  }

  private async initializeStorage(): Promise<void> {
    try {
      // Auto-migrate to encryption if enabled and available
      if (this.config.encryption.enabled && 
          this.encryptionActive && 
          this.config.encryption.autoMigrate) {
        await this.checkAndMigrateToEncryption()
      }
    } catch (error) {
      logger.error('UnifiedStorage: Failed to initialize storage:', error)
    }
  }

  /**
   * Notes Operations
   */

  async getNotes(): Promise<Note[]> {
    try {
      if (this.isElectron && this.config.storage.preferElectron) {
        return await electronStorageService.getNotes()
      } else {
        // Use encrypted storage for web or when Electron is disabled
        const notes = await encryptedStorage.getItem('notes') || []
        return Array.isArray(notes) ? notes : []
      }
    } catch (error) {
      logger.error('UnifiedStorage: Failed to get notes:', error)
      if (this.config.storage.fallbackToLocalStorage) {
        return this.getFallbackNotes()
      }
      throw error
    }
  }

  async saveNotes(notes: Note[]): Promise<void> {
    try {
      if (this.isElectron && this.config.storage.preferElectron) {
        await electronStorageService.saveNotes(notes)
        
        // Also save encrypted backup if encryption is enabled
        if (this.encryptionActive) {
          await encryptedStorage.setItem('notes_backup', notes, { encrypt: true })
        }
      } else {
        // Use encrypted storage
        await encryptedStorage.setItem('notes', notes, { 
          encrypt: this.config.encryption.enabled 
        })
      }

      logger.debug(`UnifiedStorage: Saved ${notes.length} notes`)
    } catch (error) {
      logger.error('UnifiedStorage: Failed to save notes:', error)
      throw error
    }
  }

  async saveNote(note: Note): Promise<void> {
    try {
      if (this.isElectron && this.config.storage.preferElectron) {
        await electronStorageService.saveNote(note)
        
        // Update encrypted backup
        if (this.encryptionActive) {
          const allNotes = await this.getNotes()
          const existingIndex = allNotes.findIndex(n => n.id === note.id)
          
          if (existingIndex >= 0) {
            allNotes[existingIndex] = note
          } else {
            allNotes.push(note)
          }
          
          await encryptedStorage.setItem('notes_backup', allNotes, { encrypt: true })
        }
      } else {
        // Update notes array in encrypted storage
        const allNotes = await this.getNotes()
        const existingIndex = allNotes.findIndex(n => n.id === note.id)
        
        if (existingIndex >= 0) {
          allNotes[existingIndex] = note
        } else {
          allNotes.push(note)
        }
        
        await encryptedStorage.setItem('notes', allNotes, { 
          encrypt: this.config.encryption.enabled 
        })
      }

      logger.debug(`UnifiedStorage: Saved note: ${note.id}`)
    } catch (error) {
      logger.error('UnifiedStorage: Failed to save note:', error)
      throw error
    }
  }

  async loadNote(id: string): Promise<Note | null> {
    try {
      if (this.isElectron && this.config.storage.preferElectron) {
        return await electronStorageService.loadNote(id)
      } else {
        const allNotes = await this.getNotes()
        return allNotes.find(note => note.id === id) || null
      }
    } catch (error) {
      logger.error('UnifiedStorage: Failed to load note:', error)
      return null
    }
  }

  async deleteNote(noteId: string): Promise<void> {
    try {
      if (this.isElectron && this.config.storage.preferElectron) {
        await electronStorageService.deleteNote(noteId)
        
        // Update encrypted backup
        if (this.encryptionActive) {
          const allNotes = await this.getNotes()
          const filteredNotes = allNotes.filter(note => note.id !== noteId)
          await encryptedStorage.setItem('notes_backup', filteredNotes, { encrypt: true })
        }
      } else {
        const allNotes = await this.getNotes()
        const filteredNotes = allNotes.filter(note => note.id !== noteId)
        await encryptedStorage.setItem('notes', filteredNotes, { 
          encrypt: this.config.encryption.enabled 
        })
      }

      logger.debug(`UnifiedStorage: Deleted note: ${noteId}`)
    } catch (error) {
      logger.error('UnifiedStorage: Failed to delete note:', error)
      throw error
    }
  }

  /**
   * Notebooks Operations
   */

  async getNotebooks(): Promise<Notebook[]> {
    try {
      if (this.isElectron && this.config.storage.preferElectron) {
        return await electronStorageService.getNotebooks()
      } else {
        const notebooks = await encryptedStorage.getItem('notebooks') || []
        return Array.isArray(notebooks) ? notebooks : []
      }
    } catch (error) {
      logger.error('UnifiedStorage: Failed to get notebooks:', error)
      return []
    }
  }

  async saveNotebooks(notebooks: Notebook[]): Promise<void> {
    try {
      if (this.isElectron && this.config.storage.preferElectron) {
        await electronStorageService.saveNotebooks(notebooks)
        
        if (this.encryptionActive) {
          await encryptedStorage.setItem('notebooks_backup', notebooks, { encrypt: true })
        }
      } else {
        await encryptedStorage.setItem('notebooks', notebooks, { 
          encrypt: this.config.encryption.enabled 
        })
      }

      logger.debug(`UnifiedStorage: Saved ${notebooks.length} notebooks`)
    } catch (error) {
      logger.error('UnifiedStorage: Failed to save notebooks:', error)
      throw error
    }
  }

  /**
   * Settings Operations
   */

  async getSettings(): Promise<Partial<Settings>> {
    try {
      if (this.isElectron && this.config.storage.preferElectron) {
        return await electronStorageService.getSettings()
      } else {
        const settings = await encryptedStorage.getItem('settings') || {}
        return typeof settings === 'object' ? settings : {}
      }
    } catch (error) {
      logger.error('UnifiedStorage: Failed to get settings:', error)
      return {}
    }
  }

  async saveSettings(settings: Partial<Settings>): Promise<void> {
    try {
      if (this.isElectron && this.config.storage.preferElectron) {
        await electronStorageService.saveSettings(settings)
        
        if (this.encryptionActive) {
          await encryptedStorage.setItem('settings_backup', settings, { encrypt: true })
        }
      } else {
        await encryptedStorage.setItem('settings', settings, { 
          encrypt: this.config.encryption.enabled 
        })
      }

      logger.debug('UnifiedStorage: Saved settings')
    } catch (error) {
      logger.error('UnifiedStorage: Failed to save settings:', error)
      throw error
    }
  }

  /**
   * Tag Colors Operations
   */

  async getTagColors(): Promise<Record<string, string>> {
    try {
      if (this.isElectron && this.config.storage.preferElectron) {
        return await electronStorageService.getTagColors()
      } else {
        const tagColors = await encryptedStorage.getItem('tagColors') || {}
        return typeof tagColors === 'object' ? tagColors : {}
      }
    } catch (error) {
      logger.error('UnifiedStorage: Failed to get tag colors:', error)
      return {}
    }
  }

  async saveTagColors(tagColors: Record<string, string>): Promise<void> {
    try {
      if (this.isElectron && this.config.storage.preferElectron) {
        await electronStorageService.saveTagColors(tagColors)
        
        if (this.encryptionActive) {
          await encryptedStorage.setItem('tagColors_backup', tagColors, { encrypt: true })
        }
      } else {
        await encryptedStorage.setItem('tagColors', tagColors, { 
          encrypt: this.config.encryption.enabled 
        })
      }

      logger.debug('UnifiedStorage: Saved tag colors')
    } catch (error) {
      logger.error('UnifiedStorage: Failed to save tag colors:', error)
      throw error
    }
  }

  /**
   * Utility Operations
   */

  async clear(): Promise<void> {
    try {
      if (this.isElectron) {
        await electronStorageService.clear()
      }
      
      await encryptedStorage.clear()
      
      logger.info('UnifiedStorage: Cleared all storage')
    } catch (error) {
      logger.error('UnifiedStorage: Failed to clear storage:', error)
      throw error
    }
  }

  async export(): Promise<string> {
    try {
      const data = {
        notes: await this.getNotes(),
        notebooks: await this.getNotebooks(),
        settings: await this.getSettings(),
        tagColors: await this.getTagColors(),
        exportedAt: new Date().toISOString(),
        version: '2.0',
        encrypted: this.encryptionActive
      }

      if (this.encryptionActive) {
        // Create encrypted export
        const encrypted = await encryptionService.encryptData(
          JSON.stringify(data),
          'export'
        )
        
        if (encrypted) {
          return JSON.stringify({
            vinyExport: true,
            version: '2.0',
            encrypted: true,
            data: encrypted
          })
        }
      }

      // Fallback to plaintext export
      return JSON.stringify(data, null, 2)
    } catch (error) {
      logger.error('UnifiedStorage: Failed to export:', error)
      throw error
    }
  }

  async import(data: string): Promise<void> {
    try {
      let parsedData: any

      try {
        const container = JSON.parse(data)
        
        if (container.vinyExport && container.encrypted && this.encryptionActive) {
          // Decrypt encrypted export
          const decrypted = await encryptionService.decryptData(container.data, 'export')
          if (!decrypted) {
            throw new Error('Failed to decrypt import data')
          }
          parsedData = JSON.parse(decrypted)
        } else {
          parsedData = container.vinyExport ? container.data : container
        }
      } catch {
        // Try direct parsing for legacy format
        parsedData = JSON.parse(data)
      }

      if (parsedData.notes) await this.saveNotes(parsedData.notes)
      if (parsedData.notebooks) await this.saveNotebooks(parsedData.notebooks)
      if (parsedData.settings) await this.saveSettings(parsedData.settings)
      if (parsedData.tagColors) await this.saveTagColors(parsedData.tagColors)

      logger.info('UnifiedStorage: Import completed successfully')
    } catch (error) {
      logger.error('UnifiedStorage: Import failed:', error)
      throw new Error('Invalid import data format')
    }
  }

  /**
   * Migration and Backup Operations
   */

  async migrateToEncryption(): Promise<boolean> {
    try {
      if (!this.encryptionActive) {
        logger.warn('UnifiedStorage: Cannot migrate - encryption not active')
        return false
      }

      logger.info('UnifiedStorage: Starting migration to encryption')

      // Create backup before migration
      if (this.config.encryption.backupBeforeMigration) {
        await this.createBackup()
      }

      // Migrate encrypted storage
      const storageSuccess = await encryptedStorage.migrateToEncrypted()

      logger.info(`UnifiedStorage: Migration completed - encrypted storage: ${storageSuccess}`)
      return storageSuccess
    } catch (error) {
      logger.error('UnifiedStorage: Migration failed:', error)
      return false
    }
  }

  async createBackup(): Promise<string | null> {
    try {
      if (this.encryptionActive) {
        return await encryptedStorage.createBackup()
      } else {
        return await this.export()
      }
    } catch (error) {
      logger.error('UnifiedStorage: Failed to create backup:', error)
      return null
    }
  }

  async restoreFromBackup(backup: string): Promise<boolean> {
    try {
      if (this.encryptionActive) {
        return await encryptedStorage.restoreFromBackup(backup)
      } else {
        await this.import(backup)
        return true
      }
    } catch (error) {
      logger.error('UnifiedStorage: Failed to restore from backup:', error)
      return false
    }
  }

  /**
   * Status and Information
   */

  async getStorageStats(): Promise<UnifiedStorageStats> {
    try {
      const notes = await this.getNotes()
      const notebooks = await this.getNotebooks()
      const settings = await this.getSettings()
      const tagColors = await this.getTagColors()
      
      const stats: UnifiedStorageStats = {
        storageType: this.isElectron ? 'electron' : 'localStorage',
        encryption: {
          enabled: this.encryptionActive,
          coverage: 0
        },
        data: {
          notes: notes.length,
          notebooks: notebooks.length,
          hasSettings: Object.keys(settings).length > 0,
          tagColors: Object.keys(tagColors).length
        }
      }

      // Add encryption coverage
      if (this.encryptionActive) {
        const encryptionStats = encryptedStorage.getStorageStats()
        stats.encryption.coverage = Math.round(encryptionStats.encryptionRatio * 100)
      }

      // Add file system info for Electron
      if (this.isElectron) {
        const storageInfo = await electronStorageService.getStorageInfo()
        if (storageInfo) {
          stats.fileSystem = {
            dataDirectory: storageInfo.dataDirectory,
            notesPath: storageInfo.directories.notes,
            backupsPath: storageInfo.directories.backups
          }
        }
      }

      return stats
    } catch (error) {
      logger.error('UnifiedStorage: Failed to get storage stats:', error)
      throw error
    }
  }

  getStorageConfig(): StorageConfig {
    return { ...this.config }
  }

  updateStorageConfig(newConfig: Partial<StorageConfig>): void {
    this.config = { ...this.config, ...newConfig }
    logger.info('UnifiedStorage: Updated storage configuration')
  }

  // Private helper methods

  private async checkAndMigrateToEncryption(): Promise<void> {
    try {
      const stats = encryptedStorage.getStorageStats()
      
      if (stats.plaintextKeys > 0 && stats.encryptionRatio < 1.0) {
        logger.info('UnifiedStorage: Found unencrypted data, starting auto-migration')
        await this.migrateToEncryption()
      }
    } catch (error) {
      logger.error('UnifiedStorage: Auto-migration check failed:', error)
    }
  }

  private getFallbackNotes(): Note[] {
    try {
      const stored = localStorage.getItem('viny_notes')
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }
}

// Export singleton instance
export const unifiedStorage = new UnifiedStorage()

// Export utility functions
export async function migrateToEncryptedStorage(): Promise<boolean> {
  return unifiedStorage.migrateToEncryption()
}

export async function getUnifiedStorageStats(): Promise<UnifiedStorageStats> {
  return unifiedStorage.getStorageStats()
}

export async function createUnifiedBackup(): Promise<string | null> {
  return unifiedStorage.createBackup()
}

export async function restoreUnifiedBackup(backup: string): Promise<boolean> {
  return unifiedStorage.restoreFromBackup(backup)
}