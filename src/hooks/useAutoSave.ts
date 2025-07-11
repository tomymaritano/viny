/**
 * Custom hook for auto-save functionality
 */
import { useMemo, useRef } from 'react'

interface UseAutoSaveProps {
  onSave: (note: any) => Promise<void>
  debounceMs?: number
}

export const useAutoSave = ({ onSave, debounceMs = 1000 }: UseAutoSaveProps) => {
  // Stable reference to avoid debounce recreation
  const saveNoteRef = useRef(onSave)
  saveNoteRef.current = onSave

  // Debounced auto-save function with stable reference
  const debouncedAutoSave = useMemo(() => {
    let timeoutId: NodeJS.Timeout | null = null
    let lastSaveTime = 0
    
    return (note: any) => {
      const now = Date.now()
      
      // Clear previous timeout
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      
      // Set new timeout for auto-save
      timeoutId = setTimeout(async () => {
        try {
          console.log('[AutoSave] Starting auto-save for note:', note.title, 'ID:', note.id)
          console.log('[AutoSave] Note content length:', note.content?.length || 0)
          
          const startTime = Date.now()
          await saveNoteRef.current(note)
          const endTime = Date.now()
          
          lastSaveTime = endTime
          console.log('[AutoSave] Auto-save completed successfully in', endTime - startTime, 'ms')
        } catch (error) {
          console.error('[AutoSave] Failed to auto-save note:', error)
          // Don't throw here - auto-save failures shouldn't break the UI
        }
      }, debounceMs)
    }
  }, [debounceMs]) // Empty dependency array to prevent recreation

  return {
    debouncedAutoSave
  }
}