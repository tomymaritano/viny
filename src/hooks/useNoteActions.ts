import { useCallback } from 'react'
import { useAppStore } from '../stores/newSimpleStore'
import { storageService } from '../lib/storage'
import MarkdownProcessor from '../lib/markdown'
import { Note } from '../types'

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
      id: Date.now().toString(),
      title: 'Untitled Note',
      content: '',
      notebook,
      tags: [],
      status,
      isPinned,
      isTrashed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    logger.debug('Creating new note with ID:', newNote.id)
    
    addNote(newNote)
    setCurrentNote(newNote)
    setSelectedNoteId(newNote.id)
    setIsEditorOpen(true)

    try {
      storageService.saveNote(newNote)
    } catch (error) {
      logger.error('Error saving new note:', error)
      addToast({ type: 'error', message: 'Failed to save note' })
    }

    return newNote
  }, [activeSection, addNote, setCurrentNote, setSelectedNoteId, setIsEditorOpen, addToast])

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
        addToast({ type: 'success', message: 'Note created from template' })
        return newNote
      } else {
        addToast({ type: 'error', message: 'Failed to create note from template' })
      }
    } catch (error) {
      logger.error('Error creating note from template:', error)
      addToast({ type: 'error', message: 'Failed to create note from template' })
    }
    return null
  }, [createNoteFromTemplate, setCurrentNote, setSelectedNoteId, setIsEditorOpen, addNote, addToast])

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
        updatedAt: new Date().toISOString()
      }

      logger.debug('Prepared note for saving:', {
        id: updatedNote.id,
        title: updatedNote.title,
        contentLength: updatedNote.content.length,
        updatedAt: updatedNote.updatedAt
      })

      // Update in-memory state first
      updateNote(updatedNote)
      logger.debug('Updated in-memory state')
      
      // Then persist to storage
      try {
        storageService.saveNote(updatedNote)
        logger.debug('Storage service saveNote called')
        
        // Force immediate save and wait for completion
        await storageService.flushPendingSaves()
        logger.debug('Pending saves flushed')
        
        // In Electron environment, trust the async save operation
        // Verification happens at the file system level
        const isElectron = typeof window !== 'undefined' && window.electronAPI
        if (!isElectron) {
          // Only verify for localStorage (non-Electron)
          const savedNotes = storageService.getNotes()
          const foundNote = savedNotes.find(n => n.id === updatedNote.id)
          
          if (!foundNote) {
            logger.error('Note not found after save. Notes in storage:', savedNotes.length)
            throw new Error('Save verification failed - note not found')
          }
        }
        
        logger.debug('Note save completed successfully')
      } catch (saveError) {
        logger.error('Storage service error:', saveError)
        throw saveError
      }
      
      logger.info('Successfully saved and verified note:', updatedNote.title)
      return updatedNote
    } catch (error) {
      logger.error('Error saving note:', error)
      addToast({ type: 'error', message: 'Failed to save note: ' + (error as Error).message })
      throw error // Re-throw so auto-save can handle it
    }
  }, [updateNote, addToast])

  /**
   * Moves a note to trash
   */
  const handleDeleteNote = useCallback((note: Note) => {
    const trashedNote = {
      ...note,
      isTrashed: true,
      trashedAt: new Date().toISOString(),
    }
    updateNote(trashedNote)
    
    try {
      storageService.saveNote(trashedNote)
    } catch (error) {
      logger.error('Error deleting note:', error)
      addToast({ type: 'error', message: 'Failed to delete note' })
    }
  }, [updateNote, addToast])

  /**
   * Toggles note pin status
   */
  const handleTogglePin = useCallback((note: Note) => {
    const updatedNote = {
      ...note,
      isPinned: !note.isPinned,
      updatedAt: new Date().toISOString(),
    }
    updateNote(updatedNote)
    
    try {
      storageService.saveNote(updatedNote)
      addToast({ 
        type: 'success', 
        message: updatedNote.isPinned ? 'Note pinned' : 'Note unpinned' 
      })
    } catch (error) {
      logger.error('Error updating note:', error)
      addToast({ type: 'error', message: 'Failed to update note' })
    }
  }, [updateNote, addToast])

  /**
   * Duplicates a note
   */
  const handleDuplicateNote = useCallback((note: Note) => {
    const duplicatedNote: Note = {
      ...note,
      id: Date.now().toString(),
      title: `${note.title} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPinned: false
    }

    addNote(duplicatedNote)
    
    try {
      storageService.saveNote(duplicatedNote)
      addToast({ type: 'success', message: 'Note duplicated successfully' })
    } catch (error) {
      logger.error('Error duplicating note:', error)
      addToast({ type: 'error', message: 'Failed to duplicate note' })
    }

    return duplicatedNote
  }, [addNote, addToast])

  /**
   * Permanently deletes all trashed notes
   */
  const handleEmptyTrash = useCallback(() => {
    const trashedNotes = notes.filter(note => note.isTrashed)
    
    try {
      // Permanently delete all trashed notes
      trashedNotes.forEach(note => {
        removeNote(note.id)
        try {
          storageService.deleteNote(note.id)
        } catch (error) {
          logger.error(`Error deleting note ${note.id} from storage:`, error)
        }
      })
      
      addToast({ 
        type: 'success', 
        message: `Permanently deleted ${trashedNotes.length} note(s)` 
      })
    } catch (error) {
      logger.error('Error emptying trash:', error)
      addToast({ type: 'error', message: 'Failed to empty trash' })
    }
  }, [notes, removeNote, addToast])

  /**
   * Restores a note from trash
   */
  const handleRestoreNote = useCallback((note: Note) => {
    const restoredNote = {
      ...note,
      isTrashed: false,
      trashedAt: undefined,
      updatedAt: new Date().toISOString(),
    }
    updateNote(restoredNote)
    
    try {
      storageService.saveNote(restoredNote)
      addToast({ type: 'success', message: 'Note restored' })
    } catch (error) {
      logger.error('Error restoring note:', error)
      addToast({ type: 'error', message: 'Failed to restore note' })
    }
  }, [updateNote, addToast])

  /**
   * Permanently deletes a note
   */
  const handlePermanentDelete = useCallback((note: Note) => {
    try {
      removeNote(note.id)
      storageService.deleteNote(note.id)
      addToast({ type: 'success', message: 'Note permanently deleted' })
    } catch (error) {
      logger.error('Error permanently deleting note:', error)
      addToast({ type: 'error', message: 'Failed to delete note permanently' })
    }
  }, [removeNote, addToast])

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
          updatedAt: new Date().toISOString(),
        }
        updateNote(updatedNote)
        
        try {
          storageService.saveNote(updatedNote)
        } catch (error) {
          logger.error(`Error updating note ${note.id}:`, error)
        }
      })
      
      addToast({ 
        type: 'success', 
        message: `Removed tag "${tagName}" from ${notesWithTag.length} note(s)` 
      })
    } catch (error) {
      logger.error('Error removing tag:', error)
      addToast({ type: 'error', message: 'Failed to remove tag' })
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