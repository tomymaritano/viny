import { useCallback } from 'react'
import { flushSync } from 'react-dom'
import { useAppStore } from '../stores/newSimpleStore'
import { MarkdownProcessor } from '../lib/markdown'
import { Note } from '../types'
import { generateNoteId } from '../utils/idUtils'
import { getCurrentTimestamp } from '../utils/dateUtils'

import { noteLogger as logger } from '../utils/logger'

/**
 * Hook for all note-related actions (CRUD operations)
 * Separated from main logic for better testability and organization
 */
export const useNoteActions = () => {
  const {
    activeSection,
    notes,
    addNote,
    updateNote,
    removeNote,
    setCurrentNote,
    setSelectedNoteId,
    setIsEditorOpen,
    addToast,
    showSuccess,
    showError,
    createNoteFromTemplate
  } = useAppStore()

  /**
   * Creates a new note with context-aware properties
   */
  const createNewNote = useCallback(() => {
    // Determine properties based on current context
    const isPinned = activeSection === 'pinned'
    const status = activeSection.startsWith('status-') 
      ? activeSection.replace('status-', '') as Note['status'] 
      : 'draft'
    const notebook = activeSection.startsWith('notebook-') 
      ? activeSection.replace('notebook-', '') 
      : 'personal'
    
    const newNote: Note = {
      id: generateNoteId(),
      title: 'Untitled Note',
      content: '',
      notebook,
      tags: [],
      status,
      isPinned,
      isTrashed: false,
      createdAt: getCurrentTimestamp(),
      updatedAt: getCurrentTimestamp()
    }

    logger.debug('Creating new note with ID:', newNote.id)
    
    // Add note via store (automatically persists via repository)
    addNote(newNote)
    setCurrentNote(newNote)
    setSelectedNoteId(newNote.id)
    setIsEditorOpen(true)

    return newNote
  }, [activeSection, addNote, setCurrentNote, setSelectedNoteId, setIsEditorOpen, showSuccess, showError])

  /**
   * Creates a note from a template
   */
  const createNoteFromTemplateAction = useCallback((templateId: string) => {
    try {
      const newNote = createNoteFromTemplate(templateId)
      if (newNote) {
        setCurrentNote(newNote)
        setSelectedNoteId(newNote.id)
        setIsEditorOpen(true)
        addNote(newNote)
        showSuccess('Note created from template')
        return newNote
      } else {
        showError('Failed to create note from template')
      }
    } catch (error) {
      logger.error('Error creating note from template:', error)
      showError('Failed to create note from template')
    }
    return null
  }, [createNoteFromTemplate, setCurrentNote, setSelectedNoteId, setIsEditorOpen, addNote, showSuccess, showError])

  /**
   * Saves a note with automatic title extraction and tag management
   */
  const handleSaveNote = useCallback(async (note: Note) => {
    try {
      logger.debug('Starting save for note:', note.title, 'ID:', note.id)
      
      // Use the provided title, or extract from content if not provided or empty
      const title = note.title && note.title.trim() 
        ? note.title 
        : MarkdownProcessor.extractTitle(note.content) || 'Untitled Note'
      
      // Keep existing tags (manual tag management)
      const existingTags = note.tags || []
      
      const updatedNote = {
        ...note,
        title,
        tags: existingTags,
        updatedAt: getCurrentTimestamp()
      }

      logger.debug('Prepared note for saving:', {
        id: updatedNote.id,
        title: updatedNote.title,
        contentLength: updatedNote.content.length,
        updatedAt: updatedNote.updatedAt
      })

      // Update note via store (automatically persists via repository)
      updateNote(updatedNote)
      logger.debug('Note updated via store')
      
      logger.info('Successfully saved note:', updatedNote.title)
      return updatedNote
    } catch (error) {
      logger.error('Error saving note:', error)
      showError('Failed to save note: ' + (error as Error).message)
      throw error // Re-throw so auto-save can handle it
    }
  }, [updateNote, showSuccess, showError])

  /**
   * Moves a note to trash
   */
  const handleDeleteNote = useCallback(async (note: Note) => {
    console.log('handleDeleteNote called with note:', note.id, note.title)
    const trashedNote = {
      ...note,
      isTrashed: true,
      trashedAt: getCurrentTimestamp(),
    }
    console.log('Updating note to trashed:', trashedNote.id, trashedNote.isTrashed)
    
    try {
      // Update the note in the store first and force synchronous re-render
      flushSync(() => {
        updateNote(trashedNote)
      })
      
      // Note is automatically persisted via store's updateNote method
      
      showSuccess('Note moved to trash')
      console.log('Note moved to trash successfully:', trashedNote.id)
    } catch (error) {
      logger.error('Error deleting note:', error)
      showError('Failed to delete note')
      throw error // Re-throw so callers can handle the error
    }
  }, [updateNote, showSuccess, showError])

  /**
   * Toggles note pin status
   */
  const handleTogglePin = useCallback(async (note: Note) => {
    const updatedNote = {
      ...note,
      isPinned: !note.isPinned,
      updatedAt: getCurrentTimestamp(),
    }
    
    try {
      // Update store first
      flushSync(() => {
        updateNote(updatedNote)
      })
      
      // Note is automatically persisted via store's updateNote method
      
      showSuccess(updatedNote.isPinned ? 'Note pinned' : 'Note unpinned')
    } catch (error) {
      logger.error('Error updating note:', error)
      showError('Failed to update note')
      throw error
    }
  }, [updateNote, showSuccess, showError])

  /**
   * Duplicates a note
   */
  const handleDuplicateNote = useCallback(async (note: Note) => {
    const duplicatedNote: Note = {
      ...note,
      id: generateNoteId(),
      title: `${note.title} (Copy)`,
      createdAt: getCurrentTimestamp(),
      updatedAt: getCurrentTimestamp(),
      isPinned: false
    }

    try {
      // Add to store first
      flushSync(() => {
        addNote(duplicatedNote)
      })
      
      // Note is automatically persisted via store's addNote method
      
      showSuccess('Note duplicated successfully')
      return duplicatedNote
    } catch (error) {
      logger.error('Error duplicating note:', error)
      showError('Failed to duplicate note')
      throw error
    }
  }, [addNote, showSuccess, showError])

  /**
   * Permanently deletes all trashed notes
   */
  const handleEmptyTrash = useCallback(async () => {
    logger.group('Empty Trash Operation')
    const trashedNotes = notes.filter(note => note.isTrashed)
    
    logger.debug('Found trashed notes:', trashedNotes.length, trashedNotes.map(n => ({ id: n.id, title: n.title })))
    
    if (trashedNotes.length === 0) {
      logger.info('No trashed notes to delete')
      showSuccess('Trash is already empty')
      logger.groupEnd()
      return
    }
    
    try {
      logger.debug('Starting deletion of', trashedNotes.length, 'notes')
      
      // Delete from storage first, then update UI
      const deletePromises = trashedNotes.map(async (note) => {
        try {
          await removeNote(note.id)
          logger.debug('Deleted via store:', note.id)
          return note.id
        } catch (error) {
          logger.error(`Error deleting note ${note.id} from storage:`, error)
          throw error
        }
      })
      
      // Wait for all storage deletions to complete
      const deletedIds = await Promise.allSettled(deletePromises)
      logger.debug('Storage deletion results:', deletedIds)
      
      // Remove from UI state
      trashedNotes.forEach(note => {
        removeNote(note.id)
        logger.debug('Removed from UI state:', note.id)
      })
      
      const successCount = deletedIds.filter(result => result.status === 'fulfilled').length
      const failureCount = deletedIds.filter(result => result.status === 'rejected').length
      
      if (failureCount > 0) {
        logger.warn(`${failureCount} notes failed to delete from storage`)
        showError(`Deleted ${successCount} notes, but ${failureCount} failed`)
      } else {
        logger.info('All notes deleted successfully')
        showSuccess(`Permanently deleted ${successCount} note(s)`)
      }
      
    } catch (error) {
      logger.error('Error emptying trash:', error)
      showError('Failed to empty trash')
    }
    
    logger.groupEnd()
  }, [notes, removeNote, showSuccess, showError])

  /**
   * Restores a note from trash
   */
  const handleRestoreNote = useCallback(async (note: Note) => {
    const restoredNote = {
      ...note,
      isTrashed: false,
      trashedAt: undefined,
      updatedAt: getCurrentTimestamp(),
    }
    
    try {
      // Update store first
      flushSync(() => {
        updateNote(restoredNote)
      })
      
      // Note is automatically persisted via store's updateNote method
      
      showSuccess('Note restored')
    } catch (error) {
      logger.error('Error restoring note:', error)
      showError('Failed to restore note')
      throw error
    }
  }, [updateNote, showSuccess, showError])

  /**
   * Permanently deletes a note
   */
  const handlePermanentDelete = useCallback(async (note: Note) => {
    try {
      // Remove note via store (automatically deletes via repository)
      await removeNote(note.id)
      
      showSuccess('Note permanently deleted')
    } catch (error) {
      logger.error('Error permanently deleting note:', error)
      showError('Failed to delete note permanently')
    }
  }, [removeNote, showSuccess, showError])

  /**
   * Removes a tag from all notes
   */
  const handleRemoveTag = useCallback((tagName: string) => {
    const notesWithTag = notes.filter(note => note.tags?.includes(tagName))
    
    try {
      // Remove tag from all notes that have it
      notesWithTag.forEach(note => {
        const updatedNote = {
          ...note,
          tags: note.tags?.filter(tag => tag !== tagName) || [],
          updatedAt: getCurrentTimestamp(),
        }
        updateNote(updatedNote)
        
        // Note is automatically persisted via store's updateNote method
      })
      
      showSuccess(`Removed tag "${tagName}" from ${notesWithTag.length} note(s)`)
    } catch (error) {
      logger.error('Error removing tag:', error)
      showError('Failed to remove tag')
    }
  }, [notes, updateNote, addToast])

  return {
    createNewNote,
    createNoteFromTemplate: createNoteFromTemplateAction,
    handleSaveNote,
    handleDeleteNote,
    handleTogglePin,
    handleDuplicateNote,
    handleEmptyTrash,
    handleRestoreNote,
    handlePermanentDelete,
    handleRemoveTag
  }
}