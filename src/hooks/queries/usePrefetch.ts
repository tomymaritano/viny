/**
 * Prefetching hooks for predictive data loading
 * 
 * These hooks anticipate user actions and preload data
 * to provide instant navigation and interactions
 */

import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { queryKeys } from '../../lib/queryClient'
import { createDocumentRepository } from '../../lib/repositories/RepositoryFactory'
import { logger } from '../../utils/logger'
import type { Note, Notebook } from '../../types'

/**
 * Hook for prefetching individual notes
 * Use this when hovering over note items in the list
 */
export const usePrefetchNote = () => {
  const queryClient = useQueryClient()

  return useCallback(
    (noteId: string) => {
      // Only prefetch if not already in cache
      const cached = queryClient.getQueryData(['note', noteId])
      if (cached) return

      queryClient.prefetchQuery({
        queryKey: ['note', noteId],
        queryFn: async () => {
          logger.debug(`Prefetching note: ${noteId}`)
          const repository = createDocumentRepository()
          await repository.initialize()
          return repository.getNote(noteId)
        },
        // Keep prefetched data for 1 minute
        staleTime: 60 * 1000,
      })
    },
    [queryClient]
  )
}

/**
 * Hook for prefetching notes by notebook
 * Use this when hovering over notebook items
 */
export const usePrefetchNotesByNotebook = () => {
  const queryClient = useQueryClient()

  return useCallback(
    (notebookId: string) => {
      queryClient.prefetchQuery({
        queryKey: ['notes', 'notebook', notebookId],
        queryFn: async () => {
          logger.debug(`Prefetching notes for notebook: ${notebookId}`)
          const repository = createDocumentRepository()
          await repository.initialize()
          const allNotes = await repository.getNotes()
          return allNotes.filter(
            note => note.notebook === notebookId && !note.isTrashed
          )
        },
        staleTime: 2 * 60 * 1000, // 2 minutes
      })
    },
    [queryClient]
  )
}

/**
 * Hook for prefetching notes by tag
 * Use this when hovering over tag items
 */
export const usePrefetchNotesByTag = () => {
  const queryClient = useQueryClient()

  return useCallback(
    (tag: string) => {
      queryClient.prefetchQuery({
        queryKey: ['notes', 'tag', tag],
        queryFn: async () => {
          logger.debug(`Prefetching notes for tag: ${tag}`)
          const repository = createDocumentRepository()
          await repository.initialize()
          const allNotes = await repository.getNotes()
          return allNotes.filter(
            note => !note.isTrashed && note.tags?.includes(tag)
          )
        },
        staleTime: 2 * 60 * 1000,
      })
    },
    [queryClient]
  )
}

/**
 * Hook for prefetching search results
 * Use this for search suggestions or frequent searches
 */
export const usePrefetchSearch = () => {
  const queryClient = useQueryClient()

  return useCallback(
    (searchQuery: string) => {
      if (!searchQuery.trim()) return

      queryClient.prefetchQuery({
        queryKey: queryKeys.search(searchQuery),
        queryFn: async () => {
          logger.debug(`Prefetching search results for: ${searchQuery}`)
          const repository = createDocumentRepository()
          await repository.initialize()
          return repository.searchNotes(searchQuery)
        },
        staleTime: 2 * 60 * 1000,
      })
    },
    [queryClient]
  )
}

/**
 * Hook for prefetching related notes
 * Analyzes current note and prefetches similar ones
 */
export const usePrefetchRelatedNotes = () => {
  const queryClient = useQueryClient()

  return useCallback(
    async (currentNote: Note) => {
      // Prefetch notes from same notebook
      await queryClient.prefetchQuery({
        queryKey: ['notes', 'related', 'notebook', currentNote.notebook],
        queryFn: async () => {
          const repository = createDocumentRepository()
          await repository.initialize()
          const allNotes = await repository.getNotes()
          return allNotes
            .filter(
              note => 
                note.notebook === currentNote.notebook && 
                note.id !== currentNote.id &&
                !note.isTrashed
            )
            .slice(0, 5) // Limit to 5 related notes
        },
        staleTime: 5 * 60 * 1000,
      })

      // Prefetch notes with similar tags
      if (currentNote.tags && currentNote.tags.length > 0) {
        await queryClient.prefetchQuery({
          queryKey: ['notes', 'related', 'tags', currentNote.tags],
          queryFn: async () => {
            const repository = createDocumentRepository()
            await repository.initialize()
            const allNotes = await repository.getNotes()
            
            // Find notes with at least one matching tag
            return allNotes
              .filter(
                note => 
                  note.id !== currentNote.id &&
                  !note.isTrashed &&
                  note.tags?.some(tag => currentNote.tags?.includes(tag))
              )
              .sort((a, b) => {
                // Sort by number of matching tags
                const aMatches = a.tags?.filter(tag => currentNote.tags?.includes(tag)).length || 0
                const bMatches = b.tags?.filter(tag => currentNote.tags?.includes(tag)).length || 0
                return bMatches - aMatches
              })
              .slice(0, 5)
          },
          staleTime: 5 * 60 * 1000,
        })
      }
    },
    [queryClient]
  )
}

/**
 * Hook for intelligent prefetching based on user patterns
 * Tracks navigation patterns and prefetches accordingly
 */
export const useSmartPrefetch = () => {
  const prefetchNote = usePrefetchNote()
  const prefetchNotesByNotebook = usePrefetchNotesByNotebook()
  const prefetchNotesByTag = usePrefetchNotesByTag()
  const prefetchSearch = usePrefetchSearch()

  return {
    // Prefetch on hover with delay
    onNoteHover: useCallback(
      (noteId: string) => {
        const timeoutId = setTimeout(() => {
          prefetchNote(noteId)
        }, 500) // Wait 500ms before prefetching

        return () => clearTimeout(timeoutId)
      },
      [prefetchNote]
    ),

    onNotebookHover: useCallback(
      (notebookId: string) => {
        const timeoutId = setTimeout(() => {
          prefetchNotesByNotebook(notebookId)
        }, 300) // Faster for notebooks

        return () => clearTimeout(timeoutId)
      },
      [prefetchNotesByNotebook]
    ),

    onTagHover: useCallback(
      (tag: string) => {
        const timeoutId = setTimeout(() => {
          prefetchNotesByTag(tag)
        }, 300)

        return () => clearTimeout(timeoutId)
      },
      [prefetchNotesByTag]
    ),

    // Prefetch common searches
    prefetchCommonSearches: useCallback(
      (searches: string[]) => {
        searches.forEach(search => {
          prefetchSearch(search)
        })
      },
      [prefetchSearch]
    ),
  }
}

/**
 * Hook to prefetch data on app initialization
 * Loads frequently accessed data in the background
 */
export const useInitialPrefetch = () => {
  const queryClient = useQueryClient()

  return useCallback(async () => {
    logger.info('Starting initial data prefetch')

    // Prefetch all notebooks (they're usually small)
    await queryClient.prefetchQuery({
      queryKey: queryKeys.notebooks(),
      queryFn: async () => {
        const repository = createDocumentRepository()
        await repository.initialize()
        return repository.getNotebooks()
      },
      staleTime: 10 * 60 * 1000, // 10 minutes
    })

    // Prefetch recent notes
    await queryClient.prefetchQuery({
      queryKey: ['notes', 'recent'],
      queryFn: async () => {
        const repository = createDocumentRepository()
        await repository.initialize()
        const allNotes = await repository.getNotes()
        
        // Get 10 most recent notes
        return allNotes
          .filter(note => !note.isTrashed)
          .sort((a, b) => 
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          )
          .slice(0, 10)
      },
      staleTime: 5 * 60 * 1000,
    })

    // Prefetch pinned notes
    await queryClient.prefetchQuery({
      queryKey: ['notes', 'pinned'],
      queryFn: async () => {
        const repository = createDocumentRepository()
        await repository.initialize()
        const allNotes = await repository.getNotes()
        return allNotes.filter(note => note.isPinned && !note.isTrashed)
      },
      staleTime: 5 * 60 * 1000,
    })

    logger.info('Initial prefetch completed')
  }, [queryClient])
}