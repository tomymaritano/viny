/**
 * TanStack Query hooks for Notebooks
 * 
 * Provides optimized data fetching and caching for notebooks
 * with automatic background refetching and synchronization
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys, invalidateNotebookQueries } from '../../lib/queryClient'
import { createDocumentRepository } from '../../lib/repositories/RepositoryFactory'
import type { Notebook } from '../../types'
import { notebookLogger as logger } from '../../utils/logger'
import { useAppStore } from '../../stores/newSimpleStore'
import { generateId } from '../../utils/idUtils'

/**
 * Hook to fetch all notebooks with automatic caching and refetching
 */
export const useNotebooksQuery = () => {
  return useQuery({
    queryKey: queryKeys.notebooks(),
    queryFn: async () => {
      logger.debug('Fetching notebooks via React Query')
      const repository = createDocumentRepository()
      await repository.initialize()
      const notebooks = await repository.getNotebooks()
      logger.debug(`Fetched ${notebooks.length} notebooks`)
      return notebooks
    },
    // Keep data fresh for 5 minutes
    staleTime: 5 * 60 * 1000,
    // Refetch on window focus for sync
    refetchOnWindowFocus: true,
  })
}

/**
 * Hook to fetch a single notebook by ID
 */
export const useNotebookQuery = (notebookId: string | null) => {
  return useQuery({
    queryKey: queryKeys.notebook(notebookId || ''),
    queryFn: async () => {
      if (!notebookId) return null
      logger.debug(`Fetching notebook ${notebookId} via React Query`)
      const repository = createDocumentRepository()
      await repository.initialize()
      const notebooks = await repository.getNotebooks()
      return notebooks.find(nb => nb.id === notebookId) || null
    },
    enabled: !!notebookId,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Mutation for creating notebooks with optimistic updates
 */
export const useCreateNotebookMutation = () => {
  const queryClient = useQueryClient()
  const { showSuccess, showError } = useAppStore()

  return useMutation({
    mutationFn: async ({ name, parentId }: { name: string; parentId?: string }) => {
      logger.debug('Creating notebook via mutation', name)
      
      if (!name.trim()) {
        throw new Error('Notebook name cannot be empty')
      }
      
      const repository = createDocumentRepository()
      await repository.initialize()
      
      const newNotebook: Notebook = {
        id: generateId(),
        name: name.trim(),
        parentId: parentId || null,
        color: '#6B7280', // Default gray color
        icon: 'folder',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      
      return repository.saveNotebook(newNotebook)
    },
    // Optimistic update
    onMutate: async ({ name, parentId }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.notebooks() })
      
      const previousNotebooks = queryClient.getQueryData<Notebook[]>(queryKeys.notebooks())
      
      const optimisticNotebook: Notebook = {
        id: `temp-${Date.now()}`,
        name: name.trim(),
        parentId: parentId || null,
        color: '#6B7280',
        icon: 'folder',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      
      if (previousNotebooks) {
        queryClient.setQueryData(queryKeys.notebooks(), [...previousNotebooks, optimisticNotebook])
      }
      
      return { previousNotebooks }
    },
    onError: (err, variables, context) => {
      logger.error('Failed to create notebook:', err)
      if (context?.previousNotebooks) {
        queryClient.setQueryData(queryKeys.notebooks(), context.previousNotebooks)
      }
      showError(err instanceof Error ? err.message : 'Failed to create notebook')
    },
    onSuccess: (createdNotebook) => {
      logger.info('Notebook created successfully:', createdNotebook.id)
      showSuccess('Notebook created')
      invalidateNotebookQueries()
    },
  })
}

/**
 * Mutation for updating notebooks
 */
export const useUpdateNotebookMutation = () => {
  const queryClient = useQueryClient()
  const { showSuccess, showError } = useAppStore()

  return useMutation({
    mutationFn: async (notebook: Notebook) => {
      logger.debug('Updating notebook via mutation', notebook.id)
      
      if (!notebook.name.trim()) {
        throw new Error('Notebook name cannot be empty')
      }
      
      const repository = createDocumentRepository()
      await repository.initialize()
      
      const updatedNotebook = {
        ...notebook,
        name: notebook.name.trim(),
        updatedAt: new Date().toISOString(),
      }
      
      return repository.saveNotebook(updatedNotebook)
    },
    onMutate: async (updatedNotebook) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.notebooks() })
      
      const previousNotebooks = queryClient.getQueryData<Notebook[]>(queryKeys.notebooks())
      
      if (previousNotebooks) {
        queryClient.setQueryData(
          queryKeys.notebooks(),
          previousNotebooks.map(nb => 
            nb.id === updatedNotebook.id ? updatedNotebook : nb
          )
        )
      }
      
      return { previousNotebooks }
    },
    onError: (err, notebook, context) => {
      logger.error('Failed to update notebook:', err)
      if (context?.previousNotebooks) {
        queryClient.setQueryData(queryKeys.notebooks(), context.previousNotebooks)
      }
      showError(err instanceof Error ? err.message : 'Failed to update notebook')
    },
    onSuccess: () => {
      showSuccess('Notebook updated')
      invalidateNotebookQueries()
    },
  })
}

/**
 * Mutation for deleting notebooks
 */
export const useDeleteNotebookMutation = () => {
  const queryClient = useQueryClient()
  const { showSuccess, showError } = useAppStore()

  return useMutation({
    mutationFn: async (notebookId: string) => {
      logger.debug('Deleting notebook via mutation', notebookId)
      
      const repository = createDocumentRepository()
      await repository.initialize()
      
      // Get all notes to check if any are in this notebook
      const notes = await repository.getNotes()
      const notesInNotebook = notes.filter(note => note.notebook === notebookId)
      
      if (notesInNotebook.length > 0) {
        // Move notes to default notebook
        await Promise.all(
          notesInNotebook.map(note => 
            repository.saveNote({
              ...note,
              notebook: 'default',
              updatedAt: new Date().toISOString(),
            })
          )
        )
      }
      
      await repository.deleteNotebook(notebookId)
      
      return { notebookId, movedNotesCount: notesInNotebook.length }
    },
    onMutate: async (notebookId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.notebooks() })
      
      const previousNotebooks = queryClient.getQueryData<Notebook[]>(queryKeys.notebooks())
      
      if (previousNotebooks) {
        queryClient.setQueryData(
          queryKeys.notebooks(),
          previousNotebooks.filter(nb => nb.id !== notebookId)
        )
      }
      
      return { previousNotebooks }
    },
    onError: (err, notebookId, context) => {
      logger.error('Failed to delete notebook:', err)
      if (context?.previousNotebooks) {
        queryClient.setQueryData(queryKeys.notebooks(), context.previousNotebooks)
      }
      showError('Failed to delete notebook')
    },
    onSuccess: ({ movedNotesCount }) => {
      const message = movedNotesCount > 0 
        ? `Notebook deleted and ${movedNotesCount} notes moved to default`
        : 'Notebook deleted'
      showSuccess(message)
      invalidateNotebookQueries()
    },
  })
}

/**
 * Custom hook that combines notebook query with tree structure building
 */
export const useNotebookTree = () => {
  const { data: notebooks = [], ...queryResult } = useNotebooksQuery()
  
  // Build tree structure
  const buildTree = (notebooks: Notebook[]): Notebook[] => {
    const map = new Map<string, Notebook & { children?: Notebook[] }>()
    const roots: (Notebook & { children?: Notebook[] })[] = []
    
    // First pass: create map
    notebooks.forEach(notebook => {
      map.set(notebook.id, { ...notebook, children: [] })
    })
    
    // Second pass: build tree
    notebooks.forEach(notebook => {
      const node = map.get(notebook.id)!
      if (notebook.parentId && map.has(notebook.parentId)) {
        const parent = map.get(notebook.parentId)!
        parent.children = parent.children || []
        parent.children.push(node)
      } else {
        roots.push(node)
      }
    })
    
    return roots
  }
  
  return {
    ...queryResult,
    notebooks,
    tree: buildTree(notebooks),
    getFlattenedNotebooks: () => notebooks,
  }
}