/**
 * TanStack Query hooks for Settings
 * 
 * Provides optimized data fetching and caching for settings
 * with automatic persistence and synchronization
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../../lib/queryClient'
import { createSettingsRepository } from '../../lib/repositories/RepositoryFactory'
import type { Settings } from '../../types/settings'
import { settingsLogger as logger } from '../../utils/logger'
import { useAppStore } from '../../stores/newSimpleStore'

/**
 * Hook to fetch settings with automatic caching
 */
export const useSettingsQuery = () => {
  return useQuery({
    queryKey: queryKeys.settings(),
    queryFn: async () => {
      logger.debug('Fetching settings via React Query')
      const repository = createSettingsRepository()
      await repository.initialize()
      const settings = await repository.getSettings()
      logger.debug('Settings fetched successfully')
      return settings
    },
    // Settings should be relatively stable
    staleTime: 10 * 60 * 1000, // 10 minutes
    // Always refetch on mount to ensure latest settings
    refetchOnMount: 'always',
  })
}

/**
 * Mutation for updating settings with optimistic updates
 */
export const useUpdateSettingsMutation = () => {
  const queryClient = useQueryClient()
  const { showSuccess, showError } = useAppStore()

  return useMutation({
    mutationFn: async (updates: Partial<Settings>) => {
      logger.debug('Updating settings via mutation', updates)
      const repository = createSettingsRepository()
      await repository.initialize()
      
      // Get current settings
      const currentSettings = await repository.getSettings()
      
      // Merge updates
      const updatedSettings = {
        ...currentSettings,
        ...updates,
      }
      
      // Save updated settings
      await repository.saveSettings(updatedSettings)
      
      return updatedSettings
    },
    // Optimistic update
    onMutate: async (updates) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.settings() })
      
      const previousSettings = queryClient.getQueryData<Settings>(queryKeys.settings())
      
      if (previousSettings) {
        const optimisticSettings = {
          ...previousSettings,
          ...updates,
        }
        queryClient.setQueryData(queryKeys.settings(), optimisticSettings)
      }
      
      return { previousSettings }
    },
    onError: (err, updates, context) => {
      logger.error('Failed to update settings:', err)
      if (context?.previousSettings) {
        queryClient.setQueryData(queryKeys.settings(), context.previousSettings)
      }
      showError('Failed to update settings')
    },
    onSuccess: (updatedSettings) => {
      logger.info('Settings updated successfully')
      showSuccess('Settings saved')
      
      // Apply theme if theme settings were updated
      if ('theme' in updatedSettings || 'accentColor' in updatedSettings) {
        applyThemeToDocument(updatedSettings)
      }
      
      // Invalidate to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.settings() })
    },
  })
}

/**
 * Mutation for resetting settings to defaults
 */
export const useResetSettingsMutation = () => {
  const queryClient = useQueryClient()
  const { showSuccess, showError } = useAppStore()

  return useMutation({
    mutationFn: async () => {
      logger.debug('Resetting settings to defaults')
      const repository = createSettingsRepository()
      await repository.initialize()
      
      const defaultSettings = await repository.resetToDefaults()
      return defaultSettings
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: queryKeys.settings() })
      const previousSettings = queryClient.getQueryData<Settings>(queryKeys.settings())
      return { previousSettings }
    },
    onError: (err, _, context) => {
      logger.error('Failed to reset settings:', err)
      if (context?.previousSettings) {
        queryClient.setQueryData(queryKeys.settings(), context.previousSettings)
      }
      showError('Failed to reset settings')
    },
    onSuccess: (defaultSettings) => {
      logger.info('Settings reset to defaults')
      showSuccess('Settings reset to defaults')
      
      // Apply default theme
      applyThemeToDocument(defaultSettings)
      
      // Update cache with defaults
      queryClient.setQueryData(queryKeys.settings(), defaultSettings)
      queryClient.invalidateQueries({ queryKey: queryKeys.settings() })
    },
  })
}

/**
 * Helper function to apply theme to document
 */
function applyThemeToDocument(settings: Settings) {
  const root = document.documentElement
  root.setAttribute('data-theme', settings.theme)
  
  if (settings.accentColor) {
    root.style.setProperty('--accent-color', settings.accentColor)
  }
  
  // Apply font settings
  if (settings.fontSize) {
    root.style.setProperty('--editor-font-size', `${settings.fontSize}px`)
  }
  
  if (settings.fontFamily) {
    root.style.setProperty('--editor-font-family', settings.fontFamily)
  }
}

/**
 * Hook to get a specific setting value with type safety
 */
export function useSettingValue<K extends keyof Settings>(key: K): Settings[K] | undefined {
  const { data: settings } = useSettingsQuery()
  return settings?.[key]
}

/**
 * Hook to update a specific setting
 */
export function useUpdateSetting<K extends keyof Settings>() {
  const updateMutation = useUpdateSettingsMutation()
  
  return (key: K, value: Settings[K]) => {
    return updateMutation.mutate({ [key]: value })
  }
}