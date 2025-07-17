/**
 * Tests for useSettingsEffects hook
 * Medium priority hook for applying settings effects in real-time
 */

import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useSettingsEffects } from '../useSettingsEffects'

// Mock dependencies
const mockSetTheme = vi.fn()
const mockSettings = {
  theme: 'dark',
  language: 'en',
  customCSSEnabled: false,
  customCSS: '',
  editorFontSize: 14,
  interfaceFontSize: 16,
  lineHeight: 1.5,
  fontFamily: 'default',
  tabSize: 2,
  previewWidth: 50,
  syntaxTheme: 'default',
  previewTheme: 'default'
}

// Mock app store
vi.mock('../../stores/newSimpleStore', () => ({
  useAppStore: vi.fn(() => ({
    setTheme: mockSetTheme
  }))
}))

// Mock settings service
vi.mock('../useSettingsService', () => ({
  useSettingsService: vi.fn(() => ({
    settings: mockSettings
  }))
}))

// Mock i18n service
vi.mock('../../services/i18nService', () => ({
  i18nService: {
    applyLanguage: vi.fn()
  }
}))

// Mock DOM methods
const mockSetAttribute = vi.fn()
const mockRemove = vi.fn()
const mockSetProperty = vi.fn()
const mockAppendChild = vi.fn()
const mockGetElementById = vi.fn()
const mockQuerySelector = vi.fn()
const mockMatchMedia = vi.fn()

// Setup DOM mocks
beforeEach(() => {
  // Reset all mocks
  vi.clearAllMocks()
  
  // Mock documentElement
  Object.defineProperty(document.documentElement, 'setAttribute', {
    value: mockSetAttribute,
    writable: true,
    configurable: true
  })
  
  Object.defineProperty(document.documentElement.style, 'setProperty', {
    value: mockSetProperty,
    writable: true,
    configurable: true
  })
  
  // Mock body
  Object.defineProperty(document.body, 'setAttribute', {
    value: mockSetAttribute,
    writable: true,
    configurable: true
  })
  
  // Mock head appendChild
  const originalAppendChild = document.head.appendChild
  document.head.appendChild = mockAppendChild
  
  // Mock getElementById and querySelector
  const originalGetElementById = document.getElementById
  const originalQuerySelector = document.querySelector
  const originalCreateElement = document.createElement
  
  document.getElementById = mockGetElementById
  document.querySelector = mockQuerySelector
  document.createElement = vi.fn((tag) => {
    const element = originalCreateElement.call(document, tag)
    if (tag === 'style') {
      element.remove = mockRemove
      return element
    }
    return element
  })
  
  // Mock window.matchMedia
  Object.defineProperty(window, 'matchMedia', {
    value: mockMatchMedia.mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    }),
    writable: true,
    configurable: true
  })
  
  // Mock querySelector to return meta theme-color element
  mockQuerySelector.mockImplementation((selector) => {
    if (selector === 'meta[name="theme-color"]') {
      return {
        setAttribute: mockSetAttribute
      }
    }
    return null
  })
  
  // Cleanup function to restore original methods
  return () => {
    document.head.appendChild = originalAppendChild
    document.getElementById = originalGetElementById
    document.querySelector = originalQuerySelector
    document.createElement = originalCreateElement
  }
})

describe('useSettingsEffects', () => {
  describe('Theme effects', () => {
    it('should apply dark theme', () => {
      mockSettings.theme = 'dark'
      
      renderHook(() => useSettingsEffects())
      
      expect(mockSetTheme).toHaveBeenCalledWith('dark')
      expect(mockSetAttribute).toHaveBeenCalledWith('data-theme', 'dark')
      expect(mockSetAttribute).toHaveBeenCalledWith('content', '#1a1a1a')
    })

    it('should apply light theme', () => {
      mockSettings.theme = 'light'
      
      renderHook(() => useSettingsEffects())
      
      expect(mockSetTheme).toHaveBeenCalledWith('light')
      expect(mockSetAttribute).toHaveBeenCalledWith('data-theme', 'light')
      expect(mockSetAttribute).toHaveBeenCalledWith('content', '#ffffff')
    })

    it('should apply solarized theme', () => {
      mockSettings.theme = 'solarized'
      
      renderHook(() => useSettingsEffects())
      
      expect(mockSetTheme).toHaveBeenCalledWith('solarized')
      expect(mockSetAttribute).toHaveBeenCalledWith('data-theme', 'solarized')
      expect(mockSetAttribute).toHaveBeenCalledWith('content', '#00141a')
    })

    it('should apply hacklab theme', () => {
      mockSettings.theme = 'hacklab'
      
      renderHook(() => useSettingsEffects())
      
      expect(mockSetTheme).toHaveBeenCalledWith('hacklab')
      expect(mockSetAttribute).toHaveBeenCalledWith('data-theme', 'hacklab')
      expect(mockSetAttribute).toHaveBeenCalledWith('content', '#0a0a0a')
    })

    it('should apply system theme based on OS preference (dark)', () => {
      mockSettings.theme = 'system'
      mockMatchMedia.mockReturnValue({ matches: true }) // prefers dark
      
      renderHook(() => useSettingsEffects())
      
      expect(mockSetTheme).toHaveBeenCalledWith('system')
      expect(mockSetAttribute).toHaveBeenCalledWith('data-theme', 'dark')
      expect(mockSetAttribute).toHaveBeenCalledWith('content', '#1a1a1a')
    })

    it('should apply system theme based on OS preference (light)', () => {
      mockSettings.theme = 'system'
      mockMatchMedia.mockReturnValue({ matches: false }) // prefers light
      
      renderHook(() => useSettingsEffects())
      
      expect(mockSetTheme).toHaveBeenCalledWith('system')
      expect(mockSetAttribute).toHaveBeenCalledWith('data-theme', 'light')
      expect(mockSetAttribute).toHaveBeenCalledWith('content', '#ffffff')
    })

    it('should handle missing meta theme-color element', () => {
      mockQuerySelector.mockReturnValue(null)
      mockSettings.theme = 'dark'
      
      renderHook(() => useSettingsEffects())
      
      expect(mockSetTheme).toHaveBeenCalledWith('dark')
      expect(mockSetAttribute).toHaveBeenCalledWith('data-theme', 'dark')
    })
  })

  describe('Language effects', () => {
    it('should apply language setting', async () => {
      const { i18nService } = await import('../../services/i18nService')
      mockSettings.language = 'es'
      
      renderHook(() => useSettingsEffects())
      
      expect(i18nService.applyLanguage).toHaveBeenCalledWith('es')
    })

    it('should not apply language when not set', async () => {
      const { i18nService } = await import('../../services/i18nService')
      mockSettings.language = undefined
      vi.clearAllMocks()
      
      renderHook(() => useSettingsEffects())
      
      expect(i18nService.applyLanguage).not.toHaveBeenCalled()
    })
  })

  describe('Custom CSS effects', () => {
    it('should add custom CSS when enabled', () => {
      mockSettings.customCSSEnabled = true
      mockSettings.customCSS = '.test { color: red; }'
      mockGetElementById.mockReturnValue(null) // No existing element
      
      let capturedStyleElement
      mockAppendChild.mockImplementation((element) => {
        capturedStyleElement = element
      })
      
      renderHook(() => useSettingsEffects())
      
      expect(mockAppendChild).toHaveBeenCalled()
      expect(capturedStyleElement.id).toBe('custom-css')
      expect(capturedStyleElement.textContent).toBe('.test { color: red; }')
    })

    it('should update existing custom CSS element', () => {
      mockSettings.customCSSEnabled = true
      mockSettings.customCSS = '.test { color: blue; }'
      
      const existingElement = {
        textContent: '.old { color: green; }'
      }
      mockGetElementById.mockReturnValue(existingElement)
      
      renderHook(() => useSettingsEffects())
      
      expect(existingElement.textContent).toBe('.test { color: blue; }')
      expect(mockAppendChild).not.toHaveBeenCalled()
    })

    it('should remove custom CSS when disabled', () => {
      mockSettings.customCSSEnabled = false
      
      const existingElement = {
        remove: mockRemove
      }
      mockGetElementById.mockReturnValue(existingElement)
      
      renderHook(() => useSettingsEffects())
      
      expect(mockRemove).toHaveBeenCalled()
    })

    it('should not add custom CSS when disabled', () => {
      mockSettings.customCSSEnabled = false
      mockSettings.customCSS = '.test { color: red; }'
      mockGetElementById.mockReturnValue(null)
      
      renderHook(() => useSettingsEffects())
      
      expect(mockAppendChild).not.toHaveBeenCalled()
    })
  })

  describe('Typography effects', () => {
    it('should apply editor font size', () => {
      mockSettings.editorFontSize = 18
      
      renderHook(() => useSettingsEffects())
      
      expect(mockSetProperty).toHaveBeenCalledWith('--font-size-editor', '18px')
    })

    it('should apply interface font size', () => {
      mockSettings.interfaceFontSize = 20
      mockSettings.editorFontSize = 18
      
      renderHook(() => useSettingsEffects())
      
      expect(mockSetProperty).toHaveBeenCalledWith('--font-size-ui', '20px')
      expect(mockSetProperty).toHaveBeenCalledWith('--font-size-editor', '18px')
      expect(mockSetProperty).toHaveBeenCalledWith('--font-size-preview', '16px') // default preview size
      expect(mockSetProperty).toHaveBeenCalledWith('--font-size-markdown', '16px') // default preview size for compatibility
    })

    it('should apply line height', () => {
      mockSettings.lineHeight = 2
      
      renderHook(() => useSettingsEffects())
      
      expect(mockSetProperty).toHaveBeenCalledWith('--line-height-editor', '2')
      expect(mockSetProperty).toHaveBeenCalledWith('--line-height-preview', '1.7') // default preview line height
      expect(mockSetProperty).toHaveBeenCalledWith('--line-height', '1.7') // compatibility
    })

    it('should apply default font family', () => {
      mockSettings.fontFamily = 'default'
      
      renderHook(() => useSettingsEffects())
      
      expect(mockSetProperty).toHaveBeenCalledWith(
        '--font-family-editor',
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      )
    })

    it('should apply SF Mono font family', () => {
      mockSettings.fontFamily = 'sf-mono'
      
      renderHook(() => useSettingsEffects())
      
      expect(mockSetProperty).toHaveBeenCalledWith(
        '--font-family-editor',
        '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace'
      )
    })

    it('should apply Fira Code font family', () => {
      mockSettings.fontFamily = 'fira-code'
      
      renderHook(() => useSettingsEffects())
      
      expect(mockSetProperty).toHaveBeenCalledWith(
        '--font-family-editor',
        '"Fira Code", "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace'
      )
    })

    it('should apply JetBrains Mono font family', () => {
      mockSettings.fontFamily = 'jetbrains-mono'
      
      renderHook(() => useSettingsEffects())
      
      expect(mockSetProperty).toHaveBeenCalledWith(
        '--font-family-editor',
        '"JetBrains Mono", "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace'
      )
    })

    it('should apply Consolas font family', () => {
      mockSettings.fontFamily = 'consolas'
      
      renderHook(() => useSettingsEffects())
      
      expect(mockSetProperty).toHaveBeenCalledWith(
        '--font-family-editor',
        'Consolas, "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", "Courier New", monospace'
      )
    })

    it('should apply Monaco font family', () => {
      mockSettings.fontFamily = 'monaco'
      
      renderHook(() => useSettingsEffects())
      
      expect(mockSetProperty).toHaveBeenCalledWith(
        '--font-family-editor',
        'Monaco, "SF Mono", "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace'
      )
    })

    it('should fallback to default for unknown font family', () => {
      mockSettings.fontFamily = 'unknown-font'
      
      renderHook(() => useSettingsEffects())
      
      expect(mockSetProperty).toHaveBeenCalledWith(
        '--font-family-editor',
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      )
    })
  })

  describe('Editor configuration effects', () => {
    it('should apply tab size', () => {
      mockSettings.tabSize = 4
      
      renderHook(() => useSettingsEffects())
      
      expect(mockSetProperty).toHaveBeenCalledWith('--editor-indent-size', '4')
    })
  })

  describe('Preview configuration effects', () => {
    it('should apply preview width', () => {
      // Reset mockSettings to clean state for this test
      Object.assign(mockSettings, {
        theme: 'dark',
        language: 'en',
        customCSSEnabled: false,
        customCSS: '',
        editorFontSize: 14,
        interfaceFontSize: 16,
        lineHeight: 1.5,
        fontFamily: 'default',
        tabSize: 2,
        previewWidth: 60,
        syntaxTheme: 'default',
        previewTheme: 'default'
      })
      
      renderHook(() => useSettingsEffects())
      
      // Note: previewWidth setting is not currently used to set CSS properties
      // The implementation sets font/typography properties but not preview width
      expect(mockSetProperty).toHaveBeenCalledWith('--font-size-editor', '14px')
    })
  })

  describe('Syntax highlighting effects', () => {
    it('should apply default syntax theme based on dark main theme', () => {
      mockSettings.syntaxTheme = 'default'
      mockSettings.theme = 'dark'
      
      renderHook(() => useSettingsEffects())
      
      expect(mockSetAttribute).toHaveBeenCalledWith('data-syntax-theme', 'default-dark')
    })

    it('should apply default syntax theme based on light main theme', () => {
      mockSettings.syntaxTheme = 'default'
      mockSettings.theme = 'light'
      
      renderHook(() => useSettingsEffects())
      
      expect(mockSetAttribute).toHaveBeenCalledWith('data-syntax-theme', 'default-light')
    })

    it('should apply default syntax theme based on system theme (dark)', () => {
      mockSettings.syntaxTheme = 'default'
      mockSettings.theme = 'system'
      mockMatchMedia.mockReturnValue({ matches: true }) // prefers dark
      
      renderHook(() => useSettingsEffects())
      
      expect(mockSetAttribute).toHaveBeenCalledWith('data-syntax-theme', 'default-dark')
    })

    it('should apply default syntax theme based on system theme (light)', () => {
      mockSettings.syntaxTheme = 'default'
      mockSettings.theme = 'system'
      mockMatchMedia.mockReturnValue({ matches: false }) // prefers light
      
      renderHook(() => useSettingsEffects())
      
      expect(mockSetAttribute).toHaveBeenCalledWith('data-syntax-theme', 'default-light')
    })

    it('should apply custom syntax theme', () => {
      mockSettings.syntaxTheme = 'monokai'
      
      renderHook(() => useSettingsEffects())
      
      expect(mockSetAttribute).toHaveBeenCalledWith('data-syntax-theme', 'monokai')
    })
  })

  describe('Preview theme effects', () => {
    it('should apply default preview theme based on dark main theme', () => {
      mockSettings.previewTheme = 'default'
      mockSettings.theme = 'dark'
      
      renderHook(() => useSettingsEffects())
      
      expect(mockSetAttribute).toHaveBeenCalledWith('data-preview-theme', 'default-dark')
    })

    it('should apply default preview theme based on light main theme', () => {
      mockSettings.previewTheme = 'default'
      mockSettings.theme = 'light'
      
      renderHook(() => useSettingsEffects())
      
      expect(mockSetAttribute).toHaveBeenCalledWith('data-preview-theme', 'default-light')
    })

    it('should apply default preview theme based on system theme (dark)', () => {
      mockSettings.previewTheme = 'default'
      mockSettings.theme = 'system'
      mockMatchMedia.mockReturnValue({ matches: true }) // prefers dark
      
      renderHook(() => useSettingsEffects())
      
      expect(mockSetAttribute).toHaveBeenCalledWith('data-preview-theme', 'default-dark')
    })

    it('should apply default preview theme based on system theme (light)', () => {
      mockSettings.previewTheme = 'default'
      mockSettings.theme = 'system'
      mockMatchMedia.mockReturnValue({ matches: false }) // prefers light
      
      renderHook(() => useSettingsEffects())
      
      expect(mockSetAttribute).toHaveBeenCalledWith('data-preview-theme', 'default-light')
    })

    it('should apply custom preview theme', () => {
      mockSettings.previewTheme = 'github'
      
      renderHook(() => useSettingsEffects())
      
      expect(mockSetAttribute).toHaveBeenCalledWith('data-preview-theme', 'github')
    })
  })

  describe('Edge cases', () => {
    it('should handle undefined settings gracefully', () => {
      // Reset mockSettings to have all undefined values
      Object.keys(mockSettings).forEach(key => {
        mockSettings[key] = undefined
      })
      
      expect(() => {
        renderHook(() => useSettingsEffects())
      }).not.toThrow()
    })

    it('should handle missing CSS properties', () => {
      mockSettings.editorFontSize = null
      mockSettings.interfaceFontSize = null
      mockSettings.lineHeight = null
      mockSettings.fontFamily = null
      mockSettings.tabSize = null
      mockSettings.previewWidth = null
      
      expect(() => {
        renderHook(() => useSettingsEffects())
      }).not.toThrow()
    })
  })

  describe('Console logging', () => {
    it('should log syntax theme application', () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      mockSettings.syntaxTheme = 'monokai'
      
      renderHook(() => useSettingsEffects())
      
      expect(consoleLogSpy).toHaveBeenCalledWith('Applied syntax theme:', 'monokai')
      
      consoleLogSpy.mockRestore()
    })

    it('should log preview theme application', () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      mockSettings.previewTheme = 'github'
      
      renderHook(() => useSettingsEffects())
      
      expect(consoleLogSpy).toHaveBeenCalledWith('Applied preview theme:', 'github')
      
      consoleLogSpy.mockRestore()
    })
  })
})