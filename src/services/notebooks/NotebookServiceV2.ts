/**
 * Notebook Service V2 - Uses pure CRUD repository
 * All business logic lives here, not in the repository
 */

import type { Notebook, Note } from '../../types'
import type { INotebookRepository, IRepository } from '../../repositories/interfaces/IBaseRepository'
import type { 
  INotebookService, 
  CreateNotebookDto, 
  UpdateNotebookDto,
  NotebookWithCounts,
  NotebookTree
} from './INotebookService'
import { generateId } from '../../utils/idUtils'
import { logger } from '../../utils/logger'

export class NotebookServiceV2 implements INotebookService {
  constructor(private repository: IRepository) {}

  private get notebooks(): INotebookRepository {
    return this.repository.notebooks
  }

  private get notes() {
    return this.repository.notes
  }

  async getAllNotebooks(): Promise<Notebook[]> {
    try {
      const notebooks = await this.notebooks.findAll({ orderBy: 'name' })
      
      // Ensure default notebook exists
      if (notebooks.length === 0) {
        await this.ensureDefaultNotebook()
        return await this.notebooks.findAll({ orderBy: 'name' })
      }
      
      return notebooks
    } catch (error) {
      logger.error('Failed to get all notebooks', error)
      throw new Error('Failed to retrieve notebooks')
    }
  }
  
  private async ensureDefaultNotebook(): Promise<void> {
    try {
      const defaultNotebook = await this.notebooks.findById('default')
      if (!defaultNotebook) {
        await this.notebooks.create({
          id: 'default',
          name: 'My Notes',
          parentId: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        logger.info('Created default notebook')
      }
    } catch (error) {
      logger.error('Failed to ensure default notebook', error)
    }
  }

  async getNotebookById(id: string): Promise<Notebook | null> {
    try {
      return await this.notebooks.findById(id)
    } catch (error) {
      logger.error(`Failed to get notebook ${id}`, error)
      throw new Error('Failed to retrieve notebook')
    }
  }

  async createNotebook(data: CreateNotebookDto): Promise<Notebook> {
    try {
      // Validate name
      if (!data.name?.trim()) {
        throw new Error('Notebook name is required')
      }

      // Check if name is available
      const isAvailable = await this.isNameAvailable(data.name)
      if (!isAvailable) {
        throw new Error('A notebook with this name already exists')
      }

      // Validate parent if provided
      if (data.parentId) {
        const parent = await this.notebooks.findById(data.parentId)
        if (!parent) {
          throw new Error('Parent notebook not found')
        }
      }

      const notebook: Notebook = {
        id: generateId(),
        name: data.name.trim(),
        parentId: data.parentId || null,
        color: data.color || '#6B7280',
        icon: data.icon || '📁',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      const created = await this.notebooks.create(notebook)
      logger.info(`Notebook created: ${created.id}`)
      return created
    } catch (error) {
      logger.error('Failed to create notebook', error)
      throw error
    }
  }

  async updateNotebook(id: string, data: UpdateNotebookDto): Promise<Notebook> {
    try {
      // Check if notebook exists
      const existing = await this.notebooks.findById(id)
      if (!existing) {
        throw new Error('Notebook not found')
      }

      // Validate name if provided
      if (data.name !== undefined) {
        if (!data.name.trim()) {
          throw new Error('Notebook name cannot be empty')
        }
        
        const isAvailable = await this.isNameAvailable(data.name, id)
        if (!isAvailable) {
          throw new Error('A notebook with this name already exists')
        }
      }

      // Validate parent change if provided
      if (data.parentId !== undefined && data.parentId !== existing.parentId) {
        const canMove = await this.canMoveNotebook(id, data.parentId)
        if (!canMove) {
          throw new Error('Cannot move notebook to this location')
        }
      }

      const updated = await this.notebooks.update(id, data)
      logger.info(`Notebook updated: ${id}`)
      return updated
    } catch (error) {
      logger.error(`Failed to update notebook ${id}`, error)
      throw error
    }
  }

  async deleteNotebook(id: string, moveNotesToDefault = true): Promise<void> {
    try {
      // Don't allow deleting default notebook
      if (id === 'default') {
        throw new Error('Cannot delete default notebook')
      }

      const canDelete = await this.canDeleteNotebook(id)
      if (!canDelete) {
        throw new Error('Cannot delete notebook with child notebooks')
      }

      if (moveNotesToDefault) {
        // Move all notes in this notebook to default
        // notebookId in DB contains the notebook name
        const notesInNotebook = await this.notes.findMany({ 
          notebookId: notebook.name, 
          isTrashed: false 
        })
        const updatePromises = notesInNotebook.map(note => 
          this.notes.update(note.id, { notebook: 'default' })
        )
        await Promise.all(updatePromises)
        logger.info(`Moved ${notesInNotebook.length} notes to default notebook`)
      }

      await this.notebooks.delete(id)
      logger.info(`Notebook deleted: ${id}`)
    } catch (error) {
      logger.error(`Failed to delete notebook ${id}`, error)
      throw error
    }
  }

  async getNotebookTree(): Promise<NotebookTree[]> {
    try {
      const allNotebooks = await this.notebooks.findAll()
      return this.buildTree(allNotebooks)
    } catch (error) {
      logger.error('Failed to get notebook tree', error)
      throw new Error('Failed to build notebook tree')
    }
  }

  private buildTree(notebooks: Notebook[], parentId: string | null = null, depth = 0): NotebookTree[] {
    return notebooks
      .filter(nb => nb.parentId === parentId)
      .map(notebook => ({
        ...notebook,
        children: this.buildTree(notebooks, notebook.id, depth + 1),
        depth,
      }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }

  async getFlattenedNotebooks(): Promise<Notebook[]> {
    try {
      const tree = await this.getNotebookTree()
      return this.flattenTree(tree)
    } catch (error) {
      logger.error('Failed to get flattened notebooks', error)
      throw new Error('Failed to flatten notebooks')
    }
  }

  private flattenTree(tree: NotebookTree[]): Notebook[] {
    const result: Notebook[] = []
    
    const flatten = (nodes: NotebookTree[]) => {
      for (const node of nodes) {
        const { children, depth, ...notebook } = node
        result.push(notebook)
        if (children.length > 0) {
          flatten(children)
        }
      }
    }
    
    flatten(tree)
    return result
  }

  async getNotebookChildren(parentId: string): Promise<Notebook[]> {
    try {
      return await this.notebooks.findChildren(parentId)
    } catch (error) {
      logger.error(`Failed to get children of notebook ${parentId}`, error)
      throw new Error('Failed to retrieve notebook children')
    }
  }

  async getRootNotebooks(): Promise<Notebook[]> {
    try {
      return await this.notebooks.findRoot()
    } catch (error) {
      logger.error('Failed to get root notebooks', error)
      throw new Error('Failed to retrieve root notebooks')
    }
  }

  async getNotebookWithCounts(notebookId: string): Promise<NotebookWithCounts | null> {
    try {
      const notebook = await this.notebooks.findById(notebookId)
      if (!notebook) return null

      // Count notes in this notebook
      // notebookId in DB contains the notebook name
      const notes = await this.notes.findMany({ 
        notebookId: notebook.name, 
        isTrashed: false 
      })
      const noteCount = notes.length

      // Count child notebooks
      const children = await this.notebooks.findChildren(notebookId)
      const childCount = children.length

      return {
        ...notebook,
        noteCount,
        childCount,
      }
    } catch (error) {
      logger.error(`Failed to get notebook with counts ${notebookId}`, error)
      throw error
    }
  }

  async getAllNotebooksWithCounts(): Promise<NotebookWithCounts[]> {
    try {
      const notebooks = await this.notebooks.findAll()
      const notes = await this.notes.findMany({ isTrashed: false })

      // Create a map of notebook ID to note count
      const noteCounts = new Map<string, number>()
      for (const note of notes) {
        if (note.notebook) {
          // Map notebook name to notebook ID by finding the notebook
          const notebook = notebooks.find(nb => nb.name === note.notebook)
          if (notebook) {
            const count = noteCounts.get(notebook.id) || 0
            noteCounts.set(notebook.id, count + 1)
          }
        }
      }

      // Create a map of parent ID to child count
      const childCounts = new Map<string, number>()
      for (const notebook of notebooks) {
        if (notebook.parentId) {
          const count = childCounts.get(notebook.parentId) || 0
          childCounts.set(notebook.parentId, count + 1)
        }
      }

      return notebooks.map(notebook => ({
        ...notebook,
        noteCount: noteCounts.get(notebook.id) || 0,
        childCount: childCounts.get(notebook.id) || 0,
      }))
    } catch (error) {
      logger.error('Failed to get notebooks with counts', error)
      throw new Error('Failed to retrieve notebooks with counts')
    }
  }

  async moveNotebook(notebookId: string, newParentId: string | null): Promise<Notebook> {
    try {
      const canMove = await this.canMoveNotebook(notebookId, newParentId)
      if (!canMove) {
        throw new Error('Cannot move notebook to this location')
      }

      const updated = await this.notebooks.update(notebookId, { parentId: newParentId })
      logger.info(`Notebook ${notebookId} moved to parent ${newParentId}`)
      return updated
    } catch (error) {
      logger.error(`Failed to move notebook ${notebookId}`, error)
      throw error
    }
  }

  async duplicateNotebook(notebookId: string): Promise<Notebook> {
    try {
      const original = await this.notebooks.findById(notebookId)
      if (!original) {
        throw new Error('Notebook not found')
      }

      // Find a unique name
      let newName = `${original.name} (Copy)`
      let counter = 1
      while (!(await this.isNameAvailable(newName))) {
        counter++
        newName = `${original.name} (Copy ${counter})`
      }

      const duplicate: Notebook = {
        ...original,
        id: generateId(),
        name: newName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      const created = await this.notebooks.create(duplicate)
      logger.info(`Notebook duplicated: ${notebookId} -> ${created.id}`)
      return created
    } catch (error) {
      logger.error(`Failed to duplicate notebook ${notebookId}`, error)
      throw error
    }
  }

  async canDeleteNotebook(notebookId: string): Promise<boolean> {
    try {
      // Can't delete default notebook
      if (notebookId === 'default') return false

      // Can't delete if it has children
      const children = await this.notebooks.findChildren(notebookId)
      return children.length === 0
    } catch (error) {
      logger.error(`Failed to check if notebook can be deleted ${notebookId}`, error)
      return false
    }
  }

  async canMoveNotebook(notebookId: string, targetParentId: string | null): Promise<boolean> {
    try {
      // Can't move to self
      if (notebookId === targetParentId) return false

      // Can't move default notebook
      if (notebookId === 'default') return false

      // If no target parent, it's moving to root - always allowed
      if (!targetParentId) return true

      // Check if target exists
      const targetParent = await this.notebooks.findById(targetParentId)
      if (!targetParent) return false

      // Check for circular reference
      const isDescendant = await this.isDescendantOf(targetParentId, notebookId)
      return !isDescendant
    } catch (error) {
      logger.error(`Failed to check if notebook can be moved ${notebookId}`, error)
      return false
    }
  }

  private async isDescendantOf(notebookId: string, ancestorId: string): Promise<boolean> {
    const notebook = await this.notebooks.findById(notebookId)
    if (!notebook) return false
    
    if (notebook.parentId === ancestorId) return true
    if (!notebook.parentId) return false
    
    return this.isDescendantOf(notebook.parentId, ancestorId)
  }

  async isNameAvailable(name: string, excludeId?: string): Promise<boolean> {
    try {
      const existing = await this.notebooks.findByName(name)
      if (!existing) return true
      if (excludeId && existing.id === excludeId) return true
      return false
    } catch (error) {
      logger.error(`Failed to check name availability ${name}`, error)
      return false
    }
  }

  async getNotebookPath(notebookId: string): Promise<Notebook[]> {
    try {
      const path: Notebook[] = []
      let currentId: string | null = notebookId

      while (currentId) {
        const notebook = await this.notebooks.findById(currentId)
        if (!notebook) break
        
        path.unshift(notebook)
        currentId = notebook.parentId
      }

      return path
    } catch (error) {
      logger.error(`Failed to get notebook path ${notebookId}`, error)
      throw new Error('Failed to retrieve notebook path')
    }
  }

  async searchNotebooks(query: string): Promise<Notebook[]> {
    try {
      const allNotebooks = await this.notebooks.findAll()
      const searchLower = query.toLowerCase()
      
      return allNotebooks.filter(notebook => 
        notebook.name.toLowerCase().includes(searchLower)
      )
    } catch (error) {
      logger.error('Failed to search notebooks', error)
      throw new Error('Failed to search notebooks')
    }
  }

  async getDefaultNotebook(): Promise<Notebook> {
    try {
      const defaultNotebook = await this.notebooks.findById('default')
      
      if (!defaultNotebook) {
        // Create default notebook if it doesn't exist
        const created = await this.notebooks.create({
          id: 'default',
          name: 'Default',
          parentId: null,
          color: '#6B7280',
          icon: '📝',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        return created
      }
      
      return defaultNotebook
    } catch (error) {
      logger.error('Failed to get default notebook', error)
      throw new Error('Failed to retrieve default notebook')
    }
  }
}