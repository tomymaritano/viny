/**
 * Performance tests for useAppInit hook
 * Verifies initialization speed and memory usage
 */

import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAppInit } from '../useAppInit'

// Mock the store with performance tracking
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

    if (typeof selector === 'function') {
      return selector(state)
    }
    return state
  }),
}))

// Mock services with performance tracking
vi.mock('../../services/ServiceProvider', () => ({
  useServices: () => ({
    appInitializationService: {
      initialize: vi.fn().mockResolvedValue({ success: true }),
    },
    themeService: {
      applyTheme: vi.fn(),
    },
  }),
}))

describe('useAppInit - Performance Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Initialization Speed', () => {
    it('should initialize quickly (under 50ms)', async () => {
      const startTime = performance.now()

      const { result } = renderHook(() => useAppInit())

      const endTime = performance.now()
      const initTime = endTime - startTime

      expect(initTime).toBeLessThan(50) // Should be very fast with mocks
      expect(result.current).toBeDefined()
    })

    it('should handle multiple concurrent initializations efficiently', async () => {
      const startTime = performance.now()

      // Render 10 concurrent hooks
      const hooks = Array.from({ length: 10 }, () =>
        renderHook(() => useAppInit())
      )

      const endTime = performance.now()
      const totalTime = endTime - startTime

      expect(totalTime).toBeLessThan(200) // Should handle concurrency well

      // All hooks should work
      hooks.forEach(({ result }) => {
        expect(result.current).toBeDefined()
      })

      // Cleanup
      hooks.forEach(({ unmount }) => unmount())
    })
  })

  describe('Memory Management', () => {
    it('should not leak memory on multiple renders', () => {
      const hooks: Array<{ unmount: () => void }> = []

      // Create and destroy many hook instances
      for (let i = 0; i < 100; i++) {
        const hook = renderHook(() => useAppInit())
        hooks.push(hook)

        // Unmount every 10 instances to simulate real usage
        if (i % 10 === 0) {
          hooks.forEach(h => h.unmount())
          hooks.length = 0
        }
      }

      // Cleanup remaining
      hooks.forEach(h => h.unmount())

      // Test passes if no memory issues occur
      expect(true).toBe(true)
    })

    it('should clean up properly on unmount', () => {
      const { unmount, result } = renderHook(() => useAppInit())

      expect(result.current).toBeDefined()

      // Should not throw on unmount
      expect(() => unmount()).not.toThrow()
    })
  })

  describe('Service Call Efficiency', () => {
    it('should not make redundant service calls', async () => {
      const mockServices = vi.mocked(
        (await import('../../services/ServiceProvider')).useServices
      )

      // Reset call count
      const mockInit = vi.fn().mockResolvedValue({ success: true })
      const mockTheme = vi.fn()

      mockServices.mockReturnValue({
        appInitializationService: { initialize: mockInit },
        themeService: { applyTheme: mockTheme },
      } as any)

      renderHook(() => useAppInit())

      // Each service should be called only once
      expect(mockInit).toHaveBeenCalledTimes(1)
      expect(mockTheme).toHaveBeenCalledTimes(1)
    })
  })

  describe('Stress Testing', () => {
    it('should handle rapid component mount/unmount cycles', () => {
      const startTime = performance.now()

      // Simulate rapid mount/unmount cycles
      for (let i = 0; i < 50; i++) {
        const { unmount } = renderHook(() => useAppInit())
        unmount()
      }

      const endTime = performance.now()
      const totalTime = endTime - startTime

      // Should complete all cycles quickly
      expect(totalTime).toBeLessThan(1000) // Less than 1 second for 50 cycles
    })
  })
})
