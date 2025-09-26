/**
 * Settings Repository Implementation
 * Provides settings persistence via repository pattern
 * Eliminates the wrapper layer and provides clean async interface
 */

import type { AppSettings } from '../../types/settings'
import { defaultAppSettings } from '../../types/settings'
import type { ISettingsRepository } from './IRepository'
import { StorageError, StorageUtils } from './IRepository'
import { storageLogger as logger } from '../../utils/logger'
import { storageService, StorageService } from '../../services/StorageService'

export class SettingsRepository implements ISettingsRepository {
  private listeners: Map<string, ((value: any) => void)[]> = new Map()
  private isElectron: boolean
  private isInitialized = false

  constructor() {
    this.isElectron = StorageUtils.isElectron()
    logger.debug('SettingsRepository initialized', {
      isElectron: this.isElectron,
    })
  }

  private async ensureInitialized(): Promise<void> {
    if (this.isInitialized) return

    if (!this.isElectron && !StorageUtils.hasLocalStorage()) {
      throw new StorageError('initialize', new Error('No storage available'))
    }

    this.isInitialized = true
  }

  /**
   * Get complete settings object
   */
  async getSettings(): Promise<AppSettings> {
    await this.ensureInitialized()

    try {
      if (this.isElectron) {
        return await this.getElectronSettings()
      } else {
        return this.getLocalStorageSettings()
      }
    } catch (error) {
      logger.error('Failed to get settings:', error)
      throw new StorageError('getSettings', error as Error, true)
    }
  }

  /**
   * Save partial or complete settings
   */
  async saveSettings(updates: Partial<AppSettings>): Promise<void> {
    await this.ensureInitialized()

    try {
      // Get current settings and merge with updates
      const currentSettings = await this.getSettings()
      const newSettings = { ...currentSettings, ...updates }

      if (this.isElectron) {
        await this.saveElectronSettings(newSettings)
      } else {
        this.saveLocalStorageSettings(newSettings)
      }

      // Notify listeners of changed keys
      Object.keys(updates).forEach(key => {
        this.notifyListeners(key, updates[key as keyof AppSettings])
      })

      logger.debug('Settings saved successfully', {
        keys: Object.keys(updates),
      })
    } catch (error) {
      logger.error('Failed to save settings:', error)
      throw new StorageError('saveSettings', error as Error, true)
    }
  }

  /**
   * Reset settings to defaults
   */
  async resetSettings(): Promise<void> {
    await this.ensureInitialized()

    try {
      if (this.isElectron) {
        await this.saveElectronSettings(defaultAppSettings)
      } else {
        this.saveLocalStorageSettings(defaultAppSettings)
      }

      // Notify all listeners of reset
      Object.keys(defaultAppSettings).forEach(key => {
        this.notifyListeners(key, defaultAppSettings[key as keyof AppSettings])
      })

      logger.debug('Settings reset to defaults')
    } catch (error) {
      logger.error('Failed to reset settings:', error)
      throw new StorageError('resetSettings', error as Error)
    }
  }

  /**
   * Get single setting value
   */
  async getSetting<K extends keyof AppSettings>(
    key: K
  ): Promise<AppSettings[K]> {
    const settings = await this.getSettings()
    return settings[key] ?? defaultAppSettings[key]
  }

  /**
   * Set single setting value
   */
  async setSetting<K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ): Promise<void> {
    await this.saveSettings({ [key]: value } as Partial<AppSettings>)
  }

  /**
   * Get tag colors (consolidated from multiple implementations)
   */
  async getTagColors(): Promise<Record<string, string>> {
    const settings = await this.getSettings()
    return settings.tagColors || {}
  }

  /**
   * Save tag colors
   */
  async saveTagColors(tagColors: Record<string, string>): Promise<void> {
    await this.saveSettings({ tagColors })
  }

  /**
   * Watch for setting changes
   */
  watch<K extends keyof AppSettings>(
    key: K,
    callback: (value: AppSettings[K]) => void
  ): () => void {
    const keyStr = String(key)

    if (!this.listeners.has(keyStr)) {
      this.listeners.set(keyStr, [])
    }

    this.listeners.get(keyStr)!.push(callback)

    // Return unsubscribe function
    return () => {
      const keyListeners = this.listeners.get(keyStr)
      if (keyListeners) {
        const index = keyListeners.indexOf(callback)
        if (index > -1) {
          keyListeners.splice(index, 1)
        }
      }
    }
  }

  /**
   * Export settings as JSON
   */
  async export(): Promise<string> {
    const settings = await this.getSettings()
    return JSON.stringify(settings, null, 2)
  }

  /**
   * Import settings from JSON
   */
  async import(data: string): Promise<void> {
    try {
      const importedSettings = JSON.parse(data)

      // Validate imported settings
      const validSettings: Partial<AppSettings> = {}
      Object.keys(defaultAppSettings).forEach(key => {
        if (key in importedSettings) {
          validSettings[key as keyof AppSettings] = importedSettings[key]
        }
      })

      await this.saveSettings(validSettings)
      logger.debug('Settings imported successfully')
    } catch (error) {
      logger.error('Failed to import settings:', error)
      throw new StorageError('import', error as Error)
    }
  }

  // Private implementation methods

  private async getElectronSettings(): Promise<AppSettings> {
    try {
      const stored = await window.electronAPI?.storage?.loadSettings?.()

      if (!stored || Object.keys(stored).length === 0) {
        return defaultAppSettings
      }

      // Merge with defaults to ensure all properties exist
      return { ...defaultAppSettings, ...stored }
    } catch (error) {
      logger.warn('Electron settings failed, falling back to localStorage')
      return this.getLocalStorageSettings()
    }
  }

  private getLocalStorageSettings(): AppSettings {
    try {
      const stored = storageService.getItem(StorageService.KEYS.SETTINGS)
      if (!stored) {
        return defaultAppSettings
      }

      const parsed = JSON.parse(stored)
      return { ...defaultAppSettings, ...parsed }
    } catch (error) {
      logger.warn('localStorage settings failed, using defaults')
      return defaultAppSettings
    }
  }

  private async saveElectronSettings(settings: AppSettings): Promise<void> {
    try {
      // Ensure the settings object can be serialized for IPC
      const serializableSettings = JSON.parse(JSON.stringify(settings))
      await window.electronAPI?.storage?.saveSettings?.(serializableSettings)
    } catch (error) {
      logger.warn('Electron save failed, falling back to localStorage')
      this.saveLocalStorageSettings(settings)
    }
  }

  private saveLocalStorageSettings(settings: AppSettings): void {
    try {
      storageService.setItem(
        StorageService.KEYS.SETTINGS,
        JSON.stringify(settings)
      )
    } catch (error) {
      throw new StorageError('saveLocalStorage', error as Error)
    }
  }

  private notifyListeners(key: string, value: any): void {
    const listeners = this.listeners.get(key)
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(value)
        } catch (error) {
          logger.error('Error in settings listener:', error)
        }
      })
    }
  }
}
