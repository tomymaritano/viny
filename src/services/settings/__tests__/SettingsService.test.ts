import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { SettingsService } from '../SettingsService'
import { SettingsRegistry } from '../registry'
import { SettingsValidator } from '../validator'
import { SettingsStorage } from '../storage'
import { generalSchema } from '../schemas/general'
import { themesSchema } from '../schemas/themes'
import type { SettingValue } from '../types'

// Mock dependencies
vi.mock('../registry')
vi.mock('../validator')
vi.mock('../storage')

describe('SettingsService', () => {
  let service: SettingsService
  let mockRegistry: vi.Mocked<SettingsRegistry>
  let mockValidator: vi.Mocked<SettingsValidator>
  let mockStorage: vi.Mocked<SettingsStorage>

  beforeEach(() => {
    // Clear the singleton instance
    (SettingsService as any).instance = null

    // Setup mocks
    mockRegistry = new SettingsRegistry() as any
    mockValidator = new SettingsValidator(mockRegistry) as any
    mockStorage = new SettingsStorage() as any

    // Mock registry methods
    mockRegistry.getCategories = vi.fn().mockReturnValue([
      { id: 'general', label: 'General', schemas: generalSchema },
      { id: 'themes', label: 'Themes', schemas: themesSchema }
    ])
    mockRegistry.getCategory = vi.fn().mockImplementation((id) => 
      mockRegistry.getCategories().find(c => c.id === id)
    )
    mockRegistry.getSchema = vi.fn().mockImplementation((key) => {
      const allSchemas = [...generalSchema, ...themesSchema]
      return allSchemas.find(s => s.key === key)
    })
    mockRegistry.getAllSchemas = vi.fn().mockReturnValue([...generalSchema, ...themesSchema])

    // Mock validator methods
    mockValidator.validate = vi.fn().mockImplementation((key, value) => ({ 
      isValid: true, 
      value 
    }))
    mockValidator.validateAll = vi.fn().mockImplementation((settings) => ({
      isValid: true,
      errors: {}
    }))

    // Mock storage methods
    mockStorage.get = vi.fn().mockResolvedValue({})
    mockStorage.set = vi.fn().mockResolvedValue(undefined)
    mockStorage.clear = vi.fn().mockResolvedValue(undefined)
    mockStorage.backup = vi.fn().mockResolvedValue('backup-id')
    mockStorage.restore = vi.fn().mockResolvedValue(true)

    // Get service instance
    service = SettingsService.getInstance()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = SettingsService.getInstance()
      const instance2 = SettingsService.getInstance()
      expect(instance1).toBe(instance2)
    })
  })

  describe('Initialization', () => {
    it('should load settings from storage on init', async () => {
      const mockSettings = {
        appName: 'Test App',
        theme: 'dark'
      }
      mockStorage.get.mockResolvedValue(mockSettings)

      await service.init()

      expect(mockStorage.get).toHaveBeenCalled()
      expect(service.get('appName')).toBe('Test App')
      expect(service.get('theme')).toBe('dark')
    })

    it('should use default values if storage is empty', async () => {
      mockStorage.get.mockResolvedValue({})

      await service.init()

      // Should use defaults from schema
      expect(service.get('appName')).toBe('Viny')
      expect(service.get('theme')).toBe('system')
    })

    it('should emit initialized event after init', async () => {
      const listener = vi.fn()
      service.on('initialized', listener)

      await service.init()

      expect(listener).toHaveBeenCalled()
    })
  })

  describe('Get/Set Operations', () => {
    beforeEach(async () => {
      await service.init()
    })

    it('should get a setting value', () => {
      service.set('appName', 'My App')
      expect(service.get('appName')).toBe('My App')
    })

    it('should return default value if setting not found', () => {
      expect(service.get('nonExistent', 'default')).toBe('default')
    })

    it('should set a valid setting', () => {
      const result = service.set('appName', 'New Name')
      
      expect(result).toBe(true)
      expect(service.get('appName')).toBe('New Name')
      expect(mockValidator.validate).toHaveBeenCalledWith('appName', 'New Name')
    })

    it('should reject invalid setting', () => {
      mockValidator.validate.mockReturnValue({
        isValid: false,
        error: 'Invalid value'
      })

      const result = service.set('appName', 123)
      
      expect(result).toBe(false)
      expect(service.get('appName')).not.toBe(123)
    })

    it('should emit change event on successful set', () => {
      const listener = vi.fn()
      service.on('change', listener)

      service.set('appName', 'New Name')

      expect(listener).toHaveBeenCalledWith({
        key: 'appName',
        value: 'New Name',
        previousValue: 'Viny'
      })
    })

    it('should not emit change event if value unchanged', () => {
      const listener = vi.fn()
      service.set('appName', 'Test')
      service.on('change', listener)

      service.set('appName', 'Test')

      expect(listener).not.toHaveBeenCalled()
    })

    it('should handle dependencies between settings', () => {
      // Mock a schema with dependencies
      const mockSchema = {
        key: 'autoSaveInterval',
        type: 'number' as const,
        defaultValue: 60,
        dependencies: {
          autoSave: true
        }
      }
      mockRegistry.getSchema.mockReturnValue(mockSchema)

      // Set dependency to false
      service.set('autoSave', false)
      
      // Try to set dependent setting
      const result = service.set('autoSaveInterval', 30)
      
      expect(result).toBe(false)
    })
  })

  describe('Preview Functionality', () => {
    beforeEach(async () => {
      await service.init()
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should preview a setting without saving', () => {
      const originalValue = service.get('theme')
      
      service.preview('theme', 'dark')
      
      expect(service.getPreview('theme')).toBe('dark')
      expect(service.get('theme')).toBe(originalValue) // Original unchanged
    })

    it('should emit preview event', () => {
      const listener = vi.fn()
      service.on('preview', listener)

      service.preview('theme', 'dark')

      expect(listener).toHaveBeenCalledWith({
        key: 'theme',
        value: 'dark'
      })
    })

    it('should clear preview after timeout', () => {
      service.preview('theme', 'dark')
      
      expect(service.getPreview('theme')).toBe('dark')
      
      vi.advanceTimersByTime(6000) // Default 5s + buffer
      
      expect(service.getPreview('theme')).toBeUndefined()
    })

    it('should commit preview', () => {
      service.preview('theme', 'dark')
      service.commitPreview('theme')
      
      expect(service.get('theme')).toBe('dark')
      expect(service.getPreview('theme')).toBeUndefined()
    })

    it('should clear preview', () => {
      service.preview('theme', 'dark')
      service.clearPreview('theme')
      
      expect(service.getPreview('theme')).toBeUndefined()
    })

    it('should clear all previews', () => {
      service.preview('theme', 'dark')
      service.preview('appName', 'Preview Name')
      
      service.clearAllPreviews()
      
      expect(service.getPreview('theme')).toBeUndefined()
      expect(service.getPreview('appName')).toBeUndefined()
    })
  })

  describe('Batch Operations', () => {
    beforeEach(async () => {
      await service.init()
    })

    it('should get all settings', () => {
      service.set('appName', 'Test App')
      service.set('theme', 'dark')
      
      const all = service.getAll()
      
      expect(all).toMatchObject({
        appName: 'Test App',
        theme: 'dark'
      })
    })

    it('should get settings by category', () => {
      const generalSettings = service.getByCategory('general')
      
      expect(generalSettings).toHaveProperty('appName')
      expect(generalSettings).toHaveProperty('language')
      expect(generalSettings).not.toHaveProperty('theme') // themes category
    })

    it('should batch update settings', () => {
      const updates = {
        appName: 'Batch App',
        theme: 'light',
        language: 'es'
      }
      
      const results = service.batchSet(updates)
      
      expect(results.appName).toBe(true)
      expect(results.theme).toBe(true)
      expect(results.language).toBe(true)
      
      expect(service.get('appName')).toBe('Batch App')
      expect(service.get('theme')).toBe('light')
      expect(service.get('language')).toBe('es')
    })

    it('should emit batchChange event for batch updates', () => {
      const listener = vi.fn()
      service.on('batchChange', listener)
      
      service.batchSet({
        appName: 'Batch App',
        theme: 'light'
      })
      
      expect(listener).toHaveBeenCalledWith({
        changes: expect.arrayContaining([
          expect.objectContaining({ key: 'appName', value: 'Batch App' }),
          expect.objectContaining({ key: 'theme', value: 'light' })
        ])
      })
    })
  })

  describe('Export/Import', () => {
    beforeEach(async () => {
      await service.init()
    })

    it('should export all settings', () => {
      service.set('appName', 'Export Test')
      service.set('theme', 'dark')
      
      const exported = service.export()
      
      expect(exported).toMatchObject({
        version: expect.any(String),
        timestamp: expect.any(String),
        settings: expect.objectContaining({
          appName: 'Export Test',
          theme: 'dark'
        })
      })
    })

    it('should export specific categories', () => {
      const exported = service.export(['general'])
      
      expect(exported.settings).toHaveProperty('appName')
      expect(exported.settings).not.toHaveProperty('theme') // themes category
    })

    it('should import valid settings', async () => {
      const data = {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        settings: {
          appName: 'Imported App',
          theme: 'light'
        }
      }
      
      const result = await service.import(data)
      
      expect(result.success).toBe(true)
      expect(result.imported).toBe(2)
      expect(service.get('appName')).toBe('Imported App')
      expect(service.get('theme')).toBe('light')
    })

    it('should validate imported settings', async () => {
      mockValidator.validateAll.mockReturnValue({
        isValid: false,
        errors: {
          appName: 'Invalid type'
        }
      })
      
      const data = {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        settings: {
          appName: 123
        }
      }
      
      const result = await service.import(data)
      
      expect(result.success).toBe(false)
      expect(result.errors).toHaveProperty('appName')
    })

    it('should emit import event after successful import', async () => {
      const listener = vi.fn()
      service.on('import', listener)
      
      const data = {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        settings: { appName: 'Imported' }
      }
      
      await service.import(data)
      
      expect(listener).toHaveBeenCalledWith({
        settings: data.settings,
        timestamp: data.timestamp
      })
    })
  })

  describe('Reset Functionality', () => {
    beforeEach(async () => {
      await service.init()
    })

    it('should reset single setting to default', () => {
      service.set('appName', 'Custom Name')
      service.reset('appName')
      
      expect(service.get('appName')).toBe('Viny') // Default value
    })

    it('should reset category to defaults', () => {
      service.set('appName', 'Custom App')
      service.set('language', 'es')
      
      service.resetCategory('general')
      
      expect(service.get('appName')).toBe('Viny')
      expect(service.get('language')).toBe('en')
    })

    it('should reset all settings to defaults', () => {
      service.set('appName', 'Custom App')
      service.set('theme', 'dark')
      
      service.resetAll()
      
      expect(service.get('appName')).toBe('Viny')
      expect(service.get('theme')).toBe('system')
    })

    it('should emit reset event', () => {
      const listener = vi.fn()
      service.on('reset', listener)
      
      service.reset('appName')
      
      expect(listener).toHaveBeenCalledWith({
        key: 'appName',
        defaultValue: 'Viny'
      })
    })
  })

  describe('Storage Integration', () => {
    beforeEach(async () => {
      await service.init()
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should save to storage on set', () => {
      service.set('appName', 'Storage Test')
      
      vi.advanceTimersByTime(1000) // Debounce delay
      
      expect(mockStorage.set).toHaveBeenCalledWith(
        expect.objectContaining({
          appName: 'Storage Test'
        })
      )
    })

    it('should debounce storage saves', () => {
      service.set('appName', 'Test 1')
      service.set('appName', 'Test 2')
      service.set('appName', 'Test 3')
      
      expect(mockStorage.set).not.toHaveBeenCalled()
      
      vi.advanceTimersByTime(1000)
      
      expect(mockStorage.set).toHaveBeenCalledTimes(1)
      expect(mockStorage.set).toHaveBeenCalledWith(
        expect.objectContaining({
          appName: 'Test 3'
        })
      )
    })

    it('should handle storage errors gracefully', async () => {
      mockStorage.set.mockRejectedValue(new Error('Storage error'))
      
      // Should not throw
      expect(() => service.set('appName', 'Test')).not.toThrow()
      
      vi.advanceTimersByTime(1000)
      await vi.runAllTimersAsync()
      
      // Setting should still be in memory
      expect(service.get('appName')).toBe('Test')
    })
  })

  describe('Event System', () => {
    beforeEach(async () => {
      await service.init()
    })

    it('should support multiple event listeners', () => {
      const listener1 = vi.fn()
      const listener2 = vi.fn()
      
      service.on('change', listener1)
      service.on('change', listener2)
      
      service.set('appName', 'Event Test')
      
      expect(listener1).toHaveBeenCalled()
      expect(listener2).toHaveBeenCalled()
    })

    it('should remove event listeners', () => {
      const listener = vi.fn()
      
      service.on('change', listener)
      service.off('change', listener)
      
      service.set('appName', 'Test')
      
      expect(listener).not.toHaveBeenCalled()
    })

    it('should support once listeners', () => {
      const listener = vi.fn()
      
      service.once('change', listener)
      
      service.set('appName', 'Test 1')
      service.set('appName', 'Test 2')
      
      expect(listener).toHaveBeenCalledTimes(1)
    })
  })

  describe('Error Handling', () => {
    beforeEach(async () => {
      await service.init()
    })

    it('should handle validator errors', () => {
      mockValidator.validate.mockReturnValue({
        isValid: false,
        error: 'Validation failed'
      })
      
      const listener = vi.fn()
      service.on('error', listener)
      
      service.set('appName', 'Invalid')
      
      expect(listener).toHaveBeenCalledWith({
        error: expect.any(Error),
        context: 'validate',
        key: 'appName'
      })
    })

    it('should handle missing schema gracefully', () => {
      mockRegistry.getSchema.mockReturnValue(undefined)
      
      expect(() => service.set('nonExistent', 'value')).not.toThrow()
      expect(service.get('nonExistent')).toBeUndefined()
    })
  })

  describe('Type Safety', () => {
    beforeEach(async () => {
      await service.init()
    })

    it('should maintain type consistency', () => {
      // Number setting
      service.set('fontSize', 16)
      expect(typeof service.get('fontSize')).toBe('number')
      
      // Boolean setting  
      service.set('autoSave', true)
      expect(typeof service.get('autoSave')).toBe('boolean')
      
      // String setting
      service.set('appName', 'Test')
      expect(typeof service.get('appName')).toBe('string')
    })
  })
})