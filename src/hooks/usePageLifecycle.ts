/**
 * Custom hook for managing page lifecycle events (unload, visibility changes)
 */
import { useEffect, useRef } from 'react'
import { storageService } from '../lib/storage'
import { Note } from '../types'

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
      storageService.flushPendingSaves()
      
      // If there are unsaved changes, warn the user
      if (currentNoteRef.current) {
        e.preventDefault()
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?'
        return e.returnValue
      }
    }
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        storageService.flushPendingSaves()
      }
    }
    
    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      storageService.flushPendingSaves()
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, []) // Empty dependency array is correct since we use ref for currentNote
}
