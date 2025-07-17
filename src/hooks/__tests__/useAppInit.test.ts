/**
 * Tests for useAppInit hook
 * Critical system for application initialization
 */

import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAppInit } from '../useAppInit'

// Mock functions will be defined inside the vi.mock factory

vi.mock('../../stores/newSimpleStore', () => ({
  useAppStore: vi.fn((selector) => {
    const state = {
      setNotes: vi.fn(),
      setLoading: vi.fn(),
      setError: vi.fn(),
      theme: 'dark',
      setTheme: vi.fn(),
      loadTagColors: vi.fn(),
      settings: { uiTheme: 'dark' },
      updateSettings: vi.fn(),
      isLoading: false,
      error: null
    }
    
    // If selector is provided, use it (for return values)
    if (typeof selector === 'function') {
      return selector(state)
    }
    
    // If no selector, return full state (for destructuring)
    return state
  })
}))

vi.mock('../../lib/storage', () => ({
  storageService: {
    loadNotes: vi.fn(),
    loadSettings: vi.fn()
  }
}))

vi.mock('../../utils/logger', () => ({
  initLogger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  }
}))

vi.mock('../../utils/defaultDataInitializer', () => ({
  initializeDefaultData: vi.fn()
}))

vi.mock('../../lib/storageUtils', () => ({
  diagnoseSaveIssues: vi.fn(),
  checkStorageAvailability: vi.fn()
}))

// Mock matchMedia for theme detection
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: query === '(prefers-color-scheme: dark)',
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock document.documentElement
const mockSetAttribute = vi.fn()
Object.defineProperty(document.documentElement, 'setAttribute', {
  value: mockSetAttribute,
  writable: true
})

describe('useAppInit', () => {
  let mockSetNotes: any
  let mockSetLoading: any
  let mockSetError: any
  let mockSetTheme: any
  let mockLoadTagColors: any
  let mockUpdateSettings: any
  let mockLoadNotes: any
  let mockLoadSettings: any
  let mockInitializeDefaultData: any
  let mockDiagnoseSaveIssues: any
  let mockCheckStorageAvailability: any
  let mockLogger: any
  
  beforeEach(async () => {
    vi.clearAllMocks()
    
    // Get references to the mocked functions
    const { useAppStore } = await import('../../stores/newSimpleStore')
    const { storageService } = await import('../../lib/storage')
    const { initLogger } = await import('../../utils/logger')
    const { initializeDefaultData } = await import('../../utils/defaultDataInitializer')
    const { diagnoseSaveIssues, checkStorageAvailability } = await import('../../lib/storageUtils')
    
    const mockedStore = vi.mocked(useAppStore)
    mockLoadNotes = vi.mocked(storageService.loadNotes)
    mockLoadSettings = vi.mocked(storageService.loadSettings)
    mockLogger = vi.mocked(initLogger)
    mockInitializeDefaultData = vi.mocked(initializeDefaultData)
    mockDiagnoseSaveIssues = vi.mocked(diagnoseSaveIssues)
    mockCheckStorageAvailability = vi.mocked(checkStorageAvailability)
    
    // Create fresh mocks
    mockSetNotes = vi.fn()
    mockSetLoading = vi.fn()
    mockSetError = vi.fn()
    mockSetTheme = vi.fn()
    mockLoadTagColors = vi.fn()
    mockUpdateSettings = vi.fn()
    
    // Reset the store mock
    mockedStore.mockImplementation((selector) => {
      const state = {
        setNotes: mockSetNotes,
        setLoading: mockSetLoading,
        setError: mockSetError,
        theme: 'dark',
        setTheme: mockSetTheme,
        loadTagColors: mockLoadTagColors,
        settings: { uiTheme: 'dark' },
        updateSettings: mockUpdateSettings,
        isLoading: false,
        error: null
      }
      
      if (typeof selector === 'function') {
        return selector(state)
      }
      
      return state
    })
    
    // Set up default successful responses
    mockLoadNotes.mockResolvedValue([])
    mockLoadSettings.mockResolvedValue({})
    mockInitializeDefaultData.mockResolvedValue(undefined)
    mockDiagnoseSaveIssues.mockResolvedValue([])
    mockCheckStorageAvailability.mockReturnValue({ available: true })
    
    // Reset environment to production (skip diagnostics by default)
    process.env.NODE_ENV = 'production'
    
    // Reset localStorage mock
    if (global.localStorageMock?.getItem) {
      global.localStorageMock.getItem.mockReturnValue(null)
    }
  })

  describe('App Initialization', () => {
    it('should initialize app successfully with default data', async () => {
      const mockNotes = [
        { id: '1', title: 'Test Note', content: 'Test content', createdAt: new Date().toISOString() }
      ]
      mockLoadNotes.mockResolvedValue(mockNotes)
      
      console.log('Before renderHook')
      const { result } = renderHook(() => {
        console.log('useAppInit called')
        return useAppInit()
      })
      console.log('After renderHook, result:', result.current)
      console.log('Mock calls so far:')
      console.log('  setLoading calls:', mockSetLoading.mock.calls)
      console.log('  setError calls:', mockSetError.mock.calls)

      // Should start loading
      expect(mockSetLoading).toHaveBeenCalledWith(true)
      expect(mockSetError).toHaveBeenCalledWith(null)

      await waitFor(() => {
        expect(mockInitializeDefaultData).toHaveBeenCalled()
      })

      await waitFor(() => {
        expect(mockLoadNotes).toHaveBeenCalled()
      })

      await waitFor(() => {
        expect(mockLoadTagColors).toHaveBeenCalled()
      })

      await waitFor(() => {
        expect(mockSetNotes).toHaveBeenCalledWith(mockNotes)
      })

      await waitFor(() => {
        expect(mockSetLoading).toHaveBeenCalledWith(false)
      })

      expect(mockLogger.info).toHaveBeenCalledWith('App initialization completed successfully')
    })

    it('should handle empty notes array', async () => {
      mockLoadNotes.mockResolvedValue([])
      
      renderHook(() => useAppInit())

      await waitFor(() => {
        expect(mockSetNotes).toHaveBeenCalledWith([])
      })

      expect(mockLogger.info).toHaveBeenCalledWith('App initialization completed successfully')
    })

    it('should handle initialization errors gracefully', async () => {
      const error = new Error('Storage failed')
      mockLoadNotes.mockRejectedValue(error)
      
      renderHook(() => useAppInit())

      await waitFor(() => {
        expect(mockSetError).toHaveBeenCalledWith('Failed to load your notes. Please refresh the page.')
      })

      await waitFor(() => {
        expect(mockSetLoading).toHaveBeenCalledWith(false)
      })

      expect(mockLogger.error).toHaveBeenCalledWith('Failed to initialize app:', error)
    })
  })

  describe('Development Mode Diagnostics', () => {
    it('should run storage diagnostics in development mode', async () => {
      process.env.NODE_ENV = 'development'
      
      renderHook(() => useAppInit())

      await waitFor(() => {
        expect(mockCheckStorageAvailability).toHaveBeenCalled()
      })

      await waitFor(() => {
        expect(mockDiagnoseSaveIssues).toHaveBeenCalled()
      })

      expect(mockLogger.debug).toHaveBeenCalledWith('Running storage diagnostics...')
      expect(mockLogger.debug).toHaveBeenCalledWith('No storage issues detected')
    })

    it('should log storage issues when detected in development', async () => {
      process.env.NODE_ENV = 'development'
      const mockIssues = ['Issue 1', 'Issue 2']
      mockDiagnoseSaveIssues.mockResolvedValue(mockIssues)
      
      renderHook(() => useAppInit())

      await waitFor(() => {
        expect(mockLogger.warn).toHaveBeenCalledWith('Storage issues detected:', mockIssues)
      })

      expect(mockLogger.warn).toHaveBeenCalledWith('Issue:', 'Issue 1')
      expect(mockLogger.warn).toHaveBeenCalledWith('Issue:', 'Issue 2')
    })

    it('should skip diagnostics in production mode', async () => {
      process.env.NODE_ENV = 'production'
      
      renderHook(() => useAppInit())

      await waitFor(() => {
        expect(mockLoadNotes).toHaveBeenCalled()
      })

      expect(mockCheckStorageAvailability).not.toHaveBeenCalled()
      expect(mockDiagnoseSaveIssues).not.toHaveBeenCalled()
    })
  })

  describe('Settings Loading', () => {
    it('should load settings from storage service', async () => {
      const mockSettings = { theme: 'light', fontSize: 14 }
      mockLoadSettings.mockResolvedValue(mockSettings)
      
      renderHook(() => useAppInit())

      await waitFor(() => {
        expect(mockLoadSettings).toHaveBeenCalled()
      })

      await waitFor(() => {
        expect(mockUpdateSettings).toHaveBeenCalledWith(mockSettings, true)
      })

      expect(mockLogger.debug).toHaveBeenCalledWith('Settings loaded from storage:', Object.keys(mockSettings))
    })

    it('should fallback to localStorage when storage service returns empty', async () => {
      mockLoadSettings.mockResolvedValue({})
      const directSettings = { theme: 'dark', fontSize: 16 }
      global.localStorageMock.getItem.mockReturnValue(JSON.stringify(directSettings))
      
      renderHook(() => useAppInit())

      await waitFor(() => {
        expect(mockUpdateSettings).toHaveBeenCalledWith(directSettings, true)
      })

      expect(mockLogger.debug).toHaveBeenCalledWith('Settings loaded from direct localStorage:', Object.keys(directSettings))
    })

    it('should handle settings loading errors gracefully', async () => {
      const error = new Error('Settings load failed')
      mockLoadSettings.mockRejectedValue(error)
      
      renderHook(() => useAppInit())

      await waitFor(() => {
        expect(mockLogger.warn).toHaveBeenCalledWith('Failed to load settings from storage:', error)
      })

      // Should still complete initialization
      await waitFor(() => {
        expect(mockSetLoading).toHaveBeenCalledWith(false)
      })
    })

    it('should handle localStorage fallback errors', async () => {
      mockLoadSettings.mockResolvedValue({})
      global.localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage error')
      })
      
      renderHook(() => useAppInit())

      await waitFor(() => {
        expect(mockLogger.warn).toHaveBeenCalledWith('Failed to load settings from direct localStorage:', expect.any(Error))
      })
    })
  })

  describe('Theme Application', () => {
    it('should apply theme to DOM', async () => {
      renderHook(() => useAppInit())

      await waitFor(() => {
        expect(mockSetAttribute).toHaveBeenCalledWith('data-theme', 'dark')
      })

      expect(mockSetTheme).toHaveBeenCalledWith('dark')
      expect(mockLogger.debug).toHaveBeenCalledWith('Theme applied:', 'dark')
    })
  })

  describe('Return Values', () => {
    it('should return initialization status and error', () => {
      const { result } = renderHook(() => useAppInit())

      expect(result.current).toHaveProperty('isInitializing')
      expect(result.current).toHaveProperty('initError')
      expect(typeof result.current.isInitializing).toBe('boolean')
      expect(result.current.initError).toBeNull()
    })
  })

  describe('Initialization Flow', () => {
    it('should follow correct initialization sequence', async () => {
      const callOrder: string[] = []
      
      mockSetLoading.mockImplementation(() => callOrder.push('setLoading'))
      mockSetError.mockImplementation(() => callOrder.push('setError'))
      mockInitializeDefaultData.mockImplementation(() => {
        callOrder.push('initializeDefaultData')
        return Promise.resolve()
      })
      mockLoadNotes.mockImplementation(() => {
        callOrder.push('loadNotes')
        return Promise.resolve([])
      })
      mockLoadTagColors.mockImplementation(() => {
        callOrder.push('loadTagColors')
        return Promise.resolve()
      })
      mockSetNotes.mockImplementation(() => callOrder.push('setNotes'))
      
      renderHook(() => useAppInit())

      await waitFor(() => {
        expect(callOrder.includes('setNotes')).toBe(true)
      })

      // Verify the sequence
      expect(callOrder.indexOf('setLoading')).toBeLessThan(callOrder.indexOf('initializeDefaultData'))
      expect(callOrder.indexOf('initializeDefaultData')).toBeLessThan(callOrder.indexOf('loadNotes'))
      expect(callOrder.indexOf('loadNotes')).toBeLessThan(callOrder.indexOf('loadTagColors'))
      expect(callOrder.indexOf('loadTagColors')).toBeLessThan(callOrder.indexOf('setNotes'))
    })

    it('should prevent double initialization', async () => {
      renderHook(() => useAppInit())

      await waitFor(() => {
        expect(mockLoadNotes).toHaveBeenCalledTimes(1)
      })

      // Verify other methods were called only once
      expect(mockInitializeDefaultData).toHaveBeenCalledTimes(1)
      expect(mockLoadTagColors).toHaveBeenCalledTimes(1)
    })
  })

  describe('Core Functionality', () => {
    it('should complete initialization for basic app startup', async () => {
      renderHook(() => useAppInit())

      // Verify initialization starts
      expect(mockSetLoading).toHaveBeenCalledWith(true)
      expect(mockSetError).toHaveBeenCalledWith(null)

      // Wait for all initialization to complete
      await waitFor(() => {
        expect(mockSetLoading).toHaveBeenCalledWith(false)
      })

      // Verify all required steps were called
      expect(mockInitializeDefaultData).toHaveBeenCalled()
      expect(mockLoadNotes).toHaveBeenCalled() 
      expect(mockLoadTagColors).toHaveBeenCalled()
      expect(mockSetNotes).toHaveBeenCalled()
    })

    it('should apply theme settings on initialization', async () => {
      renderHook(() => useAppInit())

      await waitFor(() => {
        expect(mockSetAttribute).toHaveBeenCalled()
      })

      expect(mockSetTheme).toHaveBeenCalled()
    })

    it('should log initialization progress', async () => {
      renderHook(() => useAppInit())

      await waitFor(() => {
        expect(mockLogger.debug).toHaveBeenCalledWith('Initializing default data if needed...')
      })

      expect(mockLogger.debug).toHaveBeenCalledWith('Loading notes from storage...')
      expect(mockLogger.debug).toHaveBeenCalledWith('Loading tag colors from storage...')
      expect(mockLogger.debug).toHaveBeenCalledWith('Loading settings from storage...')
    })
  })
})