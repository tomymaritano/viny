/**
 * DexieDocumentRepository - High-performance repository using Dexie.js
 *
 * Benefits over PouchDB:
 * - 4-20x faster queries with proper indexing
 * - Native Float32Array support for embeddings
 * - 57% smaller bundle size
 * - Better TypeScript support
 */

import Dexie, { type Table } from 'dexie'
import type { Note, Notebook } from '../../types'
import type { IDocumentRepository } from './IRepository'
import { StorageError } from './IRepository'
import { generateId } from '../../utils/idUtils'
import { notebookLogger as logger } from '../../utils/logger'

// Extended types for future AI features
interface NoteWithEmbedding extends Note {
  embedding?: Float32Array
  embeddingVersion?: string
  embeddingModel?: string
  lastProcessed?: string
}

interface NotebookWithEmbedding extends Notebook {
  embedding?: Float32Array
  embeddingVersion?: string
}

// Interface for embeddings table
interface EmbeddingRecord {
  id: string
  noteId: string
  chunk: string
  embedding: Float32Array
  position: number
  model: string
  createdAt: string
}

// Database schema
class VinyDatabase extends Dexie {
  notes!: Table<NoteWithEmbedding>
  notebooks!: Table<NotebookWithEmbedding>
  metadata!: Table<{ key: string; value: any }>
  embeddings!: Table<EmbeddingRecord>

  constructor() {
    super('VinyDatabase')

    // Define schema - version 1
    this.version(1).stores({
      // Compound indexes for efficient queries
      notes:
        '++id, title, [status+updatedAt], [notebookId+updatedAt], *tags, isTrashed, createdAt, updatedAt',
      notebooks: '++id, name, parentId, createdAt, updatedAt',
      metadata: '++key',
    })

    // Version 2 with embeddings support
    this.version(2)
      .stores({
        notes:
          '++id, title, [status+updatedAt], [notebookId+updatedAt], *tags, isTrashed, createdAt, updatedAt, embeddingVersion',
        notebooks: '++id, name, parentId, createdAt, updatedAt',
        metadata: '++key',
        embeddings: '++id, noteId, position, model, createdAt', // Separate table for vectors
      })
      .upgrade(tx => {
        // Migration logic for adding embeddings
        return tx
          .table('notes')
          .toCollection()
          .modify(note => {
            note.embeddingVersion = null
            note.lastProcessed = null
          })
      })

    // Version 3 with soft delete for notebooks
    this.version(3)
      .stores({
        notes:
          '++id, title, [status+updatedAt], [notebookId+updatedAt], *tags, isTrashed, createdAt, updatedAt, embeddingVersion',
        notebooks: '++id, name, parentId, isTrashed, createdAt, updatedAt, trashedAt',
        metadata: '++key',
        embeddings: '++id, noteId, position, model, createdAt',
      })
      .upgrade(tx => {
        // Add isTrashed and trashedAt fields to existing notebooks
        return tx
          .table('notebooks')
          .toCollection()
          .modify(notebook => {
            notebook.isTrashed = false
            notebook.trashedAt = null
          })
      })
  }
}

export class DexieDocumentRepository implements IDocumentRepository {
  private db: VinyDatabase
  private initialized = false

  constructor() {
    this.db = new VinyDatabase()
  }

  async initialize(): Promise<void> {
    if (this.initialized) return

    try {
      await this.db.open()
      this.initialized = true
      logger.debug('DexieDocumentRepository initialized successfully')
      
      // Check if we need to migrate from existing data
      const noteCount = await this.db.notes.count()
      const notebookCount = await this.db.notebooks.count()
      
      if (noteCount === 0) {
        logger.info('No existing data found in Dexie database')
      } else {
        logger.info(`Found ${noteCount} existing notes in Dexie database`)
      }
      
      // Ensure default notebook exists
      if (notebookCount === 0) {
        await this.createDefaultNotebook()
      }
    } catch (error) {
      logger.error('Failed to initialize DexieDocumentRepository', error)
      throw new StorageError('initialize', error as Error, true)
    }
  }
  
  private async createDefaultNotebook(): Promise<void> {
    try {
      const defaultNotebook: Notebook = {
        id: 'default',
        name: 'My Notes',
        parentId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      
      await this.db.notebooks.add(defaultNotebook)
      logger.info('Created default notebook')
    } catch (error) {
      logger.error('Failed to create default notebook:', error)
    }
  }

  // Notes operations
  async getNotes(): Promise<Note[]> {
    try {
      // Use Dexie data - filter out trashed notes
      const allNotes = await this.db.notes.toArray()
      const notes = allNotes.filter(note => !note.isTrashed)

      logger.debug(
        `Retrieved ${notes.length} non-trashed notes from ${allNotes.length} total`
      )

      // Remove embedding fields before returning
      return notes.map(
        ({
          embedding,
          embeddingVersion,
          embeddingModel,
          lastProcessed,
          ...note
        }) => note
      )
    } catch (error) {
      logger.error('Failed to get notes', error)
      throw new StorageError('getNotes', error as Error)
    }
  }

  async getNote(id: string): Promise<Note | null> {
    try {
      const note = await this.db.notes.get(id)
      if (!note) return null

      // Remove embedding fields
      const {
        embedding,
        embeddingVersion,
        embeddingModel,
        lastProcessed,
        ...cleanNote
      } = note
      return cleanNote
    } catch (error) {
      logger.error(`Failed to get note ${id}`, error)
      throw new StorageError('getNote', error as Error)
    }
  }

  async saveNote(note: Note): Promise<Note> {
    try {
      const now = new Date().toISOString()
      const noteToSave = {
        ...note,
        id: note.id || generateId(),
        updatedAt: now,
        createdAt: note.createdAt || now,
        isTrashed: note.isTrashed === true, // Ensure boolean value
      }

      await this.db.notes.put(noteToSave as NoteWithEmbedding)
      logger.debug(`Note ${noteToSave.id} saved successfully`)

      return noteToSave
    } catch (error) {
      logger.error('Failed to save note', error)
      throw new StorageError('saveNote', error as Error)
    }
  }

  async saveNotes(notes: Note[]): Promise<Note[]> {
    try {
      const now = new Date().toISOString()
      const notesToSave = notes.map(note => ({
        ...note,
        id: note.id || generateId(),
        updatedAt: now,
        createdAt: note.createdAt || now,
        isTrashed: note.isTrashed === true, // Ensure boolean value
      }))

      await this.db.notes.bulkPut(notesToSave as NoteWithEmbedding[])
      logger.debug(`Bulk saved ${notes.length} notes`)

      return notesToSave
    } catch (error) {
      logger.error('Failed to save notes', error)
      throw new StorageError('saveNotes', error as Error)
    }
  }

  async deleteNote(id: string): Promise<void> {
    try {
      // Soft delete by marking as trashed
      await this.db.notes.update(id, {
        isTrashed: true,
        updatedAt: new Date().toISOString(),
      })
      logger.debug(`Note ${id} marked as trashed`)
    } catch (error) {
      logger.error(`Failed to delete note ${id}`, error)
      throw new StorageError('deleteNote', error as Error)
    }
  }

  async searchNotes(query: string): Promise<Note[]> {
    try {
      const searchTerm = query.toLowerCase()

      // Use Dexie's powerful query capabilities
      const notes = await this.db.notes
        .where('isTrashed')
        .equals(0)
        .filter(note => {
          const titleMatch = note.title.toLowerCase().includes(searchTerm)
          const contentMatch = note.content.toLowerCase().includes(searchTerm)
          const tagMatch = note.tags?.some(tag =>
            tag.toLowerCase().includes(searchTerm)
          )

          return titleMatch || contentMatch || tagMatch
        })
        .toArray()

      // Remove embedding fields
      return notes.map(
        ({
          embedding,
          embeddingVersion,
          embeddingModel,
          lastProcessed,
          ...note
        }) => note
      )
    } catch (error) {
      logger.error('Failed to search notes', error)
      throw new StorageError('searchNotes', error as Error)
    }
  }

  // Notebooks operations
  async getNotebooks(): Promise<Notebook[]> {
    try {
      // Use Dexie data - filter out trashed notebooks
      const notebooks = await this.db.notebooks
        .where('isTrashed')
        .notEqual(true)
        .toArray()

      // Remove embedding fields
      return notebooks.map(
        ({ embedding, embeddingVersion, ...notebook }) => notebook
      )
    } catch (error) {
      logger.error('Failed to get notebooks', error)
      throw new StorageError('getNotebooks', error as Error)
    }
  }

  async getTrashedNotebooks(): Promise<Notebook[]> {
    try {
      const notebooks = await this.db.notebooks
        .where('isTrashed')
        .equals(true)
        .toArray()

      return notebooks.map(
        ({ embedding, embeddingVersion, ...notebook }) => notebook
      )
    } catch (error) {
      logger.error('Failed to get trashed notebooks', error)
      throw new StorageError('getTrashedNotebooks', error as Error)
    }
  }

  async restoreNotebook(id: string): Promise<void> {
    try {
      await this.db.transaction(
        'rw',
        this.db.notebooks,
        this.db.notes,
        async () => {
          // Restore the notebook
          await this.db.notebooks.update(id, {
            isTrashed: false,
            trashedAt: null,
            updatedAt: new Date().toISOString(),
          })

          // Also restore all notes that were in this notebook
          await this.db.notes
            .where('notebookId')
            .equals(id)
            .modify({
              isTrashed: false,
              trashedAt: null,
              updatedAt: new Date().toISOString(),
            })
        }
      )

      logger.debug(`Notebook ${id} restored from trash`)
    } catch (error) {
      logger.error(`Failed to restore notebook ${id}`, error)
      throw new StorageError('restoreNotebook', error as Error)
    }
  }

  async permanentlyDeleteNotebook(id: string): Promise<void> {
    try {
      await this.db.transaction(
        'rw',
        this.db.notebooks,
        this.db.notes,
        async () => {
          // Permanently delete the notebook
          await this.db.notebooks.delete(id)

          // Move all notes in this notebook to default notebook
          await this.db.notes
            .where('notebookId')
            .equals(id)
            .modify({ notebookId: 'default' })
        }
      )

      logger.debug(`Notebook ${id} permanently deleted`)
    } catch (error) {
      logger.error(`Failed to permanently delete notebook ${id}`, error)
      throw new StorageError('permanentlyDeleteNotebook', error as Error)
    }
  }

  async saveNotebook(notebook: Notebook): Promise<Notebook> {
    try {
      const now = new Date().toISOString()
      const notebookToSave = {
        ...notebook,
        id: notebook.id || generateId(),
        updatedAt: now,
        createdAt: notebook.createdAt || now,
      }

      await this.db.notebooks.put(notebookToSave as NotebookWithEmbedding)
      logger.debug(`Notebook ${notebookToSave.id} saved successfully`)

      return notebookToSave
    } catch (error) {
      logger.error('Failed to save notebook', error)
      throw new StorageError('saveNotebook', error as Error)
    }
  }

  async deleteNotebook(id: string): Promise<void> {
    try {
      await this.db.transaction(
        'rw',
        this.db.notebooks,
        this.db.notes,
        async () => {
          // Soft delete the notebook
          await this.db.notebooks.update(id, {
            isTrashed: true,
            trashedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })

          // Also move all notes in this notebook to trash
          await this.db.notes
            .where('notebookId')
            .equals(id)
            .modify({
              isTrashed: true,
              trashedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            })
        }
      )

      logger.debug(`Notebook ${id} deleted and notes moved to default`)
    } catch (error) {
      logger.error(`Failed to delete notebook ${id}`, error)
      throw new StorageError('deleteNotebook', error as Error)
    }
  }

  // Utilities
  async exportAll(): Promise<string> {
    try {
      const [notes, notebooks] = await Promise.all([
        this.getNotes(),
        this.getNotebooks(),
      ])

      return JSON.stringify({ notes, notebooks }, null, 2)
    } catch (error) {
      logger.error('Failed to export data', error)
      throw new StorageError('exportAll', error as Error)
    }
  }

  async importAll(data: string): Promise<void> {
    try {
      const { notes, notebooks } = JSON.parse(data)

      await this.db.transaction(
        'rw',
        this.db.notes,
        this.db.notebooks,
        async () => {
          // Clear existing data
          await Promise.all([this.db.notes.clear(), this.db.notebooks.clear()])

          // Import new data
          if (notebooks?.length) {
            await this.db.notebooks.bulkAdd(notebooks)
          }
          if (notes?.length) {
            await this.db.notes.bulkAdd(notes)
          }
        }
      )

      logger.info(
        `Imported ${notebooks?.length || 0} notebooks and ${notes?.length || 0} notes`
      )
    } catch (error) {
      logger.error('Failed to import data', error)
      throw new StorageError('importAll', error as Error)
    }
  }

  async destroy(): Promise<void> {
    try {
      await this.db.delete()
      this.initialized = false
      logger.info('DexieDocumentRepository destroyed')
    } catch (error) {
      logger.error('Failed to destroy database', error)
      throw new StorageError('destroy', error as Error)
    }
  }

  // Embedding methods
  async saveEmbedding(embedding: EmbeddingRecord): Promise<void> {
    try {
      await this.db.embeddings.put(embedding)

      // Update note to mark it has embeddings
      await this.db.notes.update(embedding.noteId, {
        embeddingVersion: embedding.model,
        lastProcessed: new Date().toISOString(),
      })

      logger.debug(`Embedding saved for note ${embedding.noteId}`)
    } catch (error) {
      logger.error('Failed to save embedding', error)
      throw new StorageError('saveEmbedding', error as Error)
    }
  }

  async saveEmbeddings(embeddings: EmbeddingRecord[]): Promise<void> {
    try {
      await this.db.embeddings.bulkPut(embeddings)

      // Update notes to mark they have embeddings
      const noteIds = [...new Set(embeddings.map(e => e.noteId))]
      for (const noteId of noteIds) {
        await this.db.notes.update(noteId, {
          embeddingVersion: embeddings[0].model,
          lastProcessed: new Date().toISOString(),
        })
      }

      logger.debug(`${embeddings.length} embeddings saved`)
    } catch (error) {
      logger.error('Failed to save embeddings', error)
      throw new StorageError('saveEmbeddings', error as Error)
    }
  }

  async getEmbeddingsByNoteId(noteId: string): Promise<EmbeddingRecord[]> {
    try {
      return await this.db.embeddings
        .where('noteId')
        .equals(noteId)
        .sortBy('position')
    } catch (error) {
      logger.error('Failed to get embeddings', error)
      throw new StorageError('getEmbeddingsByNoteId', error as Error)
    }
  }

  async deleteEmbeddingsByNoteId(noteId: string): Promise<void> {
    try {
      await this.db.embeddings.where('noteId').equals(noteId).delete()

      // Update note to remove embedding version
      await this.db.notes.update(noteId, {
        embeddingVersion: null,
        lastProcessed: null,
      })

      logger.debug(`Embeddings deleted for note ${noteId}`)
    } catch (error) {
      logger.error('Failed to delete embeddings', error)
      throw new StorageError('deleteEmbeddingsByNoteId', error as Error)
    }
  }

  // Advanced query methods for AI features
  async getNotesWithEmbeddings(): Promise<NoteWithEmbedding[]> {
    return this.db.notes.where('embeddingVersion').notEqual(null).toArray()
  }

  async searchBySimilarity(
    queryEmbedding: Float32Array,
    limit = 10,
    threshold = 0.7
  ): Promise<Note[]> {
    try {
      // Get all embeddings
      const allEmbeddings = await this.db.embeddings.toArray()

      // Calculate similarities
      const similarities: Array<{ noteId: string; similarity: number }> = []

      for (const embedding of allEmbeddings) {
        const similarity = this.cosineSimilarity(
          queryEmbedding,
          embedding.embedding
        )
        if (similarity >= threshold) {
          similarities.push({ noteId: embedding.noteId, similarity })
        }
      }

      // Sort by similarity and get unique note IDs
      const topNoteIds = [
        ...new Set(
          similarities
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, limit)
            .map(s => s.noteId)
        ),
      ]

      // Fetch the actual notes
      const notes = await Promise.all(topNoteIds.map(id => this.getNote(id)))

      return notes.filter(note => note !== null) as Note[]
    } catch (error) {
      logger.error('Failed to search by similarity', error)
      throw new StorageError('searchBySimilarity', error as Error)
    }
  }

  // Cosine similarity calculation
  private cosineSimilarity(a: Float32Array, b: Float32Array): number {
    if (a.length !== b.length) return 0

    let dotProduct = 0
    let normA = 0
    let normB = 0

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i]
      normA += a[i] * a[i]
      normB += b[i] * b[i]
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
  }

  // Performance monitoring
  async getStats(): Promise<{
    noteCount: number
    notebookCount: number
    dbSize: number
    indexStats: Record<string, number>
  }> {
    const [noteCount, notebookCount] = await Promise.all([
      this.db.notes.count(),
      this.db.notebooks.count(),
    ])

    // Estimate DB size (rough approximation)
    const estimatedSize = noteCount * 5000 + notebookCount * 500 // bytes

    return {
      noteCount,
      notebookCount,
      dbSize: estimatedSize,
      indexStats: {
        statusIndex: await this.db.notes.where('status').distinct().count(),
        notebookIndex: await this.db.notes
          .where('notebookId')
          .distinct()
          .count(),
        tagIndex: await this.db.notes
          .orderBy('tags')
          .uniqueKeys()
          .then(keys => keys.length),
      },
    }
  }
}
