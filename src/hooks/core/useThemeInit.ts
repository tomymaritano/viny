import { useEffect } from 'react'
import { useAppStore } from '../../stores/newSimpleStore'
import { initLogger as logger } from '../../utils/logger'
import { 
  resolveSystemTheme, 
  applyThemeToDOM, 
  createSystemThemeListener,
  type ThemeValue 
} from '../../utils/themeUtils'

/**
 * Hook responsible for theme initialization and management
 * - Applies theme settings on mount
 * - Handles system theme preference
 * - Updates DOM theme attribute
 */
export const useThemeInit = () => {
  const { 
    setTheme,
    settings
  } = useAppStore()

  useEffect(() => {
    const finalTheme = settings?.theme || 'dark'
    const resolvedTheme = resolveSystemTheme(finalTheme as ThemeValue)
    
    // Apply theme to DOM using centralized utility
    applyThemeToDOM(finalTheme as ThemeValue)
    
    logger.debug('Theme applied:', resolvedTheme)
  }, [settings?.theme])

  // Handle system theme changes
  useEffect(() => {
    if (settings?.theme !== 'system') return

    const cleanup = createSystemThemeListener(async (isDark, newTheme) => {
      applyThemeToDOM(newTheme as ThemeValue)
      await setTheme(newTheme)
      logger.debug('System theme changed to:', newTheme)
    })

    return cleanup
  }, [settings?.theme, setTheme])

  return {
    currentTheme: useAppStore(state => state.settings.theme)
  }
}