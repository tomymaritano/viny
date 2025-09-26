/**
 * Types for the Revision History system
 */

export interface NoteRevision {
  id: string
  noteId: string
  title: string
  content: string
  notebook: string
  tags: readonly string[]
  createdAt: string
  createdBy?: string // For future multi-user support
  changeType: 'manual' | 'auto' | 'restore' // How the revision was created
  metadata?: {
    wordCount?: number
    charactersChanged?: number
    linesChanged?: number
  }
}

export interface RevisionDiff {
  added: string[]
  removed: string[]
  modified: string[]
  unchanged: number // Count of unchanged lines
}

export interface RevisionCompareResult {
  oldRevision: NoteRevision
  newRevision: NoteRevision
  diff: RevisionDiff
  similarity: number // Percentage 0-100
}

export interface RevisionServiceOptions {
  maxRevisionsPerNote: number
  autoSaveInterval: number // milliseconds
  minChangeThreshold: number // Minimum characters changed to create revision
}