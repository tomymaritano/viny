import { createDocumentRepository } from '../lib/repositories/RepositoryFactory'
import { defaultNotes } from '../data/defaultNotes'
import { logger } from './logger'
import type { Notebook } from '../types/notebook'
import { getCurrentTimestamp } from './dateUtils'
import { storageService, StorageService } from '../services/StorageService'

const defaultNotebooks: Notebook[] = [
  {
    id: 'inbox',
    name: 'inbox',
    color: 'purple',
    description: 'Quick notes and ideas to process later',
    parentId: null,
    children: [],
    level: 0,
    path: 'inbox',
    createdAt: getCurrentTimestamp(),
    updatedAt: getCurrentTimestamp(),
  },
  {
    id: 'learn',
    name: 'learn',
    color: 'blue',
    description: 'Learning resources and guides',
    parentId: null,
    children: [],
    level: 0,
    path: 'learn',
    createdAt: getCurrentTimestamp(),
    updatedAt: getCurrentTimestamp(),
  },
  {
    id: 'personal',
    name: 'personal',
    color: 'green',
    description: 'Personal notes and thoughts',
    parentId: null,
    children: [],
    level: 0,
    path: 'personal',
    createdAt: getCurrentTimestamp(),
    updatedAt: getCurrentTimestamp(),
  },
  {
    id: 'projects',
    name: 'projects',
    color: 'teal',
    description: 'Development projects and ideas',
    parentId: null,
    children: [],
    level: 0,
    path: 'projects',
    createdAt: getCurrentTimestamp(),
    updatedAt: getCurrentTimestamp(),
  },
  {
    id: 'work',
    name: 'work',
    color: 'orange',
    description: 'Work-related notes and projects',
    parentId: null,
    children: [],
    level: 0,
    path: 'work',
    createdAt: getCurrentTimestamp(),
    updatedAt: getCurrentTimestamp(),
  },
]

/**
 * Initializes default notes and notebooks for new users
 * This runs only once when the app is first launched
 */
export async function initializeDefaultData(): Promise<void> {
  try {
    // Check if we've already initialized before
    const initFlag = storageService.getItem(StorageService.KEYS.INITIALIZED)
    if (initFlag) {
      logger.debug('Default data already initialized, skipping')
      return
    }

    // Check if default notes already exist
    const repository = createDocumentRepository()
    await repository.initialize()

    const existingNotes = await repository.getNotes()
    const hasDefaultNotes =
      existingNotes &&
      existingNotes.some(note =>
        defaultNotes.some(defaultNote => defaultNote.id === note.id)
      )

    if (hasDefaultNotes) {
      logger.debug('Default notes already exist, skipping initialization')
      return
    }

    logger.info('First run detected, initializing default data...')

    // Initialize default notebooks first
    try {
      for (const notebook of defaultNotebooks) {
        await repository.saveNotebook(notebook)
      }
      logger.info('Default notebooks initialized successfully')
    } catch (error) {
      logger.error('Failed to initialize default notebooks:', error)
    }

    // Initialize default notes
    for (const note of defaultNotes) {
      try {
        await repository.saveNote(note)
      } catch (error) {
        logger.error('Failed to save default note:', note.id, error)
      }
    }

    // Set initialization flag
    storageService.setItem(StorageService.KEYS.INITIALIZED, 'true')

    logger.info('Default data initialization completed successfully')
  } catch (error) {
    logger.error('Failed to initialize default data:', error)
    // Don't throw - we don't want to break the app if default data fails
  }
}

/**
 * Resets the app to default state (useful for testing or reset functionality)
 */
export async function resetToDefaultData(): Promise<void> {
  try {
    // Clear existing data
    const repository = createDocumentRepository()
    await repository.destroy()

    // Remove initialization flag
    storageService.removeItem(StorageService.KEYS.INITIALIZED)

    // Re-initialize
    await initializeDefaultData()

    logger.info('App reset to default state')
  } catch (error) {
    logger.error('Failed to reset to default data:', error)
  }
}

/**
 * Checks if the app has been initialized with default data
 */
export function isDefaultDataInitialized(): boolean {
  return storageService.getItem(StorageService.KEYS.INITIALIZED) === 'true'
}
