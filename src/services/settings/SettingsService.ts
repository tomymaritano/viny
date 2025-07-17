import { EventEmitter } from 'events'
import type { 
  SettingValue, 
  SettingsExportData, 
  SettingsImportResult,
  SettingChangeEvent,
  SettingBatchChangeEvent,
  SettingPreviewEvent,
  SettingResetEvent,
  SettingImportEvent,
  SettingErrorEvent
} from './types'
import { SettingsRegistry } from './registry'
import { SettingsValidator } from './validator'
import { SettingsStorage } from './storage'

/**
 * Centralized settings management service with validation, preview, and persistence.
 * 
 * @description
 * This service provides a comprehensive settings management system that includes:
 * - Schema-based validation for all settings
 * - Live preview with automatic revert on timeout
 * - Event-driven architecture for reactive updates
 * - Persistent storage with automatic saving
 * - Import/export functionality
 * - Batch updates with transaction-like behavior
 * 
 * @extends EventEmitter
 * 
 * @fires SettingsService#change - When a setting value changes
 * @fires SettingsService#batch-change - When multiple settings change at once
 * @fires SettingsService#preview - When a setting enters preview mode
 * @fires SettingsService#reset - When settings are reset to defaults
 * @fires SettingsService#import - When settings are imported
 * @fires SettingsService#error - When an error occurs
 * 
 * @example
 * ```typescript
 * const settings = SettingsService.getInstance();
 * await settings.init();
 * 
 * // Update a setting
 * await settings.set('theme', 'dark');
 * 
 * // Preview a setting (auto-reverts after timeout)
 * await settings.preview('fontSize', 16);
 * 
 * // Batch update
 * await settings.batchSet({
 *   theme: 'dark',
 *   fontSize: 14,
 *   autoSave: true
 * });
 * 
 * // Listen for changes
 * settings.on('change', (event) => {
 *   console.log(`${event.key} changed from ${event.previousValue} to ${event.value}`);
 * });
 * ```
 */
export class SettingsService extends EventEmitter {
  private static instance: SettingsService | null = null
  
  private settings: Map<string, SettingValue> = new Map()
  private previews: Map<string, SettingValue> = new Map()
  private previewTimeouts: Map<string, NodeJS.Timeout> = new Map()
  
  private registry: SettingsRegistry
  private validator: SettingsValidator
  private storage: SettingsStorage
  
  private initialized = false

  private constructor() {
    super()
    this.registry = new SettingsRegistry()
    this.validator = new SettingsValidator(this.registry)
    this.storage = new SettingsStorage()
  }

  /**
   * Get the singleton instance of SettingsService
   * @returns {SettingsService} The singleton instance
   */
  static getInstance(): SettingsService {
    if (!SettingsService.instance) {
      SettingsService.instance = new SettingsService()
    }
    return SettingsService.instance
  }

  /**
   * Initialize the service and load settings from storage
   * @returns {Promise<void>}
   * @throws {Error} If initialization fails
   */
  async init(): Promise<void> {
    if (this.initialized) return

    try {
      // Load settings from storage
      const storedSettings = await this.storage.get()
      
      // Apply stored settings to our map
      Object.entries(storedSettings).forEach(([key, value]) => {
        this.settings.set(key, value)
      })

      // Apply defaults for missing settings
      this.applyDefaults()

      this.initialized = true
      this.emit('initialized')
    } catch (error) {
      console.error('Failed to initialize settings service:', error)
      this.emit('error', {
        error: error instanceof Error ? error : new Error('Unknown initialization error'),
        context: 'initialization'
      } as SettingErrorEvent)
    }
  }

  /**
   * Get a setting value
   */
  get(key: string, defaultValue?: SettingValue): SettingValue {
    const value = this.settings.get(key)
    if (value !== undefined) return value
    
    // Try to get default from schema
    const schema = this.registry.getSchema(key)
    if (schema) return schema.defaultValue
    
    return defaultValue
  }

  /**
   * Set a setting value
   */
  set(key: string, value: SettingValue): boolean {
    try {
      // Validate the value
      const result = this.validator.validate(key, value)
      if (!result.isValid) {
        this.emit('error', {
          error: new Error(result.error || 'Validation failed'),
          context: 'validate',
          key
        } as SettingErrorEvent)
        return false
      }

      const previousValue = this.settings.get(key)
      
      // Only proceed if value actually changed
      if (previousValue === result.value) {
        return true
      }

      // Check dependencies
      const schema = this.registry.getSchema(key)
      if (schema?.dependencies) {
        const allSettings = this.getAll()
        const depResult = this.validator.validateWithDependencies(key, value, allSettings)
        if (!depResult.isValid) {
          return false
        }
      }

      // Set the value
      this.settings.set(key, result.value!)
      
      // Save to storage
      this.saveToStorage()

      // Emit change event
      this.emit('change', {
        key,
        value: result.value,
        previousValue
      } as SettingChangeEvent)

      return true
    } catch (error) {
      this.emit('error', {
        error: error instanceof Error ? error : new Error('Unknown set error'),
        context: 'set',
        key
      } as SettingErrorEvent)
      return false
    }
  }

  /**
   * Get all settings
   */
  getAll(): Record<string, SettingValue> {
    return Object.fromEntries(this.settings)
  }

  /**
   * Get settings by category
   */
  getByCategory(categoryId: string): Record<string, SettingValue> {
    const schemas = this.registry.getSchemasByCategory(categoryId)
    const result: Record<string, SettingValue> = {}
    
    schemas.forEach(schema => {
      result[schema.key] = this.get(schema.key)
    })
    
    return result
  }

  /**
   * Batch set multiple settings
   */
  batchSet(updates: Record<string, SettingValue>): Record<string, boolean> {
    const results: Record<string, boolean> = {}
    const changes: SettingChangeEvent[] = []

    Object.entries(updates).forEach(([key, value]) => {
      const previousValue = this.settings.get(key)
      const success = this.set(key, value)
      results[key] = success
      
      if (success && previousValue !== value) {
        changes.push({
          key,
          value,
          previousValue
        })
      }
    })

    if (changes.length > 0) {
      this.emit('batchChange', { changes } as SettingBatchChangeEvent)
    }

    return results
  }

  /**
   * Preview a setting value (temporary, doesn't save)
   */
  preview(key: string, value: SettingValue, timeoutMs: number = 5000): void {
    // Clear existing timeout
    const existingTimeout = this.previewTimeouts.get(key)
    if (existingTimeout) {
      clearTimeout(existingTimeout)
    }

    // Set preview value
    this.previews.set(key, value)

    // Set timeout to clear preview
    const timeout = setTimeout(() => {
      this.clearPreview(key)
    }, timeoutMs)
    this.previewTimeouts.set(key, timeout)

    // Emit preview event
    this.emit('preview', { key, value } as SettingPreviewEvent)
  }

  /**
   * Get preview value
   */
  getPreview(key: string): SettingValue | undefined {
    return this.previews.get(key)
  }

  /**
   * Commit a preview (make it permanent)
   */
  commitPreview(key: string): boolean {
    const previewValue = this.previews.get(key)
    if (previewValue !== undefined) {
      this.clearPreview(key)
      return this.set(key, previewValue)
    }
    return false
  }

  /**
   * Clear a preview
   */
  clearPreview(key: string): void {
    this.previews.delete(key)
    
    const timeout = this.previewTimeouts.get(key)
    if (timeout) {
      clearTimeout(timeout)
      this.previewTimeouts.delete(key)
    }
  }

  /**
   * Clear all previews
   */
  clearAllPreviews(): void {
    this.previews.clear()
    this.previewTimeouts.forEach(timeout => clearTimeout(timeout))
    this.previewTimeouts.clear()
  }

  /**
   * Reset a setting to its default value
   */
  reset(key: string): void {
    const schema = this.registry.getSchema(key)
    if (schema) {
      this.set(key, schema.defaultValue)
      this.emit('reset', {
        key,
        defaultValue: schema.defaultValue
      } as SettingResetEvent)
    }
  }

  /**
   * Reset all settings in a category
   */
  resetCategory(categoryId: string): void {
    const schemas = this.registry.getSchemasByCategory(categoryId)
    schemas.forEach(schema => {
      this.reset(schema.key)
    })
  }

  /**
   * Reset all settings
   */
  resetAll(): void {
    const schemas = this.registry.getAllSchemas()
    schemas.forEach(schema => {
      this.reset(schema.key)
    })
  }

  /**
   * Export settings
   */
  export(categories?: string[]): SettingsExportData {
    let settingsToExport: Record<string, SettingValue>

    if (categories && categories.length > 0) {
      // Export specific categories
      settingsToExport = {}
      categories.forEach(categoryId => {
        const categorySettings = this.getByCategory(categoryId)
        Object.assign(settingsToExport, categorySettings)
      })
    } else {
      // Export all settings
      settingsToExport = this.getAll()
    }

    return {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      settings: settingsToExport
    }
  }

  /**
   * Create a backup of current settings
   */
  async createBackup(description?: string): Promise<string> {
    const { SettingsBackupManager } = await import('./backup')
    return SettingsBackupManager.createBackup(this.getAll(), { description })
  }

  /**
   * Get all available backups
   */
  async getBackups() {
    const { SettingsBackupManager } = await import('./backup')
    return SettingsBackupManager.getBackups()
  }

  /**
   * Restore from backup
   */
  async restoreBackup(backupId: string): Promise<boolean> {
    try {
      const { SettingsBackupManager } = await import('./backup')
      const settings = await SettingsBackupManager.restoreBackup(backupId)
      
      if (settings) {
        const result = await this.import({ 
          version: '1.0.0',
          timestamp: new Date().toISOString(),
          settings 
        })
        return result.success
      }
      
      return false
    } catch (error) {
      console.error('Failed to restore backup:', error)
      return false
    }
  }

  /**
   * Start automatic backup service
   */
  async startAutoBackup(config?: {
    intervalHours?: number
    maxBackups?: number
  }): Promise<void> {
    const { AutoBackupService } = await import('./autoBackup')
    
    const autoBackup = AutoBackupService.getInstance({
      enabled: true,
      intervalHours: config?.intervalHours || 24,
      maxBackups: config?.maxBackups || 7,
      onSuccess: (backupId) => {
        this.emit('autoBackupSuccess', { backupId })
      },
      onError: (error) => {
        this.emit('autoBackupError', { error })
      }
    })

    autoBackup.start(this.getAll())
  }

  /**
   * Stop automatic backup service
   */
  async stopAutoBackup(): Promise<void> {
    const { AutoBackupService } = await import('./autoBackup')
    const autoBackup = AutoBackupService.getInstance()
    autoBackup?.stop()
  }

  /**
   * Import settings
   */
  async import(data: SettingsExportData): Promise<SettingsImportResult> {
    try {
      // Validate the import data
      const validationResult = this.validator.validateAll(data.settings)
      if (!validationResult.isValid) {
        return {
          success: false,
          imported: 0,
          errors: validationResult.errors
        }
      }

      // Import the settings
      const results = this.batchSet(data.settings)
      const imported = Object.values(results).filter(success => success).length

      this.emit('import', {
        settings: data.settings,
        timestamp: data.timestamp
      } as SettingImportEvent)

      return {
        success: true,
        imported,
        errors: {}
      }
    } catch (error) {
      return {
        success: false,
        imported: 0,
        errors: {
          general: error instanceof Error ? error.message : 'Import failed'
        }
      }
    }
  }

  /**
   * Get the validator instance
   */
  getValidator(): SettingsValidator {
    return this.validator
  }

  /**
   * Get the registry instance
   */
  getRegistry(): SettingsRegistry {
    return this.registry
  }

  /**
   * Apply default values for missing settings
   */
  private applyDefaults(): void {
    const schemas = this.registry.getAllSchemas()
    schemas.forEach(schema => {
      if (!this.settings.has(schema.key)) {
        this.settings.set(schema.key, schema.defaultValue)
      }
    })
  }

  /**
   * Save current settings to storage
   */
  private async saveToStorage(): Promise<void> {
    try {
      const settingsObject = this.getAll()
      await this.storage.set(settingsObject)
    } catch (error) {
      console.error('Failed to save settings to storage:', error)
    }
  }
}