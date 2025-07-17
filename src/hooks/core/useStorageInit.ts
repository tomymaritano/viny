import { useEffect } from 'react'
import { useAppStore } from '../../stores/newSimpleStore'
import { storageService } from '../../lib/storage'
import { initLogger as logger } from '../../utils/logger'

/**
 * Hook responsible for loading data from storage
 * - Loads notes from storage
 * - Loads tag colors from storage
 * - Loads settings from storage with fallback
 */
export const useStorageInit = () => {
  const { 
    setNotes, 
    setLoading, 
    setError,
    loadTagColors,
    updateSettings
  } = useAppStore()

  useEffect(() => {
    let isInitialized = false
    
    const loadFromStorage = async () => {
      if (isInitialized) return // Prevent double initialization
      
      try {
        setLoading(true)
        setError(null)
        
        // Load notes
        logger.debug('Loading notes from storage...')
        const storedNotes = await storageService.loadNotes()
        
        // Load tag colors
        logger.debug('Loading tag colors from storage...')
        await loadTagColors()
        
        // Load settings with fallback
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
                updateSettings(parsedSettings, true)
                logger.debug('Settings loaded from direct localStorage:', Object.keys(parsedSettings))
              }
            } catch (fallbackError) {
              logger.warn('Failed to load settings from direct localStorage:', fallbackError)
            }
          } else {
            // Use the store's updateSettings method to load persisted settings
            updateSettings(storedSettings, true) // Skip persistence during initialization
            logger.debug('Settings loaded from storage:', Object.keys(storedSettings))
          }
        } catch (error) {
          logger.warn('Failed to load settings from storage:', error)
        }
        
        logger.debug('Loaded notes count:', storedNotes.length)
        if (storedNotes.length >= 0) { // Always set notes, even if empty array
          setNotes(storedNotes)
          isInitialized = true
          logger.info('Storage initialization completed successfully')
        }
      } catch (error) {
        logger.error('Failed to load from storage:', error)
        setError('Failed to load your notes. Please refresh the page.')
      } finally {
        setLoading(false)
      }
    }
    
    loadFromStorage()
  }, [setNotes, setLoading, setError, loadTagColors, updateSettings])

  return {
    isLoading: useAppStore(state => state.isLoading),
    error: useAppStore(state => state.error)
  }
}