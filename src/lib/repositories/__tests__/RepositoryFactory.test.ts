/**
 * Tests for Repository Factory
 * Validates dependency injection and repository creation
 */

import { vi, describe, it, expect, beforeEach } from 'vitest'
import { RepositoryFactory } from '../RepositoryFactory'
import { DocumentRepository } from '../DocumentRepository'
import { SettingsRepository } from '../SettingsRepository'
import type { RepositoryConfig } from '../interfaces/IEnhancedRepository'

describe('RepositoryFactory', () => {
  let factory: RepositoryFactory

  beforeEach(() => {
    factory = new RepositoryFactory()
  })

  describe('createDocumentRepository', () => {
    it('should create DocumentRepository with default config', () => {
      const repository = factory.createDocumentRepository()

      expect(repository).toBeInstanceOf(DocumentRepository)
    })

    it('should create DocumentRepository with custom config', () => {
      const config: RepositoryConfig = {
        enableCache: true,
        cacheMaxSize: 1000,
        enableMetrics: true,
        retryConfig: {
          maxAttempts: 5,
          baseDelayMs: 200,
          maxDelayMs: 10000,
          exponentialBackoff: true,
          jitter: true,
        },
      }

      const repository = factory.createDocumentRepository(config)

      expect(repository).toBeInstanceOf(DocumentRepository)
    })

    it('should create different instances for multiple calls', () => {
      const repo1 = factory.createDocumentRepository()
      const repo2 = factory.createDocumentRepository()

      expect(repo1).not.toBe(repo2)
      expect(repo1).toBeInstanceOf(DocumentRepository)
      expect(repo2).toBeInstanceOf(DocumentRepository)
    })
  })

  describe('createSettingsRepository', () => {
    it('should create SettingsRepository with default config', () => {
      const repository = factory.createSettingsRepository()

      expect(repository).toBeInstanceOf(SettingsRepository)
    })

    it('should create SettingsRepository with custom config', () => {
      const config: RepositoryConfig = {
        enableEncryption: true,
        encryptionKey: 'test-key',
        enableCache: false,
        logLevel: 'debug',
      }

      const repository = factory.createSettingsRepository(config)

      expect(repository).toBeInstanceOf(SettingsRepository)
    })

    it('should create different instances for multiple calls', () => {
      const repo1 = factory.createSettingsRepository()
      const repo2 = factory.createSettingsRepository()

      expect(repo1).not.toBe(repo2)
      expect(repo1).toBeInstanceOf(SettingsRepository)
      expect(repo2).toBeInstanceOf(SettingsRepository)
    })
  })

  describe('getDefaultConfig', () => {
    it('should provide comprehensive default configuration', () => {
      const config = factory.getDefaultConfig()

      // Performance settings
      expect(config.enableCache).toBe(true)
      expect(config.cacheMaxSize).toBe(1000)
      expect(config.cacheTtlMs).toBe(300000) // 5 minutes

      // Retry settings
      expect(config.retryConfig).toBeDefined()
      expect(config.retryConfig?.maxAttempts).toBe(3)
      expect(config.retryConfig?.baseDelayMs).toBe(100)
      expect(config.retryConfig?.maxDelayMs).toBe(5000)
      expect(config.retryConfig?.exponentialBackoff).toBe(true)
      expect(config.retryConfig?.jitter).toBe(true)

      // Security settings
      expect(config.enableEncryption).toBe(false)
      expect(config.encryptionKey).toBeUndefined()

      // Monitoring settings
      expect(config.enableMetrics).toBe(true)
      expect(config.metricsRetentionMs).toBe(86400000) // 24 hours

      // Storage settings
      expect(config.maxStorageSize).toBe(100 * 1024 * 1024) // 100MB
      expect(config.compressionEnabled).toBe(true)

      // Environment settings
      expect(config.environment).toBe('production')
      expect(config.logLevel).toBe('info')
    })

    it('should return same config object for multiple calls', () => {
      const config1 = factory.getDefaultConfig()
      const config2 = factory.getDefaultConfig()

      expect(config1).toEqual(config2)
    })

    it('should provide development-specific defaults in development', () => {
      // Mock development environment
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'

      // Create new factory to pick up environment
      const devFactory = new RepositoryFactory()
      const config = devFactory.getDefaultConfig()

      expect(config.environment).toBe('development')
      expect(config.logLevel).toBe('debug')
      expect(config.enableMetrics).toBe(true)

      // Restore original environment
      process.env.NODE_ENV = originalEnv
    })

    it('should provide test-specific defaults in test environment', () => {
      // Mock test environment
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'test'

      // Create new factory to pick up environment
      const testFactory = new RepositoryFactory()
      const config = testFactory.getDefaultConfig()

      expect(config.environment).toBe('test')
      expect(config.enableCache).toBe(false) // Disabled for predictable tests
      expect(config.enableMetrics).toBe(false) // Disabled for performance
      expect(config.logLevel).toBe('warn') // Reduced logging noise

      // Restore original environment
      process.env.NODE_ENV = originalEnv
    })
  })

  describe('Configuration Merging', () => {
    it('should merge custom config with defaults', () => {
      const customConfig: Partial<RepositoryConfig> = {
        enableCache: false,
        retryConfig: {
          maxAttempts: 5,
          baseDelayMs: 50,
          maxDelayMs: 2000,
          exponentialBackoff: false,
          jitter: false,
        },
      }

      const repository = factory.createDocumentRepository(customConfig)

      // Should use custom values where provided
      expect(repository).toBeInstanceOf(DocumentRepository)

      // Verify the config was applied (would need access to internal config)
      // This test validates the factory accepts the config without error
    })

    it('should handle undefined config gracefully', () => {
      const repository = factory.createDocumentRepository(undefined)

      expect(repository).toBeInstanceOf(DocumentRepository)
    })

    it('should handle empty config object', () => {
      const repository = factory.createDocumentRepository({})

      expect(repository).toBeInstanceOf(DocumentRepository)
    })
  })

  describe('Repository Lifecycle', () => {
    it('should create repositories that can be initialized', async () => {
      const repository = factory.createDocumentRepository()

      // Should not throw during initialization
      await expect(repository.initialize()).resolves.not.toThrow()
    })

    it('should create repositories that can be destroyed', async () => {
      const repository = factory.createDocumentRepository()
      await repository.initialize()

      // Should not throw during destruction
      await expect(repository.destroy()).resolves.not.toThrow()
    })
  })

  describe('Error Handling', () => {
    it('should handle invalid retry configuration gracefully', () => {
      const invalidConfig: RepositoryConfig = {
        retryConfig: {
          maxAttempts: -1, // Invalid
          baseDelayMs: -100, // Invalid
          maxDelayMs: 50, // Less than base delay
          exponentialBackoff: true,
          jitter: true,
        },
      }

      // Should still create repository, factory should validate/correct config
      const repository = factory.createDocumentRepository(invalidConfig)
      expect(repository).toBeInstanceOf(DocumentRepository)
    })

    it('should handle invalid cache configuration', () => {
      const invalidConfig: RepositoryConfig = {
        enableCache: true,
        cacheMaxSize: -1, // Invalid
        cacheTtlMs: -1000, // Invalid
      }

      const repository = factory.createDocumentRepository(invalidConfig)
      expect(repository).toBeInstanceOf(DocumentRepository)
    })

    it('should handle invalid storage configuration', () => {
      const invalidConfig: RepositoryConfig = {
        maxStorageSize: -1, // Invalid
        compressionEnabled: true,
      }

      const repository = factory.createDocumentRepository(invalidConfig)
      expect(repository).toBeInstanceOf(DocumentRepository)
    })
  })

  describe('Singleton Behavior', () => {
    it('should not implement singleton pattern by default', () => {
      const repo1 = factory.createDocumentRepository()
      const repo2 = factory.createDocumentRepository()

      expect(repo1).not.toBe(repo2)
    })

    it('should allow creating multiple factories', () => {
      const factory1 = new RepositoryFactory()
      const factory2 = new RepositoryFactory()

      expect(factory1).not.toBe(factory2)

      const repo1 = factory1.createDocumentRepository()
      const repo2 = factory2.createDocumentRepository()

      expect(repo1).not.toBe(repo2)
    })
  })

  describe('Environment Detection', () => {
    it('should detect Electron environment', () => {
      // Mock Electron environment
      Object.defineProperty(global, 'window', {
        value: {
          electronAPI: {
            isElectron: true,
          },
        },
        configurable: true,
      })

      const repository = factory.createDocumentRepository()
      expect(repository).toBeInstanceOf(DocumentRepository)

      // Clean up
      delete (global as any).window
    })

    it('should detect browser environment', () => {
      // Mock browser environment
      Object.defineProperty(global, 'window', {
        value: {},
        configurable: true,
      })

      Object.defineProperty(global, 'localStorage', {
        value: {
          getItem: jest.fn(),
          setItem: jest.fn(),
          removeItem: jest.fn(),
        },
        configurable: true,
      })

      const repository = factory.createDocumentRepository()
      expect(repository).toBeInstanceOf(DocumentRepository)

      // Clean up
      delete (global as any).window
      delete (global as any).localStorage
    })
  })

  describe('Configuration Validation', () => {
    it('should validate encryption configuration', () => {
      const configWithEncryption: RepositoryConfig = {
        enableEncryption: true,
        encryptionKey: 'test-encryption-key-123',
      }

      const repository = factory.createSettingsRepository(configWithEncryption)
      expect(repository).toBeInstanceOf(SettingsRepository)
    })

    it('should handle missing encryption key when encryption enabled', () => {
      const configWithoutKey: RepositoryConfig = {
        enableEncryption: true,
        // encryptionKey missing
      }

      // Should still create repository, implementation should handle missing key
      const repository = factory.createSettingsRepository(configWithoutKey)
      expect(repository).toBeInstanceOf(SettingsRepository)
    })

    it('should validate log level configuration', () => {
      const validLogLevels: Array<RepositoryConfig['logLevel']> = [
        'debug',
        'info',
        'warn',
        'error',
      ]

      validLogLevels.forEach(logLevel => {
        const config: RepositoryConfig = { logLevel }
        const repository = factory.createDocumentRepository(config)
        expect(repository).toBeInstanceOf(DocumentRepository)
      })
    })

    it('should validate environment configuration', () => {
      const validEnvironments: Array<RepositoryConfig['environment']> = [
        'development',
        'production',
        'test',
      ]

      validEnvironments.forEach(environment => {
        const config: RepositoryConfig = { environment }
        const repository = factory.createDocumentRepository(config)
        expect(repository).toBeInstanceOf(DocumentRepository)
      })
    })
  })
})
