/**
 * Custom hook for app-level event handlers
 */
import { useCallback } from 'react'
import { useSimpleStore } from '../stores/simpleStore'

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
    setCurrentNote,
    setSelectedNoteId,
    setIsEditorOpen
  } = useSimpleStore()

  const handleOpenNote = useCallback((noteId: string) => {
    const note = filteredNotes.find(n => n.id === noteId)
    if (note) {
      setCurrentNote(note)
      setSelectedNoteId(noteId)
      setIsEditorOpen(true)
    }
  }, [filteredNotes, setCurrentNote, setSelectedNoteId, setIsEditorOpen])

  const handleContentChange = useCallback((newContent: string) => {
    // Get the latest currentNote from the store to avoid stale closure issues
    const latestCurrentNote = useSimpleStore.getState().currentNote
    
    if (latestCurrentNote) {
      const updatedNote = { 
        ...latestCurrentNote, 
        content: newContent,
        updatedAt: new Date().toISOString()
      }
      console.log('[ContentChange] Updating note:', updatedNote.title, 'ID:', updatedNote.id)
      setCurrentNote(updatedNote)
      // Trigger debounced auto-save
      debouncedAutoSave(updatedNote)
    } else {
      console.warn('[ContentChange] No current note found in store!')
    }
  }, [setCurrentNote, debouncedAutoSave])

  const handleNotebookChange = useCallback((notebook: string) => {
    // Get the latest currentNote from the store to avoid stale closure issues
    const latestCurrentNote = useSimpleStore.getState().currentNote
    
    if (latestCurrentNote) {
      const updatedNote = { ...latestCurrentNote, notebook }
      console.log('[NotebookChange] Updating note:', updatedNote.title, 'ID:', updatedNote.id)
      setCurrentNote(updatedNote)
      onSaveNote(updatedNote)
    } else {
      console.warn('[NotebookChange] No current note found in store!')
    }
  }, [setCurrentNote, onSaveNote])

  // Handler for metadata changes (immediate save, no auto-save)
  const handleMetadataChange = useCallback(async (updatedNote: Note) => {
    try {
      console.log('[MetadataChange] Saving metadata for:', updatedNote.title)
      setCurrentNote(updatedNote)
      await onSaveNote(updatedNote)
    } catch (error) {
      console.error('[MetadataChange] Failed to save metadata:', error)
    }
  }, [onSaveNote, setCurrentNote])

  return {
    handleOpenNote,
    handleContentChange,
    handleNotebookChange,
    handleMetadataChange
  }
}
