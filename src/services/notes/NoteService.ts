/**
 * Note Service Implementation
 * Handles all business logic for notes
 * Uses repository for data access
 */

import type { INoteService, CreateNoteDto, UpdateNoteDto, NoteSearchOptions, NoteStatistics } from './INoteService'
import type { Note } from '../../types'
import type { IDocumentRepository } from '../../lib/repositories/IRepository'
import { generateNoteId } from '../../utils/idUtils'
import { getCurrentTimestamp } from '../../utils/dateUtils'
import { MarkdownProcessor } from '../../lib/markdown'
import { noteLogger as logger } from '../../utils/logger'

export class NoteService implements INoteService {
  constructor(private repository: IDocumentRepository) {}

  // Query operations
  async getAllNotes(): Promise<Note[]> {
    return this.repository.getNotes()
  }

  async getActiveNotes(): Promise<Note[]> {
    const notes = await this.repository.getNotes()
    return notes.filter(note => !note.isTrashed)
  }

  async getTrashedNotes(): Promise<Note[]> {
    const notes = await this.repository.getNotes()
    return notes.filter(note => note.isTrashed)
  }

  async getNoteById(id: string): Promise<Note | null> {
    return this.repository.getNote(id)
  }

  async getNotesInNotebook(notebookId: string): Promise<Note[]> {
    const notes = await this.getActiveNotes()
    return notes.filter(note => note.notebook === notebookId)
  }

  async getNotesByTag(tag: string): Promise<Note[]> {
    const notes = await this.getActiveNotes()
    return notes.filter(note => note.tags?.includes(tag))
  }

  async getNotesByStatus(status: Note['status']): Promise<Note[]> {
    const notes = await this.getActiveNotes()
    return notes.filter(note => note.status === status)
  }

  async getPinnedNotes(): Promise<Note[]> {
    const notes = await this.getActiveNotes()
    return notes.filter(note => note.isPinned)
  }

  async getRecentNotes(limit: number = 10): Promise<Note[]> {
    const notes = await this.getActiveNotes()
    return notes
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, limit)
  }

  // Search operations
  async searchNotes(options: NoteSearchOptions): Promise<Note[]> {
    let notes = await this.getActiveNotes()

    if (options.query) {
      const query = options.query.toLowerCase()
      notes = notes.filter(note => 
        note.title.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query) ||
        note.tags?.some(tag => tag.toLowerCase().includes(query))
      )
    }

    if (options.notebook) {
      notes = notes.filter(note => note.notebook === options.notebook)
    }

    if (options.tags && options.tags.length > 0) {
      notes = notes.filter(note => 
        options.tags!.every(tag => note.tags?.includes(tag))
      )
    }

    if (options.status) {
      notes = notes.filter(note => note.status === options.status)
    }

    if (options.limit) {
      notes = notes.slice(0, options.limit)
    }

    return notes
  }

  // Mutation operations
  async createNote(data: CreateNoteDto): Promise<Note> {
    const newNote: Note = {
      id: generateNoteId(),
      title: data.title || 'Untitled Note',
      content: data.content || '',
      notebook: data.notebook || 'personal',
      tags: data.tags || [],
      status: data.status || 'draft',
      isPinned: data.isPinned || false,
      isTrashed: false,
      createdAt: getCurrentTimestamp(),
      updatedAt: getCurrentTimestamp(),
    }

    // Extract title from content if not provided
    if (!data.title && data.content) {
      newNote.title = MarkdownProcessor.extractTitle(data.content) || 'Untitled Note'
    }

    logger.debug('Creating new note:', newNote.id)
    return this.repository.saveNote(newNote)
  }

  async updateNote(id: string, data: UpdateNoteDto): Promise<Note> {
    const existingNote = await this.repository.getNote(id)
    if (!existingNote) {
      throw new Error(`Note with id ${id} not found`)
    }

    const updatedNote: Note = {
      ...existingNote,
      ...data,
      updatedAt: getCurrentTimestamp(),
    }

    // Extract title from content if needed
    if (data.content !== undefined && !data.title) {
      updatedNote.title = MarkdownProcessor.extractTitle(data.content) || existingNote.title
    }

    logger.debug('Updating note:', id)
    return this.repository.saveNote(updatedNote)
  }

  async deleteNote(id: string): Promise<void> {
    await this.moveToTrash(id)
  }

  async permanentlyDeleteNote(id: string): Promise<void> {
    logger.debug('Permanently deleting note:', id)
    await this.repository.deleteNote(id)
  }

  async duplicateNote(id: string): Promise<Note> {
    const original = await this.repository.getNote(id)
    if (!original) {
      throw new Error(`Note with id ${id} not found`)
    }

    const duplicated: Note = {
      ...original,
      id: generateNoteId(),
      title: `${original.title} (Copy)`,
      isPinned: false,
      createdAt: getCurrentTimestamp(),
      updatedAt: getCurrentTimestamp(),
    }

    logger.debug('Duplicating note:', id)
    return this.repository.saveNote(duplicated)
  }

  // Bulk operations
  async createMultipleNotes(notesData: CreateNoteDto[]): Promise<Note[]> {
    const notes = await Promise.all(
      notesData.map(data => this.createNote(data))
    )
    return notes
  }

  async deleteMultipleNotes(ids: string[]): Promise<void> {
    await Promise.all(ids.map(id => this.moveToTrash(id)))
  }

  async moveNotesToNotebook(noteIds: string[], notebookId: string): Promise<void> {
    await Promise.all(
      noteIds.map(id => this.updateNote(id, { notebook: notebookId }))
    )
  }

  // Special operations
  async togglePin(id: string): Promise<Note> {
    const note = await this.repository.getNote(id)
    if (!note) {
      throw new Error(`Note with id ${id} not found`)
    }

    return this.updateNote(id, { isPinned: !note.isPinned })
  }

  async moveToTrash(id: string): Promise<void> {
    logger.debug('Moving note to trash:', id)
    await this.updateNote(id, { 
      isTrashed: true,
      trashedAt: getCurrentTimestamp()
    })
  }

  async restoreFromTrash(id: string): Promise<void> {
    logger.debug('Restoring note from trash:', id)
    await this.updateNote(id, { 
      isTrashed: false,
      trashedAt: undefined
    })
  }

  async emptyTrash(): Promise<number> {
    const trashedNotes = await this.getTrashedNotes()
    await Promise.all(
      trashedNotes.map(note => this.permanentlyDeleteNote(note.id))
    )
    return trashedNotes.length
  }

  // Tag operations
  async addTagToNote(noteId: string, tag: string): Promise<Note> {
    const note = await this.repository.getNote(noteId)
    if (!note) {
      throw new Error(`Note with id ${noteId} not found`)
    }

    const tags = note.tags || []
    if (!tags.includes(tag)) {
      tags.push(tag)
    }

    return this.updateNote(noteId, { tags })
  }

  async removeTagFromNote(noteId: string, tag: string): Promise<Note> {
    const note = await this.repository.getNote(noteId)
    if (!note) {
      throw new Error(`Note with id ${noteId} not found`)
    }

    const tags = (note.tags || []).filter(t => t !== tag)
    return this.updateNote(noteId, { tags })
  }

  async removeTagFromAllNotes(tag: string): Promise<number> {
    const notes = await this.getAllNotes()
    const notesWithTag = notes.filter(note => note.tags?.includes(tag))
    
    await Promise.all(
      notesWithTag.map(note => 
        this.removeTagFromNote(note.id, tag)
      )
    )

    return notesWithTag.length
  }

  // Statistics
  async getStatistics(): Promise<NoteStatistics> {
    const notes = await this.getAllNotes()
    const activeNotes = notes.filter(n => !n.isTrashed)
    const trashedNotes = notes.filter(n => n.isTrashed)

    const byNotebook: Record<string, number> = {}
    const byStatus: Record<string, number> = {}
    const byTag: Record<string, number> = {}

    activeNotes.forEach(note => {
      // Count by notebook
      byNotebook[note.notebook] = (byNotebook[note.notebook] || 0) + 1

      // Count by status
      byStatus[note.status] = (byStatus[note.status] || 0) + 1

      // Count by tags
      note.tags?.forEach(tag => {
        byTag[tag] = (byTag[tag] || 0) + 1
      })
    })

    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    return {
      total: notes.length,
      byNotebook,
      byStatus,
      byTag,
      recentlyUpdated: activeNotes.filter(n => 
        new Date(n.updatedAt) > oneWeekAgo
      ).length,
      pinned: activeNotes.filter(n => n.isPinned).length,
      trashed: trashedNotes.length,
    }
  }
}