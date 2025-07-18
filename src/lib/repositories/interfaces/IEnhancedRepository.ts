/**
 * Enhanced Repository Interfaces
 * Supports all localStorage usage patterns identified in storage audit
 * Provides type-safe, performant, and secure storage operations
 */

import { Note, Notebook } from '../../../types'
import { AppSettings } from '../../../types/settings'
import {
  RepositoryError,
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
  RetryConfig,
  ValidationSchema,
  ValidationResult,
  RepositoryEvent,
  RepositoryEventHandler,
  SubscriptionOptions,
  CacheStats
} from '../types/RepositoryTypes'

// =============================================================================
// Core Repository Interface (Enhanced)
// =============================================================================

export interface IEnhancedDocumentRepository {
  // =============================================================================
  // Initialization & Health
  // =============================================================================
  
  initialize(config?: RepositoryConfig): Promise<void>
  isInitialized(): boolean
  isHealthy(): Promise<boolean>
  getMetrics(): Promise<RepositoryMetrics>
  destroy(): Promise<void>
  
  // =============================================================================
  // Core Document Operations (existing + enhanced)
  // =============================================================================
  
  // Notes operations
  getNotes(filter?: FilterOptions<Note>): Promise<Note[]>
  getNote(id: string): Promise<Note | null>
  saveNote(note: Note): Promise<Note>
  saveNotes(notes: Note[]): Promise<Note[]>
  deleteNote(id: string): Promise<void>
  deleteNotes(ids: string[]): Promise<void>
  searchNotes(options: SearchOptions): Promise<SearchResult<Note>>
  
  // Notebooks operations
  getNotebooks(filter?: FilterOptions<Notebook>): Promise<Notebook[]>
  getNotebook(id: string): Promise<Notebook | null>
  saveNotebook(notebook: Notebook): Promise<Notebook>
  saveNotebooks(notebooks: Notebook[]): Promise<Notebook[]>
  deleteNotebook(id: string): Promise<void>
  deleteNotebooks(ids: string[]): Promise<void>
  
  // Bulk operations
  createMany<T>(documents: Omit<T, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<T[]>
  updateMany<T>(updates: Array<{ id: string; changes: Partial<T> }>): Promise<T[]>
  deleteMany(ids: string[]): Promise<void>
  
  // Advanced queries
  exists(id: string): Promise<boolean>
  count(filter?: FilterOptions<any>): Promise<number>
  
  // =============================================================================
  // Settings Storage (replacing localStorage patterns)
  // =============================================================================
  
  /**
   * Get application settings (replaces localStorage 'viny-settings')
   */
  getSettings<S = AppSettings>(): Promise<S>
  
  /**
   * Set application settings with partial updates
   */
  setSettings<S = AppSettings>(settings: Partial<S>): Promise<void>
  
  /**
   * Get individual setting by key
   */
  getSetting<S = AppSettings, K extends keyof S>(key: K): Promise<S[K] | null>
  
  /**
   * Set individual setting by key
   */
  setSetting<S = AppSettings, K extends keyof S>(key: K, value: S[K]): Promise<void>
  
  /**
   * Remove specific setting
   */
  removeSetting(key: string): Promise<void>
  
  /**
   * Clear all settings (reset to defaults)
   */
  clearSettings(): Promise<void>
  
  // =============================================================================
  // UI State Persistence (replacing localStorage UI patterns)
  // =============================================================================
  
  /**
   * Get UI component state (replaces layout width, split ratios, etc.)
   */
  getUIState<S>(component: string, key: string): Promise<S | null>
  
  /**
   * Set UI component state
   */
  setUIState<S>(component: string, key: string, value: S): Promise<void>
  
  /**
   * Get all UI state for a component
   */
  getComponentState<S>(component: string): Promise<S | null>
  
  /**
   * Set all UI state for a component
   */
  setComponentState<S>(component: string, state: S): Promise<void>
  
  /**
   * Remove UI state for a component
   */
  removeComponentState(component: string): Promise<void>
  
  // =============================================================================
  // Plugin Storage (secure plugin data management)
  // =============================================================================
  
  /**
   * Get plugin-specific data with security sandbox
   */
  getPluginData<D>(pluginId: string, key: string, options?: PluginStorageOptions): Promise<D | null>
  
  /**
   * Set plugin-specific data with validation and limits
   */
  setPluginData<D>(pluginId: string, key: string, value: D, options?: PluginStorageOptions): Promise<void>
  
  /**
   * Remove plugin-specific data
   */
  removePluginData(pluginId: string, key: string): Promise<void>
  
  /**
   * Clear all data for a plugin
   */
  clearPluginData(pluginId: string): Promise<void>
  
  /**
   * Get plugin storage quota information
   */
  getPluginQuota(pluginId: string): Promise<PluginStorageQuota>
  
  /**
   * List all plugins with stored data
   */
  listPluginsWithData(): Promise<string[]>
  
  // =============================================================================
  // Content & Media Storage (images, attachments)
  // =============================================================================
  
  /**
   * Get content data (images, attachments, etc.)
   */
  getContentData<D>(type: string, key: string): Promise<D | null>
  
  /**
   * Set content data with size limits
   */
  setContentData<D>(type: string, key: string, value: D): Promise<void>
  
  /**
   * Remove content data
   */
  removeContentData(type: string, key: string): Promise<void>
  
  /**
   * Get content storage usage
   */
  getContentStorageUsage(): Promise<{ used: number; limit: number }>
  
  // =============================================================================
  // Analytics & Tracking Storage (privacy-compliant)
  // =============================================================================
  
  /**
   * Get analytics data
   */
  getAnalyticsData<D>(key: string): Promise<D | null>
  
  /**
   * Set analytics data (with privacy filtering)
   */
  setAnalyticsData<D>(key: string, value: D): Promise<void>
  
  /**
   * Remove analytics data
   */
  removeAnalyticsData(key: string): Promise<void>
  
  /**
   * Clear all analytics data (privacy reset)
   */
  clearAnalyticsData(): Promise<void>
  
  // =============================================================================
  // Error & Debug Storage
  // =============================================================================
  
  /**
   * Get error/debug data
   */
  getErrorData<D>(key: string): Promise<D | null>
  
  /**
   * Set error/debug data
   */
  setErrorData<D>(key: string, value: D): Promise<void>
  
  /**
   * Remove error data
   */
  removeErrorData(key: string): Promise<void>
  
  /**
   * Clear old error data (cleanup)
   */
  clearOldErrorData(olderThanMs: number): Promise<void>
  
  // =============================================================================
  // Migration & Backup Operations
  // =============================================================================
  
  /**
   * Migrate data from localStorage to repository
   */
  migrateFromLocalStorage(mapping?: StorageKeyMapping): Promise<MigrationResult>
  
  /**
   * Export data to localStorage (rollback capability)
   */
  exportToLocalStorage(keys: string[]): Promise<ExportResult>
  
  /**
   * Create backup of all or specific data
   */
  createBackup(keys?: string[]): Promise<BackupData>
  
  /**
   * Restore data from backup
   */
  restoreBackup(backup: BackupData): Promise<RestoreResult>
  
  /**
   * Validate backup integrity
   */
  validateBackup(backup: BackupData): Promise<ValidationResult>
  
  // =============================================================================
  // Cache Management
  // =============================================================================
  
  /**
   * Preload data into cache
   */
  preload(keys: string[]): Promise<void>
  
  /**
   * Invalidate cache entries
   */
  invalidateCache(pattern?: string): Promise<void>
  
  /**
   * Get cache statistics
   */
  getCacheStats(): Promise<CacheStats>
  
  /**
   * Clear cache
   */
  clearCache(): Promise<void>
  
  // =============================================================================
  // Transaction Support
  // =============================================================================
  
  /**
   * Execute multiple operations in transaction
   */
  transaction<R>(operation: (repo: IEnhancedDocumentRepository) => Promise<R>): Promise<R>
  
  // =============================================================================
  // Event System & Subscriptions
  // =============================================================================
  
  /**
   * Subscribe to repository events
   */
  subscribe(handler: RepositoryEventHandler, options?: SubscriptionOptions): () => void
  
  /**
   * Emit repository event
   */
  emit<T>(event: RepositoryEvent<T>): void
  
  // =============================================================================
  // Import/Export & Utilities
  // =============================================================================
  
  /**
   * Export all documents as JSON
   */
  exportAll(): Promise<string>
  
  /**
   * Import documents from JSON with validation
   */
  importAll(data: string, options?: ImportOptions): Promise<void>
  
  /**
   * Validate data against schema
   */
  validate<T>(data: T, schema: ValidationSchema<T>): ValidationResult<T>
  
  /**
   * Get storage usage statistics
   */
  getStorageUsage(): Promise<StorageUsageStats>
}

// =============================================================================
// Configuration Interfaces
// =============================================================================

export interface RepositoryConfig {
  // Performance settings
  enableCache?: boolean
  cacheMaxSize?: number
  cacheTtlMs?: number
  
  // Retry settings
  retryConfig?: RetryConfig
  
  // Security settings
  enableEncryption?: boolean
  encryptionKey?: string
  
  // Monitoring settings
  enableMetrics?: boolean
  metricsRetentionMs?: number
  
  // Storage settings
  maxStorageSize?: number
  compressionEnabled?: boolean
  
  // Environment settings
  environment?: 'development' | 'production' | 'test'
  logLevel?: 'debug' | 'info' | 'warn' | 'error'
}

export interface ImportOptions {
  overwrite?: boolean
  validateSchema?: boolean
  ignoreErrors?: boolean
  dryRun?: boolean
}

export interface StorageUsageStats {
  totalUsed: number
  totalAvailable: number
  usageByCategory: Record<string, number>
  itemCounts: Record<string, number>
  lastCleanup: number
}

// =============================================================================
// Factory Interface for Dependency Injection
// =============================================================================

export interface IEnhancedRepositoryFactory {
  createDocumentRepository(config?: RepositoryConfig): IEnhancedDocumentRepository
  createSettingsRepository(config?: RepositoryConfig): ISettingsRepository
  getDefaultConfig(): RepositoryConfig
}

// =============================================================================
// Settings Repository Interface (enhanced)
// =============================================================================

export interface ISettingsRepository {
  // Core settings operations
  getSettings(): Promise<AppSettings>
  saveSettings(settings: Partial<AppSettings>): Promise<void>
  resetSettings(): Promise<void>
  
  // Individual setting operations
  getSetting<K extends keyof AppSettings>(key: K): Promise<AppSettings[K]>
  setSetting<K extends keyof AppSettings>(key: K, value: AppSettings[K]): Promise<void>
  removeSetting<K extends keyof AppSettings>(key: K): Promise<void>
  
  // Tag color management
  getTagColors(): Promise<Record<string, string>>
  saveTagColors(tagColors: Record<string, string>): Promise<void>
  
  // Watch for changes
  watch<K extends keyof AppSettings>(
    key: K, 
    callback: (value: AppSettings[K]) => void
  ): () => void
  
  // Validation
  validateSettings(settings: Partial<AppSettings>): ValidationResult<AppSettings>
  
  // Backup & restore
  backup(): Promise<BackupData>
  restore(backup: BackupData): Promise<RestoreResult>
  
  // Import/Export
  export(): Promise<string>
  import(data: string): Promise<void>
  
  // Migration from localStorage
  migrateFromLocalStorage(): Promise<MigrationResult>
}

// =============================================================================
// Type Guards and Utilities
// =============================================================================

export function isRepositoryError(error: unknown): error is RepositoryError {
  return error instanceof RepositoryError
}

export function createOperationResult<T>(
  success: boolean,
  data?: T,
  error?: RepositoryError
): OperationResult<T> {
  return {
    success,
    data,
    error,
    timestamp: Date.now(),
    operationId: `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

export function isValidStorageKey(key: string): boolean {
  return typeof key === 'string' && 
         key.length > 0 && 
         key.length <= 250 && 
         !/[<>:"/\\|?*\x00-\x1f]/.test(key)
}

export function sanitizeStorageKey(key: string): string {
  return key
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, '_')
    .substring(0, 250)
    .trim()
}