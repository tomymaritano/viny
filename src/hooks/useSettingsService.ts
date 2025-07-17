import { useState, useEffect, useCallback, useMemo } from 'react'
import { SettingsService } from '../services/settings/SettingsService'
import type { 
  SettingValue, 
  SettingChangeEvent,
  SettingBatchChangeEvent,
  UseSettingsServiceOptions 
} from '../services/settings/types'

export function useSettingsService(options: UseSettingsServiceOptions = {}) {
  const { category, validateOnChange = false } = options
  const [settings, setSettings] = useState<Record<string, SettingValue>>({})
  const [loading, setLoading] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const service = SettingsService.getInstance()
  const registry = service.getRegistry()
  const validator = service.getValidator()

  // Load initial settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        await service.init()
        
        if (category) {
          setSettings(service.getByCategory(category))
        } else {
          setSettings(service.getAll())
        }
        
        if (validateOnChange) {
          const validationResult = validator.validateAll(service.getAll())
          setErrors(validationResult.errors)
        }
      } catch (error) {
        console.error('Failed to load settings:', error)
      } finally {
        setLoading(false)
      }
    }

    loadSettings()
  }, [category, validateOnChange])

  // Subscribe to changes
  useEffect(() => {
    const handleChange = (event: SettingChangeEvent) => {
      // Update local state - reload relevant settings
      if (category) {
        setSettings(service.getByCategory(category))
      } else {
        setSettings(prev => ({ ...prev, [event.key]: event.value }))
      }
      
      if (validateOnChange) {
        const validationResult = validator.validateAll(service.getAll())
        setErrors(validationResult.errors)
      }
    }

    const handleBatchChange = (event: SettingBatchChangeEvent) => {
      // Reload all relevant settings on batch change
      if (category) {
        setSettings(service.getByCategory(category))
      } else {
        setSettings(service.getAll())
      }
      
      if (validateOnChange) {
        const validationResult = validator.validateAll(service.getAll())
        setErrors(validationResult.errors)
      }
    }

    const handleError = (event: any) => {
      // Handle setting errors gracefully
      console.error('Settings service error:', event.error)
      if (event.key) {
        setErrors(prev => ({
          ...prev,
          [event.key]: event.error?.message || 'Setting update failed'
        }))
      }
    }

    service.on('change', handleChange)
    service.on('batchChange', handleBatchChange)
    service.on('error', handleError)

    return () => {
      service.off('change', handleChange)
      service.off('batchChange', handleBatchChange)
      service.off('error', handleError)
    }
  }, [category, validateOnChange])

  // Setting methods
  const setSetting = useCallback((key: string, value: SettingValue) => {
    const success = service.set(key, value)
    if (!success && validateOnChange) {
      const validationResult = validator.validateAll(service.getAll())
      setErrors(validationResult.errors)
    }
    return success
  }, [validateOnChange])

  const batchSetSettings = useCallback((updates: Record<string, SettingValue>) => {
    return service.batchSet(updates)
  }, [])

  const resetSetting = useCallback((key: string) => {
    service.reset(key)
  }, [])

  const resetCategory = useCallback(() => {
    if (category) {
      service.resetCategory(category)
    }
  }, [category])

  // Preview methods
  const previewSetting = useCallback((key: string, value: SettingValue, timeoutMs?: number) => {
    service.preview(key, value, timeoutMs)
  }, [])

  const commitPreview = useCallback((key: string) => {
    return service.commitPreview(key)
  }, [])

  const clearPreview = useCallback((key: string) => {
    service.clearPreview(key)
  }, [])

  const clearAllPreviews = useCallback(() => {
    service.clearAllPreviews()
  }, [])

  // Import/Export methods
  const exportSettings = useCallback(() => {
    return service.export(category ? [category] : undefined)
  }, [category])

  const importSettings = useCallback(async (data: any) => {
    setLoading(true)
    try {
      const result = await service.import(data)
      if (!result.success) {
        setErrors(result.errors)
      }
      return result
    } finally {
      setLoading(false)
    }
  }, [])

  // Get schemas for current context
  const schemas = useMemo(() => {
    if (category) {
      const cat = registry.getCategory(category)
      return cat?.schemas || []
    }
    return registry.getAllSchemas()
  }, [category])

  return {
    settings,
    loading,
    errors,
    setSetting,
    batchSetSettings,
    resetSetting,
    resetCategory,
    previewSetting,
    commitPreview,
    clearPreview,
    revertPreview: clearPreview, // Alias for compatibility
    clearAllPreviews,
    exportSettings,
    importSettings,
    schemas
  }
}

// Hook for a single setting
export function useSetting<T = SettingValue>(key: string, defaultValue?: T) {
  const service = SettingsService.getInstance()
  const registry = service.getRegistry()
  
  const [value, setValue] = useState<T>(() => {
    try {
      return service.get(key) as T || defaultValue as T
    } catch {
      return defaultValue as T
    }
  })
  
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleChange = (event: SettingChangeEvent) => {
      if (event.key === key) {
        setValue(event.value as T)
      }
    }

    service.on('change', handleChange)

    return () => {
      service.off('change', handleChange)
    }
  }, [key])

  const updateValue = useCallback((newValue: T) => {
    const success = service.set(key, newValue as SettingValue)
    if (!success) {
      setError('Failed to update setting')
    } else {
      setError(null)
    }
    return success
  }, [key])

  const reset = useCallback(() => {
    service.reset(key)
  }, [key])

  const schema = useMemo(() => {
    return registry.getSchema(key)
  }, [key])

  return {
    value,
    setValue: updateValue,
    reset,
    error,
    schema
  }
}