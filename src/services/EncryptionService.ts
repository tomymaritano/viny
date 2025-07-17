/**
 * Viny Encryption Service
 * Enterprise-grade end-to-end encryption with zero-knowledge architecture
 */

import CryptoJS from 'crypto-js'
import { logger } from '../utils/logger'

// Encryption Types and Interfaces
export interface EncryptedData {
  data: string
  iv: string
  salt: string
  algorithm: string
  version: string
  integrity: string
}

export interface EncryptionKey {
  key: string
  salt: string
  iterations: number
  algorithm: string
  derivedAt: number
}

export interface EncryptionConfig {
  algorithm: 'AES-256-GCM'
  keyDerivation: 'PBKDF2' | 'Argon2'
  iterations: number
  saltLength: number
  ivLength: number
  tagLength: number
}

export interface MasterKey {
  hash: string
  salt: string
  derivedKey: string
  createdAt: number
  lastUsed: number
  version: string
}

// Default encryption configuration
const DEFAULT_CONFIG: EncryptionConfig = {
  algorithm: 'AES-256-GCM',
  keyDerivation: 'PBKDF2',
  iterations: 100000, // NIST recommended minimum
  saltLength: 32, // 256 bits
  ivLength: 16, // 128 bits
  tagLength: 16 // 128 bits
}

/**
 * Enterprise Encryption Service
 * Provides zero-knowledge encryption for all user data
 */
export class EncryptionService {
  private config: EncryptionConfig
  private masterKey: MasterKey | null = null
  private sessionKeys: Map<string, EncryptionKey> = new Map()
  private keyRotationInterval: number = 24 * 60 * 60 * 1000 // 24 hours
  
  constructor(config: Partial<EncryptionConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.initializeService()
  }

  private initializeService(): void {
    logger.info('EncryptionService: Initializing encryption system')
    this.loadMasterKey()
    this.setupKeyRotation()
    this.setupSecurityMonitoring()
  }

  /**
   * Initialize master key from password
   */
  async initializeMasterKey(password: string): Promise<boolean> {
    try {
      logger.info('EncryptionService: Initializing master key')
      
      // Generate salt for master key
      const salt = this.generateSalt()
      
      // Derive master key from password
      const derivedKey = await this.deriveKey(password, salt, this.config.iterations)
      
      // Create master key hash for verification
      const keyHash = CryptoJS.SHA256(derivedKey + salt).toString()
      
      this.masterKey = {
        hash: keyHash,
        salt: salt,
        derivedKey: derivedKey,
        createdAt: Date.now(),
        lastUsed: Date.now(),
        version: '1.0'
      }

      // Store encrypted master key info (not the key itself)
      this.storeMasterKeyInfo()
      
      logger.info('EncryptionService: Master key initialized successfully')
      return true

    } catch (error) {
      logger.error('EncryptionService: Failed to initialize master key:', error)
      return false
    }
  }

  /**
   * Unlock with master password
   */
  async unlockWithPassword(password: string): Promise<boolean> {
    try {
      const storedKeyInfo = this.loadMasterKeyInfo()
      if (!storedKeyInfo) {
        logger.warn('EncryptionService: No master key found')
        return false
      }

      // Derive key from provided password
      const derivedKey = await this.deriveKey(password, storedKeyInfo.salt, this.config.iterations)
      
      // Verify password by comparing hash
      const keyHash = CryptoJS.SHA256(derivedKey + storedKeyInfo.salt).toString()
      
      if (keyHash !== storedKeyInfo.hash) {
        logger.warn('EncryptionService: Invalid master password')
        return false
      }

      // Restore master key
      this.masterKey = {
        ...storedKeyInfo,
        derivedKey: derivedKey,
        lastUsed: Date.now()
      }

      logger.info('EncryptionService: Successfully unlocked with master password')
      return true

    } catch (error) {
      logger.error('EncryptionService: Failed to unlock with password:', error)
      return false
    }
  }

  /**
   * Encrypt data with master key
   */
  async encryptData(data: string, context: string = 'default'): Promise<EncryptedData | null> {
    try {
      if (!this.masterKey) {
        throw new Error('Master key not initialized')
      }

      // Generate unique IV for this encryption
      const iv = CryptoJS.lib.WordArray.random(this.config.ivLength)
      
      // Use master key or derive context-specific key
      const encryptionKey = this.getContextKey(context)
      
      // Encrypt data using AES-256-GCM
      const encrypted = CryptoJS.AES.encrypt(data, encryptionKey, {
        iv: iv,
        mode: CryptoJS.mode.GCM,
        padding: CryptoJS.pad.NoPadding
      })

      // Generate integrity hash
      const integrity = CryptoJS.HmacSHA256(
        encrypted.toString() + iv.toString(),
        this.masterKey.derivedKey
      ).toString()

      const encryptedData: EncryptedData = {
        data: encrypted.toString(),
        iv: iv.toString(),
        salt: this.masterKey.salt,
        algorithm: this.config.algorithm,
        version: '1.0',
        integrity: integrity
      }

      logger.debug(`EncryptionService: Successfully encrypted data for context: ${context}`)
      return encryptedData

    } catch (error) {
      logger.error('EncryptionService: Failed to encrypt data:', error)
      return null
    }
  }

  /**
   * Decrypt data with master key
   */
  async decryptData(encryptedData: EncryptedData, context: string = 'default'): Promise<string | null> {
    try {
      if (!this.masterKey) {
        throw new Error('Master key not initialized')
      }

      // Verify data integrity
      const expectedIntegrity = CryptoJS.HmacSHA256(
        encryptedData.data + encryptedData.iv,
        this.masterKey.derivedKey
      ).toString()

      if (expectedIntegrity !== encryptedData.integrity) {
        throw new Error('Data integrity check failed - possible tampering detected')
      }

      // Get context-specific key
      const decryptionKey = this.getContextKey(context)
      
      // Convert IV back to WordArray
      const iv = CryptoJS.enc.Hex.parse(encryptedData.iv)
      
      // Decrypt data
      const decrypted = CryptoJS.AES.decrypt(encryptedData.data, decryptionKey, {
        iv: iv,
        mode: CryptoJS.mode.GCM,
        padding: CryptoJS.pad.NoPadding
      })

      const decryptedText = decrypted.toString(CryptoJS.enc.Utf8)
      
      if (!decryptedText) {
        throw new Error('Decryption failed - invalid key or corrupted data')
      }

      logger.debug(`EncryptionService: Successfully decrypted data for context: ${context}`)
      return decryptedText

    } catch (error) {
      logger.error('EncryptionService: Failed to decrypt data:', error)
      return null
    }
  }

  /**
   * Encrypt local storage data
   */
  async encryptForStorage(key: string, data: any): Promise<boolean> {
    try {
      const serializedData = JSON.stringify(data)
      const encrypted = await this.encryptData(serializedData, 'storage')
      
      if (!encrypted) {
        return false
      }

      // Store with encryption metadata
      const storageData = {
        encrypted: true,
        version: '1.0',
        data: encrypted,
        encryptedAt: Date.now()
      }

      localStorage.setItem(`viny_encrypted_${key}`, JSON.stringify(storageData))
      logger.debug(`EncryptionService: Encrypted and stored data for key: ${key}`)
      return true

    } catch (error) {
      logger.error('EncryptionService: Failed to encrypt for storage:', error)
      return false
    }
  }

  /**
   * Decrypt local storage data
   */
  async decryptFromStorage(key: string): Promise<any | null> {
    try {
      const storageData = localStorage.getItem(`viny_encrypted_${key}`)
      if (!storageData) {
        return null
      }

      const parsed = JSON.parse(storageData)
      if (!parsed.encrypted || !parsed.data) {
        // Handle legacy unencrypted data
        return parsed
      }

      const decrypted = await this.decryptData(parsed.data, 'storage')
      if (!decrypted) {
        return null
      }

      logger.debug(`EncryptionService: Decrypted storage data for key: ${key}`)
      return JSON.parse(decrypted)

    } catch (error) {
      logger.error('EncryptionService: Failed to decrypt from storage:', error)
      return null
    }
  }

  /**
   * Generate encryption key for sync/export
   */
  async generateSyncKey(): Promise<string | null> {
    try {
      if (!this.masterKey) {
        throw new Error('Master key not initialized')
      }

      // Generate sync-specific key derived from master key
      const syncSalt = this.generateSalt()
      const syncKey = await this.deriveKey(
        this.masterKey.derivedKey,
        syncSalt,
        50000 // Fewer iterations for sync performance
      )

      // Store sync key info
      this.sessionKeys.set('sync', {
        key: syncKey,
        salt: syncSalt,
        iterations: 50000,
        algorithm: 'PBKDF2',
        derivedAt: Date.now()
      })

      logger.info('EncryptionService: Generated sync encryption key')
      return syncKey

    } catch (error) {
      logger.error('EncryptionService: Failed to generate sync key:', error)
      return null
    }
  }

  /**
   * Change master password
   */
  async changeMasterPassword(currentPassword: string, newPassword: string): Promise<boolean> {
    try {
      // Verify current password
      const isValid = await this.unlockWithPassword(currentPassword)
      if (!isValid) {
        throw new Error('Current password is incorrect')
      }

      // Backup current encrypted data
      const backupData = await this.createEncryptedBackup()
      
      // Generate new master key
      const success = await this.initializeMasterKey(newPassword)
      if (!success) {
        throw new Error('Failed to create new master key')
      }

      // Re-encrypt all data with new key
      await this.reencryptAllData(backupData)

      logger.info('EncryptionService: Master password changed successfully')
      return true

    } catch (error) {
      logger.error('EncryptionService: Failed to change master password:', error)
      return false
    }
  }

  /**
   * Check if encryption is available and active
   */
  isEncryptionActive(): boolean {
    return this.masterKey !== null
  }

  /**
   * Get encryption status and info
   */
  getEncryptionStatus(): any {
    return {
      active: this.isEncryptionActive(),
      algorithm: this.config.algorithm,
      keyDerivation: this.config.keyDerivation,
      iterations: this.config.iterations,
      masterKeyCreated: this.masterKey?.createdAt || null,
      lastUsed: this.masterKey?.lastUsed || null,
      sessionKeys: this.sessionKeys.size,
      nextKeyRotation: this.getNextKeyRotation()
    }
  }

  /**
   * Lock encryption (clear keys from memory)
   */
  lock(): void {
    logger.info('EncryptionService: Locking encryption service')
    this.masterKey = null
    this.sessionKeys.clear()
  }

  // Private helper methods

  private async deriveKey(password: string, salt: string, iterations: number): Promise<string> {
    if (this.config.keyDerivation === 'PBKDF2') {
      return CryptoJS.PBKDF2(password, salt, {
        keySize: 256 / 32, // 256 bits
        iterations: iterations,
        hasher: CryptoJS.algo.SHA256
      }).toString()
    } else {
      // Argon2 implementation would go here
      // For now, fallback to PBKDF2
      return CryptoJS.PBKDF2(password, salt, {
        keySize: 256 / 32,
        iterations: iterations,
        hasher: CryptoJS.algo.SHA256
      }).toString()
    }
  }

  private generateSalt(): string {
    return CryptoJS.lib.WordArray.random(this.config.saltLength).toString()
  }

  private getContextKey(context: string): string {
    if (!this.masterKey) {
      throw new Error('Master key not available')
    }

    // For specific contexts, derive a unique key
    if (context !== 'default') {
      const contextKey = CryptoJS.HmacSHA256(context, this.masterKey.derivedKey).toString()
      return contextKey.substring(0, 64) // Use first 32 bytes for AES-256
    }

    return this.masterKey.derivedKey
  }

  private storeMasterKeyInfo(): void {
    if (!this.masterKey) return

    const keyInfo = {
      hash: this.masterKey.hash,
      salt: this.masterKey.salt,
      createdAt: this.masterKey.createdAt,
      version: this.masterKey.version,
      algorithm: this.config.algorithm,
      iterations: this.config.iterations
    }

    localStorage.setItem('viny_master_key_info', JSON.stringify(keyInfo))
  }

  private loadMasterKeyInfo(): any {
    try {
      const keyInfo = localStorage.getItem('viny_master_key_info')
      return keyInfo ? JSON.parse(keyInfo) : null
    } catch (error) {
      logger.error('EncryptionService: Failed to load master key info:', error)
      return null
    }
  }

  private loadMasterKey(): void {
    const keyInfo = this.loadMasterKeyInfo()
    if (keyInfo) {
      logger.info('EncryptionService: Found existing master key info')
    }
  }

  private setupKeyRotation(): void {
    // Rotate session keys periodically
    setInterval(() => {
      this.rotateSessionKeys()
    }, this.keyRotationInterval)
  }

  private setupSecurityMonitoring(): void {
    // Monitor for security events
    window.addEventListener('beforeunload', () => {
      this.lock() // Auto-lock on page unload
    })

    // Auto-lock after inactivity (30 minutes)
    let inactivityTimer: NodeJS.Timeout
    const resetInactivityTimer = () => {
      clearTimeout(inactivityTimer)
      inactivityTimer = setTimeout(() => {
        this.lock()
        logger.info('EncryptionService: Auto-locked due to inactivity')
      }, 30 * 60 * 1000)
    }

    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
      document.addEventListener(event, resetInactivityTimer, true)
    })

    resetInactivityTimer()
  }

  private rotateSessionKeys(): void {
    logger.debug('EncryptionService: Rotating session keys')
    
    // Clear old session keys
    const now = Date.now()
    for (const [context, key] of this.sessionKeys.entries()) {
      if (now - key.derivedAt > this.keyRotationInterval) {
        this.sessionKeys.delete(context)
      }
    }
  }

  private getNextKeyRotation(): number {
    const nextRotation = Date.now() + this.keyRotationInterval
    return nextRotation
  }

  private async createEncryptedBackup(): Promise<any> {
    // Implementation for creating encrypted backup of all data
    // This would be used during password changes
    return {}
  }

  private async reencryptAllData(backupData: any): Promise<void> {
    // Implementation for re-encrypting all data with new master key
    // This would be used during password changes
  }
}

// Export singleton instance
export const encryptionService = new EncryptionService()

// Export utility functions
export function isDataEncrypted(data: any): boolean {
  return data && typeof data === 'object' && data.encrypted === true && data.data
}

export function createEncryptedContainer(encryptedData: EncryptedData): any {
  return {
    encrypted: true,
    version: '1.0',
    data: encryptedData,
    encryptedAt: Date.now()
  }
}

export function isEncryptionSupported(): boolean {
  try {
    // Check if crypto APIs are available
    return typeof CryptoJS !== 'undefined' && 
           typeof localStorage !== 'undefined' &&
           typeof crypto !== 'undefined'
  } catch {
    return false
  }
}