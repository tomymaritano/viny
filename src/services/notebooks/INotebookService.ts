/**
 * Notebook Service Interface
 * Defines the contract for notebook business logic operations
 */

import type { Notebook } from '../../types'

export interface CreateNotebookDto {
  name: string
  parentId?: string | null
  color?: string
  icon?: string
}

export interface UpdateNotebookDto {
  name?: string
  parentId?: string | null
  color?: string
  icon?: string
}

export interface NotebookWithCounts extends Notebook {
  noteCount: number
  childCount: number
}

export interface NotebookTree extends Notebook {
  children: NotebookTree[]
  depth: number
}

export interface INotebookService {
  // Basic CRUD
  getAllNotebooks(): Promise<Notebook[]>
  getNotebookById(id: string): Promise<Notebook | null>
  createNotebook(data: CreateNotebookDto): Promise<Notebook>
  updateNotebook(id: string, data: UpdateNotebookDto): Promise<Notebook>
  deleteNotebook(id: string, moveNotesToDefault?: boolean): Promise<void>
  
  // Tree operations
  getNotebookTree(): Promise<NotebookTree[]>
  getFlattenedNotebooks(): Promise<Notebook[]>
  getNotebookChildren(parentId: string): Promise<Notebook[]>
  getRootNotebooks(): Promise<Notebook[]>
  
  // Business logic
  getNotebookWithCounts(notebookId: string): Promise<NotebookWithCounts | null>
  getAllNotebooksWithCounts(): Promise<NotebookWithCounts[]>
  moveNotebook(notebookId: string, newParentId: string | null): Promise<Notebook>
  duplicateNotebook(notebookId: string): Promise<Notebook>
  
  // Validation
  canDeleteNotebook(notebookId: string): Promise<boolean>
  canMoveNotebook(notebookId: string, targetParentId: string | null): Promise<boolean>
  isNameAvailable(name: string, excludeId?: string): Promise<boolean>
  
  // Utilities
  getNotebookPath(notebookId: string): Promise<Notebook[]>
  searchNotebooks(query: string): Promise<Notebook[]>
  getDefaultNotebook(): Promise<Notebook>
}