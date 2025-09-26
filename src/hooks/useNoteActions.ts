import { useCallback } from 'react'
import { useAppStore } from '../stores/newSimpleStore'
import { MarkdownProcessor } from '../lib/markdown'
import type { Note } from '../types'
import { generateNoteId } from '../utils/idUtils'
import { getCurrentTimestamp } from '../utils/dateUtils'
import { noteLogger as logger } from '../utils/logger'
import { embeddingManager } from '../services/ai'
import {
  useSaveNoteMutation,
  useDeleteNoteMutation,
  useTogglePinMutation,
  useEmptyTrashMutation,
  useRemoveTagMutation,
} from './queries'

/**
 * Modern note actions hook using TanStack Query
 * Fully integrated with React Query mutations
 * No direct repository access - all operations through mutations
 */
export const useNoteActions = () => {
  const {
    activeSection,
    setCurrentNote,
    setSelectedNoteId,
    setIsEditorOpen,
    showSuccess,
    showError,
    createNoteFromTemplate,
  } = useAppStore()

  // TanStack Query mutations
  const saveMutation = useSaveNoteMutation()
  const deleteMutation = useDeleteNoteMutation()
  const togglePinMutation = useTogglePinMutation()
  const emptyTrashMutation = useEmptyTrashMutation()
  const removeTagMutation = useRemoveTagMutation()

  // Loading state from mutations
  const loading = 
    saveMutation.isPending ||
    deleteMutation.isPending ||
    togglePinMutation.isPending ||
    emptyTrashMutation.isPending ||
    removeTagMutation.isPending

  // Error state from mutations
  const error = 
    saveMutation.error?.message ||
    deleteMutation.error?.message ||
    togglePinMutation.error?.message ||
    emptyTrashMutation.error?.message ||
    removeTagMutation.error?.message ||
    null

  /**
   * Creates a new note with context-aware properties using TanStack Query
   */
  const createNewNote = useCallback(async (): Promise<Note | null> => {
    // Determine properties based on current context
    const isPinned = activeSection === 'pinned'
    const status = activeSection.startsWith('status-')
      ? (activeSection.replace('status-', '') as Note['status'])
      : 'draft'
    // Extract notebook name from activeSection and find the actual notebook
    let notebook = 'personal'
    if (activeSection.startsWith('notebook-')) {
      const notebookFromSection = activeSection.replace('notebook-', '')
      // Try to find the actual notebook to get the correct case
      const notebooks = useAppStore.getState().notebooks
      const actualNotebook = notebooks.find(
        nb => nb.name.toLowerCase() === notebookFromSection.toLowerCase()
      )
      notebook = actualNotebook ? actualNotebook.name : notebookFromSection
    }

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
      updatedAt: getCurrentTimestamp(),
    }

    logger.debug('Creating new note with ID:', newNote.id)

    try {
      // Validate note data before saving
      if (!newNote.title.trim()) {
        throw new Error('Note title cannot be empty')
      }

      const savedNote = await saveMutation.mutateAsync(newNote)
      logger.debug('Note saved via mutation:', savedNote)

      setCurrentNote(savedNote)
      setSelectedNoteId(savedNote.id)
      setIsEditorOpen(true)
      showSuccess('Note created successfully')

      // Generate embeddings asynchronously for new note
      // TEMPORARILY DISABLED - Causing performance issues
      // embeddingManager.generateEmbeddingsForNote(savedNote).catch(error => {
      //   logger.error('Failed to generate embeddings for new note:', error)
      // })

      return savedNote
    } catch (error) {
      logger.error('Error creating note:', error)
      return null
    }
  }, [
    activeSection,
    saveMutation,
    setCurrentNote,
    setSelectedNoteId,
    setIsEditorOpen,
    showSuccess,
  ])

  /**
   * Creates a new note in a specific notebook using TanStack Query
   */
  const createNoteInNotebook = useCallback(
    async (notebookId: string): Promise<Note | null> => {
      // Frontend validation using modern error utils
      try {
        if (!notebookId || !notebookId.trim()) {
          throw new Error('Notebook ID cannot be empty')
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Invalid notebook ID'
        showError(errorMessage)
        throw new Error(errorMessage)
      }

      // Find the actual notebook to get the correct name
      const notebooks = useAppStore.getState().notebooks
      const actualNotebook = notebooks.find(nb => nb.id === notebookId)
      const notebookName = actualNotebook ? actualNotebook.name : notebookId
      
      const newNote: Note = {
        id: generateNoteId(),
        title: 'Untitled Note',
        content: '',
        notebook: notebookName, // Use notebook name, not ID
        tags: [],
        status: 'draft',
        isPinned: false,
        isTrashed: false,
        createdAt: getCurrentTimestamp(),
        updatedAt: getCurrentTimestamp(),
      }

      logger.debug(
        `Creating new note in notebook ${notebookId} with ID:`,
        newNote.id
      )

      try {
        const savedNote = await saveMutation.mutateAsync(newNote)
        logger.debug('Note saved via mutation:', savedNote)

        setCurrentNote(savedNote)
        setSelectedNoteId(savedNote.id)
        setIsEditorOpen(true)
        showSuccess('Note created successfully')

        // Generate embeddings asynchronously for new note
        // TEMPORARILY DISABLED - Causing performance issues
        // embeddingManager.generateEmbeddingsForNote(savedNote).catch(error => {
        //   logger.error('Failed to generate embeddings for new note:', error)
        // })

        return savedNote
      } catch (error) {
        logger.error('Error creating note in notebook:', error)
        return null
      }
    },
    [
      saveMutation,
      setCurrentNote,
      setSelectedNoteId,
      setIsEditorOpen,
      showSuccess,
      showError,
    ]
  )

  /**
   * Creates a note from a template using TanStack Query
   */
  const createNoteFromTemplateAction = useCallback(
    async (templateId: string): Promise<Note | null> => {
      try {
        const newNote = createNoteFromTemplate(templateId)
        if (!newNote) {
          showError('Failed to create note from template')
          return null
        }

        const savedNote = await saveMutation.mutateAsync(newNote)
        logger.debug('Template note saved via mutation:', savedNote)

        setCurrentNote(savedNote)
        setSelectedNoteId(savedNote.id)
        setIsEditorOpen(true)
        showSuccess('Note created from template')

        // Generate embeddings asynchronously for template note
        // TEMPORARILY DISABLED - Causing performance issues
        // embeddingManager.generateEmbeddingsForNote(savedNote).catch(error => {
        //   logger.error(
        //     'Failed to generate embeddings for template note:',
        //     error
        //   )
        // })

        return savedNote
      } catch (error) {
        logger.error('Error creating note from template:', error)
        showError('Failed to create note from template')
      }
      return null
    },
    [
      createNoteFromTemplate,
      saveMutation,
      setCurrentNote,
      setSelectedNoteId,
      setIsEditorOpen,
      showSuccess,
      showError,
    ]
  )

  /**
   * Saves a note with automatic title extraction and validation using TanStack Query
   */
  const handleSaveNote = useCallback(
    async (note: Note): Promise<Note | null> => {
      // Frontend validation before repository operation
      if (!note.content.trim() && !note.title.trim()) {
        const error = 'Cannot save empty note'
        showError(error)
        throw new Error(error)
      }

      // Use the provided title, or extract from content if not provided or empty
      const title =
        note.title && note.title.trim()
          ? note.title
          : MarkdownProcessor.extractTitle(note.content) || 'Untitled Note'

      // Keep existing tags (manual tag management)
      const existingTags = note.tags || []

      const updatedNote = {
        ...note,
        title,
        tags: existingTags,
        updatedAt: getCurrentTimestamp(),
      }

      logger.debug('Prepared note for saving:', {
        id: updatedNote.id,
        title: updatedNote.title,
        notebook: updatedNote.notebook,
        contentLength: updatedNote.content.length,
        updatedAt: updatedNote.updatedAt,
      })

      try {
        const savedNote = await saveMutation.mutateAsync(updatedNote)
        logger.debug('Note saved via mutation:', {
          id: savedNote.id,
          title: savedNote.title,
          notebook: savedNote.notebook
        })
        logger.info('Successfully saved note:', savedNote.title)

        // Generate embeddings asynchronously (don't block the UI)
        // TEMPORARILY DISABLED - Causing performance issues
        // embeddingManager.generateEmbeddingsForNote(savedNote).catch(error => {
        //   logger.error('Failed to generate embeddings for note:', error)
        // })

        return savedNote
      } catch (error) {
        logger.error('Error saving note:', error)
        return null
      }
    },
    [saveMutation, showError]
  )

  /**
   * Moves a note to trash using TanStack Query
   */
  const handleDeleteNote = useCallback(
    async (note: Note): Promise<void> => {
      logger.debug('Moving note to trash:', note.id, note.title)

      // Frontend validation
      if (!note.id) {
        const error = 'Cannot trash note without ID'
        showError(error)
        throw new Error(error)
      }

      try {
        await deleteMutation.mutateAsync(note)
        logger.debug('Note moved to trash via mutation:', note.id)
        showSuccess('Note moved to trash')
      } catch (error) {
        logger.error('Error moving note to trash:', error)
        throw error
      }
    },
    [deleteMutation, showSuccess, showError]
  )

  /**
   * Toggles note pin status using TanStack Query
   */
  const handleTogglePin = useCallback(
    async (note: Note): Promise<void> => {
      // Frontend validation
      if (!note.id) {
        const error = 'Cannot toggle pin for note without ID'
        showError(error)
        throw new Error(error)
      }

      try {
        await togglePinMutation.mutateAsync(note)
        const isPinned = !note.isPinned
        logger.debug('Note pin status updated via mutation:', note.id, isPinned)
        showSuccess(isPinned ? 'Note pinned' : 'Note unpinned')
      } catch (error) {
        logger.error('Error toggling pin:', error)
        throw error
      }
    },
    [togglePinMutation, showSuccess, showError]
  )

  /**
   * Duplicates a note using TanStack Query
   */
  const handleDuplicateNote = useCallback(
    async (note: Note): Promise<Note | null> => {
      // Frontend validation
      if (!note.id || !note.title) {
        const error = 'Cannot duplicate invalid note'
        showError(error)
        throw new Error(error)
      }

      const duplicatedNote: Note = {
        ...note,
        id: generateNoteId(),
        title: `${note.title} (Copy)`,
        createdAt: getCurrentTimestamp(),
        updatedAt: getCurrentTimestamp(),
        isPinned: false,
        isTrashed: false,
      }

      try {
        const savedNote = await saveMutation.mutateAsync(duplicatedNote)
        logger.debug('Duplicated note saved via mutation:', savedNote)
        showSuccess('Note duplicated successfully')
        return savedNote
      } catch (error) {
        logger.error('Error duplicating note:', error)
        return null
      }
    },
    [saveMutation, showSuccess, showError]
  )

  /**
   * Permanently deletes all trashed notes using TanStack Query
   */
  const handleEmptyTrash = useCallback(async (): Promise<void> => {
    try {
      await emptyTrashMutation.mutateAsync()
      logger.info('Trash emptied successfully via mutation')
    } catch (error) {
      logger.error('Error emptying trash:', error)
      throw error
    }
  }, [emptyTrashMutation])

  /**
   * Restores a note from trash using TanStack Query
   */
  const handleRestoreNote = useCallback(
    async (note: Note): Promise<void> => {
      // Frontend validation
      if (!note.id) {
        const error = 'Cannot restore note without ID'
        showError(error)
        throw new Error(error)
      }

      if (!note.isTrashed) {
        const error = 'Note is not in trash'
        showError(error)
        throw new Error(error)
      }

      const restoredNote = {
        ...note,
        isTrashed: false,
        trashedAt: undefined,
        updatedAt: getCurrentTimestamp(),
      }

      try {
        await saveMutation.mutateAsync(restoredNote)
        logger.debug('Note restored via mutation:', restoredNote.id)
        showSuccess('Note restored')
      } catch (error) {
        logger.error('Error restoring note:', error)
        throw error
      }
    },
    [saveMutation, showSuccess, showError]
  )

  /**
   * Permanently deletes a note using TanStack Query
   */
  const handlePermanentDelete = useCallback(
    async (note: Note): Promise<void> => {
      // Frontend validation
      if (!note.id) {
        const error = 'Cannot delete note without ID'
        showError(error)
        throw new Error(error)
      }

      try {
        await deleteMutation.mutateAsync({ ...note, permanent: true })
        logger.debug('Note permanently deleted via mutation:', note.id)
        showSuccess('Note permanently deleted')
      } catch (error) {
        logger.error('Error permanently deleting note:', error)
        throw error
      }
    },
    [deleteMutation, showSuccess, showError]
  )

  /**
   * Removes a tag from all notes using TanStack Query
   */
  const handleRemoveTag = useCallback(
    async (tagName: string): Promise<void> => {
      // Frontend validation
      if (!tagName || !tagName.trim()) {
        const error = 'Tag name cannot be empty'
        showError(error)
        throw new Error(error)
      }

      const cleanTagName = tagName.trim()

      try {
        await removeTagMutation.mutateAsync(cleanTagName)
        logger.info(`Successfully removed tag "${cleanTagName}" via mutation`)
      } catch (error) {
        logger.error('Error removing tag:', error)
        throw error
      }
    },
    [removeTagMutation, showError]
  )

  return {
    // State
    loading,
    error,

    // CRUD operations
    createNewNote,
    createNoteInNotebook,
    createNoteFromTemplate: createNoteFromTemplateAction,
    handleSaveNote,
    handleDeleteNote,
    handleTogglePin,
    handleDuplicateNote,
    handleEmptyTrash,
    handleRestoreNote,
    handlePermanentDelete,
    handleRemoveTag,
  }
}