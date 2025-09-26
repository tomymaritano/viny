/**
 * Centralized Storage Service
 *
 * This service provides a unified interface for all storage operations,
 * abstracting away direct localStorage usage and providing proper error handling,
 * validation, and migration support.
 */

import { logger } from '../utils/logger'

export interface StorageAdapter {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
  clear(): void
  key(index: number): string | null
  readonly length: number
}

export class StorageService {
  private static instance: StorageService
  private static electronWarningShown = false
  private adapter: StorageAdapter
  private cache: Map<string, any> = new Map()
  private readonly prefix = 'viny_'

  // Known storage keys
  static readonly KEYS = {
    NOTES: 'viny_notes',
    NOTEBOOKS: 'viny_notebooks',
    SETTINGS: 'viny-settings',
    TAG_COLORS: 'viny_tag_colors',
    IMAGES: 'viny-images',
    INITIALIZED: 'viny-initialized',
    ERROR_REPORTS: 'viny_error_reports',
    USE_DEXIE: 'viny_use_dexie',
    ANALYTICS: 'viny_analytics',
    TELEMETRY: 'viny_telemetry',
    CRASH_REPORTS: 'viny_crash_reports',
    SEARCH_HISTORY: 'viny_search_history',
    SECURITY_CONFIG: 'viny_security_config',
    SETTINGS_BACKUPS: 'viny_settings_backups',
    LANGUAGE: 'language',
    THEME: 'theme',
    USAGE_DATA: 'viny_usage_data',
    CURRENT_SESSION: 'viny_current_session',
    TEMPLATES: 'viny-templates',
  } as const

  private constructor(adapter?: StorageAdapter) {
    // Use localStorage in browser, or a custom adapter for Electron
    this.adapter = adapter || this.getDefaultAdapter()
  }

  static getInstance(adapter?: StorageAdapter): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService(adapter)
    }
    return StorageService.instance
  }

  private getDefaultAdapter(): StorageAdapter {
    // Check if we're in Electron
    if (typeof window !== 'undefined' && window.electronAPI?.storage) {
      // Return an adapter that uses Electron's storage API
      return {
        getItem: (key: string) => {
          // This would need to be synchronous or we'd need to refactor to async
          // Only log once to avoid spamming console
          if (!StorageService.electronWarningShown) {
            logger.debug('Electron storage adapter falling back to localStorage')
            StorageService.electronWarningShown = true
          }
          return localStorage.getItem(key)
        },
        setItem: (key: string, value: string) => {
          localStorage.setItem(key, value)
        },
        removeItem: (key: string) => {
          localStorage.removeItem(key)
        },
        clear: () => {
          localStorage.clear()
        },
        key: (index: number) => localStorage.key(index),
        get length() {
          return localStorage.length
        },
      }
    }

    // Default to localStorage
    return localStorage
  }

  /**
   * Get a value from storage
   */
  getItem(key: string): string | null {
    try {
      // Check cache first
      if (this.cache.has(key)) {
        return this.cache.get(key)
      }

      const value = this.adapter.getItem(key)
      if (value !== null) {
        this.cache.set(key, value)
      }
      return value
    } catch (error) {
      logger.error('Failed to get item from storage:', { key, error })
      return null
    }
  }

  /**
   * Get a parsed JSON value from storage
   */
  getJSON<T>(key: string, defaultValue: T): T {
    try {
      const value = this.getItem(key)
      if (value === null) {
        return defaultValue
      }
      return JSON.parse(value) as T
    } catch (error) {
      logger.error('Failed to parse JSON from storage:', { key, error })
      return defaultValue
    }
  }

  /**
   * Set a value in storage
   */
  setItem(key: string, value: string): boolean {
    try {
      this.adapter.setItem(key, value)
      this.cache.set(key, value)
      return true
    } catch (error) {
      logger.error('Failed to set item in storage:', { key, error })
      return false
    }
  }

  /**
   * Set a JSON value in storage
   */
  setJSON(key: string, value: any): boolean {
    try {
      return this.setItem(key, JSON.stringify(value))
    } catch (error) {
      logger.error('Failed to stringify JSON for storage:', { key, error })
      return false
    }
  }

  /**
   * Remove an item from storage
   */
  removeItem(key: string): boolean {
    try {
      this.adapter.removeItem(key)
      this.cache.delete(key)
      return true
    } catch (error) {
      logger.error('Failed to remove item from storage:', { key, error })
      return false
    }
  }

  /**
   * Clear all storage
   */
  clear(): boolean {
    try {
      this.adapter.clear()
      this.cache.clear()
      return true
    } catch (error) {
      logger.error('Failed to clear storage:', error)
      return false
    }
  }

  /**
   * Get all keys in storage
   */
  getAllKeys(): string[] {
    const keys: string[] = []
    try {
      for (let i = 0; i < this.adapter.length; i++) {
        const key = this.adapter.key(i)
        if (key !== null) {
          keys.push(key)
        }
      }
    } catch (error) {
      logger.error('Failed to get all keys from storage:', error)
    }
    return keys
  }

  /**
   * Get storage size for a key
   */
  getItemSize(key: string): number {
    const value = this.getItem(key)
    if (value === null) return 0
    // Rough estimate of size in bytes
    return new Blob([value]).size
  }

  /**
   * Get total storage size
   */
  getTotalSize(): number {
    let totalSize = 0
    const keys = this.getAllKeys()
    for (const key of keys) {
      totalSize += this.getItemSize(key)
    }
    return totalSize
  }

  /**
   * Check if storage is available
   */
  isAvailable(): boolean {
    try {
      const testKey = '__storage_test__'
      this.adapter.setItem(testKey, 'test')
      this.adapter.removeItem(testKey)
      return true
    } catch (error) {
      return false
    }
  }

  /**
   * Get storage quota info
   */
  async getQuotaInfo(): Promise<{ usage: number; quota: number } | null> {
    if (
      'navigator' in globalThis &&
      'storage' in navigator &&
      'estimate' in navigator.storage
    ) {
      try {
        const estimate = await navigator.storage.estimate()
        return {
          usage: estimate.usage || 0,
          quota: estimate.quota || 0,
        }
      } catch (error) {
        logger.error('Failed to get storage quota:', error)
      }
    }
    return null
  }

  /**
   * Migrate a key to a new key
   */
  migrateKey(oldKey: string, newKey: string): boolean {
    const value = this.getItem(oldKey)
    if (value !== null) {
      const success = this.setItem(newKey, value)
      if (success) {
        this.removeItem(oldKey)
        logger.info('Migrated storage key:', { oldKey, newKey })
        return true
      }
    }
    return false
  }

  /**
   * Batch operations for better performance
   */
  batch(
    operations: Array<{ type: 'set' | 'remove'; key: string; value?: string }>
  ): boolean {
    try {
      for (const op of operations) {
        if (op.type === 'set' && op.value !== undefined) {
          this.adapter.setItem(op.key, op.value)
          this.cache.set(op.key, op.value)
        } else if (op.type === 'remove') {
          this.adapter.removeItem(op.key)
          this.cache.delete(op.key)
        }
      }
      return true
    } catch (error) {
      logger.error('Batch operation failed:', error)
      return false
    }
  }

  /**
   * Clear cache for a specific key or all keys
   */
  clearCache(key?: string): void {
    if (key) {
      this.cache.delete(key)
    } else {
      this.cache.clear()
    }
  }
}

// Export singleton instance
export const storageService = StorageService.getInstance()
