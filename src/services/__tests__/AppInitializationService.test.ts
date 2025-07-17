/**
 * Tests for AppInitializationService
 * Demonstrates improved testability with service layer architecture
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AppInitializationService } from '../AppInitializationService'
import type { InitializationDependencies } from '../AppInitializationService'

// Mock external dependencies
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

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn()
  },
  writable: true
})

describe('AppInitializationService', () => {
  let service: AppInitializationService
  let mockDependencies: InitializationDependencies
  let mockStorageService: any
  let mockInitializeDefaultData: any

  beforeEach(async () => {
    vi.clearAllMocks()
    
    service = new AppInitializationService()
    service.reset() // Reset state between tests

    // Create mock dependencies
    mockDependencies = {
      setNotes: vi.fn(),
      setLoading: vi.fn(),
      setError: vi.fn(),
      loadTagColors: vi.fn(),
      updateSettings: vi.fn()
    }

    // Get mocked modules
    const storage = await import('../../lib/storage')
    const initializer = await import('../../utils/defaultDataInitializer')
    
    mockStorageService = vi.mocked(storage.storageService)
    mockInitializeDefaultData = vi.mocked(initializer.initializeDefaultData)

    // Set default successful responses
    mockStorageService.loadNotes.mockResolvedValue([])
    mockStorageService.loadSettings.mockResolvedValue({})
    mockInitializeDefaultData.mockResolvedValue(undefined)
    mockDependencies.loadTagColors.mockResolvedValue(undefined)

    // Mock localStorage
    vi.mocked(window.localStorage.getItem).mockReturnValue(null)
    
    // Set production environment
    process.env.NODE_ENV = 'production'
  })

  describe('Successful Initialization', () => {
    it('should complete initialization successfully with empty data', async () => {
      const result = await service.initialize(mockDependencies)

      expect(result.success).toBe(true)
      expect(result.error).toBeUndefined()
      
      // Verify initialization sequence
      expect(mockDependencies.setLoading).toHaveBeenCalledWith(true)
      expect(mockDependencies.setError).toHaveBeenCalledWith(null)
      expect(mockInitializeDefaultData).toHaveBeenCalled()
      expect(mockStorageService.loadNotes).toHaveBeenCalled()
      expect(mockDependencies.loadTagColors).toHaveBeenCalled()
      expect(mockDependencies.setNotes).toHaveBeenCalledWith([])
      expect(mockDependencies.setLoading).toHaveBeenCalledWith(false)
    })

    it('should handle notes data correctly', async () => {
      const mockNotes = [
        { id: '1', title: 'Test Note', content: 'Test content' }
      ]
      mockStorageService.loadNotes.mockResolvedValue(mockNotes)

      const result = await service.initialize(mockDependencies)

      expect(result.success).toBe(true)
      expect(mockDependencies.setNotes).toHaveBeenCalledWith(mockNotes)
    })

    it('should load settings from storage service', async () => {
      const mockSettings = { theme: 'dark', fontSize: 14 }
      mockStorageService.loadSettings.mockResolvedValue(mockSettings)

      await service.initialize(mockDependencies)

      expect(mockDependencies.updateSettings).toHaveBeenCalledWith(mockSettings, true)
    })

    it('should fallback to localStorage when storage service returns empty', async () => {
      mockStorageService.loadSettings.mockResolvedValue({})
      const localSettings = { theme: 'light', fontSize: 16 }
      vi.mocked(window.localStorage.getItem).mockReturnValue(JSON.stringify(localSettings))

      await service.initialize(mockDependencies)

      expect(window.localStorage.getItem).toHaveBeenCalledWith('viny-settings')
      expect(mockDependencies.updateSettings).toHaveBeenCalledWith(localSettings, true)
    })
  })

  describe('Error Handling', () => {
    it('should handle storage loading errors gracefully', async () => {
      const error = new Error('Storage failed')
      mockStorageService.loadNotes.mockRejectedValue(error)

      const result = await service.initialize(mockDependencies)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Failed to load your notes. Please refresh the page.')
      expect(mockDependencies.setError).toHaveBeenCalledWith('Failed to load your notes. Please refresh the page.')
      expect(mockDependencies.setLoading).toHaveBeenCalledWith(false)
    })

    it('should handle settings loading errors without failing initialization', async () => {
      mockStorageService.loadSettings.mockRejectedValue(new Error('Settings failed'))

      const result = await service.initialize(mockDependencies)

      // Should still succeed overall
      expect(result.success).toBe(true)
      expect(mockDependencies.setNotes).toHaveBeenCalledWith([])
    })

    it('should handle localStorage fallback errors', async () => {
      mockStorageService.loadSettings.mockResolvedValue({})
      vi.mocked(window.localStorage.getItem).mockImplementation(() => {
        throw new Error('localStorage error')
      })

      const result = await service.initialize(mockDependencies)

      // Should still complete successfully
      expect(result.success).toBe(true)
    })

    it('should handle malformed localStorage data', async () => {
      mockStorageService.loadSettings.mockResolvedValue({})
      vi.mocked(window.localStorage.getItem).mockReturnValue('invalid-json{')

      const result = await service.initialize(mockDependencies)

      // Should still complete successfully
      expect(result.success).toBe(true)
    })
  })

  describe('State Management', () => {
    it('should prevent double initialization', async () => {
      // First initialization
      await service.initialize(mockDependencies)
      
      // Reset mocks
      vi.clearAllMocks()
      
      // Second initialization attempt
      const result = await service.initialize(mockDependencies)

      expect(result.success).toBe(true)
      // Storage should not be called again
      expect(mockStorageService.loadNotes).not.toHaveBeenCalled()
      expect(mockDependencies.setLoading).not.toHaveBeenCalled()
    })

    it('should reset state correctly', async () => {
      await service.initialize(mockDependencies)
      
      service.reset()
      expect(service.getInitializationState()).toBe(false)
      
      // Should be able to initialize again
      vi.clearAllMocks()
      const result = await service.initialize(mockDependencies)
      
      expect(result.success).toBe(true)
      expect(mockStorageService.loadNotes).toHaveBeenCalled()
    })

    it('should track initialization state', () => {
      expect(service.getInitializationState()).toBe(false)
    })
  })

  describe('Environment-Specific Behavior', () => {
    it('should skip diagnostics in production', async () => {
      process.env.NODE_ENV = 'production'
      
      await service.initialize(mockDependencies)
      
      // In production, diagnostics should be skipped (no imports)
      expect(mockDependencies.setNotes).toHaveBeenCalled()
    })

    it('should run diagnostics in development', async () => {
      process.env.NODE_ENV = 'development'
      
      // Mock the dynamic imports
      vi.doMock('../../lib/storageUtils', () => ({
        diagnoseSaveIssues: vi.fn().mockResolvedValue([]),
        checkStorageAvailability: vi.fn().mockReturnValue({ available: true })
      }))
      
      await service.initialize(mockDependencies)
      
      expect(mockDependencies.setNotes).toHaveBeenCalled()
    })
  })

  describe('Service Dependencies', () => {
    it('should call all required dependencies in correct sequence', async () => {
      const callOrder: string[] = []
      
      mockDependencies.setLoading.mockImplementation(() => callOrder.push('setLoading'))
      mockDependencies.setError.mockImplementation(() => callOrder.push('setError'))
      mockInitializeDefaultData.mockImplementation(() => {
        callOrder.push('initializeDefaultData')
        return Promise.resolve()
      })
      mockStorageService.loadNotes.mockImplementation(() => {
        callOrder.push('loadNotes')
        return Promise.resolve([])
      })
      mockDependencies.loadTagColors.mockImplementation(() => {
        callOrder.push('loadTagColors')
        return Promise.resolve()
      })
      mockDependencies.setNotes.mockImplementation(() => callOrder.push('setNotes'))

      await service.initialize(mockDependencies)

      // Verify sequence
      expect(callOrder).toEqual([
        'setLoading',
        'setError',
        'initializeDefaultData',
        'loadNotes',
        'loadTagColors',
        'setNotes',
        'setLoading' // false at the end
      ])
    })
  })
})