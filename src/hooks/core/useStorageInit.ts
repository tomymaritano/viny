import { useEffect } from 'react'
import { useAppStore } from '../../stores/newSimpleStore'
import { initLogger as logger } from '../../utils/logger'

/**
 * Hook responsible for initializing storage via repository pattern
 * NOTE: With repository pattern, slices auto-initialize.
 * This hook is mainly for backwards compatibility.
 */
export const useStorageInit = () => {
  const { 
    loadNotes,
    loadSettings,
    setLoading, 
    setError
  } = useAppStore()

  useEffect(() => {
    const initializeStorage = async () => {
      try {
        setLoading(true)
        setError(null)
        
        logger.debug('Initializing storage via repository pattern...')
        
        // Repository pattern: slices handle their own loading
        if (loadSettings) {
          logger.debug('Loading settings via repository...')
          await loadSettings()
        }
        
        if (loadNotes) {
          logger.debug('Loading notes via repository...')
          await loadNotes()
        }
        
        logger.info('Repository-based storage initialization completed')
      } catch (error) {
        logger.error('Failed to initialize storage:', error)
        setError('Failed to load your notes. Please refresh the page.')
      } finally {
        setLoading(false)
      }
    }
    
    initializeStorage()
  }, [loadNotes, loadSettings, setLoading, setError])

  return {
    isLoading: useAppStore(state => state.isLoading),
    error: useAppStore(state => state.error)
  }
}