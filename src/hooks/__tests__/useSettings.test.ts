/**
 * Tests for useSettings hook
 * Critical system for configuration management
 */

import { renderHook, act } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock CSS variables and document element
const mockSetProperty = vi.fn()

// Create a persistent mock for applyEditorColors
const mockApplyEditorColors = vi.fn()

// Mock applyEditorColors function
vi.mock('../../config/editorColors', () => ({
  defaultEditorColors: {
    background: '#1e1e1e',
    foreground: '#d4d4d4',
    selectionBackground: '#264f78',
    lineHighlight: '#2a2d2e',
  },
  applyEditorColors: mockApplyEditorColors,
}))

// Mock document.documentElement.style.setProperty
Object.defineProperty(document.documentElement.style, 'setProperty', {
  value: mockSetProperty,
  writable: true,
})

describe('useSettings', () => {
  let useSettings: any

  beforeEach(async () => {
    vi.clearAllMocks()
    mockSetProperty.mockClear()
    mockApplyEditorColors.mockClear()

    // Clear localStorage
    global.localStorageMock.getItem.mockReturnValue(null)
    global.localStorageMock.setItem.mockClear()

    // Reset modules to clear global state
    vi.resetModules()

    // Re-import the hook fresh each time
    const module = await import('../useSettings')
    useSettings = module.useSettings

    // Reset the global state for testing
    module.__resetGlobalSettingsForTesting()
  })

  describe('Default Settings', () => {
    it('should return default settings when localStorage is empty', () => {
      const { result } = renderHook(() => useSettings())

      expect(result.current.settings).toMatchObject({
        theme: 'dark',
        language: 'en',
        autoSave: true,
        autoSaveInterval: 30,
        fontSize: 12,
        fontFamily: 'SF Mono',
        tabSize: 2,
        wordWrap: true,
        lineNumbers: true,
        minimap: false,
      })
    })

    it('should provide all expected methods', () => {
      const { result } = renderHook(() => useSettings())

      expect(result.current).toHaveProperty('settings')
      expect(result.current).toHaveProperty('updateSetting')
      expect(result.current).toHaveProperty('updateSettings')
      expect(result.current).toHaveProperty('resetSettings')
      expect(result.current).toHaveProperty('getSetting')

      expect(typeof result.current.updateSetting).toBe('function')
      expect(typeof result.current.updateSettings).toBe('function')
      expect(typeof result.current.resetSettings).toBe('function')
      expect(typeof result.current.getSetting).toBe('function')
    })
  })

  describe('Loading Saved Settings', () => {
    it('should load and merge saved settings from localStorage', () => {
      const savedSettings = {
        theme: 'light',
        fontSize: 14,
        fontFamily: 'Monaco',
      }
      global.localStorageMock.getItem.mockReturnValue(
        JSON.stringify(savedSettings)
      )

      const { result } = renderHook(() => useSettings())

      expect(result.current.settings.theme).toBe('light')
      expect(result.current.settings.fontSize).toBe(14)
      expect(result.current.settings.fontFamily).toBe('Monaco')
      // Should still have default values for non-overridden settings
      expect(result.current.settings.autoSave).toBe(true)
    })

    it('should handle corrupted localStorage data gracefully', () => {
      global.localStorageMock.getItem.mockReturnValue('invalid-json')

      const { result } = renderHook(() => useSettings())

      // Should fall back to default settings
      expect(result.current.settings.theme).toBe('dark')
      expect(result.current.settings.fontSize).toBe(12)
    })

    it('should handle localStorage access errors', () => {
      global.localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage not available')
      })

      const { result } = renderHook(() => useSettings())

      // Should fall back to default settings
      expect(result.current.settings.theme).toBe('dark')
    })
  })

  describe('updateSetting', () => {
    it('should update a single setting', () => {
      const { result } = renderHook(() => useSettings())

      act(() => {
        result.current.updateSetting('theme', 'light')
      })

      expect(result.current.settings.theme).toBe('light')
      expect(global.localStorageMock.setItem).toHaveBeenCalledWith(
        'viny-settings',
        expect.stringContaining('"theme":"light"')
      )
    })

    it('should update CSS variables when font settings change', () => {
      const { result } = renderHook(() => useSettings())

      act(() => {
        result.current.updateSetting('fontSize', 16)
      })

      expect(result.current.settings.fontSize).toBe(16)
      expect(mockSetProperty).toHaveBeenCalledWith('--font-size-editor', '16px')
    })

    it('should update UI font family CSS variable', () => {
      const { result } = renderHook(() => useSettings())

      act(() => {
        result.current.updateSetting('uiFontFamily', 'Inter')
      })

      expect(result.current.settings.uiFontFamily).toBe('Inter')
      expect(mockSetProperty).toHaveBeenCalledWith('--font-family-ui', 'Inter')
    })
  })

  describe('updateSettings', () => {
    it('should update multiple settings at once', () => {
      const { result } = renderHook(() => useSettings())

      const newSettings = {
        theme: 'light',
        fontSize: 16,
        autoSave: false,
      }

      act(() => {
        result.current.updateSettings(newSettings)
      })

      expect(result.current.settings.theme).toBe('light')
      expect(result.current.settings.fontSize).toBe(16)
      expect(result.current.settings.autoSave).toBe(false)
      // Should preserve other settings
      expect(result.current.settings.language).toBe('en')
    })

    it('should handle localStorage save errors gracefully', () => {
      global.localStorageMock.setItem.mockImplementation(() => {
        throw new Error('localStorage full')
      })

      const { result } = renderHook(() => useSettings())

      // Should not throw an error
      expect(() => {
        act(() => {
          result.current.updateSetting('theme', 'light')
        })
      }).not.toThrow()
    })
  })

  describe('getSetting', () => {
    it('should return the value of a specific setting', () => {
      const { result } = renderHook(() => useSettings())

      expect(result.current.getSetting('theme')).toBe('dark')
      expect(result.current.getSetting('fontSize')).toBe(12)
      expect(result.current.getSetting('nonexistent')).toBeUndefined()
    })

    it('should return updated values after changes', () => {
      const { result } = renderHook(() => useSettings())

      act(() => {
        result.current.updateSetting('theme', 'light')
      })

      expect(result.current.getSetting('theme')).toBe('light')
    })
  })

  describe('Settings Synchronization', () => {
    it('should synchronize settings across multiple hook instances', () => {
      const { result: result1 } = renderHook(() => useSettings())
      const { result: result2 } = renderHook(() => useSettings())

      act(() => {
        result1.current.updateSetting('theme', 'light')
      })

      // Both instances should have the updated value
      expect(result1.current.settings.theme).toBe('light')
      expect(result2.current.settings.theme).toBe('light')
    })
  })

  describe('Editor Colors', () => {
    it('should apply editor colors when editorColors setting changes', () => {
      const { result } = renderHook(() => useSettings())

      // Clear any previous calls (from loadSettings during hook initialization)
      mockApplyEditorColors.mockClear()

      const newColors = {
        background: '#ffffff',
        foreground: '#000000',
        selectionBackground: '#0078d4',
        lineHighlight: '#f0f0f0',
      }

      act(() => {
        result.current.updateSetting('editorColors', newColors)
      })

      expect(mockApplyEditorColors).toHaveBeenCalledWith(newColors)
    })
  })

  describe('Type Safety', () => {
    it('should handle all supported setting types', () => {
      const { result } = renderHook(() => useSettings())

      act(() => {
        result.current.updateSettings({
          theme: 'light', // string
          fontSize: 16, // number
          autoSave: false, // boolean
          editorColors: {
            // object
            background: '#ffffff',
          },
        })
      })

      expect(result.current.settings.theme).toBe('light')
      expect(result.current.settings.fontSize).toBe(16)
      expect(result.current.settings.autoSave).toBe(false)
      expect(result.current.settings.editorColors).toMatchObject({
        background: '#ffffff',
      })
    })
  })

  describe('CSS Variables Integration', () => {
    it('should handle typography-related settings', () => {
      const { result } = renderHook(() => useSettings())

      act(() => {
        result.current.updateSettings({
          fontFamily: 'Monaco',
          fontSize: 14,
          uiFontFamily: 'Inter',
          uiFontSize: 16,
          markdownFontFamily: 'Georgia',
          markdownFontSize: 18,
          lineHeight: 1.8,
        })
      })

      // Verify settings are updated
      expect(result.current.settings.fontFamily).toBe('Monaco')
      expect(result.current.settings.fontSize).toBe(14)
      expect(result.current.settings.uiFontFamily).toBe('Inter')
      expect(result.current.settings.uiFontSize).toBe(16)
      expect(result.current.settings.markdownFontFamily).toBe('Georgia')
      expect(result.current.settings.markdownFontSize).toBe(18)
      expect(result.current.settings.lineHeight).toBe(1.8)

      // Verify CSS variables are called (they may be called multiple times due to individual updates)
      expect(mockSetProperty).toHaveBeenCalledWith(
        '--font-family-editor',
        'Monaco'
      )
      expect(mockSetProperty).toHaveBeenCalledWith('--font-size-editor', '14px')
      expect(mockSetProperty).toHaveBeenCalledWith('--font-family-ui', 'Inter')
      expect(mockSetProperty).toHaveBeenCalledWith('--font-size-ui', '16px')
      expect(mockSetProperty).toHaveBeenCalledWith(
        '--font-family-markdown',
        'Georgia'
      )
      expect(mockSetProperty).toHaveBeenCalledWith(
        '--font-size-markdown',
        '18px'
      )
      expect(mockSetProperty).toHaveBeenCalledWith('--line-height', 1.8)
    })
  })

  describe('Core Functionality', () => {
    it('should persist settings to localStorage', () => {
      const { result } = renderHook(() => useSettings())

      act(() => {
        result.current.updateSetting('theme', 'light')
      })

      expect(global.localStorageMock.setItem).toHaveBeenCalledWith(
        'viny-settings',
        expect.stringContaining('"theme":"light"')
      )
    })

    it('should load settings from localStorage on initialization', () => {
      const savedSettings = {
        theme: 'light',
        fontSize: 16,
      }
      global.localStorageMock.getItem.mockReturnValue(
        JSON.stringify(savedSettings)
      )

      const { result } = renderHook(() => useSettings())

      expect(result.current.settings.theme).toBe('light')
      expect(result.current.settings.fontSize).toBe(16)
    })

    it('should apply default settings when localStorage is empty', () => {
      global.localStorageMock.getItem.mockReturnValue(null)

      const { result } = renderHook(() => useSettings())

      expect(result.current.settings.theme).toBe('dark')
      expect(result.current.settings.fontSize).toBe(12)
      expect(result.current.settings.autoSave).toBe(true)
    })
  })
})
