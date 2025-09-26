import { useEffect, useRef, useCallback, useState } from 'react'
import type { Note } from '../types'
import { logger } from '../utils/logger'

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
  const [isSaving, setIsSaving] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const performSave = useCallback(
    async (note: Note) => {
      if (!onSave || isSaving) return

      try {
        setIsSaving(true)
        setHasUnsavedChanges(false)

        if (onSaveStart) {
          onSaveStart()
        }

        await onSave(note)

        if (onSaveComplete) {
          onSaveComplete()
        }
      } catch (error) {
        logger.error('Auto-save failed:', error)
        setHasUnsavedChanges(true)

        if (onSaveError) {
          onSaveError(error as Error)
        }
      } finally {
        setIsSaving(false)
      }
    },
    [onSave, onSaveStart, onSaveComplete, onSaveError, isSaving]
  )

  // Debounced auto-save function that can be called with a note
  const debouncedAutoSave = useCallback(
    (note: Note) => {
      if (!enabled) return

      setHasUnsavedChanges(true)

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
    },
    [performSave, immediate, debounceMs, enabled]
  )

  // Manual save function
  const saveNow = useCallback(
    (note: Note) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      performSave(note)
    },
    [performSave]
  )

  // Force save on page unload
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && enabled) {
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
  }, [enabled, hasUnsavedChanges])

  return {
    debouncedAutoSave,
    saveNow,
    isSaving,
    hasUnsavedChanges,
  }
}
