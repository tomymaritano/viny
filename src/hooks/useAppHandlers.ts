/**
 * Custom hook for app-level event handlers
 */
import { useCallback } from 'react'
import { useAppStore } from '../stores/newSimpleStore'
import { noteLogger as logger } from '../utils/logger'
import type { Note } from '../types'
import { getCurrentTimestamp } from '../utils/dateUtils'
import { useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../lib/queryClient'

interface UseAppHandlersProps {
  filteredNotes: Note[]
  onSaveNote: (note: Note) => Promise<void>
  debouncedAutoSave: (note: Note) => void
}

export const useAppHandlers = ({
  filteredNotes,
  onSaveNote,
  debouncedAutoSave,
}: UseAppHandlersProps) => {
  const { notes, setCurrentNote, setSelectedNoteId, setIsEditorOpen } =
    useAppStore()
  const queryClient = useQueryClient()

  const handleOpenNote = useCallback(
    (noteId: string) => {
      const note = notes.find(n => n.id === noteId)
      if (note) {
        setCurrentNote(note)
        setSelectedNoteId(noteId)
        setIsEditorOpen(true)
      } else {
        logger.error('Note not found:', noteId)
      }
    },
    [notes, setCurrentNote, setSelectedNoteId, setIsEditorOpen]
  )

  const handleContentChange = useCallback(
    (newContent: string) => {
      // Get the latest currentNote from the store to avoid stale closure issues
      const latestCurrentNote = useAppStore.getState().currentNote

      if (latestCurrentNote) {
        const updatedNote = {
          ...latestCurrentNote,
          content: newContent,
          updatedAt: getCurrentTimestamp(),
        }
        logger.debug('Content change - updating note', {
          title: updatedNote.title,
          id: updatedNote.id,
        })
        setCurrentNote(updatedNote)
        // Trigger debounced auto-save
        debouncedAutoSave(updatedNote)
      } else {
        logger.warn('Content change failed - no current note found in store')
      }
    },
    [setCurrentNote, debouncedAutoSave]
  )

  const handleNotebookChange = useCallback(
    (notebook: string) => {
      // Get the latest currentNote from the store to avoid stale closure issues
      const latestCurrentNote = useAppStore.getState().currentNote

      logger.info('📝 handleNotebookChange called', {
        newNotebook: notebook,
        currentNote: latestCurrentNote?.title,
        currentNoteId: latestCurrentNote?.id,
        oldNotebook: latestCurrentNote?.notebook
      })

      if (latestCurrentNote) {
        const updatedNote = { ...latestCurrentNote, notebook }
        logger.debug('Notebook change - updating note', {
          title: updatedNote.title,
          id: updatedNote.id,
          oldNotebook: latestCurrentNote.notebook,
          newNotebook: notebook
        })
        setCurrentNote(updatedNote)
        onSaveNote(updatedNote)
      } else {
        logger.warn('Notebook change failed - no current note found in store')
      }
    },
    [setCurrentNote, onSaveNote]
  )

  // Handler for metadata changes (immediate save, no auto-save)
  const handleMetadataChange = useCallback(
    async (updatedNote: Note) => {
      console.log('🔄 handleMetadataChange called with:', {
        noteId: updatedNote.id,
        title: updatedNote.title,
        notebook: updatedNote.notebook,
        status: updatedNote.status,
        tags: updatedNote.tags,
      })
      
      try {
        logger.debug('Metadata change - saving metadata', {
          title: updatedNote.title,
          notebook: updatedNote.notebook,
          status: updatedNote.status,
          tags: updatedNote.tags,
        })
        
        // Update local state first
        setCurrentNote(updatedNote)
        console.log('🔄 Updated currentNote in state')
        
        // Save to database
        console.log('🔄 Calling onSaveNote...')
        await onSaveNote(updatedNote)
        console.log('🔄 onSaveNote completed successfully')
        
        // Since onSaveNote might not be using TanStack Query mutation,
        // we need to manually invalidate queries to ensure UI updates
        await queryClient.invalidateQueries({ queryKey: queryKeys.notes() })
        await queryClient.invalidateQueries({ queryKey: queryKeys.notebooks() })
        console.log('🔄 Queries invalidated')
      } catch (error) {
        console.error('❌ Failed to save metadata:', error)
        logger.error('Failed to save metadata', { error })
      }
    },
    [onSaveNote, setCurrentNote, queryClient]
  )

  return {
    handleOpenNote,
    handleContentChange,
    handleNotebookChange,
    handleMetadataChange,
  }
}
