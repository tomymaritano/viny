/**
 * TanStack Query Client Configuration
 * 
 * Central configuration for React Query with optimized settings
 * for the Viny note-taking application
 */

import { QueryClient } from '@tanstack/react-query'
import { logger } from '../utils/logger'

// Create a query client with optimized defaults
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time: 5 minutes (data is considered fresh for 5 minutes)
      staleTime: 5 * 60 * 1000,
      
      // Cache time: 10 minutes (data stays in cache for 10 minutes after becoming inactive)
      gcTime: 10 * 60 * 1000,
      
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
      
      // Don't refetch on reconnect by default (can be overridden per query)
      refetchOnReconnect: 'always',
    },
    mutations: {
      // Retry mutations once on failure
      retry: 1,
      
      // Retry delay for mutations
      retryDelay: 1000,
    },
  },
})

// Global error handler
queryClient.setMutationDefaults(['saveNote'], {
  onError: (error) => {
    logger.error('Note save mutation failed:', error)
  },
})

queryClient.setMutationDefaults(['saveNotebook'], {
  onError: (error) => {
    logger.error('Notebook save mutation failed:', error)
  },
})

// Query key factory for consistent key generation
export const queryKeys = {
  all: ['viny'] as const,
  notes: () => [...queryKeys.all, 'notes'] as const,
  note: (id: string) => [...queryKeys.notes(), id] as const,
  notebooks: () => [...queryKeys.all, 'notebooks'] as const,
  notebook: (id: string) => [...queryKeys.notebooks(), id] as const,
  tags: () => [...queryKeys.all, 'tags'] as const,
  search: (query: string) => [...queryKeys.all, 'search', query] as const,
  settings: () => [...queryKeys.all, 'settings'] as const,
} as const

// Helper to invalidate related queries
export const invalidateNoteQueries = () => {
  queryClient.invalidateQueries({ queryKey: queryKeys.notes() })
  queryClient.invalidateQueries({ queryKey: queryKeys.tags() })
}

export const invalidateNotebookQueries = () => {
  queryClient.invalidateQueries({ queryKey: queryKeys.notebooks() })
  queryClient.invalidateQueries({ queryKey: queryKeys.notes() })
}