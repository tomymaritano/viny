/**
 * useSettings hook with TanStack Query
 * 
 * Drop-in replacement for the existing useSettings hook
 * that uses TanStack Query for data fetching and mutations
 */

import { useCallback } from 'react'
import {
  useSettingsQuery,
  useUpdateSettingsMutation,
  useResetSettingsMutation,
  useSettingValue,
  useUpdateSetting,
} from './queries'
import type { Settings } from '../types/settings'
import { defaultAppSettings as defaultSettings } from '../types/settings'

interface UseSettingsResult {
  settings: Settings
  setSetting: (key: keyof Settings, value: any) => void
  updateSettings: (updates: Partial<Settings>) => void
  resetSettings: () => void
  loading: boolean
  error: string | null
}

export const useSettingsWithQuery = (): UseSettingsResult => {
  // Fetch settings using React Query
  const { data: settings = defaultSettings, isLoading, error } = useSettingsQuery()
  
  // Mutations
  const updateMutation = useUpdateSettingsMutation()
  const resetMutation = useResetSettingsMutation()
  const updateSingleSetting = useUpdateSetting()

  // Set single setting
  const setSetting = useCallback((key: keyof Settings, value: any) => {
    updateSingleSetting(key, value)
  }, [updateSingleSetting])

  // Update multiple settings
  const updateSettings = useCallback((updates: Partial<Settings>) => {
    updateMutation.mutate(updates)
  }, [updateMutation])

  // Reset settings
  const resetSettings = useCallback(() => {
    resetMutation.mutate()
  }, [resetMutation])

  return {
    settings,
    setSetting,
    updateSettings,
    resetSettings,
    loading: isLoading || updateMutation.isPending || resetMutation.isPending,
    error: error?.message || updateMutation.error?.message || resetMutation.error?.message || null,
  }
}