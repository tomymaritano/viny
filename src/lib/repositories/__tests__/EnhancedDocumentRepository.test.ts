/**
 * Enhanced Document Repository Tests
 * Validates the extended functionality for localStorage replacement
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { EnhancedDocumentRepository } from '../EnhancedDocumentRepository'
import type { Note, Notebook } from '../../../types'
import type { RepositoryConfig } from '../interfaces/IEnhancedRepository'

// Mock localStorage for testing
const localStorageMock = {
  store: new Map<string, string>(),
  getItem: vi.fn((key: string) => localStorageMock.store.get(key) || null),
  setItem: vi.fn((key: string, value: string) => {
    localStorageMock.store.set(key, value)
  }),
  removeItem: vi.fn((key: string) => {
    localStorageMock.store.delete(key)
  }),
  clear: vi.fn(() => {
    localStorageMock.store.clear()
  }),
}

// Mock window.electronAPI (simulate Electron environment for testing)
const electronAPIMock = {
  isElectron: true, // Set to true to avoid IndexedDB issues in tests
  storage: {
    loadAllNotes: vi.fn().mockResolvedValue([]),
    loadNotebooks: vi.fn().mockResolvedValue([]),
    saveNote: vi.fn().mockResolvedValue({ success: true }),
    saveNotebooks: vi.fn().mockResolvedValue({ success: true }),
    deleteNote: vi.fn().mockResolvedValue({ success: true }),
  },
}

// Mock global indexedDB to avoid "not available" error
const indexedDBMock = {
  open: vi.fn(),
  deleteDatabase: vi.fn(),
  cmp: vi.fn(),
}

// Mock StorageUtils
vi.mock('../IRepository', async () => {
  const actual = await vi.importActual('../IRepository')
  return {
    ...actual,
    StorageUtils: {
      isElectron: () => true,
      hasLocalStorage: () => true,
      hasIndexedDB: () => true,
    },
  }
})

describe('EnhancedDocumentRepository', () => {
  let repository: EnhancedDocumentRepository
  let config: RepositoryConfig

  beforeEach(async () => {
    // Setup mocks
    Object.defineProperty(global, 'localStorage', {
      value: localStorageMock,
      writable: true,
    })

    Object.defineProperty(global, 'window', {
      value: { electronAPI: electronAPIMock },
      writable: true,
    })

    Object.defineProperty(global, 'indexedDB', {
      value: indexedDBMock,
      writable: true,
    })

    // Reset localStorage
    localStorageMock.store.clear()
    vi.clearAllMocks()

    // Create repository with test config
    config = {
      enableCache: true,
      cacheMaxSize: 10,
      cacheTtlMs: 1000,
      enableMetrics: true,
      environment: 'test',
      logLevel: 'error',
    }

    repository = new EnhancedDocumentRepository(config)
    await repository.initialize()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Initialization and Health', () => {
    it('should initialize successfully', async () => {
      expect(repository.isInitialized()).toBe(true)
    })

    it('should report health status', async () => {
      const isHealthy = await repository.isHealthy()
      expect(isHealthy).toBe(true)
    })

    it('should provide metrics', async () => {
      const metrics = await repository.getMetrics()
      expect(metrics).toBeDefined()
      expect(metrics.operationCount).toBe(0)
      expect(metrics.errorCount).toBe(0)
    })
  })

  describe('Settings Storage', () => {
    it('should get and set settings', async () => {
      const testSettings = { theme: 'dark', language: 'en' }

      await repository.setSettings(testSettings)
      const retrievedSettings = await repository.getSettings()

      expect(retrievedSettings).toEqual(testSettings)
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'settings:app',
        JSON.stringify(testSettings)
      )
    })

    it('should get individual setting', async () => {
      const testSettings = { theme: 'dark', language: 'en' }
      await repository.setSettings(testSettings)

      const theme = await repository.getSetting('theme')
      expect(theme).toBe('dark')
    })

    it('should set individual setting', async () => {
      await repository.setSetting('theme', 'light')
      const settings = await repository.getSettings()

      expect(settings.theme).toBe('light')
    })

    it('should remove setting', async () => {
      await repository.setSettings({ theme: 'dark', language: 'en' })
      await repository.removeSetting('theme')

      const settings = await repository.getSettings()
      expect(settings.theme).toBeUndefined()
      expect(settings.language).toBe('en')
    })

    it('should clear all settings', async () => {
      await repository.setSettings({ theme: 'dark', language: 'en' })
      await repository.clearSettings()

      const settings = await repository.getSettings()
      expect(Object.keys(settings)).toHaveLength(0)
    })
  })

  describe('UI State Persistence', () => {
    it('should manage UI component state', async () => {
      const testState = { width: 300, collapsed: false }

      await repository.setUIState('sidebar', 'layout', testState)
      const retrievedState = await repository.getUIState('sidebar', 'layout')

      expect(retrievedState).toEqual(testState)
    })

    it('should manage entire component state', async () => {
      const componentState = { width: 300, height: 500, collapsed: false }

      await repository.setComponentState('editor', componentState)
      const retrievedState = await repository.getComponentState('editor')

      expect(retrievedState).toEqual(componentState)
    })

    it('should remove component state', async () => {
      await repository.setComponentState('editor', { width: 300 })
      await repository.removeComponentState('editor')

      const state = await repository.getComponentState('editor')
      expect(state).toBeNull()
    })
  })

  describe('Plugin Storage', () => {
    it('should manage plugin data securely', async () => {
      const pluginData = { config: { enabled: true }, state: { count: 5 } }

      await repository.setPluginData('test-plugin', 'config', pluginData)
      const retrievedData = await repository.getPluginData(
        'test-plugin',
        'config'
      )

      expect(retrievedData).toEqual(pluginData)
    })

    it('should validate plugin IDs', async () => {
      await expect(repository.setPluginData('', 'config', {})).rejects.toThrow(
        'Invalid plugin ID'
      )
    })

    it('should remove plugin data', async () => {
      await repository.setPluginData('test-plugin', 'config', { enabled: true })
      await repository.removePluginData('test-plugin', 'config')

      const data = await repository.getPluginData('test-plugin', 'config')
      expect(data).toBeNull()
    })

    it('should clear all plugin data', async () => {
      await repository.setPluginData('test-plugin', 'config', { enabled: true })
      await repository.clearPluginData('test-plugin')

      const data = await repository.getPluginData('test-plugin', 'config')
      expect(data).toBeNull()
    })

    it('should provide plugin quota information', async () => {
      const quota = await repository.getPluginQuota('test-plugin')

      expect(quota).toBeDefined()
      expect(quota.pluginId).toBe('test-plugin')
      expect(quota.limit).toBeGreaterThan(0)
    })
  })

  describe('Content & Media Storage', () => {
    it('should manage content data', async () => {
      const imageData = {
        src: 'data:image/png;base64,...',
        metadata: { size: 1024 },
      }

      await repository.setContentData('images', 'avatar', imageData)
      const retrievedData = await repository.getContentData('images', 'avatar')

      expect(retrievedData).toEqual(imageData)
    })

    it('should remove content data', async () => {
      await repository.setContentData('attachments', 'doc1', {
        filename: 'test.pdf',
      })
      await repository.removeContentData('attachments', 'doc1')

      const data = await repository.getContentData('attachments', 'doc1')
      expect(data).toBeNull()
    })

    it('should provide storage usage information', async () => {
      const usage = await repository.getContentStorageUsage()

      expect(usage.used).toBeDefined()
      expect(usage.limit).toBeGreaterThan(0)
    })
  })

  describe('Analytics & Tracking Storage', () => {
    it('should manage analytics data with privacy filtering', async () => {
      const analyticsData = { pageViews: 10, userAgent: 'test-browser' }

      await repository.setAnalyticsData('usage', analyticsData)
      const retrievedData = await repository.getAnalyticsData('usage')

      expect(retrievedData).toEqual(analyticsData)
    })

    it('should remove analytics data', async () => {
      await repository.setAnalyticsData('tracking', { events: 5 })
      await repository.removeAnalyticsData('tracking')

      const data = await repository.getAnalyticsData('tracking')
      expect(data).toBeNull()
    })

    it('should clear all analytics data', async () => {
      await repository.setAnalyticsData('usage', { sessions: 1 })
      await repository.clearAnalyticsData()

      const data = await repository.getAnalyticsData('usage')
      expect(data).toBeNull()
    })
  })

  describe('Error & Debug Storage', () => {
    it('should manage error data', async () => {
      const errorData = {
        message: 'Test error',
        stack: 'Error stack',
        timestamp: Date.now(),
      }

      await repository.setErrorData('crashes', errorData)
      const retrievedData = await repository.getErrorData('crashes')

      expect(retrievedData).toEqual(errorData)
    })

    it('should remove error data', async () => {
      await repository.setErrorData('debug', { logs: ['log1', 'log2'] })
      await repository.removeErrorData('debug')

      const data = await repository.getErrorData('debug')
      expect(data).toBeNull()
    })
  })

  describe('Cache Management', () => {
    it('should preload data into cache', async () => {
      await repository.setSettings({ theme: 'dark' })
      await repository.preload(['settings:app'])

      const stats = await repository.getCacheStats()
      expect(stats.size).toBeGreaterThan(0)
    })

    it('should invalidate cache by pattern', async () => {
      await repository.setSettings({ theme: 'dark' })
      await repository.preload(['settings:app'])

      await repository.invalidateCache('settings')
      const stats = await repository.getCacheStats()
      expect(stats.size).toBe(0)
    })

    it('should clear all cache', async () => {
      await repository.setSettings({ theme: 'dark' })
      await repository.preload(['settings:app'])

      await repository.clearCache()
      const stats = await repository.getCacheStats()
      expect(stats.size).toBe(0)
    })

    it('should provide cache statistics', async () => {
      const stats = await repository.getCacheStats()

      expect(stats).toBeDefined()
      expect(stats.size).toBeDefined()
      expect(stats.maxSize).toBeDefined()
      expect(stats.hitRate).toBeDefined()
      expect(stats.memoryUsage).toBeDefined()
    })
  })

  describe('localStorage Migration', () => {
    it('should migrate data from localStorage', async () => {
      // Setup localStorage with test data
      localStorage.setItem('viny-settings', JSON.stringify({ theme: 'dark' }))
      localStorage.setItem('sidebar-width', '300')
      localStorage.setItem(
        'viny_tag_colors',
        JSON.stringify({ important: '#ff0000' })
      )

      const result = await repository.migrateFromLocalStorage()

      expect(result.success).toBe(true)
      expect(result.migratedKeys).toContain('viny-settings')
      expect(result.migratedKeys).toContain('sidebar-width')
      expect(result.migratedKeys).toContain('viny_tag_colors')
      expect(result.migratedItems).toBeGreaterThan(0)
    })

    it('should handle migration errors gracefully', async () => {
      // Setup invalid JSON in localStorage
      localStorage.setItem('invalid-json', 'invalid json data')

      const result = await repository.migrateFromLocalStorage({
        'invalid-json': 'settings:invalid',
      })

      expect(result.success).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].key).toBe('invalid-json')
    })

    it('should export data back to localStorage', async () => {
      await repository.setSettings({ theme: 'light' })

      const result = await repository.exportToLocalStorage(['settings:app'])

      expect(result.success).toBe(true)
      expect(result.exportedKeys).toContain('settings:app')
      expect(localStorage.getItem('settings:app')).toBeTruthy()
    })
  })

  describe('Backup and Restore', () => {
    it('should create backup of all data', async () => {
      await repository.setSettings({ theme: 'dark' })

      const backup = await repository.createBackup()

      expect(backup.version).toBe('1.0')
      expect(backup.timestamp).toBeDefined()
      expect(backup.data).toBeDefined()
      expect(backup.metadata).toBeDefined()
    })

    it('should validate backup integrity', async () => {
      const validBackup = {
        version: '1.0',
        timestamp: Date.now(),
        data: { notes: [], notebooks: [], settings: {} },
        metadata: { totalItems: 0, size: 0 },
      }

      const result = await repository.validateBackup(validBackup)
      expect(result.isValid).toBe(true)
    })

    it('should restore data from backup', async () => {
      const backup = {
        version: '1.0',
        timestamp: Date.now(),
        data: {
          notes: [],
          notebooks: [],
          settings: { theme: 'restored' },
        },
        metadata: { totalItems: 0, size: 0 },
      }

      const result = await repository.restoreBackup(backup)

      expect(result.success).toBe(true)
      expect(result.restoredItems).toBeGreaterThan(0)

      const settings = await repository.getSettings()
      expect(settings.theme).toBe('restored')
    })
  })

  describe('Event System', () => {
    it('should subscribe to repository events', async () => {
      const eventHandler = vi.fn()
      const unsubscribe = repository.subscribe(eventHandler)

      await repository.setSettings({ theme: 'dark' })

      expect(eventHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'settings:updated',
          data: expect.objectContaining({ theme: 'dark' }),
          timestamp: expect.any(Number),
        })
      )

      unsubscribe()
    })

    it('should unsubscribe from events', async () => {
      const eventHandler = vi.fn()
      const unsubscribe = repository.subscribe(eventHandler)

      unsubscribe()
      await repository.setSettings({ theme: 'dark' })

      expect(eventHandler).not.toHaveBeenCalled()
    })
  })

  describe('Storage Usage Statistics', () => {
    it('should provide storage usage statistics', async () => {
      const usage = await repository.getStorageUsage()

      expect(usage).toBeDefined()
      expect(usage.totalUsed).toBeDefined()
      expect(usage.totalAvailable).toBeDefined()
      expect(usage.usageByCategory).toBeDefined()
      expect(usage.itemCounts).toBeDefined()
      expect(usage.lastCleanup).toBeDefined()
    })
  })

  describe('Transaction Support', () => {
    it('should execute operations in transaction', async () => {
      const result = await repository.transaction(async repo => {
        await repo.setSettings({ theme: 'dark' })
        await repo.setUIState('sidebar', 'width', 300)
        return 'transaction-completed'
      })

      expect(result).toBe('transaction-completed')

      const settings = await repository.getSettings()
      expect(settings.theme).toBe('dark')

      const width = await repository.getUIState('sidebar', 'width')
      expect(width).toBe(300)
    })

    it('should handle transaction errors', async () => {
      await expect(
        repository.transaction(async repo => {
          await repo.setSettings({ theme: 'dark' })
          throw new Error('Transaction error')
        })
      ).rejects.toThrow('Transaction error')
    })
  })
})
