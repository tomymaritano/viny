import { useEffect, useRef, useCallback } from 'react'
import { Note } from '../types'

interface AutoSaveOptions {
  onSave: (note: Note) => Promise<void>
  debounceMs?: number
  enabled?: boolean
  immediate?: boolean
  onSaveStart?: () => void
  onSaveComplete?: () => void
  onSaveError?: (error: Error) => void
}

/**
 * Hook for auto-saving with debounce
 */
export const useAutoSave = (options: AutoSaveOptions) => {
  const {
    onSave,
    debounceMs = 1000,
    enabled = true,
    immediate = false,
    onSaveStart,
    onSaveComplete,
    onSaveError,
  } = options

  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isSavingRef = useRef(false)
  const hasUnsavedChangesRef = useRef(false)

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const performSave = useCallback(async (note: Note) => {
    if (!onSave || isSavingRef.current) return

    try {
      isSavingRef.current = true
      hasUnsavedChangesRef.current = false

      if (onSaveStart) {
        onSaveStart()
      }

      await onSave(note)

      if (onSaveComplete) {
        onSaveComplete()
      }
    } catch (error) {
      console.error('Auto-save failed:', error)
      hasUnsavedChangesRef.current = true

      if (onSaveError) {
        onSaveError(error as Error)
      }
    } finally {
      isSavingRef.current = false
    }
  }, [onSave, onSaveStart, onSaveComplete, onSaveError])

  // Debounced auto-save function that can be called with a note
  const debouncedAutoSave = useCallback((note: Note) => {
    hasUnsavedChangesRef.current = true

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Save immediately if requested
    if (immediate) {
      performSave(note)
      return
    }

    // Set up debounced save
    timeoutRef.current = setTimeout(() => {
      performSave(note)
    }, debounceMs)
  }, [performSave, immediate, debounceMs])

  // Manual save function
  const saveNow = useCallback((note: Note) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    performSave(note)
  }, [performSave])

  // Force save on page unload
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (hasUnsavedChangesRef.current && enabled) {
        // Show warning
        event.preventDefault()
        event.returnValue =
          'You have unsaved changes. Are you sure you want to leave?'
        return event.returnValue
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [enabled])

  return {
    debouncedAutoSave,
    saveNow,
    isSaving: isSavingRef.current,
    hasUnsavedChanges: hasUnsavedChangesRef.current,
  }
}

export default useAutoSave
