/**
 * Service responsible for application initialization logic
 * 
 * This service encapsulates all the business logic for app startup:
 * - Loading notes and settings from storage
 * - Running storage diagnostics in development  
 * - Initializing default data
 * - Managing the complete initialization sequence
 * 
 * Benefits of this approach:
 * - Easy to test in isolation
 * - Clear separation of concerns
 * - Reusable across different contexts
 * - No React dependencies in business logic
 * 
 * Usage:
 * ```typescript
 * const dependencies = { setNotes, setLoading, setError, loadTagColors, updateSettings }
 * const result = await appInitializationService.initialize(dependencies)
 * if (result.success) {
 *   console.log('App initialized successfully')
 * }
 * ```
 * 
 * @example
 * // In tests, you can easily mock the dependencies:
 * const mockDeps = { setNotes: vi.fn(), setLoading: vi.fn(), ... }
 * await service.initialize(mockDeps)
 * expect(mockDeps.setNotes).toHaveBeenCalledWith(expectedNotes)
 */

import { storageService } from '../lib/storage'
import { initLogger as logger } from '../utils/logger'
import { initializeDefaultData } from '../utils/defaultDataInitializer'

/**
 * Dependencies required for app initialization
 * @interface InitializationDependencies
 */
export interface InitializationDependencies {
  /** Function to update notes in the store */
  setNotes: (notes: any[]) => void
  /** Function to update loading state */
  setLoading: (loading: boolean) => void
  /** Function to set error messages */
  setError: (error: string | null) => void
  /** Function to load tag color configurations */
  loadTagColors: () => Promise<void>
  /** Function to update application settings */
  updateSettings: (settings: any, skipPersistence?: boolean) => void
}

/**
 * Result of the initialization process
 * @interface InitializationResult
 */
export interface InitializationResult {
  /** Whether initialization succeeded */
  success: boolean
  /** Error message if initialization failed */
  error?: string
}

/**
 * Service responsible for orchestrating the application initialization sequence
 * @class AppInitializationService
 */
export class AppInitializationService {
  private isInitialized = false

  /**
   * Main initialization method
   * Handles the complete app startup sequence
   */
  async initialize(deps: InitializationDependencies): Promise<InitializationResult> {
    if (this.isInitialized) {
      logger.debug('App already initialized, skipping')
      return { success: true }
    }

    try {
      deps.setLoading(true)
      deps.setError(null)

      // Run diagnostics in development
      await this.runDiagnosticsIfNeeded()

      // Initialize default data
      logger.debug('Initializing default data if needed...')
      await initializeDefaultData()

      // Load notes
      logger.debug('Loading notes from storage...')
      const storedNotes = await storageService.loadNotes()

      // Load tag colors
      logger.debug('Loading tag colors from storage...')
      await deps.loadTagColors()

      // Load settings
      await this.loadSettings(deps)

      // Set notes (always, even if empty)
      logger.debug('Loaded notes count:', storedNotes.length)
      if (storedNotes.length >= 0) {
        deps.setNotes(storedNotes)
        this.isInitialized = true
        logger.info('App initialization completed successfully')
      }

      return { success: true }
    } catch (error) {
      const errorMessage = 'Failed to load your notes. Please refresh the page.'
      logger.error('Failed to initialize app:', error)
      deps.setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      deps.setLoading(false)
    }
  }

  /**
   * Load application settings with fallback logic
   */
  private async loadSettings(deps: InitializationDependencies): Promise<void> {
    logger.debug('Loading settings from storage...')
    
    try {
      const storedSettings = await storageService.loadSettings()
      
      // FALLBACK: Try direct localStorage access if storage service fails
      if (!storedSettings || Object.keys(storedSettings).length === 0) {
        logger.debug('Storage service returned empty, trying direct localStorage...')
        try {
          const directSettings = localStorage.getItem('viny-settings')
          if (directSettings) {
            const parsedSettings = JSON.parse(directSettings)
            deps.updateSettings(parsedSettings, true)
            logger.debug('Settings loaded from direct localStorage:', Object.keys(parsedSettings))
          }
        } catch (fallbackError) {
          logger.warn('Failed to load settings from direct localStorage:', fallbackError)
        }
      } else {
        // Use the store's updateSettings method to load persisted settings
        deps.updateSettings(storedSettings, true) // Skip persistence during initialization
        logger.debug('Settings loaded from storage:', Object.keys(storedSettings))
      }
    } catch (error) {
      logger.warn('Failed to load settings from storage:', error)
    }
  }

  /**
   * Run storage diagnostics in development environment
   */
  private async runDiagnosticsIfNeeded(): Promise<void> {
    if (process.env.NODE_ENV === 'development') {
      logger.debug('Running storage diagnostics...')
      try {
        const { diagnoseSaveIssues, checkStorageAvailability } = await import('../lib/storageUtils')
        
        const storageInfo = checkStorageAvailability()
        logger.debug('Storage availability:', storageInfo)
        
        const issues = await diagnoseSaveIssues()
        if (issues.length > 0) {
          logger.warn('Storage issues detected:', issues)
          issues.forEach(issue => logger.warn('Issue:', issue))
        } else {
          logger.debug('No storage issues detected')
        }
      } catch (error) {
        logger.warn('Failed to run storage diagnostics:', error)
      }
    }
  }

  /**
   * Reset initialization state (useful for testing)
   */
  reset(): void {
    this.isInitialized = false
  }

  /**
   * Check if the service has been initialized
   */
  getInitializationState(): boolean {
    return this.isInitialized
  }
}

// Singleton instance for application use
export const appInitializationService = new AppInitializationService()