/**
 * Electron Document Repository Implementation
 * Optimized for Electron - uses file system directly without any IndexedDB
 * Provides maximum performance for desktop application
 */

import type { Note, Notebook } from '../../types'
import type { IDocumentRepository } from './IRepository'
import { StorageError } from './IRepository'
import { generateId } from '../../utils/idUtils'
import { notebookLogger as logger } from '../../utils/logger'

export class ElectronDocumentRepository implements IDocumentRepository {
  protected isInitializedFlag = false
  private notesCache: Map<string, Note> = new Map()
  private notebooksCache: Notebook[] = []
  private cacheValid = false

  /**
   * Initialize the repository
   */
  async initialize(): Promise<void> {
    if (this.isInitializedFlag) return

    try {
      // Verify we're in Electron
      if (!window.electronAPI?.isElectron) {
        throw new Error('ElectronDocumentRepository can only be used in Electron environment')
      }

      // Load initial data into cache
      await this.refreshCache()
      
      this.isInitializedFlag = true
      logger.info('ElectronDocumentRepository initialized successfully')
    } catch (error) {
      logger.error('Failed to initialize ElectronDocumentRepository', error)
      throw new StorageError('initialize', error as Error, true)
    }
  }

  /**
   * Refresh the cache from file system
   */
  private async refreshCache(): Promise<void> {
    try {
      // Load all notes into cache
      const notes = await window.electronAPI.storage.loadAllNotes()
      this.notesCache.clear()
      notes.forEach(note => this.notesCache.set(note.id, note))

      // Load notebooks
      this.notebooksCache = await window.electronAPI.storage.loadNotebooks()
      
      // Ensure default notebook exists
      if (this.notebooksCache.length === 0) {
        await this.createDefaultNotebook()
      }
      
      this.cacheValid = true
    } catch (error) {
      logger.error('Failed to refresh cache', error)
      throw new StorageError('refresh-cache', error as Error)
    }
  }

  /**
   * Create default notebook if none exist
   */
  private async createDefaultNotebook(): Promise<void> {
    const defaultNotebook: Notebook = {
      id: 'default',
      name: 'My Notes',
      parentId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    this.notebooksCache = [defaultNotebook]
    await window.electronAPI.storage.saveNotebooks(this.notebooksCache)
    logger.info('Created default notebook')
  }

  /**
   * Get notes - returns from cache for performance
   */
  async getNotes(): Promise<Note[]> {
    await this.ensureInitialized()
    
    if (!this.cacheValid) {
      await this.refreshCache()
    }
    
    return Array.from(this.notesCache.values())
  }

  /**
   * Get a specific note by ID
   */
  async getNote(id: string): Promise<Note | null> {
    await this.ensureInitialized()
    
    // Try cache first
    if (this.notesCache.has(id)) {
      return this.notesCache.get(id)!
    }
    
    // Fallback to loading from file
    try {
      const note = await window.electronAPI.storage.loadNote(id)
      if (note) {
        this.notesCache.set(id, note)
      }
      return note
    } catch (error) {
      logger.error(`Failed to load note ${id}`, error)
      return null
    }
  }

  /**
   * Save a note
   */
  async saveNote(note: Note): Promise<Note> {
    await this.ensureInitialized()

    try {
      // Ensure ID
      if (!note.id) {
        note.id = generateId()
      }

      // Update timestamps
      const now = new Date().toISOString()
      if (!note.createdAt) {
        note.createdAt = now
      }
      note.updatedAt = now

      // Save to file system
      const result = await window.electronAPI.storage.saveNote(note)
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to save note')
      }

      // Update cache
      this.notesCache.set(note.id, note)
      
      logger.debug(`Note saved: ${note.id}`, {
        id: note.id,
        notebook: note.notebook,
        hasNotebook: 'notebook' in note,
        hasNotebookId: 'notebookId' in (note as any)
      })
      return note
    } catch (error) {
      logger.error('Failed to save note', error)
      throw new StorageError('save-note', error as Error)
    }
  }

  /**
   * Delete a note
   */
  async deleteNote(id: string): Promise<void> {
    await this.ensureInitialized()

    try {
      const result = await window.electronAPI.storage.deleteNote(id)
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete note')
      }

      // Remove from cache
      this.notesCache.delete(id)
      
      logger.debug(`Note deleted: ${id}`)
    } catch (error) {
      logger.error(`Failed to delete note ${id}`, error)
      throw new StorageError('delete-note', error as Error)
    }
  }

  /**
   * Get notebooks
   */
  async getNotebooks(): Promise<Notebook[]> {
    await this.ensureInitialized()
    
    if (!this.cacheValid || this.notebooksCache.length === 0) {
      await this.refreshCache()
    }
    
    return this.notebooksCache
  }

  /**
   * Save notebooks
   */
  async saveNotebooks(notebooks: Notebook[]): Promise<void> {
    await this.ensureInitialized()

    try {
      const result = await window.electronAPI.storage.saveNotebooks(notebooks)
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to save notebooks')
      }

      // Update cache
      this.notebooksCache = notebooks
      
      logger.debug('Notebooks saved')
    } catch (error) {
      logger.error('Failed to save notebooks', error)
      throw new StorageError('save-notebooks', error as Error)
    }
  }

  /**
   * Search notes - simple implementation for Electron
   */
  async searchNotes(query: string): Promise<Note[]> {
    await this.ensureInitialized()
    
    const notes = await this.getNotes()
    const searchLower = query.toLowerCase()
    
    return notes.filter(note => {
      if (note.title.toLowerCase().includes(searchLower)) return true
      if (note.content.toLowerCase().includes(searchLower)) return true
      if (note.tags?.some(tag => tag.toLowerCase().includes(searchLower))) return true
      return false
    })
  }

  /**
   * Export all data
   */
  async exportAll(): Promise<string> {
    await this.ensureInitialized()
    
    const notes = await this.getNotes()
    const notebooks = await this.getNotebooks()
    
    return JSON.stringify({ notes, notebooks }, null, 2)
  }

  /**
   * Import data
   */
  async importAll(dataJson: string): Promise<void> {
    await this.ensureInitialized()

    try {
      const data = JSON.parse(dataJson)
      
      // Import notebooks first
      if (data.notebooks && Array.isArray(data.notebooks)) {
        await this.saveNotebooks(data.notebooks)
      }
      
      // Import notes
      if (data.notes && Array.isArray(data.notes)) {
        for (const note of data.notes) {
          await this.saveNote(note)
        }
      }
      
      // Refresh cache
      await this.refreshCache()
      
      logger.info('Data imported successfully')
    } catch (error) {
      logger.error('Failed to import data', error)
      throw new StorageError('import', error as Error)
    }
  }

  /**
   * Destroy the repository (cleanup)
   */
  async destroy(): Promise<void> {
    this.notesCache.clear()
    this.notebooksCache = []
    this.cacheValid = false
    this.isInitializedFlag = false
    logger.debug('ElectronDocumentRepository destroyed')
  }

  /**
   * Get tag colors
   */
  async getTagColors(): Promise<Record<string, string>> {
    try {
      const colors = await window.electronAPI.storage.loadTagColors()
      return colors || {}
    } catch (error) {
      logger.error('Failed to load tag colors', error)
      return {}
    }
  }

  /**
   * Save tag colors
   */
  async saveTagColors(colors: Record<string, string>): Promise<void> {
    try {
      await window.electronAPI.storage.saveTagColors(colors)
      logger.debug('Tag colors saved')
    } catch (error) {
      logger.error('Failed to save tag colors', error)
      throw new StorageError('save-tag-colors', error as Error)
    }
  }

  /**
   * Ensure repository is initialized
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.isInitializedFlag) {
      await this.initialize()
    }
  }

  /**
   * Check if repository is initialized
   */
  get isInitialized(): boolean {
    return this.isInitializedFlag
  }

  /**
   * Get repository statistics
   */
  async getStats(): Promise<{
    notesCount: number
    notebooksCount: number
    trashedCount: number
    totalSize: number
  }> {
    await this.ensureInitialized()
    
    const notes = await this.getNotes()
    const trashedCount = notes.filter(n => n.isTrashed).length
    
    // Estimate size
    const dataStr = await this.exportAll()
    const totalSize = new Blob([dataStr]).size
    
    return {
      notesCount: notes.length,
      notebooksCount: this.notebooksCache.length,
      trashedCount,
      totalSize
    }
  }
}