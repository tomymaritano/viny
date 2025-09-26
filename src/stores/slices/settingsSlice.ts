/**
 * Settings Slice v2 - Repository Pattern
 * Eliminates direct storage coupling in favor of clean repository interface
 * This replaces the old settingsSlice.ts with simplified, testable architecture
 */

import type { StateCreator } from 'zustand'
import type { AppSettings } from '../../types/settings'
import { defaultAppSettings } from '../../types/settings'
import type { ISettingsRepository } from '../../lib/repositories/RepositoryFactory'
import {
  createSettingsRepository,
  StorageError,
} from '../../lib/repositories/RepositoryFactory'
import { storageLogger as logger } from '../../utils/logger'

// Predefined tag color mappings (kept from original)
const predefinedTagColors = {
  project: 'ocean',
  work: 'steel',
  personal: 'forest',
  urgent: 'cherry',
  important: 'sunset',
  idea: 'golden',
  note: 'sage',
  todo: 'royal',
  meeting: 'turquoise',
  draft: 'lavender',
} as const

// Available color options for automatic assignment
const colorOptions = [
  'ocean',
  'forest',
  'royal',
  'sunset',
  'cherry',
  'golden',
  'lavender',
  'turquoise',
  'rose',
  'sage',
  'steel',
  'copper',
] as const

// Hash function for consistent color assignment
const hashTagToColor = (tag: string): string => {
  let hash = 0
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash)
  }
  const colorIndex = Math.abs(hash) % colorOptions.length
  return colorOptions[colorIndex]
}

export interface SettingsSlice {
  // State
  settings: AppSettings
  loading: boolean
  error: string | null
  isInitialized: boolean

  // Core settings actions (now async)
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>
  resetSettings: () => Promise<void>
  loadSettings: () => Promise<void>

  // Theme actions (consolidated from themeSlice)
  setTheme: (theme: string) => Promise<void>
  setTagColor: (tag: string, color: string) => Promise<void>
  getTagColor: (tag: string) => string
  resetTagColors: () => Promise<void>

  // Import/Export (now async)
  exportSettings: () => Promise<string>
  importSettings: (settingsJson: string) => Promise<boolean>

  // Internal methods
  _setError: (error: string | null) => void
  _setLoading: (loading: boolean) => void
}

export const createSettingsSlice: StateCreator<
  SettingsSlice,
  [],
  [],
  SettingsSlice
> = (set, get) => {
  // Initialize repository
  const repository: ISettingsRepository = createSettingsRepository()

  // Helper to handle async operations with error handling
  const withErrorHandling = async <T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T | null> => {
    try {
      set({ loading: true, error: null })
      const result = await operation()
      set({ loading: false })
      return result
    } catch (error) {
      const errorMessage =
        error instanceof StorageError
          ? `${operationName} failed: ${error.message}`
          : `${operationName} failed unexpectedly`

      logger.error(`Settings ${operationName} error:`, error)
      set({ loading: false, error: errorMessage })
      return null
    }
  }

  return {
    // Initial state
    settings: defaultAppSettings,
    loading: false,
    error: null,
    isInitialized: false,

    // Load settings from repository
    loadSettings: async () => {
      const settings = await withErrorHandling(
        () => repository.getSettings(),
        'load'
      )

      if (settings) {
        set({ settings, isInitialized: true })
        logger.debug('Settings loaded successfully')
      }
    },

    // Update settings through repository
    updateSettings: async updates => {
      const success = await withErrorHandling(async () => {
        await repository.saveSettings(updates)
        return true
      }, 'update')

      if (success) {
        // Update local state immediately (optimistic update)
        set(state => ({
          settings: { ...state.settings, ...updates },
        }))

        logger.debug('Settings updated successfully', {
          keys: Object.keys(updates),
        })
      }
    },

    // Reset settings to defaults
    resetSettings: async () => {
      const success = await withErrorHandling(async () => {
        await repository.resetSettings()
        return true
      }, 'reset')

      if (success) {
        set({ settings: { ...defaultAppSettings } })
        logger.debug('Settings reset successfully')
      }
    },

    // Theme-specific actions

    setTheme: async theme => {
      const currentTheme = get().settings.theme
      if (currentTheme === theme) return
      await get().updateSettings({ theme })
    },

    setTagColor: async (tag, color) => {
      const currentTagColors = get().settings.tagColors || {}
      const newTagColors = { ...currentTagColors, [tag]: color }

      await get().updateSettings({ tagColors: newTagColors })
    },

    getTagColor: tag => {
      const state = get()
      const tagColors = state.settings.tagColors || {}

      // Return stored color if available
      if (tagColors[tag]) {
        return tagColors[tag]
      }

      // Check predefined colors
      const lowerTag = tag.toLowerCase()
      if (predefinedTagColors[lowerTag as keyof typeof predefinedTagColors]) {
        return predefinedTagColors[lowerTag as keyof typeof predefinedTagColors]
      }

      // Generate color based on tag hash for consistency
      return hashTagToColor(tag)
    },

    resetTagColors: async () => {
      await get().updateSettings({ tagColors: {} })
    },

    // Import/Export

    exportSettings: async () => {
      const exported = await withErrorHandling(
        () => repository.export(),
        'export'
      )

      return exported || '{}'
    },

    importSettings: async settingsJson => {
      const success = await withErrorHandling(async () => {
        await repository.import(settingsJson)
        // Reload settings after import
        const newSettings = await repository.getSettings()
        set({ settings: newSettings })
        return true
      }, 'import')

      return success !== null
    },

    // Internal state management
    _setError: error => set({ error }),
    _setLoading: loading => set({ loading }),
  }
}

// Initialize settings on slice creation
// This will be called by the store when it's first created
export const initializeSettings = async (slice: SettingsSlice) => {
  await slice.loadSettings()
}
