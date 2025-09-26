/**
 * React Query Provider with Offline Persistence
 * 
 * Wraps the app with React Query and persistence support
 * for offline functionality
 */

import React, { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { persistOptions } from './queryPersister'
import { logger } from '../utils/logger'
import { featureFlags } from '../config/featureFlags'

// Create a query client with optimized defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time: 5 minutes (data is considered fresh for 5 minutes)
      staleTime: 5 * 60 * 1000,
      
      // Cache time: 10 minutes (data stays in cache for 10 minutes after becoming inactive)
      gcTime: 10 * 60 * 1000,
      
      // Network mode for offline support
      networkMode: 'offlineFirst',
      
      // Retry configuration
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error instanceof Error && error.message.includes('4')) {
          return false
        }
        // Retry up to 3 times for other errors
        return failureCount < 3
      },
      
      // Retry delay: exponential backoff
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Refetch on window focus (great for syncing)
      refetchOnWindowFocus: true,
      
      // Refetch on reconnect
      refetchOnReconnect: 'always',
    },
    mutations: {
      // Network mode for offline support
      networkMode: 'offlineFirst',
      
      // Retry mutations once on failure
      retry: 1,
      
      // Retry delay for mutations
      retryDelay: 1000,
      
      // Mutations are paused when offline and resumed when online
      onError: (error) => {
        if (navigator.onLine === false) {
          logger.info('Mutation queued for when connection is restored')
        }
      },
    },
  },
})

// Set up online/offline listeners
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    logger.info('Connection restored - resuming queries')
    queryClient.resumePausedMutations()
  })

  window.addEventListener('offline', () => {
    logger.info('Connection lost - app is in offline mode')
  })
}

interface QueryProviderProps {
  children: ReactNode
}

/**
 * Provider component that includes persistence
 */
export const QueryProvider: React.FC<QueryProviderProps> = ({ children }) => {
  // Check if persistence is enabled via feature flag
  const persistenceEnabled = featureFlags.enableOfflinePersistence ?? true

  if (persistenceEnabled) {
    return (
      <PersistQueryClientProvider 
        client={queryClient}
        persistOptions={persistOptions}
        onSuccess={() => {
          logger.info('Restored query cache from storage')
        }}
      >
        {children}
        {featureFlags.showReactQueryDevTools && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </PersistQueryClientProvider>
    )
  }

  // Fallback to regular provider without persistence
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {featureFlags.showReactQueryDevTools && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  )
}

// Export the client for direct access
export { queryClient }

// Re-export everything from the original queryClient file
export { queryKeys, invalidateNoteQueries, invalidateNotebookQueries } from './queryClient'