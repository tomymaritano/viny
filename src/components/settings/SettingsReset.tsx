import React, { useState } from 'react'
import { useSettings } from '../../hooks/useSettings'
import { getSettingsService } from '../../services/settings'
import { Icons } from '../Icons'

interface SettingsResetProps {
  category?: string
  onReset?: () => void
}

export const SettingsReset: React.FC<SettingsResetProps> = ({
  category,
  onReset,
}) => {
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleResetAll = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const service = getSettingsService()

      if (category) {
        service.resetCategory(category)
        setSuccess(`${category} settings reset to defaults`)
      } else {
        service.resetAll()
        setSuccess('All settings reset to defaults')
      }

      onReset?.()
      setShowConfirm(false)

      // Clear success message after delay
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset settings')
    } finally {
      setLoading(false)
    }
  }

  const handleFactoryReset = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Create backup before factory reset
      const service = getSettingsService()
      await service.createBackup('Before factory reset')

      // Clear all data
      service.resetAll()

      // Clear localStorage (except backups)
      const backupData = localStorage.getItem('viny_settings_backups')
      storageService.clear()
      if (backupData) {
        localStorage.setItem('viny_settings_backups', backupData)
      }

      setSuccess('Factory reset completed. Backup created automatically.')
      onReset?.()
      setShowConfirm(false)

      // Reload page after delay
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Factory reset failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Messages */}
      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-800">{success}</p>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Reset Buttons */}
      <div className="space-y-3">
        <button
          onClick={() => setShowConfirm(true)}
          disabled={loading}
          className="w-full flex items-center justify-between px-4 py-3 bg-theme-bg-secondary border border-orange-300 rounded-md hover:bg-orange-50 transition-colors disabled:opacity-50"
        >
          <div className="flex items-center space-x-3">
            <Icons.RotateCcw size={16} className="text-orange-600" />
            <div className="text-left">
              <span className="text-sm font-medium text-theme-text-primary">
                {category ? `Reset ${category} Settings` : 'Reset All Settings'}
              </span>
              <p className="text-xs text-theme-text-muted">
                Restore {category ? `${category} settings` : 'all settings'} to
                default values
              </p>
            </div>
          </div>
          <Icons.ChevronRight size={14} className="text-theme-text-muted" />
        </button>

        {!category && (
          <button
            onClick={() => setShowConfirm('factory')}
            disabled={loading}
            className="w-full flex items-center justify-between px-4 py-3 bg-theme-bg-secondary border border-red-300 rounded-md hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            <div className="flex items-center space-x-3">
              <Icons.AlertTriangle size={16} className="text-red-600" />
              <div className="text-left">
                <span className="text-sm font-medium text-theme-text-primary">
                  Factory Reset
                </span>
                <p className="text-xs text-theme-text-muted">
                  Reset everything to initial state (creates backup first)
                </p>
              </div>
            </div>
            <Icons.ChevronRight size={14} className="text-theme-text-muted" />
          </button>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-theme-bg-primary border border-theme-border-primary rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Icons.AlertTriangle size={24} className="text-orange-500" />
                <h3 className="text-lg font-medium text-theme-text-primary">
                  {showConfirm === 'factory'
                    ? 'Factory Reset'
                    : 'Reset Settings'}
                </h3>
              </div>

              <p className="text-sm text-theme-text-secondary mb-6">
                {showConfirm === 'factory'
                  ? 'This will reset everything to the initial state and reload the application. A backup will be created automatically. This action cannot be undone easily.'
                  : category
                    ? `This will reset all ${category} settings to their default values. This action cannot be undone.`
                    : 'This will reset all settings to their default values. This action cannot be undone.'}
              </p>

              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  disabled={loading}
                  className="px-4 py-2 text-sm text-theme-text-secondary hover:text-theme-text-primary transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={
                    showConfirm === 'factory'
                      ? handleFactoryReset
                      : handleResetAll
                  }
                  disabled={loading}
                  className={`px-4 py-2 text-sm text-white rounded-md transition-colors disabled:opacity-50 ${
                    showConfirm === 'factory'
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-orange-600 hover:bg-orange-700'
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <Icons.Loader2 size={14} className="animate-spin" />
                      <span>Resetting...</span>
                    </div>
                  ) : showConfirm === 'factory' ? (
                    'Factory Reset'
                  ) : (
                    'Reset'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface CategoryResetProps {
  category: string
  onReset?: () => void
}

export const CategoryReset: React.FC<CategoryResetProps> = ({
  category,
  onReset,
}) => {
  return (
    <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
      <h4 className="text-sm font-medium text-orange-800 mb-2">
        Reset Settings
      </h4>
      <p className="text-xs text-orange-700 mb-4">
        Restore all {category} settings to their default values.
      </p>
      <SettingsReset category={category} onReset={onReset} />
    </div>
  )
}
