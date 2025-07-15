import React, { useState } from 'react'
import { useAppStore } from '../../../stores/newSimpleStore'
import Icons from '../../Icons'
import { useFormValidation } from '../../../hooks/useFormValidation'
import { SettingsValidation } from '../../../utils/validation'
import ValidationMessage from '../../ui/ValidationMessage'

const PrivacySettings: React.FC = () => {
  const { settings, updateSettings } = useAppStore()
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Form validation for privacy settings
  const {
    values,
    errors,
    warnings,
    getFieldProps,
    handleFieldChange,
    validateAllFields
  } = useFormValidation({
    initialValues: {
      dataRetentionDays: settings.dataRetentionDays || 365,
      inactivityTimeoutMinutes: settings.inactivityTimeoutMinutes || 15
    },
    validationRules: {
      dataRetentionDays: (value: number) => {
        const result = SettingsValidation.privacy.dataRetentionDays(value)
        return result.error || null
      },
      inactivityTimeoutMinutes: (value: number) => {
        const result = SettingsValidation.privacy.inactivityTimeoutMinutes(value)
        return result.error || null
      }
    },
    validateOnChange: true,
    validateOnBlur: true
  })

  const handleClearAllData = () => {
    if (window.confirm('⚠️ This will permanently delete ALL your notes, settings, and data. This action cannot be undone.\n\nAre you sure you want to continue?')) {
      // Clear all data
      localStorage.clear()
      if (window.electronAPI?.isElectron) {
        window.electronAPI.clearAllData?.()
      }
      updateSettings({ showToast: { type: 'success', message: 'All data cleared successfully' } })
      
      // Reload the application
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    }
  }

  const handleExportData = () => {
    try {
      const exportData = {
        notes: [], // Get from store
        settings: settings,
        notebooks: [], // Get from store
        metadata: {
          exportedAt: new Date().toISOString(),
          version: '1.3.0',
          includeMetadata: settings.exportIncludeMetadata,
          includeHistory: settings.exportIncludeHistory
        }
      }

      // Filter sensitive data if privacy mode is enabled
      if (settings.anonymousMode) {
        delete exportData.metadata
        exportData.settings = { ...exportData.settings }
        delete exportData.settings.syncUrl
      }

      const dataStr = JSON.stringify(exportData, null, 2)
      const blob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `viny-data-export-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)

      updateSettings({ showToast: { type: 'success', message: 'Data exported successfully' } })
    } catch (error) {
      updateSettings({ showToast: { type: 'error', message: 'Failed to export data' } })
    }
  }

  return (
    <div className="space-y-8">
      {/* Data Collection */}
      <div>
        <h3 className="text-lg font-medium text-theme-text-primary mb-4">
          Data Collection & Analytics
        </h3>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-theme-text-primary">
                Anonymous Usage Analytics
              </h4>
              <p className="text-xs text-theme-text-muted mt-1">
                Help improve Viny by sharing anonymous usage statistics
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.analyticsEnabled || false}
                onChange={(e) => updateSettings({ analyticsEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-theme-bg-tertiary peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-theme-accent-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-theme-accent-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-theme-text-primary">
                Crash Reporting
              </h4>
              <p className="text-xs text-theme-text-muted mt-1">
                Automatically report crashes to help fix issues faster
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.crashReporting || false}
                onChange={(e) => updateSettings({ crashReporting: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-theme-bg-tertiary peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-theme-accent-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-theme-accent-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-theme-text-primary">
                Product Improvement Data
              </h4>
              <p className="text-xs text-theme-text-muted mt-1">
                Share feature usage data to help prioritize improvements
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.improveDataSharing || false}
                onChange={(e) => updateSettings({ improveDataSharing: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-theme-bg-tertiary peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-theme-accent-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-theme-accent-primary"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Data Storage */}
      <div>
        <h3 className="text-lg font-medium text-theme-text-primary mb-4">
          Data Storage & Protection
        </h3>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-theme-text-primary">
                Local Data Only Mode
              </h4>
              <p className="text-xs text-theme-text-muted mt-1">
                Keep all data on your device, disable cloud features
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.localDataOnly || false}
                onChange={(e) => updateSettings({ localDataOnly: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-theme-bg-tertiary peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-theme-accent-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-theme-accent-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-theme-text-primary">
                Encrypt Local Storage
              </h4>
              <p className="text-xs text-theme-text-muted mt-1">
                Encrypt notes and data stored on your device
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.encryptLocalStorage || false}
                onChange={(e) => updateSettings({ encryptLocalStorage: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-theme-bg-tertiary peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-theme-accent-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-theme-accent-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-theme-text-primary">
                Secure Note Deletion
              </h4>
              <p className="text-xs text-theme-text-muted mt-1">
                Permanently overwrite deleted notes to prevent recovery
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.secureNoteDeletion || false}
                onChange={(e) => updateSettings({ secureNoteDeletion: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-theme-bg-tertiary peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-theme-accent-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-theme-accent-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-theme-text-primary">
                Clear Data on Exit
              </h4>
              <p className="text-xs text-theme-text-muted mt-1">
                Automatically clear temporary data when closing the app
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.clearDataOnExit || false}
                onChange={(e) => updateSettings({ clearDataOnExit: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-theme-bg-tertiary peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-theme-accent-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-theme-accent-primary"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Data Retention */}
      <div>
        <h3 className="text-lg font-medium text-theme-text-primary mb-4">
          Data Retention
        </h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-theme-text-secondary mb-2">
              Data Retention Period (days)
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="number"
                min="1"
                max="3650"
                value={values.dataRetentionDays}
                onChange={(e) => {
                  const value = parseInt(e.target.value)
                  handleFieldChange('dataRetentionDays', value)
                  updateSettings({ dataRetentionDays: value })
                }}
                onBlur={() => getFieldProps('dataRetentionDays').onBlur()}
                className={`w-32 px-3 py-2 bg-theme-bg-secondary border rounded-md text-sm text-theme-text-primary focus:outline-none focus:ring-2 focus:ring-theme-accent-primary ${
                  errors.dataRetentionDays ? 'border-red-500' : 'border-theme-border-primary'
                }`}
              />
              <span className="text-sm text-theme-text-muted">days</span>
            </div>
            {errors.dataRetentionDays && (
              <ValidationMessage type="error" message={errors.dataRetentionDays} />
            )}
            <p className="mt-1 text-xs text-theme-text-muted">
              Automatically delete old notes after this period (0 = never delete)
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-theme-text-primary">
                Auto-Delete Old Data
              </h4>
              <p className="text-xs text-theme-text-muted mt-1">
                Automatically delete notes older than retention period
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoDeleteOldData || false}
                onChange={(e) => updateSettings({ autoDeleteOldData: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-theme-bg-tertiary peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-theme-accent-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-theme-accent-primary"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Export Settings */}
      <div>
        <h3 className="text-lg font-medium text-theme-text-primary mb-4">
          Export & Sharing
        </h3>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-theme-text-primary">
                Include Metadata in Exports
              </h4>
              <p className="text-xs text-theme-text-muted mt-1">
                Include creation dates, edit history, and other metadata
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.exportIncludeMetadata || false}
                onChange={(e) => updateSettings({ exportIncludeMetadata: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-theme-bg-tertiary peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-theme-accent-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-theme-accent-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-theme-text-primary">
                Include Edit History in Exports
              </h4>
              <p className="text-xs text-theme-text-muted mt-1">
                Include full edit history and version information
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.exportIncludeHistory || false}
                onChange={(e) => updateSettings({ exportIncludeHistory: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-theme-bg-tertiary peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-theme-accent-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-theme-accent-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-theme-text-primary">
                Anonymous Mode
              </h4>
              <p className="text-xs text-theme-text-muted mt-1">
                Remove all identifying information from exports and logs
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.anonymousMode || false}
                onChange={(e) => updateSettings({ anonymousMode: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-theme-bg-tertiary peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-theme-accent-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-theme-accent-primary"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Security */}
      <div>
        <h3 className="text-lg font-medium text-theme-text-primary mb-4">
          Security & Access
        </h3>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-theme-text-primary">
                Lock After Inactivity
              </h4>
              <p className="text-xs text-theme-text-muted mt-1">
                Automatically lock the app after a period of inactivity
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.lockAfterInactivity || false}
                onChange={(e) => updateSettings({ lockAfterInactivity: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-theme-bg-tertiary peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-theme-accent-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-theme-accent-primary"></div>
            </label>
          </div>

          {settings.lockAfterInactivity && (
            <div>
              <label className="block text-sm font-medium text-theme-text-secondary mb-2">
                Inactivity Timeout (minutes)
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="number"
                  min="1"
                  max="1440"
                  value={values.inactivityTimeoutMinutes}
                  onChange={(e) => {
                    const value = parseInt(e.target.value)
                    handleFieldChange('inactivityTimeoutMinutes', value)
                    updateSettings({ inactivityTimeoutMinutes: value })
                  }}
                  onBlur={() => getFieldProps('inactivityTimeoutMinutes').onBlur()}
                  className={`w-32 px-3 py-2 bg-theme-bg-secondary border rounded-md text-sm text-theme-text-primary focus:outline-none focus:ring-2 focus:ring-theme-accent-primary ${
                    errors.inactivityTimeoutMinutes ? 'border-red-500' : 'border-theme-border-primary'
                  }`}
                />
                <span className="text-sm text-theme-text-muted">minutes</span>
              </div>
              {errors.inactivityTimeoutMinutes && (
                <ValidationMessage type="error" message={errors.inactivityTimeoutMinutes} />
              )}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-theme-text-primary">
                Require Password on Start
              </h4>
              <p className="text-xs text-theme-text-muted mt-1">
                Require password authentication when opening the app
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.requirePasswordOnStart || false}
                onChange={(e) => updateSettings({ requirePasswordOnStart: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-theme-bg-tertiary peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-theme-accent-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-theme-accent-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-theme-text-primary">
                Tracking Protection
              </h4>
              <p className="text-xs text-theme-text-muted mt-1">
                Block tracking scripts and third-party analytics
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.trackingProtection || false}
                onChange={(e) => updateSettings({ trackingProtection: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-theme-bg-tertiary peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-theme-accent-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-theme-accent-primary"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Data Management Actions */}
      <div>
        <h3 className="text-lg font-medium text-theme-text-primary mb-4">
          Data Management
        </h3>
        
        <div className="grid grid-cols-1 gap-3">
          <button
            onClick={handleExportData}
            className="flex items-center justify-between px-4 py-3 bg-theme-bg-secondary border border-theme-border-primary rounded-md hover:bg-theme-bg-tertiary transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Icons.Download size={16} className="text-theme-text-muted" />
              <span className="text-sm text-theme-text-primary">Export All Data</span>
            </div>
            <Icons.ArrowRight size={14} className="text-theme-text-muted" />
          </button>
          
          <button
            onClick={handleClearAllData}
            className="flex items-center justify-between px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Icons.Trash size={16} className="text-red-500" />
              <span className="text-sm text-red-600 dark:text-red-400">Clear All Data</span>
            </div>
            <Icons.AlertTriangle size={14} className="text-red-500" />
          </button>
        </div>
        
        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
          <div className="flex items-start space-x-2">
            <Icons.Info size={14} className="text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-yellow-700 dark:text-yellow-300">
              <strong>Privacy Notice:</strong> Viny respects your privacy. By default, all data stays on your device. 
              Analytics and crash reporting are opt-in only, and you maintain full control over your data.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PrivacySettings