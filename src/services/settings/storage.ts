import type { SettingValue, BackupInfo } from './types'

// Storage adapter interface
interface StorageAdapter {
  get(key?: string): Promise<any>
  set(data: Record<string, SettingValue>): Promise<void>
  remove(key: string): Promise<void>
  clear(): Promise<void>
}

// localStorage adapter
class LocalStorageAdapter implements StorageAdapter {
  private readonly key = 'viny_settings'

  async get(specificKey?: string): Promise<any> {
    try {
      const data = localStorage.getItem(this.key)
      if (!data) return specificKey ? undefined : {}
      
      const parsed = JSON.parse(data)
      return specificKey ? parsed[specificKey] : parsed
    } catch {
      return specificKey ? undefined : {}
    }
  }

  async set(data: Record<string, SettingValue>): Promise<void> {
    try {
      // Merge with existing data
      const existing = await this.get()
      const merged = { ...existing, ...data }
      localStorage.setItem(this.key, JSON.stringify(merged))
    } catch (error) {
      console.error('Failed to save settings to localStorage:', error)
      throw error
    }
  }

  async remove(key: string): Promise<void> {
    try {
      const existing = await this.get()
      delete existing[key]
      localStorage.setItem(this.key, JSON.stringify(existing))
    } catch (error) {
      console.error('Failed to remove setting from localStorage:', error)
      throw error
    }
  }

  async clear(): Promise<void> {
    try {
      localStorage.removeItem(this.key)
    } catch (error) {
      console.error('Failed to clear settings from localStorage:', error)
      throw error
    }
  }
}

// Electron adapter
class ElectronAdapter implements StorageAdapter {
  async get(specificKey?: string): Promise<any> {
    try {
      if (!window.electron?.ipcRenderer) {
        throw new Error('Electron IPC not available')
      }
      
      const data = await window.electron.ipcRenderer.invoke('settings:get')
      return specificKey ? data[specificKey] : data
    } catch (error) {
      console.error('Failed to get settings from Electron:', error)
      throw error
    }
  }

  async set(data: Record<string, SettingValue>): Promise<void> {
    try {
      if (!window.electron?.ipcRenderer) {
        throw new Error('Electron IPC not available')
      }
      
      await window.electron.ipcRenderer.invoke('settings:set', data)
    } catch (error) {
      console.error('Failed to save settings to Electron:', error)
      throw error
    }
  }

  async remove(key: string): Promise<void> {
    try {
      if (!window.electron?.ipcRenderer) {
        throw new Error('Electron IPC not available')
      }
      
      await window.electron.ipcRenderer.invoke('settings:remove', key)
    } catch (error) {
      console.error('Failed to remove setting from Electron:', error)
      throw error
    }
  }

  async clear(): Promise<void> {
    try {
      if (!window.electron?.ipcRenderer) {
        throw new Error('Electron IPC not available')
      }
      
      await window.electron.ipcRenderer.invoke('settings:clear')
    } catch (error) {
      console.error('Failed to clear settings from Electron:', error)
      throw error
    }
  }
}

export class SettingsStorage {
  private adapter: StorageAdapter
  private saveTimeout: NodeJS.Timeout | null = null
  private pendingData: Record<string, SettingValue> = {}

  constructor(adapterType: 'localStorage' | 'electron' = 'localStorage') {
    if (adapterType === 'electron') {
      this.adapter = new ElectronAdapter()
    } else {
      this.adapter = new LocalStorageAdapter()
    }
  }

  /**
   * Get settings from storage
   */
  async get(key?: string): Promise<any> {
    try {
      return await this.adapter.get(key)
    } catch (error) {
      // Fallback to localStorage if Electron fails
      if (this.adapter instanceof ElectronAdapter) {
        console.warn('Electron storage failed, falling back to localStorage')
        this.adapter = new LocalStorageAdapter()
        return await this.adapter.get(key)
      }
      throw error
    }
  }

  /**
   * Set settings in storage (debounced)
   */
  async set(data: Record<string, SettingValue>): Promise<void> {
    // Merge with pending data
    this.pendingData = { ...this.pendingData, ...data }

    // Clear existing timeout
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout)
    }

    // Debounce the actual save operation
    this.saveTimeout = setTimeout(async () => {
      try {
        await this.adapter.set(this.pendingData)
        this.pendingData = {}
      } catch (error) {
        console.error('Failed to save settings:', error)
      }
    }, 500) // 500ms debounce
  }

  /**
   * Clear settings or specific keys
   */
  async clear(keys?: string[]): Promise<void> {
    if (!keys || keys.length === 0) {
      await this.adapter.clear()
    } else {
      // Clear specific keys by getting existing data and removing keys
      const existing = await this.get()
      const filtered = { ...existing }
      keys.forEach(key => delete filtered[key])
      await this.adapter.set(filtered)
    }
  }

  /**
   * Create a backup of current settings
   */
  async backup(): Promise<string> {
    const timestamp = Date.now()
    const backupId = `backup_${timestamp}`
    const settings = await this.get()
    
    const backupData = {
      timestamp,
      settings
    }

    // Store backup in localStorage with special key
    localStorage.setItem(`viny_settings_${backupId}`, JSON.stringify(backupData))
    
    return backupId
  }

  /**
   * Restore settings from a backup
   */
  async restore(backupId: string): Promise<boolean> {
    try {
      const backupData = localStorage.getItem(`viny_settings_${backupId}`)
      if (!backupData) return false

      const parsed = JSON.parse(backupData)
      await this.set(parsed.settings)
      
      return true
    } catch {
      return false
    }
  }

  /**
   * List all available backups
   */
  async listBackups(): Promise<BackupInfo[]> {
    const backups: BackupInfo[] = []
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith('viny_settings_backup_')) {
        try {
          const data = localStorage.getItem(key)
          if (data) {
            const parsed = JSON.parse(data)
            const id = key.replace('viny_settings_', '')
            backups.push({
              id,
              timestamp: parsed.timestamp
            })
          }
        } catch {
          // Skip invalid backup entries
        }
      }
    }

    // Sort by timestamp (newest first)
    return backups.sort((a, b) => b.timestamp - a.timestamp)
  }

  /**
   * Delete a specific backup
   */
  async deleteBackup(backupId: string): Promise<void> {
    localStorage.removeItem(`viny_settings_${backupId}`)
  }

  /**
   * Clean old backups (older than specified days)
   */
  async cleanOldBackups(daysToKeep: number = 30): Promise<void> {
    const cutoffTime = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000)
    const backups = await this.listBackups()
    
    for (const backup of backups) {
      if (backup.timestamp < cutoffTime) {
        await this.deleteBackup(backup.id)
      }
    }
  }
}