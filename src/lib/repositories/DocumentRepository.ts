/**
 * Document Repository Implementation
 * Consolidates document persistence logic from documentStore.ts
 * Provides clean async interface for notes and notebooks
 */

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

// Import PouchDB types and constructor
import PouchDB from 'pouchdb'

export class DocumentRepository implements IDocumentRepository {
  private db: PouchDB.Database | null = null
  protected isInitializedFlag = false
  private readonly dbName = 'viny-documents'
  private errorHandler: RepositoryErrorHandler
  private retryHandler: RetryHandler

  constructor(retryConfig?: RetryConfig) {
    this.errorHandler = new RepositoryErrorHandler(retryConfig)
    this.retryHandler = new RetryHandler(retryConfig)
    logger.debug('DocumentRepository created with error handling')
  }

  /**
   * Initialize the repository and database connection
   */
  async initialize(): Promise<void> {
    if (this.isInitializedFlag) return

    try {
      const isElectron = !!(window as any).electronAPI?.isElectron

      if (isElectron) {
        // In Electron, we don't need PouchDB - use the file-based storage directly
        logger.debug(
          'DocumentRepository initialized for Electron (using file-based storage)'
        )
      } else {
        // In browser, use PouchDB with IndexedDB
        if (!StorageUtils.hasIndexedDB()) {
          throw new Error('IndexedDB not available')
        }

        this.db = new PouchDB(this.dbName)
        // Create indexes for better query performance
        await this.createIndexes()
        logger.debug('PouchDB initialized with browser IndexedDB')
      }

      this.isInitializedFlag = true
      logger.debug('DocumentRepository initialized successfully')
    } catch (error) {
      logger.error('Failed to initialize DocumentRepository:', error)
      throw new StorageError('initialize', error as Error)
    }
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.isInitializedFlag) {
      await this.initialize()
    }

    const isElectron = !!(window as any).electronAPI?.isElectron
    if (!isElectron && !this.db) {
      throw new StorageError('database', new Error('Database not available'))
    }
  }

  // Notes Operations

  /**
   * Get all notes
   */
  async getNotes(): Promise<Note[]> {
    const operation = async (): Promise<Note[]> => {
      await this.ensureInitialized()

      const isElectron = !!(window as any).electronAPI?.isElectron

      if (isElectron) {
        // Use Electron storage API
        const notes = await (window as any).electronAPI.storage.loadAllNotes()
        logger.debug(`Retrieved ${notes.length} notes via Electron`)
        return notes || []
      } else {
        // Use PouchDB for browser
        if (!this.db) {
          throw RepositoryErrorFactory.storageNotAvailable('getNotes')
        }

        const result = await this.db.allDocs({
          include_docs: true,
          startkey: 'note_',
          endkey: 'note_\ufff0',
        })

        const notes = result.rows
          .filter(row => row.doc && !row.doc._deleted)
          .map(row => this.convertFromPouchDoc(row.doc!) as Note)
          .filter(note => note.type === 'note')

        logger.debug(`Retrieved ${notes.length} notes via PouchDB`)
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
   * Get single note by ID
   */
  async getNote(id: string): Promise<Note | null> {
    await this.ensureInitialized()

    try {
      const isElectron = !!(window as any).electronAPI?.isElectron

      if (isElectron) {
        // Use Electron storage API
        const note = await (window as any).electronAPI.storage.loadNote(id)
        return note
      } else {
        // Use PouchDB for browser
        const doc = await this.db!.get(id)
        const note = this.convertFromPouchDoc(doc) as Note

        if (note.type !== 'note') {
          return null
        }

        return note
      }
    } catch (error) {
      if ((error as any).status === 404 || (error as any).code === 'ENOENT') {
        return null
      }

      logger.error('Failed to get note:', error)
      throw new StorageError('getNote', error as Error, true)
    }
  }

  /**
   * Save single note
   */
  async saveNote(note: Note): Promise<Note> {
    const operation = async (): Promise<Note> => {
      await this.ensureInitialized()

      const isElectron = !!(window as any).electronAPI?.isElectron

      if (isElectron) {
        // Use Electron storage API
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
        // Use PouchDB for browser with conflict resolution
        if (!this.db) {
          throw RepositoryErrorFactory.storageNotAvailable('saveNote')
        }

        const doc = this.convertToPouchDoc(note)

        try {
          const result = await this.db.put(doc)

          const savedNote = {
            ...note,
            _rev: result.rev,
            updatedAt: new Date().toISOString(),
          }

          logger.debug('Note saved successfully via PouchDB:', note.id)
          return savedNote
        } catch (error: any) {
          if (error.status === 409) {
            // Handle conflict by retrying with latest version
            try {
              const latestDoc = await this.db.get(note.id)
              note._rev = latestDoc._rev

              const conflictResolvedDoc = this.convertToPouchDoc(note)
              const retryResult = await this.db.put(conflictResolvedDoc)

              return {
                ...note,
                _rev: retryResult.rev,
                updatedAt: new Date().toISOString(),
              }
            } catch (conflictError) {
              throw RepositoryErrorFactory.conflict('saveNote', note.id, {
                originalError: error.message,
                conflictResolutionError: conflictError,
              })
            }
          }

          if (error.name === 'QuotaExceededError') {
            throw RepositoryErrorFactory.storageFull('saveNote', 0, 0)
          }

          throw error
        }
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
   * Save multiple notes in batch
   */
  async saveNotes(notes: Note[]): Promise<Note[]> {
    await this.ensureInitialized()

    try {
      const isElectron = !!(window as any).electronAPI?.isElectron

      if (isElectron) {
        // Use Electron storage API - save notes individually
        const savedNotes: Note[] = []
        for (const note of notes) {
          try {
            const savedNote = await this.saveNote(note)
            savedNotes.push(savedNote)
          } catch (error) {
            logger.warn('Failed to save note in batch:', note.id, error)
          }
        }

        logger.debug(
          `Batch saved ${savedNotes.length}/${notes.length} notes via Electron`
        )
        return savedNotes
      } else {
        // Use PouchDB for browser
        const docs = notes.map(note => this.convertToPouchDoc(note))
        const results = await this.db!.bulkDocs(docs)

        const savedNotes: Note[] = []
        results.forEach((result, index) => {
          if ('ok' in result && result.ok) {
            savedNotes.push({
              ...notes[index],
              _rev: result.rev,
              updatedAt: new Date().toISOString(),
            })
          } else {
            logger.warn(
              'Failed to save note in batch:',
              notes[index].id,
              result
            )
          }
        })

        logger.debug(
          `Batch saved ${savedNotes.length}/${notes.length} notes via PouchDB`
        )
        return savedNotes
      }
    } catch (error) {
      logger.error('Failed to save notes batch:', error)
      throw new StorageError('saveNotes', error as Error, true)
    }
  }

  /**
   * Delete note by ID
   */
  async deleteNote(id: string): Promise<void> {
    const operation = async (): Promise<void> => {
      await this.ensureInitialized()

      const isElectron = !!(window as any).electronAPI?.isElectron

      if (isElectron) {
        // Use Electron storage API
        const result = await (window as any).electronAPI.storage.deleteNote(id)
        if (result.success) {
          logger.debug('Note deleted successfully via Electron:', id)
        } else {
          logger.warn('Attempted to delete non-existent note:', id)
        }
      } else {
        // Use PouchDB for browser
        if (!this.db) {
          throw RepositoryErrorFactory.storageNotAvailable('deleteNote')
        }

        try {
          const doc = await this.db.get(id)
          await this.db.remove(doc)
          logger.debug('Note deleted successfully via PouchDB:', id)
        } catch (error: any) {
          if (error.status === 404) {
            throw RepositoryErrorFactory.notFound('Note', id, 'deleteNote')
          }
          throw error
        }
      }
    }

    const result = await this.errorHandler.executeOperation(
      operation,
      'deleteNote'
    )
    if (!result.success) {
      // For delete operations, not found errors can be silently ignored
      if (result.error?.code !== 'NOT_FOUND') {
        throw result.error
      }
    }
  }

  /**
   * Search notes by query
   */
  async searchNotes(query: string): Promise<Note[]> {
    await this.ensureInitialized()

    try {
      // Simple text search - could be enhanced with full-text search index
      const allNotes = await this.getNotes()
      const searchTerms = query
        .toLowerCase()
        .split(' ')
        .filter(term => term.length > 0)

      const filteredNotes = allNotes.filter(note => {
        const searchableText =
          `${note.title} ${note.content} ${note.tags?.join(' ') || ''}`.toLowerCase()
        return searchTerms.every(term => searchableText.includes(term))
      })

      logger.debug(
        `Search found ${filteredNotes.length} notes for query: "${query}"`
      )
      return filteredNotes
    } catch (error) {
      logger.error('Failed to search notes:', error)
      throw new StorageError('searchNotes', error as Error, true)
    }
  }

  // Notebooks Operations

  /**
   * Get all notebooks
   */
  async getNotebooks(): Promise<Notebook[]> {
    await this.ensureInitialized()

    try {
      const isElectron = !!(window as any).electronAPI?.isElectron

      if (isElectron) {
        // Use Electron storage API
        const notebooks = await (
          window as any
        ).electronAPI.storage.loadNotebooks()
        logger.debug(`Retrieved ${notebooks.length} notebooks via Electron`)
        return notebooks || []
      } else {
        // Use PouchDB for browser
        const result = await this.db!.allDocs({
          include_docs: true,
          startkey: 'notebook_',
          endkey: 'notebook_\ufff0',
        })

        const notebooks = result.rows
          .filter(row => row.doc && !row.doc._deleted)
          .map(row => this.convertFromPouchDoc(row.doc!) as Notebook)
          .filter(notebook => notebook.type === 'notebook')

        logger.debug(`Retrieved ${notebooks.length} notebooks via PouchDB`)
        return notebooks
      }
    } catch (error) {
      logger.error('Failed to get notebooks:', error)
      throw new StorageError('getNotebooks', error as Error, true)
    }
  }

  /**
   * Save notebook with conflict resolution
   */
  async saveNotebook(notebook: Notebook): Promise<Notebook> {
    const operation = async (): Promise<Notebook> => {
      await this.ensureInitialized()

      const isElectron = !!(window as any).electronAPI?.isElectron

      if (isElectron) {
        // Use Electron storage API
        const notebooks = await this.getNotebooks()
        const updatedNotebooks = notebooks.filter(n => n.id !== notebook.id)
        updatedNotebooks.push({
          ...notebook,
          updatedAt: new Date().toISOString(),
        })

        const result = await (window as any).electronAPI.storage.saveNotebooks(
          updatedNotebooks
        )
        if (!result.success) {
          throw RepositoryErrorFactory.storageNotAvailable('saveNotebook')
        }

        const savedNotebook = {
          ...notebook,
          updatedAt: new Date().toISOString(),
        }

        logger.debug('Notebook saved successfully via Electron:', notebook.id)
        return savedNotebook
      } else {
        // Use PouchDB for browser with conflict resolution
        if (!this.db) {
          throw RepositoryErrorFactory.storageNotAvailable('saveNotebook')
        }

        const doc = this.convertToPouchDoc(notebook)

        try {
          const result = await this.db.put(doc)

          const savedNotebook = {
            ...notebook,
            _rev: result.rev,
            updatedAt: new Date().toISOString(),
          }

          logger.debug('Notebook saved successfully via PouchDB:', notebook.id)
          return savedNotebook
        } catch (error: any) {
          if (error.status === 409) {
            // Handle conflict by retrying with latest version
            try {
              const latestDoc = await this.db.get(notebook.id)
              notebook._rev = latestDoc._rev

              const conflictResolvedDoc = this.convertToPouchDoc(notebook)
              const retryResult = await this.db.put(conflictResolvedDoc)

              return {
                ...notebook,
                _rev: retryResult.rev,
                updatedAt: new Date().toISOString(),
              }
            } catch (conflictError) {
              throw RepositoryErrorFactory.conflict(
                'saveNotebook',
                notebook.id,
                {
                  originalError: error.message,
                  conflictResolutionError: conflictError,
                }
              )
            }
          }

          if (error.name === 'QuotaExceededError') {
            throw RepositoryErrorFactory.storageFull('saveNotebook', 0, 0)
          }

          throw error
        }
      }
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

  /**
   * Delete notebook by ID
   */
  async deleteNotebook(id: string): Promise<void> {
    await this.ensureInitialized()

    try {
      const isElectron = !!(window as any).electronAPI?.isElectron

      if (isElectron) {
        // Use Electron storage API
        const notebooks = await this.getNotebooks()
        const filteredNotebooks = notebooks.filter(n => n.id !== id)

        const result = await (window as any).electronAPI.storage.saveNotebooks(
          filteredNotebooks
        )
        if (result.success) {
          logger.debug('Notebook deleted successfully via Electron:', id)
        } else {
          logger.warn('Attempted to delete non-existent notebook:', id)
        }
      } else {
        // Use PouchDB for browser
        const doc = await this.db!.get(id)
        await this.db!.remove(doc)
        logger.debug('Notebook deleted successfully via PouchDB:', id)
      }
    } catch (error) {
      if ((error as any).status === 404 || (error as any).code === 'ENOENT') {
        logger.warn('Attempted to delete non-existent notebook:', id)
        return
      }

      logger.error('Failed to delete notebook:', error)
      throw new StorageError('deleteNotebook', error as Error, true)
    }
  }

  // Utility Operations

  /**
   * Export all documents as JSON
   */
  async exportAll(): Promise<string> {
    await this.ensureInitialized()

    try {
      const [notes, notebooks] = await Promise.all([
        this.getNotes(),
        this.getNotebooks(),
      ])

      const exportData = {
        version: '1.0',
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

  /**
   * Import documents from JSON
   */
  async importAll(data: string): Promise<void> {
    await this.ensureInitialized()

    try {
      const importData = JSON.parse(data)

      if (importData.notes) {
        await this.saveNotes(importData.notes)
      }

      if (importData.notebooks) {
        for (const notebook of importData.notebooks) {
          await this.saveNotebook(notebook)
        }
      }

      logger.debug('Documents imported successfully')
    } catch (error) {
      logger.error('Failed to import documents:', error)
      throw new StorageError('importAll', error as Error)
    }
  }

  /**
   * Destroy the database (for cleanup)
   */
  async destroy(): Promise<void> {
    try {
      const isElectron = !!(window as any).electronAPI?.isElectron

      if (!isElectron && this.db) {
        await this.db.destroy()
        this.db = null
      }

      this.isInitializedFlag = false
      logger.debug('Database destroyed successfully')
    } catch (error) {
      logger.error('Failed to destroy database:', error)
      throw new StorageError('destroy', error as Error)
    }
  }

  // Private helper methods

  private async createIndexes(): Promise<void> {
    if (!this.db || typeof this.db.createIndex !== 'function') {
      logger.warn('Database not available or createIndex not supported')
      return
    }

    try {
      // Index for type-based queries
      await this.db.createIndex({
        index: { fields: ['type'] },
      })

      // Index for notebook queries
      await this.db.createIndex({
        index: { fields: ['type', 'notebook'] },
      })

      // Index for timestamp queries
      await this.db.createIndex({
        index: { fields: ['type', 'updatedAt'] },
      })
    } catch (error) {
      logger.warn('Failed to create some indexes:', error)
    }
  }

  private convertToPouchDoc(doc: Note | Notebook): any {
    return {
      _id: doc.id,
      _rev: doc._rev,
      ...doc,
    }
  }

  private convertFromPouchDoc(doc: any): Note | Notebook {
    const { _id, _rev, ...data } = doc
    return {
      ...data,
      id: _id,
      _rev,
    }
  }
}
