/**
 * Query Persister Configuration
 * 
 * Enables offline persistence for React Query cache
 * Data survives app restarts and works offline
 */

import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { logger } from '../utils/logger'

// Determine storage based on environment
const getStorage = () => {
  // Use localStorage for both web and Electron
  // Electron apps support localStorage natively
  return localStorage
}

/**
 * Create the persister with appropriate configuration
 */
export const queryPersister = createSyncStoragePersister({
  storage: getStorage(),
  key: 'viny-query-cache',
  throttleTime: 1000, // Throttle writes to every 1 second
  serialize: (data) => {
    try {
      return JSON.stringify(data)
    } catch (error) {
      logger.error('Failed to serialize query cache', { error })
      return ''
    }
  },
  deserialize: (data) => {
    try {
      return JSON.parse(data)
    } catch (error) {
      logger.error('Failed to deserialize query cache', { error })
      return {}
    }
  },
})

/**
 * Configuration for which queries to persist
 */
export const persistOptions = {
  persister: queryPersister,
  maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  buster: '', // Can be used to invalidate cache on app updates
  dehydrateOptions: {
    // Only persist successful queries
    shouldDehydrateQuery: (query: any) => {
      // Don't persist failed queries
      if (query.state.status === 'error') return false
      
      // Don't persist very stale data
      const isStale = Date.now() - query.state.dataUpdatedAt > 1000 * 60 * 60 * 24 // 24 hours
      if (isStale) return false

      // Persist specific query types
      const queryKey = query.queryKey
      
      // Always persist these critical queries
      if (queryKey[0] === 'notes') return true
      if (queryKey[0] === 'notebooks') return true
      if (queryKey[0] === 'settings') return true
      if (queryKey[0] === 'tags') return true
      
      // Don't persist search queries by default (too many)
      if (queryKey[0] === 'search') return false
      
      return true
    },
  },
}

/**
 * Helper to clear persisted cache
 */
export const clearPersistedCache = async () => {
  try {
    const storage = getStorage()
    await storage.removeItem('viny-query-cache')
    logger.info('Cleared persisted query cache')
  } catch (error) {
    logger.error('Failed to clear persisted cache', { error })
  }
}

/**
 * Helper to get persisted cache size
 */
export const getPersistedCacheSize = async (): Promise<number> => {
  try {
    const storage = getStorage()
    const data = await storage.getItem('viny-query-cache')
    return data ? new Blob([data]).size : 0
  } catch (error) {
    logger.error('Failed to get cache size', { error })
    return 0
  }
}