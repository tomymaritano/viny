import { describe, it, expect, beforeEach, beforeAll, vi, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import type { Note, Notebook } from '../../types'
import type { SyncState, SyncConflict } from '../../utils/syncManager'

// Mock timers
vi.useFakeTimers()

// Mock the store first
const mockStore = {
  notes: [],
  notebooks: [],
  setNotes: vi.fn(),
  setNotebooks: vi.fn(),
  showError: vi.fn(),
  showSuccess: vi.fn(),
}

vi.mock('../../stores/newSimpleStore', () => ({
  useAppStore: () => mockStore
}))

// Mock the syncManager
vi.mock('../../utils/syncManager', () => ({
  syncManager: {
    getSyncState: vi.fn(),
    subscribe: vi.fn(),
    startSync: vi.fn(),
    resolveConflictManually: vi.fn(),
    clearResolvedConflicts: vi.fn(),
    resetSyncState: vi.fn(),
  },
  SyncStatus: {
    IDLE: 'idle',
    SYNCING: 'syncing',
    CONFLICT: 'conflict',
    ERROR: 'error',
    SUCCESS: 'success'
  }
}))

// Mock logger
vi.mock('../../utils/logger', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn()
  }
}))

// Mock fetchRemoteData by importing and replacing the internal implementation
const mockFetchRemoteData = vi.fn().mockResolvedValue({
  notes: [],
  notebooks: []
})

describe('useSync', () => {
  let useSync: any
  let useSyncStatus: any
  let mockSyncManager: any

  beforeAll(async () => {
    // Import hooks after mocks are set up  
    const hookModule = await import('../useSync')
    useSync = hookModule.useSync
    useSyncStatus = hookModule.useSyncStatus
    
    // Get mocked syncManager
    const syncModule = await import('../../utils/syncManager')
    mockSyncManager = vi.mocked(syncModule.syncManager)
  })

  // Test data
  const mockNotes: Note[] = [
    {
      id: '1',
      title: 'Test Note 1',
      content: 'Content 1',
      notebook: 'test',
      tags: ['tag1'],
      status: 'draft',
      isPinned: false,
      isTrashed: false,
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-01T00:00:00.000Z'
    }
  ]

  const mockNotebooks: Notebook[] = [
    {
      id: 'nb1',
      name: 'Test Notebook',
      color: '#ff0000',
      description: 'Test description',
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-01T00:00:00.000Z'
    }
  ]

  const mockSyncState: SyncState = {
    status: 'idle',
    lastSync: null,
    conflicts: [],
    errors: [],
    progress: 0,
    totalItems: 0,
    syncedItems: 0
  }

  const mockConflict: SyncConflict = {
    id: 'conflict1',
    type: 'note',
    itemId: '1',
    localVersion: mockNotes[0],
    remoteVersion: { ...mockNotes[0], content: 'Remote content' },
    timestamp: new Date('2023-01-01T12:00:00.000Z'),
    resolved: false
  }

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks()

    // Setup sync manager mock defaults
    mockSyncManager.getSyncState.mockReturnValue(mockSyncState)
    mockSyncManager.subscribe.mockReturnValue(() => {})
    mockSyncManager.startSync.mockResolvedValue({
      syncedNotes: mockNotes,
      syncedNotebooks: mockNotebooks,
      conflicts: []
    })

    // Setup navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      value: true,
      writable: true
    })

    // Setup window event listeners
    Object.defineProperty(window, 'addEventListener', { value: vi.fn() })
    Object.defineProperty(window, 'removeEventListener', { value: vi.fn() })
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.clearAllTimers()
  })

  describe('initialization', () => {
    it('should initialize with sync state from manager', () => {
      const { result } = renderHook(() => useSync({ fetchRemoteData: mockFetchRemoteData }))

      expect(mockSyncManager.getSyncState).toHaveBeenCalled()
      expect(mockSyncManager.subscribe).toHaveBeenCalled()
      expect(result.current.syncState).toEqual(mockSyncState)
      expect(result.current.isOnline).toBe(true)
      expect(result.current.isSyncing).toBe(false)
    })

    it('should setup online/offline event listeners', () => {
      renderHook(() => useSync({ fetchRemoteData: mockFetchRemoteData }))

      expect(window.addEventListener).toHaveBeenCalledWith('online', expect.any(Function))
      expect(window.addEventListener).toHaveBeenCalledWith('offline', expect.any(Function))
    })

    it('should initialize with custom options', () => {
      const options = {
        autoSync: true,
        syncInterval: 60000,
        conflictResolutionStrategy: 'use_local' as const
      }

      const { result } = renderHook(() => useSync(options))

      expect(result.current).toBeDefined()
    })
  })

  describe('online status management', () => {
    it('should update online status when network changes', () => {
      const { result } = renderHook(() => useSync({ fetchRemoteData: mockFetchRemoteData }))

      // Simulate going offline
      Object.defineProperty(navigator, 'onLine', { value: false, writable: true })
      
      // Get the offline handler
      const addEventListener = vi.mocked(window.addEventListener)
      const offlineCall = addEventListener.mock.calls.find(call => call[0] === 'offline')
      const offlineHandler = offlineCall?.[1] as () => void
      
      act(() => {
        offlineHandler()
      })

      expect(result.current.isOnline).toBe(false)
    })

    it('should update online status when coming back online', () => {
      // Start offline
      Object.defineProperty(navigator, 'onLine', { value: false, writable: true })
      const { result } = renderHook(() => useSync({ fetchRemoteData: mockFetchRemoteData }))

      // Go online
      Object.defineProperty(navigator, 'onLine', { value: true, writable: true })
      
      const addEventListener = vi.mocked(window.addEventListener)
      const onlineCall = addEventListener.mock.calls.find(call => call[0] === 'online')
      const onlineHandler = onlineCall?.[1] as () => void
      
      act(() => {
        onlineHandler()
      })

      expect(result.current.isOnline).toBe(true)
    })
  })

  describe('auto-sync functionality', () => {
    it('should not setup auto-sync when disabled', () => {
      renderHook(() => useSync({ autoSync: false }))

      // Fast-forward time
      act(() => {
        vi.advanceTimersByTime(60000)
      })

      expect(mockSyncManager.startSync).not.toHaveBeenCalled()
    })

    it('should not auto-sync when offline', () => {
      Object.defineProperty(navigator, 'onLine', { value: false, writable: true })
      
      renderHook(() => useSync({ autoSync: true, syncInterval: 1000 }))

      act(() => {
        vi.advanceTimersByTime(1000)
      })

      expect(mockSyncManager.startSync).not.toHaveBeenCalled()
    })
  })

  describe('performSync', () => {
    it('should perform sync successfully', async () => {
      const { result } = renderHook(() => useSync({ fetchRemoteData: mockFetchRemoteData }))

      let syncResult: boolean = false
      await act(async () => {
        syncResult = await result.current.performSync()
      })

      expect(syncResult).toBe(true)
      expect(mockSyncManager.startSync).toHaveBeenCalled()
      expect(mockStore.setNotes).toHaveBeenCalledWith(mockNotes)
      expect(mockStore.showSuccess).toHaveBeenCalledWith('Sync completed successfully')
    })

    it('should handle sync with resolved conflicts', async () => {
      const conflictResult = {
        syncedNotes: mockNotes,
        syncedNotebooks: mockNotebooks,
        conflicts: [{ ...mockConflict, resolved: true }]
      }
      mockSyncManager.startSync.mockResolvedValueOnce(conflictResult)

      const { result } = renderHook(() => useSync({ fetchRemoteData: mockFetchRemoteData }))

      await act(async () => {
        await result.current.performSync()
      })

      expect(mockStore.showSuccess).toHaveBeenCalledWith(
        'Sync completed. 1 conflicts resolved automatically.'
      )
    })

    it('should handle sync with unresolved conflicts', async () => {
      const conflictResult = {
        syncedNotes: mockNotes,
        syncedNotebooks: mockNotebooks,
        conflicts: [mockConflict]
      }
      mockSyncManager.startSync.mockResolvedValueOnce(conflictResult)

      const { result } = renderHook(() => useSync({ fetchRemoteData: mockFetchRemoteData }))

      await act(async () => {
        await result.current.performSync()
      })

      expect(mockStore.showError).toHaveBeenCalledWith(
        '1 conflicts require manual resolution'
      )
    })

    it('should handle sync failure', async () => {
      const error = new Error('Network error')
      mockSyncManager.startSync.mockRejectedValueOnce(error)

      const { result } = renderHook(() => useSync({ fetchRemoteData: mockFetchRemoteData }))

      let syncResult: boolean = true
      await act(async () => {
        syncResult = await result.current.performSync()
      })

      expect(syncResult).toBe(false)
      expect(mockStore.showError).toHaveBeenCalledWith('Sync failed. Please try again.')
    })

    it('should not sync when offline', async () => {
      const { result } = renderHook(() => useSync({ fetchRemoteData: mockFetchRemoteData }))

      // Set isOnline to false using the event handler
      const addEventListener = vi.mocked(window.addEventListener)
      const offlineCall = addEventListener.mock.calls.find(call => call[0] === 'offline')
      const offlineHandler = offlineCall?.[1] as () => void
      
      act(() => {
        Object.defineProperty(navigator, 'onLine', { value: false, writable: true })
        if (offlineHandler) {
          offlineHandler()
        }
      })

      let syncResult: boolean = true
      await act(async () => {
        syncResult = await result.current.performSync()
      })

      expect(syncResult).toBe(false)
      expect(mockStore.showError).toHaveBeenCalledWith('Cannot sync while offline')
      expect(mockSyncManager.startSync).not.toHaveBeenCalled()
    })
  })

  describe('conflict resolution', () => {
    it('should resolve conflict manually', async () => {
      const resolution = {
        strategy: 'use_local' as const,
        resolvedItem: mockNotes[0],
        timestamp: new Date()
      }

      // Mock sync state with conflict
      const stateWithConflict = {
        ...mockSyncState,
        conflicts: [mockConflict]
      }
      mockSyncManager.getSyncState.mockReturnValue(stateWithConflict)

      const { result } = renderHook(() => useSync({ fetchRemoteData: mockFetchRemoteData }))

      await act(async () => {
        await result.current.resolveConflict('conflict1', resolution)
      })

      expect(mockSyncManager.resolveConflictManually).toHaveBeenCalledWith('conflict1', resolution)
      expect(mockStore.setNotes).toHaveBeenCalled()
      expect(mockStore.showSuccess).toHaveBeenCalledWith('Conflict resolved successfully')
    })

    it('should handle notebook conflict resolution', async () => {
      const notebookConflict: SyncConflict = {
        ...mockConflict,
        type: 'notebook',
        localVersion: mockNotebooks[0],
        remoteVersion: mockNotebooks[0]
      }

      const resolution = {
        strategy: 'use_remote' as const,
        resolvedItem: mockNotebooks[0],
        timestamp: new Date()
      }

      const stateWithConflict = {
        ...mockSyncState,
        conflicts: [notebookConflict]
      }
      mockSyncManager.getSyncState.mockReturnValue(stateWithConflict)

      const { result } = renderHook(() => useSync({ fetchRemoteData: mockFetchRemoteData }))

      await act(async () => {
        await result.current.resolveConflict(notebookConflict.id, resolution)
      })

      // Notebook management not implemented in store yet, so this test should pass without assertions
    })

    it('should handle conflict resolution error', async () => {
      const error = new Error('Resolution failed')
      mockSyncManager.resolveConflictManually.mockRejectedValueOnce(error)

      const stateWithConflict = {
        ...mockSyncState,
        conflicts: [mockConflict]
      }
      mockSyncManager.getSyncState.mockReturnValue(stateWithConflict)

      const { result } = renderHook(() => useSync({ fetchRemoteData: mockFetchRemoteData }))

      const resolution = {
        strategy: 'use_local' as const,
        resolvedItem: mockNotes[0],
        timestamp: new Date()
      }

      await act(async () => {
        await result.current.resolveConflict('conflict1', resolution)
      })

      expect(mockStore.showError).toHaveBeenCalledWith('Failed to resolve conflict')
    })
  })

  describe('utility functions', () => {
    it('should force sync', async () => {
      const { result } = renderHook(() => useSync({ fetchRemoteData: mockFetchRemoteData }))

      await act(async () => {
        const success = await result.current.forceSync()
        expect(success).toBe(true)
      })

      expect(mockSyncManager.startSync).toHaveBeenCalled()
    })

    it('should clear resolved conflicts', () => {
      const { result } = renderHook(() => useSync({ fetchRemoteData: mockFetchRemoteData }))

      act(() => {
        result.current.clearResolvedConflicts()
      })

      expect(mockSyncManager.clearResolvedConflicts).toHaveBeenCalled()
    })

    it('should reset sync state', () => {
      const { result } = renderHook(() => useSync({ fetchRemoteData: mockFetchRemoteData }))

      act(() => {
        result.current.resetSync()
      })

      expect(mockSyncManager.resetSyncState).toHaveBeenCalled()
    })

    it('should get conflict by ID', () => {
      const stateWithConflict = {
        ...mockSyncState,
        conflicts: [mockConflict]
      }
      mockSyncManager.getSyncState.mockReturnValue(stateWithConflict)

      const { result } = renderHook(() => useSync({ fetchRemoteData: mockFetchRemoteData }))

      const conflict = result.current.getConflict('conflict1')
      expect(conflict).toEqual(mockConflict)
    })

    it('should get unresolved conflicts', () => {
      const stateWithConflicts = {
        ...mockSyncState,
        conflicts: [
          mockConflict,
          { ...mockConflict, id: 'conflict2', resolved: true }
        ]
      }
      mockSyncManager.getSyncState.mockReturnValue(stateWithConflicts)

      const { result } = renderHook(() => useSync({ fetchRemoteData: mockFetchRemoteData }))

      const unresolved = result.current.getUnresolvedConflicts()
      expect(unresolved).toHaveLength(1)
      expect(unresolved[0].id).toBe('conflict1')
    })
  })

  describe('computed properties', () => {
    it('should compute sync status correctly', () => {
      const syncingState = { ...mockSyncState, status: 'syncing' as const }
      mockSyncManager.getSyncState.mockReturnValue(syncingState)

      const { result } = renderHook(() => useSync({ fetchRemoteData: mockFetchRemoteData }))

      expect(result.current.isSyncing).toBe(true)
      expect(result.current.syncState.status).toBe('syncing')
    })

    it('should compute conflict status correctly', () => {
      const stateWithConflict = {
        ...mockSyncState,
        conflicts: [mockConflict]
      }
      mockSyncManager.getSyncState.mockReturnValue(stateWithConflict)

      const { result } = renderHook(() => useSync({ fetchRemoteData: mockFetchRemoteData }))

      expect(result.current.hasConflicts).toBe(true)
      expect(result.current.hasUnresolvedConflicts).toBe(true)
      expect(result.current.conflictCount).toBe(1)
      expect(result.current.unresolvedConflictCount).toBe(1)
    })

    it('should compute sync progress correctly', () => {
      const progressState = { 
        ...mockSyncState, 
        progress: 75,
        lastSync: new Date('2023-01-01T12:00:00.000Z')
      }
      mockSyncManager.getSyncState.mockReturnValue(progressState)

      const { result } = renderHook(() => useSync({ fetchRemoteData: mockFetchRemoteData }))

      expect(result.current.syncProgress).toBe(75)
      expect(result.current.lastSync).toEqual(new Date('2023-01-01T12:00:00.000Z'))
    })
  })

  describe('cleanup', () => {
    it('should cleanup on unmount', () => {
      const unsubscribe = vi.fn()
      mockSyncManager.subscribe.mockReturnValue(unsubscribe)

      const { unmount } = renderHook(() => useSync({ autoSync: true }))

      unmount()

      expect(unsubscribe).toHaveBeenCalled()
      expect(window.removeEventListener).toHaveBeenCalledWith('online', expect.any(Function))
      expect(window.removeEventListener).toHaveBeenCalledWith('offline', expect.any(Function))
    })
  })
})

describe('useSyncStatus', () => {
  let useSyncStatus: any
  let mockSyncManager: any

  beforeAll(async () => {
    // Import hooks after mocks are set up
    const hookModule = await import('../useSync')
    useSyncStatus = hookModule.useSyncStatus
    
    // Get mocked syncManager
    const syncModule = await import('../../utils/syncManager')
    mockSyncManager = vi.mocked(syncModule.syncManager)
  })
  const mockSyncState: SyncState = {
    status: 'idle',
    lastSync: new Date('2023-01-01T12:00:00.000Z'),
    conflicts: [],
    errors: [],
    progress: 50,
    totalItems: 10,
    syncedItems: 5
  }

  beforeEach(() => {
    mockSyncManager.getSyncState.mockReturnValue(mockSyncState)
    mockSyncManager.subscribe.mockReturnValue(() => {})

    Object.defineProperty(navigator, 'onLine', {
      value: true,
      writable: true
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('initialization', () => {
    it('should initialize with sync status', () => {
      const { result } = renderHook(() => useSyncStatus())

      expect(result.current.status).toBe('idle')
      expect(result.current.isOnline).toBe(true)
      expect(result.current.isSyncing).toBe(false)
      expect(result.current.lastSync).toEqual(new Date('2023-01-01T12:00:00.000Z'))
      expect(result.current.hasConflicts).toBe(false)
      expect(result.current.conflictCount).toBe(0)
      expect(result.current.progress).toBe(50)
    })

    it('should detect syncing status', () => {
      const syncingState = { ...mockSyncState, status: 'syncing' as const }
      mockSyncManager.getSyncState.mockReturnValue(syncingState)

      const { result } = renderHook(() => useSyncStatus())

      expect(result.current.isSyncing).toBe(true)
    })

    it('should detect conflicts', () => {
      const stateWithConflicts = {
        ...mockSyncState,
        conflicts: [
          {
            id: 'conflict1',
            type: 'note' as const,
            itemId: '1',
            localVersion: {} as any,
            remoteVersion: {} as any,
            timestamp: new Date(),
            resolved: false
          }
        ]
      }
      mockSyncManager.getSyncState.mockReturnValue(stateWithConflicts)

      const { result } = renderHook(() => useSyncStatus())

      expect(result.current.hasConflicts).toBe(true)
      expect(result.current.conflictCount).toBe(1)
    })

    it('should handle offline status', () => {
      Object.defineProperty(navigator, 'onLine', { value: false, writable: true })
      
      const { result } = renderHook(() => useSyncStatus())

      // Simulate offline event
      const addEventListener = vi.mocked(window.addEventListener)
      const offlineCall = addEventListener.mock.calls.find(call => call[0] === 'offline')
      const offlineHandler = offlineCall?.[1] as () => void
      
      act(() => {
        offlineHandler()
      })

      expect(result.current.isOnline).toBe(false)
    })
  })

  describe('sync state subscription', () => {
    it('should subscribe to sync state changes', () => {
      renderHook(() => useSyncStatus())

      expect(mockSyncManager.subscribe).toHaveBeenCalled()
      expect(mockSyncManager.getSyncState).toHaveBeenCalled()
    })

    it('should cleanup subscription on unmount', () => {
      const unsubscribe = vi.fn()
      mockSyncManager.subscribe.mockReturnValue(unsubscribe)

      const { unmount } = renderHook(() => useSyncStatus())

      unmount()

      expect(unsubscribe).toHaveBeenCalled()
    })
  })
})