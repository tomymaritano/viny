/**
 * Dexie.js Document Repository Implementation Example
 * This is a complete example showing how to implement the DocumentRepository
 * interface using Dexie.js instead of PouchDB
 */

import Dexie, { type Table } from 'dexie'
import type { Note, Notebook } from '../../types'
import type { IDocumentRepository } from './IRepository'
import { StorageError, StorageUtils } from './IRepository'
import { storageLogger as logger } from '../../utils/logger'
import {
  RepositoryErrorHandler,
  RepositoryErrorFactory,
  RetryHandler,
} from './errors/RepositoryErrorHandler'
import type { RetryConfig } from './types/RepositoryTypes'

// Define the database schema
class VinyDatabase extends Dexie {
  // Declare tables with their types
  notes!: Table<Note>
  notebooks!: Table<Notebook>
  embeddings!: Table<{
    id: string
    noteId: string
    vector: Float32Array
    model: string
    createdAt: string
  }>

  constructor() {
    super('viny-dexie')

    // Define schema - much simpler than PouchDB!
    this.version(1).stores({
      // Index definitions use Dexie's simple syntax
      notes:
        'id, title, notebook, *tags, status, updatedAt, isPinned, isTrashed, createdAt',
      notebooks: 'id, name, parentId, updatedAt, createdAt',
      embeddings: 'id, noteId, model, createdAt',
    })

    // Version 2: Add composite indexes for better query performance
    this.version(2).stores({
      notes:
        'id, title, notebook, *tags, status, updatedAt, isPinned, isTrashed, createdAt, [notebook+status], [status+updatedAt]',
      notebooks: 'id, name, parentId, updatedAt, createdAt',
      embeddings: 'id, noteId, model, createdAt',
    })
  }
}

export class DexieDocumentRepository implements IDocumentRepository {
  private db: VinyDatabase
  protected isInitializedFlag = false
  private errorHandler: RepositoryErrorHandler
  private retryHandler: RetryHandler

  constructor(retryConfig?: RetryConfig) {
    this.db = new VinyDatabase()
    this.errorHandler = new RepositoryErrorHandler(retryConfig)
    this.retryHandler = new RetryHandler(retryConfig)
    logger.debug('DexieDocumentRepository created')
  }

  /**
   * Initialize the repository
   * Much simpler than PouchDB - Dexie handles most initialization automatically
   */
  async initialize(): Promise<void> {
    if (this.isInitializedFlag) return

    try {
      const isElectron = !!(window as any).electronAPI?.isElectron

      if (isElectron) {
        // Electron mode - same as PouchDB implementation
        logger.debug('DexieDocumentRepository initialized for Electron')
      } else {
        // Browser mode - Dexie handles IndexedDB automatically
        if (!StorageUtils.hasIndexedDB()) {
          throw new Error('IndexedDB not available')
        }

        await this.db.open()
        logger.debug('Dexie initialized with IndexedDB')
      }

      this.isInitializedFlag = true
      logger.debug('DexieDocumentRepository initialized successfully')
    } catch (error) {
      logger.error('Failed to initialize DexieDocumentRepository:', error)
      throw new StorageError('initialize', error as Error)
    }
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.isInitializedFlag) {
      await this.initialize()
    }
  }

  // Notes Operations

  /**
   * Get all notes - Much simpler without PouchDB's document structure
   */
  async getNotes(): Promise<Note[]> {
    const operation = async (): Promise<Note[]> => {
      await this.ensureInitialized()

      const isElectron = !!(window as any).electronAPI?.isElectron

      if (isElectron) {
        const notes = await (window as any).electronAPI.storage.loadAllNotes()
        logger.debug(`Retrieved ${notes.length} notes via Electron`)
        return notes || []
      } else {
        // Dexie query - much cleaner than PouchDB!
        const notes = await this.db.notes
          .where('isTrashed')
          .equals(false)
          .toArray()

        logger.debug(`Retrieved ${notes.length} notes via Dexie`)
        return notes
      }
    }

    const result = await this.errorHandler.executeOperation(
      operation,
      'getNotes'
    )
    if (result.success) {
      return result.data!
    } else {
      throw result.error
    }
  }

  /**
   * Get single note by ID - No revision management needed!
   */
  async getNote(id: string): Promise<Note | null> {
    await this.ensureInitialized()

    try {
      const isElectron = !!(window as any).electronAPI?.isElectron

      if (isElectron) {
        const note = await (window as any).electronAPI.storage.loadNote(id)
        return note
      } else {
        // Simple get - no type checking needed
        const note = await this.db.notes.get(id)
        return note || null
      }
    } catch (error) {
      logger.error('Failed to get note:', error)
      throw new StorageError('getNote', error as Error, true)
    }
  }

  /**
   * Save note - MUCH simpler without conflict resolution!
   */
  async saveNote(note: Note): Promise<Note> {
    const operation = async (): Promise<Note> => {
      await this.ensureInitialized()

      const isElectron = !!(window as any).electronAPI?.isElectron

      if (isElectron) {
        const result = await (window as any).electronAPI.storage.saveNote(note)
        if (!result.success) {
          throw RepositoryErrorFactory.storageNotAvailable('saveNote')
        }

        const savedNote = {
          ...note,
          updatedAt: new Date().toISOString(),
        }

        logger.debug('Note saved successfully via Electron:', note.id)
        return savedNote
      } else {
        // Dexie put - no revision management!
        const savedNote = {
          ...note,
          updatedAt: new Date().toISOString(),
        }

        await this.db.notes.put(savedNote)
        logger.debug('Note saved successfully via Dexie:', note.id)
        return savedNote
      }
    }

    const result = await this.errorHandler.executeOperation(
      operation,
      'saveNote'
    )
    if (result.success) {
      return result.data!
    } else {
      throw result.error
    }
  }

  /**
   * Batch save notes - Dexie excels at bulk operations
   */
  async saveNotes(notes: Note[]): Promise<Note[]> {
    await this.ensureInitialized()

    try {
      const isElectron = !!(window as any).electronAPI?.isElectron

      if (isElectron) {
        // Same as PouchDB implementation
        const savedNotes: Note[] = []
        for (const note of notes) {
          try {
            const savedNote = await this.saveNote(note)
            savedNotes.push(savedNote)
          } catch (error) {
            logger.warn('Failed to save note in batch:', note.id, error)
          }
        }
        return savedNotes
      } else {
        // Dexie bulk operation - much faster than PouchDB!
        const timestamp = new Date().toISOString()
        const notesToSave = notes.map(note => ({
          ...note,
          updatedAt: timestamp,
        }))

        await this.db.notes.bulkPut(notesToSave)
        logger.debug(`Batch saved ${notes.length} notes via Dexie`)
        return notesToSave
      }
    } catch (error) {
      logger.error('Failed to save notes batch:', error)
      throw new StorageError('saveNotes', error as Error, true)
    }
  }

  /**
   * Delete note - Simpler without revision management
   */
  async deleteNote(id: string): Promise<void> {
    const operation = async (): Promise<void> => {
      await this.ensureInitialized()

      const isElectron = !!(window as any).electronAPI?.isElectron

      if (isElectron) {
        const result = await (window as any).electronAPI.storage.deleteNote(id)
        if (result.success) {
          logger.debug('Note deleted successfully via Electron:', id)
        }
      } else {
        await this.db.notes.delete(id)
        logger.debug('Note deleted successfully via Dexie:', id)
      }
    }

    const result = await this.errorHandler.executeOperation(
      operation,
      'deleteNote'
    )
    if (!result.success && result.error?.code !== 'NOT_FOUND') {
      throw result.error
    }
  }

  /**
   * Advanced search with Dexie's powerful query capabilities
   */
  async searchNotes(query: string): Promise<Note[]> {
    await this.ensureInitialized()

    try {
      const searchTerms = query
        .toLowerCase()
        .split(' ')
        .filter(term => term.length > 0)

      // Dexie allows for more sophisticated queries
      const results = await this.db.notes
        .where('isTrashed')
        .equals(false)
        .filter(note => {
          const searchableText =
            `${note.title} ${note.content} ${note.tags?.join(' ') || ''}`.toLowerCase()
          return searchTerms.every(term => searchableText.includes(term))
        })
        .limit(100)
        .toArray()

      logger.debug(`Search found ${results.length} notes for query: "${query}"`)
      return results
    } catch (error) {
      logger.error('Failed to search notes:', error)
      throw new StorageError('searchNotes', error as Error, true)
    }
  }

  /**
   * Advanced query examples showing Dexie's capabilities
   */
  async getRecentNotes(days = 7): Promise<Note[]> {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)

    return await this.db.notes
      .where('updatedAt')
      .above(cutoffDate.toISOString())
      .and(note => !note.isTrashed)
      .reverse()
      .limit(50)
      .toArray()
  }

  async getNotesByNotebookAndStatus(
    notebook: string,
    status: string
  ): Promise<Note[]> {
    // Use compound index for efficient query
    return await this.db.notes
      .where('[notebook+status]')
      .equals([notebook, status])
      .toArray()
  }

  async getNotesWithTags(tags: string[]): Promise<Note[]> {
    // Multi-entry index query
    return await this.db.notes.where('tags').anyOf(tags).distinct().toArray()
  }

  // Notebooks Operations

  async getNotebooks(): Promise<Notebook[]> {
    await this.ensureInitialized()

    try {
      const isElectron = !!(window as any).electronAPI?.isElectron

      if (isElectron) {
        const notebooks = await (
          window as any
        ).electronAPI.storage.loadNotebooks()
        return notebooks || []
      } else {
        const notebooks = await this.db.notebooks.toArray()
        logger.debug(`Retrieved ${notebooks.length} notebooks via Dexie`)
        return notebooks
      }
    } catch (error) {
      logger.error('Failed to get notebooks:', error)
      throw new StorageError('getNotebooks', error as Error, true)
    }
  }

  async saveNotebook(notebook: Notebook): Promise<Notebook> {
    const operation = async (): Promise<Notebook> => {
      await this.ensureInitialized()

      const savedNotebook = {
        ...notebook,
        updatedAt: new Date().toISOString(),
      }

      const isElectron = !!(window as any).electronAPI?.isElectron

      if (isElectron) {
        // Electron implementation remains the same
        const notebooks = await this.getNotebooks()
        const updatedNotebooks = notebooks.filter(n => n.id !== notebook.id)
        updatedNotebooks.push(savedNotebook)

        const result = await (window as any).electronAPI.storage.saveNotebooks(
          updatedNotebooks
        )
        if (!result.success) {
          throw RepositoryErrorFactory.storageNotAvailable('saveNotebook')
        }
      } else {
        await this.db.notebooks.put(savedNotebook)
      }

      logger.debug('Notebook saved successfully:', notebook.id)
      return savedNotebook
    }

    const result = await this.errorHandler.executeOperation(
      operation,
      'saveNotebook'
    )
    if (result.success) {
      return result.data!
    } else {
      throw result.error
    }
  }

  async deleteNotebook(id: string): Promise<void> {
    await this.ensureInitialized()

    try {
      const isElectron = !!(window as any).electronAPI?.isElectron

      if (isElectron) {
        const notebooks = await this.getNotebooks()
        const filteredNotebooks = notebooks.filter(n => n.id !== id)
        await (window as any).electronAPI.storage.saveNotebooks(
          filteredNotebooks
        )
      } else {
        await this.db.notebooks.delete(id)
      }

      logger.debug('Notebook deleted successfully:', id)
    } catch (error) {
      logger.error('Failed to delete notebook:', error)
      throw new StorageError('deleteNotebook', error as Error, true)
    }
  }

  // Vector/Embedding Operations - Unique to Dexie implementation

  /**
   * Save embedding for a note
   */
  async saveEmbedding(
    noteId: string,
    vector: Float32Array,
    model = 'default'
  ): Promise<void> {
    await this.ensureInitialized()

    const embedding = {
      id: `emb_${noteId}_${model}`,
      noteId,
      vector,
      model,
      createdAt: new Date().toISOString(),
    }

    await this.db.embeddings.put(embedding)
    logger.debug(`Embedding saved for note ${noteId} with model ${model}`)
  }

  /**
   * Search notes by vector similarity
   */
  async searchByEmbedding(
    queryVector: Float32Array,
    options: {
      threshold?: number
      limit?: number
      model?: string
    } = {}
  ): Promise<Array<{ note: Note; score: number }>> {
    const { threshold = 0.7, limit = 50, model = 'default' } = options

    await this.ensureInitialized()

    // Get all embeddings
    const embeddings = await this.db.embeddings
      .where('model')
      .equals(model)
      .toArray()

    // Calculate similarities
    const similarities = await Promise.all(
      embeddings.map(async emb => {
        const score = this.cosineSimilarity(emb.vector, queryVector)
        if (score < threshold) return null

        const note = await this.db.notes.get(emb.noteId)
        if (!note || note.isTrashed) return null

        return { note, score }
      })
    )

    // Filter, sort, and limit results
    return similarities
      .filter((item): item is { note: Note; score: number } => item !== null)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  private cosineSimilarity(a: Float32Array, b: Float32Array): number {
    if (a.length !== b.length) {
      throw new Error('Vectors must have the same length')
    }

    let dotProduct = 0
    let normA = 0
    let normB = 0

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i]
      normA += a[i] * a[i]
      normB += b[i] * b[i]
    }

    if (normA === 0 || normB === 0) return 0

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
  }

  // Utility Operations

  async exportAll(): Promise<string> {
    await this.ensureInitialized()

    try {
      const [notes, notebooks] = await Promise.all([
        this.getNotes(),
        this.getNotebooks(),
      ])

      const exportData = {
        version: '2.0', // New version for Dexie format
        exportDate: new Date().toISOString(),
        notes,
        notebooks,
      }

      logger.debug('Documents exported successfully')
      return JSON.stringify(exportData, null, 2)
    } catch (error) {
      logger.error('Failed to export documents:', error)
      throw new StorageError('exportAll', error as Error)
    }
  }

  async importAll(data: string): Promise<void> {
    await this.ensureInitialized()

    try {
      const importData = JSON.parse(data)

      // Clear existing data
      await this.db.transaction(
        'rw',
        this.db.notes,
        this.db.notebooks,
        async () => {
          await this.db.notes.clear()
          await this.db.notebooks.clear()
        }
      )

      // Import new data
      if (importData.notebooks) {
        await this.db.notebooks.bulkPut(importData.notebooks)
      }

      if (importData.notes) {
        await this.db.notes.bulkPut(importData.notes)
      }

      logger.debug('Documents imported successfully')
    } catch (error) {
      logger.error('Failed to import documents:', error)
      throw new StorageError('importAll', error as Error)
    }
  }

  async destroy(): Promise<void> {
    try {
      await this.db.delete()
      this.isInitializedFlag = false
      logger.debug('Database destroyed successfully')
    } catch (error) {
      logger.error('Failed to destroy database:', error)
      throw new StorageError('destroy', error as Error)
    }
  }

  // Performance optimization methods

  /**
   * Get database statistics for optimization
   */
  async getStats(): Promise<{
    noteCount: number
    notebookCount: number
    embeddingCount: number
    totalSize: number
  }> {
    await this.ensureInitialized()

    const [noteCount, notebookCount, embeddingCount] = await Promise.all([
      this.db.notes.count(),
      this.db.notebooks.count(),
      this.db.embeddings.count(),
    ])

    // Estimate size (rough approximation)
    const avgNoteSize = 2 * 1024 // 2KB average
    const avgEmbeddingSize = 1536 * 4 // 1536 floats * 4 bytes
    const totalSize =
      noteCount * avgNoteSize + embeddingCount * avgEmbeddingSize

    return {
      noteCount,
      notebookCount,
      embeddingCount,
      totalSize,
    }
  }

  /**
   * Optimize database (vacuum, reindex, etc.)
   */
  async optimize(): Promise<void> {
    // Dexie doesn't need manual optimization like PouchDB
    // But we can clear old deleted items
    await this.ensureInitialized()

    // Remove old trashed items
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    await this.db.notes
      .where('isTrashed')
      .equals(true)
      .and(
        note => note.trashedAt && note.trashedAt < thirtyDaysAgo.toISOString()
      )
      .delete()

    logger.debug('Database optimized')
  }
}

// Factory function for easy switching
export function createDexieRepository(
  config?: RetryConfig
): IDocumentRepository {
  return new DexieDocumentRepository(config)
}
