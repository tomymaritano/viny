/**
 * LocalStorage Migration Repository
 * Provides a repository interface for migrating localStorage data
 * Implements the enhanced repository pattern with security and error handling
 */

import type {
  IEnhancedRepository,
  RepositoryFilter,
  RepositoryOptions,
  RepositoryResult,
  CircuitBreakerConfig,
  RetryConfig,
} from './interfaces/IEnhancedRepository'
import { RepositoryError } from './interfaces/IEnhancedRepository'
import { storageLogger } from '@/utils/logger'
import { loggingService } from '@/services/LoggingService'

export interface LocalStorageItem {
  readonly id: string
  readonly key: string
  readonly value: string
  readonly size: number
  readonly createdAt: string
  readonly updatedAt: string
  readonly isVinyData: boolean
  readonly dataType:
    | 'settings'
    | 'notes'
    | 'notebooks'
    | 'templates'
    | 'cache'
    | 'other'
}

export interface MigrationMetadata {
  readonly totalItems: number
  readonly vinyItems: number
  readonly totalSize: number
  readonly dataTypes: Record<string, number>
  readonly oldestItem: string
  readonly newestItem: string
}

/**
 * Repository for analyzing and migrating localStorage data
 * Provides safe access to localStorage with enhanced error handling
 */
export class LocalStorageMigrationRepository
  implements IEnhancedRepository<LocalStorageItem>
{
  private readonly logger = storageLogger.child('Migration')
  private readonly circuitBreaker: CircuitBreakerConfig = {
    failureThreshold: 5,
    resetTimeout: 30000,
    monitoringPeriod: 60000,
  }
  private readonly retryConfig: RetryConfig = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 5000,
    backoffFactor: 2,
  }

  constructor() {
    this.logger.info('LocalStorageMigrationRepository initialized')
  }

  /**
   * Get all localStorage items
   */
  async findAll(
    filter?: RepositoryFilter<LocalStorageItem>,
    options?: RepositoryOptions
  ): Promise<RepositoryResult<LocalStorageItem[]>> {
    const context = loggingService.startCorrelation(
      'get-all-localstorage-items'
    )

    try {
      const items: LocalStorageItem[] = []

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (!key) continue

        const value = localStorage.getItem(key)
        if (value === null) continue

        const item = this.createLocalStorageItem(key, value)

        // Apply filter if provided
        if (!filter || this.matchesFilter(item, filter)) {
          items.push(item)
        }
      }

      // Apply sorting if specified
      if (options?.sort) {
        items.sort(this.createSorter(options.sort))
      }

      // Apply pagination if specified
      let paginatedItems = items
      if (options?.limit || options?.offset) {
        const offset = options.offset || 0
        const limit = options.limit || items.length
        paginatedItems = items.slice(offset, offset + limit)
      }

      this.logger.info('Retrieved localStorage items', {
        totalItems: items.length,
        filteredItems: paginatedItems.length,
        hasFilter: !!filter,
      })

      loggingService.endCorrelation(context, true)

      return {
        success: true,
        data: paginatedItems,
        metadata: {
          total: items.length,
          filtered: paginatedItems.length,
          hasMore:
            (options?.offset || 0) + paginatedItems.length < items.length,
        },
      }
    } catch (error) {
      this.logger.error('Failed to retrieve localStorage items', { error })
      loggingService.endCorrelation(context, false)

      return {
        success: false,
        error: new RepositoryError(
          'STORAGE_ERROR',
          'Failed to access localStorage',
          error as Error
        ),
      }
    }
  }

  /**
   * Find localStorage items by key pattern
   */
  async findByKey(
    keyPattern: string
  ): Promise<RepositoryResult<LocalStorageItem[]>> {
    const regex = new RegExp(keyPattern)

    return this.findAll({
      where: (item: LocalStorageItem) => regex.test(item.key),
    })
  }

  /**
   * Find Viny-specific data only
   */
  async findVinyData(): Promise<RepositoryResult<LocalStorageItem[]>> {
    return this.findAll({
      where: (item: LocalStorageItem) => item.isVinyData,
    })
  }

  /**
   * Get metadata about localStorage contents
   */
  async getMetadata(): Promise<RepositoryResult<MigrationMetadata>> {
    const context = loggingService.startCorrelation('get-localstorage-metadata')

    try {
      const allItemsResult = await this.findAll()

      if (!allItemsResult.success || !allItemsResult.data) {
        loggingService.endCorrelation(context, false)
        return {
          success: false,
          error:
            allItemsResult.error ||
            new RepositoryError('UNKNOWN_ERROR', 'Failed to get metadata'),
        }
      }

      const items = allItemsResult.data
      const vinyItems = items.filter(item => item.isVinyData)
      const totalSize = items.reduce((sum, item) => sum + item.size, 0)

      const dataTypes: Record<string, number> = {}
      items.forEach(item => {
        dataTypes[item.dataType] = (dataTypes[item.dataType] || 0) + 1
      })

      const timestamps = items.map(item => new Date(item.createdAt).getTime())
      const oldestTimestamp = Math.min(...timestamps)
      const newestTimestamp = Math.max(...timestamps)

      const metadata: MigrationMetadata = {
        totalItems: items.length,
        vinyItems: vinyItems.length,
        totalSize,
        dataTypes,
        oldestItem: new Date(oldestTimestamp).toISOString(),
        newestItem: new Date(newestTimestamp).toISOString(),
      }

      this.logger.info('Generated localStorage metadata', metadata)
      loggingService.endCorrelation(context, true)

      return {
        success: true,
        data: metadata,
      }
    } catch (error) {
      this.logger.error('Failed to generate metadata', { error })
      loggingService.endCorrelation(context, false)

      return {
        success: false,
        error: new RepositoryError(
          'METADATA_ERROR',
          'Failed to analyze localStorage',
          error as Error
        ),
      }
    }
  }

  /**
   * Create backup of localStorage data
   */
  async createBackup(): Promise<RepositoryResult<string>> {
    const context = loggingService.startCorrelation(
      'create-localstorage-backup'
    )

    try {
      const backup: Record<string, string> = {}

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key) {
          const value = localStorage.getItem(key)
          if (value !== null) {
            backup[key] = value
          }
        }
      }

      const backupData = JSON.stringify(backup, null, 2)
      const timestamp = new Date().toISOString()
      const backupKey = `viny-backup-${timestamp}`

      // Store backup in localStorage
      localStorage.setItem(backupKey, backupData)

      this.logger.info('Created localStorage backup', {
        backupKey,
        itemCount: Object.keys(backup).length,
        backupSize: backupData.length,
      })

      loggingService.endCorrelation(context, true)

      return {
        success: true,
        data: backupKey,
      }
    } catch (error) {
      this.logger.error('Failed to create backup', { error })
      loggingService.endCorrelation(context, false)

      return {
        success: false,
        error: new RepositoryError(
          'BACKUP_ERROR',
          'Failed to create localStorage backup',
          error as Error
        ),
      }
    }
  }

  /**
   * Restore from backup
   */
  async restoreFromBackup(
    backupKey: string
  ): Promise<RepositoryResult<number>> {
    const context = loggingService.startCorrelation(
      'restore-localstorage-backup'
    )

    try {
      const backupData = localStorage.getItem(backupKey)
      if (!backupData) {
        return {
          success: false,
          error: new RepositoryError(
            'BACKUP_NOT_FOUND',
            `Backup not found: ${backupKey}`
          ),
        }
      }

      const backup = JSON.parse(backupData)
      let restoredCount = 0

      for (const [key, value] of Object.entries(backup)) {
        if (typeof value === 'string') {
          localStorage.setItem(key, value)
          restoredCount++
        }
      }

      this.logger.info('Restored localStorage from backup', {
        backupKey,
        restoredCount,
      })

      loggingService.endCorrelation(context, true)

      return {
        success: true,
        data: restoredCount,
      }
    } catch (error) {
      this.logger.error('Failed to restore from backup', { error, backupKey })
      loggingService.endCorrelation(context, false)

      return {
        success: false,
        error: new RepositoryError(
          'RESTORE_ERROR',
          'Failed to restore from backup',
          error as Error
        ),
      }
    }
  }

  /**
   * Remove items by key pattern
   */
  async removeByPattern(keyPattern: string): Promise<RepositoryResult<number>> {
    const context = loggingService.startCorrelation(
      'remove-localstorage-pattern'
    )

    try {
      const regex = new RegExp(keyPattern)
      const keysToRemove: string[] = []

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && regex.test(key)) {
          keysToRemove.push(key)
        }
      }

      keysToRemove.forEach(key => localStorage.removeItem(key))

      this.logger.info('Removed items by pattern', {
        pattern: keyPattern,
        removedCount: keysToRemove.length,
      })

      loggingService.endCorrelation(context, true)

      return {
        success: true,
        data: keysToRemove.length,
      }
    } catch (error) {
      this.logger.error('Failed to remove items by pattern', {
        error,
        keyPattern,
      })
      loggingService.endCorrelation(context, false)

      return {
        success: false,
        error: new RepositoryError(
          'REMOVE_ERROR',
          'Failed to remove items',
          error as Error
        ),
      }
    }
  }

  // Required interface methods (not applicable for migration repository)

  async findById(): Promise<RepositoryResult<LocalStorageItem | null>> {
    return {
      success: false,
      error: new RepositoryError(
        'NOT_IMPLEMENTED',
        'findById not applicable for migration repository'
      ),
    }
  }

  async create(): Promise<RepositoryResult<LocalStorageItem>> {
    return {
      success: false,
      error: new RepositoryError(
        'NOT_IMPLEMENTED',
        'create not applicable for migration repository'
      ),
    }
  }

  async update(): Promise<RepositoryResult<LocalStorageItem>> {
    return {
      success: false,
      error: new RepositoryError(
        'NOT_IMPLEMENTED',
        'update not applicable for migration repository'
      ),
    }
  }

  async delete(): Promise<RepositoryResult<boolean>> {
    return {
      success: false,
      error: new RepositoryError(
        'NOT_IMPLEMENTED',
        'delete not applicable for migration repository'
      ),
    }
  }

  async count(): Promise<RepositoryResult<number>> {
    const result = await this.findAll()
    if (result.success && result.data) {
      return {
        success: true,
        data: result.data.length,
      }
    }
    return {
      success: false,
      error:
        result.error ||
        new RepositoryError('COUNT_ERROR', 'Failed to count items'),
    }
  }

  async exists(): Promise<RepositoryResult<boolean>> {
    const result = await this.count()
    if (result.success && result.data !== undefined) {
      return {
        success: true,
        data: result.data > 0,
      }
    }
    return {
      success: false,
      error:
        result.error ||
        new RepositoryError('EXISTS_ERROR', 'Failed to check existence'),
    }
  }

  // Health check
  async healthCheck(): Promise<RepositoryResult<boolean>> {
    try {
      // Test localStorage access
      const testKey = '_viny_health_check'
      const testValue = Date.now().toString()

      localStorage.setItem(testKey, testValue)
      const retrieved = localStorage.getItem(testKey)
      localStorage.removeItem(testKey)

      const isHealthy = retrieved === testValue

      return {
        success: true,
        data: isHealthy,
      }
    } catch (error) {
      return {
        success: false,
        error: new RepositoryError(
          'HEALTH_CHECK_ERROR',
          'localStorage health check failed',
          error as Error
        ),
      }
    }
  }

  // Private helper methods

  private createLocalStorageItem(key: string, value: string): LocalStorageItem {
    const now = new Date().toISOString()
    const isVinyData = key.startsWith('viny-')
    const dataType = this.determineDataType(key)

    return {
      id: key,
      key,
      value,
      size: key.length + value.length,
      createdAt: now, // We can't know the actual creation time
      updatedAt: now,
      isVinyData,
      dataType,
    }
  }

  private determineDataType(key: string): LocalStorageItem['dataType'] {
    if (key.includes('settings')) return 'settings'
    if (key.includes('notes')) return 'notes'
    if (key.includes('notebooks')) return 'notebooks'
    if (key.includes('templates')) return 'templates'
    if (key.includes('cache') || key.includes('temp')) return 'cache'
    return 'other'
  }

  private matchesFilter(
    item: LocalStorageItem,
    filter: RepositoryFilter<LocalStorageItem>
  ): boolean {
    if (filter.where) {
      if (typeof filter.where === 'function') {
        return filter.where(item)
      }

      // Simple object matching
      for (const [key, value] of Object.entries(filter.where)) {
        if (item[key as keyof LocalStorageItem] !== value) {
          return false
        }
      }
    }

    return true
  }

  private createSorter(sort: RepositoryOptions['sort']) {
    return (a: LocalStorageItem, b: LocalStorageItem): number => {
      if (!sort) return 0

      for (const [key, direction] of Object.entries(sort)) {
        const aVal = a[key as keyof LocalStorageItem]
        const bVal = b[key as keyof LocalStorageItem]

        if (aVal < bVal) return direction === 'asc' ? -1 : 1
        if (aVal > bVal) return direction === 'asc' ? 1 : -1
      }

      return 0
    }
  }
}

// Export singleton instance
export const localStorageMigrationRepository =
  new LocalStorageMigrationRepository()
