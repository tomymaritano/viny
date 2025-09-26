import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSettings } from '../useSettings'
import { SettingsService } from '../../services/settings/SettingsService'
import type { SettingValue } from '../../services/settings/types'

// Mock the SettingsService
vi.mock('../../services/settings/SettingsService')

describe('useSettings', () => {
  let mockService: vi.Mocked<SettingsService>

  beforeEach(() => {
    // Create a mocked service instance
    mockService = {
      getInstance: vi.fn(),
      init: vi.fn().mockResolvedValue(undefined),
      get: vi.fn(),
      set: vi.fn(),
      getAll: vi.fn(),
      getByCategory: vi.fn(),
      batchSet: vi.fn(),
      preview: vi.fn(),
      getPreview: vi.fn(),
      commitPreview: vi.fn(),
      clearPreview: vi.fn(),
      clearAllPreviews: vi.fn(),
      export: vi.fn(),
      import: vi.fn(),
      reset: vi.fn(),
      resetCategory: vi.fn(),
      resetAll: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
      once: vi.fn(),
      emit: vi.fn(),
      getValidator: vi.fn(),
      getRegistry: vi.fn(),
    } as any

    // Mock static getInstance method
    SettingsService.getInstance = vi.fn().mockReturnValue(mockService)

    // Setup default mock returns
    mockService.getAll.mockReturnValue({
      appName: 'Test App',
      theme: 'dark',
      language: 'en',
    })

    mockService.getByCategory.mockImplementation(category => {
      if (category === 'general') {
        return { appName: 'Test App', language: 'en' }
      }
      if (category === 'themes') {
        return { theme: 'dark' }
      }
      return {}
    })

    const mockRegistry = {
      getCategory: vi.fn().mockImplementation(id => {
        if (id === 'general') {
          return {
            id: 'general',
            label: 'General',
            schemas: [
              {
                key: 'appName',
                type: 'string',
                defaultValue: 'Viny',
                label: 'App Name',
                category: 'general',
              },
              {
                key: 'language',
                type: 'string',
                defaultValue: 'en',
                label: 'Language',
                category: 'general',
              },
            ],
          }
        }
        if (id === 'themes') {
          return {
            id: 'themes',
            label: 'Themes',
            schemas: [
              {
                key: 'theme',
                type: 'string',
                defaultValue: 'system',
                label: 'Theme',
                category: 'themes',
              },
            ],
          }
        }
        return null
      }),
      getAllSchemas: vi.fn().mockReturnValue([
        {
          key: 'appName',
          type: 'string',
          defaultValue: 'Viny',
          label: 'App Name',
          category: 'general',
        },
        {
          key: 'language',
          type: 'string',
          defaultValue: 'en',
          label: 'Language',
          category: 'general',
        },
        {
          key: 'theme',
          type: 'string',
          defaultValue: 'system',
          label: 'Theme',
          category: 'themes',
        },
      ]),
    }

    const mockValidator = {
      validateAll: vi.fn().mockReturnValue({ isValid: true, errors: {} }),
    }

    mockService.getRegistry.mockReturnValue(mockRegistry)
    mockService.getValidator.mockReturnValue(mockValidator)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic Hook Usage', () => {
    it('should initialize and load all settings', async () => {
      const { result } = renderHook(() => useSettings())

      expect(result.current.loading).toBe(true)

      // Wait for initialization
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      expect(mockService.init).toHaveBeenCalled()
      expect(result.current.loading).toBe(false)
      expect(result.current.settings).toEqual({
        appName: 'Test App',
        theme: 'dark',
        language: 'en',
      })
    })

    it('should load settings for specific category', async () => {
      const { result } = renderHook(() => useSettings({ category: 'general' }))

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      expect(mockService.getByCategory).toHaveBeenCalledWith('general')
      expect(result.current.settings).toEqual({
        appName: 'Test App',
        language: 'en',
      })
    })

    it('should provide schemas for category', async () => {
      const { result } = renderHook(() => useSettings({ category: 'general' }))

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      expect(result.current.schemas).toEqual([
        {
          key: 'appName',
          type: 'string',
          defaultValue: 'Viny',
          label: 'App Name',
          category: 'general',
        },
        {
          key: 'language',
          type: 'string',
          defaultValue: 'en',
          label: 'Language',
          category: 'general',
        },
      ])
    })

    it('should provide all schemas when no category specified', async () => {
      const { result } = renderHook(() => useSettings())

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      expect(result.current.schemas).toHaveLength(3)
    })
  })

  describe('Setting Operations', () => {
    it('should set a setting value', async () => {
      mockService.set.mockReturnValue(true)
      const { result } = renderHook(() => useSettings())

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      act(() => {
        result.current.setSetting('appName', 'New App Name')
      })

      expect(mockService.set).toHaveBeenCalledWith('appName', 'New App Name')
    })

    it('should handle set operation failure', async () => {
      mockService.set.mockReturnValue(false)
      const { result } = renderHook(() => useSettings())

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      act(() => {
        result.current.setSetting('appName', 'Invalid Value')
      })

      expect(mockService.set).toHaveBeenCalledWith('appName', 'Invalid Value')
    })

    it('should batch set multiple settings', async () => {
      mockService.batchSet.mockReturnValue({
        appName: true,
        theme: true,
      })
      const { result } = renderHook(() => useSettings())

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      const updates = {
        appName: 'Batch App',
        theme: 'light',
      }

      act(() => {
        result.current.batchSetSettings(updates)
      })

      expect(mockService.batchSet).toHaveBeenCalledWith(updates)
    })

    it('should reset a setting', async () => {
      const { result } = renderHook(() => useSettings())

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      act(() => {
        result.current.resetSetting('appName')
      })

      expect(mockService.reset).toHaveBeenCalledWith('appName')
    })

    it('should reset category', async () => {
      const { result } = renderHook(() => useSettings({ category: 'general' }))

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      act(() => {
        result.current.resetCategory()
      })

      expect(mockService.resetCategory).toHaveBeenCalledWith('general')
    })
  })

  describe('Preview Functionality', () => {
    it('should preview a setting', async () => {
      const { result } = renderHook(() => useSettings())

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      act(() => {
        result.current.previewSetting('theme', 'light')
      })

      expect(mockService.preview).toHaveBeenCalledWith('theme', 'light')
    })

    it('should commit preview', async () => {
      const { result } = renderHook(() => useSettings())

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      act(() => {
        result.current.commitPreview('theme')
      })

      expect(mockService.commitPreview).toHaveBeenCalledWith('theme')
    })

    it('should clear preview', async () => {
      const { result } = renderHook(() => useSettings())

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      act(() => {
        result.current.clearPreview('theme')
      })

      expect(mockService.clearPreview).toHaveBeenCalledWith('theme')
    })

    it('should clear all previews', async () => {
      const { result } = renderHook(() => useSettings())

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      act(() => {
        result.current.clearAllPreviews()
      })

      expect(mockService.clearAllPreviews).toHaveBeenCalled()
    })
  })

  describe('Import/Export', () => {
    it('should export settings', async () => {
      const mockExportData = {
        version: '1.0.0',
        timestamp: '2023-01-01T00:00:00.000Z',
        settings: { appName: 'Exported' },
      }
      mockService.export.mockReturnValue(mockExportData)

      const { result } = renderHook(() => useSettings())

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      let exportData: any
      act(() => {
        exportData = result.current.exportSettings()
      })

      expect(mockService.export).toHaveBeenCalled()
      expect(exportData).toEqual(mockExportData)
    })

    it('should export category settings', async () => {
      const { result } = renderHook(() => useSettings({ category: 'general' }))

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      act(() => {
        result.current.exportSettings()
      })

      expect(mockService.export).toHaveBeenCalledWith(['general'])
    })

    it('should import settings', async () => {
      mockService.import.mockResolvedValue({
        success: true,
        imported: 2,
        errors: {},
      })

      const { result } = renderHook(() => useSettings())

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      const importData = {
        version: '1.0.0',
        timestamp: '2023-01-01T00:00:00.000Z',
        settings: { appName: 'Imported' },
      }

      await act(async () => {
        await result.current.importSettings(importData)
      })

      expect(mockService.import).toHaveBeenCalledWith(importData)
    })
  })

  describe('Event Handling', () => {
    it('should listen to setting changes', async () => {
      let changeCallback: Function = () => {}
      mockService.on.mockImplementation((event, callback) => {
        if (event === 'change') {
          changeCallback = callback
        }
      })

      const { result } = renderHook(() => useSettings())

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      // Simulate a change event
      const changeEvent = {
        key: 'theme',
        value: 'light',
        previousValue: 'dark',
      }

      mockService.getAll.mockReturnValue({
        appName: 'Test App',
        theme: 'light',
        language: 'en',
      })

      act(() => {
        changeCallback(changeEvent)
      })

      expect(result.current.settings.theme).toBe('light')
    })

    it('should listen to batch changes', async () => {
      let batchChangeCallback: Function = () => {}
      mockService.on.mockImplementation((event, callback) => {
        if (event === 'batchChange') {
          batchChangeCallback = callback
        }
      })

      const { result } = renderHook(() => useSettings())

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      // Simulate a batch change event
      const batchChangeEvent = {
        changes: [
          { key: 'appName', value: 'New App' },
          { key: 'theme', value: 'light' },
        ],
      }

      mockService.getAll.mockReturnValue({
        appName: 'New App',
        theme: 'light',
        language: 'en',
      })

      act(() => {
        batchChangeCallback(batchChangeEvent)
      })

      expect(result.current.settings.appName).toBe('New App')
      expect(result.current.settings.theme).toBe('light')
    })
  })

  describe('Validation and Errors', () => {
    it('should show validation errors', async () => {
      const mockValidator = {
        validateAll: vi.fn().mockReturnValue({
          isValid: false,
          errors: {
            appName: 'Name too short',
            theme: 'Invalid theme',
          },
        }),
      }
      mockService.getValidator.mockReturnValue(mockValidator)

      const { result } = renderHook(() =>
        useSettings({ validateOnChange: true })
      )

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      expect(result.current.errors).toEqual({
        appName: 'Name too short',
        theme: 'Invalid theme',
      })
    })

    it('should validate on change when enabled', async () => {
      const mockValidator = {
        validateAll: vi.fn().mockReturnValue({ isValid: true, errors: {} }),
      }
      mockService.getValidator.mockReturnValue(mockValidator)

      const { result } = renderHook(() =>
        useSettings({ validateOnChange: true })
      )

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      // Simulate setting change
      act(() => {
        result.current.setSetting('appName', 'New Name')
      })

      expect(mockValidator.validateAll).toHaveBeenCalled()
    })
  })

  describe('Loading States', () => {
    it('should show loading state during initialization', () => {
      const { result } = renderHook(() => useSettings())

      expect(result.current.loading).toBe(true)
      expect(result.current.settings).toEqual({})
    })

    it('should clear loading state after initialization', async () => {
      const { result } = renderHook(() => useSettings())

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      expect(result.current.loading).toBe(false)
    })

    it('should show loading during async operations', async () => {
      mockService.import.mockImplementation(
        () =>
          new Promise(resolve =>
            setTimeout(
              () => resolve({ success: true, imported: 1, errors: {} }),
              100
            )
          )
      )

      const { result } = renderHook(() => useSettings())

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      // Start import operation
      act(() => {
        result.current.importSettings({
          version: '1.0.0',
          timestamp: '2023-01-01T00:00:00.000Z',
          settings: {},
        })
      })

      expect(result.current.loading).toBe(true)

      // Wait for import to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150))
      })

      expect(result.current.loading).toBe(false)
    })
  })

  describe('Cleanup', () => {
    it('should remove event listeners on unmount', async () => {
      const { unmount } = renderHook(() => useSettings())

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      unmount()

      expect(mockService.off).toHaveBeenCalledWith(
        'change',
        expect.any(Function)
      )
      expect(mockService.off).toHaveBeenCalledWith(
        'batchChange',
        expect.any(Function)
      )
    })
  })

  describe('Edge Cases', () => {
    it('should handle service initialization failure', async () => {
      mockService.init.mockRejectedValue(new Error('Init failed'))
      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})

      const { result } = renderHook(() => useSettings())

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      expect(result.current.loading).toBe(false)
      expect(consoleError).toHaveBeenCalled()

      consoleError.mockRestore()
    })

    it('should handle missing category gracefully', async () => {
      mockService.getByCategory.mockReturnValue({})
      const mockRegistry = {
        getCategory: vi.fn().mockReturnValue(null),
        getAllSchemas: vi.fn().mockReturnValue([]),
      }
      mockService.getRegistry.mockReturnValue(mockRegistry)

      const { result } = renderHook(() =>
        useSettings({ category: 'nonexistent' })
      )

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      expect(result.current.settings).toEqual({})
      expect(result.current.schemas).toEqual([])
    })

    it('should handle service singleton issues', async () => {
      SettingsService.getInstance = vi.fn().mockImplementation(() => {
        throw new Error('Singleton error')
      })

      const { result } = renderHook(() => useSettings())

      expect(result.current.loading).toBe(false)
      expect(result.current.settings).toEqual({})
    })
  })
})
