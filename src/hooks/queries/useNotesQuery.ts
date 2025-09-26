/**
 * TanStack Query hooks for Notes
 * 
 * Provides optimized data fetching and caching for notes
 * with automatic background refetching and synchronization
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys, invalidateNoteQueries } from '../../lib/queryClient'
import { createDocumentRepository } from '../../lib/repositories/RepositoryFactory'
import type { Note } from '../../types'
import { noteLogger as logger } from '../../utils/logger'
import { useAppStore } from '../../stores/newSimpleStore'
import { embeddingManager } from '../../services/ai'

/**
 * Hook to fetch all notes with automatic caching and refetching
 */
export const useNotesQuery = () => {
  return useQuery({
    queryKey: queryKeys.notes(),
    queryFn: async () => {
      logger.debug('Fetching notes via React Query')
      const repository = createDocumentRepository()
      await repository.initialize()
      const notes = await repository.getNotes()
      logger.debug(`Fetched ${notes.length} notes`)
      return notes
    },
    // Keep data fresh for 5 minutes
    staleTime: 5 * 60 * 1000,
    // Refetch on window focus for sync
    refetchOnWindowFocus: true,
  })
}

/**
 * Hook to fetch a single note by ID
 */
export const useNoteQuery = (noteId: string | null) => {
  return useQuery({
    queryKey: queryKeys.note(noteId || ''),
    queryFn: async () => {
      if (!noteId) return null
      logger.debug(`Fetching note ${noteId} via React Query`)
      const repository = createDocumentRepository()
      await repository.initialize()
      return repository.getNote(noteId)
    },
    enabled: !!noteId,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook to search notes with query caching
 */
export const useNotesSearchQuery = (searchQuery: string) => {
  return useQuery({
    queryKey: queryKeys.search(searchQuery),
    queryFn: async () => {
      if (!searchQuery.trim()) return []
      logger.debug(`Searching notes for: ${searchQuery}`)
      const repository = createDocumentRepository()
      await repository.initialize()
      return repository.searchNotes(searchQuery)
    },
    enabled: searchQuery.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes for search results
  })
}

/**
 * Mutation for saving notes with optimistic updates
 */
export const useSaveNoteMutation = () => {
  const queryClient = useQueryClient()
  const { showSuccess, showError } = useAppStore()

  return useMutation({
    mutationFn: async (note: Note) => {
      logger.debug('Saving note via mutation', {
        id: note.id,
        notebook: note.notebook,
        title: note.title
      })
      const repository = createDocumentRepository()
      await repository.initialize()
      const savedNote = await repository.saveNote(note)
      logger.debug('Note saved, returned from repository:', {
        id: savedNote.id,
        notebook: savedNote.notebook,
        title: savedNote.title,
        status: savedNote.status,
        tags: savedNote.tags
      })
      return savedNote
    },
    // Optimistic update
    onMutate: async (newNote) => {
      logger.debug('Optimistic update for note:', {
        id: newNote.id,
        notebook: newNote.notebook,
        title: newNote.title
      })
      
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.notes() })
      await queryClient.cancelQueries({ queryKey: queryKeys.note(newNote.id) })

      // Snapshot the previous values
      const previousNotes = queryClient.getQueryData<Note[]>(queryKeys.notes())
      const previousNote = queryClient.getQueryData<Note>(queryKeys.note(newNote.id))
      
      logger.debug('Previous note in cache:', {
        id: previousNote?.id,
        notebook: previousNote?.notebook,
        title: previousNote?.title,
        status: previousNote?.status,
        exists: !!previousNote
      })

      // Optimistically update the cache
      if (previousNotes) {
        const noteIndex = previousNotes.findIndex(n => n.id === newNote.id)
        if (noteIndex >= 0) {
          const updatedNotes = [...previousNotes]
          updatedNotes[noteIndex] = newNote
          queryClient.setQueryData(queryKeys.notes(), updatedNotes)
        } else {
          queryClient.setQueryData(queryKeys.notes(), [...previousNotes, newNote])
        }
      }

      queryClient.setQueryData(queryKeys.note(newNote.id), newNote)

      // Return context with snapshot
      return { previousNotes, previousNote }
    },
    // On error, rollback
    onError: (err, newNote, context) => {
      logger.error('Failed to save note:', err)
      if (context?.previousNotes) {
        queryClient.setQueryData(queryKeys.notes(), context.previousNotes)
      }
      if (context?.previousNote) {
        queryClient.setQueryData(queryKeys.note(newNote.id), context.previousNote)
      }
      showError('Failed to save note')
    },
    // On success, update cache and refetch
    onSuccess: (savedNote, variables) => {
      logger.info('Note saved successfully:', savedNote.id)
      
      // Update the cache with the actual saved note to ensure consistency
      queryClient.setQueryData(queryKeys.note(savedNote.id), savedNote)
      logger.debug('Updated individual note cache with saved note')
      
      // Update the notes list cache as well
      const previousNotes = queryClient.getQueryData<Note[]>(queryKeys.notes())
      if (previousNotes) {
        const noteIndex = previousNotes.findIndex(n => n.id === savedNote.id)
        if (noteIndex >= 0) {
          const updatedNotes = [...previousNotes]
          updatedNotes[noteIndex] = savedNote
          queryClient.setQueryData(queryKeys.notes(), updatedNotes)
        }
      }
      
      // PRAGMATIC SOLUTION: Sync currentNote with saved data
      const currentNoteId = useAppStore.getState().selectedNoteId
      if (savedNote.id === currentNoteId) {
        // Always update currentNote with the full saved note
        // This ensures metadata (status, notebook, tags) are always in sync
        useAppStore.getState().setCurrentNote(savedNote)
        logger.debug('Synced currentNote with saved note:', {
          id: savedNote.id,
          notebook: savedNote.notebook,
          status: savedNote.status,
          tags: savedNote.tags
        })
      }
      
      // Only show toast for manual saves, not auto-saves
      // Check if this is a significant change (not just auto-save of title)
      const isAutoSave = variables.title === savedNote.title && 
                        variables.content === savedNote.content
      if (!isAutoSave) {
        showSuccess('Note saved')
      }
      
      // Generate embeddings asynchronously
      embeddingManager.generateEmbeddingsForNote(savedNote).catch(error => {
        logger.error('Failed to generate embeddings:', error)
      })
      
      // Invalidate queries to ensure consistency
      invalidateNoteQueries()
    },
  })
}

/**
 * Mutation for deleting notes (soft delete - move to trash)
 */
export const useDeleteNoteMutation = () => {
  const queryClient = useQueryClient()
  const { showSuccess, showError } = useAppStore()

  return useMutation({
    mutationFn: async (note: Note) => {
      logger.debug('Moving note to trash', note.id)
      const repository = createDocumentRepository()
      await repository.initialize()
      
      const trashedNote = {
        ...note,
        isTrashed: true,
        trashedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      
      return repository.saveNote(trashedNote)
    },
    onMutate: async (note) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.notes() })
      
      const previousNotes = queryClient.getQueryData<Note[]>(queryKeys.notes())
      
      if (previousNotes) {
        queryClient.setQueryData(
          queryKeys.notes(),
          previousNotes.map(n => 
            n.id === note.id ? { ...n, isTrashed: true } : n
          )
        )
      }
      
      return { previousNotes }
    },
    onError: (err, note, context) => {
      logger.error('Failed to delete note:', err)
      if (context?.previousNotes) {
        queryClient.setQueryData(queryKeys.notes(), context.previousNotes)
      }
      showError('Failed to delete note')
    },
    onSuccess: () => {
      showSuccess('Note moved to trash')
      invalidateNoteQueries()
    },
  })
}

/**
 * Mutation for toggling note pin status
 */
export const useTogglePinMutation = () => {
  const queryClient = useQueryClient()
  const { showSuccess, showError } = useAppStore()

  return useMutation({
    mutationFn: async (note: Note) => {
      const repository = createDocumentRepository()
      await repository.initialize()
      
      const updatedNote = {
        ...note,
        isPinned: !note.isPinned,
        updatedAt: new Date().toISOString(),
      }
      
      return repository.saveNote(updatedNote)
    },
    onMutate: async (note) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.notes() })
      
      const previousNotes = queryClient.getQueryData<Note[]>(queryKeys.notes())
      
      if (previousNotes) {
        queryClient.setQueryData(
          queryKeys.notes(),
          previousNotes.map(n => 
            n.id === note.id ? { ...n, isPinned: !n.isPinned } : n
          )
        )
      }
      
      return { previousNotes }
    },
    onError: (err, note, context) => {
      logger.error('Failed to toggle pin:', err)
      if (context?.previousNotes) {
        queryClient.setQueryData(queryKeys.notes(), context.previousNotes)
      }
      showError('Failed to toggle pin')
    },
    onSuccess: (updatedNote) => {
      showSuccess(updatedNote.isPinned ? 'Note pinned' : 'Note unpinned')
      invalidateNoteQueries()
    },
  })
}

/**
 * Mutation for emptying trash (permanent delete)
 */
export const useEmptyTrashMutation = () => {
  const queryClient = useQueryClient()
  const { showSuccess, showError } = useAppStore()

  return useMutation({
    mutationFn: async () => {
      const repository = createDocumentRepository()
      await repository.initialize()
      
      const allNotes = await repository.getNotes()
      const trashedNotes = allNotes.filter(note => note.isTrashed)
      
      logger.debug(`Permanently deleting ${trashedNotes.length} notes`)
      
      // Delete all trashed notes
      await Promise.all(
        trashedNotes.map(note => repository.deleteNote(note.id))
      )
      
      return trashedNotes.length
    },
    onSuccess: (deletedCount) => {
      showSuccess(`Permanently deleted ${deletedCount} note(s)`)
      invalidateNoteQueries()
    },
    onError: (error) => {
      logger.error('Failed to empty trash:', error)
      showError('Failed to empty trash')
    },
  })
}