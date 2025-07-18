import { useEffect, useRef } from 'react'
import { useAppStore } from '../stores/newSimpleStore'
import { useServices } from '../services/ServiceProvider'
import { initLogger } from '../utils/logger'

/**
 * Hook responsible for application initialization coordination.
 * Manages the startup sequence including data loading, theme initialization, and error handling.
 * 
 * @description
 * This hook orchestrates the entire application initialization process using dependency injection
 * for better testability. It handles:
 * - Loading notes from storage
 * - Initializing theme settings
 * - Loading tag colors
 * - Running diagnostics if needed
 * - Error state management
 * 
 * @returns {Object} Initialization state
 * @returns {boolean} returns.isInitializing - Whether the app is currently initializing
 * @returns {Error|null} returns.initError - Any error that occurred during initialization
 * 
 * @example
 * ```tsx
 * function App() {
 *   const { isInitializing, initError } = useAppInit();
 *   
 *   if (isInitializing) return <LoadingScreen />;
 *   if (initError) return <ErrorScreen error={initError} />;
 *   
 *   return <MainApp />;
 * }
 * ```
 */
export const useAppInit = () => {
  const storeState = useAppStore()
  const { appInitializationService } = useServices()
  const initializationAttempted = useRef(false)
  
  
  const { 
    setNotes, 
    setLoading, 
    setError, 
    theme: currentTheme, 
    setTheme,
    loadTagColors,
    settings,
    updateSettings
  } = storeState

  // Initialize data using the injected service - only once
  useEffect(() => {
    if (initializationAttempted.current) {
      return
    }

    initializationAttempted.current = true
    
    const initializeApp = async () => {
      initLogger.debug('Starting app initialization via injected service')
      
      const dependencies = {
        loadNotes: storeState.loadNotes,
        loadSettings: storeState.loadSettings,
        setLoading,
        setError,
        // Legacy compatibility (will be removed)
        setNotes,
        loadTagColors,
        updateSettings
      }
      
      const result = await appInitializationService.initialize(dependencies)
      
      if (!result.success) {
        initLogger.error('Initialization failed:', result.error)
      } else {
        initLogger.info('Initialization completed successfully')
      }
    }
    
    initializeApp()
  }, [appInitializationService, setNotes, setLoading, setError, loadTagColors, updateSettings])

  // Theme initialization removed - now handled by useSettingsEffects
  // to prevent race conditions and multiple theme applications

  return {
    // Expose initialization status for components that need it
    isInitializing: useAppStore(state => state.isLoading),
    initError: useAppStore(state => state.error)
  }
}