import React, { useState, useCallback, useEffect } from 'react'
import type { SettingValue } from '../../services/settings/types'
import { getSettingsService } from '../../services/settings'
import { editorLogger } from '../../utils/logger'

interface LivePreviewProps {
  settingKey: string
  value: SettingValue
  onApply: (value: SettingValue) => void
  onCancel: () => void
  previewDelay?: number
}

export const useLivePreview = ({
  settingKey,
  value,
  onApply,
  onCancel,
  previewDelay = 300,
}) => {
  const [isPreviewActive, setIsPreviewActive] = useState(false)
  const [previewValue, setPreviewValue] = useState(value)
  const [previewTimer, setPreviewTimer] = useState<NodeJS.Timeout | null>(null)

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (previewTimer) {
        clearTimeout(previewTimer)
      }
    }
  }, [previewTimer])

  const startPreview = useCallback(
    (newValue: SettingValue) => {
      // Clear existing timer
      if (previewTimer) {
        clearTimeout(previewTimer)
      }

      // Set new timer
      const timer = setTimeout(async () => {
        try {
          const settingsService = getSettingsService()
          settingsService.preview(settingKey, newValue)
          setIsPreviewActive(true)
          setPreviewValue(newValue)
        } catch (error) {
          editorLogger.error('Preview failed:', error)
        }
      }, previewDelay)

      setPreviewTimer(timer)
    },
    [settingKey, previewDelay, previewTimer]
  )

  const applyPreview = useCallback(() => {
    if (isPreviewActive) {
      onApply(previewValue)
      setIsPreviewActive(false)
    }
  }, [isPreviewActive, previewValue, onApply])

  const cancelPreview = useCallback(async () => {
    if (previewTimer) {
      clearTimeout(previewTimer)
    }

    if (isPreviewActive) {
      const settingsService = getSettingsService()
      settingsService.clearPreview(settingKey)
      setIsPreviewActive(false)
    }

    onCancel()
  }, [settingKey, isPreviewActive, previewTimer, onCancel])

  return {
    isPreviewActive,
    previewValue,
    startPreview,
    applyPreview,
    cancelPreview,
  }
}

interface LivePreviewControlsProps {
  isActive: boolean
  onApply: () => void
  onRevert: () => void
  className?: string
}

export const LivePreviewControls: React.FC<LivePreviewControlsProps> = ({
  isActive,
  onApply,
  onRevert,
  className = '',
}) => {
  if (!isActive) return null

  return (
    <div
      className={`flex items-center gap-2 p-2 bg-theme-accent-primary/10 rounded-md ${className}`}
    >
      <span className="text-sm text-theme-text-secondary">Preview active</span>
      <button
        onClick={onApply}
        className="px-3 py-1 text-xs bg-theme-accent-primary text-white rounded hover:opacity-90"
      >
        Apply
      </button>
      <button
        onClick={onRevert}
        className="px-3 py-1 text-xs bg-theme-bg-secondary text-theme-text-primary rounded hover:bg-theme-bg-tertiary"
      >
        Revert
      </button>
    </div>
  )
}
