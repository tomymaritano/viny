/**
 * Repository Factory
 * Provides dependency injection for repositories
 * Eliminates the need for direct storage service coupling
 */

import { IRepositoryFactory, ISettingsRepository, IDocumentRepository } from './IRepository'
import { SettingsRepository } from './SettingsRepository'
import { DocumentRepository } from './DocumentRepository'

class RepositoryFactory implements IRepositoryFactory {
  private settingsRepository: ISettingsRepository | null = null
  private documentRepository: IDocumentRepository | null = null

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
   */
  createDocumentRepository(): IDocumentRepository {
    if (!this.documentRepository) {
      this.documentRepository = new DocumentRepository()
    }
    return this.documentRepository
  }

  /**
   * Reset repositories (useful for testing)
   */
  reset(): void {
    this.settingsRepository = null
    this.documentRepository = null
  }
}

// Export singleton factory
export const repositoryFactory = new RepositoryFactory()

// Export individual repository creators for convenience
export const createSettingsRepository = () => repositoryFactory.createSettingsRepository()
export const createDocumentRepository = () => repositoryFactory.createDocumentRepository()

// Export types for external use
export type { ISettingsRepository, IDocumentRepository }
export { StorageError } from './IRepository'