/**
 * TanStack Query hooks using Service Layer V2
 * Clean architecture implementation
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNoteService } from '../../contexts/ServiceProviderV2'
import { queryKeys } from '../../lib/queryClient'
import type { Note } from '../../types'
import type { CreateNoteDto, UpdateNoteDto, NoteSearchOptions } from '../../services/notes/INoteService'
import { useToast } from '../useToast'

/**
 * Hook to fetch all active notes
 */
export const useActiveNotesQueryV2 = () => {
  const noteService = useNoteService()
  
  return useQuery({
    queryKey: queryKeys.notes(),
    queryFn: async () => {
      const notes = await noteService.getActiveNotes()
      // Active notes fetched: ${notes.length} notes
      return notes
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  })
}

/**
 * Hook to fetch notes in trash
 */
export const useTrashedNotesQueryV2 = () => {
  const noteService = useNoteService()
  
  return useQuery({
    queryKey: [...queryKeys.notes(), 'trashed'],
    queryFn: () => noteService.getTrashedNotes(),
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook to fetch a single note by ID
 */
export const useSelectedNoteQueryV2 = (noteId: string) => {
  const noteService = useNoteService()
  
  return useQuery({
    queryKey: [...queryKeys.notes(), noteId],
    queryFn: () => noteService.getNote(noteId),
    enabled: !!noteId,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook to fetch notes in a specific notebook
 */
export const useNotebookNotesQueryV2 = (notebookId: string) => {
  const noteService = useNoteService()
  
  return useQuery({
    queryKey: [...queryKeys.notes(), 'notebook', notebookId],
    queryFn: () => noteService.getNotesInNotebook(notebookId),
    enabled: !!notebookId,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook to fetch notes with a specific tag
 */
export const useTaggedNotesQueryV2 = (tag: string) => {
  const noteService = useNoteService()
  
  return useQuery({
    queryKey: [...queryKeys.notes(), 'tag', tag],
    queryFn: () => noteService.getNotesWithTag(tag),
    enabled: !!tag,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook to fetch pinned notes
 */
export const usePinnedNotesQueryV2 = () => {
  const noteService = useNoteService()
  
  return useQuery({
    queryKey: [...queryKeys.notes(), 'pinned'],
    queryFn: () => noteService.getPinnedNotes(),
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook to search notes
 */
export const useSearchNotesQueryV2 = (options: NoteSearchOptions) => {
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
export const useCreateNoteMutationV2 = () => {
  const queryClient = useQueryClient()
  const noteService = useNoteService()
  const { showSuccess, showError } = useToast()
  
  return useMutation({
    mutationFn: (data: CreateNoteDto) => noteService.createNote(data),
    onSuccess: (newNote) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.notes() })
      showSuccess('Note created successfully')
    },
    onError: (error) => {
      showError(`Failed to create note: ${error.message}`)
    }
  })
}

/**
 * Mutation to update a note
 */
export const useUpdateNoteMutationV2 = () => {
  const queryClient = useQueryClient()
  const noteService = useNoteService()
  const { showSuccess, showError } = useToast()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateNoteDto }) => 
      noteService.updateNote(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: queryKeys.notes() })
      
      // Snapshot previous values
      const previousNotes = queryClient.getQueryData<Note[]>(queryKeys.notes())
      
      // Optimistically update
      if (previousNotes) {
        queryClient.setQueryData<Note[]>(
          queryKeys.notes(),
          previousNotes.map(note => 
            note.id === id ? { ...note, ...data, updatedAt: new Date().toISOString() } : note
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
      showError(`Failed to update note: ${err.message}`)
    },
    onSuccess: () => {
      // Background refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.notes() })
    },
  })
}

/**
 * Mutation to toggle pin status
 */
export const useTogglePinMutationV2 = () => {
  const queryClient = useQueryClient()
  const noteService = useNoteService()
  const { showSuccess, showError } = useToast()
  
  return useMutation({
    mutationFn: (noteId: string) => noteService.togglePin(noteId),
    onSuccess: (updatedNote) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: queryKeys.notes() })
      queryClient.invalidateQueries({ queryKey: [...queryKeys.notes(), 'pinned'] })
      
      showSuccess(updatedNote.isPinned ? 'Note pinned' : 'Note unpinned')
    },
    onError: (error) => {
      showError(`Failed to toggle pin: ${error.message}`)
    }
  })
}

/**
 * Mutation to move note to trash
 */
export const useMoveToTrashMutationV2 = () => {
  const queryClient = useQueryClient()
  const noteService = useNoteService()
  const { showSuccess, showError } = useToast()
  
  return useMutation({
    mutationFn: (noteId: string) => noteService.moveToTrash(noteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notes() })
      queryClient.invalidateQueries({ queryKey: [...queryKeys.notes(), 'trashed'] })
      showSuccess('Note moved to trash')
    },
    onError: (error) => {
      showError(`Failed to move to trash: ${error.message}`)
    }
  })
}

/**
 * Mutation to restore note from trash
 */
export const useRestoreNoteMutationV2 = () => {
  const queryClient = useQueryClient()
  const noteService = useNoteService()
  const { showSuccess, showError } = useToast()
  
  return useMutation({
    mutationFn: (noteId: string) => noteService.restoreNote(noteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notes() })
      queryClient.invalidateQueries({ queryKey: [...queryKeys.notes(), 'trashed'] })
      showSuccess('Note restored')
    },
    onError: (error) => {
      showError(`Failed to restore note: ${error.message}`)
    }
  })
}

/**
 * Mutation to permanently delete note
 */
export const useDeleteNotePermanentlyMutationV2 = () => {
  const queryClient = useQueryClient()
  const noteService = useNoteService()
  const { showSuccess, showError } = useToast()
  
  return useMutation({
    mutationFn: (noteId: string) => noteService.deleteNote(noteId, true),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notes() })
      queryClient.invalidateQueries({ queryKey: [...queryKeys.notes(), 'trashed'] })
      showSuccess('Note permanently deleted')
    },
    onError: (error) => {
      showError(`Failed to delete note: ${error.message}`)
    }
  })
}

/**
 * Mutation to empty trash
 */
export const useEmptyTrashMutationV2 = () => {
  const queryClient = useQueryClient()
  const noteService = useNoteService()
  const { showSuccess, showError } = useToast()
  
  return useMutation({
    mutationFn: () => noteService.emptyTrash(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notes() })
      queryClient.invalidateQueries({ queryKey: [...queryKeys.notes(), 'trashed'] })
      showSuccess('Trash emptied')
    },
    onError: (error) => {
      showError(`Failed to empty trash: ${error.message}`)
    }
  })
}

/**
 * Mutation to delete a note (move to trash or permanent)
 */
export const useDeleteNoteMutationV2 = () => {
  const queryClient = useQueryClient()
  const noteService = useNoteService()
  const { showSuccess, showError } = useToast()
  
  return useMutation({
    mutationFn: ({ id, permanent = false }: { id: string; permanent?: boolean }) => 
      noteService.deleteNote(id, permanent),
    onSuccess: (_, { permanent }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notes() })
      queryClient.invalidateQueries({ queryKey: [...queryKeys.notes(), 'trashed'] })
      showSuccess(permanent ? 'Note permanently deleted' : 'Note moved to trash')
    },
    onError: (error) => {
      showError(`Failed to delete note: ${error.message}`)
    }
  })
}

/**
 * Mutation to duplicate a note
 */
export const useDuplicateNoteMutationV2 = () => {
  const queryClient = useQueryClient()
  const noteService = useNoteService()
  const { showSuccess, showError } = useToast()
  
  return useMutation({
    mutationFn: (noteId: string) => noteService.duplicateNote(noteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notes() })
      showSuccess('Note duplicated')
    },
    onError: (error) => {
      showError(`Failed to duplicate note: ${error.message}`)
    }
  })
}

/**
 * Mutation to add tag to note
 */
export const useAddTagMutationV2 = () => {
  const queryClient = useQueryClient()
  const noteService = useNoteService()
  
  return useMutation({
    mutationFn: ({ noteId, tag }: { noteId: string; tag: string }) => 
      noteService.addTag(noteId, tag),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notes() })
    },
  })
}

/**
 * Mutation to remove tag from note
 */
export const useRemoveTagMutationV2 = () => {
  const queryClient = useQueryClient()
  const noteService = useNoteService()
  
  return useMutation({
    mutationFn: ({ noteId, tag }: { noteId: string; tag: string }) => 
      noteService.removeTag(noteId, tag),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notes() })
    },
  })
}

/**
 * Hook to get note statistics
 */
export const useNoteStatisticsQueryV2 = () => {
  const noteService = useNoteService()
  
  return useQuery({
    queryKey: [...queryKeys.notes(), 'statistics'],
    queryFn: () => noteService.getStatistics(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

/**
 * Batch operations
 */
export const useCreateNotesBatchMutationV2 = () => {
  const queryClient = useQueryClient()
  const noteService = useNoteService()
  const { showSuccess, showError } = useToast()
  
  return useMutation({
    mutationFn: (notesData: CreateNoteDto[]) => noteService.createBatch(notesData),
    onSuccess: (notes) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notes() })
      showSuccess(`Created ${notes.length} notes`)
    },
    onError: (error) => {
      showError(`Failed to create notes: ${error.message}`)
    }
  })
}

export const useUpdateNotesBatchMutationV2 = () => {
  const queryClient = useQueryClient()
  const noteService = useNoteService()
  const { showSuccess, showError } = useToast()
  
  return useMutation({
    mutationFn: (updates: Array<{ id: string; data: UpdateNoteDto }>) => 
      noteService.updateBatch(updates),
    onSuccess: (notes) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notes() })
      showSuccess(`Updated ${notes.length} notes`)
    },
    onError: (error) => {
      showError(`Failed to update notes: ${error.message}`)
    }
  })
}

export const useDeleteNotesBatchMutationV2 = () => {
  const queryClient = useQueryClient()
  const noteService = useNoteService()
  const { showSuccess, showError } = useToast()
  
  return useMutation({
    mutationFn: ({ noteIds, permanent = false }: { noteIds: string[]; permanent?: boolean }) => 
      noteService.deleteBatch(noteIds, permanent),
    onSuccess: (_, { noteIds, permanent }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notes() })
      showSuccess(permanent ? `Permanently deleted ${noteIds.length} notes` : `Moved ${noteIds.length} notes to trash`)
    },
    onError: (error) => {
      showError(`Failed to delete notes: ${error.message}`)
    }
  })
}