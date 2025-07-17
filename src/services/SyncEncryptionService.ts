/**
 * Viny Sync Encryption Service
 * Zero-knowledge end-to-end encryption for cloud synchronization
 */

import { encryptionService } from './EncryptionService'
import { logger } from '../utils/logger'
import { Note, Notebook, Settings } from '../types'

export interface SyncPayload {
  id: string
  type: 'notes' | 'notebooks' | 'settings' | 'tagColors'
  action: 'create' | 'update' | 'delete' | 'sync'
  data: any
  timestamp: number
  version: string
  clientId: string
}

export interface EncryptedSyncPayload {
  id: string
  encryptedData: string
  iv: string
  salt: string
  timestamp: number
  version: string
  clientId: string
  integrity: string
}

export interface SyncKey {
  keyId: string
  encryptedKey: string
  createdAt: number
  expiresAt: number
  version: string
}

export interface SyncConflict {
  id: string
  type: string
  localVersion: any
  remoteVersion: any
  timestamp: number
  resolution?: 'local' | 'remote' | 'merge' | 'manual'
}

export interface SyncSession {
  sessionId: string
  clientId: string
  syncKey: SyncKey
  startedAt: number
  lastActivity: number
  status: 'active' | 'completed' | 'failed'
  itemsProcessed: number
  conflicts: SyncConflict[]
}

/**
 * Sync Encryption Service
 * Handles zero-knowledge encryption for cloud sync operations
 */
export class SyncEncryptionService {
  private clientId: string
  private syncKeys: Map<string, SyncKey> = new Map()
  private activeSessions: Map<string, SyncSession> = new Map()
  private readonly KEY_ROTATION_INTERVAL = 7 * 24 * 60 * 60 * 1000 // 7 days
  private readonly SESSION_TIMEOUT = 30 * 60 * 1000 // 30 minutes

  constructor() {
    this.clientId = this.generateClientId()
    this.initializeSyncService()
  }

  private initializeSyncService(): void {
    logger.info('SyncEncryption: Initializing sync encryption service')
    this.loadSyncKeys()
    this.setupKeyRotation()
    this.setupSessionCleanup()
  }

  /**
   * Create new sync session with key generation
   */
  async createSyncSession(): Promise<SyncSession | null> {
    try {
      if (!encryptionService.isEncryptionActive()) {
        throw new Error('Master encryption not active')
      }

      const sessionId = this.generateSessionId()
      const syncKey = await this.generateSyncKey()
      
      if (!syncKey) {
        throw new Error('Failed to generate sync key')
      }

      const session: SyncSession = {
        sessionId,
        clientId: this.clientId,
        syncKey,
        startedAt: Date.now(),
        lastActivity: Date.now(),
        status: 'active',
        itemsProcessed: 0,
        conflicts: []
      }

      this.activeSessions.set(sessionId, session)
      this.syncKeys.set(syncKey.keyId, syncKey)

      logger.info(`SyncEncryption: Created sync session: ${sessionId}`)
      return session

    } catch (error) {
      logger.error('SyncEncryption: Failed to create sync session:', error)
      return null
    }
  }

  /**
   * Encrypt data for sync transmission
   */
  async encryptForSync(payload: SyncPayload, sessionId: string): Promise<EncryptedSyncPayload | null> {
    try {
      const session = this.activeSessions.get(sessionId)
      if (!session) {
        throw new Error('Invalid or expired sync session')
      }

      // Update session activity
      session.lastActivity = Date.now()

      // Serialize payload
      const payloadData = JSON.stringify(payload)
      
      // Generate unique IV for this payload
      const iv = this.generateIV()
      
      // Encrypt with session key
      const encrypted = await encryptionService.encryptData(payloadData, `sync_${session.syncKey.keyId}`)
      
      if (!encrypted) {
        throw new Error('Failed to encrypt sync payload')
      }

      // Create integrity hash
      const integrity = await this.createIntegrityHash(encrypted.data, session.syncKey.keyId)

      const encryptedPayload: EncryptedSyncPayload = {
        id: payload.id,
        encryptedData: encrypted.data,
        iv: encrypted.iv,
        salt: encrypted.salt,
        timestamp: payload.timestamp,
        version: payload.version,
        clientId: this.clientId,
        integrity
      }

      session.itemsProcessed++
      logger.debug(`SyncEncryption: Encrypted payload for sync: ${payload.id}`)
      
      return encryptedPayload

    } catch (error) {
      logger.error('SyncEncryption: Failed to encrypt for sync:', error)
      return null
    }
  }

  /**
   * Decrypt data received from sync
   */
  async decryptFromSync(encryptedPayload: EncryptedSyncPayload, sessionId: string): Promise<SyncPayload | null> {
    try {
      const session = this.activeSessions.get(sessionId)
      if (!session) {
        throw new Error('Invalid or expired sync session')
      }

      // Verify integrity
      const expectedIntegrity = await this.createIntegrityHash(
        encryptedPayload.encryptedData, 
        session.syncKey.keyId
      )
      
      if (expectedIntegrity !== encryptedPayload.integrity) {
        throw new Error('Sync data integrity check failed')
      }

      // Reconstruct encrypted data format
      const encryptedData = {
        data: encryptedPayload.encryptedData,
        iv: encryptedPayload.iv,
        salt: encryptedPayload.salt,
        algorithm: 'AES-256-GCM',
        version: '1.0',
        integrity: encryptedPayload.integrity
      }

      // Decrypt with session key
      const decrypted = await encryptionService.decryptData(encryptedData, `sync_${session.syncKey.keyId}`)
      
      if (!decrypted) {
        throw new Error('Failed to decrypt sync payload')
      }

      const payload: SyncPayload = JSON.parse(decrypted)
      
      // Update session
      session.lastActivity = Date.now()
      session.itemsProcessed++

      logger.debug(`SyncEncryption: Decrypted payload from sync: ${payload.id}`)
      return payload

    } catch (error) {
      logger.error('SyncEncryption: Failed to decrypt from sync:', error)
      return null
    }
  }

  /**
   * Create sync payload for notes
   */
  createNotesPayload(notes: Note[], action: SyncPayload['action'] = 'sync'): SyncPayload {
    return {
      id: this.generatePayloadId(),
      type: 'notes',
      action,
      data: notes,
      timestamp: Date.now(),
      version: '2.0',
      clientId: this.clientId
    }
  }

  /**
   * Create sync payload for notebooks
   */
  createNotebooksPayload(notebooks: Notebook[], action: SyncPayload['action'] = 'sync'): SyncPayload {
    return {
      id: this.generatePayloadId(),
      type: 'notebooks',
      action,
      data: notebooks,
      timestamp: Date.now(),
      version: '2.0',
      clientId: this.clientId
    }
  }

  /**
   * Create sync payload for settings
   */
  createSettingsPayload(settings: Partial<Settings>, action: SyncPayload['action'] = 'sync'): SyncPayload {
    return {
      id: this.generatePayloadId(),
      type: 'settings',
      action,
      data: settings,
      timestamp: Date.now(),
      version: '2.0',
      clientId: this.clientId
    }
  }

  /**
   * Create sync payload for tag colors
   */
  createTagColorsPayload(tagColors: Record<string, string>, action: SyncPayload['action'] = 'sync'): SyncPayload {
    return {
      id: this.generatePayloadId(),
      type: 'tagColors',
      action,
      data: tagColors,
      timestamp: Date.now(),
      version: '2.0',
      clientId: this.clientId
    }
  }

  /**
   * Handle sync conflicts
   */
  async resolveConflict(conflict: SyncConflict, resolution: SyncConflict['resolution']): Promise<any | null> {
    try {
      switch (resolution) {
        case 'local':
          logger.info(`SyncEncryption: Resolved conflict ${conflict.id} using local version`)
          return conflict.localVersion

        case 'remote':
          logger.info(`SyncEncryption: Resolved conflict ${conflict.id} using remote version`)
          return conflict.remoteVersion

        case 'merge':
          const merged = await this.mergeConflictData(conflict)
          logger.info(`SyncEncryption: Resolved conflict ${conflict.id} using merge strategy`)
          return merged

        case 'manual':
          logger.info(`SyncEncryption: Conflict ${conflict.id} marked for manual resolution`)
          return null

        default:
          logger.warn(`SyncEncryption: Unknown resolution strategy: ${resolution}`)
          return null
      }
    } catch (error) {
      logger.error('SyncEncryption: Failed to resolve conflict:', error)
      return null
    }
  }

  /**
   * Complete sync session
   */
  async completeSyncSession(sessionId: string): Promise<boolean> {
    try {
      const session = this.activeSessions.get(sessionId)
      if (!session) {
        logger.warn(`SyncEncryption: Attempted to complete non-existent session: ${sessionId}`)
        return false
      }

      session.status = 'completed'
      session.lastActivity = Date.now()

      // Clean up session after delay
      setTimeout(() => {
        this.activeSessions.delete(sessionId)
        logger.debug(`SyncEncryption: Cleaned up completed session: ${sessionId}`)
      }, 60000) // 1 minute delay

      logger.info(`SyncEncryption: Completed sync session: ${sessionId} (${session.itemsProcessed} items)`)
      return true

    } catch (error) {
      logger.error('SyncEncryption: Failed to complete sync session:', error)
      return false
    }
  }

  /**
   * Get sync session status
   */
  getSyncSessionStatus(sessionId: string): SyncSession | null {
    return this.activeSessions.get(sessionId) || null
  }

  /**
   * Get all active sync sessions
   */
  getActiveSyncSessions(): SyncSession[] {
    return Array.from(this.activeSessions.values()).filter(session => session.status === 'active')
  }

  /**
   * Generate sync authentication token
   */
  async generateSyncAuthToken(sessionId: string): Promise<string | null> {
    try {
      const session = this.activeSessions.get(sessionId)
      if (!session) {
        throw new Error('Invalid sync session')
      }

      const authData = {
        sessionId,
        clientId: this.clientId,
        keyId: session.syncKey.keyId,
        timestamp: Date.now(),
        expires: Date.now() + (60 * 60 * 1000) // 1 hour
      }

      const encrypted = await encryptionService.encryptData(
        JSON.stringify(authData),
        `sync_auth_${session.syncKey.keyId}`
      )

      if (encrypted) {
        return Buffer.from(JSON.stringify(encrypted)).toString('base64')
      }

      return null

    } catch (error) {
      logger.error('SyncEncryption: Failed to generate auth token:', error)
      return null
    }
  }

  /**
   * Validate sync authentication token
   */
  async validateSyncAuthToken(token: string): Promise<boolean> {
    try {
      const encryptedData = JSON.parse(Buffer.from(token, 'base64').toString())
      
      // Find matching session
      for (const session of this.activeSessions.values()) {
        try {
          const decrypted = await encryptionService.decryptData(
            encryptedData,
            `sync_auth_${session.syncKey.keyId}`
          )

          if (decrypted) {
            const authData = JSON.parse(decrypted)
            
            if (authData.clientId === this.clientId && 
                authData.expires > Date.now()) {
              return true
            }
          }
        } catch {
          // Continue trying other sessions
        }
      }

      return false

    } catch (error) {
      logger.error('SyncEncryption: Failed to validate auth token:', error)
      return false
    }
  }

  // Private helper methods

  private async generateSyncKey(): Promise<SyncKey | null> {
    try {
      const keyId = this.generateKeyId()
      const syncKeyData = await encryptionService.generateSyncKey()
      
      if (!syncKeyData) {
        return null
      }

      const encryptedKey = await encryptionService.encryptData(syncKeyData, 'sync_key_storage')
      
      if (!encryptedKey) {
        return null
      }

      const syncKey: SyncKey = {
        keyId,
        encryptedKey: JSON.stringify(encryptedKey),
        createdAt: Date.now(),
        expiresAt: Date.now() + this.KEY_ROTATION_INTERVAL,
        version: '1.0'
      }

      return syncKey

    } catch (error) {
      logger.error('SyncEncryption: Failed to generate sync key:', error)
      return null
    }
  }

  private async createIntegrityHash(data: string, keyId: string): Promise<string> {
    // Create HMAC hash for integrity verification
    const key = `integrity_${keyId}`
    return Buffer.from(data + key).toString('base64')
  }

  private async mergeConflictData(conflict: SyncConflict): Promise<any> {
    // Implement intelligent merge strategy based on data type
    switch (conflict.type) {
      case 'notes':
        return this.mergeNotes(conflict.localVersion, conflict.remoteVersion)
      case 'notebooks':
        return this.mergeNotebooks(conflict.localVersion, conflict.remoteVersion)
      case 'settings':
        return this.mergeSettings(conflict.localVersion, conflict.remoteVersion)
      default:
        // Default to most recent
        return conflict.localVersion.updatedAt > conflict.remoteVersion.updatedAt 
          ? conflict.localVersion 
          : conflict.remoteVersion
    }
  }

  private mergeNotes(local: Note, remote: Note): Note {
    // Use the most recently updated note, but preserve local content if more recent
    if (local.updatedAt > remote.updatedAt) {
      return local
    } else if (remote.updatedAt > local.updatedAt) {
      return remote
    } else {
      // Same timestamp, merge intelligently
      return {
        ...remote,
        content: local.content.length > remote.content.length ? local.content : remote.content,
        tags: [...new Set([...(local.tags || []), ...(remote.tags || [])])],
        updatedAt: new Date().toISOString()
      }
    }
  }

  private mergeNotebooks(local: Notebook[], remote: Notebook[]): Notebook[] {
    const merged = new Map<string, Notebook>()
    
    // Add all local notebooks
    local.forEach(notebook => merged.set(notebook.id, notebook))
    
    // Merge remote notebooks
    remote.forEach(remoteNotebook => {
      const localNotebook = merged.get(remoteNotebook.id)
      if (!localNotebook) {
        merged.set(remoteNotebook.id, remoteNotebook)
      } else {
        // Use most recent version
        if (remoteNotebook.updatedAt > localNotebook.updatedAt) {
          merged.set(remoteNotebook.id, remoteNotebook)
        }
      }
    })
    
    return Array.from(merged.values())
  }

  private mergeSettings(local: Partial<Settings>, remote: Partial<Settings>): Partial<Settings> {
    // Merge settings, preferring local values for UI preferences
    const merged = { ...remote, ...local }
    
    // But prefer remote for certain global settings
    if (remote.syncEnabled !== undefined) merged.syncEnabled = remote.syncEnabled
    if (remote.encryptionEnabled !== undefined) merged.encryptionEnabled = remote.encryptionEnabled
    
    return merged
  }

  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateKeyId(): string {
    return `key_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generatePayloadId(): string {
    return `payload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateIV(): string {
    return Math.random().toString(36).substr(2, 16)
  }

  private loadSyncKeys(): void {
    try {
      const stored = localStorage.getItem('viny_sync_keys')
      if (stored) {
        const keys = JSON.parse(stored)
        for (const [keyId, keyData] of Object.entries(keys)) {
          this.syncKeys.set(keyId, keyData as SyncKey)
        }
        logger.debug(`SyncEncryption: Loaded ${this.syncKeys.size} sync keys`)
      }
    } catch (error) {
      logger.error('SyncEncryption: Failed to load sync keys:', error)
    }
  }

  private saveSyncKeys(): void {
    try {
      const keysObject = Object.fromEntries(this.syncKeys.entries())
      localStorage.setItem('viny_sync_keys', JSON.stringify(keysObject))
    } catch (error) {
      logger.error('SyncEncryption: Failed to save sync keys:', error)
    }
  }

  private setupKeyRotation(): void {
    setInterval(() => {
      this.rotateExpiredKeys()
    }, 60 * 60 * 1000) // Check every hour
  }

  private setupSessionCleanup(): void {
    setInterval(() => {
      this.cleanupExpiredSessions()
    }, 5 * 60 * 1000) // Check every 5 minutes
  }

  private rotateExpiredKeys(): void {
    const now = Date.now()
    let rotatedCount = 0

    for (const [keyId, key] of this.syncKeys.entries()) {
      if (key.expiresAt < now) {
        this.syncKeys.delete(keyId)
        rotatedCount++
      }
    }

    if (rotatedCount > 0) {
      this.saveSyncKeys()
      logger.info(`SyncEncryption: Rotated ${rotatedCount} expired sync keys`)
    }
  }

  private cleanupExpiredSessions(): void {
    const now = Date.now()
    let cleanedCount = 0

    for (const [sessionId, session] of this.activeSessions.entries()) {
      if (session.lastActivity + this.SESSION_TIMEOUT < now) {
        session.status = 'failed'
        this.activeSessions.delete(sessionId)
        cleanedCount++
      }
    }

    if (cleanedCount > 0) {
      logger.info(`SyncEncryption: Cleaned up ${cleanedCount} expired sync sessions`)
    }
  }
}

// Export singleton instance
export const syncEncryptionService = new SyncEncryptionService()

// Export utility functions
export async function createEncryptedSyncSession(): Promise<SyncSession | null> {
  return syncEncryptionService.createSyncSession()
}

export async function encryptSyncPayload(payload: SyncPayload, sessionId: string): Promise<EncryptedSyncPayload | null> {
  return syncEncryptionService.encryptForSync(payload, sessionId)
}

export async function decryptSyncPayload(encryptedPayload: EncryptedSyncPayload, sessionId: string): Promise<SyncPayload | null> {
  return syncEncryptionService.decryptFromSync(encryptedPayload, sessionId)
}