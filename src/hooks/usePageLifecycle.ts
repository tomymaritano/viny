/**
 * Custom hook for managing page lifecycle events (unload, visibility changes)
 */
import { useEffect } from 'react'
import { storageService } from '../lib/storage'

interface Note {
  id: string
  title?: string
  content?: string
}

interface UsePageLifecycleProps {
  currentNote: Note | null
}

export const usePageLifecycle = ({ currentNote }: UsePageLifecycleProps) => {
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      console.log('[PageLifecycle] Page unloading, flushing pending saves...')
      storageService.flushPendingSaves()
      
      // If there are unsaved changes, warn the user
      if (currentNote) {
        e.preventDefault()
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?'
        return e.returnValue
      }
    }
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        console.log('[PageLifecycle] Page hidden, flushing pending saves...')
        storageService.flushPendingSaves()
      }
    }
    
    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      console.log('[PageLifecycle] Component unmounting, flushing pending saves...')
      storageService.flushPendingSaves()
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, []) // Remove currentNote dependency to prevent constant remounting
}