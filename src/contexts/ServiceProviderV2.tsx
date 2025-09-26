/**
 * Service Provider V2 - Clean Architecture Implementation
 * Uses pure CRUD repositories with business logic in services
 */

import React, { createContext, useContext, useMemo } from 'react'
import { DexieCrudRepository } from '../repositories/dexie/DexieCrudRepository'
import { NoteServiceV2 } from '../services/notes/NoteServiceV2'
import { NotebookServiceV2 } from '../services/notebooks/NotebookServiceV2'
import { SettingsServiceV2 } from '../services/settings/SettingsServiceV2'
import type { INoteService } from '../services/notes/INoteService'
import type { INotebookService } from '../services/notebooks/INotebookService'
import type { ISettingsService } from '../services/settings/ISettingsService'
import type { IRepository } from '../repositories/interfaces/IBaseRepository'
import { logger } from '../utils/logger'
import RepositoryErrorBoundary from '../components/errors/RepositoryErrorBoundary'
import ServiceErrorBoundary from '../components/errors/ServiceErrorBoundary'

interface ServiceContextValue {
  repository: IRepository
  noteService: INoteService
  notebookService: INotebookService
  settingsService: ISettingsService
}

const ServiceContext = createContext<ServiceContextValue | null>(null)

export const useServices = () => {
  const context = useContext(ServiceContext)
  if (!context) {
    throw new Error('useServices must be used within ServiceProvider')
  }
  return context
}

export const useRepository = () => {
  const { repository } = useServices()
  return repository
}

export const useNoteService = () => {
  const { noteService } = useServices()
  return noteService
}

export const useNotebookService = () => {
  const { notebookService } = useServices()
  return notebookService
}

export const useSettingsService = () => {
  const { settingsService } = useServices()
  return settingsService
}

interface ServiceProviderProps {
  children: React.ReactNode
}

export const ServiceProviderV2: React.FC<ServiceProviderProps> = ({ children }) => {
  const services = useMemo(() => {
    // Create pure CRUD repository
    const repository = new DexieCrudRepository()
    
    // Initialize repository
    repository.initialize().catch(error => {
      logger.error('Failed to initialize repository:', error)
    })

    // Create services with repository injection
    const noteService = new NoteServiceV2(repository)
    const notebookService = new NotebookServiceV2(repository)
    const settingsService = new SettingsServiceV2(repository)

    logger.info('ServiceProviderV2 initialized with clean architecture')

    return {
      repository,
      noteService,
      notebookService,
      settingsService,
    }
  }, [])

  return (
    <RepositoryErrorBoundary>
      <ServiceErrorBoundary>
        <ServiceContext.Provider value={services}>
          {children}
        </ServiceContext.Provider>
      </ServiceErrorBoundary>
    </RepositoryErrorBoundary>
  )
}