/**
 * Repository Factory
 * Provides dependency injection for repositories
 * Eliminates the need for direct storage service coupling
 */

import type {
  IRepositoryFactory,
  ISettingsRepository,
  IDocumentRepository,
} from './IRepository'
import type {
  IEnhancedDocumentRepository,
  IEnhancedRepositoryFactory,
  RepositoryConfig,
} from './interfaces/IEnhancedRepository'
import { SettingsRepository } from './SettingsRepository'
import { DocumentRepository } from './DocumentRepository'
import { DexieDocumentRepository } from './DexieDocumentRepository'
import { ElectronDocumentRepository } from './ElectronDocumentRepository'
import { EnhancedDocumentRepository } from './EnhancedDocumentRepository'
import { storageService, StorageService } from '../../services/StorageService'
import { storageLogger } from '../../utils/logger'

// Feature flag for Dexie migration - check at runtime to avoid initialization issues
const getUseDexie = () => {
  try {
    return (
      storageService.getItem(StorageService.KEYS.USE_DEXIE) === 'true' ||
      import.meta.env.VITE_USE_DEXIE === 'true'
    )
  } catch {
    // If storageService is not available yet, fall back to env variable
    return import.meta.env.VITE_USE_DEXIE === 'true'
  }
}

class RepositoryFactory
  implements IRepositoryFactory, IEnhancedRepositoryFactory
{
  private settingsRepository: ISettingsRepository | null = null
  private documentRepository: IDocumentRepository | null = null
  private enhancedDocumentRepository: IEnhancedDocumentRepository | null = null

  /**
   * Get or create settings repository singleton
   */
  createSettingsRepository(): ISettingsRepository {
    if (!this.settingsRepository) {
      this.settingsRepository = new SettingsRepository()
    }
    return this.settingsRepository
  }

  /**
   * Get or create document repository singleton
   * Uses optimized repository based on environment:
   * - Electron: ElectronDocumentRepository (direct file access)
   * - Web with Dexie flag: DexieDocumentRepository (modern IndexedDB)
   * - Web default: DocumentRepository (PouchDB)
   */
  createDocumentRepository(): IDocumentRepository {
    if (!this.documentRepository) {
      // Check if we're in Electron environment
      const isElectron = !!(window as any).electronAPI?.isElectron
      
      if (isElectron) {
        storageLogger.info(
          '[RepositoryFactory] Using ElectronDocumentRepository (optimized for Electron)'
        )
        this.documentRepository = new ElectronDocumentRepository()
      } else if (getUseDexie()) {
        storageLogger.info(
          '[RepositoryFactory] Using DexieDocumentRepository (feature flag enabled)'
        )
        this.documentRepository = new DexieDocumentRepository()
      } else {
        storageLogger.info(
          '[RepositoryFactory] Using DocumentRepository (PouchDB)'
        )
        this.documentRepository = new DocumentRepository()
      }
    }
    return this.documentRepository
  }

  /**
   * Enable or disable Dexie (for testing/migration)
   */
  setUseDexie(useDexie: boolean): void {
    storageService.setItem(
      StorageService.KEYS.USE_DEXIE,
      useDexie ? 'true' : 'false'
    )
    // Reset repository to force recreation with new implementation
    this.documentRepository = null
    this.enhancedDocumentRepository = null
  }

  /**
   * Get or create enhanced document repository singleton
   */
  createEnhancedDocumentRepository(
    config?: RepositoryConfig
  ): IEnhancedDocumentRepository {
    if (!this.enhancedDocumentRepository) {
      this.enhancedDocumentRepository = new EnhancedDocumentRepository(config)
    }
    return this.enhancedDocumentRepository
  }

  /**
   * Get default repository configuration
   */
  getDefaultConfig(): RepositoryConfig {
    return {
      enableCache: true,
      cacheMaxSize: 100,
      cacheTtlMs: 300000, // 5 minutes
      enableMetrics: true,
      metricsRetentionMs: 3600000, // 1 hour
      maxStorageSize: 50 * 1024 * 1024, // 50MB
      compressionEnabled: false,
      environment: (import.meta.env.NODE_ENV as any) || 'development',
      logLevel: 'info',
    }
  }

  /**
   * Reset repositories (useful for testing)
   */
  reset(): void {
    this.settingsRepository = null
    this.documentRepository = null
    this.enhancedDocumentRepository = null
  }
}

// Export singleton factory
export const repositoryFactory = new RepositoryFactory()

// Export individual repository creators for convenience
export const createSettingsRepository = () =>
  repositoryFactory.createSettingsRepository()
export const createDocumentRepository = () =>
  repositoryFactory.createDocumentRepository()
export const createEnhancedDocumentRepository = (config?: RepositoryConfig) =>
  repositoryFactory.createEnhancedDocumentRepository(config)

// Export types for external use
export type {
  ISettingsRepository,
  IDocumentRepository,
  IEnhancedDocumentRepository,
  RepositoryConfig,
}
export { StorageError } from './IRepository'
