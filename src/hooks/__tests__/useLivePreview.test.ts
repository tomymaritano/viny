import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useLivePreview } from '../useLivePreview'

// Mock the store
const mockUpdateSettings = vi.fn()
const mockSettings = { theme: 'dark', fontSize: 14 }

vi.mock('../../stores/newSimpleStore', () => ({
  useAppStore: () => ({
    settings: mockSettings,
    updateSettings: mockUpdateSettings
  })
}))

describe('useLivePreview', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() =>
      useLivePreview(['theme', 'fontSize'])
    )

    expect(result.current.isPreviewActive).toBe(false)
    expect(result.current.previewValues).toEqual({})
    expect(result.current.originalValues).toEqual({})
  })

  it('should start preview correctly', () => {
    const { result } = renderHook(() =>
      useLivePreview(['theme', 'fontSize'], { previewDelay: 100 })
    )

    act(() => {
      result.current.startPreview('theme', 'light')
    })

    expect(result.current.isPreviewActive).toBe(true)
    expect(result.current.previewValues).toEqual({ theme: 'light' })
    expect(result.current.originalValues).toEqual({ theme: 'dark' })

    // Should not have called updateSettings yet
    expect(mockUpdateSettings).not.toHaveBeenCalled()

    // Fast forward past the delay
    act(() => {
      vi.advanceTimersByTime(150)
    })

    expect(mockUpdateSettings).toHaveBeenCalledWith({ theme: 'light' })
  })

  it('should handle multiple preview changes', () => {
    const { result } = renderHook(() =>
      useLivePreview(['theme', 'fontSize'], { previewDelay: 100 })
    )

    act(() => {
      result.current.startPreview('theme', 'light')
    })

    act(() => {
      result.current.startPreview('fontSize', 16)
    })

    expect(result.current.previewValues).toEqual({ theme: 'light', fontSize: 16 })
    expect(result.current.isPreviewActive).toBe(true)
    expect(result.current.getEffectiveValue('theme')).toBe('light')
    expect(result.current.getEffectiveValue('fontSize')).toBe(16)
  })

  it('should apply preview changes permanently', () => {
    const { result } = renderHook(() =>
      useLivePreview(['theme'], { previewDelay: 100 })
    )

    act(() => {
      result.current.startPreview('theme', 'light')
    })

    act(() => {
      result.current.applyPreview()
    })

    expect(result.current.isPreviewActive).toBe(false)
    expect(result.current.previewValues).toEqual({})
    expect(result.current.originalValues).toEqual({})
    expect(mockUpdateSettings).toHaveBeenCalledWith({ theme: 'light' })
  })

  it('should revert preview changes', () => {
    const { result } = renderHook(() =>
      useLivePreview(['theme'], { previewDelay: 100 })
    )

    act(() => {
      result.current.startPreview('theme', 'light')
    })

    act(() => {
      result.current.revertPreview()
    })

    expect(result.current.isPreviewActive).toBe(false)
    expect(result.current.previewValues).toEqual({})
    expect(result.current.originalValues).toEqual({})
    expect(mockUpdateSettings).toHaveBeenCalledWith({ theme: 'dark' })
  })

  it('should support auto-revert configuration', () => {
    const { result } = renderHook(() =>
      useLivePreview(['theme'], { 
        previewDelay: 50, 
        resetDelay: 200, 
        autoRevert: true 
      })
    )

    act(() => {
      result.current.startPreview('theme', 'light')
    })

    expect(result.current.isPreviewActive).toBe(true)
    
    // Fast forward to apply preview
    act(() => {
      vi.advanceTimersByTime(100)
    })

    expect(mockUpdateSettings).toHaveBeenCalledWith({ theme: 'light' })
    expect(result.current.getEffectiveValue('theme')).toBe('light')
  })

  it('should return effective values correctly', () => {
    const { result } = renderHook(() =>
      useLivePreview(['theme', 'fontSize'])
    )

    expect(result.current.getEffectiveValue('theme')).toBe('dark')
    expect(result.current.getEffectiveValue('fontSize')).toBe(14)

    act(() => {
      result.current.startPreview('theme', 'light')
    })

    expect(result.current.getEffectiveValue('theme')).toBe('light')
    expect(result.current.getEffectiveValue('fontSize')).toBe(14)
  })

  it('should check if key is modified correctly', () => {
    const { result } = renderHook(() =>
      useLivePreview(['theme', 'fontSize'])
    )

    expect(result.current.isKeyModified('theme')).toBe(false)

    act(() => {
      result.current.startPreview('theme', 'light')
    })

    expect(result.current.isKeyModified('theme')).toBe(true)
    expect(result.current.isKeyModified('fontSize')).toBe(false)
  })

  it('should provide correct preview status', () => {
    const { result } = renderHook(() =>
      useLivePreview(['theme', 'fontSize'])
    )

    expect(result.current.getPreviewStatus()).toEqual({
      isActive: false,
      modifiedCount: 0,
      modifiedKeys: [],
      hasChanges: false
    })

    act(() => {
      result.current.startPreview('theme', 'light')
    })

    act(() => {
      result.current.startPreview('fontSize', 16)
    })

    expect(result.current.getPreviewStatus()).toEqual({
      isActive: true,
      modifiedCount: 2,
      modifiedKeys: ['theme', 'fontSize'],
      hasChanges: true
    })
  })

  it('should cancel preview without applying', () => {
    const { result } = renderHook(() =>
      useLivePreview(['theme'])
    )

    act(() => {
      result.current.startPreview('theme', 'light')
    })

    act(() => {
      result.current.cancelPreview()
    })

    expect(result.current.isPreviewActive).toBe(false)
    expect(mockUpdateSettings).toHaveBeenCalledWith({ theme: 'dark' })
  })

  it('should extend preview correctly', () => {
    const { result } = renderHook(() =>
      useLivePreview(['theme'], { 
        previewDelay: 100, 
        resetDelay: 1000, 
        autoRevert: true 
      })
    )

    act(() => {
      result.current.startPreview('theme', 'light')
    })

    // Fast forward past preview delay
    act(() => {
      vi.advanceTimersByTime(150)
    })

    expect(mockUpdateSettings).toHaveBeenCalledWith({ theme: 'light' })

    // Extend the preview - this should reset the revert timer
    act(() => {
      result.current.extendPreview()
    })

    // Fast forward original reset delay - should not revert yet
    act(() => {
      vi.advanceTimersByTime(500)
    })

    expect(result.current.isPreviewActive).toBe(true)

    // Fast forward the rest of the extended delay
    act(() => {
      vi.advanceTimersByTime(600)
    })

    expect(result.current.isPreviewActive).toBe(false)
    expect(mockUpdateSettings).toHaveBeenLastCalledWith({ theme: 'dark' })
  })
})