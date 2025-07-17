/**
 * Service responsible for theme management and application
 * 
 * This service handles all theme-related logic:
 * - Resolving theme preferences (explicit, system, fallback)
 * - Applying themes to the DOM
 * - Detecting system color scheme preferences
 * 
 * Benefits:
 * - Centralized theme logic
 * - Easy to test theme resolution
 * - Consistent theme handling across the app
 * - No DOM dependencies in tests
 * 
 * Usage:
 * ```typescript
 * const deps = { setTheme: (theme) => console.log(theme) }
 * themeService.applyTheme(settings, currentTheme, deps)
 * 
 * // Or check resolved theme without applying:
 * const resolvedTheme = themeService.resolveTheme(settings, currentTheme)
 * ```
 * 
 * @example
 * // Testing theme resolution:
 * expect(themeService.resolveTheme({ uiTheme: 'system' }, 'dark')).toBe('dark')
 * expect(themeService.isSystemDarkMode()).toBe(true)
 */

import { initLogger as logger } from '../utils/logger'

export interface ThemeDependencies {
  setTheme: (theme: string) => void
}

export class ThemeService {
  /**
   * Apply theme to the application
   * Handles system theme detection and DOM manipulation
   */
  applyTheme(settings: any, currentTheme: string, deps: ThemeDependencies): void {
    const finalTheme = settings?.uiTheme || currentTheme || 'dark'
    const resolvedTheme = finalTheme === 'system'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      : finalTheme
    
    // Apply theme to DOM
    document.documentElement.setAttribute('data-theme', resolvedTheme)
    deps.setTheme(resolvedTheme)
    
    logger.debug('Theme applied:', resolvedTheme)
  }

  /**
   * Get the resolved theme based on settings and system preferences
   */
  resolveTheme(settings: any, currentTheme: string): string {
    const finalTheme = settings?.uiTheme || currentTheme || 'dark'
    
    if (finalTheme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    
    return finalTheme
  }

  /**
   * Check if system theme preference matches dark mode
   */
  isSystemDarkMode(): boolean {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  }
}

// Singleton instance for application use
export const themeService = new ThemeService()