// Storage utilities for localStorage operations with Electron file system migration
import { Note, Notebook, Settings } from '../types'
import { storageLogger as logger } from '../utils/logger'
import { electronStorageService } from './electronStorage'

class StorageService {
  private readonly NOTES_KEY = 'viny_notes'
  private readonly NOTEBOOKS_KEY = 'viny_notebooks'  
  private readonly SETTINGS_KEY = 'viny_settings'
  private readonly TAG_COLORS_KEY = 'viny_tag_colors'
  
  // Concurrency control
  private saveQueue: Map<string, { timeoutId: NodeJS.Timeout; note: Note }> = new Map()
  private isLoaded = false
  private loadPromise: Promise<Note[]> | null = null

  // Initialize storage service
  initialize(): void {
    if (!this.isLoaded) {
      this.getNotes() // This will set isLoaded = true
    }
  }

  // Notes - synchronous version for backward compatibility
  getNotes(): Note[] {
    // For backward compatibility, we still provide sync access
    // but internally we may be using async Electron storage
    if (electronStorageService.isElectronEnvironment) {
      // TODO: Refactor to use async loadNotes() instead of sync getNotes()
      // Return cached notes from the store instead
      const store = (globalThis as any).__appStore
      if (store && store.getState) {
        return store.getState().notes || []
      }
      return [] // Return empty array if store not available
    }

    try {
      const stored = localStorage.getItem(this.NOTES_KEY)
      if (!stored) {
        this.isLoaded = true
        return []
      }
      
      const parsed = JSON.parse(stored)
      // Ensure we always return an array
      if (!Array.isArray(parsed)) {
        console.warn('Notes data is not an array, resetting to empty array')
        localStorage.removeItem(this.NOTES_KEY)
        this.isLoaded = true
        return []
      }
      
      this.isLoaded = true
      return parsed
    } catch (error) {
      console.error('Error loading notes from localStorage:', error)
      // Clear corrupted data
      localStorage.removeItem(this.NOTES_KEY)
      this.isLoaded = true
      return []
    }
  }

  // Async version for proper loading
  async loadNotes(): Promise<Note[]> {
    if (electronStorageService.isElectronEnvironment) {
      try {
        const notes = await electronStorageService.getNotes()
        this.isLoaded = true
        return notes
      } catch (error) {
        logger.error('[StorageService] Failed to load notes from Electron storage:', error)
        return []
      }
    }

    if (this.loadPromise) {
      return this.loadPromise
    }

    this.loadPromise = new Promise((resolve) => {
      // Use setTimeout to make it async and avoid blocking
      setTimeout(() => {
        const notes = this.getNotes()
        resolve(notes)
      }, 0)
    })

    return this.loadPromise
  }

  saveNotes(notes: Note[]): void {
    if (electronStorageService.isElectronEnvironment) {
      // In Electron, delegate to async storage service
      electronStorageService.saveNotes(notes).catch(error => {
        logger.error('[StorageService] Failed to save notes via Electron storage:', error)
      })
      return
    }

    try {
      // Validate input
      if (!Array.isArray(notes)) {
        throw new Error('saveNotes requires an array of notes')
      }
      
      // Validate each note structure
      notes.forEach((note, index) => {
        if (!note || !note.id || typeof note.title !== 'string') {
          console.error('[StorageService] Invalid note at index', index, ':', note)
          throw new Error(`Invalid note structure at index ${index}`)
        }
      })
      
      const serialized = JSON.stringify(notes)
      localStorage.setItem(this.NOTES_KEY, serialized)
    } catch (error) {
      console.error('[StorageService] Error saving notes to localStorage:', error)
      
      // Check if it's a quota exceeded error
      if (error.name === 'QuotaExceededError') {
        throw new Error('Storage quota exceeded. Please free up space by deleting old notes.')
      }
      
      throw new Error('Failed to save notes: ' + error.message)
    }
  }

  // Debounced save to prevent race conditions
  saveNote(note: Note): void {
    if (electronStorageService.isElectronEnvironment) {
      // In Electron, we can save immediately as file system handles individual files
      electronStorageService.saveNote(note).catch(error => {
        logger.error('[StorageService] Failed to save note via Electron storage:', error)
      })
      return
    }

    try {
      // Cancel any pending save for this note
      if (this.saveQueue.has(note.id)) {
        clearTimeout(this.saveQueue.get(note.id)!.timeoutId)
      }

      // Debounce saves for this specific note
      const timeoutId = setTimeout(() => {
        try {
          this.saveNoteImmediate(note)
          this.saveQueue.delete(note.id)
        } catch (error) {
          console.error('[StorageService] Error in debounced save:', error)
          this.saveQueue.delete(note.id)
        }
      }, 100) // 100ms debounce

      this.saveQueue.set(note.id, { timeoutId, note })
    } catch (error) {
      console.error('[StorageService] Error in saveNote:', error)
      throw error
    }
  }

  // Immediate save (internal use)
  private saveNoteImmediate(note: Note): void {
    if (electronStorageService.isElectronEnvironment) {
      // In Electron, we've already saved via async API
      // The verification happens in the renderer process
      return
    }

    try {
      
      // Validate note structure
      if (!note || !note.id || !note.title) {
        throw new Error('Invalid note structure: missing id or title')
      }

      if (!this.isLoaded) {
        this.getNotes() // This will set isLoaded = true
      }

      const notes = this.getNotes()
      
      // Double-check that notes is an array
      if (!Array.isArray(notes)) {
        console.error('[StorageService] Notes is not an array in saveNoteImmediate:', notes)
        throw new Error('Invalid notes data structure')
      }
      
      const existingIndex = notes.findIndex(n => n.id === note.id)
      
      if (existingIndex >= 0) {
        notes[existingIndex] = note
      } else {
        notes.push(note)
      }
      
      this.saveNotes(notes)
      
      // Verify the save by reading back
      const verifyNotes = this.getNotes()
      const verifyNote = verifyNotes.find(n => n.id === note.id)
      if (!verifyNote) {
        throw new Error('Save verification failed: note not found after save')
      }
      
    } catch (error) {
      console.error('[StorageService] Error in saveNoteImmediate:', error)
      throw error
    }
  }

  // Force save all pending notes immediately
  flushPendingSaves(): Promise<void> {
    
    const promises: Promise<void>[] = []
    
    // Process all pending saves immediately
    this.saveQueue.forEach(({ timeoutId, note }) => {
      clearTimeout(timeoutId)
      const promise = new Promise<void>((resolve, reject) => {
        try {
          this.saveNoteImmediate(note)
          resolve()
        } catch (error) {
          console.error('[StorageService] Error flushing save for note:', note.title, error)
          reject(error)
        }
      })
      promises.push(promise)
    })
    
    this.saveQueue.clear()
    
    return Promise.all(promises).then(() => {})
  }
  
  // Force save a specific note immediately (bypass debouncing)
  saveNoteImmediately(note: Note): void {
    // Cancel any pending save for this note
    if (this.saveQueue.has(note.id)) {
      clearTimeout(this.saveQueue.get(note.id)!)
      this.saveQueue.delete(note.id)
    }
    
    // Save immediately
    this.saveNoteImmediate(note)
  }

  deleteNote(noteId: string): void {
    if (electronStorageService.isElectronEnvironment) {
      // In Electron, delete individual file
      electronStorageService.deleteNote(noteId).catch(error => {
        logger.error('[StorageService] Failed to delete note via Electron storage:', error)
      })
      return
    }

    const notes = this.getNotes().filter(note => note.id !== noteId)
    this.saveNotes(notes)
  }

  // Notebooks
  getNotebooks(): Notebook[] {
    if (electronStorageService.isElectronEnvironment) {
      // TODO: Refactor to use async loadNotebooks() instead of sync getNotebooks()
      return []
    }

    try {
      const stored = localStorage.getItem(this.NOTEBOOKS_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Error loading notebooks from localStorage:', error)
      return []
    }
  }

  async loadNotebooks(): Promise<Notebook[]> {
    if (electronStorageService.isElectronEnvironment) {
      try {
        return await electronStorageService.getNotebooks()
      } catch (error) {
        logger.error('[StorageService] Failed to load notebooks from Electron storage:', error)
        return []
      }
    }

    return this.getNotebooks()
  }

  saveNotebooks(notebooks: Notebook[]): void {
    if (electronStorageService.isElectronEnvironment) {
      electronStorageService.saveNotebooks(notebooks).catch(error => {
        logger.error('[StorageService] Failed to save notebooks via Electron storage:', error)
      })
      return
    }

    try {
      localStorage.setItem(this.NOTEBOOKS_KEY, JSON.stringify(notebooks))
    } catch (error) {
      console.error('Error saving notebooks to localStorage:', error)
      throw new Error('Failed to save notebooks')
    }
  }

  // Settings
  getSettings(): Partial<Settings> {
    if (electronStorageService.isElectronEnvironment) {
      // TODO: Refactor to use async loadSettings() instead of sync getSettings()
      return {}
    }

    try {
      const stored = localStorage.getItem(this.SETTINGS_KEY)
      return stored ? JSON.parse(stored) : {}
    } catch (error) {
      console.error('Error loading settings from localStorage:', error)
      return {}
    }
  }

  async loadSettings(): Promise<Partial<Settings>> {
    if (electronStorageService.isElectronEnvironment) {
      try {
        return await electronStorageService.getSettings()
      } catch (error) {
        logger.error('[StorageService] Failed to load settings from Electron storage:', error)
        return {}
      }
    }

    return this.getSettings()
  }

  saveSettings(settings: Partial<Settings>): void {
    if (electronStorageService.isElectronEnvironment) {
      electronStorageService.saveSettings(settings).catch(error => {
        logger.error('[StorageService] Failed to save settings via Electron storage:', error)
      })
      return
    }

    try {
      localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings))
    } catch (error) {
      console.error('Error saving settings to localStorage:', error)
      throw new Error('Failed to save settings')
    }
  }

  // Tag Colors
  getTagColors(): Record<string, string> {
    if (electronStorageService.isElectronEnvironment) {
      // Use legacy localStorage as fallback for synchronous access
      // This will read any migrated tag colors from localStorage
      return electronStorageService.getTagColorsSync()
    }

    try {
      const stored = localStorage.getItem(this.TAG_COLORS_KEY)
      return stored ? JSON.parse(stored) : {}
    } catch (error) {
      console.error('Error loading tag colors from localStorage:', error)
      return {}
    }
  }

  async loadTagColors(): Promise<Record<string, string>> {
    if (electronStorageService.isElectronEnvironment) {
      try {
        return await electronStorageService.getTagColors()
      } catch (error) {
        logger.error('[StorageService] Failed to load tag colors from Electron storage:', error)
        return {}
      }
    }

    return this.getTagColors()
  }

  saveTagColors(tagColors: Record<string, string>): void {
    if (electronStorageService.isElectronEnvironment) {
      // Save to both Electron storage and localStorage (for sync access)
      electronStorageService.saveTagColors(tagColors).catch(error => {
        logger.error('[StorageService] Failed to save tag colors via Electron storage:', error)
      })
      
      // Also save to localStorage as backup for synchronous access
      try {
        localStorage.setItem('viny_tag_colors_current', JSON.stringify(tagColors))
      } catch (error) {
        console.error('Error saving tag colors to localStorage backup:', error)
      }
      return
    }

    try {
      localStorage.setItem(this.TAG_COLORS_KEY, JSON.stringify(tagColors))
    } catch (error) {
      console.error('Error saving tag colors to localStorage:', error)
      throw new Error('Failed to save tag colors')
    }
  }

  // Utility methods
  clear(): void {
    localStorage.removeItem(this.NOTES_KEY)
    localStorage.removeItem(this.NOTEBOOKS_KEY)
    localStorage.removeItem(this.SETTINGS_KEY)
    localStorage.removeItem(this.TAG_COLORS_KEY)
  }

  export(): string {
    return JSON.stringify({
      notes: this.getNotes(),
      notebooks: this.getNotebooks(),
      settings: this.getSettings(),
      tagColors: this.getTagColors(),
      exportedAt: new Date().toISOString()
    }, null, 2)
  }

  import(data: string): void {
    try {
      const parsed = JSON.parse(data)
      
      if (parsed.notes) this.saveNotes(parsed.notes)
      if (parsed.notebooks) this.saveNotebooks(parsed.notebooks)
      if (parsed.settings) this.saveSettings(parsed.settings)
      if (parsed.tagColors) this.saveTagColors(parsed.tagColors)
    } catch (error) {
      console.error('Error importing data:', error)
      throw new Error('Invalid import data format')
    }
  }
}

export const storageService = new StorageService()
