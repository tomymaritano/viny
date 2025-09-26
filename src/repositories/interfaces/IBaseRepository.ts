/**
 * Base Repository Interfaces - Pure CRUD Operations
 * No business logic, only data access
 */

import type { Note, Notebook } from '../../types'

/**
 * Base query options for filtering and pagination
 */
export interface QueryOptions {
  limit?: number
  offset?: number
  orderBy?: string
  orderDirection?: 'asc' | 'desc'
}

/**
 * Note query filters - only data filtering, no business logic
 */
export interface NoteQueryFilters {
  ids?: string[]
  notebookId?: string
  status?: string
  isTrashed?: boolean
  isPinned?: boolean
  tags?: string[]
  createdAfter?: Date
  updatedAfter?: Date
}

/**
 * Pure CRUD Repository for Notes
 * Only data operations, no business logic
 */
export interface INoteRepository {
  // Basic CRUD
  findAll(options?: QueryOptions): Promise<Note[]>
  findById(id: string): Promise<Note | null>
  findMany(filters: NoteQueryFilters, options?: QueryOptions): Promise<Note[]>
  create(note: Note): Promise<Note>
  update(id: string, data: Partial<Note>): Promise<Note>
  delete(id: string): Promise<void>
  
  // Bulk operations
  createMany(notes: Note[]): Promise<Note[]>
  updateMany(updates: Array<{ id: string; data: Partial<Note> }>): Promise<Note[]>
  deleteMany(ids: string[]): Promise<void>
  
  // Specialized queries (still just data access)
  countBy(field: keyof Note): Promise<Record<string, number>>
  exists(id: string): Promise<boolean>
}

/**
 * Pure CRUD Repository for Notebooks
 */
export interface INotebookRepository {
  // Basic CRUD
  findAll(options?: QueryOptions): Promise<Notebook[]>
  findById(id: string): Promise<Notebook | null>
  findByName(name: string): Promise<Notebook | null>
  create(notebook: Notebook): Promise<Notebook>
  update(id: string, data: Partial<Notebook>): Promise<Notebook>
  delete(id: string): Promise<void>
  
  // Relationships (pure data)
  findChildren(parentId: string): Promise<Notebook[]>
  findRoot(): Promise<Notebook[]>
  
  // Utilities
  exists(id: string): Promise<boolean>
  count(): Promise<number>
}

/**
 * Repository transaction support
 */
export interface ITransaction {
  notes: INoteRepository
  notebooks: INotebookRepository
  commit(): Promise<void>
  rollback(): Promise<void>
}

/**
 * Unit of Work pattern for complex operations
 */
export interface IUnitOfWork {
  beginTransaction(): Promise<ITransaction>
}

/**
 * Main repository interface combining all repositories
 */
export interface IRepository extends IUnitOfWork {
  notes: INoteRepository
  notebooks: INotebookRepository
  
  // Lifecycle
  initialize(): Promise<void>
  close(): Promise<void>
  
  // Maintenance
  vacuum(): Promise<void>
  backup(): Promise<Blob>
  restore(backup: Blob): Promise<void>
}