import type { StateCreator } from 'zustand'
import type { Notebook } from '../../types'
import type { IDocumentRepository } from '../../lib/repositories/RepositoryFactory'
import { createDocumentRepository } from '../../lib/repositories/RepositoryFactory'
import { generateNotebookId } from '../../utils/idUtils'
import { getCurrentTimestamp } from '../../utils/dateUtils'
import { buildNotebookTree as buildTreeFromUtils } from '../../utils/notebookTree'
import { notebookLogger } from '../../utils/logger'

export interface NotebooksSlice {
  // Notebooks state
  notebooks: Notebook[]
  flatNotebooks: Notebook[]
  loading: boolean
  error: string | null
  initialized: boolean

  // Notebooks actions
  loadNotebooks: () => Promise<void>
  createNotebook: (
    notebookData: Omit<Notebook, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<Notebook>
  updateNotebook: (notebook: Notebook) => Promise<Notebook>
  deleteNotebook: (id: string) => Promise<void>
  getNotebook: (id: string) => Notebook | undefined
  refreshNotebooks: () => Promise<void>

  // Tree operations
  getRootNotebooks: () => Notebook[]
  getNotebookChildren: (parentId: string) => Notebook[]
  getNotebookPath: (id: string) => string[]
  buildNotebookTree: (notebooks?: Notebook[]) => Notebook[]

  // Validation
  isNameAvailable: (name: string, excludeId?: string) => boolean
  canMoveNotebook: (
    notebookId: string,
    targetParentId: string | null
  ) => boolean

  // Helpers
  getNotebookByName: (name: string) => Notebook | undefined
  getFlattenedNotebooks: () => Notebook[]

  // Internal methods (optimistic updates)
  _addNotebookOptimistic: (notebook: Notebook) => void
  _updateNotebookOptimistic: (notebook: Notebook) => void
  _removeNotebookOptimistic: (id: string) => void
  _revertNotebook: (id: string, originalData?: Notebook) => void
  _setNotebooks: (notebooks: Notebook[]) => void
  _setError: (error: string | null) => void
  _setLoading: (loading: boolean) => void
  _validateAndCleanupNotebooks: (notebooks: Notebook[]) => Notebook[]
}

export const createNotebooksSlice: StateCreator<
  NotebooksSlice,
  [],
  [],
  NotebooksSlice
> = (set, get) => ({
  // Initial state
  notebooks: [],
  flatNotebooks: [],
  loading: false,
  error: null,
  initialized: false,

  // Build notebook tree structure with cycle protection
  buildNotebookTree: (notebooksList?: Notebook[]): Notebook[] => {
    const notebooks = notebooksList || get().flatNotebooks
    notebookLogger.group('Build Notebook Tree')
    notebookLogger.debug('Input notebooks list:', notebooks.length, notebooks)

    const notebookMap = new Map<string, Notebook>()
    const processedIds = new Set<string>()

    // Create a map of notebooks with reset children
    notebooks.forEach(notebook => {
      notebookMap.set(notebook.id, {
        ...notebook,
        children: [],
        level: 0,
        path: notebook.name,
      })
    })

    const rootNotebooks: Notebook[] = []

    // Build tree structure with cycle detection
    notebookMap.forEach(notebook => {
      // Skip if we've already processed this notebook
      if (processedIds.has(notebook.id)) {
        return
      }

      if (notebook.parentId) {
        const parent = notebookMap.get(notebook.parentId)

        // Check for circular reference
        if (parent && parent.id === notebook.id) {
          notebookLogger.warn(
            `Self-reference detected for notebook ${notebook.name}, treating as root`
          )
          rootNotebooks.push(notebook)
          processedIds.add(notebook.id)
          return
        }

        notebookLogger.debug(
          `Processing child notebook ${notebook.name} with parentId ${notebook.parentId}`,
          {
            notebook: notebook.name,
            parentId: notebook.parentId,
            parentFound: !!parent,
            parentName: parent?.name,
          }
        )

        if (parent) {
          // Check for circular reference chain
          let currentParent = parent
          const ancestorChain = new Set([notebook.id])
          let hasCircularRef = false

          while (currentParent && currentParent.parentId) {
            if (ancestorChain.has(currentParent.id)) {
              hasCircularRef = true
              break
            }
            ancestorChain.add(currentParent.id)
            currentParent = notebookMap.get(currentParent.parentId) || null
          }

          if (hasCircularRef) {
            notebookLogger.warn(
              `Circular reference detected in ancestry chain for ${notebook.name}, treating as root`
            )
            rootNotebooks.push(notebook)
          } else {
            // Set level and path
            notebook.level = parent.level + 1
            notebook.path = `${parent.path}/${notebook.name}`
            // Children should be array of IDs, not notebooks
            if (!parent.children.includes(notebook.id)) {
              parent.children.push(notebook.id)
            }
          }
        } else {
          // Parent not found, treat as root
          notebookLogger.warn(
            `Parent not found for ${notebook.name}, treating as root`
          )
          rootNotebooks.push(notebook)
        }
      } else {
        notebookLogger.debug(`Adding root notebook: ${notebook.name}`)
        rootNotebooks.push(notebook)
      }

      processedIds.add(notebook.id)
    })

    // Sort notebooks (children remain as IDs)
    const sortNotebooks = (notebooks: Notebook[]): Notebook[] => {
      return notebooks.sort((a, b) => a.name.localeCompare(b.name))
    }

    const sortedTree = sortNotebooks(rootNotebooks)
    notebookLogger.groupEnd()
    return sortedTree
  },

  // Load notebooks from repository
  loadNotebooks: async () => {
    const { loading } = get()
    if (loading) return

    notebookLogger.info('📚 NotebooksSlice.loadNotebooks called')
    set({ loading: true, error: null })

    try {
      const repository: IDocumentRepository = createDocumentRepository()
      await repository.initialize()

      const loadedNotebooks = await repository.getNotebooks()
      notebookLogger.info('📦 Loaded notebooks from repository:', loadedNotebooks)
      notebookLogger.debug(
        'Notebooks loaded from repository:',
        loadedNotebooks.length
      )
      
      // Debug: Log the structure of loaded notebooks
      notebookLogger.info('🔍 Notebook structure debug:', {
        totalCount: loadedNotebooks.length,
        rootNotebooks: loadedNotebooks.filter(nb => !nb.parentId).length,
        withParentId: loadedNotebooks.filter(nb => nb.parentId).length,
        allNotebooks: loadedNotebooks.map(nb => ({
          id: nb.id,
          name: nb.name,
          parentId: nb.parentId || 'ROOT',
          children: nb.children?.length || 0
        }))
      })

      // Validate and cleanup notebooks to prevent circular references
      const cleanNotebooks = get()._validateAndCleanupNotebooks(loadedNotebooks)

      const treeNotebooks = get().buildNotebookTree(cleanNotebooks)
      notebookLogger.info('🌳 Built notebook tree:', treeNotebooks)

      set({
        flatNotebooks: cleanNotebooks,
        notebooks: treeNotebooks,
        loading: false,
        error: null,
        initialized: true,
      })

      notebookLogger.info(
        'Notebooks loaded successfully:',
        treeNotebooks.length
      )
    } catch (err) {
      const error =
        err instanceof Error ? err.message : 'Failed to load notebooks'
      notebookLogger.error('Error loading notebooks:', err)
      set({ error, loading: false })
    }
  },

  // Create new notebook with optimistic updates
  createNotebook: async (
    notebookData: Omit<Notebook, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Notebook> => {
    const timerId = `notebook-creation-${Date.now()}`
    notebookLogger.group('Create Notebook Operation')
    notebookLogger.time(timerId)

    // Validate unique name BEFORE creating
    const { flatNotebooks } = get()
    const nameExists = flatNotebooks.some(
      nb => nb.name.toLowerCase() === notebookData.name.toLowerCase()
    )

    if (nameExists) {
      const error = `A notebook named "${notebookData.name}" already exists`
      notebookLogger.error(error)
      throw new Error(error)
    }

    const newNotebook: Notebook = {
      ...notebookData,
      id: generateNotebookId(),
      children: [],
      level: 0,
      path: notebookData.name,
      createdAt: getCurrentTimestamp(),
      updatedAt: getCurrentTimestamp(),
    }

    // Optimistic update
    get()._addNotebookOptimistic(newNotebook)

    try {
      const repository: IDocumentRepository = createDocumentRepository()
      await repository.initialize()

      const savedNotebook = await repository.saveNotebook(newNotebook)
      notebookLogger.debug('Notebook saved to repository:', savedNotebook)

      // Update with actual saved data
      get()._updateNotebookOptimistic(savedNotebook)

      notebookLogger.timeEnd(timerId)
      notebookLogger.groupEnd()

      return savedNotebook
    } catch (err) {
      // Revert optimistic update
      get()._removeNotebookOptimistic(newNotebook.id)

      notebookLogger.error('Error in createNotebook:', err)
      notebookLogger.timeEnd(timerId)
      notebookLogger.groupEnd()

      const error =
        err instanceof Error ? err.message : 'Failed to create notebook'
      set({ error })
      throw new Error(error)
    }
  },

  // Update existing notebook with optimistic updates
  updateNotebook: async (notebook: Notebook): Promise<Notebook> => {
    const timerId = `notebook-update-${Date.now()}`
    notebookLogger.group('Update Notebook Operation')
    notebookLogger.time(timerId)

    // Validate unique name BEFORE updating (exclude current notebook)
    const { flatNotebooks, getNotebook } = get()
    const nameExists = flatNotebooks.some(
      nb =>
        nb.name.toLowerCase() === notebook.name.toLowerCase() &&
        nb.id !== notebook.id
    )

    if (nameExists) {
      const error = `A notebook named "${notebook.name}" already exists`
      notebookLogger.error(error)
      throw new Error(error)
    }

    const originalNotebook = getNotebook(notebook.id)
    const updatedNotebook = {
      ...notebook,
      updatedAt: getCurrentTimestamp(),
    }

    // Optimistic update
    get()._updateNotebookOptimistic(updatedNotebook)

    try {
      const repository: IDocumentRepository = createDocumentRepository()
      await repository.initialize()

      const savedNotebook = await repository.saveNotebook(updatedNotebook)
      notebookLogger.debug('Notebook saved to repository:', savedNotebook)

      // Update with actual saved data
      get()._updateNotebookOptimistic(savedNotebook)

      notebookLogger.timeEnd(timerId)
      notebookLogger.groupEnd()

      return savedNotebook
    } catch (err) {
      // Revert optimistic update
      if (originalNotebook) {
        get()._revertNotebook(notebook.id, originalNotebook)
      }

      notebookLogger.error('Error in updateNotebook:', err)
      notebookLogger.timeEnd(timerId)
      notebookLogger.groupEnd()

      const error =
        err instanceof Error ? err.message : 'Failed to update notebook'
      set({ error })
      throw new Error(error)
    }
  },

  // Delete notebook with optimistic updates
  deleteNotebook: async (id: string): Promise<void> => {
    const { getNotebook } = get()
    const notebookToDelete = getNotebook(id)

    if (!notebookToDelete) {
      throw new Error('Notebook not found')
    }

    // Optimistic update
    get()._removeNotebookOptimistic(id)

    try {
      const repository: IDocumentRepository = createDocumentRepository()
      await repository.initialize()

      await repository.deleteNotebook(id)
      notebookLogger.debug('Notebook deleted from repository:', id)
    } catch (err) {
      // Revert optimistic update
      get()._addNotebookOptimistic(notebookToDelete)

      notebookLogger.error('Error in deleteNotebook:', err)
      const error =
        err instanceof Error ? err.message : 'Failed to delete notebook'
      set({ error })
      throw new Error(error)
    }
  },

  // Get single notebook
  getNotebook: (id: string): Notebook | undefined => {
    const { flatNotebooks } = get()
    return flatNotebooks.find(notebook => notebook.id === id)
  },

  // Refresh notebooks from storage
  refreshNotebooks: async (): Promise<void> => {
    await get().loadNotebooks()
  },

  // Get root notebooks
  getRootNotebooks: (): Notebook[] => {
    const { notebooks } = get()
    return notebooks // notebooks already contains only root notebooks in tree structure
  },

  // Get notebook children
  getNotebookChildren: (parentId: string): Notebook[] => {
    const { flatNotebooks } = get()
    return flatNotebooks.filter(notebook => notebook.parentId === parentId)
  },

  // Get notebook path
  getNotebookPath: (id: string): string[] => {
    const { getNotebook } = get()
    const notebook = getNotebook(id)
    if (!notebook) return []

    const path = notebook.path.split('/')
    return path
  },

  // Check if name is available
  isNameAvailable: (name: string, excludeId?: string): boolean => {
    const { flatNotebooks } = get()
    return !flatNotebooks.some(
      notebook =>
        notebook.name.toLowerCase() === name.toLowerCase() &&
        notebook.id !== excludeId
    )
  },

  // Check if notebook can be moved
  canMoveNotebook: (
    notebookId: string,
    targetParentId: string | null
  ): boolean => {
    const { getNotebook } = get()

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
  },

  // Get notebook by name
  getNotebookByName: (name: string): Notebook | undefined => {
    const { flatNotebooks } = get()
    return flatNotebooks.find(
      notebook => notebook.name.toLowerCase() === name.toLowerCase()
    )
  },

  // Get flattened notebooks
  getFlattenedNotebooks: (): Notebook[] => {
    const { flatNotebooks } = get()
    return flatNotebooks
  },

  // Internal optimistic update methods
  _addNotebookOptimistic: (notebook: Notebook) => {
    const { flatNotebooks, buildNotebookTree } = get()
    const updatedFlat = [...flatNotebooks, notebook]
    const updatedTree = buildNotebookTree(updatedFlat)

    set({
      flatNotebooks: updatedFlat,
      notebooks: updatedTree,
      error: null,
    })
  },

  _updateNotebookOptimistic: (notebook: Notebook) => {
    const { flatNotebooks, buildNotebookTree } = get()
    const updatedFlat = flatNotebooks.map(nb =>
      nb.id === notebook.id ? notebook : nb
    )
    const updatedTree = buildNotebookTree(updatedFlat)

    set({
      flatNotebooks: updatedFlat,
      notebooks: updatedTree,
      error: null,
    })
  },

  _removeNotebookOptimistic: (id: string) => {
    const { flatNotebooks, buildNotebookTree } = get()
    const updatedFlat = flatNotebooks.filter(nb => nb.id !== id)
    const updatedTree = buildNotebookTree(updatedFlat)

    set({
      flatNotebooks: updatedFlat,
      notebooks: updatedTree,
      error: null,
    })
  },

  _revertNotebook: (id: string, originalData?: Notebook) => {
    if (originalData) {
      get()._updateNotebookOptimistic(originalData)
    } else {
      get()._removeNotebookOptimistic(id)
    }
  },

  _setNotebooks: (notebooks: Notebook[]) => {
    const { buildNotebookTree } = get()
    const treeNotebooks = buildNotebookTree(notebooks)

    set({
      flatNotebooks: notebooks,
      notebooks: treeNotebooks,
    })
  },

  _setError: (error: string | null) => {
    set({ error })
  },

  _setLoading: (loading: boolean) => {
    set({ loading })
  },

  // Validate and cleanup notebooks to prevent circular references
  _validateAndCleanupNotebooks: (notebooks: Notebook[]): Notebook[] => {
    const cleanNotebooks = [...notebooks]
    const notebookMap = new Map(cleanNotebooks.map(nb => [nb.id, nb]))
    
    // Track orphaned notebooks for reporting
    const orphanedNotebooks: string[] = []

    // Find and fix circular references
    cleanNotebooks.forEach(notebook => {
      if (notebook.parentId) {
        // Check if parent exists
        if (!notebookMap.has(notebook.parentId)) {
          notebookLogger.warn(
            `🔧 Fixing orphaned notebook "${notebook.name}" - parent "${notebook.parentId}" not found. Converting to root notebook.`
          )
          orphanedNotebooks.push(notebook.name)
          notebook.parentId = null
          return
        }

        // Check for circular references
        const visited = new Set<string>()
        let current = notebook

        while (current.parentId && !visited.has(current.id)) {
          visited.add(current.id)
          const parent = notebookMap.get(current.parentId)

          if (!parent) break

          if (parent.id === notebook.id) {
            notebookLogger.warn(
              `Fixing circular reference: ${notebook.name} references itself as parent`
            )
            notebook.parentId = null
            break
          }

          current = parent
        }

        if (visited.has(current.id)) {
          notebookLogger.warn(
            `Fixing circular reference chain involving ${notebook.name}`
          )
          notebook.parentId = null
        }
      }
    })
    
    // Log summary of fixes
    if (orphanedNotebooks.length > 0) {
      notebookLogger.info(
        `📊 Fixed ${orphanedNotebooks.length} orphaned notebooks: ${orphanedNotebooks.join(', ')}`
      )
    }

    return cleanNotebooks
  },
})

// Initialize notebooks after store creation
export const initializeNotebooks = async (storeState: any) => {
  if (storeState.loadNotebooks) {
    await storeState.loadNotebooks()
  }
}
