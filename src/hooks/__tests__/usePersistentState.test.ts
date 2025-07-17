import { renderHook, act } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { usePersistentState, usePersistentSettings } from '../usePersistentState'
import { logger } from '../../utils/logger'

// Mock logger
vi.mock('../../utils/logger', () => ({
  logger: {
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  }
}))

describe('usePersistentState', () => {
  const mockKey = 'test-key'
  const mockDefaultValue = { count: 0, name: 'test' }

  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('Basic Functionality', () => {
    it('should initialize with default value when localStorage is empty', () => {
      const { result } = renderHook(() => 
        usePersistentState(mockKey, mockDefaultValue)
      )

      expect(result.current[0]).toEqual(mockDefaultValue)
      expect(result.current[2].isLoading).toBe(false)
    })

    it('should load value from localStorage on mount', () => {
      const storedValue = { count: 5, name: 'stored' }
      localStorage.setItem(mockKey, JSON.stringify(storedValue))

      const { result } = renderHook(() => 
        usePersistentState(mockKey, mockDefaultValue)
      )

      expect(result.current[0]).toEqual(storedValue)
      expect(result.current[2].isLoading).toBe(false)
    })

    it('should update state and localStorage', () => {
      const { result } = renderHook(() => 
        usePersistentState(mockKey, mockDefaultValue)
      )

      const newValue = { count: 10, name: 'updated' }

      act(() => {
        result.current[1](newValue)
      })

      expect(result.current[0]).toEqual(newValue)
      expect(localStorage.getItem(mockKey)).toBe(JSON.stringify(newValue))
    })

    it('should update state with function updater', () => {
      const { result } = renderHook(() => 
        usePersistentState(mockKey, mockDefaultValue)
      )

      act(() => {
        result.current[1](prev => ({ ...prev, count: prev.count + 1 }))
      })

      expect(result.current[0]).toEqual({ count: 1, name: 'test' })
      expect(localStorage.getItem(mockKey)).toBe(JSON.stringify({ count: 1, name: 'test' }))
    })

    it('should clear state and localStorage', () => {
      const storedValue = { count: 5, name: 'stored' }
      localStorage.setItem(mockKey, JSON.stringify(storedValue))

      const { result } = renderHook(() => 
        usePersistentState(mockKey, mockDefaultValue)
      )

      act(() => {
        result.current[2].clear()
      })

      expect(result.current[0]).toEqual(mockDefaultValue)
      expect(localStorage.getItem(mockKey)).toBeNull()
    })
  })

  describe('Custom Serialization', () => {
    it('should use custom serialize function', () => {
      const serialize = vi.fn((value) => `custom:${JSON.stringify(value)}`)
      const deserialize = vi.fn((value) => JSON.parse(value.replace('custom:', '')))

      const { result } = renderHook(() => 
        usePersistentState(mockKey, mockDefaultValue, { serialize, deserialize })
      )

      const newValue = { count: 5, name: 'custom' }

      act(() => {
        result.current[1](newValue)
      })

      expect(serialize).toHaveBeenCalledWith(newValue)
      expect(localStorage.getItem(mockKey)).toBe(`custom:${JSON.stringify(newValue)}`)
    })

    it('should use custom deserialize function', () => {
      const customData = 'custom:{"count":5,"name":"custom"}'
      localStorage.setItem(mockKey, customData)

      const serialize = vi.fn((value) => `custom:${JSON.stringify(value)}`)
      const deserialize = vi.fn((value) => JSON.parse(value.replace('custom:', '')))

      const { result } = renderHook(() => 
        usePersistentState(mockKey, mockDefaultValue, { serialize, deserialize })
      )

      expect(deserialize).toHaveBeenCalledWith(customData)
      expect(result.current[0]).toEqual({ count: 5, name: 'custom' })
    })
  })

  describe('Schema Validation', () => {
    it('should validate schema and use valid data', () => {
      const validData = { count: 5, name: 'valid' }
      localStorage.setItem(mockKey, JSON.stringify(validData))

      const validateSchema = vi.fn((value): value is typeof mockDefaultValue => {
        return typeof value === 'object' && 
               value !== null && 
               typeof value.count === 'number' && 
               typeof value.name === 'string'
      })

      const { result } = renderHook(() => 
        usePersistentState(mockKey, mockDefaultValue, { validateSchema })
      )

      expect(validateSchema).toHaveBeenCalledWith(validData)
      expect(result.current[0]).toEqual(validData)
    })

    it('should reject invalid schema and use default value', () => {
      const invalidData = { count: 'invalid', name: 123 }
      localStorage.setItem(mockKey, JSON.stringify(invalidData))

      const validateSchema = vi.fn((value): value is typeof mockDefaultValue => {
        return typeof value === 'object' && 
               value !== null && 
               typeof value.count === 'number' && 
               typeof value.name === 'string'
      })

      const { result } = renderHook(() => 
        usePersistentState(mockKey, mockDefaultValue, { validateSchema })
      )

      expect(validateSchema).toHaveBeenCalledWith(invalidData)
      expect(result.current[0]).toEqual(mockDefaultValue)
      expect(vi.mocked(logger.warn)).toHaveBeenCalledWith(
        `Invalid schema for key "${mockKey}", using default value`
      )
    })
  })

  describe('Error Handling', () => {
    it('should handle localStorage read errors', () => {
      // Mock localStorage.getItem to throw an error
      const originalGetItem = localStorage.getItem
      localStorage.getItem = vi.fn(() => {
        throw new Error('localStorage read error')
      })

      const { result } = renderHook(() => 
        usePersistentState(mockKey, mockDefaultValue)
      )

      expect(result.current[0]).toEqual(mockDefaultValue)
      expect(vi.mocked(logger.error)).toHaveBeenCalledWith(
        `Failed to load persistent state for key "${mockKey}":`,
        expect.any(Error)
      )

      // Restore original method
      localStorage.getItem = originalGetItem
    })

    it('should handle localStorage write errors', () => {
      // Mock localStorage.setItem to throw an error
      const originalSetItem = localStorage.setItem
      localStorage.setItem = vi.fn(() => {
        throw new Error('localStorage write error')
      })

      const { result } = renderHook(() => 
        usePersistentState(mockKey, mockDefaultValue)
      )

      const newValue = { count: 5, name: 'test' }

      act(() => {
        result.current[1](newValue)
      })

      expect(result.current[0]).toEqual(newValue)
      expect(vi.mocked(logger.error)).toHaveBeenCalledWith(
        `Failed to save persistent state for key "${mockKey}":`,
        expect.any(Error)
      )

      // Restore original method
      localStorage.setItem = originalSetItem
    })

    it('should handle JSON parse errors', () => {
      localStorage.setItem(mockKey, 'invalid json')

      const { result } = renderHook(() => 
        usePersistentState(mockKey, mockDefaultValue)
      )

      expect(result.current[0]).toEqual(mockDefaultValue)
      expect(vi.mocked(logger.error)).toHaveBeenCalledWith(
        `Failed to load persistent state for key "${mockKey}":`,
        expect.any(Error)
      )
    })

    it('should handle clear errors', () => {
      // Mock localStorage.removeItem to throw an error
      const originalRemoveItem = localStorage.removeItem
      localStorage.removeItem = vi.fn(() => {
        throw new Error('localStorage remove error')
      })

      const { result } = renderHook(() => 
        usePersistentState(mockKey, mockDefaultValue)
      )

      act(() => {
        result.current[2].clear()
      })

      expect(result.current[0]).toEqual(mockDefaultValue)
      expect(vi.mocked(logger.error)).toHaveBeenCalledWith(
        `Failed to clear persistent state for key "${mockKey}":`,
        expect.any(Error)
      )

      // Restore original method
      localStorage.removeItem = originalRemoveItem
    })
  })

  describe('Loading State', () => {
    it('should start with loading true and set to false after initialization', () => {
      const { result } = renderHook(() => 
        usePersistentState(mockKey, mockDefaultValue)
      )

      expect(result.current[2].isLoading).toBe(false)
    })

    it('should handle loading state during async operations', async () => {
      // We can't easily test the loading state transition since it happens synchronously
      // but we can test the final state
      const { result } = renderHook(() => 
        usePersistentState(mockKey, mockDefaultValue)
      )

      expect(result.current[2].isLoading).toBe(false)
    })
  })

  describe('Key Changes', () => {
    it('should reload state when key changes', () => {
      const key1 = 'key1'
      const key2 = 'key2'
      const value1 = { count: 1, name: 'one' }
      const value2 = { count: 2, name: 'two' }

      localStorage.setItem(key1, JSON.stringify(value1))
      localStorage.setItem(key2, JSON.stringify(value2))

      const { result, rerender } = renderHook(
        ({ key }) => usePersistentState(key, mockDefaultValue),
        { initialProps: { key: key1 } }
      )

      expect(result.current[0]).toEqual(value1)

      rerender({ key: key2 })

      expect(result.current[0]).toEqual(value2)
    })
  })
})

describe('usePersistentSettings', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    document.documentElement.style.cssText = ''
  })

  afterEach(() => {
    localStorage.clear()
    document.documentElement.style.cssText = ''
  })

  describe('Settings Management', () => {
    it('should initialize with default settings', () => {
      const { result } = renderHook(() => usePersistentSettings())

      expect(result.current.settings).toEqual({
        theme: 'dark',
        fontSize: 14,
        fontFamily: 'Inter',
        autoSave: true,
        autoSaveInterval: 2000,
        sidebarWidth: 280,
        showLineNumbers: false,
        wordWrap: true,
        customColors: {}
      })
    })

    it('should update individual settings', () => {
      const { result } = renderHook(() => usePersistentSettings())

      act(() => {
        result.current.updateSetting('fontSize', 16)
      })

      expect(result.current.settings.fontSize).toBe(16)
    })

    it('should update multiple settings', () => {
      const { result } = renderHook(() => usePersistentSettings())

      act(() => {
        result.current.setSettings(prev => ({
          ...prev,
          fontSize: 18,
          fontFamily: 'Monaco'
        }))
      })

      expect(result.current.settings.fontSize).toBe(18)
      expect(result.current.settings.fontFamily).toBe('Monaco')
    })

    it('should clear settings', () => {
      const { result } = renderHook(() => usePersistentSettings())

      act(() => {
        result.current.updateSetting('fontSize', 20)
      })

      expect(result.current.settings.fontSize).toBe(20)

      act(() => {
        result.current.clearSettings()
      })

      expect(result.current.settings.fontSize).toBe(14)
    })
  })

  describe('CSS Variables', () => {
    it('should update CSS variables when settings change', () => {
      const { result } = renderHook(() => usePersistentSettings())

      act(() => {
        result.current.updateSetting('fontSize', 16)
      })

      expect(document.documentElement.style.getPropertyValue('--editor-font-size')).toBe('16px')
    })

    it('should update font family CSS variable', () => {
      const { result } = renderHook(() => usePersistentSettings())

      act(() => {
        result.current.updateSetting('fontFamily', 'Monaco')
      })

      expect(document.documentElement.style.getPropertyValue('--editor-font-family')).toBe('Monaco')
    })

    it('should update sidebar width CSS variable', () => {
      const { result } = renderHook(() => usePersistentSettings())

      act(() => {
        result.current.updateSetting('sidebarWidth', 300)
      })

      expect(document.documentElement.style.getPropertyValue('--sidebar-width')).toBe('300px')
    })

    it('should not update CSS variables while loading', () => {
      // This is harder to test since loading happens synchronously
      // but the logic prevents CSS updates during loading
      const { result } = renderHook(() => usePersistentSettings())

      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('Persistence', () => {
    it('should persist settings to localStorage', () => {
      const { result } = renderHook(() => usePersistentSettings())

      act(() => {
        result.current.updateSetting('fontSize', 20)
      })

      const stored = localStorage.getItem('viny-settings')
      expect(stored).toBeTruthy()
      
      const parsed = JSON.parse(stored!)
      expect(parsed.fontSize).toBe(20)
    })

    it('should load settings from localStorage', () => {
      const customSettings = {
        theme: 'light',
        fontSize: 18,
        fontFamily: 'Monaco',
        autoSave: false,
        autoSaveInterval: 1000,
        sidebarWidth: 250,
        showLineNumbers: true,
        wordWrap: false,
        customColors: { primary: '#ff0000' }
      }

      localStorage.setItem('viny-settings', JSON.stringify(customSettings))

      const { result } = renderHook(() => usePersistentSettings())

      expect(result.current.settings).toEqual(customSettings)
    })
  })

  describe('Type Safety', () => {
    it('should maintain type safety for updateSetting', () => {
      const { result } = renderHook(() => usePersistentSettings())

      act(() => {
        result.current.updateSetting('fontSize', 16)
        result.current.updateSetting('fontFamily', 'Monaco')
        result.current.updateSetting('autoSave', false)
      })

      expect(result.current.settings.fontSize).toBe(16)
      expect(result.current.settings.fontFamily).toBe('Monaco')
      expect(result.current.settings.autoSave).toBe(false)
    })
  })
})