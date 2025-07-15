import { useState, useEffect, useCallback } from 'react'
import { logger } from '../utils/logger'
import { electronStorageService } from '../lib/electronStorage'
import { useAppStore } from '../stores/newSimpleStore'
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
    id: 'inbox',
    name: 'inbox',
    color: 'purple',
    description: 'Quick notes and ideas to process later',
    parentId: null,
    children: [],
    level: 0,
    path: 'inbox',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'learn',
    name: 'learn',
    color: 'blue',
    description: 'Learning resources and guides',
    parentId: null,
    children: [],
    level: 0,
    path: 'learn',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'personal',
    name: 'personal',
    color: 'teal',
    description: 'Personal notes and thoughts',
    parentId: null,
    children: [],
    level: 0,
    path: 'personal',
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
]

export const useNotebooks = () => {
  const [notebooks, setNotebooks] = useState<Notebook[]>(() => {
    // For initial state, use defaults - async loading will happen in useEffect
    console.log('🚀 Initializing notebooks with defaults during SSR/initial render')
    return buildNotebookTree(defaultNotebooks)
  })
  
  // Get notes and updateNote from store for moving notes to trash
  const { notes, updateNote } = useAppStore()

  // Load notebooks from storage (async)
  useEffect(() => {
    const loadNotebooks = async () => {
      try {
        console.log('🚀 Loading notebooks from storage...')
        
        let parsed: Notebook[] = []
        
        if (electronStorageService.isElectronEnvironment) {
          console.log('🚀 Using ElectronStorage to load notebooks')
          parsed = await electronStorageService.getNotebooks()
        } else {
          console.log('🚀 Using localStorage to load notebooks')
          const saved = localStorage.getItem('viny_notebooks')
          if (saved) {
            parsed = JSON.parse(saved)
          }
        }
        
        if (parsed.length === 0) {
          console.log('🚀 No notebooks found, using defaults')
          parsed = defaultNotebooks
          // Save defaults
          if (electronStorageService.isElectronEnvironment) {
            await electronStorageService.saveNotebooks(defaultNotebooks)
          } else {
            localStorage.setItem('viny_notebooks', JSON.stringify(defaultNotebooks))
          }
        }
        
        console.log('🚀 Loaded notebooks from storage:', parsed.length, 'notebooks')
        
        // Migrate old notebooks to new structure if needed
        const migrated = parsed.map((notebook: LegacyNotebook) => ({
          ...notebook,
          parentId: notebook.parentId || null,
          children: notebook.children || [],
          level: notebook.level || 0,
          path: notebook.path || notebook.name,
        }))
        
        const result = buildNotebookTree(migrated)
        console.log('🚀 Built notebook tree:', result.length, 'notebooks')
        setNotebooks(result)
      } catch (error) {
        logger.warn('Failed to load notebooks:', error)
        console.log('🚀 Error loading notebooks, using defaults')
        const defaultResult = buildNotebookTree(defaultNotebooks)
        setNotebooks(defaultResult)
      }
    }

    loadNotebooks()
  }, [])

  // Save to storage whenever notebooks change (debounced to avoid excessive saves)
  useEffect(() => {
    // Skip saving if we're still in the initial loading state (only defaults)
    if (notebooks.length === 5 && notebooks.every(nb => ['inbox', 'learn', 'personal', 'projects', 'work'].includes(nb.name))) {
      console.log('💾 useEffect: Skipping save - using default notebooks during initialization')
      return
    }
    
    console.log('💾 useEffect: Triggered with', notebooks.length, 'notebooks:', notebooks.map(n => n.name))
    
    const saveNotebooks = async () => {
      try {
        if (electronStorageService.isElectronEnvironment) {
          console.log('💾 useEffect: Saving to ElectronStorage')
          await electronStorageService.saveNotebooks(notebooks)
          console.log('💾 useEffect: Successfully saved to ElectronStorage')
        } else {
          console.log('💾 useEffect: Saving to localStorage')
          localStorage.setItem('viny_notebooks', JSON.stringify(notebooks))
          console.log('💾 useEffect: Successfully saved to localStorage')
        }
      } catch (error) {
        console.error('💾 useEffect: Error saving notebooks:', error)
        logger.warn('Failed to save notebooks:', error)
      }
    }

    saveNotebooks()
  }, [notebooks])

  const createNotebook = useCallback((data: CreateNotebookData): Notebook | null => {
    console.log('🔵 Creating notebook:', data)
    console.log('🔵 Current notebooks before validation:', notebooks.map(n => n.name))
    
    const nameValidation = validateNotebookName(data.name, notebooks)
    if (!nameValidation.isValid) {
      console.error('❌ Name validation failed:', nameValidation.error)
      // Show user-friendly error
      alert(`Cannot create notebook: ${nameValidation.error}`)
      return null
    }

    const nestingValidation = validateNotebookNesting(data.parentId || null, notebooks)
    if (!nestingValidation.isValid) {
      console.error('❌ Nesting validation failed:', nestingValidation.error)
      alert(`Cannot create notebook: ${nestingValidation.error}`)
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
    
    console.log('✅ New notebook created:', newNotebook)
    
    setNotebooks(prev => {
      console.log('🔵 Previous notebooks count:', prev.length)
      const updated = [...prev, newNotebook]
      console.log('🔵 Updated notebooks count:', updated.length)
      const result = buildNotebookTree(updated)
      console.log('🔵 Final result count:', result.length)
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

    // Get all notebook IDs to delete (including children)
    const idsToDelete = deleteNotebookAndChildren(notebookId, notebooks)
    
    // Move all notes from these notebooks to trash
    const notesToTrash = notes.filter(note => 
      note.notebookId && idsToDelete.includes(note.notebookId)
    )
    
    notesToTrash.forEach(note => {
      updateNote(note.id, { deletedAt: new Date().toISOString() })
    })
    
    // Delete the notebooks
    setNotebooks(prev => {
      const updated = prev.filter(notebook => !idsToDelete.includes(notebook.id))
      return buildNotebookTree(updated)
    })

    logger.info(`Deleted notebook ${notebookId} and moved ${notesToTrash.length} notes to trash`)
    return true
  }, [notebooks, notes, updateNote])

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
