import { useEffect, useRef } from 'react'
import { useAppStore } from '../stores/newSimpleStore'
import { useServices } from '../services/ServiceProvider'
import { initLogger } from '../utils/logger'
import { useNotesQuery, useNotebooksQuery, useSettingsQuery } from './queries'
import { useInitialPrefetch } from './queries/usePrefetch'

/**
 * Query-based version of useAppInit
 * Uses TanStack Query for data fetching instead of manual loading
 */
export const useAppInitQuery = () => {
  const { appInitializationService, securityService } = useServices()
  const initializationAttempted = useRef(false)
  
  // Use TanStack Query hooks for data fetching
  const { 
    data: notes = [], 
    isLoading: notesLoading, 
    error: notesError 
  } = useNotesQuery()
  
  const { 
    data: notebooks = [], 
    isLoading: notebooksLoading, 
    error: notebooksError 
  } = useNotebooksQuery()
  
  const { 
    data: settings, 
    isLoading: settingsLoading, 
    error: settingsError 
  } = useSettingsQuery()

  // Security initialization (still needed)
  useEffect(() => {
    if (initializationAttempted.current) {
      return
    }

    initializationAttempted.current = true

    const initializeSecurity = async () => {
      initLogger.debug('Starting security initialization')

      // Initialize security service
      const securityAudit = securityService.performSecurityAudit()
      if (!securityAudit.passed) {
        initLogger.warn('Security audit found issues', { securityAudit })
      }

      initLogger.info('Security initialization completed')
    }

    initializeSecurity()
  }, [securityService])

  // Calculate combined loading and error states
  const isInitializing = notesLoading || notebooksLoading || settingsLoading
  const initError = notesError || notebooksError || settingsError

  // Log initialization status
  useEffect(() => {
    if (!isInitializing && !initError) {
      initLogger.info('App initialization completed with TanStack Query', {
        notesCount: notes.length,
        notebooksCount: notebooks.length,
        hasSettings: !!settings
      })
    }
  }, [isInitializing, initError, notes.length, notebooks.length, settings])

  // Prefetch common data in the background
  const prefetchInitialData = useInitialPrefetch()
  useEffect(() => {
    if (!isInitializing && !initError) {
      // Start prefetching after initial load completes
      prefetchInitialData()
    }
  }, [isInitializing, initError, prefetchInitialData])

  return {
    isInitializing,
    initError: initError ? new Error(initError.message || 'Initialization failed') : null,
    // Expose data for components that need it
    data: {
      notes,
      notebooks,
      settings
    }
  }
}