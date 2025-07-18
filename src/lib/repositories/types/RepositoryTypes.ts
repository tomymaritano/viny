/**
 * Enhanced Repository Types and Interfaces
 * Based on storage audit results and migration requirements
 * Supports all localStorage patterns identified in the codebase
 */

import { Note, Notebook } from '../../../types'
import { AppSettings } from '../../../types/settings'

// =============================================================================
// Error Handling Types
// =============================================================================

export enum RepositoryErrorCode {
  // Storage errors
  STORAGE_NOT_AVAILABLE = 'STORAGE_NOT_AVAILABLE',
  STORAGE_FULL = 'STORAGE_FULL',
  STORAGE_CORRUPT = 'STORAGE_CORRUPT',
  
  // Data errors
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  CONFLICT_ERROR = 'CONFLICT_ERROR',
  SCHEMA_ERROR = 'SCHEMA_ERROR',
  
  // Network/sync errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  SYNC_ERROR = 'SYNC_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  
  // Security errors
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  ENCRYPTION_ERROR = 'ENCRYPTION_ERROR',
  
  // System errors
  INITIALIZATION_ERROR = 'INITIALIZATION_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export class RepositoryError extends Error {
  constructor(
    message: string,
    public readonly code: RepositoryErrorCode,
    public readonly operation: string,
    public readonly context?: Record<string, any>,
    public readonly cause?: Error
  ) {
    super(message)
    this.name = 'RepositoryError'
    
    // Preserve stack trace
    if (cause?.stack) {
      this.stack = `${this.stack}\nCaused by: ${cause.stack}`
    }
  }

  /**
   * Check if error is retryable
   */
  get isRetryable(): boolean {
    return [
      RepositoryErrorCode.NETWORK_ERROR,
      RepositoryErrorCode.TIMEOUT_ERROR,
      RepositoryErrorCode.STORAGE_FULL,
      RepositoryErrorCode.CONFLICT_ERROR
    ].includes(this.code)
  }

  /**
   * Check if error is critical (should not be logged to prevent sensitive data exposure)
   */
  get isCritical(): boolean {
    return [
      RepositoryErrorCode.ENCRYPTION_ERROR,
      RepositoryErrorCode.PERMISSION_DENIED
    ].includes(this.code)
  }
}

// =============================================================================
// Operation Result Types
// =============================================================================

export interface OperationResult<T = void> {
  success: boolean
  data?: T
  error?: RepositoryError
  timestamp: number
  operationId: string
}

export interface MigrationResult {
  migratedKeys: string[]
  failedKeys: string[]
  totalProcessed: number
  errors: RepositoryError[]
  duration: number
}

export interface BackupData {
  version: string
  timestamp: number
  keys: string[]
  data: Record<string, any>
  checksum: string
}

export interface RestoreResult {
  restoredKeys: string[]
  failedKeys: string[]
  totalProcessed: number
  errors: RepositoryError[]
}

export interface ExportResult {
  keys: string[]
  data: Record<string, any>
  timestamp: number
  size: number
}

// =============================================================================
// Repository Metrics & Monitoring
// =============================================================================

export interface RepositoryMetrics {
  // Performance metrics
  operationCount: number
  averageResponseTime: number
  p95ResponseTime: number
  errorRate: number
  
  // Storage metrics
  totalStorageUsed: number
  availableStorage: number
  cacheHitRate: number
  
  // Health metrics
  lastOperation: number
  isHealthy: boolean
  uptime: number
}

export interface PerformanceConfig {
  timeoutMs: number
  maxRetries: number
  retryDelayMs: number
  enableMetrics: boolean
  enableCache: boolean
  cacheMaxSize: number
  cacheTtlMs: number
}

// =============================================================================
// Filter and Query Types
// =============================================================================

export interface FilterOptions<T> {
  where?: Partial<T>
  orderBy?: keyof T
  order?: 'asc' | 'desc'
  limit?: number
  offset?: number
  include?: (keyof T)[]
  exclude?: (keyof T)[]
}

export interface SearchOptions {
  query: string
  fields?: string[]
  fuzzy?: boolean
  limit?: number
  offset?: number
  highlight?: boolean
}

export interface SearchResult<T> {
  items: T[]
  total: number
  query: string
  took: number
  highlights?: Record<string, string[]>
}

// =============================================================================
// Storage Key Mapping (for localStorage migration)
// =============================================================================

export interface StorageKeyMapping {
  [localStorageKey: string]: {
    repositoryMethod: string
    transform?: (value: any) => any
    validate?: (value: any) => boolean
    priority: 'high' | 'medium' | 'low'
  }
}

// Predefined mappings based on storage audit
export const STORAGE_KEY_MAPPINGS: StorageKeyMapping = {
  // Settings & Configuration
  'viny-settings': {
    repositoryMethod: 'getSettings',
    priority: 'high'
  },
  'language': {
    repositoryMethod: 'getUIState',
    transform: (value) => ({ language: value }),
    priority: 'medium'
  },
  'theme': {
    repositoryMethod: 'getUIState',
    transform: (value) => ({ theme: value }),
    priority: 'medium'
  },
  'viny-initialized': {
    repositoryMethod: 'getSettings',
    transform: (value) => ({ initialized: value === 'true' }),
    priority: 'low'
  },
  
  // Plugin System
  'viny_security_config': {
    repositoryMethod: 'getPluginData',
    priority: 'high'
  },
  
  // UI State
  'inkrun-sidebar-width': {
    repositoryMethod: 'getUIState',
    transform: (value) => ({ sidebarWidth: parseInt(value) }),
    validate: (value) => !isNaN(parseInt(value)),
    priority: 'low'
  },
  'inkrun-noteslist-width': {
    repositoryMethod: 'getUIState',
    transform: (value) => ({ notesListWidth: parseInt(value) }),
    validate: (value) => !isNaN(parseInt(value)),
    priority: 'low'
  },
  'viny-split-ratio': {
    repositoryMethod: 'getUIState',
    transform: (value) => ({ splitRatio: parseFloat(value) }),
    validate: (value) => !isNaN(parseFloat(value)),
    priority: 'low'
  },
  
  // Content & Media
  'viny-images': {
    repositoryMethod: 'getContentData',
    transform: (value) => JSON.parse(value),
    validate: (value) => {
      try {
        JSON.parse(value)
        return true
      } catch {
        return false
      }
    },
    priority: 'medium'
  },
  
  // Search & Analytics
  'viny_search_history': {
    repositoryMethod: 'getAnalyticsData',
    transform: (value) => JSON.parse(value),
    priority: 'low'
  },
  'viny_analytics': {
    repositoryMethod: 'getAnalyticsData',
    priority: 'low'
  },
  'viny_telemetry': {
    repositoryMethod: 'getAnalyticsData',
    priority: 'low'
  },
  
  // Error Handling
  'viny_error_reports': {
    repositoryMethod: 'getErrorData',
    transform: (value) => JSON.parse(value),
    priority: 'low'
  }
}

// =============================================================================
// Plugin-specific Types
// =============================================================================

export interface PluginStorageOptions {
  pluginId: string
  sandboxed: boolean
  encrypted: boolean
  maxSize?: number
  ttl?: number
}

export interface PluginStorageQuota {
  pluginId: string
  used: number
  limit: number
  remaining: number
}

// =============================================================================
// Retry and Resilience Types
// =============================================================================

export interface RetryConfig {
  maxAttempts: number
  baseDelayMs: number
  maxDelayMs: number
  exponentialBackoff: boolean
  jitter: boolean
}

export interface CircuitBreakerConfig {
  enabled: boolean
  failureThreshold: number
  resetTimeoutMs: number
  monitoringPeriodMs: number
}

// =============================================================================
// Validation and Schema Types
// =============================================================================

export interface ValidationRule<T = any> {
  required?: boolean
  type?: 'string' | 'number' | 'boolean' | 'object' | 'array'
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  validator?: (value: T) => boolean | string
  transform?: (value: any) => T
}

export interface ValidationSchema<T = any> {
  [key: string]: ValidationRule<T>
}

export interface ValidationResult<T = any> {
  isValid: boolean
  errors: string[]
  warnings: string[]
  sanitizedData?: T
}

// =============================================================================
// Event and Subscription Types
// =============================================================================

export interface RepositoryEvent<T = any> {
  type: 'created' | 'updated' | 'deleted' | 'error'
  entity: string
  entityId?: string
  data?: T
  timestamp: number
  source: string
}

export type RepositoryEventHandler<T = any> = (event: RepositoryEvent<T>) => void

export interface SubscriptionOptions {
  entityTypes?: string[]
  eventTypes?: RepositoryEvent['type'][]
  debounceMs?: number
}

// =============================================================================
// Cache Types
// =============================================================================

export interface CacheEntry<T = any> {
  key: string
  value: T
  timestamp: number
  ttl: number
  size: number
  hits: number
}

export interface CacheStats {
  totalEntries: number
  totalSize: number
  hitRate: number
  missRate: number
  evictions: number
}

export { RepositoryErrorCode as ErrorCode }