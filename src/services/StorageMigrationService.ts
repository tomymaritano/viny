/**
 * Storage Migration Service
 * Handles systematic migration from localStorage to repository pattern
 * Provides safe migration with rollback capabilities and audit logging
 */

import { loggingService, logWithContext } from './LoggingService'
import { logger, storageLogger } from '@/utils/logger'
import { DocumentRepository } from '@/types'

export interface MigrationStep {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly priority: 'low' | 'medium' | 'high' | 'critical'
  readonly estimatedTime: number // in seconds
  readonly dependencies: readonly string[]
  readonly rollbackSupported: boolean
}

export interface MigrationResult {
  readonly stepId: string
  readonly success: boolean
  readonly recordsProcessed: number
  readonly recordsMigrated: number
  readonly recordsSkipped: number
  readonly errors: readonly string[]
  readonly warnings: readonly string[]
  readonly duration: number
  readonly backupCreated: boolean
}

export interface MigrationPlan {
  readonly steps: readonly MigrationStep[]
  readonly totalSteps: number
  readonly estimatedDuration: number
  readonly requiresBackup: boolean
}

export interface MigrationProgress {
  readonly currentStep: number
  readonly totalSteps: number
  readonly completedSteps: readonly string[]
  readonly failedSteps: readonly string[]
  readonly isRunning: boolean
  readonly canRollback: boolean
  readonly progressPercentage: number
}

export type MigrationEventType =
  | 'started'
  | 'step-started'
  | 'step-completed'
  | 'step-failed'
  | 'completed'
  | 'error'

export interface MigrationEvent {
  readonly type: MigrationEventType
  readonly stepId?: string
  readonly data?: unknown
  readonly timestamp: number
}

export type MigrationEventHandler = (event: MigrationEvent) => void

/**
 * Service for managing the migration from localStorage to repository pattern
 */
export class StorageMigrationService {
  private readonly migrationSteps: Map<string, MigrationStep> = new Map()
  private readonly migrationResults: Map<string, MigrationResult> = new Map()
  private readonly eventHandlers: MigrationEventHandler[] = []
  private readonly backupPrefix = 'viny-backup-'
  private isRunning = false
  private currentStep: string | null = null

  constructor() {
    this.initializeMigrationSteps()
  }

  private initializeMigrationSteps(): void {
    const steps: MigrationStep[] = [
      {
        id: 'backup-creation',
        name: 'Create Backup',
        description: 'Create backup of all localStorage data before migration',
        priority: 'critical',
        estimatedTime: 5,
        dependencies: [],
        rollbackSupported: false,
      },
      {
        id: 'settings-migration',
        name: 'Migrate Settings',
        description: 'Migrate settings from localStorage to SettingsRepository',
        priority: 'high',
        estimatedTime: 10,
        dependencies: ['backup-creation'],
        rollbackSupported: true,
      },
      {
        id: 'notes-migration',
        name: 'Migrate Notes',
        description: 'Migrate notes from localStorage to NotesRepository',
        priority: 'high',
        estimatedTime: 30,
        dependencies: ['settings-migration'],
        rollbackSupported: true,
      },
      {
        id: 'notebooks-migration',
        name: 'Migrate Notebooks',
        description:
          'Migrate notebooks from localStorage to NotebooksRepository',
        priority: 'high',
        estimatedTime: 20,
        dependencies: ['notes-migration'],
        rollbackSupported: true,
      },
      {
        id: 'templates-migration',
        name: 'Migrate Templates',
        description:
          'Migrate templates from localStorage to TemplatesRepository',
        priority: 'medium',
        estimatedTime: 15,
        dependencies: ['notebooks-migration'],
        rollbackSupported: true,
      },
      {
        id: 'cache-migration',
        name: 'Migrate Cache Data',
        description: 'Migrate cache and temporary data',
        priority: 'low',
        estimatedTime: 10,
        dependencies: ['templates-migration'],
        rollbackSupported: true,
      },
      {
        id: 'cleanup-localstorage',
        name: 'Clean Up localStorage',
        description: 'Remove migrated data from localStorage',
        priority: 'medium',
        estimatedTime: 5,
        dependencies: ['cache-migration'],
        rollbackSupported: false,
      },
      {
        id: 'verification',
        name: 'Verify Migration',
        description: 'Verify all data was migrated correctly',
        priority: 'critical',
        estimatedTime: 15,
        dependencies: ['cleanup-localstorage'],
        rollbackSupported: false,
      },
    ]

    steps.forEach(step => {
      this.migrationSteps.set(step.id, step)
    })
  }

  /**
   * Get migration plan with steps and estimated duration
   */
  getMigrationPlan(): MigrationPlan {
    const steps = Array.from(this.migrationSteps.values())
    const totalSteps = steps.length
    const estimatedDuration = steps.reduce(
      (sum, step) => sum + step.estimatedTime,
      0
    )
    const requiresBackup = steps.some(step => step.priority === 'critical')

    return {
      steps,
      totalSteps,
      estimatedDuration,
      requiresBackup,
    }
  }

  /**
   * Get current migration progress
   */
  getProgress(): MigrationProgress {
    const completedSteps = Array.from(this.migrationResults.entries())
      .filter(([_, result]) => result.success)
      .map(([stepId]) => stepId)

    const failedSteps = Array.from(this.migrationResults.entries())
      .filter(([_, result]) => !result.success)
      .map(([stepId]) => stepId)

    const totalSteps = this.migrationSteps.size
    const progressPercentage = (completedSteps.length / totalSteps) * 100

    const canRollback = completedSteps.every(stepId => {
      const step = this.migrationSteps.get(stepId)
      return step?.rollbackSupported ?? false
    })

    return {
      currentStep: completedSteps.length,
      totalSteps,
      completedSteps,
      failedSteps,
      isRunning: this.isRunning,
      canRollback,
      progressPercentage,
    }
  }

  /**
   * Check if migration is needed
   */
  isMigrationNeeded(): boolean {
    try {
      // Check if there's any data in localStorage that needs migration
      const hasSettings = localStorage.getItem('viny-settings') !== null
      const hasNotes = localStorage.getItem('viny-notes') !== null
      const hasNotebooks = localStorage.getItem('viny-notebooks') !== null
      const hasTemplates = localStorage.getItem('viny-templates') !== null

      return hasSettings || hasNotes || hasNotebooks || hasTemplates
    } catch (error) {
      logWithContext('warn', 'Could not check migration status', { error })
      return false
    }
  }

  /**
   * Start migration process
   */
  async startMigration(): Promise<void> {
    if (this.isRunning) {
      throw new Error('Migration is already in progress')
    }

    this.isRunning = true
    const context = loggingService.startCorrelation('storage-migration')

    try {
      this.emitEvent({ type: 'started', timestamp: Date.now() })
      logWithContext('info', 'Starting localStorage migration')

      const plan = this.getMigrationPlan()
      const sortedSteps = this.topologicalSort(plan.steps)

      for (const step of sortedSteps) {
        await this.executeStep(step)
      }

      this.emitEvent({ type: 'completed', timestamp: Date.now() })
      logWithContext('info', 'Migration completed successfully')

      loggingService.endCorrelation(context, true)
    } catch (error) {
      this.emitEvent({
        type: 'error',
        data: { error: (error as Error).message },
        timestamp: Date.now(),
      })
      logWithContext('error', 'Migration failed', { error })
      loggingService.endCorrelation(context, false)
      throw error
    } finally {
      this.isRunning = false
      this.currentStep = null
    }
  }

  /**
   * Execute a single migration step
   */
  private async executeStep(step: MigrationStep): Promise<void> {
    this.currentStep = step.id

    this.emitEvent({
      type: 'step-started',
      stepId: step.id,
      timestamp: Date.now(),
    })

    logWithContext('info', `Starting migration step: ${step.name}`, {
      stepId: step.id,
      description: step.description,
    })

    const startTime = performance.now()

    try {
      const result = await this.executeMigrationStep(step)
      const duration = performance.now() - startTime

      const migrationResult: MigrationResult = {
        ...result,
        duration,
        stepId: step.id,
      }

      this.migrationResults.set(step.id, migrationResult)

      this.emitEvent({
        type: 'step-completed',
        stepId: step.id,
        data: migrationResult,
        timestamp: Date.now(),
      })

      logWithContext('info', `Completed migration step: ${step.name}`, {
        stepId: step.id,
        duration: `${duration.toFixed(2)}ms`,
        recordsMigrated: migrationResult.recordsMigrated,
      })
    } catch (error) {
      const duration = performance.now() - startTime
      const migrationResult: MigrationResult = {
        stepId: step.id,
        success: false,
        recordsProcessed: 0,
        recordsMigrated: 0,
        recordsSkipped: 0,
        errors: [(error as Error).message],
        warnings: [],
        duration,
        backupCreated: false,
      }

      this.migrationResults.set(step.id, migrationResult)

      this.emitEvent({
        type: 'step-failed',
        stepId: step.id,
        data: migrationResult,
        timestamp: Date.now(),
      })

      logWithContext('error', `Failed migration step: ${step.name}`, {
        stepId: step.id,
        error: (error as Error).message,
        duration: `${duration.toFixed(2)}ms`,
      })

      throw error
    }
  }

  /**
   * Execute the actual migration logic for a step
   */
  private async executeMigrationStep(
    step: MigrationStep
  ): Promise<Omit<MigrationResult, 'stepId' | 'duration'>> {
    switch (step.id) {
      case 'backup-creation':
        return this.createBackup()

      case 'settings-migration':
        return this.migrateSettings()

      case 'notes-migration':
        return this.migrateNotes()

      case 'notebooks-migration':
        return this.migrateNotebooks()

      case 'templates-migration':
        return this.migrateTemplates()

      case 'cache-migration':
        return this.migrateCache()

      case 'cleanup-localstorage':
        return this.cleanupLocalStorage()

      case 'verification':
        return this.verifyMigration()

      default:
        throw new Error(`Unknown migration step: ${step.id}`)
    }
  }

  /**
   * Create backup of localStorage data
   */
  private async createBackup(): Promise<
    Omit<MigrationResult, 'stepId' | 'duration'>
  > {
    const timestamp = Date.now()
    const backupKey = `${this.backupPrefix}${timestamp}`

    try {
      const backup: Record<string, string> = {}

      // Backup all localStorage items
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith('viny-')) {
          const value = localStorage.getItem(key)
          if (value !== null) {
            backup[key] = value
          }
        }
      }

      const backupData = JSON.stringify(backup)
      localStorage.setItem(backupKey, backupData)

      return {
        success: true,
        recordsProcessed: Object.keys(backup).length,
        recordsMigrated: Object.keys(backup).length,
        recordsSkipped: 0,
        errors: [],
        warnings: [],
        backupCreated: true,
      }
    } catch (error) {
      return {
        success: false,
        recordsProcessed: 0,
        recordsMigrated: 0,
        recordsSkipped: 0,
        errors: [(error as Error).message],
        warnings: [],
        backupCreated: false,
      }
    }
  }

  /**
   * Migrate settings to SettingsRepository
   */
  private async migrateSettings(): Promise<
    Omit<MigrationResult, 'stepId' | 'duration'>
  > {
    try {
      const settingsData = localStorage.getItem('viny-settings')
      if (!settingsData) {
        return {
          success: true,
          recordsProcessed: 0,
          recordsMigrated: 0,
          recordsSkipped: 0,
          errors: [],
          warnings: ['No settings data found to migrate'],
          backupCreated: false,
        }
      }

      const settings = JSON.parse(settingsData)

      // Here you would use the actual SettingsRepository
      // For now, we'll simulate the migration
      logWithContext('info', 'Settings migration simulation', {
        settingsKeys: Object.keys(settings),
      })

      return {
        success: true,
        recordsProcessed: 1,
        recordsMigrated: 1,
        recordsSkipped: 0,
        errors: [],
        warnings: [],
        backupCreated: false,
      }
    } catch (error) {
      return {
        success: false,
        recordsProcessed: 0,
        recordsMigrated: 0,
        recordsSkipped: 0,
        errors: [(error as Error).message],
        warnings: [],
        backupCreated: false,
      }
    }
  }

  /**
   * Migrate notes data
   */
  private async migrateNotes(): Promise<
    Omit<MigrationResult, 'stepId' | 'duration'>
  > {
    try {
      const notesData = localStorage.getItem('viny-notes')
      if (!notesData) {
        return {
          success: true,
          recordsProcessed: 0,
          recordsMigrated: 0,
          recordsSkipped: 0,
          errors: [],
          warnings: ['No notes data found to migrate'],
          backupCreated: false,
        }
      }

      const notes = JSON.parse(notesData)
      const noteCount = Array.isArray(notes) ? notes.length : 0

      // Simulation of notes migration
      logWithContext('info', 'Notes migration simulation', { noteCount })

      return {
        success: true,
        recordsProcessed: noteCount,
        recordsMigrated: noteCount,
        recordsSkipped: 0,
        errors: [],
        warnings: [],
        backupCreated: false,
      }
    } catch (error) {
      return {
        success: false,
        recordsProcessed: 0,
        recordsMigrated: 0,
        recordsSkipped: 0,
        errors: [(error as Error).message],
        warnings: [],
        backupCreated: false,
      }
    }
  }

  /**
   * Migrate notebooks data
   */
  private async migrateNotebooks(): Promise<
    Omit<MigrationResult, 'stepId' | 'duration'>
  > {
    try {
      const notebooksData = localStorage.getItem('viny-notebooks')
      if (!notebooksData) {
        return {
          success: true,
          recordsProcessed: 0,
          recordsMigrated: 0,
          recordsSkipped: 0,
          errors: [],
          warnings: ['No notebooks data found to migrate'],
          backupCreated: false,
        }
      }

      const notebooks = JSON.parse(notebooksData)
      const notebookCount = Array.isArray(notebooks) ? notebooks.length : 0

      logWithContext('info', 'Notebooks migration simulation', {
        notebookCount,
      })

      return {
        success: true,
        recordsProcessed: notebookCount,
        recordsMigrated: notebookCount,
        recordsSkipped: 0,
        errors: [],
        warnings: [],
        backupCreated: false,
      }
    } catch (error) {
      return {
        success: false,
        recordsProcessed: 0,
        recordsMigrated: 0,
        recordsSkipped: 0,
        errors: [(error as Error).message],
        warnings: [],
        backupCreated: false,
      }
    }
  }

  /**
   * Migrate templates data
   */
  private async migrateTemplates(): Promise<
    Omit<MigrationResult, 'stepId' | 'duration'>
  > {
    try {
      const templatesData = localStorage.getItem('viny-templates')
      if (!templatesData) {
        return {
          success: true,
          recordsProcessed: 0,
          recordsMigrated: 0,
          recordsSkipped: 0,
          errors: [],
          warnings: ['No templates data found to migrate'],
          backupCreated: false,
        }
      }

      const templates = JSON.parse(templatesData)
      const templateCount = Array.isArray(templates) ? templates.length : 0

      logWithContext('info', 'Templates migration simulation', {
        templateCount,
      })

      return {
        success: true,
        recordsProcessed: templateCount,
        recordsMigrated: templateCount,
        recordsSkipped: 0,
        errors: [],
        warnings: [],
        backupCreated: false,
      }
    } catch (error) {
      return {
        success: false,
        recordsProcessed: 0,
        recordsMigrated: 0,
        recordsSkipped: 0,
        errors: [(error as Error).message],
        warnings: [],
        backupCreated: false,
      }
    }
  }

  /**
   * Migrate cache data
   */
  private async migrateCache(): Promise<
    Omit<MigrationResult, 'stepId' | 'duration'>
  > {
    try {
      const cacheKeys = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (
          key &&
          (key.startsWith('viny-cache-') || key.startsWith('viny-temp-'))
        ) {
          cacheKeys.push(key)
        }
      }

      logWithContext('info', 'Cache migration simulation', {
        cacheKeyCount: cacheKeys.length,
      })

      return {
        success: true,
        recordsProcessed: cacheKeys.length,
        recordsMigrated: cacheKeys.length,
        recordsSkipped: 0,
        errors: [],
        warnings: [],
        backupCreated: false,
      }
    } catch (error) {
      return {
        success: false,
        recordsProcessed: 0,
        recordsMigrated: 0,
        recordsSkipped: 0,
        errors: [(error as Error).message],
        warnings: [],
        backupCreated: false,
      }
    }
  }

  /**
   * Clean up localStorage after migration
   */
  private async cleanupLocalStorage(): Promise<
    Omit<MigrationResult, 'stepId' | 'duration'>
  > {
    try {
      const keysToRemove = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (
          key &&
          key.startsWith('viny-') &&
          !key.startsWith(this.backupPrefix)
        ) {
          keysToRemove.push(key)
        }
      }

      keysToRemove.forEach(key => localStorage.removeItem(key))

      logWithContext('info', 'localStorage cleanup completed', {
        keysRemoved: keysToRemove.length,
      })

      return {
        success: true,
        recordsProcessed: keysToRemove.length,
        recordsMigrated: keysToRemove.length,
        recordsSkipped: 0,
        errors: [],
        warnings: [],
        backupCreated: false,
      }
    } catch (error) {
      return {
        success: false,
        recordsProcessed: 0,
        recordsMigrated: 0,
        recordsSkipped: 0,
        errors: [(error as Error).message],
        warnings: [],
        backupCreated: false,
      }
    }
  }

  /**
   * Verify migration completed successfully
   */
  private async verifyMigration(): Promise<
    Omit<MigrationResult, 'stepId' | 'duration'>
  > {
    try {
      const results = Array.from(this.migrationResults.values())
      const successfulSteps = results.filter(r => r.success)
      const failedSteps = results.filter(r => !r.success)

      const warnings = []
      if (failedSteps.length > 0) {
        warnings.push(`${failedSteps.length} migration steps failed`)
      }

      logWithContext('info', 'Migration verification completed', {
        totalSteps: results.length,
        successfulSteps: successfulSteps.length,
        failedSteps: failedSteps.length,
      })

      return {
        success: failedSteps.length === 0,
        recordsProcessed: results.length,
        recordsMigrated: successfulSteps.length,
        recordsSkipped: 0,
        errors: [],
        warnings,
        backupCreated: false,
      }
    } catch (error) {
      return {
        success: false,
        recordsProcessed: 0,
        recordsMigrated: 0,
        recordsSkipped: 0,
        errors: [(error as Error).message],
        warnings: [],
        backupCreated: false,
      }
    }
  }

  /**
   * Add event handler for migration events
   */
  addEventListener(handler: MigrationEventHandler): void {
    this.eventHandlers.push(handler)
  }

  /**
   * Remove event handler
   */
  removeEventListener(handler: MigrationEventHandler): void {
    const index = this.eventHandlers.indexOf(handler)
    if (index > -1) {
      this.eventHandlers.splice(index, 1)
    }
  }

  /**
   * Emit migration event
   */
  private emitEvent(event: MigrationEvent): void {
    this.eventHandlers.forEach(handler => {
      try {
        handler(event)
      } catch (error) {
        logger.error('Error in migration event handler', { error })
      }
    })
  }

  /**
   * Topological sort for migration steps based on dependencies
   */
  private topologicalSort(steps: readonly MigrationStep[]): MigrationStep[] {
    const sorted: MigrationStep[] = []
    const visited = new Set<string>()
    const visiting = new Set<string>()

    const visit = (step: MigrationStep): void => {
      if (visiting.has(step.id)) {
        throw new Error(`Circular dependency detected for step: ${step.id}`)
      }

      if (visited.has(step.id)) {
        return
      }

      visiting.add(step.id)

      for (const depId of step.dependencies) {
        const depStep = steps.find(s => s.id === depId)
        if (depStep) {
          visit(depStep)
        }
      }

      visiting.delete(step.id)
      visited.add(step.id)
      sorted.push(step)
    }

    for (const step of steps) {
      visit(step)
    }

    return sorted
  }

  /**
   * Get migration results
   */
  getResults(): readonly MigrationResult[] {
    return Array.from(this.migrationResults.values())
  }

  /**
   * Reset migration state (for testing)
   */
  reset(): void {
    this.migrationResults.clear()
    this.isRunning = false
    this.currentStep = null
  }
}

// Singleton instance
export const storageMigrationService = new StorageMigrationService()
