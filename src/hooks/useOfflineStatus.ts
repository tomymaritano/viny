/**
 * Offline Status Hook
 * 
 * Monitors online/offline status and provides
 * utilities for offline-aware components
 */

import { useState, useEffect, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { logger } from '../utils/logger'
import { useAppStore } from '../stores/newSimpleStore'

interface UseOfflineStatusResult {
  isOnline: boolean
  isOffline: boolean
  wasOffline: boolean
  offlineDuration: number | null
  pendingMutations: number
  syncStatus: 'synced' | 'syncing' | 'pending'
  retrySync: () => void
}

export const useOfflineStatus = (): UseOfflineStatusResult => {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [wasOffline, setWasOffline] = useState(false)
  const [offlineStartTime, setOfflineStartTime] = useState<number | null>(null)
  const [pendingMutations, setPendingMutations] = useState(0)
  const queryClient = useQueryClient()
  const { showInfo } = useAppStore()

  // Calculate offline duration
  const offlineDuration = offlineStartTime 
    ? Date.now() - offlineStartTime 
    : null

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      logger.info('Connection restored')
      setIsOnline(true)
      
      if (offlineStartTime) {
        const duration = Date.now() - offlineStartTime
        showInfo(`Back online! You were offline for ${Math.round(duration / 1000)}s`)
        setWasOffline(true)
        setOfflineStartTime(null)
        
        // Clear the wasOffline flag after 5 seconds
        setTimeout(() => setWasOffline(false), 5000)
      }
      
      // Resume any paused mutations
      queryClient.resumePausedMutations()
    }

    const handleOffline = () => {
      logger.info('Connection lost - entering offline mode')
      setIsOnline(false)
      setOfflineStartTime(Date.now())
      showInfo('You are offline. Changes will be synced when connection is restored.')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Check initial status
    setIsOnline(navigator.onLine)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [queryClient, showInfo, offlineStartTime])

  // Monitor pending mutations
  useEffect(() => {
    const checkPendingMutations = () => {
      const mutationCache = queryClient.getMutationCache()
      const pending = mutationCache.getAll().filter(
        mutation => mutation.state.status === 'pending'
      ).length
      setPendingMutations(pending)
    }

    // Check immediately
    checkPendingMutations()

    // Set up interval to check periodically
    const interval = setInterval(checkPendingMutations, 1000)

    return () => clearInterval(interval)
  }, [queryClient])

  // Determine sync status
  const syncStatus = pendingMutations > 0 
    ? 'pending' 
    : wasOffline 
      ? 'syncing' 
      : 'synced'

  // Manual retry function
  const retrySync = useCallback(() => {
    logger.info('Manually retrying sync')
    queryClient.resumePausedMutations()
  }, [queryClient])

  return {
    isOnline,
    isOffline: !isOnline,
    wasOffline,
    offlineDuration,
    pendingMutations,
    syncStatus,
    retrySync,
  }
}

/**
 * Hook to display offline status in UI
 */
export const useOfflineIndicator = () => {
  const { isOffline, pendingMutations, syncStatus } = useOfflineStatus()

  const getMessage = () => {
    if (isOffline) {
      return 'Offline - Changes will sync when connected'
    }
    if (syncStatus === 'syncing') {
      return 'Syncing changes...'
    }
    if (pendingMutations > 0) {
      return `Syncing ${pendingMutations} changes...`
    }
    return null
  }

  const getColor = () => {
    if (isOffline) return 'bg-gray-500'
    if (syncStatus === 'syncing') return 'bg-yellow-500'
    if (syncStatus === 'synced') return 'bg-green-500'
    return 'bg-gray-400'
  }

  return {
    show: isOffline || syncStatus !== 'synced',
    message: getMessage(),
    color: getColor(),
    pendingCount: pendingMutations,
  }
}