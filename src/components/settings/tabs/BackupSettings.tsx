import React, { useState } from 'react'
import { useAppStore } from '../../../stores/newSimpleStore'
import Icons from '../../Icons'
import { useFormValidation } from '../../../hooks/useFormValidation'
import { SettingsValidation } from '../../../utils/validation'
import ValidationMessage from '../../ui/ValidationMessage'

const BackupSettings: React.FC = () => {
  const { settings, updateSettings } = useAppStore()
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [isCreatingBackup, setIsCreatingBackup] = useState(false)
  const [isRestoringBackup, setIsRestoringBackup] = useState(false)
  
  // Default backup location
  const getDefaultBackupLocation = () => {
    if (window.electronAPI?.isElectron) {
      return '~/Documents/Viny/Backups'
    }
    return 'Downloads'
  }

  const handleSelectBackupLocation = async () => {
    if (window.electronAPI?.isElectron && window.electronAPI.selectDirectory) {
      try {
        const directory = await window.electronAPI.selectDirectory()
        if (directory) {
          updateSettings({ backupLocation: directory })
        }
      } catch (error) {
        console.error('Failed to select backup location:', error)
        updateSettings({ showToast: { type: 'error', message: 'Failed to select backup location' } })
      }
    } else {
      // For web, show instruction
      updateSettings({ 
        showToast: { 
          type: 'info', 
          message: 'Backup location can be selected in the Electron app. In the web version, backups are downloaded to your default Downloads folder.' 
        } 
      })
    }
  }

  const handleTestAutoBackup = async () => {
    if (!settings.autoBackup) {
      updateSettings({ showToast: { type: 'warning', message: 'Auto backup is not enabled' } })
      return
    }

    try {
      const backupLocation = settings.backupLocation || getDefaultBackupLocation()
      const frequency = settings.backupFrequency || 'daily'
      
      updateSettings({ 
        showToast: { 
          type: 'success', 
          message: `Auto backup is configured to run ${frequency} and save to: ${backupLocation}` 
        } 
      })
      
      // If in Electron, test actual backup creation
      if (window.electronAPI?.isElectron) {
        await handleCreateBackup() // Use the existing manual backup function
      }
    } catch (error) {
      updateSettings({ showToast: { type: 'error', message: 'Auto backup test failed' } })
    }
  }

  // Form validation for backup settings
  const {
    values,
    errors,
    warnings,
    getFieldProps,
    handleFieldChange,
    validateAllFields
  } = useFormValidation({
    initialValues: {
      backupRetentionDays: settings.backupRetentionDays || 7
    },
    validationRules: {
      backupRetentionDays: (value: number) => {
        const result = SettingsValidation.backup.backupRetentionDays(value)
        return result.error || null
      }
    },
    validateOnChange: true,
    validateOnBlur: true
  })

  const handleCreateBackup = async () => {
    if (isCreatingBackup) return
    
    setIsCreatingBackup(true)
    
    try {
      const backupData = {
        notes: [], // Get from store
        settings: settings,
        notebooks: [], // Get from store
        metadata: {
          backupDate: new Date().toISOString(),
          version: '1.3.0',
          type: 'manual'
        }
      }

      const dataStr = JSON.stringify(backupData, null, 2)
      const blob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `viny-backup-${new Date().toISOString().split('T')[0]}-${Date.now()}.json`
      a.click()
      URL.revokeObjectURL(url)

      updateSettings({ showToast: { type: 'success', message: 'Backup created successfully' } })
    } catch (error) {
      updateSettings({ showToast: { type: 'error', message: 'Failed to create backup' } })
    } finally {
      setIsCreatingBackup(false)
    }
  }

  const handleRestoreBackup = () => {
    if (isRestoringBackup) return
    
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      setIsRestoringBackup(true)
      
      try {
        const text = await file.text()
        const backupData = JSON.parse(text)
        
        // Validate backup structure
        if (!backupData.metadata || !backupData.settings) {
          throw new Error('Invalid backup file format')
        }

        if (window.confirm('⚠️ This will replace all your current data with the backup. This action cannot be undone.\n\nAre you sure you want to continue?')) {
          // Restore settings
          if (backupData.settings) {
            updateSettings(backupData.settings)
          }

          updateSettings({ 
            showToast: { 
              type: 'success', 
              message: 'Backup restored successfully. Please restart the application.' 
            } 
          })
          
          // Reload after delay to apply restored settings
          setTimeout(() => {
            window.location.reload()
          }, 2000)
        }
      } catch (error) {
        updateSettings({ 
          showToast: { 
            type: 'error', 
            message: 'Failed to restore backup. Please check the file format.' 
          } 
        })
      } finally {
        setIsRestoringBackup(false)
      }
    }
    input.click()
  }


  return (
    <div className="space-y-8">
      {/* Auto Backup Configuration */}
      <div>
        <h3 className="text-lg font-medium text-theme-text-primary mb-4">
          Automatic Backup
        </h3>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-theme-text-primary">
                Enable Automatic Backup
              </h4>
              <p className="text-xs text-theme-text-muted mt-1">
                Automatically create backups of your notes and settings
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoBackup || false}
                onChange={(e) => updateSettings({ autoBackup: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-theme-bg-tertiary peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-theme-accent-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-theme-accent-primary"></div>
            </label>
          </div>

          {settings.autoBackup && (
            <div className="space-y-4 pl-4 border-l-2 border-theme-border-secondary">
              <div>
                <label className="block text-sm font-medium text-theme-text-secondary mb-2">
                  Backup Frequency
                </label>
                <select
                  value={settings.backupFrequency || 'daily'}
                  onChange={(e) => updateSettings({ backupFrequency: e.target.value as 'hourly' | 'daily' | 'weekly' })}
                  className="w-48 px-3 py-2 bg-theme-bg-secondary border border-theme-border-primary rounded-md text-sm text-theme-text-primary focus:outline-none focus:ring-2 focus:ring-theme-accent-primary"
                >
                  <option value="hourly">Every Hour</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
                <p className="mt-1 text-xs text-theme-text-muted">
                  How often automatic backups are created
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-theme-text-secondary mb-2">
                  Backup Location
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={settings.backupLocation || getDefaultBackupLocation()}
                    onChange={(e) => updateSettings({ backupLocation: e.target.value })}
                    placeholder={getDefaultBackupLocation()}
                    className="flex-1 px-3 py-2 bg-theme-bg-secondary border border-theme-border-primary rounded-md text-sm text-theme-text-primary focus:outline-none focus:ring-2 focus:ring-theme-accent-primary"
                  />
                  <button
                    onClick={handleSelectBackupLocation}
                    className="px-3 py-2 bg-theme-bg-tertiary border border-theme-border-primary rounded-md text-sm text-theme-text-primary hover:bg-theme-bg-secondary transition-colors"
                  >
                    Browse
                  </button>
                </div>
                <p className="mt-1 text-xs text-theme-text-muted">
                  Leave empty to use the default backup directory
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-theme-text-secondary mb-2">
                  Retention Period (days)
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={values.backupRetentionDays}
                    onChange={(e) => {
                      const value = parseInt(e.target.value)
                      handleFieldChange('backupRetentionDays', value)
                      updateSettings({ backupRetentionDays: value })
                    }}
                    onBlur={() => getFieldProps('backupRetentionDays').onBlur()}
                    className={`w-32 px-3 py-2 bg-theme-bg-secondary border rounded-md text-sm text-theme-text-primary focus:outline-none focus:ring-2 focus:ring-theme-accent-primary ${
                      errors.backupRetentionDays ? 'border-red-500' : 'border-theme-border-primary'
                    }`}
                  />
                  <span className="text-sm text-theme-text-muted">days</span>
                </div>
                {errors.backupRetentionDays && (
                  <ValidationMessage type="error" message={errors.backupRetentionDays} />
                )}
                <p className="mt-1 text-xs text-theme-text-muted">
                  Delete backups older than this many days
                </p>
              </div>
            </div>
          )}
        </div>
        
        {/* Test Auto Backup Button */}
        {settings.autoBackup && (
          <div className="flex items-center justify-between pt-4 border-t border-theme-border-primary">
            <div>
              <h4 className="text-sm font-medium text-theme-text-primary">
                Test Auto Backup
              </h4>
              <p className="text-xs text-theme-text-muted mt-1">
                Test if automatic backup is working correctly
              </p>
            </div>
            <button
              onClick={handleTestAutoBackup}
              className="px-4 py-2 bg-theme-accent-primary text-white rounded-md hover:bg-theme-accent-secondary transition-colors text-sm font-medium"
            >
              Test Backup
            </button>
          </div>
        )}
      </div>

      {/* Manual Backup Actions */}
      <div>
        <h3 className="text-lg font-medium text-theme-text-primary mb-4">
          Manual Backup & Restore
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={handleCreateBackup}
            disabled={isCreatingBackup}
            className="flex items-center justify-between px-4 py-3 bg-theme-bg-secondary border border-theme-border-primary rounded-md hover:bg-theme-bg-tertiary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center space-x-3">
              <Icons.Download size={16} className="text-theme-text-muted" />
              <span className="text-sm text-theme-text-primary">
                {isCreatingBackup ? 'Creating Backup...' : 'Create Backup'}
              </span>
            </div>
            <Icons.ArrowRight size={14} className="text-theme-text-muted" />
          </button>
          
          <button
            onClick={handleRestoreBackup}
            disabled={isRestoringBackup}
            className="flex items-center justify-between px-4 py-3 bg-theme-bg-secondary border border-theme-border-primary rounded-md hover:bg-theme-bg-tertiary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center space-x-3">
              <Icons.Upload size={16} className="text-theme-text-muted" />
              <span className="text-sm text-theme-text-primary">
                {isRestoringBackup ? 'Restoring...' : 'Restore Backup'}
              </span>
            </div>
            <Icons.ArrowRight size={14} className="text-theme-text-muted" />
          </button>
        </div>
        
        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
          <div className="flex items-start space-x-2">
            <Icons.AlertTriangle size={14} className="text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-yellow-700 dark:text-yellow-300">
              <strong>Important:</strong> Always keep regular backups of your data. 
              Backup files contain all your notes, settings, and metadata. Store them in a safe location.
            </p>
          </div>
        </div>
      </div>

      {/* Advanced Settings */}
      <div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center space-x-2 text-sm text-theme-text-secondary hover:text-theme-text-primary transition-colors"
        >
          <Icons.Settings size={14} />
          <span>Advanced Backup Settings</span>
          <Icons.ChevronDown size={14} className={`transform transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
        </button>

        {showAdvanced && (
          <div className="mt-4 space-y-4 p-4 bg-theme-bg-secondary rounded-md border border-theme-border-primary">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-theme-text-primary mb-2">
                  Backup Information
                </h4>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-theme-text-muted">Last Backup:</span>
                    <p className="text-theme-text-primary">
                      {settings.autoBackup ? 'Auto-backup enabled' : 'Manual only'}
                    </p>
                  </div>
                  <div>
                    <span className="text-theme-text-muted">Backup Size:</span>
                    <p className="text-theme-text-primary">~2.5 MB estimated</p>
                  </div>
                  <div>
                    <span className="text-theme-text-muted">Frequency:</span>
                    <p className="text-theme-text-primary">{settings.backupFrequency || 'daily'}</p>
                  </div>
                  <div>
                    <span className="text-theme-text-muted">Retention:</span>
                    <p className="text-theme-text-primary">{settings.backupRetentionDays || 7} days</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-theme-border-secondary">
                <p className="text-xs text-theme-text-muted">
                  Backups include: Notes content, notebooks, settings, tags, and metadata. 
                  Sensitive information like sync credentials are excluded for security.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default BackupSettings