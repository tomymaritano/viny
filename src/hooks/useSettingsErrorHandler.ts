import { useState, useCallback } from 'react'
import { useAppStore } from '../stores/newSimpleStore'

interface SettingsError {
  key: string
  message: string
  type: 'validation' | 'save' | 'load' | 'unknown'
  timestamp: number
}

export function useSettingsErrorHandler() {
  const [errors, setErrors] = useState<Record<string, SettingsError>>({})
  const [isRecovering, setIsRecovering] = useState(false)
  const { addToast } = useAppStore()

  const clearError = useCallback((key: string) => {
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[key]
      return newErrors
    })
  }, [])

  const clearAllErrors = useCallback(() => {
    setErrors({})
  }, [])

  const handleSettingsError = useCallback((
    key: string,
    error: Error | string,
    type: SettingsError['type'] = 'unknown',
    showToast = false
  ) => {
    const message = error instanceof Error ? error.message : error
    const settingsError: SettingsError = {
      key,
      message,
      type,
      timestamp: Date.now()
    }

    setErrors(prev => ({
      ...prev,
      [key]: settingsError
    }))

    if (showToast) {
      const toastMessage = getErrorToastMessage(type, key, message)
      addToast({
        id: `settings-error-${key}-${Date.now()}`,
        type: 'error',
        message: toastMessage,
        duration: 5000
      })
    }

    console.error(`Settings error for ${key}:`, error)
  }, [addToast])

  const handleRecoveryAction = useCallback(async (
    recoveryFn: () => Promise<void>,
    successMessage?: string
  ) => {
    setIsRecovering(true)
    try {
      await recoveryFn()
      clearAllErrors()
      
      if (successMessage) {
        addToast({
          id: `settings-recovery-${Date.now()}`,
          type: 'success',
          message: successMessage,
          duration: 3000
        })
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Recovery failed'
      addToast({
        id: `settings-recovery-failed-${Date.now()}`,
        type: 'error',
        message: `Recovery failed: ${message}`,
        duration: 5000
      })
    } finally {
      setIsRecovering(false)
    }
  }, [addToast, clearAllErrors])

  const validateAndHandle = useCallback(async <T>(
    key: string,
    value: T,
    validationFn: (value: T) => Promise<boolean> | boolean,
    actionFn: (value: T) => Promise<void> | void
  ): Promise<boolean> => {
    try {
      // Clear previous error for this key
      clearError(key)

      // Validate
      const isValid = await validationFn(value)
      if (!isValid) {
        handleSettingsError(key, 'Invalid value provided', 'validation')
        return false
      }

      // Execute action
      await actionFn(value)
      return true
    } catch (error) {
      handleSettingsError(key, error as Error, 'save')
      return false
    }
  }, [clearError, handleSettingsError])

  return {
    errors,
    isRecovering,
    hasErrors: Object.keys(errors).length > 0,
    clearError,
    clearAllErrors,
    handleSettingsError,
    handleRecoveryAction,
    validateAndHandle
  }
}

function getErrorToastMessage(
  type: SettingsError['type'],
  key: string,
  message: string
): string {
  switch (type) {
    case 'validation':
      return `Invalid ${formatSettingKey(key)}: ${message}`
    case 'save':
      return `Failed to save ${formatSettingKey(key)}: ${message}`
    case 'load':
      return `Failed to load ${formatSettingKey(key)}: ${message}`
    default:
      return `Settings error for ${formatSettingKey(key)}: ${message}`
  }
}

function formatSettingKey(key: string): string {
  // Convert camelCase to readable format
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim()
}