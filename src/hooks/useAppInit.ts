import { useEffect } from 'react'
import { useAppStore } from '../stores/newSimpleStore'
import { useServices } from '../services/ServiceProvider'

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
  const { appInitializationService, themeService } = useServices()
  
  console.log('useAppInit store state keys:', Object.keys(storeState))
  console.log('setLoading function:', storeState.setLoading)
  
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

  // Initialize data using the injected service
  useEffect(() => {
    console.log('useAppInit useEffect triggered')
    
    const initializeApp = async () => {
      console.log('initializeApp starting via injected service')
      
      const dependencies = {
        setNotes,
        setLoading,
        setError,
        loadTagColors,
        updateSettings
      }
      
      const result = await appInitializationService.initialize(dependencies)
      
      if (!result.success) {
        console.log('Initialization failed:', result.error)
      } else {
        console.log('Initialization completed successfully')
      }
    }
    
    initializeApp()
  }, [setNotes, setLoading, setError, loadTagColors, updateSettings, appInitializationService])

  // Apply theme settings using the injected service
  useEffect(() => {
    const themeDependencies = { setTheme }
    themeService.applyTheme(settings, currentTheme, themeDependencies)
  }, [settings?.uiTheme, currentTheme, setTheme, themeService])

  return {
    // Expose initialization status for components that need it
    isInitializing: useAppStore(state => state.isLoading),
    initError: useAppStore(state => state.error)
  }
}