import { useEffect, useRef, useCallback } from 'react'

/**
 * Hook for auto-saving with debounce
 * @param {Function} saveFunction - Function to call when saving
 * @param {any} value - Value to save
 * @param {number} delay - Debounce delay in milliseconds (default: 1000)
 * @param {Object} options - Additional options
 */
export const useAutoSave = (
  saveFunction,
  value,
  delay = 1000,
  options = {}
) => {
  const {
    enabled = true,
    immediate = false,
    onSaveStart,
    onSaveComplete,
    onSaveError,
  } = options

  const timeoutRef = useRef(null)
  const previousValueRef = useRef(value)
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

  const performSave = useCallback(async () => {
    if (!saveFunction || isSavingRef.current) return

    try {
      isSavingRef.current = true
      hasUnsavedChangesRef.current = false

      if (onSaveStart) {
        onSaveStart()
      }

      await saveFunction(value)

      if (onSaveComplete) {
        onSaveComplete()
      }
    } catch (error) {
      console.error('Auto-save failed:', error)
      hasUnsavedChangesRef.current = true

      if (onSaveError) {
        onSaveError(error)
      }
    } finally {
      isSavingRef.current = false
    }
  }, [saveFunction, value, onSaveStart, onSaveComplete, onSaveError])

  // Auto-save with debounce
  useEffect(() => {
    if (!enabled || !saveFunction) return

    // Check if value actually changed
    if (previousValueRef.current === value) return

    previousValueRef.current = value
    hasUnsavedChangesRef.current = true

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Save immediately if requested
    if (immediate) {
      performSave()
      return
    }

    // Set up debounced save
    timeoutRef.current = setTimeout(() => {
      performSave()
    }, delay)

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [value, delay, enabled, immediate, performSave])

  // Manual save function
  const saveNow = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    performSave()
  }, [performSave])

  // Force save on page unload
  useEffect(() => {
    const handleBeforeUnload = event => {
      if (hasUnsavedChangesRef.current && enabled) {
        // Try to save synchronously (limited time)
        if (saveFunction) {
          try {
            saveFunction(value)
          } catch (error) {
            console.error('Failed to save on page unload:', error)
          }
        }

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
  }, [enabled, saveFunction, value])

  return {
    saveNow,
    isSaving: isSavingRef.current,
    hasUnsavedChanges: hasUnsavedChangesRef.current,
  }
}

export default useAutoSave
