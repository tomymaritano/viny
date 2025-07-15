import { describe, it, expect, beforeEach, vi } from 'vitest'
import { SyncManager, SyncStatus } from '../syncManager'
import { Note, Notebook } from '../../types'

// Mock logger and errorHandler
vi.mock('../logger', () => ({
  logger: {
    debug: vi.fn(),
    error: vi.fn()
  }
}))

vi.mock('./errorHandler', () => ({
  errorHandler: {
    handleError: vi.fn()
  }
}))

describe('SyncManager', () => {
  let syncManager: SyncManager
  
  const mockNote1: Note = {
    id: '1',
    title: 'Note 1',
    content: 'Content 1',
    tags: ['tag1'],
    createdAt: '2025-01-01T10:00:00Z',
    updatedAt: '2025-01-01T10:00:00Z',
    notebookId: 'notebook1',
    isPinned: false,
    isDeleted: false,
    metadata: {}
  }

  const mockNote2: Note = {
    id: '2',
    title: 'Note 2',
    content: 'Content 2',
    tags: ['tag2'],
    createdAt: '2025-01-01T11:00:00Z',
    updatedAt: '2025-01-01T11:00:00Z',
    notebookId: 'notebook1',
    isPinned: false,
    isDeleted: false,
    metadata: {}
  }

  const mockNotebook1: Notebook = {
    id: 'notebook1',
    name: 'Notebook 1',
    color: '#ff0000',
    description: 'Description 1',
    createdAt: '2025-01-01T09:00:00Z',
    updatedAt: '2025-01-01T09:00:00Z',
    isDeleted: false,
    metadata: {}
  }

  beforeEach(() => {
    // Reset singleton instance for each test
    SyncManager['instance'] = undefined as any
    syncManager = SyncManager.getInstance()
  })

  describe('Singleton pattern', () => {
    it('should return the same instance', () => {
      const instance1 = SyncManager.getInstance()
      const instance2 = SyncManager.getInstance()
      expect(instance1).toBe(instance2)
    })
  })

  describe('Initial state', () => {
    it('should have correct initial state', () => {
      const state = syncManager.getSyncState()
      
      expect(state.status).toBe(SyncStatus.IDLE)
      expect(state.lastSync).toBeNull()
      expect(state.conflicts).toHaveLength(0)
      expect(state.errors).toHaveLength(0)
      expect(state.progress).toBe(0)
      expect(state.totalItems).toBe(0)
      expect(state.syncedItems).toBe(0)
    })
  })

  describe('Conflict detection', () => {
    it('should detect no conflicts when items are identical', () => {
      const localNotes = [mockNote1]
      const remoteNotes = [mockNote1]
      
      const conflicts = syncManager.detectConflicts(localNotes, remoteNotes, [], [])
      
      expect(conflicts).toHaveLength(0)
    })

    it('should detect conflicts when content differs', () => {
      const localNote = { 
        ...mockNote1, 
        content: 'Local content',
        updatedAt: '2025-01-01T10:00:00Z'
      }
      const remoteNote = { 
        ...mockNote1, 
        content: 'Remote content',
        updatedAt: '2025-01-01T11:00:00Z'
      }
      
      const conflicts = syncManager.detectConflicts([localNote], [remoteNote], [], [])
      
      expect(conflicts).toHaveLength(1)
      expect(conflicts[0].type).toBe('note')
      expect(conflicts[0].itemId).toBe(mockNote1.id)
      expect(conflicts[0].localVersion).toEqual(localNote)
      expect(conflicts[0].remoteVersion).toEqual(remoteNote)
      expect(conflicts[0].resolved).toBe(false)
    })

    it('should detect conflicts when title differs', () => {
      const localNote = { 
        ...mockNote1, 
        title: 'Local title',
        updatedAt: '2025-01-01T10:00:00Z'
      }
      const remoteNote = { 
        ...mockNote1, 
        title: 'Remote title',
        updatedAt: '2025-01-01T11:00:00Z'
      }
      
      const conflicts = syncManager.detectConflicts([localNote], [remoteNote], [], [])
      
      expect(conflicts).toHaveLength(1)
    })

    it('should detect conflicts when tags differ', () => {
      const localNote = { 
        ...mockNote1, 
        tags: ['local-tag'],
        updatedAt: '2025-01-01T10:00:00Z'
      }
      const remoteNote = { 
        ...mockNote1, 
        tags: ['remote-tag'],
        updatedAt: '2025-01-01T11:00:00Z'
      }
      
      const conflicts = syncManager.detectConflicts([localNote], [remoteNote], [], [])
      
      expect(conflicts).toHaveLength(1)
    })

    it('should detect notebook conflicts', () => {
      const localNotebook = { 
        ...mockNotebook1, 
        name: 'Local name',
        updatedAt: '2025-01-01T10:00:00Z'
      }
      const remoteNotebook = { 
        ...mockNotebook1, 
        name: 'Remote name',
        updatedAt: '2025-01-01T11:00:00Z'
      }
      
      const conflicts = syncManager.detectConflicts([], [], [localNotebook], [remoteNotebook])
      
      expect(conflicts).toHaveLength(1)
      expect(conflicts[0].type).toBe('notebook')
    })

    it('should not detect conflicts when only timestamps differ but content is same', () => {
      const localNote = { ...mockNote1, updatedAt: '2025-01-01T10:00:00Z' }
      const remoteNote = { ...mockNote1, updatedAt: '2025-01-01T11:00:00Z' }
      
      const conflicts = syncManager.detectConflicts([localNote], [remoteNote], [], [])
      
      expect(conflicts).toHaveLength(0)
    })
  })

  describe('Conflict resolution', () => {
    it('should resolve conflicts with use_local strategy', async () => {
      const localNote = { ...mockNote1, content: 'Local content' }
      const remoteNote = { ...mockNote1, content: 'Remote content' }
      
      const conflict = {
        id: 'conflict1',
        type: 'note' as const,
        itemId: mockNote1.id,
        localVersion: localNote,
        remoteVersion: remoteNote,
        timestamp: new Date(),
        resolved: false
      }
      
      const { resolved } = await syncManager.resolveConflicts([conflict], 'use_local')
      
      expect(resolved).toHaveLength(1)
      expect(resolved[0].resolved).toBe(true)
      expect(resolved[0].resolution?.strategy).toBe('use_local')
      expect(resolved[0].resolution?.resolvedItem).toEqual(localNote)
    })

    it('should resolve conflicts with use_remote strategy', async () => {
      const localNote = { ...mockNote1, content: 'Local content' }
      const remoteNote = { ...mockNote1, content: 'Remote content' }
      
      const conflict = {
        id: 'conflict1',
        type: 'note' as const,
        itemId: mockNote1.id,
        localVersion: localNote,
        remoteVersion: remoteNote,
        timestamp: new Date(),
        resolved: false
      }
      
      const { resolved } = await syncManager.resolveConflicts([conflict], 'use_remote')
      
      expect(resolved).toHaveLength(1)
      expect(resolved[0].resolution?.strategy).toBe('use_remote')
      expect(resolved[0].resolution?.resolvedItem).toEqual(remoteNote)
    })

    it('should resolve conflicts with merge strategy', async () => {
      const localNote = { 
        ...mockNote1, 
        content: 'Local content',
        updatedAt: '2025-01-01T10:00:00Z'
      }
      const remoteNote = { 
        ...mockNote1, 
        content: 'Remote content',
        updatedAt: '2025-01-01T11:00:00Z'
      }
      
      const conflict = {
        id: 'conflict1',
        type: 'note' as const,
        itemId: mockNote1.id,
        localVersion: localNote,
        remoteVersion: remoteNote,
        timestamp: new Date(),
        resolved: false
      }
      
      const { resolved } = await syncManager.resolveConflicts([conflict], 'merge')
      
      expect(resolved).toHaveLength(1)
      expect(resolved[0].resolution?.strategy).toBe('merge')
      
      const mergedNote = resolved[0].resolution?.resolvedItem as Note
      expect(mergedNote.content).toContain('Local content')
      expect(mergedNote.content).toContain('Remote content')
      expect(mergedNote.metadata?.conflictResolved).toBe(true)
    })
  })

  describe('Note merging', () => {
    it('should merge tags correctly', async () => {
      const localNote = { 
        ...mockNote1, 
        tags: ['tag1', 'tag2'],
        updatedAt: '2025-01-01T10:00:00Z'
      }
      const remoteNote = { 
        ...mockNote1, 
        tags: ['tag2', 'tag3'],
        updatedAt: '2025-01-01T11:00:00Z'
      }
      
      const conflict = {
        id: 'conflict1',
        type: 'note' as const,
        itemId: mockNote1.id,
        localVersion: localNote,
        remoteVersion: remoteNote,
        timestamp: new Date(),
        resolved: false
      }
      
      const { resolved } = await syncManager.resolveConflicts([conflict], 'merge')
      const mergedNote = resolved[0].resolution?.resolvedItem as Note
      
      expect(mergedNote.tags).toEqual(['tag1', 'tag2', 'tag3'])
    })

    it('should preserve pinned status when merging', async () => {
      const localNote = { 
        ...mockNote1, 
        isPinned: true,
        updatedAt: '2025-01-01T10:00:00Z'
      }
      const remoteNote = { 
        ...mockNote1, 
        isPinned: false,
        updatedAt: '2025-01-01T11:00:00Z'
      }
      
      const conflict = {
        id: 'conflict1',
        type: 'note' as const,
        itemId: mockNote1.id,
        localVersion: localNote,
        remoteVersion: remoteNote,
        timestamp: new Date(),
        resolved: false
      }
      
      const { resolved } = await syncManager.resolveConflicts([conflict], 'merge')
      const mergedNote = resolved[0].resolution?.resolvedItem as Note
      
      expect(mergedNote.isPinned).toBe(true)
    })

    it('should use more recent timestamp in merge', async () => {
      const localNote = { 
        ...mockNote1, 
        title: 'Local title',
        updatedAt: '2025-01-01T10:00:00Z'
      }
      const remoteNote = { 
        ...mockNote1, 
        title: 'Remote title',
        updatedAt: '2025-01-01T11:00:00Z'
      }
      
      const conflict = {
        id: 'conflict1',
        type: 'note' as const,
        itemId: mockNote1.id,
        localVersion: localNote,
        remoteVersion: remoteNote,
        timestamp: new Date(),
        resolved: false
      }
      
      const { resolved } = await syncManager.resolveConflicts([conflict], 'merge')
      const mergedNote = resolved[0].resolution?.resolvedItem as Note
      
      expect(mergedNote.title).toBe('Remote title') // More recent
      expect(mergedNote.updatedAt).toBe(remoteNote.updatedAt)
    })
  })

  describe('Sync process', () => {
    it('should complete sync without conflicts', async () => {
      const localNotes = [mockNote1]
      const remoteNotes = [mockNote2]
      const localNotebooks = [mockNotebook1]
      const remoteNotebooks: Notebook[] = []
      
      const result = await syncManager.startSync(localNotes, localNotebooks, remoteNotes, remoteNotebooks)
      
      expect(result.syncedNotes).toHaveLength(2) // Both notes
      expect(result.syncedNotebooks).toHaveLength(1) // Local notebook
      expect(result.conflicts).toHaveLength(0)
      
      const state = syncManager.getSyncState()
      expect(state.status).toBe(SyncStatus.SUCCESS)
      expect(state.lastSync).toBeTruthy()
    })

    it('should handle sync with conflicts', async () => {
      const localNote = { 
        ...mockNote1, 
        content: 'Local content',
        updatedAt: '2025-01-01T10:00:00Z'
      }
      const remoteNote = { 
        ...mockNote1, 
        content: 'Remote content',
        updatedAt: '2025-01-01T11:00:00Z'
      }
      
      const result = await syncManager.startSync([localNote], [], [remoteNote], [])
      
      expect(result.conflicts.length).toBeGreaterThan(0)
      expect(result.conflicts[0].resolved).toBe(true) // Auto-resolved
    })

    it('should update sync progress', async () => {
      const listener = vi.fn()
      syncManager.subscribe(listener)
      
      await syncManager.startSync([mockNote1], [mockNotebook1], [], [])
      
      // Should have been called multiple times with different states
      expect(listener).toHaveBeenCalled()
      
      const calls = listener.mock.calls
      const syncingCall = calls.find(call => call[0].status === SyncStatus.SYNCING)
      const successCall = calls.find(call => call[0].status === SyncStatus.SUCCESS)
      
      expect(syncingCall).toBeTruthy()
      expect(successCall).toBeTruthy()
    })
  })

  describe('Manual conflict resolution', () => {
    it('should resolve conflict manually', async () => {
      const conflict = {
        id: 'conflict1',
        type: 'note' as const,
        itemId: mockNote1.id,
        localVersion: mockNote1,
        remoteVersion: mockNote2,
        timestamp: new Date(),
        resolved: false
      }
      
      syncManager['syncState'].conflicts = [conflict]
      
      const resolution = {
        strategy: 'use_local' as const,
        resolvedItem: mockNote1,
        timestamp: new Date()
      }
      
      await syncManager.resolveConflictManually('conflict1', resolution)
      
      const state = syncManager.getSyncState()
      const resolvedConflict = state.conflicts.find(c => c.id === 'conflict1')
      
      expect(resolvedConflict?.resolved).toBe(true)
      expect(resolvedConflict?.resolution).toEqual(resolution)
    })

    it('should throw error for non-existent conflict', async () => {
      const resolution = {
        strategy: 'use_local' as const,
        timestamp: new Date()
      }
      
      await expect(
        syncManager.resolveConflictManually('non-existent', resolution)
      ).rejects.toThrow('Conflict with ID non-existent not found')
    })
  })

  describe('State management', () => {
    it('should clear resolved conflicts', () => {
      const resolvedConflict = {
        id: 'resolved',
        type: 'note' as const,
        itemId: '1',
        localVersion: mockNote1,
        remoteVersion: mockNote2,
        timestamp: new Date(),
        resolved: true
      }
      
      const unresolvedConflict = {
        id: 'unresolved',
        type: 'note' as const,
        itemId: '2',
        localVersion: mockNote1,
        remoteVersion: mockNote2,
        timestamp: new Date(),
        resolved: false
      }
      
      syncManager['syncState'].conflicts = [resolvedConflict, unresolvedConflict]
      
      syncManager.clearResolvedConflicts()
      
      const state = syncManager.getSyncState()
      expect(state.conflicts).toHaveLength(1)
      expect(state.conflicts[0].id).toBe('unresolved')
    })

    it('should reset sync state', () => {
      syncManager['syncState'] = {
        status: SyncStatus.SUCCESS,
        lastSync: new Date(),
        conflicts: [{ id: 'test' } as any],
        errors: ['error'],
        progress: 100,
        totalItems: 10,
        syncedItems: 10
      }
      
      syncManager.resetSyncState()
      
      const state = syncManager.getSyncState()
      expect(state.status).toBe(SyncStatus.IDLE)
      expect(state.lastSync).toBeNull()
      expect(state.conflicts).toHaveLength(0)
      expect(state.errors).toHaveLength(0)
      expect(state.progress).toBe(0)
      expect(state.totalItems).toBe(0)
      expect(state.syncedItems).toBe(0)
    })
  })

  describe('Listeners', () => {
    it('should subscribe and unsubscribe listeners', () => {
      const listener = vi.fn()
      const unsubscribe = syncManager.subscribe(listener)
      
      // Trigger a state change
      syncManager['updateSyncState']({ progress: 50 })
      
      expect(listener).toHaveBeenCalled()
      
      listener.mockClear()
      unsubscribe()
      
      // Trigger another state change
      syncManager['updateSyncState']({ progress: 100 })
      
      expect(listener).not.toHaveBeenCalled()
    })

    it('should handle multiple listeners', () => {
      const listener1 = vi.fn()
      const listener2 = vi.fn()
      
      syncManager.subscribe(listener1)
      syncManager.subscribe(listener2)
      
      syncManager['updateSyncState']({ progress: 75 })
      
      expect(listener1).toHaveBeenCalled()
      expect(listener2).toHaveBeenCalled()
    })
  })
})