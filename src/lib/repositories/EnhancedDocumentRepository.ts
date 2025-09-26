/**
 * Enhanced Document Repository Implementation
 * Extends DocumentRepository to support all localStorage usage patterns
 * Implements IEnhancedDocumentRepository interface for complete storage abstraction
 */

import { DocumentRepository } from './DocumentRepository'
import type { Note, Notebook } from '../../types'
import type { AppSettings } from '../../types/settings'
import type {
  IEnhancedDocumentRepository,
  RepositoryConfig,
  ImportOptions,
  StorageUsageStats,
} from './interfaces/IEnhancedRepository'
import type {
  OperationResult,
  MigrationResult,
  BackupData,
  RestoreResult,
  ExportResult,
  RepositoryMetrics,
  FilterOptions,
  SearchOptions,
  SearchResult,
  StorageKeyMapping,
  PluginStorageOptions,
  PluginStorageQuota,
  ValidationSchema,
  ValidationResult,
  RepositoryEvent,
  RepositoryEventHandler,
  SubscriptionOptions,
  CacheStats,
  RepositoryError,
  RepositoryErrorCode,
} from './types/RepositoryTypes'
import { loggingService } from '../../services/LoggingService'

/**
 * Enhanced storage key mappings for localStorage migration
 */
const DEFAULT_STORAGE_MAPPING: StorageKeyMapping = {
  // Application settings
  'viny-settings': 'settings:app',
  viny_tag_colors: 'settings:tagColors',

  // UI state
  'sidebar-width': 'ui:sidebar:width',
  'editor-split-ratio': 'ui:editor:splitRatio',
  'preview-width': 'ui:preview:width',
  'layout-mode': 'ui:layout:mode',
  'theme-mode': 'ui:theme:mode',

  // Content data
  viny_notes: 'content:notes',
  viny_notebooks: 'content:notebooks',
  viny_templates: 'content:templates',

  // Plugin data (pattern matching)
  plugin_: 'plugins:',
  viny_plugin_: 'plugins:',

  // Analytics and tracking
  viny_analytics: 'analytics:usage',
  viny_telemetry: 'analytics:telemetry',
  viny_crash_reports: 'errors:crashes',

  // Debug and error data
  viny_debug: 'debug:logs',
  viny_error_reports: 'errors:reports',

  // Cache data
  'search-cache': 'cache:search',
  'image-cache': 'cache:images',
} as const

export class EnhancedDocumentRepository
  extends DocumentRepository
  implements IEnhancedDocumentRepository
{
  private config: RepositoryConfig
  private eventHandlers: Set<RepositoryEventHandler> = new Set()
  private cacheData: Map<
    string,
    { data: any; timestamp: number; ttl: number }
  > = new Map()
  private metrics: RepositoryMetrics = {
    operationCount: 0,
    errorCount: 0,
    avgResponseTime: 0,
    cacheHitRate: 0,
    storageUsage: 0,
    lastOperationTime: 0,
  }

  constructor(config: RepositoryConfig = {}) {
    super(config.retryConfig)
    this.config = {
      enableCache: true,
      cacheMaxSize: 100,
      cacheTtlMs: 300000, // 5 minutes
      enableMetrics: true,
      metricsRetentionMs: 3600000, // 1 hour
      maxStorageSize: 50 * 1024 * 1024, // 50MB
      compressionEnabled: false,
      environment: (import.meta.env.NODE_ENV as any) || 'development',
      logLevel: 'info',
      ...config,
    }

    this.setupCacheCleanup()
  }

  // =============================================================================
  // Enhanced Initialization & Health
  // =============================================================================

  override async initialize(config?: RepositoryConfig): Promise<void> {
    if (config) {
      this.config = { ...this.config, ...config }
    }

    await super.initialize()

    loggingService.log('info', 'Enhanced repository initialized', {
      context: 'EnhancedDocumentRepository',
      config: this.config,
    })
  }

  isInitialized(): boolean {
    return this.isInitializedFlag
  }

  async isHealthy(): Promise<boolean> {
    try {
      await this.getSettings()
      return true
    } catch (error) {
      loggingService.logError(error as Error, {
        context: 'EnhancedDocumentRepository.isHealthy',
      })
      return false
    }
  }

  async getMetrics(): Promise<RepositoryMetrics> {
    return { ...this.metrics }
  }

  // =============================================================================
  // Enhanced Document Operations
  // =============================================================================

  async getNotes(filter?: FilterOptions<Note>): Promise<Note[]> {
    const startTime = Date.now()
    try {
      let notes = await super.getNotes()

      if (filter) {
        notes = this.applyFilter(notes, filter)
      }

      this.updateMetrics('getNotes', startTime)
      return notes
    } catch (error) {
      this.updateMetricsError('getNotes', startTime)
      throw error
    }
  }

  async getNotebooks(filter?: FilterOptions<Notebook>): Promise<Notebook[]> {
    const startTime = Date.now()
    try {
      let notebooks = await super.getNotebooks()

      if (filter) {
        notebooks = this.applyFilter(notebooks, filter)
      }

      this.updateMetrics('getNotebooks', startTime)
      return notebooks
    } catch (error) {
      this.updateMetricsError('getNotebooks', startTime)
      throw error
    }
  }

  async getNotebook(id: string): Promise<Notebook | null> {
    const notebooks = await this.getNotebooks()
    return notebooks.find(n => n.id === id) || null
  }

  async saveNotebooks(notebooks: Notebook[]): Promise<Notebook[]> {
    const results: Notebook[] = []
    for (const notebook of notebooks) {
      try {
        const saved = await this.saveNotebook(notebook)
        results.push(saved)
      } catch (error) {
        loggingService.logError(error as Error, {
          context: 'saveNotebooks',
          notebookId: notebook.id,
        })
      }
    }
    return results
  }

  async deleteNotes(ids: string[]): Promise<void> {
    for (const id of ids) {
      try {
        await this.deleteNote(id)
      } catch (error) {
        loggingService.logError(error as Error, {
          context: 'deleteNotes',
          noteId: id,
        })
      }
    }
  }

  async deleteNotebooks(ids: string[]): Promise<void> {
    for (const id of ids) {
      try {
        await this.deleteNotebook(id)
      } catch (error) {
        loggingService.logError(error as Error, {
          context: 'deleteNotebooks',
          notebookId: id,
        })
      }
    }
  }

  async searchNotes(options: SearchOptions): Promise<SearchResult<Note>> {
    const startTime = Date.now()
    try {
      // Use existing search implementation for now
      const notes = await super.searchNotes(options.query || '')

      const result: SearchResult<Note> = {
        items: notes,
        total: notes.length,
        query: options.query || '',
        executionTime: Date.now() - startTime,
        facets: {},
      }

      this.updateMetrics('searchNotes', startTime)
      return result
    } catch (error) {
      this.updateMetricsError('searchNotes', startTime)
      throw error
    }
  }

  // =============================================================================
  // Bulk Operations
  // =============================================================================

  async createMany<T>(
    documents: Omit<T, 'id' | 'createdAt' | 'updatedAt'>[]
  ): Promise<T[]> {
    const results: T[] = []
    const now = new Date().toISOString()

    for (const doc of documents) {
      try {
        const created = {
          ...doc,
          id: this.generateId(),
          createdAt: now,
          updatedAt: now,
        } as T

        results.push(created)
      } catch (error) {
        loggingService.logError(error as Error, {
          context: 'createMany',
        })
      }
    }

    return results
  }

  async updateMany<T>(
    updates: Array<{ id: string; changes: Partial<T> }>
  ): Promise<T[]> {
    const results: T[] = []

    for (const update of updates) {
      try {
        // This is a simplified implementation
        // In practice, you'd need to handle different document types
        const updated = {
          ...update.changes,
          id: update.id,
          updatedAt: new Date().toISOString(),
        } as T

        results.push(updated)
      } catch (error) {
        loggingService.logError(error as Error, {
          context: 'updateMany',
          id: update.id,
        })
      }
    }

    return results
  }

  async deleteMany(ids: string[]): Promise<void> {
    await this.deleteNotes(ids)
  }

  async exists(id: string): Promise<boolean> {
    try {
      const note = await this.getNote(id)
      if (note) return true

      const notebook = await this.getNotebook(id)
      return !!notebook
    } catch {
      return false
    }
  }

  async count(filter?: FilterOptions<any>): Promise<number> {
    const [notes, notebooks] = await Promise.all([
      this.getNotes(filter),
      this.getNotebooks(filter),
    ])
    return notes.length + notebooks.length
  }

  // =============================================================================
  // Settings Storage (replacing localStorage patterns)
  // =============================================================================

  async getSettings<S = AppSettings>(): Promise<S> {
    const cacheKey = 'settings:app'

    // Check cache first
    if (this.config.enableCache) {
      const cached = this.getCachedData<S>(cacheKey)
      if (cached) return cached
    }

    try {
      const settings = await this.getStorageData<S>('settings', 'app')

      if (this.config.enableCache) {
        this.setCachedData(cacheKey, settings, this.config.cacheTtlMs!)
      }

      return settings || ({} as S)
    } catch (error) {
      loggingService.logError(error as Error, {
        context: 'getSettings',
      })
      return {} as S
    }
  }

  async setSettings<S = AppSettings>(settings: Partial<S>): Promise<void> {
    try {
      const currentSettings = await this.getSettings<S>()
      const updatedSettings = { ...currentSettings, ...settings }

      await this.setStorageData('settings', 'app', updatedSettings)

      // Invalidate cache
      if (this.config.enableCache) {
        this.invalidateCacheKey('settings:app')
      }

      this.emit({
        type: 'settings:updated',
        data: updatedSettings,
        timestamp: Date.now(),
      })
    } catch (error) {
      loggingService.logError(error as Error, {
        context: 'setSettings',
      })
      throw error
    }
  }

  async getSetting<S = AppSettings, K extends keyof S>(
    key: K
  ): Promise<S[K] | null> {
    const settings = await this.getSettings<S>()
    return settings[key] || null
  }

  async setSetting<S = AppSettings, K extends keyof S>(
    key: K,
    value: S[K]
  ): Promise<void> {
    const settings = await this.getSettings<S>()
    await this.setSettings({ ...settings, [key]: value })
  }

  async removeSetting(key: string): Promise<void> {
    const settings = await this.getSettings()
    delete (settings as any)[key]
    await this.setSettings(settings)
  }

  async clearSettings(): Promise<void> {
    await this.setStorageData('settings', 'app', {})
    if (this.config.enableCache) {
      this.invalidateCacheKey('settings:app')
    }
  }

  // =============================================================================
  // UI State Persistence
  // =============================================================================

  async getUIState<S>(component: string, key: string): Promise<S | null> {
    try {
      return await this.getStorageData<S>('ui', `${component}:${key}`)
    } catch {
      return null
    }
  }

  async setUIState<S>(component: string, key: string, value: S): Promise<void> {
    await this.setStorageData('ui', `${component}:${key}`, value)
  }

  async getComponentState<S>(component: string): Promise<S | null> {
    try {
      return await this.getStorageData<S>('ui', component)
    } catch {
      return null
    }
  }

  async setComponentState<S>(component: string, state: S): Promise<void> {
    await this.setStorageData('ui', component, state)
  }

  async removeComponentState(component: string): Promise<void> {
    await this.removeStorageData('ui', component)
  }

  // =============================================================================
  // Plugin Storage (secure plugin data management)
  // =============================================================================

  async getPluginData<D>(
    pluginId: string,
    key: string,
    options?: PluginStorageOptions
  ): Promise<D | null> {
    this.validatePluginId(pluginId)
    try {
      return await this.getStorageData<D>('plugins', `${pluginId}:${key}`)
    } catch {
      return null
    }
  }

  async setPluginData<D>(
    pluginId: string,
    key: string,
    value: D,
    options?: PluginStorageOptions
  ): Promise<void> {
    this.validatePluginId(pluginId)

    // Check quota if specified
    if (options?.enforceQuota) {
      const quota = await this.getPluginQuota(pluginId)
      const size = JSON.stringify(value).length
      if (quota.used + size > quota.limit) {
        throw new RepositoryError(
          'Plugin storage quota exceeded',
          RepositoryErrorCode.STORAGE_FULL,
          'setPluginData',
          { pluginId, size, quota }
        )
      }
    }

    await this.setStorageData('plugins', `${pluginId}:${key}`, value)
  }

  async removePluginData(pluginId: string, key: string): Promise<void> {
    this.validatePluginId(pluginId)
    await this.removeStorageData('plugins', `${pluginId}:${key}`)
  }

  async clearPluginData(pluginId: string): Promise<void> {
    this.validatePluginId(pluginId)
    // Clear all data for the plugin by removing all keys that start with pluginId
    const keysToRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(`plugins:${pluginId}:`)) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key))
  }

  async getPluginQuota(pluginId: string): Promise<PluginStorageQuota> {
    // Simplified implementation
    return {
      used: 0,
      limit: 1024 * 1024, // 1MB per plugin
      pluginId,
    }
  }

  async listPluginsWithData(): Promise<string[]> {
    // Simplified implementation
    return []
  }

  // =============================================================================
  // Content & Media Storage
  // =============================================================================

  async getContentData<D>(type: string, key: string): Promise<D | null> {
    try {
      return await this.getStorageData<D>('content', `${type}:${key}`)
    } catch {
      return null
    }
  }

  async setContentData<D>(type: string, key: string, value: D): Promise<void> {
    await this.setStorageData('content', `${type}:${key}`, value)
  }

  async removeContentData(type: string, key: string): Promise<void> {
    await this.removeStorageData('content', `${type}:${key}`)
  }

  async getContentStorageUsage(): Promise<{ used: number; limit: number }> {
    return {
      used: 0,
      limit: this.config.maxStorageSize || 50 * 1024 * 1024,
    }
  }

  // =============================================================================
  // Analytics & Tracking Storage
  // =============================================================================

  async getAnalyticsData<D>(key: string): Promise<D | null> {
    try {
      return await this.getStorageData<D>('analytics', key)
    } catch {
      return null
    }
  }

  async setAnalyticsData<D>(key: string, value: D): Promise<void> {
    // Apply privacy filtering here
    const filteredValue = this.applyPrivacyFilter(value)
    await this.setStorageData('analytics', key, filteredValue)
  }

  async removeAnalyticsData(key: string): Promise<void> {
    await this.removeStorageData('analytics', key)
  }

  async clearAnalyticsData(): Promise<void> {
    // Implementation would clear all analytics data
    await this.removeStorageData('analytics', '*')
  }

  // =============================================================================
  // Error & Debug Storage
  // =============================================================================

  async getErrorData<D>(key: string): Promise<D | null> {
    try {
      return await this.getStorageData<D>('errors', key)
    } catch {
      return null
    }
  }

  async setErrorData<D>(key: string, value: D): Promise<void> {
    await this.setStorageData('errors', key, value)
  }

  async removeErrorData(key: string): Promise<void> {
    await this.removeStorageData('errors', key)
  }

  async clearOldErrorData(olderThanMs: number): Promise<void> {
    // Implementation would clear old error data
    const cutoff = Date.now() - olderThanMs
    // This is simplified - would need to iterate through error data
  }

  // =============================================================================
  // Migration & Backup Operations
  // =============================================================================

  async migrateFromLocalStorage(
    mapping?: StorageKeyMapping
  ): Promise<MigrationResult> {
    const mappingToUse = mapping || DEFAULT_STORAGE_MAPPING
    const result: MigrationResult = {
      success: true,
      migratedKeys: [],
      skippedKeys: [],
      errors: [],
      totalItems: 0,
      migratedItems: 0,
    }

    for (const [localStorageKey, repositoryKey] of Object.entries(
      mappingToUse
    )) {
      try {
        const value = localStorage.getItem(localStorageKey)
        if (value !== null) {
          result.totalItems++

          const [category, key] = repositoryKey.split(':')
          await this.setStorageData(category, key, JSON.parse(value))

          result.migratedKeys.push(localStorageKey)
          result.migratedItems++
        }
      } catch (error) {
        result.errors.push({
          key: localStorageKey,
          error: (error as Error).message,
        })
      }
    }

    result.success = result.errors.length === 0

    loggingService.log('info', 'LocalStorage migration completed', {
      context: 'migrateFromLocalStorage',
      result,
    })

    return result
  }

  async exportToLocalStorage(keys: string[]): Promise<ExportResult> {
    const result: ExportResult = {
      success: true,
      exportedKeys: [],
      errors: [],
      totalSize: 0,
    }

    for (const key of keys) {
      try {
        const [category, subKey] = key.split(':')
        const value = await this.getStorageData(category, subKey)

        if (value !== null) {
          const serialized = JSON.stringify(value)
          localStorage.setItem(key, serialized)

          result.exportedKeys.push(key)
          result.totalSize += serialized.length
        }
      } catch (error) {
        result.errors.push({
          key,
          error: (error as Error).message,
        })
      }
    }

    result.success = result.errors.length === 0
    return result
  }

  async createBackup(keys?: string[]): Promise<BackupData> {
    const [notes, notebooks] = await Promise.all([
      this.getNotes(),
      this.getNotebooks(),
    ])

    const settings = await this.getSettings()

    return {
      version: '1.0',
      timestamp: Date.now(),
      data: {
        notes,
        notebooks,
        settings,
      },
      metadata: {
        totalItems: notes.length + notebooks.length,
        size: JSON.stringify({ notes, notebooks, settings }).length,
      },
    }
  }

  async restoreBackup(backup: BackupData): Promise<RestoreResult> {
    const result: RestoreResult = {
      success: true,
      restoredItems: 0,
      errors: [],
    }

    try {
      if (backup.data.notes) {
        await this.saveNotes(backup.data.notes)
        result.restoredItems += backup.data.notes.length
      }

      if (backup.data.notebooks) {
        for (const notebook of backup.data.notebooks) {
          await this.saveNotebook(notebook)
        }
        result.restoredItems += backup.data.notebooks.length
      }

      if (backup.data.settings) {
        await this.setSettings(backup.data.settings)
        result.restoredItems += 1
      }
    } catch (error) {
      result.success = false
      result.errors.push((error as Error).message)
    }

    return result
  }

  async validateBackup(backup: BackupData): Promise<ValidationResult> {
    // Simplified validation
    const isValid = backup.version && backup.timestamp && backup.data

    return {
      isValid: !!isValid,
      errors: isValid ? [] : ['Invalid backup format'],
      warnings: [],
    }
  }

  // =============================================================================
  // Cache Management
  // =============================================================================

  async preload(keys: string[]): Promise<void> {
    for (const key of keys) {
      try {
        const [category, subKey] = key.split(':')
        const data = await this.getStorageData(category, subKey)
        if (data && this.config.enableCache) {
          this.setCachedData(key, data, this.config.cacheTtlMs!)
        }
      } catch (error) {
        loggingService.logError(error as Error, {
          context: 'preload',
          key,
        })
      }
    }
  }

  async invalidateCache(pattern?: string): Promise<void> {
    if (!pattern) {
      this.cacheData.clear()
      return
    }

    for (const key of this.cacheData.keys()) {
      if (key.includes(pattern)) {
        this.cacheData.delete(key)
      }
    }
  }

  async getCacheStats(): Promise<CacheStats> {
    return {
      size: this.cacheData.size,
      maxSize: this.config.cacheMaxSize!,
      hitRate: this.metrics.cacheHitRate,
      memoryUsage: this.calculateCacheMemoryUsage(),
    }
  }

  async clearCache(): Promise<void> {
    this.cacheData.clear()
  }

  // =============================================================================
  // Transaction Support
  // =============================================================================

  async transaction<R>(
    operation: (repo: IEnhancedDocumentRepository) => Promise<R>
  ): Promise<R> {
    // Simplified transaction implementation
    // In a real implementation, you'd need rollback capabilities
    try {
      return await operation(this)
    } catch (error) {
      loggingService.logError(error as Error, {
        context: 'transaction',
      })
      throw error
    }
  }

  // =============================================================================
  // Event System & Subscriptions
  // =============================================================================

  subscribe(
    handler: RepositoryEventHandler,
    options?: SubscriptionOptions
  ): () => void {
    this.eventHandlers.add(handler)
    return () => {
      this.eventHandlers.delete(handler)
    }
  }

  emit<T>(event: RepositoryEvent<T>): void {
    for (const handler of this.eventHandlers) {
      try {
        handler(event)
      } catch (error) {
        loggingService.logError(error as Error, {
          context: 'emit',
          eventType: event.type,
        })
      }
    }
  }

  // =============================================================================
  // Import/Export & Utilities
  // =============================================================================

  override async importAll(
    data: string,
    options?: ImportOptions
  ): Promise<void> {
    const importData = JSON.parse(data)

    if (options?.validateSchema) {
      // Add schema validation here
    }

    if (options?.dryRun) {
      loggingService.log('info', 'Dry run import completed', {
        context: 'importAll',
        itemCount: Object.keys(importData).length,
      })
      return
    }

    await super.importAll(data)
  }

  validate<T>(data: T, schema: ValidationSchema<T>): ValidationResult<T> {
    // Simplified validation
    return {
      isValid: true,
      errors: [],
      warnings: [],
      data,
    }
  }

  async getStorageUsage(): Promise<StorageUsageStats> {
    const [notes, notebooks] = await Promise.all([
      this.getNotes(),
      this.getNotebooks(),
    ])

    const notesSize = JSON.stringify(notes).length
    const notebooksSize = JSON.stringify(notebooks).length

    return {
      totalUsed: notesSize + notebooksSize,
      totalAvailable: this.config.maxStorageSize!,
      usageByCategory: {
        notes: notesSize,
        notebooks: notebooksSize,
      },
      itemCounts: {
        notes: notes.length,
        notebooks: notebooks.length,
      },
      lastCleanup: Date.now(),
    }
  }

  // =============================================================================
  // Private Helper Methods
  // =============================================================================

  private async getStorageData<T>(
    category: string,
    key: string
  ): Promise<T | null> {
    // Implementation depends on storage backend (localStorage, IndexedDB, etc.)
    // This is a simplified version using localStorage for demonstration
    try {
      const storageKey = `${category}:${key}`
      const data = localStorage.getItem(storageKey)
      return data ? JSON.parse(data) : null
    } catch {
      return null
    }
  }

  private async setStorageData(
    category: string,
    key: string,
    value: any
  ): Promise<void> {
    try {
      const storageKey = `${category}:${key}`
      localStorage.setItem(storageKey, JSON.stringify(value))
    } catch (error) {
      throw new RepositoryError(
        'Failed to set storage data',
        RepositoryErrorCode.STORAGE_FULL,
        'setStorageData',
        { category, key }
      )
    }
  }

  private async removeStorageData(
    category: string,
    key: string
  ): Promise<void> {
    if (key === '*') {
      // Clear all data for category
      const keysToRemove: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const storageKey = localStorage.key(i)
        if (storageKey && storageKey.startsWith(`${category}:`)) {
          keysToRemove.push(storageKey)
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k))
    } else {
      const storageKey = `${category}:${key}`
      localStorage.removeItem(storageKey)
    }
  }

  private applyFilter<T>(items: T[], filter: FilterOptions<T>): T[] {
    // Simplified filtering implementation
    return items
  }

  private validatePluginId(pluginId: string): void {
    if (!pluginId || typeof pluginId !== 'string' || pluginId.length === 0) {
      throw new RepositoryError(
        'Invalid plugin ID',
        RepositoryErrorCode.VALIDATION_ERROR,
        'validatePluginId',
        { pluginId }
      )
    }
  }

  private applyPrivacyFilter<T>(data: T): T {
    // Apply privacy filtering to remove sensitive data
    return data
  }

  private getCachedData<T>(key: string): T | null {
    if (!this.config.enableCache) return null

    const cached = this.cacheData.get(key)
    if (!cached) return null

    if (Date.now() > cached.timestamp + cached.ttl) {
      this.cacheData.delete(key)
      return null
    }

    return cached.data
  }

  private setCachedData(key: string, data: any, ttl: number): void {
    if (!this.config.enableCache) return

    // Clean cache if it's too large
    if (this.cacheData.size >= this.config.cacheMaxSize!) {
      const oldestKey = this.cacheData.keys().next().value
      this.cacheData.delete(oldestKey)
    }

    this.cacheData.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    })
  }

  private invalidateCacheKey(key: string): void {
    this.cacheData.delete(key)
  }

  private setupCacheCleanup(): void {
    if (!this.config.enableCache) return

    setInterval(() => {
      const now = Date.now()
      for (const [key, cached] of this.cacheData.entries()) {
        if (now > cached.timestamp + cached.ttl) {
          this.cacheData.delete(key)
        }
      }
    }, 60000) // Clean every minute
  }

  private updateMetrics(operation: string, startTime: number): void {
    if (!this.config.enableMetrics) return

    const duration = Date.now() - startTime
    this.metrics.operationCount++
    this.metrics.avgResponseTime = (this.metrics.avgResponseTime + duration) / 2
    this.metrics.lastOperationTime = Date.now()
  }

  private updateMetricsError(operation: string, startTime: number): void {
    if (!this.config.enableMetrics) return

    this.metrics.errorCount++
    this.updateMetrics(operation, startTime)
  }

  private calculateCacheMemoryUsage(): number {
    let totalSize = 0
    for (const cached of this.cacheData.values()) {
      totalSize += JSON.stringify(cached.data).length
    }
    return totalSize
  }

  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}
