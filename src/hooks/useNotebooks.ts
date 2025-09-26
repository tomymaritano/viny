/**
 * useNotebooks hook - Unified Notebook Operations with TanStack Query
 *
 * This hook provides a consistent API for notebook operations
 * using TanStack Query for caching and optimistic updates.
 *
 * MIGRATED: Now uses TanStack Query exclusively (no more feature flags)
 */

import { useNotebooksWithQuery } from './useNotebooksQuery'

export interface UseNotebooksResult {
  // State
  notebooks: any[] // Tree structure
  loading: boolean
  error: string | null
  allNotebooks: any[] // Flat list

  // CRUD operations
  createNotebook: (notebook: any) => Promise<any>
  updateNotebook: (notebook: any) => Promise<any>
  deleteNotebook: (id: string) => Promise<void>
  moveNotebook: (
    notebookId: string,
    targetParentId: string | null
  ) => Promise<void>
  getNotebook: (id: string) => any | undefined

  // Bulk operations
  refreshNotebooks: () => Promise<void>

  // Tree operations
  getRootNotebooks: () => any[]
  getNotebookChildren: (parentId: string) => any[]
  getNotebookPath: (id: string) => string[]

  // Validation
  isNameAvailable: (name: string, excludeId?: string) => boolean
  canMoveNotebook: (
    notebookId: string,
    targetParentId: string | null
  ) => boolean

  // Helpers
  getNotebookByName: (name: string) => any | undefined
  getFlattenedNotebooks: () => any[]
  buildNotebookTree: (notebooks?: any[]) => any[]

  // Force refresh (DEPRECATED - only for legacy compatibility)
  forceRefresh?: () => void
}

/**
 * Main useNotebooks hook
 * Always uses TanStack Query implementation for consistency
 */
export const useNotebooks = (): UseNotebooksResult => {
  // Always use TanStack Query implementation
  return useNotebooksWithQuery()
}

// Export type alias for backward compatibility
export type NotebooksHook = UseNotebooksResult