/**
 * useNotebooks hook with TanStack Query
 * 
 * Drop-in replacement for the existing useNotebooks hook
 * that uses TanStack Query for data fetching and mutations
 */

import { useMemo, useCallback } from 'react'
import {
  useNotebooksQuery,
  useCreateNotebookMutation,
  useUpdateNotebookMutation,
  useDeleteNotebookMutation,
} from './queries'
import type { Notebook } from '../types'
import type { UseNotebooksResult } from './useNotebooks'
import { notebookLogger as logger } from '../utils/logger'

export const useNotebooksWithQuery = (): UseNotebooksResult => {
  // Fetch notebooks using React Query
  const { data: notebooks = [], isLoading, error } = useNotebooksQuery()
  
  // Mutations
  const createMutation = useCreateNotebookMutation()
  const updateMutation = useUpdateNotebookMutation()
  const deleteMutation = useDeleteNotebookMutation()

  // Build tree structure
  const buildTree = useCallback((notebooks: Notebook[]): Notebook[] => {
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
  }, [])

  // Tree structure
  const treeNotebooks = useMemo(() => buildTree(notebooks), [notebooks, buildTree])

  // Get root notebooks
  const getRootNotebooks = useCallback(() => {
    return notebooks.filter(nb => !nb.parentId)
  }, [notebooks])

  // Get children of a notebook
  const getNotebookChildren = useCallback((parentId: string): Notebook[] => {
    return notebooks.filter(nb => nb.parentId === parentId)
  }, [notebooks])

  // Get a single notebook by ID
  const getNotebook = useCallback((id: string): Notebook | undefined => {
    return notebooks.find(nb => nb.id === id)
  }, [notebooks])

  // Get flattened list of all notebooks
  const getFlattenedNotebooks = useCallback(() => notebooks, [notebooks])

  // Create notebook wrapper
  const createNotebook = useCallback(async (name: string, parentId?: string) => {
    logger.debug('Creating notebook:', { name, parentId })
    
    try {
      await createMutation.mutateAsync({ name, parentId })
      return true
    } catch (error) {
      logger.error('Failed to create notebook:', error)
      return false
    }
  }, [createMutation])

  // Update notebook wrapper
  const updateNotebook = useCallback(async (id: string, updates: Partial<Notebook>) => {
    logger.debug('Updating notebook:', { id, updates })
    
    const notebook = getNotebook(id)
    if (!notebook) {
      logger.error('Notebook not found:', id)
      return false
    }
    
    try {
      await updateMutation.mutateAsync({
        ...notebook,
        ...updates,
      })
      return true
    } catch (error) {
      logger.error('Failed to update notebook:', error)
      return false
    }
  }, [updateMutation, getNotebook])

  // Delete notebook wrapper
  const deleteNotebook = useCallback(async (id: string) => {
    logger.debug('Deleting notebook:', id)
    
    try {
      await deleteMutation.mutateAsync(id)
      return true
    } catch (error) {
      logger.error('Failed to delete notebook:', error)
      return false
    }
  }, [deleteMutation])

  // Move notebook (update parent)
  const moveNotebook = useCallback(async (id: string, newParentId: string | null) => {
    logger.debug('Moving notebook:', { id, newParentId })
    
    const notebook = getNotebook(id)
    if (!notebook) {
      logger.error('Notebook not found:', id)
      return false
    }
    
    // Prevent moving to self or descendants
    if (id === newParentId) {
      logger.error('Cannot move notebook to itself')
      return false
    }
    
    if (newParentId) {
      // Check if new parent is a descendant
      const isDescendant = (notebookId: string, targetId: string): boolean => {
        const children = getNotebookChildren(notebookId)
        for (const child of children) {
          if (child.id === targetId || isDescendant(child.id, targetId)) {
            return true
          }
        }
        return false
      }
      
      if (isDescendant(id, newParentId)) {
        logger.error('Cannot move notebook to its descendant')
        return false
      }
    }
    
    return updateNotebook(id, { parentId: newParentId })
  }, [getNotebook, getNotebookChildren, updateNotebook])

  return {
    // Data
    notebooks: treeNotebooks,
    allNotebooks: notebooks,
    isLoading,
    error,
    
    // Getters
    getRootNotebooks,
    getNotebookChildren,
    getNotebook,
    getFlattenedNotebooks,
    
    // Actions
    createNotebook,
    updateNotebook,
    deleteNotebook,
    moveNotebook,
    
    // Mutation states (for UI feedback)
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}