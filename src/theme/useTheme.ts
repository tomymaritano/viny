import { useAppStore } from '../stores/newSimpleStore'
import { THEME_CONFIG, ThemeType, DIRECT_COLORS } from './themeConstants'

/**
 * Enhanced theme hook that provides theme utilities
 * Can be used independently or with ThemeProvider
 */
export const useTheme = () => {
  const { theme, setTheme, getTagColor, setTagColor } = useAppStore()

  // Resolve system theme
  const resolveTheme = (themeName: string): string => {
    if (themeName === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return themeName
  }

  const currentTheme = theme || THEME_CONFIG.DEFAULT
  const resolvedTheme = resolveTheme(currentTheme)
  
  // Theme state helpers
  const isDark = resolvedTheme === 'dark' || resolvedTheme === 'solarized'
  const isLight = resolvedTheme === 'light'
  const isSolarized = resolvedTheme === 'solarized'

  // Get theme-appropriate values
  const getThemeValue = <T>(darkValue: T, lightValue: T): T => {
    return isDark ? darkValue : lightValue
  }

  // Get direct color values (for when CSS vars can't be used)
  const getDirectColor = (colorKey: keyof typeof DIRECT_COLORS.DARK): string => {
    const colorSet = isDark ? DIRECT_COLORS.DARK : DIRECT_COLORS.LIGHT
    return colorSet[colorKey]
  }

  // Advanced theme utilities
  const applyTheme = (themeName: ThemeType) => {
    const resolved = resolveTheme(themeName)
    
    // Apply to DOM
    document.documentElement.setAttribute('data-theme', resolved)
    document.body.setAttribute('data-theme', resolved)
    
    // Update store
    setTheme(themeName)
    
    // Persist to localStorage
    localStorage.setItem('theme', themeName)
    
    // Update meta theme-color for mobile
    updateMetaThemeColor(resolved)
  }

  // System theme change listener
  const watchSystemTheme = (callback: (isDark: boolean) => void) => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleChange = (e: MediaQueryListEvent) => {
      if (theme === 'system') {
        callback(e.matches)
        // Re-apply theme if currently using system
        applyTheme('system')
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    
    // Return cleanup function
    return () => mediaQuery.removeEventListener('change', handleChange)
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
    resolveTheme,

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

/**
 * Update meta theme-color for mobile browsers
 */
const updateMetaThemeColor = (theme: string) => {
  const metaThemeColor = document.querySelector('meta[name="theme-color"]')
  if (metaThemeColor) {
    const colorMap = {
      dark: '#1a1a1a',
      light: '#ffffff', 
      solarized: '#00141a'
    }
    const color = colorMap[theme as keyof typeof colorMap] || colorMap.dark
    metaThemeColor.setAttribute('content', color)
  }
}

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

  const getTextColor = (variant: 'primary' | 'secondary' | 'muted' = 'primary') => {
    const variants = {
      primary: { dark: '#cccccc', light: '#333333' },
      secondary: { dark: '#888888', light: '#666666' },
      muted: { dark: '#555555', light: '#999999' }
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
    getDirectColor
  }
}