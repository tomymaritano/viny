/**
 * Tests for Repository Types and Storage Key Mappings
 * Validates type safety, error handling types, and localStorage migration mappings
 */

import { describe, it, expect } from 'vitest'
import type {
  OperationResult,
  MigrationResult,
  BackupData,
  RepositoryMetrics,
  FilterOptions,
  SearchOptions,
  SearchResult,
  StorageKeyMapping,
  PluginStorageOptions,
  RetryConfig,
  CircuitBreakerConfig,
  ValidationSchema,
  ValidationResult,
  RepositoryEvent,
  CacheEntry,
  CacheStats,
} from '../types/RepositoryTypes'
import {
  RepositoryError,
  RepositoryErrorCode,
  STORAGE_KEY_MAPPINGS,
  RestoreResult,
  ExportResult,
  PluginStorageQuota,
  ValidationRule,
} from '../types/RepositoryTypes'

describe('RepositoryError', () => {
  it('should create error with all properties', () => {
    const context = { userId: '123', action: 'save' }
    const cause = new Error('Original error')

    const error = new RepositoryError(
      'Test error',
      RepositoryErrorCode.VALIDATION_ERROR,
      'testOperation',
      context,
      cause
    )

    expect(error.message).toBe('Test error')
    expect(error.code).toBe(RepositoryErrorCode.VALIDATION_ERROR)
    expect(error.operation).toBe('testOperation')
    expect(error.context).toEqual(context)
    expect(error.cause).toBe(cause)
    expect(error.name).toBe('RepositoryError')
  })

  it('should preserve stack trace from cause', () => {
    const cause = new Error('Original error')
    const error = new RepositoryError(
      'Wrapper error',
      RepositoryErrorCode.UNKNOWN_ERROR,
      'test',
      {},
      cause
    )

    expect(error.stack).toContain('Caused by:')
  })

  describe('isRetryable property', () => {
    it('should identify retryable errors', () => {
      const retryableErrors = [
        RepositoryErrorCode.NETWORK_ERROR,
        RepositoryErrorCode.TIMEOUT_ERROR,
        RepositoryErrorCode.STORAGE_FULL,
        RepositoryErrorCode.CONFLICT_ERROR,
      ]

      retryableErrors.forEach(code => {
        const error = new RepositoryError('test', code, 'test')
        expect(error.isRetryable).toBe(true)
      })
    })

    it('should identify non-retryable errors', () => {
      const nonRetryableErrors = [
        RepositoryErrorCode.VALIDATION_ERROR,
        RepositoryErrorCode.PERMISSION_DENIED,
        RepositoryErrorCode.ENCRYPTION_ERROR,
        RepositoryErrorCode.NOT_FOUND,
      ]

      nonRetryableErrors.forEach(code => {
        const error = new RepositoryError('test', code, 'test')
        expect(error.isRetryable).toBe(false)
      })
    })
  })

  describe('isCritical property', () => {
    it('should identify critical errors', () => {
      const criticalErrors = [
        RepositoryErrorCode.ENCRYPTION_ERROR,
        RepositoryErrorCode.PERMISSION_DENIED,
      ]

      criticalErrors.forEach(code => {
        const error = new RepositoryError('test', code, 'test')
        expect(error.isCritical).toBe(true)
      })
    })

    it('should identify non-critical errors', () => {
      const nonCriticalErrors = [
        RepositoryErrorCode.NETWORK_ERROR,
        RepositoryErrorCode.VALIDATION_ERROR,
        RepositoryErrorCode.NOT_FOUND,
      ]

      nonCriticalErrors.forEach(code => {
        const error = new RepositoryError('test', code, 'test')
        expect(error.isCritical).toBe(false)
      })
    })
  })
})

describe('Storage Key Mappings', () => {
  it('should have all required localStorage mappings', () => {
    const expectedKeys = [
      'viny-settings',
      'language',
      'theme',
      'viny-initialized',
      'viny_security_config',
      'inkrun-sidebar-width',
      'inkrun-noteslist-width',
      'viny-split-ratio',
      'viny-images',
      'viny_search_history',
      'viny_analytics',
      'viny_telemetry',
      'viny_error_reports',
    ]

    expectedKeys.forEach(key => {
      expect(STORAGE_KEY_MAPPINGS).toHaveProperty(key)
    })
  })

  it('should have valid mapping structure', () => {
    Object.entries(STORAGE_KEY_MAPPINGS).forEach(([key, mapping]) => {
      expect(mapping).toHaveProperty('repositoryMethod')
      expect(mapping).toHaveProperty('priority')
      expect(['high', 'medium', 'low']).toContain(mapping.priority)

      // Optional properties
      if (mapping.transform) {
        expect(typeof mapping.transform).toBe('function')
      }
      if (mapping.validate) {
        expect(typeof mapping.validate).toBe('function')
      }
    })
  })

  it('should correctly transform UI state values', () => {
    const sidebarMapping = STORAGE_KEY_MAPPINGS['inkrun-sidebar-width']
    expect(sidebarMapping.transform).toBeDefined()

    if (sidebarMapping.transform) {
      const result = sidebarMapping.transform('300')
      expect(result).toEqual({ sidebarWidth: 300 })
    }
  })

  it('should correctly validate numeric values', () => {
    const sidebarMapping = STORAGE_KEY_MAPPINGS['inkrun-sidebar-width']
    expect(sidebarMapping.validate).toBeDefined()

    if (sidebarMapping.validate) {
      expect(sidebarMapping.validate('300')).toBe(true)
      expect(sidebarMapping.validate('invalid')).toBe(false)
    }
  })

  it('should correctly validate JSON values', () => {
    const imagesMapping = STORAGE_KEY_MAPPINGS['viny-images']
    expect(imagesMapping.validate).toBeDefined()

    if (imagesMapping.validate) {
      expect(imagesMapping.validate('{"valid": "json"}')).toBe(true)
      expect(imagesMapping.validate('invalid json')).toBe(false)
    }
  })

  it('should transform JSON values correctly', () => {
    const imagesMapping = STORAGE_KEY_MAPPINGS['viny-images']
    expect(imagesMapping.transform).toBeDefined()

    if (imagesMapping.transform) {
      const testData = '{"images": ["img1", "img2"]}'
      const result = imagesMapping.transform(testData)
      expect(result).toEqual({ images: ['img1', 'img2'] })
    }
  })

  it('should prioritize security-critical mappings as high', () => {
    const securityMapping = STORAGE_KEY_MAPPINGS['viny_security_config']
    expect(securityMapping.priority).toBe('high')
  })

  it('should prioritize settings as high', () => {
    const settingsMapping = STORAGE_KEY_MAPPINGS['viny-settings']
    expect(settingsMapping.priority).toBe('high')
  })
})

describe('Type Definitions', () => {
  describe('OperationResult', () => {
    it('should create successful operation result', () => {
      const result: OperationResult<string> = {
        success: true,
        data: 'test data',
        timestamp: Date.now(),
        operationId: 'op-123',
      }

      expect(result.success).toBe(true)
      expect(result.data).toBe('test data')
      expect(result.error).toBeUndefined()
    })

    it('should create failed operation result', () => {
      const error = new RepositoryError(
        'test',
        RepositoryErrorCode.UNKNOWN_ERROR,
        'test'
      )
      const result: OperationResult<never> = {
        success: false,
        error,
        timestamp: Date.now(),
        operationId: 'op-123',
      }

      expect(result.success).toBe(false)
      expect(result.error).toBe(error)
      expect(result.data).toBeUndefined()
    })
  })

  describe('MigrationResult', () => {
    it('should track migration progress', () => {
      const result: MigrationResult = {
        migratedKeys: ['key1', 'key2'],
        failedKeys: ['key3'],
        totalProcessed: 3,
        errors: [],
        duration: 1500,
      }

      expect(result.migratedKeys).toHaveLength(2)
      expect(result.failedKeys).toHaveLength(1)
      expect(result.totalProcessed).toBe(3)
    })
  })

  describe('BackupData', () => {
    it('should structure backup data correctly', () => {
      const backup: BackupData = {
        version: '1.0',
        timestamp: Date.now(),
        keys: ['settings', 'notes'],
        data: { settings: {}, notes: [] },
        checksum: 'abc123',
      }

      expect(backup.version).toBe('1.0')
      expect(backup.keys).toContain('settings')
      expect(backup.data).toHaveProperty('settings')
      expect(backup.checksum).toBe('abc123')
    })
  })

  describe('RepositoryMetrics', () => {
    it('should track performance metrics', () => {
      const metrics: RepositoryMetrics = {
        operationCount: 100,
        averageResponseTime: 250,
        p95ResponseTime: 500,
        errorRate: 0.02,
        totalStorageUsed: 1024000,
        availableStorage: 5000000,
        cacheHitRate: 0.85,
        lastOperation: Date.now(),
        isHealthy: true,
        uptime: 86400000,
      }

      expect(metrics.operationCount).toBe(100)
      expect(metrics.errorRate).toBe(0.02)
      expect(metrics.cacheHitRate).toBe(0.85)
      expect(metrics.isHealthy).toBe(true)
    })
  })

  describe('FilterOptions', () => {
    interface TestEntity {
      id: string
      name: string
      createdAt: string
    }

    it('should provide type-safe filtering', () => {
      const filter: FilterOptions<TestEntity> = {
        where: { name: 'test' },
        orderBy: 'createdAt',
        order: 'desc',
        limit: 10,
        offset: 0,
        include: ['id', 'name'],
        exclude: ['createdAt'],
      }

      expect(filter.where?.name).toBe('test')
      expect(filter.orderBy).toBe('createdAt')
      expect(filter.include).toContain('name')
    })
  })

  describe('SearchOptions and SearchResult', () => {
    it('should structure search parameters', () => {
      const options: SearchOptions = {
        query: 'test search',
        fields: ['title', 'content'],
        fuzzy: true,
        limit: 20,
        offset: 0,
        highlight: true,
      }

      expect(options.query).toBe('test search')
      expect(options.fields).toContain('title')
      expect(options.fuzzy).toBe(true)
    })

    it('should structure search results', () => {
      const result: SearchResult<{ id: string; title: string }> = {
        items: [{ id: '1', title: 'Test' }],
        total: 1,
        query: 'test',
        took: 50,
        highlights: { '1': ['<mark>test</mark>'] },
      }

      expect(result.items).toHaveLength(1)
      expect(result.total).toBe(1)
      expect(result.highlights?.['1']).toContain('<mark>test</mark>')
    })
  })

  describe('PluginStorageOptions', () => {
    it('should configure plugin storage security', () => {
      const options: PluginStorageOptions = {
        pluginId: 'my-plugin',
        sandboxed: true,
        encrypted: true,
        maxSize: 1024000,
        ttl: 86400000,
      }

      expect(options.pluginId).toBe('my-plugin')
      expect(options.sandboxed).toBe(true)
      expect(options.encrypted).toBe(true)
      expect(options.maxSize).toBe(1024000)
    })
  })

  describe('RetryConfig and CircuitBreakerConfig', () => {
    it('should configure retry behavior', () => {
      const config: RetryConfig = {
        maxAttempts: 3,
        baseDelayMs: 100,
        maxDelayMs: 5000,
        exponentialBackoff: true,
        jitter: true,
      }

      expect(config.maxAttempts).toBe(3)
      expect(config.exponentialBackoff).toBe(true)
      expect(config.jitter).toBe(true)
    })

    it('should configure circuit breaker', () => {
      const config: CircuitBreakerConfig = {
        enabled: true,
        failureThreshold: 5,
        resetTimeoutMs: 30000,
        monitoringPeriodMs: 60000,
      }

      expect(config.enabled).toBe(true)
      expect(config.failureThreshold).toBe(5)
      expect(config.resetTimeoutMs).toBe(30000)
    })
  })

  describe('ValidationSchema', () => {
    it('should define validation rules', () => {
      const schema: ValidationSchema<{ name: string; age: number }> = {
        name: {
          required: true,
          type: 'string',
          minLength: 1,
          maxLength: 100,
          pattern: /^[a-zA-Z\s]+$/,
        },
        age: {
          required: true,
          type: 'number',
          validator: (value: number) => value >= 0 && value <= 150,
        },
      }

      expect(schema.name.required).toBe(true)
      expect(schema.name.type).toBe('string')
      expect(schema.age.validator).toBeDefined()
    })

    it('should provide validation results', () => {
      const result: ValidationResult<{ name: string }> = {
        isValid: false,
        errors: ['Name is required'],
        warnings: ['Name should be capitalized'],
        sanitizedData: { name: 'John' },
      }

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Name is required')
      expect(result.warnings).toContain('Name should be capitalized')
    })
  })

  describe('RepositoryEvent', () => {
    it('should structure repository events', () => {
      const event: RepositoryEvent<{ id: string; title: string }> = {
        type: 'created',
        entity: 'Note',
        entityId: 'note-123',
        data: { id: 'note-123', title: 'New Note' },
        timestamp: Date.now(),
        source: 'repository',
      }

      expect(event.type).toBe('created')
      expect(event.entity).toBe('Note')
      expect(event.data?.title).toBe('New Note')
    })
  })

  describe('CacheEntry and CacheStats', () => {
    it('should structure cache entries', () => {
      const entry: CacheEntry<string> = {
        key: 'cache-key',
        value: 'cached value',
        timestamp: Date.now(),
        ttl: 60000,
        size: 100,
        hits: 5,
      }

      expect(entry.key).toBe('cache-key')
      expect(entry.value).toBe('cached value')
      expect(entry.hits).toBe(5)
    })

    it('should track cache statistics', () => {
      const stats: CacheStats = {
        totalEntries: 100,
        totalSize: 1024000,
        hitRate: 0.85,
        missRate: 0.15,
        evictions: 10,
      }

      expect(stats.totalEntries).toBe(100)
      expect(stats.hitRate + stats.missRate).toBe(1.0)
      expect(stats.evictions).toBe(10)
    })
  })
})

describe('Type Safety', () => {
  it('should enforce type constraints at compile time', () => {
    // These tests verify TypeScript type checking

    // RepositoryErrorCode should be strongly typed
    const validCode: RepositoryErrorCode = RepositoryErrorCode.VALIDATION_ERROR
    expect(Object.values(RepositoryErrorCode)).toContain(validCode)

    // StorageKeyMapping should enforce structure
    const mapping: StorageKeyMapping = {
      'test-key': {
        repositoryMethod: 'getSettings',
        priority: 'high',
      },
    }
    expect(mapping['test-key'].priority).toBe('high')

    // FilterOptions should be generic
    interface TestType {
      id: string
      value: number
    }

    const filter: FilterOptions<TestType> = {
      where: { value: 100 }, // Should only allow TestType properties
      orderBy: 'id', // Should only allow TestType keys
    }
    expect(filter.where?.value).toBe(100)
  })

  it('should provide proper error code enumeration', () => {
    const allCodes = Object.values(RepositoryErrorCode)

    expect(allCodes).toContain(RepositoryErrorCode.STORAGE_NOT_AVAILABLE)
    expect(allCodes).toContain(RepositoryErrorCode.VALIDATION_ERROR)
    expect(allCodes).toContain(RepositoryErrorCode.NETWORK_ERROR)
    expect(allCodes).toContain(RepositoryErrorCode.PERMISSION_DENIED)
    expect(allCodes).toContain(RepositoryErrorCode.UNKNOWN_ERROR)

    // Should be exactly the codes we defined
    expect(allCodes).toHaveLength(12)
  })
})
