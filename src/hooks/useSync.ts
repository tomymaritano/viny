/**
 * React hook for synchronization management
 */
import { useState, useEffect, useCallback } from 'react'
import { syncManager, SyncState, SyncConflict, ConflictResolution } from '../utils/syncManager'
import { useAppStore } from '../stores/newSimpleStore'
import { Note, Notebook } from '../types'
import { logger } from '../utils/logger'

export interface UseSyncOptions {
  autoSync?: boolean
  syncInterval?: number // in milliseconds
  conflictResolutionStrategy?: ConflictResolution['strategy']
}

export function useSync(options: UseSyncOptions = {}) {
  const {
    autoSync = false,
    syncInterval = 30000, // 30 seconds
    conflictResolutionStrategy = 'merge'
  } = options

  const { notes, notebooks, updateNotes, updateNotebooks, showError, showSuccess } = useAppStore()
  const [syncState, setSyncState] = useState<SyncState>(syncManager.getSyncState())
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  // Subscribe to sync state changes
  useEffect(() => {
    const unsubscribe = syncManager.subscribe(setSyncState)
    return unsubscribe
  }, [])

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Auto-sync functionality
  useEffect(() => {
    if (!autoSync || !isOnline) return

    const interval = setInterval(() => {
      performSync()
    }, syncInterval)

    return () => clearInterval(interval)
  }, [autoSync, isOnline, syncInterval])

  // Perform synchronization
  const performSync = useCallback(async () => {
    if (!isOnline) {
      showError('Cannot sync while offline')
      return false
    }

    try {
      // Simulate fetching remote data
      // In a real app, this would be an API call
      const remoteData = await fetchRemoteData()
      
      const result = await syncManager.startSync(
        notes,
        notebooks,
        remoteData.notes,
        remoteData.notebooks
      )

      // Update local data with synced versions
      updateNotes(result.syncedNotes)
      updateNotebooks(result.syncedNotebooks)

      // Handle conflicts
      if (result.conflicts.length > 0) {
        const resolvedConflicts = result.conflicts.filter(c => c.resolved)
        const unresolvedConflicts = result.conflicts.filter(c => !c.resolved)

        if (resolvedConflicts.length > 0) {
          showSuccess(`Sync completed. ${resolvedConflicts.length} conflicts resolved automatically.`)
        }

        if (unresolvedConflicts.length > 0) {
          showError(`${unresolvedConflicts.length} conflicts require manual resolution`)
        }
      } else {
        showSuccess('Sync completed successfully')
      }

      return true
    } catch (error) {
      logger.error('Sync failed:', error)
      showError('Sync failed. Please try again.')
      return false
    }
  }, [notes, notebooks, updateNotes, updateNotebooks, showError, showSuccess, isOnline])

  // Resolve conflict manually
  const resolveConflict = useCallback(async (
    conflictId: string,
    resolution: ConflictResolution
  ) => {
    try {
      await syncManager.resolveConflictManually(conflictId, resolution)
      
      // Apply resolution to local data
      const conflict = syncState.conflicts.find(c => c.id === conflictId)
      if (conflict && resolution.resolvedItem) {
        if (conflict.type === 'note') {
          const updatedNotes = notes.map(note => 
            note.id === conflict.itemId ? resolution.resolvedItem as Note : note
          )
          updateNotes(updatedNotes)
        } else if (conflict.type === 'notebook') {
          const updatedNotebooks = notebooks.map(notebook => 
            notebook.id === conflict.itemId ? resolution.resolvedItem as Notebook : notebook
          )
          updateNotebooks(updatedNotebooks)
        }
      }

      showSuccess('Conflict resolved successfully')
    } catch (error) {
      logger.error('Failed to resolve conflict:', error)
      showError('Failed to resolve conflict')
    }
  }, [syncState.conflicts, notes, notebooks, updateNotes, updateNotebooks, showError, showSuccess])

  // Force sync
  const forceSync = useCallback(() => {
    return performSync()
  }, [performSync])

  // Clear resolved conflicts
  const clearResolvedConflicts = useCallback(() => {
    syncManager.clearResolvedConflicts()
  }, [])

  // Reset sync state
  const resetSync = useCallback(() => {
    syncManager.resetSyncState()
  }, [])

  // Get conflict by ID
  const getConflict = useCallback((conflictId: string): SyncConflict | undefined => {
    return syncState.conflicts.find(c => c.id === conflictId)
  }, [syncState.conflicts])

  // Get unresolved conflicts
  const getUnresolvedConflicts = useCallback((): SyncConflict[] => {
    return syncState.conflicts.filter(c => !c.resolved)
  }, [syncState.conflicts])

  return {
    // State
    syncState,
    isOnline,
    isSyncing: syncState.status === 'syncing',
    hasConflicts: syncState.conflicts.length > 0,
    hasUnresolvedConflicts: getUnresolvedConflicts().length > 0,
    lastSync: syncState.lastSync,
    
    // Actions
    performSync,
    forceSync,
    resolveConflict,
    clearResolvedConflicts,
    resetSync,
    
    // Getters
    getConflict,
    getUnresolvedConflicts,
    
    // Computed values
    syncProgress: syncState.progress,
    conflictCount: syncState.conflicts.length,
    unresolvedConflictCount: getUnresolvedConflicts().length
  }
}

// Simulate fetching remote data
async function fetchRemoteData(): Promise<{
  notes: Note[]
  notebooks: Notebook[]
}> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // In a real app, this would be an actual API call
  // For now, return empty arrays to simulate no remote changes
  return {
    notes: [],
    notebooks: []
  }
}

// Hook for sync status only (lighter version)
export function useSyncStatus() {
  const [syncState, setSyncState] = useState<SyncState>(syncManager.getSyncState())
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const unsubscribe = syncManager.subscribe(setSyncState)
    return unsubscribe
  }, [])

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return {
    status: syncState.status,
    isOnline,
    isSyncing: syncState.status === 'syncing',
    lastSync: syncState.lastSync,
    hasConflicts: syncState.conflicts.length > 0,
    conflictCount: syncState.conflicts.length,
    progress: syncState.progress
  }
}