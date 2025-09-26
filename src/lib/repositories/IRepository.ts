/**
 * Base repository interfaces for storage abstraction
 * Eliminates the 6-layer storage architecture in favor of clean separation
 */

import type { AppSettings } from '../../types/settings'
import type { Note, Notebook } from '../../types'

/**
 * Unified error handling for all storage operations
 */
export class StorageError extends Error {
  constructor(
    public operation: string,
    public cause: Error,
    public retry = false
  ) {
    super(`Storage operation '${operation}' failed: ${cause.message}`)
    this.name = 'StorageError'
  }
}

/**
 * Settings Repository Interface
 * Handles all settings persistence operations
 */
export interface ISettingsRepository {
  // Core settings operations
  getSettings(): Promise<AppSettings>
  saveSettings(settings: Partial<AppSettings>): Promise<void>
  resetSettings(): Promise<void>

  // Specific setting operations
  getSetting<K extends keyof AppSettings>(key: K): Promise<AppSettings[K]>
  setSetting<K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ): Promise<void>

  // Tag color management (consolidated from multiple places)
  getTagColors(): Promise<Record<string, string>>
  saveTagColors(tagColors: Record<string, string>): Promise<void>

  // Watch for changes (for real-time updates)
  watch<K extends keyof AppSettings>(
    key: K,
    callback: (value: AppSettings[K]) => void
  ): () => void

  // Import/Export
  export(): Promise<string>
  import(data: string): Promise<void>
}

/**
 * Document Repository Interface
 * Handles all document persistence (notes, notebooks)
 */
export interface IDocumentRepository {
  // Initialization
  initialize(): Promise<void>

  // Notes operations
  getNotes(): Promise<Note[]>
  getNote(id: string): Promise<Note | null>
  saveNote(note: Note): Promise<Note>
  saveNotes(notes: Note[]): Promise<Note[]>
  deleteNote(id: string): Promise<void>
  searchNotes(query: string): Promise<Note[]>

  // Notebooks operations
  getNotebooks(): Promise<Notebook[]>
  saveNotebook(notebook: Notebook): Promise<Notebook>
  deleteNotebook(id: string): Promise<void>

  // Utilities
  exportAll(): Promise<string>
  importAll(data: string): Promise<void>
  destroy(): Promise<void>
}

/**
 * Repository factory for dependency injection
 */
export interface IRepositoryFactory {
  createSettingsRepository(): ISettingsRepository
  createDocumentRepository(): IDocumentRepository
}

/**
 * Storage adapter detection utilities
 */
export const StorageUtils = {
  isElectron(): boolean {
    return typeof window !== 'undefined' && window.electronAPI !== undefined
  },

  hasLocalStorage(): boolean {
    try {
      return typeof localStorage !== 'undefined'
    } catch {
      return false
    }
  },

  hasIndexedDB(): boolean {
    try {
      return typeof indexedDB !== 'undefined'
    } catch {
      return false
    }
  },
} as const
