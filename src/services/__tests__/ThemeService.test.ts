/**
 * Tests for ThemeService
 * Demonstrates improved testability for theme management
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ThemeService } from '../ThemeService'
import type { ThemeDependencies } from '../ThemeService'

// Mock logger
vi.mock('../../utils/logger', () => ({
  initLogger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  }
}))

// Mock window.matchMedia
const mockMatchMedia = vi.fn()
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: mockMatchMedia
})

// Mock document.documentElement
const mockSetAttribute = vi.fn()
Object.defineProperty(document.documentElement, 'setAttribute', {
  value: mockSetAttribute,
  writable: true
})

describe('ThemeService', () => {
  let service: ThemeService
  let mockDependencies: ThemeDependencies

  beforeEach(() => {
    vi.clearAllMocks()
    
    service = new ThemeService()
    mockDependencies = {
      setTheme: vi.fn()
    }

    // Default matchMedia mock
    mockMatchMedia.mockImplementation(query => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))
  })

  describe('Theme Application', () => {
    it('should apply explicit theme correctly', () => {
      const settings = { uiTheme: 'light' }
      const currentTheme = 'dark'

      service.applyTheme(settings, currentTheme, mockDependencies)

      expect(mockSetAttribute).toHaveBeenCalledWith('data-theme', 'light')
      expect(mockDependencies.setTheme).toHaveBeenCalledWith('light')
    })

    it('should fallback to currentTheme when no settings', () => {
      const settings = {}
      const currentTheme = 'dark'

      service.applyTheme(settings, currentTheme, mockDependencies)

      expect(mockSetAttribute).toHaveBeenCalledWith('data-theme', 'dark')
      expect(mockDependencies.setTheme).toHaveBeenCalledWith('dark')
    })

    it('should use default theme when no settings or currentTheme', () => {
      const settings = {}
      const currentTheme = ''

      service.applyTheme(settings, currentTheme, mockDependencies)

      expect(mockSetAttribute).toHaveBeenCalledWith('data-theme', 'dark')
      expect(mockDependencies.setTheme).toHaveBeenCalledWith('dark')
    })

    it('should handle system theme when user prefers dark', () => {
      mockMatchMedia.mockImplementation(query => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }))

      const settings = { uiTheme: 'system' }
      const currentTheme = 'light'

      service.applyTheme(settings, currentTheme, mockDependencies)

      expect(mockSetAttribute).toHaveBeenCalledWith('data-theme', 'dark')
      expect(mockDependencies.setTheme).toHaveBeenCalledWith('dark')
    })

    it('should handle system theme when user prefers light', () => {
      mockMatchMedia.mockImplementation(query => ({
        matches: false, // User prefers light
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }))

      const settings = { uiTheme: 'system' }
      const currentTheme = 'dark'

      service.applyTheme(settings, currentTheme, mockDependencies)

      expect(mockSetAttribute).toHaveBeenCalledWith('data-theme', 'light')
      expect(mockDependencies.setTheme).toHaveBeenCalledWith('light')
    })
  })

  describe('Theme Resolution', () => {
    it('should resolve explicit theme', () => {
      const settings = { uiTheme: 'light' }
      const currentTheme = 'dark'

      const result = service.resolveTheme(settings, currentTheme)

      expect(result).toBe('light')
    })

    it('should resolve system theme to dark', () => {
      mockMatchMedia.mockImplementation(query => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }))

      const settings = { uiTheme: 'system' }
      const currentTheme = 'light'

      const result = service.resolveTheme(settings, currentTheme)

      expect(result).toBe('dark')
    })

    it('should resolve system theme to light', () => {
      mockMatchMedia.mockImplementation(query => ({
        matches: false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }))

      const settings = { uiTheme: 'system' }
      const currentTheme = 'dark'

      const result = service.resolveTheme(settings, currentTheme)

      expect(result).toBe('light')
    })

    it('should fallback to currentTheme', () => {
      const settings = {}
      const currentTheme = 'custom'

      const result = service.resolveTheme(settings, currentTheme)

      expect(result).toBe('custom')
    })

    it('should fallback to default', () => {
      const settings = {}
      const currentTheme = ''

      const result = service.resolveTheme(settings, currentTheme)

      expect(result).toBe('dark')
    })
  })

  describe('System Theme Detection', () => {
    it('should detect dark mode preference', () => {
      mockMatchMedia.mockImplementation(query => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }))

      const result = service.isSystemDarkMode()

      expect(result).toBe(true)
      expect(mockMatchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)')
    })

    it('should detect light mode preference', () => {
      mockMatchMedia.mockImplementation(query => ({
        matches: false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }))

      const result = service.isSystemDarkMode()

      expect(result).toBe(false)
      expect(mockMatchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)')
    })
  })

  describe('Edge Cases', () => {
    it('should handle null settings', () => {
      const settings = null
      const currentTheme = 'dark'

      expect(() => {
        service.applyTheme(settings, currentTheme, mockDependencies)
      }).not.toThrow()

      expect(mockSetAttribute).toHaveBeenCalledWith('data-theme', 'dark')
    })

    it('should handle undefined settings', () => {
      const settings = undefined
      const currentTheme = 'light'

      expect(() => {
        service.applyTheme(settings, currentTheme, mockDependencies)
      }).not.toThrow()

      expect(mockSetAttribute).toHaveBeenCalledWith('data-theme', 'light')
    })

    it('should handle missing matchMedia', () => {
      // Temporarily remove matchMedia
      const originalMatchMedia = window.matchMedia
      delete (window as any).matchMedia

      const settings = { uiTheme: 'system' }
      const currentTheme = 'dark'

      expect(() => {
        service.applyTheme(settings, currentTheme, mockDependencies)
      }).toThrow()

      // Restore matchMedia
      window.matchMedia = originalMatchMedia
    })
  })
})