import { useState, useCallback, useMemo } from 'react'
import { useAppStore } from '../stores/newSimpleStore'
import type { Note } from '../types'
import { withSyncErrorHandling } from '../utils/errorUtils'
import { notebookLogger as logger } from '../utils/logger'

/**
 * Hook for managing notes within notebooks
 * Follows modern patterns established in useNotebooks and useNoteActions
 */
export const useNotebookNotes = () => {
  const { notes } = useAppStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Get all notes for a specific notebook
   * Filters out trashed notes
   */
  const getNotesByNotebook = useCallback(
    (notebookId: string): Note[] => {
      logger.debug(`Getting notes for notebook: ${notebookId}`)

      const notebookNotes = notes.filter(note => {
        // Match exact notebook ID (case-sensitive)
        const matches = note.notebook === notebookId && !note.isTrashed
        return matches
      })

      // Sort by updatedAt desc (most recent first)
      const sortedNotes = notebookNotes.sort((a, b) => {
        const dateA = new Date(a.updatedAt).getTime()
        const dateB = new Date(b.updatedAt).getTime()
        return dateB - dateA
      })

      logger.debug(
        `Found ${sortedNotes.length} notes in notebook ${notebookId}`
      )
      return sortedNotes
    },
    [notes]
  )

  /**
   * Get notes grouped by notebook
   * Returns a map of notebookId -> notes[]
   */
  const getNotesGroupedByNotebook = useCallback((): Map<string, Note[]> => {
    const grouped = new Map<string, Note[]>()

    notes.forEach(note => {
      if (!note.isTrashed && note.notebook) {
        const notebookNotes = grouped.get(note.notebook) || []
        notebookNotes.push(note)
        grouped.set(note.notebook, notebookNotes)
      }
    })

    // Sort notes within each notebook
    grouped.forEach((notebookNotes, notebookId) => {
      grouped.set(
        notebookId,
        notebookNotes.sort((a, b) => {
          const dateA = new Date(a.updatedAt).getTime()
          const dateB = new Date(b.updatedAt).getTime()
          return dateB - dateA
        })
      )
    })

    logger.debug(`Grouped notes into ${grouped.size} notebooks`)
    return grouped
  }, [notes])

  /**
   * Count notes in a specific notebook
   */
  const getNotebookNoteCount = useCallback(
    (notebookId: string): number => {
      const notebookNotes = getNotesByNotebook(notebookId)
      return notebookNotes.length
    },
    [getNotesByNotebook]
  )

  /**
   * Get the most recent note in a notebook
   */
  const getMostRecentNote = useCallback(
    (notebookId: string): Note | undefined => {
      const notebookNotes = getNotesByNotebook(notebookId)
      return notebookNotes[0] // Already sorted by most recent
    },
    [getNotesByNotebook]
  )

  /**
   * Search notes within a specific notebook
   */
  const searchNotesInNotebook = useCallback(
    (notebookId: string, query: string): Note[] => {
      return (
        withSyncErrorHandling(
          () => {
            const notebookNotes = getNotesByNotebook(notebookId)

            if (!query || !query.trim()) {
              return notebookNotes
            }

            const searchTerms = query.toLowerCase().split(' ').filter(Boolean)

            return notebookNotes.filter(note => {
              const searchableText =
                `${note.title} ${note.content}`.toLowerCase()
              return searchTerms.every(term => searchableText.includes(term))
            })
          },
          'search notes in notebook',
          setError,
          { rethrow: false }
        ) || []
      )
    },
    [getNotesByNotebook]
  )

  /**
   * Memoized notebook notes map for performance
   */
  const notebookNotesMap = useMemo(() => {
    return getNotesGroupedByNotebook()
  }, [getNotesGroupedByNotebook])

  return {
    // State
    loading,
    error,

    // Core functions
    getNotesByNotebook,
    getNotesGroupedByNotebook,
    getNotebookNoteCount,
    getMostRecentNote,
    searchNotesInNotebook,

    // Memoized data
    notebookNotesMap,
  }
}
