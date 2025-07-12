import React, { createContext, useContext, useEffect, ReactNode } from 'react'
import { useAppStore } from '../stores/newSimpleStore'
import { THEME_CONFIG, ThemeType } from './themeConstants'

interface ThemeContextValue {
  theme: string
  setTheme: (theme: ThemeType) => void
  isDark: boolean
  isLight: boolean
  getThemeValue: (darkValue: string, lightValue: string) => string
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

interface ThemeProviderProps {
  children: ReactNode
  defaultTheme?: ThemeType
}

/**
 * ThemeProvider component that manages theme state and applies theme to DOM
 * Centralizes theme management and provides theme utilities to child components
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children, 
  defaultTheme = THEME_CONFIG.DEFAULT 
}) => {
  const { theme, setTheme } = useAppStore()

  // Apply theme to document when theme changes
  useEffect(() => {
    const resolvedTheme = resolveTheme(theme || defaultTheme)
    
    // Apply data-theme attribute to document root
    document.documentElement.setAttribute('data-theme', resolvedTheme)
    
    // Also apply to body for components that need it
    document.body.setAttribute('data-theme', resolvedTheme)
    
    // Update meta theme-color for mobile browsers
    updateMetaThemeColor(resolvedTheme)
    
  }, [theme, defaultTheme])

  // Initialize theme on mount
  useEffect(() => {
    if (!theme) {
      const storedTheme = localStorage.getItem('theme') as ThemeType
      const initialTheme = storedTheme && THEME_CONFIG.AVAILABLE.includes(storedTheme) 
        ? storedTheme 
        : defaultTheme
      setTheme(initialTheme)
    }
  }, [theme, setTheme, defaultTheme])

  // Persist theme changes to localStorage
  useEffect(() => {
    if (theme) {
      localStorage.setItem('theme', theme)
    }
  }, [theme])

  const currentTheme = theme || defaultTheme
  const resolvedTheme = resolveTheme(currentTheme)
  const isDark = resolvedTheme === 'dark' || resolvedTheme === 'solarized'
  const isLight = resolvedTheme === 'light'

  const getThemeValue = (darkValue: string, lightValue: string): string => {
    return isDark ? darkValue : lightValue
  }

  const handleSetTheme = (newTheme: ThemeType) => {
    setTheme(newTheme)
  }

  const contextValue: ThemeContextValue = {
    theme: resolvedTheme,
    setTheme: handleSetTheme,
    isDark,
    isLight,
    getThemeValue
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  )
}

/**
 * Hook to use theme context
 * Provides access to current theme and theme utilities
 */
export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

/**
 * Resolves system theme preference if needed
 */
const resolveTheme = (theme: string): string => {
  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return theme
}

/**
 * Updates meta theme-color for mobile browsers
 */
const updateMetaThemeColor = (theme: string) => {
  const metaThemeColor = document.querySelector('meta[name="theme-color"]')
  if (metaThemeColor) {
    const color = getMetaThemeColor(theme)
    metaThemeColor.setAttribute('content', color)
  }
}

/**
 * Gets appropriate theme color for meta tag
 */
const getMetaThemeColor = (theme: string): string => {
  switch (theme) {
    case 'dark':
      return '#1a1a1a'
    case 'light':
      return '#ffffff'
    case 'solarized':
      return '#00141a'
    default:
      return '#1a1a1a'
  }
}