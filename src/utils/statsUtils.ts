/**
 * Statistics utilities for notes
 */
import { Note } from '../types'

/**
 * Calculate statistics for notes
 * @param notes - Array of notes to calculate stats for
 * @returns Statistics object with counts by different criteria
 */
export const getStats = (notes: Note[]) => {
  // Filter out trashed notes
  const activeNotes = notes.filter(note => !note.isTrashed)
  
  // Filter out completed/archived for main counts (consistent with UI filtering)
  const visibleNotes = activeNotes.filter(note => !['completed', 'archived'].includes(note.status))
  
  return {
    total: visibleNotes.length,
    pinned: visibleNotes.filter(note => note.isPinned).length,
    trashed: notes.filter(note => note.isTrashed).length,
    byStatus: {
      draft: activeNotes.filter(note => note.status === 'draft').length,
      'in-progress': activeNotes.filter(note => note.status === 'in-progress').length,
      review: activeNotes.filter(note => note.status === 'review').length,
      completed: activeNotes.filter(note => note.status === 'completed').length,
      archived: activeNotes.filter(note => note.status === 'archived').length
    }
  }
}

/**
 * Type definition for stats return value
 */
export interface NoteStats {
  total: number
  pinned: number
  trashed: number
  byStatus: {
    draft: number
    'in-progress': number
    review: number
    completed: number
    archived: number
  }
}