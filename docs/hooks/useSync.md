# useSync Hook

React hook for managing data synchronization with conflict resolution, offline support, and real-time updates.

## Import

```typescript
import { useSync } from '../hooks/useSync'
```

## Parameters

```typescript
interface UseSyncOptions {
  autoSync?: boolean // Enable automatic synchronization
  syncInterval?: number // Auto-sync interval in milliseconds
  retryOnFailure?: boolean // Retry failed sync operations
  maxRetries?: number // Maximum retry attempts
  conflictResolution?: 'manual' | 'auto' // Conflict resolution strategy
  enableOfflineQueue?: boolean // Queue operations when offline
}
```

## Return Value

```typescript
interface UseSyncReturn {
  // Sync state
  syncState: SyncState
  isOnline: boolean
  lastSyncTime: Date | null
  conflicts: SyncConflict[]

  // Actions
  performSync: () => Promise<SyncResult>
  resolveConflict: (
    conflictId: string,
    resolution: ConflictResolution
  ) => Promise<void>
  enableAutoSync: () => void
  disableAutoSync: () => void

  // Utilities
  getSyncStatus: () => SyncStatus
  clearConflicts: () => void
  retryLastSync: () => Promise<void>
}
```

## Basic Usage

### Simple Sync Setup

```typescript
import { useSync } from '../hooks/useSync'

const NotesComponent = () => {
  const {
    syncState,
    isOnline,
    performSync,
    conflicts
  } = useSync({
    autoSync: true,
    syncInterval: 30000 // Sync every 30 seconds
  })

  return (
    <div>
      <div className="sync-status">
        Status: {syncState.status}
        {!isOnline && ' (Offline)'}
      </div>

      <button onClick={performSync} disabled={syncState.status === 'syncing'}>
        {syncState.status === 'syncing' ? 'Syncing...' : 'Sync Now'}
      </button>

      {conflicts.length > 0 && (
        <div>
          {conflicts.length} conflicts need resolution
        </div>
      )}
    </div>
  )
}
```

### Manual Sync Control

```typescript
const ManualSyncComponent = () => {
  const {
    performSync,
    syncState,
    enableAutoSync,
    disableAutoSync,
    retryLastSync
  } = useSync({
    autoSync: false, // Start with manual sync only
    retryOnFailure: true,
    maxRetries: 3
  })

  const handleManualSync = async () => {
    try {
      const result = await performSync()
      console.log('Sync completed:', result)
    } catch (error) {
      console.error('Sync failed:', error)
    }
  }

  return (
    <div>
      <button onClick={handleManualSync}>Manual Sync</button>
      <button onClick={enableAutoSync}>Enable Auto Sync</button>
      <button onClick={disableAutoSync}>Disable Auto Sync</button>

      {syncState.status === 'error' && (
        <button onClick={retryLastSync}>Retry Last Sync</button>
      )}
    </div>
  )
}
```

## Conflict Resolution

### Manual Conflict Resolution

```typescript
const ConflictResolutionComponent = () => {
  const { conflicts, resolveConflict, clearConflicts } = useSync({
    conflictResolution: 'manual'
  })

  const handleConflictResolution = async (
    conflictId: string,
    resolution: ConflictResolution
  ) => {
    try {
      await resolveConflict(conflictId, resolution)
      console.log('Conflict resolved successfully')
    } catch (error) {
      console.error('Failed to resolve conflict:', error)
    }
  }

  return (
    <div>
      {conflicts.map(conflict => (
        <div key={conflict.id} className="conflict-item">
          <h3>Conflict in: {conflict.localNote.title}</h3>
          <p>Type: {conflict.type}</p>

          <div className="conflict-actions">
            <button
              onClick={() => handleConflictResolution(conflict.id, 'keep_local')}
            >
              Keep Local Version
            </button>
            <button
              onClick={() => handleConflictResolution(conflict.id, 'keep_remote')}
            >
              Keep Remote Version
            </button>
            <button
              onClick={() => handleConflictResolution(conflict.id, 'merge_changes')}
            >
              Merge Changes
            </button>
          </div>
        </div>
      ))}

      {conflicts.length > 1 && (
        <button onClick={clearConflicts} className="clear-all">
          Clear All Conflicts
        </button>
      )}
    </div>
  )
}
```

### Automatic Conflict Resolution

```typescript
const AutoResolveComponent = () => {
  const { syncState, conflicts } = useSync({
    conflictResolution: 'auto',
    autoResolutionRules: {
      [ConflictType.METADATA_MISMATCH]: ConflictResolution.MERGE_CHANGES,
      [ConflictType.DUPLICATE_CREATION]: ConflictResolution.CREATE_COPY,
      // Content conflicts still require manual resolution
      [ConflictType.CONTENT_MODIFIED]: 'manual'
    }
  })

  // Auto-resolution happens in the background
  return (
    <div>
      <div>Sync Status: {syncState.status}</div>

      {/* Only show conflicts that couldn't be auto-resolved */}
      {conflicts.length > 0 && (
        <div>
          {conflicts.length} conflicts require manual review
        </div>
      )}
    </div>
  )
}
```

## Offline Support

### Offline Queue Management

```typescript
const OfflineSyncComponent = () => {
  const {
    syncState,
    isOnline,
    performSync
  } = useSync({
    enableOfflineQueue: true,
    autoSync: true,
    syncInterval: 60000 // Sync every minute when online
  })

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      console.log('Back online - queued operations will sync')
    }

    const handleOffline = () => {
      console.log('Gone offline - operations will be queued')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return (
    <div>
      <div className={`status ${isOnline ? 'online' : 'offline'}`}>
        {isOnline ? 'Online' : 'Offline'}
      </div>

      {!isOnline && (
        <div className="offline-notice">
          Changes will be synchronized when connection is restored
        </div>
      )}

      {syncState.queuedOperations && syncState.queuedOperations > 0 && (
        <div>
          {syncState.queuedOperations} operations queued for sync
        </div>
      )}
    </div>
  )
}
```

### Optimistic Updates

```typescript
const OptimisticUpdatesComponent = () => {
  const { performSync, isOnline } = useSync({
    enableOfflineQueue: true
  })
  const [notes, setNotes] = useState<Note[]>([])

  const updateNoteOptimistically = async (noteId: string, changes: Partial<Note>) => {
    // Apply change immediately (optimistic)
    setNotes(prevNotes =>
      prevNotes.map(note =>
        note.id === noteId ? { ...note, ...changes } : note
      )
    )

    try {
      // Queue for sync or sync immediately if online
      await noteService.updateNote(noteId, changes)

      if (isOnline) {
        await performSync()
      }
    } catch (error) {
      // Revert optimistic change on error
      setNotes(prevNotes =>
        prevNotes.map(note =>
          note.id === noteId ? { ...note, ...originalNote } : note
        )
      )
      throw error
    }
  }

  return (
    <div>
      {notes.map(note => (
        <NoteItem
          key={note.id}
          note={note}
          onUpdate={(changes) => updateNoteOptimistically(note.id, changes)}
        />
      ))}
    </div>
  )
}
```

## Real-time Integration

### WebSocket Sync

```typescript
const RealTimeSyncComponent = () => {
  const { syncState, performSync } = useSync({
    autoSync: true,
    syncInterval: 30000
  })

  useEffect(() => {
    const ws = new WebSocket('wss://api.example.com/sync')

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data)

      switch (message.type) {
        case 'note_updated':
        case 'note_deleted':
        case 'note_created':
          // Trigger sync when remote changes occur
          performSync()
          break

        case 'conflict_detected':
          // Handle server-detected conflicts
          console.log('Server detected conflict:', message.conflict)
          break
      }
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }

    return () => {
      ws.close()
    }
  }, [performSync])

  return (
    <div>
      <div>Real-time sync active</div>
      <div>Status: {syncState.status}</div>
    </div>
  )
}
```

### Live Collaboration

```typescript
const CollaborativeSyncComponent = () => {
  const { syncState, performSync, conflicts } = useSync({
    autoSync: true,
    syncInterval: 5000, // More frequent sync for collaboration
    conflictResolution: 'manual'
  })

  const [activeUsers, setActiveUsers] = useState<string[]>([])

  useEffect(() => {
    // Listen for other users' activities
    const eventSource = new EventSource('/api/collaboration/events')

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data)

      switch (data.type) {
        case 'user_active':
          setActiveUsers(prev => [...new Set([...prev, data.userId])])
          break

        case 'user_inactive':
          setActiveUsers(prev => prev.filter(id => id !== data.userId))
          break

        case 'document_changed':
          // Sync immediately when someone else makes changes
          performSync()
          break
      }
    }

    return () => {
      eventSource.close()
    }
  }, [performSync])

  return (
    <div>
      <div>Active collaborators: {activeUsers.length}</div>
      <div>Sync status: {syncState.status}</div>

      {conflicts.length > 0 && (
        <div className="collaboration-conflicts">
          Collaboration conflicts detected - {conflicts.length} items
        </div>
      )}
    </div>
  )
}
```

## Progress Tracking

### Sync Progress Display

```typescript
const SyncProgressComponent = () => {
  const { syncState, performSync } = useSync({
    autoSync: true,
    syncInterval: 60000
  })

  const formatProgress = (progress: number) => {
    return Math.round(progress * 100)
  }

  const getProgressMessage = () => {
    if (syncState.status === 'syncing') {
      const phase = syncState.currentPhase || 'preparing'
      const progress = formatProgress(syncState.progress || 0)

      return `${phase}: ${progress}%`
    }

    return syncState.status
  }

  return (
    <div className="sync-progress">
      <div className="status-text">
        {getProgressMessage()}
      </div>

      {syncState.status === 'syncing' && (
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${formatProgress(syncState.progress || 0)}%` }}
          />
        </div>
      )}

      {syncState.lastSyncTime && (
        <div className="last-sync">
          Last sync: {formatRelativeTime(syncState.lastSyncTime)}
        </div>
      )}

      <button onClick={performSync} disabled={syncState.status === 'syncing'}>
        Sync Now
      </button>
    </div>
  )
}
```

## Error Handling

### Sync Error Recovery

```typescript
const SyncErrorHandlingComponent = () => {
  const {
    syncState,
    performSync,
    retryLastSync
  } = useSync({
    retryOnFailure: true,
    maxRetries: 3
  })

  const handleSyncError = async () => {
    if (syncState.status === 'error') {
      try {
        await retryLastSync()
      } catch (error) {
        console.error('Retry failed:', error)

        // Show user-friendly error message
        if (error.message.includes('network')) {
          showErrorMessage('Network connection failed. Please check your internet.')
        } else if (error.message.includes('auth')) {
          showErrorMessage('Authentication failed. Please log in again.')
        } else {
          showErrorMessage('Sync failed. Please try again later.')
        }
      }
    }
  }

  return (
    <div>
      {syncState.status === 'error' && (
        <div className="sync-error">
          <div>Sync failed: {syncState.error?.message}</div>
          <button onClick={handleSyncError}>Retry</button>

          {syncState.retryCount && syncState.retryCount > 0 && (
            <div>Retry attempt: {syncState.retryCount}</div>
          )}
        </div>
      )}
    </div>
  )
}
```

## Custom Sync Strategies

### Selective Sync

```typescript
const SelectiveSyncComponent = () => {
  const [syncFilters, setSyncFilters] = useState({
    syncNotes: true,
    syncSettings: true,
    syncTags: false
  })

  const { performSync } = useSync({
    autoSync: false,
    customSyncFilter: (item: any) => {
      if (item.type === 'note') return syncFilters.syncNotes
      if (item.type === 'setting') return syncFilters.syncSettings
      if (item.type === 'tag') return syncFilters.syncTags
      return true
    }
  })

  const performSelectiveSync = async () => {
    await performSync({
      filter: syncFilters
    })
  }

  return (
    <div>
      <div>Sync Options:</div>
      <label>
        <input
          type="checkbox"
          checked={syncFilters.syncNotes}
          onChange={(e) => setSyncFilters(prev => ({
            ...prev,
            syncNotes: e.target.checked
          }))}
        />
        Sync Notes
      </label>

      <label>
        <input
          type="checkbox"
          checked={syncFilters.syncSettings}
          onChange={(e) => setSyncFilters(prev => ({
            ...prev,
            syncSettings: e.target.checked
          }))}
        />
        Sync Settings
      </label>

      <button onClick={performSelectiveSync}>
        Sync Selected Items
      </button>
    </div>
  )
}
```

## Testing

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useSync } from '../useSync'

// Mock the SyncManager
vi.mock('../utils/syncManager')

describe('useSync', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useSync({}))

    expect(result.current.syncState.status).toBe('idle')
    expect(result.current.conflicts).toEqual([])
    expect(result.current.isOnline).toBe(true)
  })

  it('should perform manual sync', async () => {
    const { result } = renderHook(() => useSync({ autoSync: false }))

    act(() => {
      result.current.performSync()
    })

    expect(result.current.syncState.status).toBe('syncing')

    await waitFor(() => {
      expect(result.current.syncState.status).toBe('success')
    })
  })

  it('should handle sync conflicts', async () => {
    const mockConflicts = [
      {
        id: 'conflict-1',
        type: 'content_modified',
        localNote: { id: '1', title: 'Local' },
        remoteNote: { id: '1', title: 'Remote' },
      },
    ]

    const { result } = renderHook(() => useSync({}))

    // Simulate conflict detection
    act(() => {
      result.current.syncState.conflicts = mockConflicts
    })

    expect(result.current.conflicts).toHaveLength(1)

    // Resolve conflict
    await act(async () => {
      await result.current.resolveConflict('conflict-1', 'keep_local')
    })

    expect(result.current.conflicts).toHaveLength(0)
  })

  it('should enable and disable auto sync', () => {
    const { result } = renderHook(() => useSync({ autoSync: false }))

    act(() => {
      result.current.enableAutoSync()
    })

    expect(result.current.syncState.autoSyncEnabled).toBe(true)

    act(() => {
      result.current.disableAutoSync()
    })

    expect(result.current.syncState.autoSyncEnabled).toBe(false)
  })
})
```

## Performance Optimization

### Debounced Sync

```typescript
const DebouncedSyncComponent = () => {
  const { performSync } = useSync({ autoSync: false })

  // Debounce sync calls to avoid excessive syncing
  const debouncedSync = useMemo(
    () => debounce(performSync, 2000),
    [performSync]
  )

  const handleDataChange = useCallback(() => {
    // Trigger debounced sync on data changes
    debouncedSync()
  }, [debouncedSync])

  useEffect(() => {
    // Listen for data changes
    const unsubscribe = dataStore.subscribe(handleDataChange)
    return unsubscribe
  }, [handleDataChange])

  return <div>Auto-sync with debouncing active</div>
}
```

### Batch Sync Operations

```typescript
const BatchSyncComponent = () => {
  const { performSync } = useSync({ autoSync: false })
  const [pendingChanges, setPendingChanges] = useState<any[]>([])

  // Batch changes and sync periodically
  useEffect(() => {
    if (pendingChanges.length === 0) return

    const timer = setTimeout(async () => {
      try {
        await performSync({
          batchChanges: pendingChanges
        })
        setPendingChanges([])
      } catch (error) {
        console.error('Batch sync failed:', error)
      }
    }, 5000) // Sync every 5 seconds if there are changes

    return () => clearTimeout(timer)
  }, [pendingChanges, performSync])

  const addChange = (change: any) => {
    setPendingChanges(prev => [...prev, change])
  }

  return (
    <div>
      <div>Pending changes: {pendingChanges.length}</div>
      <button onClick={() => addChange({ type: 'test' })}>
        Add Change
      </button>
    </div>
  )
}
```

## Best Practices

1. **Use appropriate sync intervals** - Balance freshness vs. performance
2. **Handle offline scenarios** - Queue operations and sync when online
3. **Implement conflict resolution UI** - Help users understand and resolve conflicts
4. **Monitor sync performance** - Track sync duration and success rates
5. **Provide sync feedback** - Show progress and status to users
6. **Test with poor connectivity** - Verify behavior under network constraints
7. **Implement retry logic** - Handle transient failures gracefully

## Related Components

- `SyncManager` - Core synchronization logic
- `ConflictResolutionModal` - UI for resolving conflicts
- `SyncStatusIndicator` - Visual sync status display
- `useErrorHandler` - Error handling for sync operations
