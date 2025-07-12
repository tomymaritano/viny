import { useEffect } from 'react'
import { useAppStore } from '../stores/newSimpleStore'
import { useSettings } from './useSettings'
import { storageService } from '../lib/storage'
import { initLogger as logger } from '../utils/logger'

/**
 * Hook responsible for application initialization
 * - Loads notes from storage
 * - Applies theme settings
 * - Handles storage diagnostics
 */
export const useAppInit = () => {
  const { settings } = useSettings() as { settings: { theme?: string } | null }
  const { 
    setNotes, 
    setLoading, 
    setError, 
    theme: currentTheme, 
    setTheme 
  } = useAppStore()

  // Initialize data with proper async loading
  useEffect(() => {
    let isInitialized = false
    
    const initializeApp = async () => {
      if (isInitialized) return // Prevent double initialization
      
      try {
        setLoading(true)
        setError(null)
        
        // Run storage diagnostics in development
        if (process.env.NODE_ENV === 'development') {
          logger.debug('Running storage diagnostics...')
          const { diagnoseSaveIssues, checkStorageAvailability } = await import('../lib/storageUtils')
          
          const storageInfo = checkStorageAvailability()
          logger.debug('Storage availability:', storageInfo)
          
          const issues = await diagnoseSaveIssues()
          if (issues.length > 0) {
            logger.warn('Storage issues detected:', issues)
            issues.forEach(issue => logger.warn('Issue:', issue))
          } else {
            logger.debug('No storage issues detected')
          }
        }
        
        logger.debug('Loading notes from storage...')
        const storedNotes = await storageService.loadNotes()
        
        logger.debug('Loaded notes count:', storedNotes.length)
        if (storedNotes.length >= 0) { // Always set notes, even if empty array
          setNotes(storedNotes)
          isInitialized = true
          logger.info('App initialization completed successfully')
        }
      } catch (error) {
        logger.error('Failed to initialize app:', error)
        setError('Failed to load your notes. Please refresh the page.')
      } finally {
        setLoading(false)
      }
    }
    
    initializeApp()
  }, [setNotes, setLoading, setError])

  // Apply theme settings
  useEffect(() => {
    const finalTheme = settings?.theme || currentTheme || 'dark'
    const resolvedTheme = finalTheme === 'system'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      : finalTheme
    
    // Apply theme to DOM
    document.documentElement.setAttribute('data-theme', resolvedTheme)
    setTheme(resolvedTheme)
    
    logger.debug('Theme applied:', resolvedTheme)
  }, [settings?.theme, currentTheme, setTheme])

  return {
    // Expose initialization status for components that need it
    isInitializing: useAppStore(state => state.isLoading),
    initError: useAppStore(state => state.error)
  }
}