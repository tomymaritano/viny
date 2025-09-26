/**
 * TanStack Query hooks for Notebooks using Service Layer V2
 * Clean architecture implementation
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNotebookService } from '../../contexts/ServiceProviderV2'
import { queryKeys } from '../../lib/queryClient'
import type { Notebook } from '../../types'
import type { CreateNotebookDto, UpdateNotebookDto } from '../../services/notebooks/INotebookService'
import { useToast } from '../useToast'

/**
 * Hook to fetch all notebooks
 */
export const useNotebooksQueryV2 = () => {
  const notebookService = useNotebookService()
  
  return useQuery({
    queryKey: queryKeys.notebooks(),
    queryFn: () => notebookService.getAllNotebooks(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  })
}

/**
 * Hook to fetch notebook tree structure
 */
export const useNotebookTreeQueryV2 = () => {
  const notebookService = useNotebookService()
  
  return useQuery({
    queryKey: [...queryKeys.notebooks(), 'tree'],
    queryFn: () => notebookService.getNotebookTree(),
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook to fetch notebooks with counts
 */
export const useNotebooksWithCountsQueryV2 = () => {
  const notebookService = useNotebookService()
  
  return useQuery({
    queryKey: [...queryKeys.notebooks(), 'withCounts'],
    queryFn: () => notebookService.getAllNotebooksWithCounts(),
    staleTime: 2 * 60 * 1000,
  })
}

/**
 * Hook to fetch a specific notebook
 */
export const useNotebookByIdQueryV2 = (notebookId: string) => {
  const notebookService = useNotebookService()
  
  return useQuery({
    queryKey: [...queryKeys.notebooks(), notebookId],
    queryFn: () => notebookService.getNotebookById(notebookId),
    enabled: !!notebookId,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Mutation to create a new notebook
 */
export const useCreateNotebookMutationV2 = () => {
  const queryClient = useQueryClient()
  const notebookService = useNotebookService()
  const { showSuccess, showError } = useToast()
  
  return useMutation({
    mutationFn: (data: CreateNotebookDto) => notebookService.createNotebook(data),
    onSuccess: (newNotebook) => {
      // Invalidate all notebook queries
      queryClient.invalidateQueries({ queryKey: queryKeys.notebooks() })
      showSuccess(`Notebook "${newNotebook.name}" created`)
    },
    onError: (error) => {
      showError(`Failed to create notebook: ${error.message}`)
    }
  })
}

/**
 * Mutation to update a notebook
 */
export const useUpdateNotebookMutationV2 = () => {
  const queryClient = useQueryClient()
  const notebookService = useNotebookService()
  const { showSuccess, showError } = useToast()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateNotebookDto }) => 
      notebookService.updateNotebook(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: queryKeys.notebooks() })
      
      // Snapshot previous values
      const previousNotebooks = queryClient.getQueryData<Notebook[]>(queryKeys.notebooks())
      
      // Optimistically update
      if (previousNotebooks) {
        queryClient.setQueryData<Notebook[]>(
          queryKeys.notebooks(),
          previousNotebooks.map(notebook => 
            notebook.id === id ? { ...notebook, ...data, updatedAt: new Date().toISOString() } : notebook
          )
        )
      }
      
      return { previousNotebooks }
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousNotebooks) {
        queryClient.setQueryData(queryKeys.notebooks(), context.previousNotebooks)
      }
      showError(`Failed to update notebook: ${err.message}`)
    },
    onSuccess: (updatedNotebook) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notebooks() })
      showSuccess(`Notebook "${updatedNotebook.name}" updated`)
    },
  })
}

/**
 * Mutation to delete a notebook
 */
export const useDeleteNotebookMutationV2 = () => {
  const queryClient = useQueryClient()
  const notebookService = useNotebookService()
  const { showSuccess, showError } = useToast()
  
  return useMutation({
    mutationFn: ({ id, moveNotesToDefault = true }: { id: string; moveNotesToDefault?: boolean }) => 
      notebookService.deleteNotebook(id, moveNotesToDefault),
    onSuccess: (_, { id }) => {
      // Invalidate notebooks and notes queries
      queryClient.invalidateQueries({ queryKey: queryKeys.notebooks() })
      queryClient.invalidateQueries({ queryKey: queryKeys.notes() })
      showSuccess('Notebook deleted')
    },
    onError: (error) => {
      showError(`Failed to delete notebook: ${error.message}`)
    }
  })
}

/**
 * Mutation to move a notebook
 */
export const useMoveNotebookMutationV2 = () => {
  const queryClient = useQueryClient()
  const notebookService = useNotebookService()
  const { showSuccess, showError } = useToast()
  
  return useMutation({
    mutationFn: ({ notebookId, newParentId }: { notebookId: string; newParentId: string | null }) => 
      notebookService.moveNotebook(notebookId, newParentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notebooks() })
      showSuccess('Notebook moved')
    },
    onError: (error) => {
      showError(`Failed to move notebook: ${error.message}`)
    }
  })
}

/**
 * Mutation to duplicate a notebook
 */
export const useDuplicateNotebookMutationV2 = () => {
  const queryClient = useQueryClient()
  const notebookService = useNotebookService()
  const { showSuccess, showError } = useToast()
  
  return useMutation({
    mutationFn: (notebookId: string) => notebookService.duplicateNotebook(notebookId),
    onSuccess: (duplicatedNotebook) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notebooks() })
      showSuccess(`Notebook "${duplicatedNotebook.name}" created`)
    },
    onError: (error) => {
      showError(`Failed to duplicate notebook: ${error.message}`)
    }
  })
}

/**
 * Hook to search notebooks
 */
export const useSearchNotebooksQueryV2 = (query: string) => {
  const notebookService = useNotebookService()
  
  return useQuery({
    queryKey: [...queryKeys.notebooks(), 'search', query],
    queryFn: () => notebookService.searchNotebooks(query),
    enabled: !!query,
    staleTime: 2 * 60 * 1000,
  })
}

/**
 * Hook to get notebook path
 */
export const useNotebookPathQueryV2 = (notebookId: string) => {
  const notebookService = useNotebookService()
  
  return useQuery({
    queryKey: [...queryKeys.notebooks(), 'path', notebookId],
    queryFn: () => notebookService.getNotebookPath(notebookId),
    enabled: !!notebookId,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook to check if a notebook can be deleted
 */
export const useCanDeleteNotebookQueryV2 = (notebookId: string) => {
  const notebookService = useNotebookService()
  
  return useQuery({
    queryKey: [...queryKeys.notebooks(), 'canDelete', notebookId],
    queryFn: () => notebookService.canDeleteNotebook(notebookId),
    enabled: !!notebookId,
    staleTime: 30 * 1000, // 30 seconds
  })
}

/**
 * Hook to check if a notebook can be moved
 */
export const useCanMoveNotebookQueryV2 = (notebookId: string, targetParentId: string | null) => {
  const notebookService = useNotebookService()
  
  return useQuery({
    queryKey: [...queryKeys.notebooks(), 'canMove', notebookId, targetParentId],
    queryFn: () => notebookService.canMoveNotebook(notebookId, targetParentId),
    enabled: !!notebookId,
    staleTime: 30 * 1000,
  })
}