import { useEffect } from 'react'
import { useAppStore } from '../../stores/newSimpleStore'
import { initLogger as logger } from '../../utils/logger'

/**
 * Hook responsible for theme initialization and management
 * - Applies theme settings on mount
 * - Handles system theme preference
 * - Updates DOM theme attribute
 */
export const useThemeInit = () => {
  const { 
    theme: currentTheme, 
    setTheme,
    settings
  } = useAppStore()

  useEffect(() => {
    const finalTheme = settings?.uiTheme || currentTheme || 'dark'
    const resolvedTheme = finalTheme === 'system'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      : finalTheme
    
    // Apply theme to DOM
    document.documentElement.setAttribute('data-theme', resolvedTheme)
    setTheme(resolvedTheme)
    
    logger.debug('Theme applied:', resolvedTheme)
  }, [settings?.uiTheme, currentTheme, setTheme])

  // Handle system theme changes
  useEffect(() => {
    if (settings?.uiTheme !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      const newTheme = e.matches ? 'dark' : 'light'
      document.documentElement.setAttribute('data-theme', newTheme)
      setTheme(newTheme)
      logger.debug('System theme changed to:', newTheme)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [settings?.uiTheme, setTheme])

  return {
    currentTheme: useAppStore(state => state.theme)
  }
}