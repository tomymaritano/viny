/**
 * Custom hook for managing page lifecycle events (unload, visibility changes)
 */
import { useEffect, useRef } from 'react'
import type { Note } from '../types'

interface UsePageLifecycleProps {
  currentNote: Note | null
}

export const usePageLifecycle = ({ currentNote }: UsePageLifecycleProps) => {
  // Use ref to access current value without requiring effect re-run
  const currentNoteRef = useRef(currentNote)

  // Update ref when currentNote changes
  useEffect(() => {
    currentNoteRef.current = currentNote
  }, [currentNote])

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Repository pattern handles auto-save, no manual flush needed

      // If there are unsaved changes, warn the user
      if (currentNoteRef.current) {
        e.preventDefault()
        const message =
          'You have unsaved changes. Are you sure you want to leave?'
        e.returnValue = message
        return message
      }
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // Repository pattern handles auto-save, no manual flush needed
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      // Repository pattern handles cleanup automatically
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, []) // Empty dependency array is correct since we use ref for currentNote
}
