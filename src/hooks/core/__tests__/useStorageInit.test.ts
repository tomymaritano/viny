import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useStorageInit } from '../useStorageInit'
import { useAppStore } from '../../../stores/newSimpleStore'
import { StorageService } from '../../../services/storage/StorageService'
import { Note } from '../../../types'

// Mock dependencies
vi.mock('../../../stores/newSimpleStore')
vi.mock('../../../services/storage/StorageService')

describe('useStorageInit', () => {
  const mockNote: Note = {
    id: '1',
    title: 'Test Note',
    content: 'Test content',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    notebook: 'test',
    status: 'active' as const,
    tags: ['test'],
    pinned: false
  }

  const mockSetNotes = vi.fn()
  const mockUpdateTagColors = vi.fn()
  const mockNotebooks = [{ name: 'test', color: '#000000', count: 1, isDefault: false }]

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock store
    vi.mocked(useAppStore).mockReturnValue({
      setNotes: mockSetNotes,
      updateTagColors: mockUpdateTagColors,
      notebooks: mockNotebooks
    } as any)
    
    // Mock StorageService
    vi.mocked(StorageService.getInstance).mockReturnValue({
      loadNotes: vi.fn().mockResolvedValue([mockNote]),
      loadTagColors: vi.fn().mockResolvedValue({ test: '#FF0000' }),
      loadNotebooks: vi.fn().mockResolvedValue(mockNotebooks),
      recoverFromBackup: vi.fn().mockResolvedValue({ notes: [mockNote] })
    } as any)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Initialization', () => {
    it('should load notes on mount', async () => {
      const { result } = renderHook(() => useStorageInit())
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      
      expect(StorageService.getInstance().loadNotes).toHaveBeenCalled()
      expect(mockSetNotes).toHaveBeenCalledWith([mockNote])
    })

    it('should load tag colors on mount', async () => {
      const { result } = renderHook(() => useStorageInit())
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      
      expect(StorageService.getInstance().loadTagColors).toHaveBeenCalled()
      expect(mockUpdateTagColors).toHaveBeenCalledWith({ test: '#FF0000' })
    })

    it('should set loading state during initialization', () => {
      const { result } = renderHook(() => useStorageInit())
      
      // Should start loading
      expect(result.current.isLoading).toBe(true)
      expect(result.current.error).toBe(null)
    })

    it('should clear loading state after successful load', async () => {
      const { result } = renderHook(() => useStorageInit())
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      
      expect(result.current.error).toBe(null)
    })
  })

  describe('Error Handling', () => {
    it('should handle notes loading error', async () => {
      const error = new Error('Failed to load notes')
      vi.mocked(StorageService.getInstance().loadNotes).mockRejectedValue(error)
      
      const { result } = renderHook(() => useStorageInit())
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      
      expect(result.current.error).toBe(error)
      expect(mockSetNotes).not.toHaveBeenCalled()
    })

    it('should continue loading tag colors even if notes fail', async () => {
      vi.mocked(StorageService.getInstance().loadNotes).mockRejectedValue(new Error('Failed'))
      
      const { result } = renderHook(() => useStorageInit())
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      
      expect(StorageService.getInstance().loadTagColors).toHaveBeenCalled()
    })

    it('should handle tag colors loading error', async () => {
      vi.mocked(StorageService.getInstance().loadTagColors).mockRejectedValue(new Error('Failed'))
      
      const { result } = renderHook(() => useStorageInit())
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      
      // Should still load notes successfully
      expect(mockSetNotes).toHaveBeenCalledWith([mockNote])
    })

    it('should handle storage corruption', async () => {
      vi.mocked(StorageService.getInstance().loadNotes).mockResolvedValue(null as any)
      
      const { result } = renderHook(() => useStorageInit())
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      
      // Should set empty array for null response
      expect(mockSetNotes).toHaveBeenCalledWith([])
    })
  })

  describe('Recovery', () => {
    it('should attempt recovery on critical error', async () => {
      const criticalError = new Error('QUOTA_EXCEEDED_ERR')
      vi.mocked(StorageService.getInstance().loadNotes).mockRejectedValue(criticalError)
      
      const { result } = renderHook(() => useStorageInit())
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      
      // Should attempt recovery for quota errors
      if (criticalError.message.includes('QUOTA_EXCEEDED')) {
        expect(StorageService.getInstance().recoverFromBackup).toHaveBeenCalled()
      }
    })

    it('should handle recovery failure', async () => {
      vi.mocked(StorageService.getInstance().loadNotes).mockRejectedValue(new Error('Critical'))
      vi.mocked(StorageService.getInstance().recoverFromBackup).mockRejectedValue(new Error('Recovery failed'))
      
      const { result } = renderHook(() => useStorageInit())
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      
      expect(result.current.error).toBeTruthy()
    })
  })

  describe('Data Validation', () => {
    it('should filter out invalid notes', async () => {
      const invalidNotes = [
        mockNote,
        { id: '2' }, // Missing required fields
        null,
        undefined,
        { ...mockNote, id: null } // Invalid id
      ]
      
      vi.mocked(StorageService.getInstance().loadNotes).mockResolvedValue(invalidNotes as any)
      
      const { result } = renderHook(() => useStorageInit())
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      
      // Should only include valid note
      expect(mockSetNotes).toHaveBeenCalledWith([mockNote])
    })

    it('should handle empty notes array', async () => {
      vi.mocked(StorageService.getInstance().loadNotes).mockResolvedValue([])
      
      const { result } = renderHook(() => useStorageInit())
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      
      expect(mockSetNotes).toHaveBeenCalledWith([])
      expect(result.current.error).toBe(null)
    })

    it('should validate tag colors', async () => {
      const invalidTagColors = {
        validTag: '#FF0000',
        invalidTag: 'not-a-color',
        nullTag: null,
        emptyTag: ''
      }
      
      vi.mocked(StorageService.getInstance().loadTagColors).mockResolvedValue(invalidTagColors as any)
      
      const { result } = renderHook(() => useStorageInit())
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      
      // Should only include valid colors
      expect(mockUpdateTagColors).toHaveBeenCalledWith(
        expect.objectContaining({
          validTag: '#FF0000'
        })
      )
    })
  })

  describe('Performance', () => {
    it('should load data in parallel', async () => {
      const loadNotesSpy = vi.mocked(StorageService.getInstance().loadNotes)
      const loadTagColorsSpy = vi.mocked(StorageService.getInstance().loadTagColors)
      
      renderHook(() => useStorageInit())
      
      // Both should be called immediately
      expect(loadNotesSpy).toHaveBeenCalledTimes(1)
      expect(loadTagColorsSpy).toHaveBeenCalledTimes(1)
      
      // Should not wait for one to finish before starting the other
      expect(loadNotesSpy.mock.invocationCallOrder[0]).toBeLessThan(
        loadTagColorsSpy.mock.invocationCallOrder[0] + 2
      )
    })

    it('should not re-initialize on re-render', () => {
      const { rerender } = renderHook(() => useStorageInit())
      
      const initialCalls = vi.mocked(StorageService.getInstance().loadNotes).mock.calls.length
      
      rerender()
      rerender()
      
      // Should not call load functions again
      expect(vi.mocked(StorageService.getInstance().loadNotes)).toHaveBeenCalledTimes(initialCalls)
    })
  })

  describe('Edge Cases', () => {
    it('should handle storage service not available', async () => {
      vi.mocked(StorageService.getInstance).mockReturnValue(undefined as any)
      
      const { result } = renderHook(() => useStorageInit())
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      
      expect(result.current.error).toBeTruthy()
    })

    it('should handle concurrent initialization attempts', async () => {
      // Simulate slow loading
      vi.mocked(StorageService.getInstance().loadNotes).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve([mockNote]), 100))
      )
      
      const { result: result1 } = renderHook(() => useStorageInit())
      const { result: result2 } = renderHook(() => useStorageInit())
      
      // Both should be loading
      expect(result1.current.isLoading).toBe(true)
      expect(result2.current.isLoading).toBe(true)
      
      await waitFor(() => {
        expect(result1.current.isLoading).toBe(false)
        expect(result2.current.isLoading).toBe(false)
      })
      
      // Both should succeed
      expect(result1.current.error).toBe(null)
      expect(result2.current.error).toBe(null)
    })
  })
})