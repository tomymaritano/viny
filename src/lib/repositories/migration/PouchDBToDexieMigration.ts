/**
 * Migration utility from PouchDB to Dexie
 *
 * This handles the one-time migration of data from PouchDB to Dexie
 * with progress tracking and rollback capabilities
 */

import { DocumentRepository } from '../DocumentRepository'
import { DexieDocumentRepository } from '../DexieDocumentRepository'
import { repositoryFactory } from '../RepositoryFactory'
import { notebookLogger as logger } from '../../../utils/logger'
import type { Note, Notebook } from '../../../types'

export interface MigrationProgress {
  status: 'idle' | 'running' | 'completed' | 'failed'
  totalNotes: number
  migratedNotes: number
  totalNotebooks: number
  migratedNotebooks: number
  error?: string
}

export class PouchDBToDexieMigration {
  private pouchRepo: DocumentRepository
  private dexieRepo: DexieDocumentRepository
  private onProgress?: (progress: MigrationProgress) => void

  constructor(onProgress?: (progress: MigrationProgress) => void) {
    this.pouchRepo = new DocumentRepository()
    this.dexieRepo = new DexieDocumentRepository()
    this.onProgress = onProgress
  }

  /**
   * Check if migration is needed
   */
  async isMigrationNeeded(): Promise<boolean> {
    try {
      // Initialize repositories
      await this.pouchRepo.initialize()
      await this.dexieRepo.initialize()

      // Check if PouchDB has data
      const pouchNotes = await this.pouchRepo.getNotes()
      const pouchNotebooks = await this.pouchRepo.getNotebooks()
      const hasPouchData = pouchNotes.length > 0 || pouchNotebooks.length > 0

      // Check if Dexie is empty
      const dexieStats = await this.dexieRepo.getStats()
      const isDexieEmpty =
        dexieStats.noteCount === 0 && dexieStats.notebookCount === 0

      return hasPouchData && isDexieEmpty
    } catch (error) {
      logger.error('Failed to check migration status', error)
      return false
    }
  }

  /**
   * Perform the migration
   */
  async migrate(): Promise<void> {
    const progress: MigrationProgress = {
      status: 'running',
      totalNotes: 0,
      migratedNotes: 0,
      totalNotebooks: 0,
      migratedNotebooks: 0,
    }

    try {
      this.updateProgress(progress)

      // Initialize repositories
      await this.pouchRepo.initialize()
      await this.dexieRepo.initialize()

      // Get all data from PouchDB
      logger.info('Starting migration from PouchDB to Dexie')
      const [notes, notebooks] = await Promise.all([
        this.pouchRepo.getNotes(),
        this.pouchRepo.getNotebooks(),
      ])

      progress.totalNotes = notes.length
      progress.totalNotebooks = notebooks.length
      this.updateProgress(progress)

      logger.info(
        `Found ${notes.length} notes and ${notebooks.length} notebooks to migrate`
      )

      // Migrate notebooks first (to maintain relationships)
      if (notebooks.length > 0) {
        logger.info('Migrating notebooks...')
        for (const notebook of notebooks) {
          await this.dexieRepo.saveNotebook(notebook)
          progress.migratedNotebooks++
          this.updateProgress(progress)
        }
      }

      // Migrate notes in batches for better performance
      if (notes.length > 0) {
        logger.info('Migrating notes...')
        const batchSize = 50
        for (let i = 0; i < notes.length; i += batchSize) {
          const batch = notes.slice(i, i + batchSize)
          await this.dexieRepo.saveNotes(batch)
          progress.migratedNotes += batch.length
          this.updateProgress(progress)
        }
      }

      // Verify migration
      const dexieStats = await this.dexieRepo.getStats()
      if (
        dexieStats.noteCount !== notes.length ||
        dexieStats.notebookCount !== notebooks.length
      ) {
        throw new Error('Migration verification failed: count mismatch')
      }

      progress.status = 'completed'
      this.updateProgress(progress)

      logger.info('Migration completed successfully')

      // Enable Dexie in factory
      repositoryFactory.setUseDexie(true)
    } catch (error) {
      logger.error('Migration failed', error)
      progress.status = 'failed'
      progress.error = error instanceof Error ? error.message : 'Unknown error'
      this.updateProgress(progress)

      // Attempt rollback
      await this.rollback()
      throw error
    }
  }

  /**
   * Rollback migration (clear Dexie database)
   */
  async rollback(): Promise<void> {
    try {
      logger.info('Rolling back migration...')
      await this.dexieRepo.destroy()
      repositoryFactory.setUseDexie(false)
      logger.info('Rollback completed')
    } catch (error) {
      logger.error('Rollback failed', error)
    }
  }

  /**
   * Get migration stats
   */
  async getStats(): Promise<{
    pouchDB: { notes: number; notebooks: number }
    dexie: { notes: number; notebooks: number }
  }> {
    await this.pouchRepo.initialize()
    await this.dexieRepo.initialize()

    const [pouchNotes, pouchNotebooks] = await Promise.all([
      this.pouchRepo.getNotes(),
      this.pouchRepo.getNotebooks(),
    ])

    const dexieStats = await this.dexieRepo.getStats()

    return {
      pouchDB: {
        notes: pouchNotes.length,
        notebooks: pouchNotebooks.length,
      },
      dexie: {
        notes: dexieStats.noteCount,
        notebooks: dexieStats.notebookCount,
      },
    }
  }

  private updateProgress(progress: MigrationProgress): void {
    if (this.onProgress) {
      this.onProgress(progress)
    }
  }
}

// Singleton instance for easy access
let migrationInstance: PouchDBToDexieMigration | null = null

export function getMigrationInstance(
  onProgress?: (progress: MigrationProgress) => void
): PouchDBToDexieMigration {
  if (!migrationInstance || onProgress) {
    migrationInstance = new PouchDBToDexieMigration(onProgress)
  }
  return migrationInstance
}
