/**
 * Synchronization manager for handling data conflicts and sync operations
 */
import { Note, Notebook } from '../types'
import { logger } from './logger'
import { errorHandler } from './errorHandler'

export interface SyncConflict {
  id: string
  type: 'note' | 'notebook'
  itemId: string
  localVersion: Note | Notebook
  remoteVersion: Note | Notebook
  timestamp: Date
  resolved: boolean
  resolution?: ConflictResolution
}

export interface ConflictResolution {
  strategy: 'use_local' | 'use_remote' | 'merge' | 'create_both'
  resolvedItem?: Note | Notebook
  timestamp: Date
}

export enum SyncStatus {
  IDLE = 'idle',
  SYNCING = 'syncing',
  CONFLICT = 'conflict',
  ERROR = 'error',
  SUCCESS = 'success'
}

export interface SyncState {
  status: SyncStatus
  lastSync: Date | null
  conflicts: SyncConflict[]
  errors: string[]
  progress: number
  totalItems: number
  syncedItems: number
}

export class SyncManager {
  private static instance: SyncManager
  private syncState: SyncState = {
    status: SyncStatus.IDLE,
    lastSync: null,
    conflicts: [],
    errors: [],
    progress: 0,
    totalItems: 0,
    syncedItems: 0
  }
  private listeners: ((state: SyncState) => void)[] = []

  private constructor() {}

  static getInstance(): SyncManager {
    if (!SyncManager.instance) {
      SyncManager.instance = new SyncManager()
    }
    return SyncManager.instance
  }

  // Subscribe to sync state changes
  subscribe(listener: (state: SyncState) => void): () => void {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.syncState))
  }

  private updateSyncState(updates: Partial<SyncState>): void {
    this.syncState = { ...this.syncState, ...updates }
    this.notifyListeners()
  }

  // Get current sync state
  getSyncState(): SyncState {
    return { ...this.syncState }
  }

  // Detect conflicts between local and remote data
  detectConflicts(
    localNotes: Note[],
    remoteNotes: Note[],
    localNotebooks: Notebook[],
    remoteNotebooks: Notebook[]
  ): SyncConflict[] {
    const conflicts: SyncConflict[] = []

    // Check note conflicts
    for (const localNote of localNotes) {
      const remoteNote = remoteNotes.find(r => r.id === localNote.id)
      if (remoteNote && this.hasConflict(localNote, remoteNote)) {
        conflicts.push({
          id: `conflict_${localNote.id}_${Date.now()}`,
          type: 'note',
          itemId: localNote.id,
          localVersion: localNote,
          remoteVersion: remoteNote,
          timestamp: new Date(),
          resolved: false
        })
      }
    }

    // Check notebook conflicts
    for (const localNotebook of localNotebooks) {
      const remoteNotebook = remoteNotebooks.find(r => r.id === localNotebook.id)
      if (remoteNotebook && this.hasConflict(localNotebook, remoteNotebook)) {
        conflicts.push({
          id: `conflict_${localNotebook.id}_${Date.now()}`,
          type: 'notebook',
          itemId: localNotebook.id,
          localVersion: localNotebook,
          remoteVersion: remoteNotebook,
          timestamp: new Date(),
          resolved: false
        })
      }
    }

    return conflicts
  }

  // Check if two items have conflicts
  private hasConflict(local: Note | Notebook, remote: Note | Notebook): boolean {
    // Compare timestamps
    const localUpdated = new Date(local.updatedAt).getTime()
    const remoteUpdated = new Date(remote.updatedAt).getTime()
    
    // No conflict if timestamps are the same
    if (localUpdated === remoteUpdated) {
      return false
    }

    // Check if content differs
    if (this.isNote(local) && this.isNote(remote)) {
      return local.content !== remote.content || 
             local.title !== remote.title ||
             JSON.stringify(local.tags) !== JSON.stringify(remote.tags)
    }

    if (this.isNotebook(local) && this.isNotebook(remote)) {
      return local.name !== remote.name ||
             local.color !== remote.color ||
             local.description !== remote.description
    }

    return false
  }

  private isNote(item: Note | Notebook): item is Note {
    return 'content' in item
  }

  private isNotebook(item: Note | Notebook): item is Notebook {
    return 'name' in item && !('content' in item)
  }

  // Resolve conflicts automatically based on strategy
  async resolveConflicts(
    conflicts: SyncConflict[],
    defaultStrategy: ConflictResolution['strategy'] = 'merge'
  ): Promise<{ resolved: SyncConflict[]; failed: SyncConflict[] }> {
    const resolved: SyncConflict[] = []
    const failed: SyncConflict[] = []

    for (const conflict of conflicts) {
      try {
        const resolution = await this.resolveConflict(conflict, defaultStrategy)
        const resolvedConflict: SyncConflict = {
          ...conflict,
          resolved: true,
          resolution
        }
        resolved.push(resolvedConflict)
      } catch (error) {
        logger.error('Failed to resolve conflict:', error)
        failed.push(conflict)
      }
    }

    return { resolved, failed }
  }

  // Resolve a single conflict
  private async resolveConflict(
    conflict: SyncConflict,
    strategy: ConflictResolution['strategy']
  ): Promise<ConflictResolution> {
    const resolution: ConflictResolution = {
      strategy,
      timestamp: new Date()
    }

    switch (strategy) {
      case 'use_local':
        resolution.resolvedItem = conflict.localVersion
        break

      case 'use_remote':
        resolution.resolvedItem = conflict.remoteVersion
        break

      case 'merge':
        resolution.resolvedItem = await this.mergeItems(
          conflict.localVersion,
          conflict.remoteVersion
        )
        break

      case 'create_both':
        // Create both versions with different IDs
        resolution.resolvedItem = conflict.localVersion
        // Remote version will be created separately
        break

      default:
        throw new Error(`Unknown resolution strategy: ${strategy}`)
    }

    return resolution
  }

  // Merge two items intelligently
  private async mergeItems(
    local: Note | Notebook,
    remote: Note | Notebook
  ): Promise<Note | Notebook> {
    if (this.isNote(local) && this.isNote(remote)) {
      return this.mergeNotes(local, remote)
    }

    if (this.isNotebook(local) && this.isNotebook(remote)) {
      return this.mergeNotebooks(local, remote)
    }

    throw new Error('Cannot merge items of different types')
  }

  private mergeNotes(local: Note, remote: Note): Note {
    // Use the most recent timestamp
    const useRemote = new Date(remote.updatedAt) > new Date(local.updatedAt)
    
    return {
      ...local,
      // Merge content intelligently
      content: this.mergeContent(local.content, remote.content),
      title: useRemote ? remote.title : local.title,
      tags: this.mergeTags(local.tags, remote.tags),
      updatedAt: useRemote ? remote.updatedAt : local.updatedAt,
      // Preserve important flags
      isPinned: local.isPinned || remote.isPinned,
      isDeleted: local.isDeleted || remote.isDeleted,
      // Add conflict marker
      metadata: {
        ...local.metadata,
        ...remote.metadata,
        conflictResolved: true,
        conflictResolvedAt: new Date().toISOString()
      }
    }
  }

  private mergeNotebooks(local: Notebook, remote: Notebook): Notebook {
    const useRemote = new Date(remote.updatedAt) > new Date(local.updatedAt)
    
    return {
      ...local,
      name: useRemote ? remote.name : local.name,
      color: useRemote ? remote.color : local.color,
      description: useRemote ? remote.description : local.description,
      updatedAt: useRemote ? remote.updatedAt : local.updatedAt,
      isDeleted: local.isDeleted || remote.isDeleted,
      metadata: {
        ...local.metadata,
        ...remote.metadata,
        conflictResolved: true,
        conflictResolvedAt: new Date().toISOString()
      }
    }
  }

  private mergeContent(localContent: string, remoteContent: string): string {
    // Simple merge strategy - could be enhanced with diff algorithms
    if (localContent === remoteContent) {
      return localContent
    }

    // If one is empty, use the other
    if (!localContent.trim()) return remoteContent
    if (!remoteContent.trim()) return localContent

    // Create a merged version with conflict markers
    return `${localContent}\n\n---\n\n${remoteContent}`
  }

  private mergeTags(localTags: string[], remoteTags: string[]): string[] {
    const combined = [...localTags, ...remoteTags]
    return [...new Set(combined)].sort()
  }

  // Start synchronization process
  async startSync(
    localNotes: Note[],
    localNotebooks: Notebook[],
    remoteNotes: Note[],
    remoteNotebooks: Notebook[]
  ): Promise<{
    syncedNotes: Note[]
    syncedNotebooks: Notebook[]
    conflicts: SyncConflict[]
  }> {
    this.updateSyncState({
      status: SyncStatus.SYNCING,
      progress: 0,
      totalItems: localNotes.length + localNotebooks.length,
      syncedItems: 0,
      errors: []
    })

    try {
      // Detect conflicts
      const conflicts = this.detectConflicts(
        localNotes,
        remoteNotes,
        localNotebooks,
        remoteNotebooks
      )

      if (conflicts.length > 0) {
        this.updateSyncState({
          status: SyncStatus.CONFLICT,
          conflicts
        })

        // Try to resolve conflicts automatically
        const { resolved, failed } = await this.resolveConflicts(conflicts)
        
        if (failed.length > 0) {
          this.updateSyncState({
            status: SyncStatus.CONFLICT,
            conflicts: failed
          })
          throw new Error(`${failed.length} conflicts could not be resolved automatically`)
        }

        // Update conflicts with resolutions
        this.updateSyncState({
          conflicts: resolved
        })
      }

      // Merge data
      const syncedNotes = this.mergeArrays(localNotes, remoteNotes)
      const syncedNotebooks = this.mergeArrays(localNotebooks, remoteNotebooks)

      this.updateSyncState({
        status: SyncStatus.SUCCESS,
        lastSync: new Date(),
        progress: 100,
        syncedItems: syncedNotes.length + syncedNotebooks.length
      })

      return {
        syncedNotes,
        syncedNotebooks,
        conflicts: this.syncState.conflicts
      }

    } catch (error) {
      this.updateSyncState({
        status: SyncStatus.ERROR,
        errors: [error instanceof Error ? error.message : String(error)]
      })
      
      errorHandler.handleError(error as Error, {
        context: 'sync_manager',
        operation: 'startSync'
      })

      throw error
    }
  }

  private mergeArrays<T extends { id: string; updatedAt: string }>(
    local: T[],
    remote: T[]
  ): T[] {
    const merged = new Map<string, T>()

    // Add local items
    for (const item of local) {
      merged.set(item.id, item)
    }

    // Add remote items, preferring newer versions
    for (const item of remote) {
      const existing = merged.get(item.id)
      if (!existing || new Date(item.updatedAt) > new Date(existing.updatedAt)) {
        merged.set(item.id, item)
      }
    }

    return Array.from(merged.values())
  }

  // Manual conflict resolution
  async resolveConflictManually(
    conflictId: string,
    resolution: ConflictResolution
  ): Promise<void> {
    const conflict = this.syncState.conflicts.find(c => c.id === conflictId)
    if (!conflict) {
      throw new Error(`Conflict with ID ${conflictId} not found`)
    }

    const resolvedConflict: SyncConflict = {
      ...conflict,
      resolved: true,
      resolution
    }

    this.updateSyncState({
      conflicts: this.syncState.conflicts.map(c => 
        c.id === conflictId ? resolvedConflict : c
      )
    })
  }

  // Clear resolved conflicts
  clearResolvedConflicts(): void {
    this.updateSyncState({
      conflicts: this.syncState.conflicts.filter(c => !c.resolved)
    })
  }

  // Reset sync state
  resetSyncState(): void {
    this.updateSyncState({
      status: SyncStatus.IDLE,
      lastSync: null,
      conflicts: [],
      errors: [],
      progress: 0,
      totalItems: 0,
      syncedItems: 0
    })
  }
}

export const syncManager = SyncManager.getInstance()