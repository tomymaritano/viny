// Storage utilities for localStorage operations
import { Note, Notebook, Settings } from '../types'

class StorageService {
  private readonly NOTES_KEY = 'nototo_notes'
  private readonly NOTEBOOKS_KEY = 'nototo_notebooks'  
  private readonly SETTINGS_KEY = 'nototo_settings'

  // Notes
  getNotes(): Note[] {
    try {
      const stored = localStorage.getItem(this.NOTES_KEY)
      if (!stored) {
        return []
      }
      
      const parsed = JSON.parse(stored)
      // Ensure we always return an array
      if (!Array.isArray(parsed)) {
        console.warn('Notes data is not an array, resetting to empty array')
        localStorage.removeItem(this.NOTES_KEY)
        return []
      }
      
      return parsed
    } catch (error) {
      console.error('Error loading notes from localStorage:', error)
      // Clear corrupted data
      localStorage.removeItem(this.NOTES_KEY)
      return []
    }
  }

  saveNotes(notes: Note[]): void {
    try {
      localStorage.setItem(this.NOTES_KEY, JSON.stringify(notes))
    } catch (error) {
      console.error('Error saving notes to localStorage:', error)
      throw new Error('Failed to save notes')
    }
  }

  saveNote(note: Note): void {
    try {
      const notes = this.getNotes()
      
      // Double-check that notes is an array
      if (!Array.isArray(notes)) {
        console.error('Notes is not an array in saveNote:', notes)
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
      console.error('Error in saveNote:', error)
      throw error
    }
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

  // Utility methods
  clear(): void {
    localStorage.removeItem(this.NOTES_KEY)
    localStorage.removeItem(this.NOTEBOOKS_KEY)
    localStorage.removeItem(this.SETTINGS_KEY)
  }

  export(): string {
    return JSON.stringify({
      notes: this.getNotes(),
      notebooks: this.getNotebooks(),
      settings: this.getSettings(),
      exportedAt: new Date().toISOString()
    }, null, 2)
  }

  import(data: string): void {
    try {
      const parsed = JSON.parse(data)
      
      if (parsed.notes) this.saveNotes(parsed.notes)
      if (parsed.notebooks) this.saveNotebooks(parsed.notebooks)
      if (parsed.settings) this.saveSettings(parsed.settings)
    } catch (error) {
      console.error('Error importing data:', error)
      throw new Error('Invalid import data format')
    }
  }
}

export const storageService = new StorageService()