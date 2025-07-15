import { useState, useEffect, useCallback } from 'react'
import { logger } from '../utils/logger'
import { 
  Notebook, 
  NotebookWithCounts, 
  CreateNotebookData, 
  UpdateNotebookData,
  NOTEBOOK_COLORS 
} from '../types/notebook'

// Legacy type for migration
interface LegacyNotebook {
  id: string
  name: string
  color: string
  description?: string
  createdAt: string
}
import { validateNotebookName, validateNotebookNesting, validateNotebookMove } from '../utils/notebookValidation'
import { 
  buildNotebookTree, 
  flattenNotebookTree, 
  getNotebookWithCounts,
  deleteNotebookAndChildren,
  moveNotebookWithChildren
} from '../utils/notebookTree'

const generateId = (): string => {
  return 'notebook_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
}

const defaultNotebooks: Notebook[] = [
  {
    id: 'personal',
    name: 'personal',
    color: 'blue',
    description: 'Personal notes and thoughts',
    parentId: null,
    children: [],
    level: 0,
    path: 'personal',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'work',
    name: 'work',
    color: 'green',
    description: 'Work-related notes and projects',
    parentId: null,
    children: [],
    level: 0,
    path: 'work',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'projects',
    name: 'projects',
    color: 'orange',
    description: 'Development projects and ideas',
    parentId: null,
    children: [],
    level: 0,
    path: 'projects',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export const useNotebooks = () => {
  const [notebooks, setNotebooks] = useState<Notebook[]>(() => {
    try {
      const saved = localStorage.getItem('viny_notebooks')
      const parsed = saved ? JSON.parse(saved) : defaultNotebooks
      
      // Migrate old notebooks to new structure if needed
      const migrated = parsed.map((notebook: LegacyNotebook) => ({
        ...notebook,
        parentId: notebook.parentId || null,
        children: notebook.children || [],
        level: notebook.level || 0,
        path: notebook.path || notebook.name,
      }))
      
      return buildNotebookTree(migrated)
    } catch (error) {
      logger.warn('Failed to load notebooks:', error)
      return buildNotebookTree(defaultNotebooks)
    }
  })

  // Save to localStorage whenever notebooks change
  useEffect(() => {
    try {
      localStorage.setItem('viny_notebooks', JSON.stringify(notebooks))
    } catch (error) {
      logger.warn('Failed to save notebooks:', error)
    }
  }, [notebooks])

  const createNotebook = useCallback((data: CreateNotebookData): Notebook | null => {
    const nameValidation = validateNotebookName(data.name, notebooks)
    if (!nameValidation.isValid) {
      return null
    }

    const nestingValidation = validateNotebookNesting(data.parentId || null, notebooks)
    if (!nestingValidation.isValid) {
      return null
    }

    const newNotebook: Notebook = {
      id: generateId(),
      name: data.name.trim(),
      color: data.color || 'blue',
      description: data.description || '',
      parentId: data.parentId || null,
      children: [],
      level: 0, // Will be recalculated by buildNotebookTree
      path: '', // Will be recalculated by buildNotebookTree
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    setNotebooks(prev => {
      const updated = [...prev, newNotebook]
      const result = buildNotebookTree(updated)
      return result
    })

    return newNotebook
  }, [notebooks])

  const updateNotebook = useCallback((notebookId: string, updates: UpdateNotebookData): boolean => {
    const notebook = notebooks.find(n => n.id === notebookId)
    if (!notebook) {
      logger.warn('Notebook not found:', notebookId)
      return false
    }

    // Validate name if being updated
    if (updates.name !== undefined) {
      const nameValidation = validateNotebookName(updates.name, notebooks, notebookId)
      if (!nameValidation.isValid) {
        logger.warn('Invalid notebook name:', nameValidation.error)
        return false
      }
    }

    // Validate parent change if being updated
    if (updates.parentId !== undefined) {
      const moveValidation = validateNotebookMove(notebookId, updates.parentId, notebooks)
      if (!moveValidation.isValid) {
        logger.warn('Invalid move:', moveValidation.error)
        return false
      }
    }

    setNotebooks(prev => {
      const updated = prev.map(notebook =>
        notebook.id === notebookId
          ? { 
              ...notebook, 
              ...updates, 
              updatedAt: new Date().toISOString() 
            }
          : notebook
      )
      
      // If parent changed, rebuild tree
      if (updates.parentId !== undefined) {
        return moveNotebookWithChildren(notebookId, updates.parentId, updated)
      }
      
      return buildNotebookTree(updated)
    })

    return true
  }, [notebooks])

  const deleteNotebook = useCallback((notebookId: string): boolean => {
    // Don't allow deleting if it's the last root notebook
    const rootNotebooks = notebooks.filter(n => n.parentId === null)
    const notebookToDelete = notebooks.find(n => n.id === notebookId)
    
    if (rootNotebooks.length <= 1 && notebookToDelete?.parentId === null) {
      logger.warn('Cannot delete the last root notebook')
      return false
    }

    setNotebooks(prev => {
      const idsToDelete = deleteNotebookAndChildren(notebookId, prev)
      const updated = prev.filter(notebook => !idsToDelete.includes(notebook.id))
      return buildNotebookTree(updated)
    })

    return true
  }, [notebooks])

  const moveNotebook = useCallback((notebookId: string, newParentId: string | null): boolean => {
    const moveValidation = validateNotebookMove(notebookId, newParentId, notebooks)
    if (!moveValidation.isValid) {
      console.warn('Invalid move:', moveValidation.error)
      return false
    }

    setNotebooks(prev => moveNotebookWithChildren(notebookId, newParentId, prev))
    return true
  }, [notebooks])

  const getNotebook = useCallback((notebookId: string): Notebook | undefined => {
    return notebooks.find(notebook => notebook.id === notebookId)
  }, [notebooks])

  const getNotebookByName = useCallback((name: string): Notebook | undefined => {
    return notebooks.find(
      notebook => notebook.name.toLowerCase() === name.toLowerCase()
    )
  }, [notebooks])

  const getNotebooksByParent = useCallback((parentId: string | null): Notebook[] => {
    return notebooks.filter(notebook => notebook.parentId === parentId)
  }, [notebooks])

  const getRootNotebooks = useCallback((): Notebook[] => {
    return getNotebooksByParent(null)
  }, [getNotebooksByParent])

  const getNotebookChildren = useCallback((notebookId: string): Notebook[] => {
    return getNotebooksByParent(notebookId)
  }, [getNotebooksByParent])

  const getFlattenedNotebooks = useCallback((): Notebook[] => {
    return flattenNotebookTree(notebooks)
  }, [notebooks])

  const getColorClass = useCallback((color: string): string => {
    const colorObj = NOTEBOOK_COLORS.find(c => c.value === color)
    return colorObj?.class || 'text-solarized-blue'
  }, [])

  const getAvailableColors = useCallback(() => NOTEBOOK_COLORS, [])

  // Computed values
  const notebooksTree = buildNotebookTree(notebooks)
  const flatNotebooks = flattenNotebookTree(notebooksTree)

  return {
    // State
    notebooks: notebooksTree,
    flatNotebooks,
    
    // CRUD operations
    createNotebook,
    updateNotebook,
    deleteNotebook,
    moveNotebook,
    
    // Getters
    getNotebook,
    getNotebookByName,
    getNotebooksByParent,
    getRootNotebooks,
    getNotebookChildren,
    getFlattenedNotebooks,
    
    // Helpers
    getColorClass,
    getAvailableColors,
  }
}
