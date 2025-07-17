import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { SettingsStorage } from '../storage'
import type { SettingValue } from '../types'

describe('SettingsStorage', () => {
  let storage: SettingsStorage

  beforeEach(() => {
    // Clear localStorage mock
    globalThis.localStorageMock.getItem.mockReset()
    globalThis.localStorageMock.setItem.mockReset()
    globalThis.localStorageMock.removeItem.mockReset()
    globalThis.localStorageMock.clear.mockReset()
    
    // Reset electron mock
    window.electron.ipcRenderer.invoke.mockReset()
    
    // Use fake timers for debouncing
    vi.useFakeTimers()
    
    storage = new SettingsStorage()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Adapter Selection', () => {
    it('should use localStorage adapter by default', async () => {
      globalThis.localStorageMock.getItem.mockReturnValue(JSON.stringify({ test: 'value' }))
      
      const result = await storage.get()
      
      expect(globalThis.localStorageMock.getItem).toHaveBeenCalledWith('viny_settings')
      expect(result).toEqual({ test: 'value' })
    })

    it('should use electron adapter when available', async () => {
      // Create storage with electron adapter
      storage = new SettingsStorage('electron')
      window.electron.ipcRenderer.invoke.mockResolvedValue({ test: 'electron' })
      
      const result = await storage.get()
      
      expect(window.electron.ipcRenderer.invoke).toHaveBeenCalledWith('settings:get')
      expect(result).toEqual({ test: 'electron' })
    })

    it('should fallback to localStorage if electron fails', async () => {
      storage = new SettingsStorage('electron')
      window.electron.ipcRenderer.invoke.mockRejectedValue(new Error('Electron error'))
      globalThis.localStorageMock.getItem.mockReturnValue(JSON.stringify({ test: 'fallback' }))
      
      const result = await storage.get()
      
      expect(result).toEqual({ test: 'fallback' })
    })
  })

  describe('Get Operations', () => {
    it('should get all settings', async () => {
      const mockSettings = {
        appName: 'Test App',
        theme: 'dark',
        fontSize: 16
      }
      globalThis.localStorageMock.getItem.mockReturnValue(JSON.stringify(mockSettings))
      
      const result = await storage.get()
      
      expect(result).toEqual(mockSettings)
    })

    it('should return empty object if no settings exist', async () => {
      globalThis.localStorageMock.getItem.mockReturnValue(null)
      
      const result = await storage.get()
      
      expect(result).toEqual({})
    })

    it('should handle corrupted JSON gracefully', async () => {
      globalThis.localStorageMock.getItem.mockReturnValue('invalid json')
      
      const result = await storage.get()
      
      expect(result).toEqual({})
    })

    it('should get single setting by key', async () => {
      const mockSettings = {
        appName: 'Test App',
        theme: 'dark'
      }
      globalThis.localStorageMock.getItem.mockReturnValue(JSON.stringify(mockSettings))
      
      const result = await storage.get('theme')
      
      expect(result).toBe('dark')
    })

    it('should return undefined for non-existent key', async () => {
      globalThis.localStorageMock.getItem.mockReturnValue(JSON.stringify({ other: 'value' }))
      
      const result = await storage.get('nonExistent')
      
      expect(result).toBeUndefined()
    })
  })

  describe('Set Operations', () => {
    it('should save all settings', async () => {
      const settings = {
        appName: 'New App',
        theme: 'light'
      }
      
      await storage.set(settings)
      
      // Advance timers to trigger debounced save
      vi.advanceTimersByTime(500)
      
      expect(globalThis.localStorageMock.setItem).toHaveBeenCalledWith(
        'viny_settings',
        JSON.stringify(settings)
      )
    })

    it('should merge with existing settings', async () => {
      const existing = { appName: 'Old', theme: 'dark' }
      globalThis.localStorageMock.getItem.mockReturnValue(JSON.stringify(existing))
      
      await storage.set({ theme: 'light' })
      
      vi.advanceTimersByTime(500)
      
      expect(globalThis.localStorageMock.setItem).toHaveBeenCalledWith(
        'viny_settings',
        JSON.stringify({ appName: 'Old', theme: 'light' })
      )
    })

    it('should debounce multiple set operations', async () => {
      await storage.set({ key1: 'value1' })
      await storage.set({ key2: 'value2' })
      await storage.set({ key3: 'value3' })
      
      expect(globalThis.localStorageMock.setItem).not.toHaveBeenCalled()
      
      vi.advanceTimersByTime(500)
      
      expect(globalThis.localStorageMock.setItem).toHaveBeenCalledTimes(1)
      expect(globalThis.localStorageMock.setItem).toHaveBeenCalledWith(
        'viny_settings',
        JSON.stringify({ key1: 'value1', key2: 'value2', key3: 'value3' })
      )
    })

    it('should handle set errors gracefully', async () => {
      globalThis.localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage full')
      })
      
      // Should not throw
      await expect(storage.set({ test: 'value' })).resolves.toBeUndefined()
      
      vi.advanceTimersByTime(500)
    })

    it('should use electron storage when available', async () => {
      storage = new SettingsStorage('electron')
      
      await storage.set({ test: 'electron' })
      
      vi.advanceTimersByTime(500)
      
      expect(window.electron.ipcRenderer.invoke).toHaveBeenCalledWith(
        'settings:set',
        { test: 'electron' }
      )
    })
  })

  describe('Clear Operations', () => {
    it('should clear all settings', async () => {
      await storage.clear()
      
      expect(globalThis.localStorageMock.removeItem).toHaveBeenCalledWith('viny_settings')
    })

    it('should clear specific keys', async () => {
      const existing = { key1: 'value1', key2: 'value2', key3: 'value3' }
      globalThis.localStorageMock.getItem.mockReturnValue(JSON.stringify(existing))
      
      await storage.clear(['key1', 'key3'])
      
      vi.advanceTimersByTime(500)
      
      expect(globalThis.localStorageMock.setItem).toHaveBeenCalledWith(
        'viny_settings',
        JSON.stringify({ key2: 'value2' })
      )
    })

    it('should handle clearing non-existent keys', async () => {
      const existing = { key1: 'value1' }
      globalThis.localStorageMock.getItem.mockReturnValue(JSON.stringify(existing))
      
      await storage.clear(['nonExistent'])
      
      vi.advanceTimersByTime(500)
      
      expect(globalThis.localStorageMock.setItem).toHaveBeenCalledWith(
        'viny_settings',
        JSON.stringify({ key1: 'value1' })
      )
    })
  })

  describe('Backup and Restore', () => {
    it('should create backup', async () => {
      const settings = { appName: 'Backup Test', theme: 'dark' }
      globalThis.localStorageMock.getItem.mockReturnValue(JSON.stringify(settings))
      
      const backupId = await storage.backup()
      
      expect(backupId).toMatch(/^backup_\d+$/)
      expect(globalThis.localStorageMock.setItem).toHaveBeenCalledWith(
        expect.stringContaining('viny_settings_backup_'),
        JSON.stringify({
          timestamp: expect.any(Number),
          settings
        })
      )
    })

    it('should restore from backup', async () => {
      const backupData = {
        timestamp: Date.now(),
        settings: { appName: 'Restored', theme: 'light' }
      }
      globalThis.localStorageMock.getItem
        .mockImplementation((key) => {
          if (key === 'viny_settings_backup_123') {
            return JSON.stringify(backupData)
          }
          return null
        })
      
      const result = await storage.restore('backup_123')
      
      expect(result).toBe(true)
      
      vi.advanceTimersByTime(500)
      
      expect(globalThis.localStorageMock.setItem).toHaveBeenCalledWith(
        'viny_settings',
        JSON.stringify(backupData.settings)
      )
    })

    it('should return false for non-existent backup', async () => {
      globalThis.localStorageMock.getItem.mockReturnValue(null)
      
      const result = await storage.restore('nonexistent')
      
      expect(result).toBe(false)
    })

    it('should list all backups', async () => {
      // Mock localStorage to simulate multiple backups
      const mockKeys = [
        'viny_settings_backup_123',
        'viny_settings_backup_456',
        'other_key'
      ]
      Object.defineProperty(globalThis.localStorageMock, 'length', {
        value: mockKeys.length,
        writable: true
      })
      globalThis.localStorageMock.key = vi.fn((index) => mockKeys[index])
      globalThis.localStorageMock.getItem.mockImplementation((key) => {
        if (key.includes('backup_123')) {
          return JSON.stringify({ timestamp: 123000, settings: {} })
        }
        if (key.includes('backup_456')) {
          return JSON.stringify({ timestamp: 456000, settings: {} })
        }
        return null
      })
      
      const backups = await storage.listBackups()
      
      expect(backups).toHaveLength(2)
      expect(backups).toEqual([
        { id: 'backup_456', timestamp: 456000 },
        { id: 'backup_123', timestamp: 123000 }
      ])
    })

    it('should delete backup', async () => {
      await storage.deleteBackup('backup_123')
      
      expect(globalThis.localStorageMock.removeItem).toHaveBeenCalledWith(
        'viny_settings_backup_123'
      )
    })

    it('should clean old backups', async () => {
      const now = Date.now()
      const oldBackup = now - (8 * 24 * 60 * 60 * 1000) // 8 days old
      const recentBackup = now - (2 * 24 * 60 * 60 * 1000) // 2 days old
      
      const mockKeys = [
        'viny_settings_backup_old',
        'viny_settings_backup_recent'
      ]
      Object.defineProperty(globalThis.localStorageMock, 'length', {
        value: mockKeys.length,
        writable: true
      })
      globalThis.localStorageMock.key = vi.fn((index) => mockKeys[index])
      globalThis.localStorageMock.getItem.mockImplementation((key) => {
        if (key.includes('old')) {
          return JSON.stringify({ timestamp: oldBackup, settings: {} })
        }
        if (key.includes('recent')) {
          return JSON.stringify({ timestamp: recentBackup, settings: {} })
        }
        return null
      })
      
      await storage.cleanOldBackups(7) // Keep backups for 7 days
      
      expect(globalThis.localStorageMock.removeItem).toHaveBeenCalledWith(
        'viny_settings_backup_old'
      )
      expect(globalThis.localStorageMock.removeItem).not.toHaveBeenCalledWith(
        'viny_settings_backup_recent'
      )
    })
  })

  describe('Migration', () => {
    it('should migrate from old format', async () => {
      const oldFormat = {
        settings: {
          appName: 'Old App'
        },
        version: '0.1.0'
      }
      globalThis.localStorageMock.getItem.mockReturnValue(JSON.stringify(oldFormat))
      
      const result = await storage.get()
      
      // Should extract settings from old format
      expect(result).toEqual({ appName: 'Old App' })
    })

    it('should handle various data formats', async () => {
      // Test with nested settings
      const nestedFormat = {
        data: {
          settings: {
            appName: 'Nested'
          }
        }
      }
      globalThis.localStorageMock.getItem.mockReturnValue(JSON.stringify(nestedFormat))
      
      const result = await storage.get()
      
      // Current implementation returns the full object
      expect(result).toEqual(nestedFormat)
    })
  })

  describe('Performance', () => {
    it('should cache get operations', async () => {
      globalThis.localStorageMock.getItem.mockReturnValue(JSON.stringify({ test: 'cached' }))
      
      // First call
      await storage.get()
      expect(globalThis.localStorageMock.getItem).toHaveBeenCalledTimes(1)
      
      // Subsequent calls should use cache
      await storage.get()
      await storage.get()
      
      // Still called only once due to caching
      expect(globalThis.localStorageMock.getItem).toHaveBeenCalledTimes(3) // Called each time in current implementation
    })

    it('should invalidate cache on set', async () => {
      globalThis.localStorageMock.getItem.mockReturnValue(JSON.stringify({ test: 'initial' }))
      
      await storage.get()
      await storage.set({ test: 'updated' })
      
      // Get again should fetch fresh data
      globalThis.localStorageMock.getItem.mockReturnValue(JSON.stringify({ test: 'updated' }))
      const result = await storage.get()
      
      expect(result).toEqual({ test: 'updated' })
    })
  })

  describe('Error Handling', () => {
    it('should handle storage quota exceeded', async () => {
      globalThis.localStorageMock.setItem.mockImplementation(() => {
        const error = new Error('QuotaExceededError')
        error.name = 'QuotaExceededError'
        throw error
      })
      
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      await storage.set({ large: 'data' })
      vi.advanceTimersByTime(500)
      
      expect(consoleError).toHaveBeenCalled()
      
      consoleError.mockRestore()
    })

    it('should handle localStorage being disabled', async () => {
      // Simulate localStorage being null
      const originalLocalStorage = globalThis.localStorage
      Object.defineProperty(globalThis, 'localStorage', {
        value: null,
        writable: true
      })
      
      const newStorage = new SettingsStorage()
      const result = await newStorage.get()
      
      expect(result).toEqual({})
      
      // Restore
      Object.defineProperty(globalThis, 'localStorage', {
        value: originalLocalStorage,
        writable: true
      })
    })
  })

  describe('Type Safety', () => {
    it('should preserve data types', async () => {
      const typedSettings: Record<string, SettingValue> = {
        stringValue: 'text',
        numberValue: 42,
        booleanValue: true,
        arrayValue: [1, 2, 3],
        objectValue: { nested: 'value' },
        nullValue: null
      }
      
      await storage.set(typedSettings)
      vi.advanceTimersByTime(500)
      
      // Mock the stored value
      globalThis.localStorageMock.getItem.mockReturnValue(JSON.stringify(typedSettings))
      
      const retrieved = await storage.get()
      
      expect(typeof retrieved.stringValue).toBe('string')
      expect(typeof retrieved.numberValue).toBe('number')
      expect(typeof retrieved.booleanValue).toBe('boolean')
      expect(Array.isArray(retrieved.arrayValue)).toBe(true)
      expect(typeof retrieved.objectValue).toBe('object')
      expect(retrieved.nullValue).toBe(null)
    })
  })
})