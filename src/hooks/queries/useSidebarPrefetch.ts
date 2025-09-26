/**
 * Prefetching hooks specifically for sidebar interactions
 * Optimizes navigation through notebooks and tags
 */

import { useCallback, useRef } from 'react'
import { useSmartPrefetch } from './usePrefetch'

interface UseSidebarPrefetchResult {
  handleNotebookHover: (notebookId: string) => void
  handleNotebookLeave: (notebookId: string) => void
  handleTagHover: (tag: string) => void
  handleTagLeave: (tag: string) => void
}

/**
 * Hook that manages prefetching for sidebar items
 * Handles hover states and cleanup for notebooks and tags
 */
export const useSidebarPrefetch = (): UseSidebarPrefetchResult => {
  const { onNotebookHover, onTagHover } = useSmartPrefetch()
  const timeouts = useRef<Map<string, NodeJS.Timeout>>(new Map())

  // Cleanup all timeouts on unmount
  const cleanup = useCallback(() => {
    timeouts.current.forEach(timeout => clearTimeout(timeout))
    timeouts.current.clear()
  }, [])

  // Generic hover handler
  const handleHover = useCallback(
    (id: string, prefetchFn: (id: string) => () => void) => {
      // Clear existing timeout
      const existing = timeouts.current.get(id)
      if (existing) {
        clearTimeout(existing)
      }

      // Set up new prefetch
      const cleanupFn = prefetchFn(id)
      timeouts.current.set(id, cleanupFn as any)
    },
    []
  )

  // Generic leave handler
  const handleLeave = useCallback((id: string) => {
    const timeout = timeouts.current.get(id)
    if (timeout) {
      clearTimeout(timeout)
      timeouts.current.delete(id)
    }
  }, [])

  return {
    handleNotebookHover: useCallback(
      (notebookId: string) => handleHover(notebookId, onNotebookHover),
      [handleHover, onNotebookHover]
    ),
    handleNotebookLeave: useCallback(
      (notebookId: string) => handleLeave(notebookId),
      [handleLeave]
    ),
    handleTagHover: useCallback(
      (tag: string) => handleHover(`tag-${tag}`, onTagHover),
      [handleHover, onTagHover]
    ),
    handleTagLeave: useCallback(
      (tag: string) => handleLeave(`tag-${tag}`),
      [handleLeave]
    ),
  }
}