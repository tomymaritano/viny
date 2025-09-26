import { app } from 'electron'
import * as path from 'path'
import { promises as fs } from 'fs'
import * as fsSync from 'fs'
import type { Note, Notebook, Settings, StorageResult, StorageInfo, Metadata } from '../../shared/types'

export class FileSystemStorage {
  private readonly dataDir: string
  private readonly notesDir: string
  private readonly backupDir: string
  private readonly metadataFile: string
  private readonly notebooksFile: string
  private readonly settingsFile: string
  private readonly tagColorsFile: string

  constructor() {
    this.dataDir = path.join(app.getPath('userData'), 'viny-data')
    this.notesDir = path.join(this.dataDir, 'notes')
    this.backupDir = path.join(this.dataDir, 'backups')
    this.metadataFile = path.join(this.dataDir, 'metadata.json')
    this.notebooksFile = path.join(this.dataDir, 'notebooks.json')
    this.settingsFile = path.join(this.dataDir, 'settings.json')
    this.tagColorsFile = path.join(this.dataDir, 'tag-colors.json')
    
    this.initializeDirectories()
  }

  async initializeDirectories(): Promise<void> {
    try {
      await fs.mkdir(this.dataDir, { recursive: true })
      await fs.mkdir(this.notesDir, { recursive: true })
      await fs.mkdir(this.backupDir, { recursive: true })
      console.log('[FileSystemStorage] Initialized directories at:', this.dataDir)
    } catch (error) {
      console.error('[FileSystemStorage] Failed to initialize directories:', error)
    }
  }

  // Generate backup filename with timestamp
  generateBackupPath(filename: string): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const ext = path.extname(filename)
    const name = path.basename(filename, ext)
    return path.join(this.backupDir, `${name}-${timestamp}${ext}`)
  }

  // Create backup before modifying file
  async createFileBackup(filePath: string): Promise<string | null> {
    try {
      if (fsSync.existsSync(filePath)) {
        const backupPath = this.generateBackupPath(path.basename(filePath))
        await fs.copyFile(filePath, backupPath)
        console.log('[FileSystemStorage] Created backup:', backupPath)
        return backupPath
      }
    } catch (error) {
      console.warn('[FileSystemStorage] Failed to create backup for:', filePath, error)
    }
    return null
  }

  // Save individual note with backup
  async saveNote(note: Note): Promise<StorageResult> {
    if (!note || !note.id) {
      throw new Error('Invalid note: missing id')
    }

    const noteFile = path.join(this.notesDir, `note-${note.id}.json`)
    
    try {
      // Create backup of existing note
      await this.createFileBackup(noteFile)
      
      // Save new note
      await fs.writeFile(noteFile, JSON.stringify(note, null, 2))
      console.log('[FileSystemStorage] Saved note:', note.id)
      
      // Update metadata
      await this.updateMetadata('note_saved', { id: note.id, title: note.title })
      
      return { success: true, path: noteFile }
    } catch (error: any) {
      console.error('[FileSystemStorage] Failed to save note:', note.id, error)
      throw new Error(`Failed to save note: ${error.message}`)
    }
  }

  // Load individual note
  async loadNote(id: string): Promise<Note | null> {
    const noteFile = path.join(this.notesDir, `note-${id}.json`)
    
    try {
      const data = await fs.readFile(noteFile, 'utf-8')
      return JSON.parse(data) as Note
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        return null // Note not found
      }
      console.error('[FileSystemStorage] Failed to load note:', id, error)
      throw new Error(`Failed to load note: ${error.message}`)
    }
  }

  // Load all notes
  async loadAllNotes(): Promise<Note[]> {
    try {
      const files = await fs.readdir(this.notesDir)
      const noteFiles = files.filter(file => file.startsWith('note-') && file.endsWith('.json'))
      
      const notes: Note[] = []
      for (const file of noteFiles) {
        try {
          const filePath = path.join(this.notesDir, file)
          const data = await fs.readFile(filePath, 'utf-8')
          const note = JSON.parse(data) as Note
          notes.push(note)
        } catch (error) {
          console.warn('[FileSystemStorage] Failed to load note file:', file, error)
          // Continue loading other notes even if one fails
        }
      }
      
      console.log('[FileSystemStorage] Loaded', notes.length, 'notes')
      return notes
    } catch (error) {
      console.error('[FileSystemStorage] Failed to load notes:', error)
      return []
    }
  }

  // Delete note with backup
  async deleteNote(id: string): Promise<StorageResult> {
    const noteFile = path.join(this.notesDir, `note-${id}.json`)
    
    try {
      if (fsSync.existsSync(noteFile)) {
        // Create backup before deletion
        const backupPath = await this.createFileBackup(noteFile)
        
        // Delete the note
        await fs.unlink(noteFile)
        console.log('[FileSystemStorage] Deleted note:', id)
        
        // Update metadata
        await this.updateMetadata('note_deleted', { id, backupPath })
        
        return { success: true, backupPath: backupPath || undefined }
      }
      return { success: false, error: 'Note not found' }
    } catch (error: any) {
      console.error('[FileSystemStorage] Failed to delete note:', id, error)
      throw new Error(`Failed to delete note: ${error.message}`)
    }
  }

  // Save/load other data types with backup
  async saveDataFile(filePath: string, data: any): Promise<StorageResult> {
    try {
      await this.createFileBackup(filePath)
      await fs.writeFile(filePath, JSON.stringify(data, null, 2))
      return { success: true }
    } catch (error: any) {
      console.error('[FileSystemStorage] Failed to save data file:', filePath, error)
      throw new Error(`Failed to save data: ${error.message}`)
    }
  }

  async loadDataFile<T>(filePath: string, defaultValue: T): Promise<T> {
    try {
      const data = await fs.readFile(filePath, 'utf-8')
      return JSON.parse(data) as T
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        return defaultValue
      }
      
      // If JSON parsing fails, try to recover or use default value
      if (error instanceof SyntaxError) {
        console.warn('[FileSystemStorage] Invalid JSON in file:', filePath, error.message)
        
        // For metadata.json, we can safely recreate it
        if (filePath === this.metadataFile) {
          console.log('[FileSystemStorage] Recreating metadata file with default value')
          await this.saveDataFile(filePath, defaultValue)
          return defaultValue
        }
        
        // For other files, create a backup and use default value
        const backupPath = await this.createFileBackup(filePath)
        console.log('[FileSystemStorage] Created backup of corrupted file:', backupPath)
        return defaultValue
      }
      
      console.error('[FileSystemStorage] Failed to load data file:', filePath, error)
      throw new Error(`Failed to load data: ${error.message}`)
    }
  }

  // Notebooks operations
  async saveNotebooks(notebooks: Notebook[]): Promise<StorageResult> {
    return this.saveDataFile(this.notebooksFile, notebooks)
  }

  async loadNotebooks(): Promise<Notebook[]> {
    return this.loadDataFile<Notebook[]>(this.notebooksFile, [])
  }

  // Settings operations
  async saveSettings(settings: Partial<Settings>): Promise<StorageResult> {
    return this.saveDataFile(this.settingsFile, settings)
  }

  async loadSettings(): Promise<Partial<Settings>> {
    return this.loadDataFile<Partial<Settings>>(this.settingsFile, {})
  }

  // Tag colors operations
  async saveTagColors(tagColors: Record<string, string>): Promise<StorageResult> {
    return this.saveDataFile(this.tagColorsFile, tagColors)
  }

  async loadTagColors(): Promise<Record<string, string>> {
    return this.loadDataFile<Record<string, string>>(this.tagColorsFile, {})
  }

  // Metadata operations
  async updateMetadata(action: string, data: any): Promise<void> {
    try {
      const metadata = await this.loadDataFile<Metadata>(this.metadataFile, {
        created: new Date().toISOString(),
        actions: []
      })
      
      metadata.actions.push({
        action,
        data,
        timestamp: new Date().toISOString()
      })
      
      // Keep only last 1000 actions to prevent file from growing too large
      if (metadata.actions.length > 1000) {
        metadata.actions = metadata.actions.slice(-1000)
      }
      
      await this.saveDataFile(this.metadataFile, metadata)
    } catch (error) {
      console.warn('[FileSystemStorage] Failed to update metadata:', error)
      // Non-critical error, don't throw
    }
  }

  // Get storage info
  async getStorageInfo(): Promise<StorageInfo> {
    try {
      const notes = await this.loadAllNotes()
      const notebooks = await this.loadNotebooks()
      const settings = await this.loadSettings()
      const tagColors = await this.loadTagColors()
      
      return {
        dataDirectory: this.dataDir,
        notesCount: notes.length,
        notebooksCount: notebooks.length,
        hasSettings: Object.keys(settings).length > 0,
        tagColorsCount: Object.keys(tagColors).length,
        directories: {
          data: this.dataDir,
          notes: this.notesDir,
          backups: this.backupDir
        }
      }
    } catch (error) {
      console.error('[FileSystemStorage] Failed to get storage info:', error)
      throw error
    }
  }

  // Get data directory
  getDataDirectory(): string {
    return this.dataDir
  }
}