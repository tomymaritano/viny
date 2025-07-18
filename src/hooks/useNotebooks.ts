// Modern notebooks hook using repository pattern
import { useState, useEffect, useCallback, useRef } from 'react'
import { createDocumentRepository, IDocumentRepository } from '../lib/repositories/RepositoryFactory'
import { Notebook } from '../types'
import { generateNotebookId } from '../utils/idUtils'
import { getCurrentTimestamp } from '../utils/dateUtils'
import { buildNotebookTree as buildTreeFromUtils } from '../utils/notebookTree'
import { notebookLogger } from '../utils/logger'

// Shared cache to prevent multiple concurrent loads
let isLoading = false
let cachedNotebooks: Notebook[] | null = null

interface UseNotebooksResult {
  notebooks: Notebook[]
  loading: boolean
  error: string | null
  
  // CRUD operations
  createNotebook: (notebook: Omit<Notebook, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Notebook>
  updateNotebook: (notebook: Notebook) => Promise<Notebook>
  deleteNotebook: (id: string) => Promise<void>
  getNotebook: (id: string) => Notebook | undefined
  
  // Bulk operations
  refreshNotebooks: () => Promise<void>
  
  // Tree operations
  getRootNotebooks: () => Notebook[]
  getNotebookChildren: (parentId: string) => Notebook[]
  getNotebookPath: (id: string) => string[]
  
  // Validation
  isNameAvailable: (name: string, excludeId?: string) => boolean
  canMoveNotebook: (notebookId: string, targetParentId: string | null) => boolean
  
  // Helpers
  getNotebookByName: (name: string) => Notebook | undefined
  getFlattenedNotebooks: () => Notebook[]
  buildNotebookTree: (notebooks?: Notebook[]) => Notebook[]
}

export const useNotebooks = (): UseNotebooksResult => {
  const [notebooks, setNotebooks] = useState<Notebook[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Build notebook tree structure  
  const buildNotebookTree = useCallback((notebooksList: Notebook[]): Notebook[] => {
    notebookLogger.group('Build Notebook Tree')
    notebookLogger.debug('Input notebooks list:', notebooksList.length, notebooksList)
    
    const notebookMap = new Map<string, Notebook>()
    
    // Create a map of notebooks with reset children
    notebooksList.forEach(notebook => {
      notebookMap.set(notebook.id, {
        ...notebook,
        children: [],
        level: 0,
        path: notebook.name
      })
    })
    
    notebookLogger.debug('Notebook map created:', notebookMap.size, Array.from(notebookMap.values()))

    const rootNotebooks: Notebook[] = []

    // Build tree structure
    notebookMap.forEach(notebook => {
      if (notebook.parentId) {
        const parent = notebookMap.get(notebook.parentId)
        notebookLogger.debug(`Processing child notebook ${notebook.name} with parentId ${notebook.parentId}`, {
          notebook: notebook.name,
          parentId: notebook.parentId,
          parentFound: !!parent,
          parentName: parent?.name
        })
        
        if (parent) {
          // Set level and path
          notebook.level = parent.level + 1
          notebook.path = `${parent.path}/${notebook.name}`
          parent.children.push(notebook)
          notebookLogger.debug(`Added ${notebook.name} as child of ${parent.name}`, {
            parentChildrenCount: parent.children.length,
            childLevel: notebook.level
          })
        } else {
          // Parent not found, treat as root
          notebookLogger.warn(`Parent not found for ${notebook.name}, treating as root`)
          rootNotebooks.push(notebook)
        }
      } else {
        notebookLogger.debug(`Adding root notebook: ${notebook.name}`)
        rootNotebooks.push(notebook)
      }
    })

    notebookLogger.debug('Root notebooks before sorting:', rootNotebooks.length, rootNotebooks.map(n => ({
      name: n.name,
      childrenCount: n.children.length,
      children: n.children.map(c => c.name)
    })))

    // Sort children
    const sortNotebooks = (notebooks: Notebook[]): Notebook[] => {
      return notebooks.sort((a, b) => {
        return a.name.localeCompare(b.name)
      }).map(notebook => ({
        ...notebook,
        children: sortNotebooks(notebook.children)
      }))
    }

    const sortedTree = sortNotebooks(rootNotebooks)
    
    notebookLogger.debug('Final sorted tree:', sortedTree.length, sortedTree.map(n => ({
      name: n.name,
      childrenCount: n.children.length,
      children: n.children.map(c => c.name)
    })))
    
    notebookLogger.groupEnd()
    return sortedTree
  }, [])

  // Load initial notebooks using repository
  const loadNotebooks = useCallback(async () => {
    // Prevent multiple concurrent loads
    if (isLoading) {
      notebookLogger.debug('Already loading notebooks, skipping...')
      return
    }

    // Use cached data if available
    if (cachedNotebooks) {
      notebookLogger.debug('Using cached notebooks:', cachedNotebooks.length)
      const treeNotebooks = buildNotebookTree(cachedNotebooks)
      setNotebooks(treeNotebooks)
      setLoading(false)
      return
    }

    const timerId = `notebook-loading-${Date.now()}`
    notebookLogger.group('Load Notebooks from Repository')
    notebookLogger.time(timerId)
    
    try {
      isLoading = true
      setLoading(true)
      const repository: IDocumentRepository = createDocumentRepository()
      await repository.initialize()
      
      const loadedNotebooks = await repository.getNotebooks()
      notebookLogger.debug('Raw notebooks from repository:', loadedNotebooks.length, loadedNotebooks)
      
      // Cache the raw data
      cachedNotebooks = loadedNotebooks
      
      const treeNotebooks = buildNotebookTree(loadedNotebooks)
      notebookLogger.debug('Tree notebooks after building:', treeNotebooks.length, treeNotebooks)
      
      setNotebooks(treeNotebooks)
      setError(null)
      
      notebookLogger.timeEnd(timerId)
      notebookLogger.info('Notebooks loaded successfully:', treeNotebooks.length)
      notebookLogger.groupEnd()
    } catch (err) {
      notebookLogger.error('Error loading notebooks:', err)
      notebookLogger.timeEnd(timerId)
      notebookLogger.groupEnd()
      
      setError(err instanceof Error ? err.message : 'Failed to load notebooks')
    } finally {
      isLoading = false
      setLoading(false)
    }
  }, [buildNotebookTree])

  // Initialize on mount
  useEffect(() => {
    loadNotebooks()
  }, [loadNotebooks])

  // Get flattened notebooks
  const getFlattenedNotebooks = useCallback((): Notebook[] => {
    const flatten = (notebooks: Notebook[]): Notebook[] => {
      const result: Notebook[] = []
      for (const notebook of notebooks) {
        result.push(notebook)
        if (notebook.children.length > 0) {
          result.push(...flatten(notebook.children))
        }
      }
      return result
    }
    
    return flatten(notebooks)
  }, [notebooks])

  // Create new notebook
  const createNotebook = useCallback(async (notebookData: Omit<Notebook, 'id' | 'createdAt' | 'updatedAt'>): Promise<Notebook> => {
    const timerId = `notebook-creation-${Date.now()}`
    notebookLogger.group('Create Notebook Operation')
    notebookLogger.debug('Input data:', notebookData)
    notebookLogger.time(timerId)
    
    try {
      const newNotebook: Notebook = {
        ...notebookData,
        id: generateNotebookId(),
        children: [],
        level: 0,
        path: notebookData.name,
        createdAt: getCurrentTimestamp(),
        updatedAt: getCurrentTimestamp()
      }
      
      notebookLogger.debug('New notebook object created:', newNotebook)

      const repository: IDocumentRepository = createDocumentRepository()
      await repository.initialize()
      
      const savedNotebook = await repository.saveNotebook(newNotebook)
      notebookLogger.debug('Notebook saved to repository:', savedNotebook)
      
      // Invalidate cache
      cachedNotebooks = null
      
      // Rebuild tree
      const flatNotebooks = getFlattenedNotebooks()
      notebookLogger.debug('Current flat notebooks before adding:', flatNotebooks.length)
      
      const updatedNotebooks = [...flatNotebooks, savedNotebook]
      notebookLogger.debug('Updated notebooks array length:', updatedNotebooks.length)
      
      const treeNotebooks = buildNotebookTree(updatedNotebooks)
      notebookLogger.debug('Tree notebooks after rebuild:', treeNotebooks.length)
      
      setNotebooks(treeNotebooks)
      setError(null)
      
      notebookLogger.timeEnd(timerId)
      notebookLogger.debug('Notebook creation completed successfully')
      notebookLogger.groupEnd()
      
      return savedNotebook
    } catch (err) {
      notebookLogger.error('Error in createNotebook:', err)
      notebookLogger.timeEnd(timerId)
      notebookLogger.groupEnd()
      
      const error = err instanceof Error ? err.message : 'Failed to create notebook'
      setError(error)
      throw new Error(error)
    }
  }, [getFlattenedNotebooks, buildNotebookTree])

  // Update existing notebook
  const updateNotebook = useCallback(async (notebook: Notebook): Promise<Notebook> => {
    try {
      const updatedNotebook = {
        ...notebook,
        updatedAt: getCurrentTimestamp()
      }

      const repository: IDocumentRepository = createDocumentRepository()
      await repository.initialize()
      
      const savedNotebook = await repository.saveNotebook(updatedNotebook)
      
      // Rebuild tree
      // Get all notebooks (flat) and update the specific one
      const flatNotebooks = getFlattenedNotebooks()
      const updatedNotebooks = flatNotebooks.map(n => n.id === notebook.id ? savedNotebook : n)
      const treeNotebooks = buildNotebookTree(updatedNotebooks)
      setNotebooks(treeNotebooks)
      setError(null)
      
      return savedNotebook
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to update notebook'
      setError(error)
      throw new Error(error)
    }
  }, [notebooks, buildNotebookTree])

  // Delete notebook
  const deleteNotebook = useCallback(async (id: string): Promise<void> => {
    try {
      const repository: IDocumentRepository = createDocumentRepository()
      await repository.initialize()
      
      await repository.deleteNotebook(id)
      
      // Remove notebook and its children
      const removeNotebookAndChildren = (notebookId: string, list: Notebook[]): Notebook[] => {
        return list.filter(notebook => {
          if (notebook.id === notebookId) {
            return false
          }
          if (notebook.parentId === notebookId) {
            return false
          }
          return true
        })
      }

      const flatNotebooks = getFlattenedNotebooks()
      const updatedNotebooks = removeNotebookAndChildren(id, flatNotebooks)
      const treeNotebooks = buildNotebookTree(updatedNotebooks)
      setNotebooks(treeNotebooks)
      setError(null)
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to delete notebook'
      setError(error)
      throw new Error(error)
    }
  }, [notebooks, buildNotebookTree])

  // Get single notebook
  const getNotebook = useCallback((id: string): Notebook | undefined => {
    const findNotebook = (notebooks: Notebook[]): Notebook | undefined => {
      for (const notebook of notebooks) {
        if (notebook.id === id) {
          return notebook
        }
        const found = findNotebook(notebook.children)
        if (found) {
          return found
        }
      }
      return undefined
    }
    
    return findNotebook(notebooks)
  }, [notebooks])

  // Refresh notebooks from storage
  const refreshNotebooks = useCallback(async (): Promise<void> => {
    await loadNotebooks()
  }, [loadNotebooks])

  // Get root notebooks
  const getRootNotebooks = useCallback((): Notebook[] => {
    return notebooks.filter(notebook => !notebook.parentId)
  }, [notebooks])

  // Get notebook children
  const getNotebookChildren = useCallback((parentId: string): Notebook[] => {
    const notebook = getNotebook(parentId)
    return notebook ? notebook.children : []
  }, [getNotebook])

  // Get notebook path
  const getNotebookPath = useCallback((id: string): string[] => {
    const notebook = getNotebook(id)
    if (!notebook) return []
    
    const path = notebook.path.split('/')
    return path
  }, [getNotebook])

  // Check if name is available
  const isNameAvailable = useCallback((name: string, excludeId?: string): boolean => {
    const flatNotebooks = getFlattenedNotebooks()
    return !flatNotebooks.some(notebook => 
      notebook.name.toLowerCase() === name.toLowerCase() && 
      notebook.id !== excludeId
    )
  }, [notebooks])

  // Check if notebook can be moved
  const canMoveNotebook = useCallback((notebookId: string, targetParentId: string | null): boolean => {
    // Can't move to itself
    if (notebookId === targetParentId) {
      return false
    }
    
    // Can't move to one of its children
    if (targetParentId) {
      const targetNotebook = getNotebook(targetParentId)
      if (targetNotebook && targetNotebook.path.includes(notebookId)) {
        return false
      }
    }
    
    return true
  }, [getNotebook])

  // Get notebook by name
  const getNotebookByName = useCallback((name: string): Notebook | undefined => {
    const flatNotebooks = getFlattenedNotebooks()
    return flatNotebooks.find(notebook => 
      notebook.name.toLowerCase() === name.toLowerCase()
    )
  }, [notebooks])

  return {
    notebooks,
    loading,
    error,
    
    // CRUD operations
    createNotebook,
    updateNotebook,
    deleteNotebook,
    getNotebook,
    
    // Bulk operations
    refreshNotebooks,
    
    // Tree operations
    getRootNotebooks,
    getNotebookChildren,
    getNotebookPath,
    
    // Validation
    isNameAvailable,
    canMoveNotebook,
    
    // Helpers
    getNotebookByName,
    getFlattenedNotebooks,
    buildNotebookTree
  }
}