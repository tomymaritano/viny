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

import { createDocumentRepository, createSettingsRepository } from '../lib/repositories/RepositoryFactory'
import { initLogger as logger } from '../utils/logger'
import { initializeDefaultData } from '../utils/defaultDataInitializer'

/**
 * Dependencies required for app initialization
 * @interface InitializationDependencies
 * 
 * NOTE: With repository pattern, slices now handle their own initialization.
 * This service focuses on coordination and legacy compatibility.
 */
export interface InitializationDependencies {
  /** Function to trigger notes loading */
  loadNotes?: () => Promise<void>
  /** Function to trigger settings loading */
  loadSettings?: () => Promise<void>
  /** Function to update loading state */
  setLoading: (loading: boolean) => void
  /** Function to set error messages */
  setError: (error: string | null) => void
  /** Legacy compatibility - will be removed */
  setNotes?: (notes: any[]) => void
  /** Legacy compatibility - will be removed */
  loadTagColors?: () => Promise<void>
  /** Legacy compatibility - will be removed */
  updateSettings?: (settings: any, skipPersistence?: boolean) => void
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
   * Simplified for repository pattern - slices handle their own initialization
   */
  async initialize(deps: InitializationDependencies): Promise<InitializationResult> {
    if (this.isInitialized) {
      logger.debug('App already initialized, skipping')
      deps.setLoading(false)
      return { success: true }
    }

    logger.debug('Starting app initialization with repository pattern...')
    try {
      deps.setLoading(true)
      deps.setError(null)

      // Run diagnostics in development
      await this.runDiagnosticsIfNeeded()

      // Initialize default data
      logger.debug('Initializing default data if needed...')
      await initializeDefaultData()

      // Repository pattern: slices handle their own loading
      // This coordination ensures proper sequencing
      
      if (deps.loadSettings) {
        logger.debug('Triggering settings loading...')
        await deps.loadSettings()
      }
      
      if (deps.loadNotes) {
        logger.debug('Triggering notes loading...')
        await deps.loadNotes()
      }
      
      // Legacy compatibility path
      if (deps.setNotes && !deps.loadNotes) {
        await this.legacyNotesLoad(deps)
      }
      
      if (deps.loadTagColors && !deps.loadSettings) {
        await deps.loadTagColors()
      }
      
      if (deps.updateSettings && !deps.loadSettings) {
        await this.legacySettingsLoad(deps)
      }

      this.isInitialized = true
      logger.info('App initialization completed successfully')
      return { success: true }
      
    } catch (error) {
      const errorMessage = 'Failed to initialize application. Please refresh the page.'
      logger.error('Failed to initialize app:', error)
      deps.setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      deps.setLoading(false)
    }
  }

  /**
   * Legacy notes loading (will be removed when all components use repository pattern)
   */
  private async legacyNotesLoad(deps: InitializationDependencies): Promise<void> {
    if (!deps.setNotes) return
    
    logger.debug('Loading notes via legacy path...')
    try {
      const repository = createDocumentRepository()
      await repository.initialize()
      const notes = await repository.getNotes()
      deps.setNotes(notes)
      logger.debug('Loaded notes count via legacy path:', notes.length)
    } catch (error) {
      logger.error('Failed to load notes via legacy path:', error)
      deps.setNotes([])
    }
  }
  
  /**
   * Legacy settings loading (will be removed when all components use repository pattern)
   */
  private async legacySettingsLoad(deps: InitializationDependencies): Promise<void> {
    if (!deps.updateSettings) return
    
    logger.debug('Loading settings via legacy path...')
    try {
      const repository = createSettingsRepository()
      const settings = await repository.getSettings()
      
      if (Object.keys(settings).length > 0) {
        deps.updateSettings(settings, true) // Skip persistence during initialization
        logger.debug('Settings loaded via legacy path:', Object.keys(settings))
      }
    } catch (error) {
      logger.warn('Failed to load settings via legacy path:', error)
    }
  }

  /**
   * Run storage diagnostics using repository pattern
   */
  private async runDiagnosticsIfNeeded(): Promise<void> {
    if (process.env.NODE_ENV === 'development') {
      logger.debug('Running storage diagnostics with repository pattern...')
      try {
        // Test settings repository
        const settingsRepo = createSettingsRepository()
        const testSettings = await settingsRepo.getSettings()
        logger.debug('Settings repository: OK, loaded', Object.keys(testSettings).length, 'settings')
        
        // Test document repository
        const docRepo = createDocumentRepository()
        await docRepo.initialize()
        const testNotes = await docRepo.getNotes()
        logger.debug('Document repository: OK, found', testNotes.length, 'notes')
        
        logger.debug('Repository diagnostics completed successfully')
      } catch (error) {
        logger.warn('Repository diagnostics failed:', error)
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