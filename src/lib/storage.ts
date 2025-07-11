// Storage utilities for localStorage operations
import { Note, Notebook, Settings } from '../types'

class StorageService {
  private readonly NOTES_KEY = 'nototo_notes'
  private readonly NOTEBOOKS_KEY = 'nototo_notebooks'  
  private readonly SETTINGS_KEY = 'nototo_settings'
  private readonly TAG_COLORS_KEY = 'nototo_tag_colors'
  
  // Concurrency control
  private saveQueue: Map<string, NodeJS.Timeout> = new Map()
  private isLoaded = false
  private loadPromise: Promise<Note[]> | null = null

  // Notes - synchronous version for backward compatibility
  getNotes(): Note[] {
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
    try {
      localStorage.setItem(this.NOTES_KEY, JSON.stringify(notes))
    } catch (error) {
      console.error('Error saving notes to localStorage:', error)
      throw new Error('Failed to save notes')
    }
  }

  // Debounced save to prevent race conditions
  saveNote(note: Note): void {
    try {
      // Cancel any pending save for this note
      if (this.saveQueue.has(note.id)) {
        clearTimeout(this.saveQueue.get(note.id)!)
      }

      // Debounce saves for this specific note
      const timeoutId = setTimeout(() => {
        this.saveNoteImmediate(note)
        this.saveQueue.delete(note.id)
      }, 100) // 100ms debounce

      this.saveQueue.set(note.id, timeoutId)
    } catch (error) {
      console.error('Error in saveNote:', error)
      throw error
    }
  }

  // Immediate save (internal use)
  private saveNoteImmediate(note: Note): void {
    try {
      if (!this.isLoaded) {
        console.warn('Attempting to save before data is loaded, forcing load first')
        this.getNotes() // This will set isLoaded = true
      }

      const notes = this.getNotes()
      
      // Double-check that notes is an array
      if (!Array.isArray(notes)) {
        console.error('Notes is not an array in saveNoteImmediate:', notes)
        throw new Error('Invalid notes data structure')
      }
      
      const existingIndex = notes.findIndex(n => n.id === note.id)
      
      if (existingIndex >= 0) {
        notes[existingIndex] = note
      } else {
        notes.push(note)
      }
      
      this.saveNotes(notes)
    } catch (error) {
      console.error('Error in saveNoteImmediate:', error)
      throw error
    }
  }

  // Force save all pending notes
  flushPendingSaves(): void {
    this.saveQueue.forEach((timeoutId, noteId) => {
      clearTimeout(timeoutId)
    })
    this.saveQueue.clear()
  }

  deleteNote(noteId: string): void {
    const notes = this.getNotes().filter(note => note.id !== noteId)
    this.saveNotes(notes)
  }

  // Notebooks
  getNotebooks(): Notebook[] {
    try {
      const stored = localStorage.getItem(this.NOTEBOOKS_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Error loading notebooks from localStorage:', error)
      return []
    }
  }

  saveNotebooks(notebooks: Notebook[]): void {
    try {
      localStorage.setItem(this.NOTEBOOKS_KEY, JSON.stringify(notebooks))
    } catch (error) {
      console.error('Error saving notebooks to localStorage:', error)
      throw new Error('Failed to save notebooks')
    }
  }

  // Settings
  getSettings(): Partial<Settings> {
    try {
      const stored = localStorage.getItem(this.SETTINGS_KEY)
      return stored ? JSON.parse(stored) : {}
    } catch (error) {
      console.error('Error loading settings from localStorage:', error)
      return {}
    }
  }

  saveSettings(settings: Partial<Settings>): void {
    try {
      localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings))
    } catch (error) {
      console.error('Error saving settings to localStorage:', error)
      throw new Error('Failed to save settings')
    }
  }

  // Tag Colors
  getTagColors(): Record<string, string> {
    try {
      const stored = localStorage.getItem(this.TAG_COLORS_KEY)
      return stored ? JSON.parse(stored) : {}
    } catch (error) {
      console.error('Error loading tag colors from localStorage:', error)
      return {}
    }
  }

  saveTagColors(tagColors: Record<string, string>): void {
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