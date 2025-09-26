import { useState, useEffect, useCallback } from 'react'
import { logger } from '../utils/logger'
import type { AppSettings } from '../types/settings'
import { defaultAppSettings } from '../types/settings'
import { createEnhancedDocumentRepository } from '../lib/repositories/RepositoryFactory'

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
): [
  T,
  (value: T | ((prev: T) => T)) => void,
  { clear: () => void; isLoading: boolean },
] {
  const {
    serialize = JSON.stringify,
    deserialize = JSON.parse,
    validateSchema,
  } = options

  const [state, setState] = useState<T>(defaultValue)
  const [isLoading, setIsLoading] = useState(true)

  // Load initial value from repository
  useEffect(() => {
    let isMounted = true

    const loadState = async () => {
      try {
        const repository = createEnhancedDocumentRepository()
        await repository.initialize()

        // Check if this is settings data (special handling)
        if (key === 'viny-settings') {
          const storedValue = await repository.getSettings()
          if (isMounted && storedValue && Object.keys(storedValue).length > 0) {
            if (validateSchema && !validateSchema(storedValue)) {
              logger.warn(`Invalid schema for settings, using default value`)
              setState(defaultValue)
            } else {
              setState(storedValue as T)
            }
          } else if (isMounted) {
            setState(defaultValue)
          }
        } else {
          // Handle other persistent state keys
          const [category, subKey] = key.includes(':')
            ? key.split(':', 2)
            : ['ui', key]
          const storedValue = await repository.getUIState(category, subKey)

          if (isMounted && storedValue !== null) {
            if (validateSchema && !validateSchema(storedValue)) {
              logger.warn(
                `Invalid schema for key "${key}", using default value`
              )
              setState(defaultValue)
            } else {
              setState(storedValue)
            }
          } else if (isMounted) {
            setState(defaultValue)
          }
        }
      } catch (error) {
        logger.error(`Failed to load persistent state for key "${key}":`, error)
        if (isMounted) {
          setState(defaultValue)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadState()

    return () => {
      isMounted = false
    }
  }, [key, defaultValue, deserialize, validateSchema])

  // Update repository when state changes
  const updateState = useCallback(
    (value: T | ((prev: T) => T)) => {
      setState(prevState => {
        const newValue =
          typeof value === 'function'
            ? (value as (prev: T) => T)(prevState)
            : value

        // Async update to repository (fire-and-forget)
        const updateRepository = async () => {
          try {
            const repository = createEnhancedDocumentRepository()
            await repository.initialize()

            if (key === 'viny-settings') {
              await repository.setSettings(newValue as Partial<AppSettings>)
            } else {
              const [category, subKey] = key.includes(':')
                ? key.split(':', 2)
                : ['ui', key]
              await repository.setUIState(category, subKey, newValue)
            }

            logger.debug(`Persistent state updated for key "${key}"`)
          } catch (error) {
            logger.error(
              `Failed to save persistent state for key "${key}":`,
              error
            )
          }
        }

        updateRepository()
        return newValue
      })
    },
    [key, serialize]
  )

  // Clear function
  const clear = useCallback(() => {
    const clearRepository = async () => {
      try {
        const repository = createEnhancedDocumentRepository()
        await repository.initialize()

        if (key === 'viny-settings') {
          await repository.clearSettings()
        } else {
          const [category, subKey] = key.includes(':')
            ? key.split(':', 2)
            : ['ui', key]
          await repository.removeComponentState(category)
        }

        setState(defaultValue)
        logger.debug(`Persistent state cleared for key "${key}"`)
      } catch (error) {
        logger.error(
          `Failed to clear persistent state for key "${key}":`,
          error
        )
      }
    }

    clearRepository()
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
      },
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

  const updateSetting = useCallback(
    <K extends keyof typeof settings>(key: K, value: (typeof settings)[K]) => {
      setSettings(prev => ({ ...prev, [key]: value }))
    },
    [setSettings]
  )

  return {
    settings,
    updateSetting,
    setSettings,
    clearSettings: clear,
    isLoading,
  }
}
