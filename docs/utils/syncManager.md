# SyncManager Utility

A robust data synchronization system with conflict detection, resolution strategies, and offline support.

## Import

```typescript
import {
  SyncManager,
  SyncStatus,
  SyncConflict,
  ConflictResolution,
} from '../utils/syncManager'
```

## Core Classes

### SyncManager

```typescript
class SyncManager {
  constructor(options: SyncManagerOptions)

  // Main sync operations
  sync(): Promise<SyncResult>
  detectConflicts(localNotes: Note[], remoteNotes: Note[]): SyncConflict[]
  resolveConflict(
    conflictId: string,
    resolution: ConflictResolution
  ): Promise<void>

  // Status and state
  getStatus(): SyncStatus
  isOnline(): boolean
  getLastSyncTime(): Date | null

  // Event handling
  on(event: string, handler: Function): void
  off(event: string, handler: Function): void
}
```

### SyncConflict

```typescript
interface SyncConflict {
  id: string
  type: ConflictType
  localNote: Note
  remoteNote: Note
  conflictFields: string[]
  timestamp: Date
  severity: ConflictSeverity
}
```

## Enums and Types

### SyncStatus

```typescript
enum SyncStatus {
  IDLE = 'idle',
  SYNCING = 'syncing',
  SUCCESS = 'success',
  ERROR = 'error',
  CONFLICT = 'conflict',
  OFFLINE = 'offline',
}
```

### ConflictType

```typescript
enum ConflictType {
  CONTENT_MODIFIED = 'content_modified', // Both versions edited
  DELETE_MODIFIED = 'delete_modified', // One deleted, one modified
  DUPLICATE_CREATION = 'duplicate_creation', // Same note created twice
  METADATA_MISMATCH = 'metadata_mismatch', // Tags, title, etc. differ
}
```

### ConflictResolution

```typescript
enum ConflictResolution {
  KEEP_LOCAL = 'keep_local', // Use local version
  KEEP_REMOTE = 'keep_remote', // Use remote version
  MERGE_CHANGES = 'merge_changes', // Combine both versions
  CREATE_COPY = 'create_copy', // Keep both as separate notes
}
```

## Basic Usage

### Initialize SyncManager

```typescript
import { SyncManager } from '../utils/syncManager'

const syncManager = new SyncManager({
  apiClient: notesApiClient,
  storageKey: 'notes_sync_state',
  conflictResolutionStrategy: 'manual', // or 'auto'
  maxRetries: 3,
  retryDelay: 1000,
  enableOfflineQueue: true,
})

// Set up event listeners
syncManager.on('syncStart', () => {
  console.log('Sync started')
})

syncManager.on('syncComplete', result => {
  console.log('Sync completed:', result)
})

syncManager.on('conflictDetected', conflicts => {
  console.log('Conflicts detected:', conflicts.length)
})
```

### Perform Manual Sync

```typescript
const performSync = async () => {
  try {
    const result = await syncManager.sync()

    console.log('Sync result:', result)
    console.log('Changes:', result.changes)
    console.log('Conflicts:', result.conflicts)

    if (result.conflicts.length > 0) {
      // Handle conflicts
      showConflictResolutionModal(result.conflicts)
    }
  } catch (error) {
    console.error('Sync failed:', error)
  }
}
```

## Conflict Detection

### Automatic Conflict Detection

```typescript
// SyncManager automatically detects conflicts based on:
// 1. Last modified timestamps
// 2. Content differences
// 3. Metadata changes

const conflicts = syncManager.detectConflicts(localNotes, remoteNotes)

conflicts.forEach(conflict => {
  console.log('Conflict type:', conflict.type)
  console.log('Affected fields:', conflict.conflictFields)
  console.log('Local version:', conflict.localNote.title)
  console.log('Remote version:', conflict.remoteNote.title)
})
```

### Manual Conflict Detection

```typescript
import { detectNoteConflicts } from '../utils/syncManager'

const checkForConflicts = (
  localNote: Note,
  remoteNote: Note
): SyncConflict | null => {
  // Compare timestamps
  if (
    localNote.lastModified > remoteNote.lastModified &&
    remoteNote.lastModified > localNote.lastSynced
  ) {
    // Both versions modified since last sync
    return {
      id: `conflict_${localNote.id}_${Date.now()}`,
      type: ConflictType.CONTENT_MODIFIED,
      localNote,
      remoteNote,
      conflictFields: findDifferences(localNote, remoteNote),
      timestamp: new Date(),
      severity: getConflictSeverity(localNote, remoteNote),
    }
  }

  return null
}
```

## Conflict Resolution

### Manual Resolution

```typescript
const resolveConflictManually = async (
  conflict: SyncConflict,
  choice: ConflictResolution
) => {
  try {
    await syncManager.resolveConflict(conflict.id, choice)
    console.log('Conflict resolved successfully')
  } catch (error) {
    console.error('Failed to resolve conflict:', error)
  }
}

// Resolution strategies
const handleConflict = (conflict: SyncConflict) => {
  switch (conflict.type) {
    case ConflictType.CONTENT_MODIFIED:
      // Show diff view, let user choose
      showConflictDiffModal(conflict)
      break

    case ConflictType.DELETE_MODIFIED:
      // Ask if user wants to restore or confirm deletion
      showDeleteConfirmModal(conflict)
      break

    case ConflictType.DUPLICATE_CREATION:
      // Automatically merge or create copy
      resolveConflictManually(conflict, ConflictResolution.CREATE_COPY)
      break
  }
}
```

### Automatic Resolution

```typescript
// Configure automatic resolution rules
const autoResolutionConfig = {
  [ConflictType.METADATA_MISMATCH]: ConflictResolution.MERGE_CHANGES,
  [ConflictType.DUPLICATE_CREATION]: ConflictResolution.CREATE_COPY,
  // Content conflicts always require manual resolution
  [ConflictType.CONTENT_MODIFIED]: 'manual',
  [ConflictType.DELETE_MODIFIED]: 'manual',
}

const syncManagerWithAutoResolve = new SyncManager({
  apiClient: notesApiClient,
  conflictResolutionStrategy: 'auto',
  autoResolutionRules: autoResolutionConfig,
})
```

## Merge Strategies

### Smart Content Merging

```typescript
const mergeNoteContent = (localNote: Note, remoteNote: Note): Note => {
  // Line-by-line merge for text content
  const localLines = localNote.content.split('\n')
  const remoteLines = remoteNote.content.split('\n')

  const merged = performThreeWayMerge(
    localLines,
    remoteLines,
    getBaseVersion(localNote.id) // Last common version
  )

  return {
    ...localNote,
    content: merged.join('\n'),
    title: localNote.title || remoteNote.title, // Prefer non-empty title
    tags: mergeArrays(localNote.tags, remoteNote.tags), // Union of tags
    lastModified: new Date(),
    conflictResolved: true,
  }
}

const mergeArrays = <T>(arr1: T[], arr2: T[]): T[] => {
  return Array.from(new Set([...arr1, ...arr2]))
}
```

### Metadata Merging

```typescript
const mergeNoteMetadata = (local: Note, remote: Note): Partial<Note> => {
  return {
    // Use most recent non-empty title
    title:
      (local.lastModified > remote.lastModified ? local.title : remote.title) ||
      local.title ||
      remote.title,

    // Merge tags (union)
    tags: Array.from(new Set([...local.tags, ...remote.tags])),

    // Use latest modification time
    lastModified: new Date(
      Math.max(local.lastModified.getTime(), remote.lastModified.getTime())
    ),

    // Merge custom properties
    customProperties: {
      ...remote.customProperties,
      ...local.customProperties, // Local takes precedence
    },
  }
}
```

## Offline Support

### Offline Queue

```typescript
// Operations are queued when offline
const offlineOperations = [
  { type: 'create', note: newNote, timestamp: Date.now() },
  { type: 'update', note: updatedNote, timestamp: Date.now() },
  { type: 'delete', noteId: 'note-123', timestamp: Date.now() },
]

// When connection is restored
syncManager.on('online', async () => {
  console.log('Connection restored, processing offline queue')

  try {
    const result = await syncManager.processOfflineQueue()
    console.log('Offline operations synced:', result.processedCount)
  } catch (error) {
    console.error('Failed to process offline queue:', error)
  }
})
```

### Conflict-free Offline Editing

```typescript
// Use operational transforms for conflict-free editing
const applyOperation = (note: Note, operation: Operation): Note => {
  switch (operation.type) {
    case 'insert':
      return insertText(note, operation.position, operation.text)
    case 'delete':
      return deleteText(note, operation.position, operation.length)
    case 'format':
      return applyFormatting(note, operation.range, operation.format)
  }
}

// Operations can be applied in any order without conflicts
const resolveOperationalConflict = (
  localOps: Operation[],
  remoteOps: Operation[]
): Operation[] => {
  // Transform operations to resolve conflicts
  return operationalTransform(localOps, remoteOps)
}
```

## Real-time Integration

### WebSocket Events

```typescript
// Listen for real-time updates
const websocket = new WebSocket('wss://api.example.com/sync')

websocket.onmessage = event => {
  const update = JSON.parse(event.data)

  switch (update.type) {
    case 'note_updated':
      syncManager.handleRemoteUpdate(update.note)
      break

    case 'note_deleted':
      syncManager.handleRemoteDelete(update.noteId)
      break

    case 'conflict_detected':
      syncManager.handleRemoteConflict(update.conflict)
      break
  }
}

// Handle incoming updates
syncManager.on('remoteUpdate', (note: Note) => {
  // Check for local conflicts
  const localNote = getLocalNote(note.id)
  if (localNote && hasConflict(localNote, note)) {
    // Show conflict notification
    showConflictNotification(localNote, note)
  } else {
    // Apply update automatically
    updateLocalNote(note)
  }
})
```

## React Hook Integration

### useSync Hook

```typescript
import { useSync } from '../hooks/useSync'

const SyncComponent = () => {
  const {
    syncState,
    performSync,
    resolveConflict,
    conflicts,
    isOnline,
    lastSyncTime
  } = useSync({
    autoSync: true,
    syncInterval: 30000, // 30 seconds
    retryOnFailure: true
  })

  return (
    <div>
      <div className="sync-status">
        Status: {syncState.status}
        {isOnline ? ' (Online)' : ' (Offline)'}
      </div>

      {lastSyncTime && (
        <div>Last sync: {formatRelativeTime(lastSyncTime)}</div>
      )}

      <button onClick={performSync} disabled={syncState.status === 'syncing'}>
        {syncState.status === 'syncing' ? 'Syncing...' : 'Sync Now'}
      </button>

      {conflicts.length > 0 && (
        <ConflictsList
          conflicts={conflicts}
          onResolve={resolveConflict}
        />
      )}
    </div>
  )
}
```

## Testing

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SyncManager, ConflictType, ConflictResolution } from '../syncManager'

describe('SyncManager', () => {
  let syncManager: SyncManager
  let mockApiClient: any

  beforeEach(() => {
    mockApiClient = {
      fetchNotes: vi.fn(),
      saveNote: vi.fn(),
      deleteNote: vi.fn(),
    }

    syncManager = new SyncManager({
      apiClient: mockApiClient,
      conflictResolutionStrategy: 'manual',
    })
  })

  it('should detect content conflicts', () => {
    const localNote = {
      id: '1',
      content: 'Local content',
      lastModified: new Date('2025-01-01T12:00:00Z'),
      lastSynced: new Date('2025-01-01T10:00:00Z'),
    }

    const remoteNote = {
      id: '1',
      content: 'Remote content',
      lastModified: new Date('2025-01-01T11:00:00Z'),
      lastSynced: new Date('2025-01-01T10:00:00Z'),
    }

    const conflicts = syncManager.detectConflicts([localNote], [remoteNote])

    expect(conflicts).toHaveLength(1)
    expect(conflicts[0].type).toBe(ConflictType.CONTENT_MODIFIED)
  })

  it('should resolve conflicts correctly', async () => {
    const conflict = {
      id: 'conflict-1',
      type: ConflictType.CONTENT_MODIFIED,
      localNote: mockLocalNote,
      remoteNote: mockRemoteNote,
    }

    await syncManager.resolveConflict(
      'conflict-1',
      ConflictResolution.KEEP_LOCAL
    )

    expect(mockApiClient.saveNote).toHaveBeenCalledWith(mockLocalNote)
  })
})
```

## Performance Considerations

### Efficient Conflict Detection

```typescript
// Use checksums for fast comparison
const generateChecksum = (note: Note): string => {
  const content = `${note.title}|${note.content}|${note.tags.join(',')}`
  return btoa(content).slice(0, 16) // Quick hash
}

const quickConflictCheck = (local: Note, remote: Note): boolean => {
  // Fast checksum comparison before detailed analysis
  if (generateChecksum(local) === generateChecksum(remote)) {
    return false // No conflict
  }

  // Only do expensive comparison if checksums differ
  return hasDetailedConflict(local, remote)
}
```

### Batch Operations

```typescript
// Process multiple conflicts in batch
const resolveBatchConflicts = async (
  resolutions: { conflictId: string; resolution: ConflictResolution }[]
) => {
  const batches = chunkArray(resolutions, 10) // Process in batches of 10

  for (const batch of batches) {
    await Promise.all(
      batch.map(({ conflictId, resolution }) =>
        syncManager.resolveConflict(conflictId, resolution)
      )
    )
  }
}
```

## Best Practices

1. **Handle offline scenarios** - Queue operations for later sync
2. **Use checksums for efficiency** - Quick comparison before detailed analysis
3. **Implement retry logic** - Handle transient network failures
4. **Provide clear conflict resolution UI** - Help users understand differences
5. **Log sync operations** - Maintain audit trail for debugging
6. **Test conflict scenarios** - Verify resolution strategies work correctly

## Related Components

- `useSync` - React hook for sync integration
- `ConflictResolutionModal` - UI for resolving conflicts
- `SyncStatusIndicator` - Visual sync status display
- `ErrorHandler` - Error management for sync failures
