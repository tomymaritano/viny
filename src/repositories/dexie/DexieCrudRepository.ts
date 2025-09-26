/**
 * Pure CRUD Repository implementation using Dexie
 * No business logic, only data operations
 * Implements the new clean architecture
 */

import Dexie, { type Table, type Transaction } from 'dexie'
import type { Note, Notebook } from '../../types'
import type { NoteRevision } from '../../types/revision'
import type { 
  INoteRepository, 
  INotebookRepository, 
  IRepository,
  ITransaction,
  QueryOptions,
  NoteQueryFilters 
} from '../interfaces/IBaseRepository'
import { generateId } from '../../utils/idUtils'

// Database definition
class VinyCrudDatabase extends Dexie {
  notes!: Table<Note>
  notebooks!: Table<Notebook>
  revisions!: Table<NoteRevision>

  constructor() {
    super('VinyDatabase') // Same DB name for compatibility
    
    // Updated schema with revisions table
    this.version(3).stores({
      notes: '++id, title, [status+updatedAt], [notebookId+updatedAt], *tags, isTrashed, createdAt, updatedAt',
      notebooks: '++id, name, parentId, createdAt, updatedAt',
      metadata: '++key',
      embeddings: '++id, noteId, position, model, createdAt',
      revisions: '++id, noteId, createdAt, changeType',
    }).upgrade(tx => {
      // Migration: existing notes don't have revisions yet
      return tx.table('notes').toCollection().modify(note => {
        // Just ensure the table exists, no data migration needed
      })
    })
  }
}

/**
 * Pure CRUD operations for Notes
 */
class DexieNoteRepository implements INoteRepository {
  constructor(private db: VinyCrudDatabase) {}

  async findAll(options?: QueryOptions): Promise<Note[]> {
    let query = this.db.notes.toCollection()
    
    if (options?.orderBy) {
      query = this.db.notes.orderBy(options.orderBy)
      if (options.orderDirection === 'desc') {
        query = query.reverse()
      }
    }
    
    if (options?.offset) {
      query = query.offset(options.offset)
    }
    
    if (options?.limit) {
      query = query.limit(options.limit)
    }
    
    const dbNotes = await query.toArray()
    
    // Map from DB schema (notebookId) to Note type (notebook)
    return dbNotes.map((dbNote: any) => {
      const { notebookId, ...noteWithoutNotebookId } = dbNote
      return {
        ...noteWithoutNotebookId,
        notebook: notebookId || 'default', // Map notebookId -> notebook
      } as Note
    })
  }

  async findById(id: string): Promise<Note | null> {
    const dbNote = await this.db.notes.get(id)
    if (!dbNote) return null
    
    // Map from DB schema (notebookId) to Note type (notebook)
    // IMPORTANT: notebookId in DB contains the notebook NAME, not the ID
    const { notebookId, ...noteWithoutNotebookId } = dbNote as any
    return {
      ...noteWithoutNotebookId,
      notebook: notebookId || 'default', // Map notebookId -> notebook (both contain name)
    } as Note
  }

  async findMany(filters: NoteQueryFilters, options?: QueryOptions): Promise<Note[]> {
    let collection = this.db.notes.toCollection()
    
    // Apply filters
    if (filters.ids?.length) {
      collection = this.db.notes.where('id').anyOf(filters.ids)
    }
    
    // For other filters, we need to use filter() since Dexie doesn't support all compound queries
    const results = await collection.filter(note => {
      // notebookId in DB contains the notebook name, not the ID
      if (filters.notebookId !== undefined && note.notebookId !== filters.notebookId) return false
      if (filters.status !== undefined && note.status !== filters.status) return false
      if (filters.isTrashed !== undefined && note.isTrashed !== filters.isTrashed) return false
      if (filters.isPinned !== undefined && note.isPinned !== filters.isPinned) return false
      if (filters.tags?.length && !filters.tags.some(tag => note.tags?.includes(tag))) return false
      if (filters.createdAfter && new Date(note.createdAt) <= filters.createdAfter) return false
      if (filters.updatedAfter && new Date(note.updatedAt) <= filters.updatedAfter) return false
      return true
    }).toArray()
    
    // Apply ordering and pagination
    let sorted = results
    if (options?.orderBy) {
      sorted = results.sort((a, b) => {
        const aVal = a[options.orderBy as keyof Note]
        const bVal = b[options.orderBy as keyof Note]
        const comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0
        return options.orderDirection === 'desc' ? -comparison : comparison
      })
    }
    
    if (options?.offset) {
      sorted = sorted.slice(options.offset)
    }
    
    if (options?.limit) {
      sorted = sorted.slice(0, options.limit)
    }
    
    // Map from DB schema (notebookId) to Note type (notebook)
    return sorted.map((dbNote: any) => {
      const { notebookId, ...noteWithoutNotebookId } = dbNote
      return {
        ...noteWithoutNotebookId,
        notebook: notebookId || 'default', // Map notebookId -> notebook
      } as Note
    })
  }

  async create(note: Note): Promise<Note> {
    const now = new Date().toISOString()
    // Map from Note type (notebook) to DB schema (notebookId)
    const { notebook, ...noteWithoutNotebook } = note
    const noteToCreate: any = {
      ...noteWithoutNotebook,
      notebookId: notebook, // Map notebook -> notebookId for DB
      id: note.id || generateId(),
      createdAt: note.createdAt || now,
      updatedAt: now,
    }
    
    await this.db.notes.add(noteToCreate)
    
    // Map back from DB schema (notebookId) to Note type (notebook)
    const { notebookId, ...createdWithoutNotebookId } = noteToCreate
    return {
      ...createdWithoutNotebookId,
      notebook: notebookId, // Map notebookId -> notebook for return
    } as Note
  }

  async update(id: string, data: Partial<Note>): Promise<Note> {
    // Map from Note type (notebook) to DB schema (notebookId) if present
    const { notebook, ...dataWithoutNotebook } = data
    const updatedData: any = {
      ...dataWithoutNotebook,
      ...(notebook !== undefined && { notebookId: notebook }), // Only add if notebook is provided
      updatedAt: new Date().toISOString(),
    }
    
    await this.db.notes.update(id, updatedData)
    const updated = await this.db.notes.get(id)
    
    if (!updated) {
      throw new Error(`Note ${id} not found after update`)
    }
    
    // Map back from DB schema (notebookId) to Note type (notebook)
    const { notebookId, ...updatedWithoutNotebookId } = updated as any
    return {
      ...updatedWithoutNotebookId,
      notebook: notebookId, // Map notebookId -> notebook for return
    } as Note
  }

  async delete(id: string): Promise<void> {
    await this.db.notes.delete(id)
  }

  async createMany(notes: Note[]): Promise<Note[]> {
    const now = new Date().toISOString()
    const notesToCreate = notes.map(note => {
      const { notebook, ...noteWithoutNotebook } = note
      return {
        ...noteWithoutNotebook,
        notebookId: notebook, // Map notebook -> notebookId for DB
        id: note.id || generateId(),
        createdAt: note.createdAt || now,
        updatedAt: now,
      }
    })
    
    await this.db.notes.bulkAdd(notesToCreate)
    
    // Map back from DB schema to Note type
    return notesToCreate.map((dbNote: any) => {
      const { notebookId, ...noteWithoutNotebookId } = dbNote
      return {
        ...noteWithoutNotebookId,
        notebook: notebookId || 'default',
      } as Note
    })
  }

  async updateMany(updates: Array<{ id: string; data: Partial<Note> }>): Promise<Note[]> {
    const now = new Date().toISOString()
    const results: Note[] = []
    
    await this.db.transaction('rw', this.db.notes, async () => {
      for (const { id, data } of updates) {
        // Map notebook -> notebookId for DB if present
        const { notebook, ...dataWithoutNotebook } = data
        const updateData: any = {
          ...dataWithoutNotebook,
          ...(notebook !== undefined && { notebookId: notebook }),
          updatedAt: now
        }
        
        await this.db.notes.update(id, updateData)
        const updated = await this.db.notes.get(id)
        if (updated) {
          // Map back from DB schema to Note type
          const { notebookId, ...updatedWithoutNotebookId } = updated as any
          results.push({
            ...updatedWithoutNotebookId,
            notebook: notebookId || 'default',
          } as Note)
        }
      }
    })
    
    return results
  }

  async deleteMany(ids: string[]): Promise<void> {
    await this.db.notes.bulkDelete(ids)
  }

  async countBy(field: keyof Note): Promise<Record<string, number>> {
    const notes = await this.db.notes.toArray()
    const counts: Record<string, number> = {}
    
    for (const note of notes) {
      const value = String(note[field])
      counts[value] = (counts[value] || 0) + 1
    }
    
    return counts
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.db.notes.where('id').equals(id).count()
    return count > 0
  }
}

/**
 * Pure CRUD operations for Notebooks
 */
class DexieNotebookRepository implements INotebookRepository {
  constructor(private db: VinyCrudDatabase) {}

  async findAll(options?: QueryOptions): Promise<Notebook[]> {
    let query = this.db.notebooks.toCollection()
    
    if (options?.orderBy) {
      query = this.db.notebooks.orderBy(options.orderBy)
      if (options.orderDirection === 'desc') {
        query = query.reverse()
      }
    }
    
    if (options?.offset) {
      query = query.offset(options.offset)
    }
    
    if (options?.limit) {
      query = query.limit(options.limit)
    }
    
    return query.toArray()
  }

  async findById(id: string): Promise<Notebook | null> {
    const notebook = await this.db.notebooks.get(id)
    return notebook || null
  }

  async findByName(name: string): Promise<Notebook | null> {
    const notebook = await this.db.notebooks.where('name').equals(name).first()
    return notebook || null
  }

  async create(notebook: Notebook): Promise<Notebook> {
    const now = new Date().toISOString()
    const notebookToCreate = {
      ...notebook,
      id: notebook.id || generateId(),
      createdAt: notebook.createdAt || now,
      updatedAt: now,
    }
    
    await this.db.notebooks.add(notebookToCreate)
    return notebookToCreate
  }

  async update(id: string, data: Partial<Notebook>): Promise<Notebook> {
    const updatedData = {
      ...data,
      updatedAt: new Date().toISOString(),
    }
    
    await this.db.notebooks.update(id, updatedData)
    const updated = await this.db.notebooks.get(id)
    
    if (!updated) {
      throw new Error(`Notebook ${id} not found after update`)
    }
    
    return updated
  }

  async delete(id: string): Promise<void> {
    await this.db.notebooks.delete(id)
  }

  async findChildren(parentId: string): Promise<Notebook[]> {
    return this.db.notebooks.where('parentId').equals(parentId).toArray()
  }

  async findRoot(): Promise<Notebook[]> {
    return this.db.notebooks.filter(nb => !nb.parentId).toArray()
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.db.notebooks.where('id').equals(id).count()
    return count > 0
  }

  async count(): Promise<number> {
    return this.db.notebooks.count()
  }
}

/**
 * Transaction implementation
 */
class DexieTransaction implements ITransaction {
  notes: INoteRepository
  notebooks: INotebookRepository
  private committed = false
  
  constructor(
    private db: VinyCrudDatabase,
    private transaction: Transaction
  ) {
    // Create repositories that use the transaction
    this.notes = new DexieNoteRepository(db)
    this.notebooks = new DexieNotebookRepository(db)
  }
  
  async commit(): Promise<void> {
    if (this.committed) return
    this.committed = true
    // Dexie auto-commits when transaction scope ends
  }
  
  async rollback(): Promise<void> {
    if (this.committed) return
    this.transaction.abort()
  }
}

/**
 * Main Repository implementation
 */
export class DexieCrudRepository implements IRepository {
  private db: VinyCrudDatabase
  private _notes: INoteRepository
  private _notebooks: INotebookRepository
  private initialized = false
  
  constructor() {
    this.db = new VinyCrudDatabase()
    this._notes = new DexieNoteRepository(this.db)
    this._notebooks = new DexieNotebookRepository(this.db)
  }
  
  get notes(): INoteRepository {
    return this._notes
  }
  
  get notebooks(): INotebookRepository {
    return this._notebooks
  }
  
  async initialize(): Promise<void> {
    if (this.initialized) return
    
    await this.db.open()
    this.initialized = true
  }
  
  async close(): Promise<void> {
    this.db.close()
    this.initialized = false
  }
  
  async beginTransaction(): Promise<ITransaction> {
    const transaction = await this.db.transaction(
      'rw',
      this.db.notes,
      this.db.notebooks,
      async () => {
        // Transaction scope
      }
    )
    
    return new DexieTransaction(this.db, transaction)
  }
  
  async vacuum(): Promise<void> {
    // Dexie doesn't need vacuum like SQLite
    // Could implement cleanup of orphaned data here if needed
  }
  
  async backup(): Promise<Blob> {
    const notes = await this._notes.findAll()
    const notebooks = await this._notebooks.findAll()
    
    // Notes are already mapped by findAll, so they have 'notebook' field
    const data = JSON.stringify({ notes, notebooks }, null, 2)
    return new Blob([data], { type: 'application/json' })
  }
  
  async restore(backup: Blob): Promise<void> {
    const text = await backup.text()
    const { notes, notebooks } = JSON.parse(text)
    
    await this.db.transaction('rw', this.db.notes, this.db.notebooks, async () => {
      // Clear existing data
      await this.db.notes.clear()
      await this.db.notebooks.clear()
      
      // Restore data
      if (notebooks?.length) {
        await this.db.notebooks.bulkAdd(notebooks)
      }
      if (notes?.length) {
        // Map notebook -> notebookId for DB storage
        const notesToRestore = notes.map((note: Note) => {
          const { notebook, ...noteWithoutNotebook } = note
          return {
            ...noteWithoutNotebook,
            notebookId: notebook, // Map for DB schema
          }
        })
        await this.db.notes.bulkAdd(notesToRestore)
      }
    })
  }
}