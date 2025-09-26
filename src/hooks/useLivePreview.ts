import { useState, useCallback, useEffect, useRef } from 'react'
import { useAppStore } from '../stores/newSimpleStore'

interface LivePreviewOptions {
  previewDelay?: number
  resetDelay?: number
  autoRevert?: boolean
}

interface PreviewState<T> {
  isPreviewActive: boolean
  previewValues: Partial<T>
  originalValues: Partial<T>
}

interface UseLivePreviewReturn<T> {
  // State
  isPreviewActive: boolean
  previewValues: Partial<T>
  originalValues: Partial<T>

  // Actions
  startPreview: (key: keyof T, value: T[keyof T]) => void
  applyPreview: () => void
  revertPreview: () => void
  cancelPreview: () => void
  updatePreviewValue: (key: keyof T, value: T[keyof T]) => void
  extendPreview: () => void

  // Utilities
  getEffectiveValue: (key: keyof T) => T[keyof T]
  isKeyModified: (key: keyof T) => boolean
  getPreviewStatus: () => {
    isActive: boolean
    modifiedCount: number
    modifiedKeys: string[]
    hasChanges: boolean
  }
}

/**
 * Hook for implementing live preview of settings changes
 * Allows users to see changes in real-time before applying them
 */
export function useLivePreview<T extends Record<string, any>>(
  settingsKeys: (keyof T)[],
  options: LivePreviewOptions = {}
): UseLivePreviewReturn<T> {
  const { settings, updateSettings } = useAppStore()
  const { previewDelay = 100, resetDelay = 3000, autoRevert = true } = options

  const [previewState, setPreviewState] = useState<PreviewState<T>>({
    isPreviewActive: false,
    previewValues: {},
    originalValues: {},
  })

  const previewTimer = useRef<number | null>(null)
  const revertTimer = useRef<number | null>(null)

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      if (previewTimer.current) clearTimeout(previewTimer.current)
      if (revertTimer.current) clearTimeout(revertTimer.current)
    }
  }, [])

  // Start live preview for a setting
  const startPreview = useCallback(
    (key: keyof T, value: T[keyof T]) => {
      // Clear existing timers
      if (previewTimer.current) clearTimeout(previewTimer.current)
      if (revertTimer.current) clearTimeout(revertTimer.current)

      // Store original value if not already in preview mode
      setPreviewState(prev => {
        const isFirstPreview = !prev.isPreviewActive
        const newOriginalValues = isFirstPreview
          ? {
              ...prev.originalValues,
              [key]: settings[key as keyof typeof settings],
            }
          : prev.originalValues

        return {
          isPreviewActive: true,
          previewValues: { ...prev.previewValues, [key]: value },
          originalValues: newOriginalValues,
        }
      })

      // Apply preview change after delay
      previewTimer.current = window.setTimeout(() => {
        updateSettings({ [key]: value } as Partial<T>)

        // Set auto-revert timer if enabled
        if (autoRevert) {
          revertTimer.current = window.setTimeout(() => {
            revertPreview()
          }, resetDelay)
        }
      }, previewDelay)
    },
    [settings, updateSettings, previewDelay, resetDelay, autoRevert]
  )

  // Apply all preview changes permanently
  const applyPreview = useCallback(() => {
    if (!previewState.isPreviewActive) return

    // Clear timers
    if (previewTimer.current) clearTimeout(previewTimer.current)
    if (revertTimer.current) clearTimeout(revertTimer.current)

    // Apply all preview values
    updateSettings(previewState.previewValues as Partial<T>)

    // Reset preview state
    setPreviewState({
      isPreviewActive: false,
      previewValues: {},
      originalValues: {},
    })
  }, [previewState, updateSettings])

  // Revert all changes to original values
  const revertPreview = useCallback(() => {
    if (!previewState.isPreviewActive) return

    // Clear timers
    if (previewTimer.current) clearTimeout(previewTimer.current)
    if (revertTimer.current) clearTimeout(revertTimer.current)

    // Revert to original values
    updateSettings(previewState.originalValues as Partial<T>)

    // Reset preview state
    setPreviewState({
      isPreviewActive: false,
      previewValues: {},
      originalValues: {},
    })
  }, [previewState, updateSettings])

  // Cancel preview without applying changes
  const cancelPreview = useCallback(() => {
    revertPreview()
  }, [revertPreview])

  // Update a preview value without applying it immediately
  const updatePreviewValue = useCallback((key: keyof T, value: T[keyof T]) => {
    setPreviewState(prev => ({
      ...prev,
      previewValues: { ...prev.previewValues, [key]: value },
    }))
  }, [])

  // Get the current effective value (preview or actual)
  const getEffectiveValue = useCallback(
    (key: keyof T): T[keyof T] => {
      if (previewState.isPreviewActive && key in previewState.previewValues) {
        return previewState.previewValues[key] as T[keyof T]
      }
      return settings[key as keyof typeof settings] as T[keyof T]
    },
    [previewState, settings]
  )

  // Check if a specific key has been modified in preview
  const isKeyModified = useCallback(
    (key: keyof T) => {
      return previewState.isPreviewActive && key in previewState.previewValues
    },
    [previewState]
  )

  // Get preview status for UI feedback
  const getPreviewStatus = useCallback(() => {
    const modifiedKeys = Object.keys(previewState.previewValues)
    return {
      isActive: previewState.isPreviewActive,
      modifiedCount: modifiedKeys.length,
      modifiedKeys,
      hasChanges: modifiedKeys.length > 0,
    }
  }, [previewState])

  // Reset auto-revert timer (extends preview time)
  const extendPreview = useCallback(() => {
    if (revertTimer.current) {
      clearTimeout(revertTimer.current)
      revertTimer.current = window.setTimeout(() => {
        revertPreview()
      }, resetDelay)
    }
  }, [revertPreview, resetDelay])

  return {
    // State
    isPreviewActive: previewState.isPreviewActive,
    previewValues: previewState.previewValues,
    originalValues: previewState.originalValues,

    // Actions
    startPreview,
    applyPreview,
    revertPreview,
    cancelPreview,
    updatePreviewValue,
    extendPreview,

    // Utilities
    getEffectiveValue,
    isKeyModified,
    getPreviewStatus,
  }
}
