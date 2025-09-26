// Modern settings hook using repository pattern via settingsSlice
import { useCallback, useEffect } from 'react'
import { useAppStore } from '../stores/newSimpleStore'
import type { AppSettings } from '../types/settings'
import {
  applyThemeToDOM,
  applyCustomCSS,
  type ThemeValue,
} from '../utils/themeUtils'
import { featureFlags } from '../config/featureFlags'
import { useSettingsWithQuery } from './useSettingsQuery'

interface UseSettingsResult {
  settings: AppSettings
  getSetting: <K extends keyof AppSettings>(key: K) => AppSettings[K]
  setSetting: <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => Promise<void>
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>
  resetSettings: () => Promise<void>
  loading: boolean
  error: string | null
  exportSettings: () => Promise<string>
  importSettings: (data: string) => Promise<boolean>
}

const useSettingsImpl = (): UseSettingsResult => {
  const {
    settings,
    loading,
    error,
    updateSettings,
    resetSettings,
    exportSettings,
    importSettings,
  } = useAppStore()

  // Settings are automatically loaded by the settingsSlice initialization

  // Get single setting
  const getSetting = useCallback(
    <K extends keyof AppSettings>(key: K): AppSettings[K] => {
      return settings[key]
    },
    [settings]
  )

  // Set single setting
  const setSetting = useCallback(
    async <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
      await updateSettings({ [key]: value })
    },
    [updateSettings]
  )

  // Update multiple settings (using slice method)
  const updateSettingsLocal = useCallback(
    async (newSettings: Partial<AppSettings>) => {
      await updateSettings(newSettings)
    },
    [updateSettings]
  )

  // Reset all settings (using slice method)
  const resetSettingsLocal = useCallback(async () => {
    await resetSettings()
  }, [resetSettings])

  return {
    settings,
    getSetting,
    setSetting,
    updateSettings: updateSettingsLocal,
    resetSettings: resetSettingsLocal,
    loading,
    error,
    exportSettings,
    importSettings,
  }
}

// Hook for watching specific setting changes
export const useSettingWatch = <K extends keyof AppSettings>(
  key: K,
  callback?: (value: AppSettings[K]) => void
): AppSettings[K] => {
  const settings = useAppStore(state => state.settings)
  const value = settings[key]

  // Call callback when value changes
  useEffect(() => {
    if (callback) {
      callback(value)
    }
  }, [value, callback])

  return value
}

// Export wrapper that checks feature flag
export const useSettings = (): UseSettingsResult => {
  if (featureFlags.useQueryForSettings) {
    // For query version, we need to adapt the interface
    const queryResult = useSettingsWithQuery()
    
    // Add missing methods for compatibility
    const getSetting = <K extends keyof AppSettings>(key: K): AppSettings[K] => {
      return queryResult.settings[key]
    }
    
    const exportSettings = async () => {
      return JSON.stringify(queryResult.settings, null, 2)
    }
    
    const importSettings = async (data: string) => {
      try {
        const parsed = JSON.parse(data)
        queryResult.updateSettings(parsed)
        return true
      } catch {
        return false
      }
    }
    
    return {
      ...queryResult,
      getSetting,
      updateSettings: async (updates) => queryResult.updateSettings(updates),
      resetSettings: async () => queryResult.resetSettings(),
      exportSettings,
      importSettings,
    }
  }
  
  return useSettingsImpl()
}

// Hook for theme-specific logic
export const useTheme = () => {
  const { settings, setTheme: setThemeStore, updateSettings } = useAppStore()
  const { theme, customCSSEnabled, customCSS } = settings

  const setTheme = useCallback(
    async (newTheme: AppSettings['theme']) => {
      await setThemeStore(newTheme)

      // Apply theme to DOM immediately using shared utility
      applyThemeToDOM(newTheme as ThemeValue)
    },
    [setThemeStore]
  )

  const setCustomCSS = useCallback(
    async (css: string, enabled: boolean) => {
      await updateSettings({ customCSS: css, customCSSEnabled: enabled })

      // Apply CSS immediately using shared utility
      applyCustomCSS(css, enabled)
    },
    [updateSettings]
  )

  return {
    theme,
    customCSSEnabled,
    customCSS,
    setTheme,
    setCustomCSS,
  }
}
