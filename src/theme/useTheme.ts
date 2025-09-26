import { useAppStore } from '../stores/newSimpleStore'
import type { ThemeType } from './themeConstants'
import { THEME_CONFIG, DIRECT_COLORS } from './themeConstants'
import {
  resolveSystemTheme,
  applyThemeCompletely,
  createSystemThemeListener,
  type ThemeValue,
} from '../utils/themeUtils'

/**
 * Enhanced theme hook that provides theme utilities
 * Can be used independently or with ThemeProvider
 */
export const useTheme = () => {
  const { settings, setTheme, getTagColor, setTagColor } = useAppStore()

  const currentTheme = settings.theme || THEME_CONFIG.DEFAULT
  const resolvedTheme = resolveSystemTheme(currentTheme as ThemeValue)

  // Theme state helpers
  const isDark = resolvedTheme === 'dark' || resolvedTheme === 'solarized'
  const isLight = resolvedTheme === 'light'
  const isSolarized = resolvedTheme === 'solarized'

  // Get theme-appropriate values
  const getThemeValue = <T>(darkValue: T, lightValue: T): T => {
    return isDark ? darkValue : lightValue
  }

  // Get direct color values (for when CSS vars can't be used)
  const getDirectColor = (
    colorKey: keyof typeof DIRECT_COLORS.DARK
  ): string => {
    const colorSet = isDark ? DIRECT_COLORS.DARK : DIRECT_COLORS.LIGHT
    return colorSet[colorKey]
  }

  // Advanced theme utilities
  const applyTheme = (themeName: ThemeType) => {
    applyThemeCompletely(themeName as ThemeValue, {
      updateMetaColor: true,
      persistToStorage: true,
      updateStore: setTheme,
    })
  }

  // System theme change listener
  const watchSystemTheme = (callback: (isDark: boolean) => void) => {
    return createSystemThemeListener((isDark, newTheme) => {
      if (settings.theme === 'system') {
        callback(isDark)
        // Re-apply theme if currently using system
        applyTheme('system')
      }
    })
  }

  // Tag color management with theme awareness
  const getContextualTagColor = (tagName: string): string => {
    const baseColor = getTagColor(tagName)

    // You could modify colors based on theme here
    // For now, return the base color
    return baseColor
  }

  const setContextualTagColor = (tagName: string, colorKey: string) => {
    // Store the color key, not the resolved color
    setTagColor(tagName, colorKey)
  }

  return {
    // Current theme state
    theme: currentTheme,
    resolvedTheme,
    isDark,
    isLight,
    isSolarized,

    // Theme management
    setTheme: applyTheme,
    resolveTheme: resolveSystemTheme,

    // Utilities
    getThemeValue,
    getDirectColor,
    watchSystemTheme,

    // Tag colors
    getTagColor: getContextualTagColor,
    setTagColor: setContextualTagColor,

    // Constants
    availableThemes: THEME_CONFIG.AVAILABLE,
    defaultTheme: THEME_CONFIG.DEFAULT,
  }
}

// updateMetaThemeColor function removed - now using centralized utility from themeUtils

/**
 * Utility hook for theme-aware styling
 */
export const useThemeStyles = () => {
  const { isDark, isLight, getThemeValue, getDirectColor } = useTheme()

  const getBackgroundColor = (opacity = 1) => {
    const dark = `rgba(26, 26, 26, ${opacity})`
    const light = `rgba(255, 255, 255, ${opacity})`
    return getThemeValue(dark, light)
  }

  const getTextColor = (
    variant: 'primary' | 'secondary' | 'muted' = 'primary'
  ) => {
    const variants = {
      primary: { dark: '#cccccc', light: '#333333' },
      secondary: { dark: '#888888', light: '#666666' },
      muted: { dark: '#555555', light: '#999999' },
    }

    const colors = variants[variant]
    return getThemeValue(colors.dark, colors.light)
  }

  const getBorderColor = (opacity = 1) => {
    const dark = `rgba(58, 58, 58, ${opacity})`
    const light = `rgba(224, 224, 224, ${opacity})`
    return getThemeValue(dark, light)
  }

  return {
    isDark,
    isLight,
    getBackgroundColor,
    getTextColor,
    getBorderColor,
    getDirectColor,
  }
}
