import { useState, useEffect, useCallback } from 'react'
import { logger } from '../utils/logger'
import { AppSettings, defaultAppSettings } from '../types/settings'

/**
 * Hook for managing persistent state in localStorage with TypeScript support
 * Encapsulates all localStorage interactions and provides a clean API
 */
export function usePersistentState<T>(
  key: string,
  defaultValue: T,
  options: {
    serialize?: (value: T) => string
    deserialize?: (value: string) => T
    validateSchema?: (value: unknown) => value is T
  } = {}
): [T, (value: T | ((prev: T) => T)) => void, { clear: () => void; isLoading: boolean }] {
  const {
    serialize = JSON.stringify,
    deserialize = JSON.parse,
    validateSchema
  } = options

  const [state, setState] = useState<T>(defaultValue)
  const [isLoading, setIsLoading] = useState(true)

  // Load initial value from localStorage
  useEffect(() => {
    try {
      const storedValue = localStorage.getItem(key)
      if (storedValue !== null) {
        const parsed = deserialize(storedValue)
        
        // Validate schema if provided
        if (validateSchema && !validateSchema(parsed)) {
          logger.warn(`Invalid schema for key "${key}", using default value`)
          setState(defaultValue)
        } else {
          setState(parsed)
        }
      }
    } catch (error) {
      logger.error(`Failed to load persistent state for key "${key}":`, error)
      setState(defaultValue)
    } finally {
      setIsLoading(false)
    }
  }, [key, defaultValue, deserialize, validateSchema])

  // Update localStorage when state changes
  const updateState = useCallback((value: T | ((prev: T) => T)) => {
    setState(prevState => {
      const newValue = typeof value === 'function' ? (value as (prev: T) => T)(prevState) : value
      
      try {
        localStorage.setItem(key, serialize(newValue))
        logger.debug(`Persistent state updated for key "${key}"`)
      } catch (error) {
        logger.error(`Failed to save persistent state for key "${key}":`, error)
      }
      
      return newValue
    })
  }, [key, serialize])

  // Clear function
  const clear = useCallback(() => {
    try {
      localStorage.removeItem(key)
      setState(defaultValue)
      logger.debug(`Persistent state cleared for key "${key}"`)
    } catch (error) {
      logger.error(`Failed to clear persistent state for key "${key}":`, error)
    }
  }, [key, defaultValue])

  return [state, updateState, { clear, isLoading }]
}

/**
 * Specialized hook for settings persistence with CSS variable updates
 * @deprecated Use settingsStore or settingsSlice instead for unified settings management
 */
export function usePersistentSettings() {
  const [settings, setSettings, { clear, isLoading }] = usePersistentState(
    'viny-settings',
    defaultAppSettings,
    {
      validateSchema: (value): value is AppSettings => {
        return typeof value === 'object' && value !== null
      }
    }
  )

  // Update CSS variables when settings change
  useEffect(() => {
    if (!isLoading && settings) {
      const root = document.documentElement
      
      // Update CSS custom properties
      if (settings.fontSize) {
        root.style.setProperty('--editor-font-size', `${settings.fontSize}px`)
      }
      if (settings.fontFamily) {
        root.style.setProperty('--editor-font-family', settings.fontFamily)
      }
      if (settings.sidebarWidth) {
        root.style.setProperty('--sidebar-width', `${settings.sidebarWidth}px`)
      }
    }
  }, [settings, isLoading])

  const updateSetting = useCallback(<K extends keyof typeof settings>(
    key: K,
    value: typeof settings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }, [setSettings])

  return {
    settings,
    updateSetting,
    setSettings,
    clearSettings: clear,
    isLoading
  }
}