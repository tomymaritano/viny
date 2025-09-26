import type { Notebook, NotebookWithCounts } from '../types/notebook'
import type { Note } from '../types/types'
import { notebookLogger } from './logger'

export const generateNotebookPath = (
  notebookId: string,
  notebooks: Notebook[]
): string => {
  const notebook = notebooks.find(n => n.id === notebookId)
  if (!notebook) return ''

  if (!notebook.parentId) return notebook.name

  const parentPath = generateNotebookPath(notebook.parentId, notebooks)
  return `${parentPath}/${notebook.name}`
}

export const calculateNotebookLevel = (
  notebookId: string,
  notebooks: Notebook[]
): number => {
  const notebook = notebooks.find(n => n.id === notebookId)
  if (!notebook || !notebook.parentId) return 0

  return 1 + calculateNotebookLevel(notebook.parentId, notebooks)
}

export const buildNotebookTree = (notebooks: Notebook[]): Notebook[] => {
  // Create a map for quick lookup
  const notebookMap = new Map(notebooks.map(n => [n.id, { ...n }]))

  // Reset children arrays before building
  notebooks.forEach(notebook => {
    const updated = notebookMap.get(notebook.id)!
    updated.children = []
    updated.path = generateNotebookPath(notebook.id, notebooks)
    updated.level = calculateNotebookLevel(notebook.id, notebooks)
  })

  // Build children arrays
  notebooks.forEach(notebook => {
    if (notebook.parentId) {
      const parent = notebookMap.get(notebook.parentId)
      if (parent && !parent.children.includes(notebook.id)) {
        parent.children.push(notebook.id)
      }
    }
  })

  const result = Array.from(notebookMap.values())
  return result
}

export const flattenNotebookTree = (
  notebooks: Notebook[],
  parentId: string | null = null,
  includeChildren = true
): Notebook[] => {
  const result: Notebook[] = []

  // Get notebooks at this level
  const currentLevel = notebooks.filter(n => n.parentId === parentId)

  currentLevel.forEach(notebook => {
    result.push(notebook)

    if (includeChildren && notebook.children.length > 0) {
      result.push(...flattenNotebookTree(notebooks, notebook.id, true))
    }
  })

  return result
}

export const getNotebookWithCounts = (
  notebooks: Notebook[],
  notes: Note[]
): NotebookWithCounts[] => {
  console.log('🔢 getNotebookWithCounts called with:', {
    notebooksCount: notebooks.length,
    notesCount: notes.length,
    notebooks: notebooks.map(nb => ({id: nb.id, name: nb.name, parentId: nb.parentId}))
  })
  
  // Create a map for quick lookup
  const notebookMap = new Map<string, NotebookWithCounts>()

  // First pass: create NotebookWithCounts objects
  notebooks.forEach(notebook => {
    // Direct notes in this notebook
    const directNotes = notes.filter(
      note =>
        note.notebook === notebook.name &&
        !note.isTrashed &&
        !['completed', 'archived'].includes(note.status)
    )

    // Notes in all children (recursive) with cycle protection
    const getAllChildrenNotes = (
      notebookId: string,
      visited = new Set<string>()
    ): Note[] => {
      // Prevent infinite recursion by tracking visited notebooks
      if (visited.has(notebookId)) {
        notebookLogger.warn(
          `Circular reference detected in notebook hierarchy: ${notebookId}`
        )
        return []
      }

      visited.add(notebookId)
      const children = notebooks.filter(n => n.parentId === notebookId)
      const childNotes: Note[] = []

      children.forEach(child => {
        const childDirectNotes = notes.filter(
          note =>
            note.notebook === child.name &&
            !note.isTrashed &&
            !['completed', 'archived'].includes(note.status)
        )
        childNotes.push(...childDirectNotes)

        // Create a new visited set for each branch to avoid false positives
        const branchVisited = new Set(visited)
        childNotes.push(...getAllChildrenNotes(child.id, branchVisited))
      })

      return childNotes
    }

    const childrenNotes = getAllChildrenNotes(notebook.id)
    const totalNotes = [...directNotes, ...childrenNotes]

    const notebookWithCounts: NotebookWithCounts = {
      ...notebook,
      directCount: directNotes.length,
      totalCount: totalNotes.length,
      count: totalNotes.length, // backward compatibility
    }

    notebookMap.set(notebook.id, notebookWithCounts)
  })

  // Return all notebooks with counts (keep children as string IDs)
  const result = Array.from(notebookMap.values())
  console.log('🔢 getNotebookWithCounts result:', {
    resultCount: result.length,
    result: result.map(nb => ({id: nb.id, name: nb.name, parentId: nb.parentId, totalCount: nb.totalCount}))
  })
  return result
}

export const deleteNotebookAndChildren = (
  notebookId: string,
  notebooks: Notebook[]
): string[] => {
  const toDelete: string[] = [notebookId]

  // Find all children recursively
  const findChildren = (parentId: string) => {
    const children = notebooks.filter(n => n.parentId === parentId)
    children.forEach(child => {
      toDelete.push(child.id)
      findChildren(child.id)
    })
  }

  findChildren(notebookId)
  return toDelete
}

export const moveNotebookWithChildren = (
  notebookId: string,
  newParentId: string | null,
  notebooks: Notebook[]
): Notebook[] => {
  const updated = [...notebooks]

  // Update the moved notebook
  const movedIndex = updated.findIndex(n => n.id === notebookId)
  if (movedIndex === -1) return notebooks

  updated[movedIndex] = {
    ...updated[movedIndex],
    parentId: newParentId,
    updatedAt: new Date().toISOString(),
  }

  // Remove from old parent's children
  updated.forEach(notebook => {
    notebook.children = notebook.children.filter(id => id !== notebookId)
  })

  // Add to new parent's children
  if (newParentId) {
    const newParentIndex = updated.findIndex(n => n.id === newParentId)
    if (newParentIndex !== -1) {
      updated[newParentIndex].children.push(notebookId)
    }
  }

  // Rebuild tree to update paths and levels
  return buildNotebookTree(updated)
}
