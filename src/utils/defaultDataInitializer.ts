import { storageService } from '../lib/storage'
import { defaultNotes } from '../data/defaultNotes'
import { logger } from './logger'
import { Notebook } from '../types/notebook'

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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

/**
 * Initializes default notes and notebooks for new users
 * This runs only once when the app is first launched
 */
export async function initializeDefaultData(): Promise<void> {
  try {
    // Check if we've already initialized before
    const initFlag = localStorage.getItem('viny-initialized')
    if (initFlag) {
      logger.debug('Default data already initialized, skipping')
      return
    }
    
    // Check if default notes already exist
    const existingNotes = await storageService.loadNotes()
    const hasDefaultNotes = existingNotes && existingNotes.some(note => 
      defaultNotes.some(defaultNote => defaultNote.id === note.id)
    )
    
    if (hasDefaultNotes) {
      logger.debug('Default notes already exist, skipping initialization')
      return
    }
    
    logger.info('First run detected, initializing default data...')
    
    // Initialize default notebooks first
    try {
      await storageService.saveNotebooks(defaultNotebooks)
      logger.info('Default notebooks initialized successfully')
    } catch (error) {
      logger.error('Failed to initialize default notebooks:', error)
    }
    
    // Initialize default notes
    for (const note of defaultNotes) {
      try {
        await storageService.saveNote(note)
      } catch (error) {
        logger.error('Failed to save default note:', note.id, error)
      }
    }
    
    // Set initialization flag
    localStorage.setItem('viny-initialized', 'true')
    
    logger.info('Default data initialization completed successfully')
    
  } catch (error) {
    logger.error('Failed to initialize default data:', error)
    // Don't throw - we don't want to break the app if default data fails
  }
}

/**
 * Resets the app to default state (useful for testing or reset functionality)
 */
export function resetToDefaultData(): void {
  try {
    // Clear existing data
    storageService.clearAll()
    
    // Remove initialization flag
    localStorage.removeItem('viny-initialized')
    
    // Re-initialize
    initializeDefaultData()
    
    logger.info('App reset to default state')
  } catch (error) {
    logger.error('Failed to reset to default data:', error)
  }
}

/**
 * Checks if the app has been initialized with default data
 */
export function isDefaultDataInitialized(): boolean {
  return localStorage.getItem('viny-initialized') === 'true'
}