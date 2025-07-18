/**
 * Centralized theme utilities to eliminate ALL duplicated theme logic across the app
 * This is the single source of truth for theme-related DOM operations
 */

export type ThemeValue = 'light' | 'dark' | 'system' | 'solarized' | 'hacklab'

// Theme color constants for meta tag
const THEME_COLORS = {
  light: '#ffffff',
  dark: '#1a1a1a',
  solarized: '#00141a',
  hacklab: '#0a0a0a'
} as const

/**
 * Resolves system theme based on user preferences
 */
export const resolveSystemTheme = (theme: ThemeValue): 'light' | 'dark' | 'solarized' | 'hacklab' => {
  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return theme as 'light' | 'dark' | 'solarized' | 'hacklab'
}

/**
 * Gets the appropriate theme color for meta tag based on theme
 */
export const getThemeColor = (resolvedTheme: string): string => {
  return THEME_COLORS[resolvedTheme as keyof typeof THEME_COLORS] || THEME_COLORS.dark
}

/**
 * Applies theme to DOM elements
 * Consolidates theme application logic from multiple hooks
 */
export const applyThemeToDOM = (theme: ThemeValue): void => {
  const resolvedTheme = resolveSystemTheme(theme)
  
  // Apply theme attributes to DOM
  document.documentElement.setAttribute('data-theme', resolvedTheme)
  document.body.setAttribute('data-theme', resolvedTheme)
  
  // Update meta theme-color for mobile
  const metaThemeColor = document.querySelector('meta[name="theme-color"]')
  if (metaThemeColor) {
    const color = getThemeColor(resolvedTheme)
    metaThemeColor.setAttribute('content', color)
  }
}

/**
 * Applies custom CSS to DOM
 * Consolidates custom CSS logic from multiple hooks
 */
export const applyCustomCSS = (css: string, enabled: boolean): void => {
  const customCSSElement = document.getElementById('custom-css')
  
  if (enabled && css) {
    if (customCSSElement) {
      customCSSElement.textContent = css
    } else {
      const style = document.createElement('style')
      style.id = 'custom-css'
      style.textContent = css
      document.head.appendChild(style)
    }
  } else {
    if (customCSSElement) {
      customCSSElement.remove()
    }
  }
}

/**
 * Applies typography settings to DOM
 * Consolidates typography logic from settings
 */
export const applyTypographySettings = (settings: {
  editorFontSize?: number
  previewFontSize?: number
  markdownFontSize?: number
  lineHeight?: number
  previewLineHeight?: number
  fontFamily?: string
  syntaxTheme?: string
  previewTheme?: string
}): void => {
  const root = document.documentElement
  
  // Editor font settings
  const editorFontSize = settings.editorFontSize || 14
  root.style.setProperty('--font-size-editor', `${editorFontSize}px`)
  
  // Preview font settings - now properly updated
  const previewFontSize = settings.previewFontSize || settings.editorFontSize || 14
  root.style.setProperty('--font-size-preview', `${previewFontSize}px`)
  
  // Markdown-specific font size for preview content
  const markdownFontSize = settings.markdownFontSize || settings.previewFontSize || settings.editorFontSize || 14
  root.style.setProperty('--font-size-markdown', `${markdownFontSize}px`)
  
  // Line height settings
  const lineHeight = settings.lineHeight || 1.6
  root.style.setProperty('--line-height-editor', lineHeight.toString())
  
  // Preview-specific line height
  const previewLineHeight = settings.previewLineHeight || settings.lineHeight || 1.6
  root.style.setProperty('--line-height-preview', previewLineHeight.toString())
  
  // Font family settings
  const fontFamily = settings.fontFamily || 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
  root.style.setProperty('--font-family-markdown', fontFamily)
  
  // Apply syntax theme
  const syntaxTheme = settings.syntaxTheme || 'default-dark'
  document.documentElement.setAttribute('data-syntax-theme', syntaxTheme)
  
  // Apply preview theme  
  const previewTheme = settings.previewTheme || 'default-dark'
  document.documentElement.setAttribute('data-preview-theme', previewTheme)
}

/**
 * Centralized theme application with all DOM operations
 * This is the ONLY function that should directly manipulate theme-related DOM
 */
export const applyThemeCompletely = (theme: ThemeValue, options?: {
  updateMetaColor?: boolean
  persistToStorage?: boolean
  updateStore?: (theme: ThemeValue) => void
}): void => {
  const resolvedTheme = resolveSystemTheme(theme)
  
  // Apply theme to DOM
  applyThemeToDOM(theme)
  
  // Update meta theme-color if requested
  if (options?.updateMetaColor !== false) {
    updateMetaThemeColor(resolvedTheme)
  }
  
  // Persist to storage if requested
  if (options?.persistToStorage) {
    localStorage.setItem('theme', theme)
  }
  
  // Update store if callback provided
  if (options?.updateStore) {
    options.updateStore(theme)
  }
}

/**
 * Updates meta theme-color for mobile browsers
 * Consolidates meta tag logic from multiple files
 */
export const updateMetaThemeColor = (resolvedTheme: string): void => {
  const metaThemeColor = document.querySelector('meta[name="theme-color"]')
  if (metaThemeColor) {
    const color = getThemeColor(resolvedTheme)
    metaThemeColor.setAttribute('content', color)
  }
}

/**
 * Creates a system theme change listener
 * Consolidates media query logic from multiple files
 */
export const createSystemThemeListener = (
  callback: (isDark: boolean, theme: string) => void
): (() => void) => {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  
  const handleChange = (e: MediaQueryListEvent) => {
    const newTheme = e.matches ? 'dark' : 'light'
    callback(e.matches, newTheme)
  }

  mediaQuery.addEventListener('change', handleChange)
  
  // Return cleanup function
  return () => mediaQuery.removeEventListener('change', handleChange)
}

/**
 * Checks if current system preference is dark mode
 */
export const isSystemDarkMode = (): boolean => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}