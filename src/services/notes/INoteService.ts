/**
 * Note Service Interface
 * Defines the contract for note business logic operations
 */

import type { Note } from '../../types'

export interface CreateNoteDto {
  title?: string
  content?: string
  notebook?: string
  tags?: string[]
  status?: Note['status']
  isPinned?: boolean
}

export interface UpdateNoteDto {
  title?: string
  content?: string
  notebook?: string
  tags?: string[]
  status?: Note['status']
  isPinned?: boolean
  isTrashed?: boolean
}

export interface NoteSearchOptions {
  query?: string
  notebook?: string
  tags?: string[]
  status?: Note['status']
  includeContent?: boolean
  limit?: number
}

export interface NoteStatistics {
  total: number
  byNotebook: Record<string, number>
  byStatus: Record<string, number>
  byTag: Record<string, number>
  recentlyUpdated: number
  pinned: number
  trashed: number
}

export interface INoteService {
  // Query operations
  getAllNotes(): Promise<Note[]>
  getActiveNotes(): Promise<Note[]>
  getTrashedNotes(): Promise<Note[]>
  getNoteById(id: string): Promise<Note | null>
  getNotesInNotebook(notebookId: string): Promise<Note[]>
  getNotesByTag(tag: string): Promise<Note[]>
  getNotesByStatus(status: Note['status']): Promise<Note[]>
  getPinnedNotes(): Promise<Note[]>
  getRecentNotes(limit?: number): Promise<Note[]>
  
  // Search operations
  searchNotes(options: NoteSearchOptions): Promise<Note[]>
  
  // Mutation operations
  createNote(data: CreateNoteDto): Promise<Note>
  updateNote(id: string, data: UpdateNoteDto): Promise<Note>
  deleteNote(id: string): Promise<void>
  permanentlyDeleteNote(id: string): Promise<void>
  duplicateNote(id: string): Promise<Note>
  
  // Bulk operations
  createMultipleNotes(notes: CreateNoteDto[]): Promise<Note[]>
  deleteMultipleNotes(ids: string[]): Promise<void>
  moveNotesToNotebook(noteIds: string[], notebookId: string): Promise<void>
  
  // Special operations
  togglePin(id: string): Promise<Note>
  moveToTrash(id: string): Promise<void>
  restoreFromTrash(id: string): Promise<void>
  emptyTrash(): Promise<number>
  
  // Tag operations
  addTagToNote(noteId: string, tag: string): Promise<Note>
  removeTagFromNote(noteId: string, tag: string): Promise<Note>
  removeTagFromAllNotes(tag: string): Promise<number>
  
  // Statistics
  getStatistics(): Promise<NoteStatistics>
}