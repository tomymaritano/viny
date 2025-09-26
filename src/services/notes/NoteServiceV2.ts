/**
 * Note Service V2 - Uses pure CRUD repository
 * All business logic lives here, not in the repository
 */

import type { Note } from '../../types'
import type { INoteRepository, IRepository, NoteQueryFilters } from '../../repositories/interfaces/IBaseRepository'
import type { 
  INoteService, 
  CreateNoteDto, 
  UpdateNoteDto, 
  NoteSearchOptions,
  NoteStatistics 
} from './INoteService'
import { generateId } from '../../utils/idUtils'
import { logger } from '../../utils/logger'
import { RevisionService } from '../revision/RevisionService'

export class NoteServiceV2 implements INoteService {
  private revisionService: RevisionService

  constructor(private repository: IRepository) {
    this.revisionService = new RevisionService()
  }

  private get notes(): INoteRepository {
    return this.repository.notes
  }

  async getAllNotes(): Promise<Note[]> {
    try {
      return await this.notes.findAll({ orderBy: 'updatedAt', orderDirection: 'desc' })
    } catch (error) {
      logger.error('Failed to get all notes', error)
      throw new Error('Failed to retrieve notes')
    }
  }

  async getActiveNotes(): Promise<Note[]> {
    try {
      const notes = await this.notes.findMany(
        { isTrashed: false },
        { orderBy: 'updatedAt', orderDirection: 'desc' }
      )
      return notes
    } catch (error) {
      logger.error('Failed to get active notes', error)
      throw new Error('Failed to retrieve active notes')
    }
  }

  async getTrashedNotes(): Promise<Note[]> {
    try {
      const notes = await this.notes.findMany(
        { isTrashed: true },
        { orderBy: 'updatedAt', orderDirection: 'desc' }
      )
      return notes
    } catch (error) {
      logger.error('Failed to get trashed notes', error)
      throw new Error('Failed to retrieve trashed notes')
    }
  }

  async getNotesInNotebook(notebookId: string): Promise<Note[]> {
    try {
      logger.debug(`getNotesInNotebook called with ID: "${notebookId}"`)
      
      // Get all active notes first
      const allNotes = await this.notes.findMany(
        { isTrashed: false },
        { orderBy: 'updatedAt', orderDirection: 'desc' }
      )
      
      console.log('🔴 NoteServiceV2.getNotesInNotebook DEBUG:', {
        notebookId,
        totalActiveNotes: allNotes.length,
        noteNotebookValues: allNotes.map(n => ({ 
          id: n.id, 
          title: n.title, 
          notebook: n.notebook 
        }))
      })
      
      // Filter by notebook - check the 'notebook' field (ElectronDocumentRepository uses this)
      const notes = allNotes.filter(note => {
        const matches = note.notebook === notebookId
        console.log(`🔴 Checking note "${note.title}": notebook="${note.notebook}" vs notebookId="${notebookId}" => ${matches}`)
        return matches
      })
      
      logger.debug(`Notes found in notebook ID "${notebookId}": ${notes.length}`)
      console.log('🔴 Final filtered notes:', notes.map(n => n.title))
      
      return notes
    } catch (error) {
      logger.error(`Failed to get notes in notebook ${notebookId}`, error)
      throw new Error('Failed to retrieve notebook notes')
    }
  }

  async getNotesWithTag(tag: string): Promise<Note[]> {
    try {
      const notes = await this.notes.findMany(
        { tags: [tag], isTrashed: false },
        { orderBy: 'updatedAt', orderDirection: 'desc' }
      )
      return notes
    } catch (error) {
      logger.error(`Failed to get notes with tag ${tag}`, error)
      throw new Error('Failed to retrieve tagged notes')
    }
  }

  async getNotesWithStatus(status: string): Promise<Note[]> {
    try {
      const notes = await this.notes.findMany(
        { status, isTrashed: false },
        { orderBy: 'updatedAt', orderDirection: 'desc' }
      )
      return notes
    } catch (error) {
      logger.error(`Failed to get notes with status ${status}`, error)
      throw new Error('Failed to retrieve notes by status')
    }
  }

  async getPinnedNotes(): Promise<Note[]> {
    try {
      const notes = await this.notes.findMany(
        { isPinned: true, isTrashed: false },
        { orderBy: 'updatedAt', orderDirection: 'desc' }
      )
      return notes
    } catch (error) {
      logger.error('Failed to get pinned notes', error)
      throw new Error('Failed to retrieve pinned notes')
    }
  }

  async createNote(data: CreateNoteDto): Promise<Note> {
    try {
      // Validate required fields
      if (!data.title || data.title.trim() === '') {
        throw new Error('Title is required')
      }
      
      const note: Note = {
        id: generateId(),
        title: data.title.trim(),
        content: data.content || '',
        notebook: data.notebook || 'default',
        status: data.status || 'active',
        tags: data.tags || [],
        isPinned: data.isPinned || false,
        isTrashed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      const created = await this.notes.create(note)
      logger.info(`Note created: ${created.id}`, {
        id: created.id,
        notebook: created.notebook,
        inputNotebook: data.notebook
      })
      return created
    } catch (error) {
      logger.error('Failed to create note', error)
      throw error instanceof Error ? error : new Error('Failed to create note')
    }
  }

  async updateNote(id: string, data: UpdateNoteDto): Promise<Note> {
    try {
      // Check if note exists
      const existing = await this.notes.findById(id)
      if (!existing) {
        throw new Error('Note not found')
      }

      // Don't allow updating to different trash state via update
      const { isTrashed, ...updateData } = data
      
      // Check if we should create a revision (significant content change)
      if (updateData.content && 
          existing.content !== updateData.content &&
          this.revisionService.shouldCreateRevision(existing.content, updateData.content)) {
        // Create revision before updating
        await this.revisionService.createRevision(existing, 'auto')
      }
      
      const updated = await this.notes.update(id, updateData)
      logger.info(`Note updated: ${id}`)
      return updated
    } catch (error) {
      logger.error(`Failed to update note ${id}`, error)
      throw error
    }
  }

  async deleteNote(id: string, permanent = false): Promise<void> {
    try {
      if (permanent) {
        await this.notes.delete(id)
        logger.info(`Note permanently deleted: ${id}`)
      } else {
        await this.notes.update(id, { isTrashed: true })
        logger.info(`Note moved to trash: ${id}`)
      }
    } catch (error) {
      logger.error(`Failed to delete note ${id}`, error)
      throw new Error('Failed to delete note')
    }
  }

  async restoreNote(id: string): Promise<Note> {
    try {
      const updated = await this.notes.update(id, { isTrashed: false })
      logger.info(`Note restored: ${id}`)
      return updated
    } catch (error) {
      logger.error(`Failed to restore note ${id}`, error)
      throw new Error('Failed to restore note')
    }
  }

  async togglePin(noteId: string): Promise<Note> {
    try {
      const note = await this.notes.findById(noteId)
      if (!note) {
        throw new Error('Note not found')
      }

      const updated = await this.notes.update(noteId, { isPinned: !note.isPinned })
      logger.info(`Note pin toggled: ${noteId}`)
      return updated
    } catch (error) {
      logger.error(`Failed to toggle pin for note ${noteId}`, error)
      throw error
    }
  }

  async moveToTrash(noteId: string): Promise<void> {
    try {
      await this.notes.update(noteId, { isTrashed: true })
      logger.info(`Note moved to trash: ${noteId}`)
    } catch (error) {
      logger.error(`Failed to move note to trash ${noteId}`, error)
      throw new Error('Failed to move note to trash')
    }
  }

  async emptyTrash(): Promise<void> {
    try {
      // Get all trashed notes
      const trashedNotes = await this.notes.findMany({ isTrashed: true })
      const trashedIds = trashedNotes.map(note => note.id)
      
      if (trashedIds.length > 0) {
        // Permanently delete all trashed notes
        await this.notes.deleteMany(trashedIds)
        logger.info(`Permanently deleted ${trashedIds.length} notes from trash`)
      }
    } catch (error) {
      logger.error('Failed to empty trash', error)
      throw new Error('Failed to empty trash')
    }
  }

  async duplicateNote(noteId: string): Promise<Note> {
    try {
      const original = await this.notes.findById(noteId)
      if (!original) {
        throw new Error('Note not found')
      }

      const duplicate: Note = {
        ...original,
        id: generateId(),
        title: `${original.title} (Copy)`,
        isPinned: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      const created = await this.notes.create(duplicate)
      logger.info(`Note duplicated: ${noteId} -> ${created.id}`)
      return created
    } catch (error) {
      logger.error(`Failed to duplicate note ${noteId}`, error)
      throw error
    }
  }

  async addTag(noteId: string, tag: string): Promise<Note> {
    try {
      const note = await this.notes.findById(noteId)
      if (!note) {
        throw new Error('Note not found')
      }

      const tags = note.tags || []
      if (!tags.includes(tag)) {
        tags.push(tag)
        const updated = await this.notes.update(noteId, { tags })
        logger.info(`Tag added to note: ${noteId}`)
        return updated
      }

      return note
    } catch (error) {
      logger.error(`Failed to add tag to note ${noteId}`, error)
      throw error
    }
  }

  async removeTag(noteId: string, tag: string): Promise<Note> {
    try {
      const note = await this.notes.findById(noteId)
      if (!note) {
        throw new Error('Note not found')
      }

      const tags = (note.tags || []).filter(t => t !== tag)
      const updated = await this.notes.update(noteId, { tags })
      logger.info(`Tag removed from note: ${noteId}`)
      return updated
    } catch (error) {
      logger.error(`Failed to remove tag from note ${noteId}`, error)
      throw error
    }
  }

  async searchNotes(options: NoteSearchOptions): Promise<Note[]> {
    try {
      // Build filters from search options
      const filters: NoteQueryFilters = {
        isTrashed: false,
      }

      if (options.notebook) {
        // notebookId in DB contains the notebook name
        filters.notebookId = options.notebook
      }

      if (options.status) {
        filters.status = options.status
      }

      if (options.tags?.length) {
        filters.tags = options.tags
      }

      // Get filtered notes
      let notes = await this.notes.findMany(filters)

      // Apply text search if query provided
      if (options.query) {
        const searchTerm = options.query.toLowerCase()
        notes = notes.filter(note => {
          const titleMatch = note.title.toLowerCase().includes(searchTerm)
          const contentMatch = note.content.toLowerCase().includes(searchTerm)
          const tagMatch = note.tags?.some(tag => 
            tag.toLowerCase().includes(searchTerm)
          )
          
          return titleMatch || contentMatch || tagMatch
        })
      }

      // Sort by relevance or date
      notes.sort((a, b) => {
        if (options.sortBy === 'relevance' && options.query) {
          // Simple relevance: title matches first
          const aTitle = a.title.toLowerCase().includes(options.query.toLowerCase())
          const bTitle = b.title.toLowerCase().includes(options.query.toLowerCase())
          if (aTitle && !bTitle) return -1
          if (!aTitle && bTitle) return 1
        }
        
        // Default to date sorting
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      })

      // Apply limit
      if (options.limit) {
        notes = notes.slice(0, options.limit)
      }

      return notes
    } catch (error) {
      logger.error('Failed to search notes', error)
      throw new Error('Failed to search notes')
    }
  }

  async createBatch(notesData: CreateNoteDto[]): Promise<Note[]> {
    try {
      const notes: Note[] = notesData.map(data => ({
        id: generateId(),
        title: data.title || 'New Note',
        content: data.content || '',
        notebook: data.notebook || 'default',
        status: data.status || 'active',
        tags: data.tags || [],
        isPinned: data.isPinned || false,
        isTrashed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }))

      const created = await this.notes.createMany(notes)
      logger.info(`Batch created ${created.length} notes`)
      return created
    } catch (error) {
      logger.error('Failed to batch create notes', error)
      throw new Error('Failed to batch create notes')
    }
  }

  async updateBatch(updates: Array<{ id: string; data: UpdateNoteDto }>): Promise<Note[]> {
    try {
      // Filter out any attempts to change trash state
      const cleanUpdates = updates.map(({ id, data }) => {
        const { isTrashed, ...cleanData } = data
        return { id, data: cleanData }
      })

      const updated = await this.notes.updateMany(cleanUpdates)
      logger.info(`Batch updated ${updated.length} notes`)
      return updated
    } catch (error) {
      logger.error('Failed to batch update notes', error)
      throw new Error('Failed to batch update notes')
    }
  }

  async deleteBatch(noteIds: string[], permanent = false): Promise<void> {
    try {
      if (permanent) {
        await this.notes.deleteMany(noteIds)
        logger.info(`Batch permanently deleted ${noteIds.length} notes`)
      } else {
        const updates = noteIds.map(id => ({ id, data: { isTrashed: true } }))
        await this.notes.updateMany(updates)
        logger.info(`Batch moved ${noteIds.length} notes to trash`)
      }
    } catch (error) {
      logger.error('Failed to batch delete notes', error)
      throw new Error('Failed to batch delete notes')
    }
  }

  async getStatistics(): Promise<NoteStatistics> {
    try {
      const allNotes = await this.notes.findAll()
      
      const stats: NoteStatistics = {
        total: allNotes.length,
        active: allNotes.filter(n => !n.isTrashed).length,
        trashed: allNotes.filter(n => n.isTrashed).length,
        pinned: allNotes.filter(n => n.isPinned && !n.isTrashed).length,
        byStatus: {},
        byNotebook: {},
        byTag: {},
      }

      // Count by status
      for (const note of allNotes) {
        if (!note.isTrashed) {
          stats.byStatus[note.status] = (stats.byStatus[note.status] || 0) + 1
          stats.byNotebook[note.notebook] = (stats.byNotebook[note.notebook] || 0) + 1
          
          if (note.tags) {
            for (const tag of note.tags) {
              stats.byTag[tag] = (stats.byTag[tag] || 0) + 1
            }
          }
        }
      }

      return stats
    } catch (error) {
      logger.error('Failed to get statistics', error)
      throw new Error('Failed to get statistics')
    }
  }
}