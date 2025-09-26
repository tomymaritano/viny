/**
 * Revision Service - Handles note revision history
 * Business logic for creating, managing, and retrieving revisions
 */

import type { Note } from '../../types'
import type { NoteRevision, RevisionServiceOptions } from '../../types/revision'
import { generateId } from '../../utils/idUtils'
import { logger } from '../../utils/logger'
import Dexie from 'dexie'

export interface IRevisionService {
  createRevision(note: Note, changeType?: 'manual' | 'auto' | 'restore'): Promise<NoteRevision>
  getRevisions(noteId: string, limit?: number): Promise<NoteRevision[]>
  getRevision(revisionId: string): Promise<NoteRevision | null>
  restoreRevision(revisionId: string): Promise<Note>
  deleteOldRevisions(noteId: string): Promise<void>
  getRevisionCount(noteId: string): Promise<number>
}

export class RevisionService implements IRevisionService {
  private db: any
  private options: RevisionServiceOptions = {
    maxRevisionsPerNote: 50,
    autoSaveInterval: 5 * 60 * 1000, // 5 minutes
    minChangeThreshold: 10, // 10 characters
  }

  constructor() {
    // Open the Dexie database
    this.db = new Dexie('VinyDatabase')
    this.db.version(3).stores({
      notes: '++id, title, [status+updatedAt], [notebookId+updatedAt], *tags, isTrashed, createdAt, updatedAt',
      notebooks: '++id, name, parentId, createdAt, updatedAt',
      metadata: '++key',
      embeddings: '++id, noteId, position, model, createdAt',
      revisions: '++id, noteId, createdAt, changeType',
    })
  }

  async createRevision(note: Note, changeType: 'manual' | 'auto' | 'restore' = 'manual'): Promise<NoteRevision> {
    try {
      const revision: NoteRevision = {
        id: generateId(),
        noteId: note.id,
        title: note.title,
        content: note.content,
        notebook: note.notebook,
        tags: note.tags,
        createdAt: new Date().toISOString(),
        changeType,
        metadata: {
          wordCount: note.content.split(/\s+/).length,
          charactersChanged: 0, // Will be calculated when comparing
        }
      }

      // Save revision to database
      await this.db.revisions.add(revision)

      // Clean up old revisions if needed
      await this.deleteOldRevisions(note.id)

      logger.debug(`Created ${changeType} revision for note ${note.id}`)
      return revision
    } catch (error) {
      logger.error('Failed to create revision', error)
      throw new Error('Failed to create revision')
    }
  }

  async getRevisions(noteId: string, limit: number = 50): Promise<NoteRevision[]> {
    try {
      const revisions = await this.db.revisions
        .where('noteId')
        .equals(noteId)
        .reverse() // Most recent first
        .limit(limit)
        .toArray()

      return revisions
    } catch (error) {
      logger.error('Failed to get revisions', error)
      throw new Error('Failed to retrieve revision history')
    }
  }

  async getRevision(revisionId: string): Promise<NoteRevision | null> {
    try {
      const revision = await this.db.revisions.get(revisionId)
      return revision || null
    } catch (error) {
      logger.error('Failed to get revision', error)
      throw new Error('Failed to retrieve revision')
    }
  }

  async restoreRevision(revisionId: string): Promise<Note> {
    try {
      const revision = await this.getRevision(revisionId)
      if (!revision) {
        throw new Error('Revision not found')
      }

      // Get the current note
      const currentNote = await this.db.notes.get(revision.noteId)
      if (!currentNote) {
        throw new Error('Note not found')
      }

      // Create a revision of the current state before restoring
      await this.createRevision(currentNote, 'restore')

      // Update the note with revision content
      const restoredNote: Note = {
        ...currentNote,
        title: revision.title,
        content: revision.content,
        notebook: revision.notebook,
        tags: revision.tags,
        updatedAt: new Date().toISOString(),
      }

      // Save the restored note
      await this.db.notes.update(revision.noteId, restoredNote)

      logger.info(`Restored note ${revision.noteId} from revision ${revisionId}`)
      return restoredNote
    } catch (error) {
      logger.error('Failed to restore revision', error)
      throw error
    }
  }

  async deleteOldRevisions(noteId: string): Promise<void> {
    try {
      const revisions = await this.getRevisions(noteId, this.options.maxRevisionsPerNote + 10)
      
      if (revisions.length > this.options.maxRevisionsPerNote) {
        // Keep only the most recent revisions
        const toDelete = revisions.slice(this.options.maxRevisionsPerNote)
        const idsToDelete = toDelete.map(r => r.id)
        
        await this.db.revisions.bulkDelete(idsToDelete)
        logger.debug(`Deleted ${idsToDelete.length} old revisions for note ${noteId}`)
      }
    } catch (error) {
      logger.error('Failed to delete old revisions', error)
      // Don't throw - this is a cleanup operation
    }
  }

  async getRevisionCount(noteId: string): Promise<number> {
    try {
      return await this.db.revisions
        .where('noteId')
        .equals(noteId)
        .count()
    } catch (error) {
      logger.error('Failed to get revision count', error)
      return 0
    }
  }

  /**
   * Check if a revision should be created based on changes
   */
  shouldCreateRevision(oldContent: string, newContent: string): boolean {
    const changeSize = Math.abs(oldContent.length - newContent.length)
    return changeSize >= this.options.minChangeThreshold
  }
}