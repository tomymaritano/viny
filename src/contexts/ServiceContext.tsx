/**
 * Service Context
 * Provides dependency injection for services throughout the app
 */

import React, { createContext, useContext, useMemo } from 'react'
import { createDocumentRepository } from '../lib/repositories/RepositoryFactory'
import { NoteService } from '../services/notes/NoteService'
import type { INoteService } from '../services/notes/INoteService'
import { initLogger } from '../utils/logger'

interface ServiceContextValue {
  noteService: INoteService
}

const ServiceContext = createContext<ServiceContextValue | null>(null)

export const useServices = () => {
  const context = useContext(ServiceContext)
  if (!context) {
    throw new Error('useServices must be used within ServiceProvider')
  }
  return context
}

export const useNoteService = () => {
  const { noteService } = useServices()
  return noteService
}

interface ServiceProviderProps {
  children: React.ReactNode
}

export const ServiceProvider: React.FC<ServiceProviderProps> = ({ children }) => {
  const services = useMemo(() => {
    // Create repository instance
    const repository = createDocumentRepository()
    
    // Initialize repository
    repository.initialize().catch(error => {
      initLogger.error('Failed to initialize repository:', error)
    })

    // Create services with repository injection
    const noteService = new NoteService(repository)

    return {
      noteService,
    }
  }, [])

  return (
    <ServiceContext.Provider value={services}>
      {children}
    </ServiceContext.Provider>
  )
}