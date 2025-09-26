/**
 * TanStack Query hooks using Service Layer
 * This is the correct pattern - separation of concerns
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNoteService } from '../../contexts/ServiceContext'
import { queryKeys } from '../../lib/queryClient'
import type { Note } from '../../types'
import type { CreateNoteDto, UpdateNoteDto, NoteSearchOptions } from '../../services/notes/INoteService'

/**
 * Hook to fetch all active notes using service layer
 */
export const useActiveNotesQuery = () => {
  const noteService = useNoteService()
  
  return useQuery({
    queryKey: queryKeys.notes(),
    queryFn: () => noteService.getActiveNotes(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  })
}

/**
 * Hook to fetch notes in a specific notebook
 */
export const useNotebookNotesQuery = (notebookId: string) => {
  const noteService = useNoteService()
  
  return useQuery({
    queryKey: [...queryKeys.notes(), 'notebook', notebookId],
    queryFn: () => noteService.getNotesInNotebook(notebookId),
    enabled: !!notebookId,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook to search notes
 */
export const useSearchNotesQuery = (options: NoteSearchOptions) => {
  const noteService = useNoteService()
  
  return useQuery({
    queryKey: [...queryKeys.notes(), 'search', options],
    queryFn: () => noteService.searchNotes(options),
    enabled: !!options.query || !!options.notebook || !!options.tags?.length,
    staleTime: 2 * 60 * 1000,
  })
}

/**
 * Mutation to create a new note
 */
export const useCreateNoteMutation = () => {
  const queryClient = useQueryClient()
  const noteService = useNoteService()
  
  return useMutation({
    mutationFn: (data: CreateNoteDto) => noteService.createNote(data),
    onSuccess: (newNote) => {
      // Optimistically add to cache
      queryClient.setQueryData<Note[]>(queryKeys.notes(), (old = []) => [...old, newNote])
      
      // Invalidate to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.notes() })
    },
  })
}

/**
 * Mutation to update a note
 */
export const useUpdateNoteMutation = () => {
  const queryClient = useQueryClient()
  const noteService = useNoteService()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateNoteDto }) => 
      noteService.updateNote(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: queryKeys.notes() })
      
      // Snapshot previous value
      const previousNotes = queryClient.getQueryData<Note[]>(queryKeys.notes())
      
      // Optimistically update
      if (previousNotes) {
        queryClient.setQueryData<Note[]>(
          queryKeys.notes(),
          previousNotes.map(note => 
            note.id === id ? { ...note, ...data } : note
          )
        )
      }
      
      return { previousNotes }
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousNotes) {
        queryClient.setQueryData(queryKeys.notes(), context.previousNotes)
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: queryKeys.notes() })
    },
  })
}

/**
 * Mutation to toggle pin status
 */
export const useTogglePinServiceMutation = () => {
  const queryClient = useQueryClient()
  const noteService = useNoteService()
  
  return useMutation({
    mutationFn: (noteId: string) => noteService.togglePin(noteId),
    onSuccess: (updatedNote) => {
      // Update specific note in cache
      queryClient.setQueryData<Note[]>(
        queryKeys.notes(),
        (old = []) => old.map(note => 
          note.id === updatedNote.id ? updatedNote : note
        )
      )
    },
  })
}

/**
 * Mutation to move note to trash
 */
export const useMoveToTrashMutation = () => {
  const queryClient = useQueryClient()
  const noteService = useNoteService()
  
  return useMutation({
    mutationFn: (noteId: string) => noteService.moveToTrash(noteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notes() })
    },
  })
}

/**
 * Mutation to empty trash
 */
export const useEmptyTrashServiceMutation = () => {
  const queryClient = useQueryClient()
  const noteService = useNoteService()
  
  return useMutation({
    mutationFn: () => noteService.emptyTrash(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notes() })
    },
  })
}

/**
 * Hook to get note statistics
 */
export const useNoteStatisticsQuery = () => {
  const noteService = useNoteService()
  
  return useQuery({
    queryKey: [...queryKeys.notes(), 'statistics'],
    queryFn: () => noteService.getStatistics(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}