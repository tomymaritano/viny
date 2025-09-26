import { useState, useCallback, useEffect } from 'react'
import { withSyncErrorHandling, handleHookError } from '../utils/errorUtils'
import { notebookLogger as logger } from '../utils/logger'

const STORAGE_KEY = 'viny-expanded-notebooks'

/**
 * Hook for managing persistent notebook expansion state
 * Follows modern patterns established in the codebase
 */
export const usePersistentNotebookState = () => {
  const [error, setError] = useState<string | null>(null)

  // Initialize expanded notebooks from localStorage
  const [expandedNotebooks, setExpandedNotebooks] = useState<Set<string>>(
    () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed)) {
            logger.debug(
              `Loaded ${parsed.length} expanded notebooks from storage`
            )
            return new Set(parsed)
          }
        }
        return new Set()
      } catch (error) {
        handleHookError(error, 'load expanded notebooks', setError, {
          logError: true,
          rethrow: false,
        })
        return new Set()
      }
    }
  )

  /**
   * Persist expanded state to localStorage
   */
  const persistExpandedState = useCallback((expanded: Set<string>) => {
    withSyncErrorHandling(
      () => {
        const arrayToSave = Array.from(expanded)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(arrayToSave))
        logger.debug(`Persisted ${arrayToSave.length} expanded notebooks`)
      },
      'persist expanded state',
      setError,
      { rethrow: false }
    )
  }, [])

  /**
   * Toggle notebook expansion state
   */
  const toggleNotebook = useCallback(
    (notebookId: string) => {
      withSyncErrorHandling(
        () => {
          setExpandedNotebooks(prev => {
            const next = new Set(prev)

            if (next.has(notebookId)) {
              next.delete(notebookId)
              logger.debug(`Collapsed notebook: ${notebookId}`)
            } else {
              next.add(notebookId)
              logger.debug(`Expanded notebook: ${notebookId}`)
            }

            // Persist immediately
            persistExpandedState(next)

            return next
          })
        },
        'toggle notebook expansion',
        setError,
        { rethrow: false }
      )
    },
    [persistExpandedState]
  )

  /**
   * Expand a specific notebook
   */
  const expandNotebook = useCallback(
    (notebookId: string) => {
      withSyncErrorHandling(
        () => {
          setExpandedNotebooks(prev => {
            if (prev.has(notebookId)) {
              return prev // Already expanded
            }

            const next = new Set(prev)
            next.add(notebookId)
            logger.debug(`Expanded notebook: ${notebookId}`)

            persistExpandedState(next)
            return next
          })
        },
        'expand notebook',
        setError,
        { rethrow: false }
      )
    },
    [persistExpandedState]
  )

  /**
   * Collapse a specific notebook
   */
  const collapseNotebook = useCallback(
    (notebookId: string) => {
      withSyncErrorHandling(
        () => {
          setExpandedNotebooks(prev => {
            if (!prev.has(notebookId)) {
              return prev // Already collapsed
            }

            const next = new Set(prev)
            next.delete(notebookId)
            logger.debug(`Collapsed notebook: ${notebookId}`)

            persistExpandedState(next)
            return next
          })
        },
        'collapse notebook',
        setError,
        { rethrow: false }
      )
    },
    [persistExpandedState]
  )

  /**
   * Expand all notebooks
   */
  const expandAll = useCallback(
    (notebookIds: string[]) => {
      withSyncErrorHandling(
        () => {
          const next = new Set(notebookIds)
          setExpandedNotebooks(next)
          persistExpandedState(next)
          logger.debug(`Expanded all ${notebookIds.length} notebooks`)
        },
        'expand all notebooks',
        setError,
        { rethrow: false }
      )
    },
    [persistExpandedState]
  )

  /**
   * Collapse all notebooks
   */
  const collapseAll = useCallback(() => {
    withSyncErrorHandling(
      () => {
        setExpandedNotebooks(new Set())
        persistExpandedState(new Set())
        logger.debug('Collapsed all notebooks')
      },
      'collapse all notebooks',
      setError,
      { rethrow: false }
    )
  }, [persistExpandedState])

  /**
   * Check if a notebook is expanded
   */
  const isExpanded = useCallback(
    (notebookId: string): boolean => {
      return expandedNotebooks.has(notebookId)
    },
    [expandedNotebooks]
  )

  /**
   * Clear persisted state (for debugging/reset)
   */
  const clearPersistedState = useCallback(() => {
    withSyncErrorHandling(
      () => {
        localStorage.removeItem(STORAGE_KEY)
        setExpandedNotebooks(new Set())
        logger.debug('Cleared persisted expansion state')
      },
      'clear persisted state',
      setError,
      { rethrow: false }
    )
  }, [])

  // Listen for storage changes from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue)
          if (Array.isArray(parsed)) {
            setExpandedNotebooks(new Set(parsed))
            logger.debug('Updated expanded notebooks from storage event')
          }
        } catch (error) {
          logger.error('Failed to parse storage event:', error)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  return {
    expandedNotebooks,
    toggleNotebook,
    expandNotebook,
    collapseNotebook,
    expandAll,
    collapseAll,
    isExpanded,
    clearPersistedState,
    error,
  }
}
