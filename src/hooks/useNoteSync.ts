/**
 * Hook to sync note changes between windows using Electron IPC
 */
import { useEffect } from 'react'
import { Note } from '../types'
import { useAppStore } from '../stores/newSimpleStore'

export const useNoteSync = (noteId?: string) => {
  const { updateNote: updateStoreNote, notes } = useAppStore()
  
  useEffect(() => {
    if (!window.electronAPI) return
    
    // Listen for note updates from other windows
    const handleNoteUpdate = (updatedNote: Note) => {
      console.log('Received note update from other window:', updatedNote.id)
      
      // Update our local store
      updateStoreNote(updatedNote)
    }
    
    // Listen for note updates
    window.electronAPI.on('note-updated', handleNoteUpdate)
    
    return () => {
      window.electronAPI.removeAllListeners('note-updated')
    }
  }, [updateStoreNote])
  
  // Broadcast note updates to other windows
  const broadcastNoteUpdate = (note: Note) => {
    if (window.electronAPI) {
      // Send to main process to broadcast to other windows
      window.electronAPI.send('broadcast-note-update', note)
    }
  }
  
  // Enhanced updateNote that also broadcasts
  const updateNote = async (note: Note) => {
    // Update local store
    await updateStoreNote(note)
    
    // Broadcast to other windows
    broadcastNoteUpdate(note)
  }
  
  return {
    updateNote,
    broadcastNoteUpdate
  }
}