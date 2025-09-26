/**
 * TanStack Query hooks for Settings using Service Layer V2
 * Clean architecture implementation
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSettingsService } from '../../contexts/ServiceProviderV2'
import { queryKeys } from '../../lib/queryClient'
import type { AppSettings } from '../../types/settings'
import type { UpdateSettingsDto } from '../../services/settings/ISettingsService'
import { useToast } from '../useToast'

/**
 * Hook to fetch app settings
 */
export const useSettingsQueryV2 = () => {
  const settingsService = useSettingsService()
  
  return useQuery({
    queryKey: queryKeys.settings(),
    queryFn: () => settingsService.getSettings(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false, // Settings don't change often
  })
}

/**
 * Hook to get a specific setting
 */
export const useSettingQueryV2 = <K extends keyof AppSettings>(key: K) => {
  const settingsService = useSettingsService()
  
  return useQuery({
    queryKey: [...queryKeys.settings(), key],
    queryFn: () => settingsService.getSetting(key),
    staleTime: 10 * 60 * 1000,
  })
}

/**
 * Mutation to update settings
 */
export const useUpdateSettingsMutationV2 = () => {
  const queryClient = useQueryClient()
  const settingsService = useSettingsService()
  const { showSuccess, showError } = useToast()
  
  return useMutation({
    mutationFn: (updates: UpdateSettingsDto) => settingsService.updateSettings(updates),
    onMutate: async (updates) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: queryKeys.settings() })
      
      // Snapshot previous value
      const previousSettings = queryClient.getQueryData<AppSettings>(queryKeys.settings())
      
      // Optimistically update
      if (previousSettings) {
        queryClient.setQueryData<AppSettings>(
          queryKeys.settings(),
          { ...previousSettings, ...updates }
        )
      }
      
      return { previousSettings }
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousSettings) {
        queryClient.setQueryData(queryKeys.settings(), context.previousSettings)
      }
      showError(`Failed to update settings: ${err.message}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings() })
      showSuccess('Settings updated')
    },
  })
}

/**
 * Mutation to reset settings
 */
export const useResetSettingsMutationV2 = () => {
  const queryClient = useQueryClient()
  const settingsService = useSettingsService()
  const { showSuccess, showError } = useToast()
  
  return useMutation({
    mutationFn: () => settingsService.resetSettings(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings() })
      showSuccess('Settings reset to defaults')
    },
    onError: (error) => {
      showError(`Failed to reset settings: ${error.message}`)
    }
  })
}

/**
 * Mutation to set theme
 */
export const useSetThemeMutationV2 = () => {
  const queryClient = useQueryClient()
  const settingsService = useSettingsService()
  
  return useMutation({
    mutationFn: (theme: string) => settingsService.setTheme(theme),
    onMutate: async (theme) => {
      // Apply theme immediately for instant feedback
      document.documentElement.setAttribute('data-theme', theme)
      
      // Update cache
      await queryClient.cancelQueries({ queryKey: queryKeys.settings() })
      const previousSettings = queryClient.getQueryData<AppSettings>(queryKeys.settings())
      
      if (previousSettings) {
        queryClient.setQueryData<AppSettings>(
          queryKeys.settings(),
          { ...previousSettings, theme }
        )
      }
      
      return { previousSettings }
    },
    onError: (err, theme, context) => {
      // Revert theme on error
      if (context?.previousSettings) {
        document.documentElement.setAttribute('data-theme', context.previousSettings.theme)
        queryClient.setQueryData(queryKeys.settings(), context.previousSettings)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings() })
    },
  })
}

/**
 * Hook to get available themes
 */
export const useAvailableThemesQueryV2 = () => {
  const settingsService = useSettingsService()
  
  return useQuery({
    queryKey: [...queryKeys.settings(), 'themes'],
    queryFn: () => settingsService.getAvailableThemes(),
    staleTime: Infinity, // Themes don't change
  })
}

/**
 * Hook to get tag colors
 */
export const useTagColorsQueryV2 = () => {
  const settingsService = useSettingsService()
  
  return useQuery({
    queryKey: [...queryKeys.settings(), 'tagColors'],
    queryFn: () => settingsService.getTagColors(),
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Mutation to set tag color
 */
export const useSetTagColorMutationV2 = () => {
  const queryClient = useQueryClient()
  const settingsService = useSettingsService()
  
  return useMutation({
    mutationFn: ({ tag, color }: { tag: string; color: string }) => 
      settingsService.setTagColor(tag, color),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...queryKeys.settings(), 'tagColors'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.settings() })
    },
  })
}

/**
 * Mutation to export settings
 */
export const useExportSettingsMutationV2 = () => {
  const settingsService = useSettingsService()
  const { showSuccess, showError } = useToast()
  
  return useMutation({
    mutationFn: (options?: { includeSecrets?: boolean; format?: 'json' | 'yaml' }) => 
      settingsService.exportSettings(options),
    onSuccess: (data) => {
      // Create download
      const blob = new Blob([data], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `viny-settings-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      showSuccess('Settings exported successfully')
    },
    onError: (error) => {
      showError(`Failed to export settings: ${error.message}`)
    }
  })
}

/**
 * Mutation to import settings
 */
export const useImportSettingsMutationV2 = () => {
  const queryClient = useQueryClient()
  const settingsService = useSettingsService()
  const { showSuccess, showError, showWarning } = useToast()
  
  return useMutation({
    mutationFn: (data: string) => settingsService.importSettings(data),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.settings() })
        showSuccess('Settings imported successfully')
        
        if (result.warnings) {
          result.warnings.forEach(warning => showWarning(warning))
        }
      } else {
        showError('Failed to import settings')
        if (result.warnings) {
          result.warnings.forEach(warning => showError(warning))
        }
      }
    },
    onError: (error) => {
      showError(`Failed to import settings: ${error.message}`)
    }
  })
}