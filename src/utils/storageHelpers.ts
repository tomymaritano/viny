/**
 * Storage Helper Functions
 *
 * These helpers provide backward-compatible wrappers for localStorage operations
 * that automatically use the centralized StorageService.
 */

import { storageService, StorageService } from '../services/StorageService'

// Re-export storage keys for convenience
export const STORAGE_KEYS = StorageService.KEYS

/**
 * Get item from storage (backward compatible)
 */
export function getStorageItem(key: string): string | null {
  return storageService.getItem(key)
}

/**
 * Set item in storage (backward compatible)
 */
export function setStorageItem(key: string, value: string): void {
  storageService.setItem(key, value)
}

/**
 * Remove item from storage (backward compatible)
 */
export function removeStorageItem(key: string): void {
  storageService.removeItem(key)
}

/**
 * Get JSON from storage with default value
 */
export function getStorageJSON<T>(key: string, defaultValue: T): T {
  return storageService.getJSON(key, defaultValue)
}

/**
 * Set JSON in storage
 */
export function setStorageJSON(key: string, value: any): void {
  storageService.setJSON(key, value)
}

/**
 * Check if storage has a key
 */
export function hasStorageItem(key: string): boolean {
  return storageService.getItem(key) !== null
}

/**
 * Get all storage keys
 */
export function getAllStorageKeys(): string[] {
  return storageService.getAllKeys()
}

/**
 * Clear all storage
 */
export function clearAllStorage(): void {
  storageService.clear()
}

/**
 * Get storage size info
 */
export function getStorageSize(key?: string): number {
  if (key) {
    return storageService.getItemSize(key)
  }
  return storageService.getTotalSize()
}

/**
 * Check if storage is available
 */
export function isStorageAvailable(): boolean {
  return storageService.isAvailable()
}

/**
 * Batch storage operations
 */
export function batchStorage(
  operations: Array<{ type: 'set' | 'remove'; key: string; value?: string }>
): boolean {
  return storageService.batch(operations)
}

/**
 * Create a namespaced storage helper
 */
export function createNamespacedStorage(namespace: string) {
  const prefix = `${namespace}_`

  return {
    getItem: (key: string) => getStorageItem(prefix + key),
    setItem: (key: string, value: string) =>
      setStorageItem(prefix + key, value),
    removeItem: (key: string) => removeStorageItem(prefix + key),
    getJSON: <T>(key: string, defaultValue: T) =>
      getStorageJSON(prefix + key, defaultValue),
    setJSON: (key: string, value: any) => setStorageJSON(prefix + key, value),
    hasItem: (key: string) => hasStorageItem(prefix + key),
    getAllKeys: () => getAllStorageKeys().filter(k => k.startsWith(prefix)),
    clear: () => {
      const keys = getAllStorageKeys().filter(k => k.startsWith(prefix))
      keys.forEach(k => removeStorageItem(k))
    },
  }
}

/**
 * Storage migration helper
 */
export async function migrateLocalStorage(): Promise<void> {
  // This function can be used to migrate old localStorage keys
  // to new ones or to different storage backends

  const migrations = [
    // Example migrations
    { from: 'viny-notes', to: 'viny_notes' },
    { from: 'viny-notebooks', to: 'viny_notebooks' },
    // Add more migrations as needed
  ]

  for (const migration of migrations) {
    storageService.migrateKey(migration.from, migration.to)
  }
}
