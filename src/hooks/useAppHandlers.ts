/**
 * Custom hook for app-level event handlers
 */
import { useCallback } from 'react'
import { useAppStore } from '../stores/newSimpleStore'
import { noteLogger as logger } from '../utils/logger'

interface Note {
  id: string
  title?: string
  content?: string
  updatedAt?: string
  notebook?: string
}

interface UseAppHandlersProps {
  filteredNotes: Note[]
  onSaveNote: (note: Note) => Promise<void>
  debouncedAutoSave: (note: Note) => void
}

export const useAppHandlers = ({
  filteredNotes,
  onSaveNote,
  debouncedAutoSave
}: UseAppHandlersProps) => {
  const {
    notes,
    setCurrentNote,
    setSelectedNoteId,
    setIsEditorOpen
  } = useAppStore()

  const handleOpenNote = useCallback((noteId: string) => {
    const note = notes.find(n => n.id === noteId)
    if (note) {
      setCurrentNote(note)
      setSelectedNoteId(noteId)
      setIsEditorOpen(true)
    } else {
      console.error('Note not found:', noteId)
    }
  }, [notes, setCurrentNote, setSelectedNoteId, setIsEditorOpen])

  const handleContentChange = useCallback((newContent: string) => {
    // Get the latest currentNote from the store to avoid stale closure issues
    const latestCurrentNote = useAppStore.getState().currentNote
    
    if (latestCurrentNote) {
      const updatedNote = { 
        ...latestCurrentNote, 
        content: newContent,
        updatedAt: new Date().toISOString()
      }
      logger.debug('Content change - updating note', { title: updatedNote.title, id: updatedNote.id })
      setCurrentNote(updatedNote)
      // Trigger debounced auto-save
      debouncedAutoSave(updatedNote)
    } else {
      logger.warn('Content change failed - no current note found in store')
    }
  }, [setCurrentNote, debouncedAutoSave])

  const handleNotebookChange = useCallback((notebook: string) => {
    // Get the latest currentNote from the store to avoid stale closure issues
    const latestCurrentNote = useAppStore.getState().currentNote
    
    if (latestCurrentNote) {
      const updatedNote = { ...latestCurrentNote, notebook }
      logger.debug('Notebook change - updating note', { title: updatedNote.title, id: updatedNote.id })
      setCurrentNote(updatedNote)
      onSaveNote(updatedNote)
    } else {
      logger.warn('Notebook change failed - no current note found in store')
    }
  }, [setCurrentNote, onSaveNote])

  // Handler for metadata changes (immediate save, no auto-save)
  const handleMetadataChange = useCallback(async (updatedNote: Note) => {
    try {
      logger.debug('Metadata change - saving metadata', { title: updatedNote.title })
      setCurrentNote(updatedNote)
      await onSaveNote(updatedNote)
    } catch (error) {
      logger.error('Failed to save metadata', { error })
    }
  }, [onSaveNote, setCurrentNote])

  return {
    handleOpenNote,
    handleContentChange,
    handleNotebookChange,
    handleMetadataChange
  }
}
