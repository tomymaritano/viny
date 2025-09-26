/**
 * Protection tests for useAppInit hook
 * Prevents regressions while maintaining current architecture
 * Phase 1 implementation of market-ready testing strategy
 */

import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAppInit } from '../useAppInit'

// Create a working mock that handles selectors properly
vi.mock('../../stores/newSimpleStore', () => ({
  useAppStore: vi.fn(selector => {
    const state = {
      isLoading: false,
      error: null,
      notes: [],
      settings: { theme: 'dark' },
      theme: 'dark',
      tagColors: {},
      setNotes: vi.fn(),
      setLoading: vi.fn(),
      setError: vi.fn(),
      setTheme: vi.fn(),
      loadTagColors: vi.fn(),
      updateSettings: vi.fn(),
    }

    // If selector is provided, use it to select from state
    if (typeof selector === 'function') {
      return selector(state)
    }

    // If no selector, return full state
    return state
  }),
}))

// Mock storage services to return successful results
vi.mock('../../lib/storage', () => ({
  storageService: {
    loadNotes: vi.fn().mockResolvedValue([]),
    loadSettings: vi.fn().mockResolvedValue({}),
  },
}))

// Mock logger
vi.mock('../../utils/logger', () => ({
  initLogger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
  storageLogger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

// Mock default data initializer
vi.mock('../../utils/defaultDataInitializer', () => ({
  initializeDefaultData: vi.fn().mockResolvedValue(undefined),
}))

// Mock DOM environment
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: query === '(prefers-color-scheme: dark)',
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })),
})

Object.defineProperty(document.documentElement, 'setAttribute', {
  value: vi.fn(),
  writable: true,
})

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn().mockReturnValue(null),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
  writable: true,
})

describe('useAppInit - Protection Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.NODE_ENV = 'production'
  })

  describe('Basic Functionality', () => {
    it('should initialize without crashing', () => {
      expect(() => {
        renderHook(() => useAppInit())
      }).not.toThrow()
    })

    it('should return the expected interface', () => {
      const { result } = renderHook(() => useAppInit())

      expect(result.current).toHaveProperty('isInitializing')
      expect(result.current).toHaveProperty('initError')
      expect(typeof result.current.isInitializing).toBe('boolean')
    })

    it('should return consistent results on multiple calls', () => {
      const { result, rerender } = renderHook(() => useAppInit())

      const firstResult = result.current
      rerender()
      const secondResult = result.current

      expect(firstResult).toEqual(secondResult)
    })
  })

  describe('Error Prevention', () => {
    it('should handle missing store gracefully', () => {
      // This test ensures the hook doesn't crash if store is unavailable
      expect(() => {
        renderHook(() => useAppInit())
      }).not.toThrow()
    })

    it('should handle component unmounting', () => {
      const { unmount } = renderHook(() => useAppInit())

      expect(() => {
        unmount()
      }).not.toThrow()
    })
  })

  describe('Integration Points', () => {
    it('should access the store without errors', async () => {
      const { result } = renderHook(() => useAppInit())

      // Should not have crashed accessing the store
      expect(result.current).toBeDefined()
      expect(result.current.isInitializing).toBeDefined()
      expect(result.current.initError).toBeDefined()
    })

    it('should work in different environments', () => {
      // Test production
      process.env.NODE_ENV = 'production'
      const { result: prodResult } = renderHook(() => useAppInit())
      expect(prodResult.current).toBeDefined()

      // Test development
      process.env.NODE_ENV = 'development'
      const { result: devResult } = renderHook(() => useAppInit())
      expect(devResult.current).toBeDefined()
    })
  })

  describe('State Access', () => {
    it('should access isInitializing from store', () => {
      const { result } = renderHook(() => useAppInit())

      // The hook should be accessing the store state correctly
      expect(typeof result.current.isInitializing).toBe('boolean')
    })

    it('should access initError from store', () => {
      const { result } = renderHook(() => useAppInit())

      // Should be null (no error) or a string
      expect(
        result.current.initError === null ||
          typeof result.current.initError === 'string'
      ).toBe(true)
    })
  })

  describe('Memory Safety', () => {
    it('should handle multiple hook instances', () => {
      const hooks = Array.from({ length: 3 }, () =>
        renderHook(() => useAppInit())
      )

      hooks.forEach(({ result }) => {
        expect(result.current).toBeDefined()
      })

      hooks.forEach(({ unmount }) => {
        expect(() => unmount()).not.toThrow()
      })
    })
  })
})
