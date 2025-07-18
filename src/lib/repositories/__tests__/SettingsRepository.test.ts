/**
 * Comprehensive tests for SettingsRepository
 * Tests core settings operations, error handling, and localStorage integration
 */

import { vi, describe, it, expect, beforeEach } from 'vitest'
import { SettingsRepository } from '../SettingsRepository'
import { defaultAppSettings } from '../../../types/settings'
import { RepositoryErrorCode } from '../types/RepositoryTypes'
import { 
  StorageNotAvailableError,
  ValidationError,
  RepositoryErrorFactory 
} from '../errors/RepositoryErrorHandler'

// Mock window.electronAPI
const mockElectronAPI = {
  storage: {
    loadSettings: vi.fn(),
    saveSettings: vi.fn()
  }
}

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('SettingsRepository', () => {
  let repository: SettingsRepository

  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
    repository = new SettingsRepository()
  })

  describe('Initialization', () => {
    it('should detect localStorage environment correctly', async () => {
      const settings = await repository.getSettings()
      expect(settings).toEqual(defaultAppSettings)
    })

    it('should handle missing localStorage gracefully', async () => {
      // Simulate localStorage unavailable
      const originalLocalStorage = window.localStorage
      Object.defineProperty(window, 'localStorage', {
        value: undefined,
        configurable: true
      })

      repository = new SettingsRepository()
      await expect(repository.getSettings()).rejects.toThrow('No storage available')

      // Restore localStorage
      Object.defineProperty(window, 'localStorage', {
        value: originalLocalStorage,
        configurable: true
      })
    })
  })

  describe('Settings Operations', () => {
    it('should save and retrieve settings correctly', async () => {
      const testSettings = { theme: 'dark', fontSize: 16 }
      
      await repository.saveSettings(testSettings)
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'viny-settings',
        expect.stringContaining('"theme":"dark"')
      )
    })

    it('should merge partial updates with existing settings', async () => {
      // Mock existing settings
      localStorageMock.getItem.mockReturnValue(
        JSON.stringify({ theme: 'light', fontSize: 14, wordWrap: true })
      )
      
      await repository.saveSettings({ theme: 'dark' })
      
      const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1])
      expect(savedData.theme).toBe('dark')
      expect(savedData.fontSize).toBe(14) // Preserved from existing
      expect(savedData.wordWrap).toBe(true) // Preserved from existing
    })

    it('should reset settings to defaults', async () => {
      await repository.resetSettings()
      
      const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1])
      expect(savedData).toEqual(defaultAppSettings)
    })

    it('should handle single setting operations', async () => {
      await repository.setSetting('theme', 'solarized')
      
      const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1])
      expect(savedData.theme).toBe('solarized')
    })
  })

  describe('Tag Color Management', () => {
    it('should save and retrieve tag colors', async () => {
      const tagColors = { work: 'blue', personal: 'green' }
      
      await repository.saveTagColors(tagColors)
      
      const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1])
      expect(savedData.tagColors).toEqual(tagColors)
    })

    it('should get empty tag colors when none exist', async () => {
      const tagColors = await repository.getTagColors()
      expect(tagColors).toEqual({})
    })
  })

  describe('Import/Export', () => {
    it('should export settings as JSON', async () => {
      localStorageMock.getItem.mockReturnValue(
        JSON.stringify({ theme: 'dark', fontSize: 16 })
      )
      
      const exported = await repository.export()
      const parsed = JSON.parse(exported)
      
      expect(parsed.theme).toBe('dark')
      expect(parsed.fontSize).toBe(16)
    })

    it('should import valid settings', async () => {
      const importData = JSON.stringify({ theme: 'light', fontSize: 18 })
      
      await repository.import(importData)
      
      const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1])
      expect(savedData.theme).toBe('light')
      expect(savedData.fontSize).toBe(18)
    })

    it('should reject invalid import data', async () => {
      await expect(repository.import('invalid json')).rejects.toThrow('Storage operation')
    })

    it('should filter out invalid keys during import', async () => {
      const importData = JSON.stringify({ 
        theme: 'dark',
        invalidKey: 'should be ignored',
        fontSize: 16 
      })
      
      await repository.import(importData)
      
      const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1])
      expect(savedData.theme).toBe('dark')
      expect(savedData.fontSize).toBe(16)
      expect(savedData.invalidKey).toBeUndefined()
    })
  })

  describe('Error Handling', () => {
    it('should handle localStorage errors gracefully', async () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded')
      })
      
      await expect(repository.saveSettings({ theme: 'dark' })).rejects.toThrow('Storage operation')
    })

    it('should handle JSON parse errors', async () => {
      localStorageMock.getItem.mockReturnValue('invalid json')
      
      const settings = await repository.getSettings()
      expect(settings).toEqual(defaultAppSettings)
    })
  })

  describe('Watch Functionality', () => {
    it('should notify listeners of changes', async () => {
      const listener = jest.fn()
      const unsubscribe = repository.watch('theme', listener)
      
      await repository.setSetting('theme', 'dark')
      
      expect(listener).toHaveBeenCalledWith('dark')
      
      unsubscribe()
    })

    it('should allow unsubscribing from changes', async () => {
      const listener = jest.fn()
      const unsubscribe = repository.watch('theme', listener)
      
      unsubscribe()
      await repository.setSetting('theme', 'dark')
      
      expect(listener).not.toHaveBeenCalled()
    })
  })

  describe('Error Handling with Enhanced System', () => {
    it('should use enhanced error handling for all operations', async () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('Storage unavailable')
      })
      
      await expect(repository.getSettings()).rejects.toThrow()
    })

    it('should handle quota exceeded with proper error type', async () => {
      const quotaError = new Error('QuotaExceededError')
      quotaError.name = 'QuotaExceededError'
      localStorageMock.setItem.mockImplementation(() => {
        throw quotaError
      })
      
      await expect(repository.saveSettings({ theme: 'dark' })).rejects.toThrow()
    })

    it('should retry on transient failures', async () => {
      localStorageMock.getItem
        .mockImplementationOnce(() => {
          throw new Error('Network error')
        })
        .mockReturnValueOnce(JSON.stringify(defaultAppSettings))
      
      const settings = await repository.getSettings()
      
      expect(settings).toEqual(defaultAppSettings)
      expect(localStorageMock.getItem).toHaveBeenCalledTimes(2)
    })

    it('should validate settings before saving', async () => {
      const invalidSettings = { 
        theme: 'invalid-theme' as any,
        fontSize: -10 // Invalid font size
      }
      
      await expect(repository.saveSettings(invalidSettings)).rejects.toThrow()
    })

    it('should handle concurrent setting updates', async () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify(defaultAppSettings))
      
      // Simulate concurrent updates
      const promises = [
        repository.setSetting('theme', 'dark'),
        repository.setSetting('fontSize', 16),
        repository.setSetting('language', 'es')
      ]
      
      await Promise.all(promises)
      
      // All updates should complete without errors
      expect(localStorageMock.setItem).toHaveBeenCalledTimes(3)
    })
  })

  describe('Performance and Caching', () => {
    it('should cache settings for repeated access', async () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify(defaultAppSettings))
      
      // Multiple calls should use cache
      await repository.getSettings()
      await repository.getSettings()
      
      // Should only call localStorage once due to caching
      expect(localStorageMock.getItem).toHaveBeenCalledTimes(1)
    })

    it('should invalidate cache on setting changes', async () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify(defaultAppSettings))
      
      await repository.getSettings()
      await repository.setSetting('theme', 'dark')
      await repository.getSettings()
      
      // Should call localStorage again after setting change
      expect(localStorageMock.getItem).toHaveBeenCalledTimes(2)
    })
  })

  describe('Migration Support', () => {
    it('should handle settings migration from old format', async () => {
      const oldFormatSettings = {
        theme: 'dark',
        editor: { fontSize: 16, wordWrap: true },
        ui: { sidebarWidth: 300 }
      }
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(oldFormatSettings))
      
      const settings = await repository.getSettings()
      
      // Should migrate to new flat format
      expect(settings.theme).toBe('dark')
      expect(settings.fontSize).toBe(16)
      expect(settings.wordWrap).toBe(true)
    })

    it('should handle version compatibility', async () => {
      const futureVersionSettings = {
        version: '2.0',
        theme: 'dark',
        newFeature: 'unsupported'
      }
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(futureVersionSettings))
      
      const settings = await repository.getSettings()
      
      // Should fallback to defaults for unsupported version
      expect(settings).toEqual(defaultAppSettings)
    })
  })
})