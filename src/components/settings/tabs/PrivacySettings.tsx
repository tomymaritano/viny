import React, { useState } from 'react'
import { useSettingsService } from '../../../hooks/useSettingsService'
import { useSettingsErrorHandler } from '../../../hooks/useSettingsErrorHandler'
import { privacyService } from '../../../services/privacyService'
import SettingsErrorBoundary from '../SettingsErrorBoundary'
import { Icons } from '../../Icons'

const PrivacySettingsContent: React.FC = () => {
  const {
    settings,
    setSetting,
    schemas,
    errors: serviceErrors
  } = useSettingsService({ category: 'privacy' })
  
  const {
    errors: localErrors,
    handleSettingsError,
    validateAndHandle,
    clearError
  } = useSettingsErrorHandler()
  
  const [isClearing, setIsClearing] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  
  // Combine service and local errors
  const allErrors = { ...serviceErrors, ...localErrors }

  const renderToggle = (key: string, label: string, description: string, warning?: string) => {
    const schema = schemas.find(s => s.key === key)
    const value = settings[key] ?? schema?.defaultValue ?? false
    const hasError = allErrors[key]
    
    return (
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h4 className="text-sm font-medium text-theme-text-primary">
            {label}
            {schema?.experimental && (
              <span className="ml-2 text-xs text-theme-accent-yellow">Experimental</span>
            )}
          </h4>
          <p className="text-xs text-theme-text-muted mt-1">
            {description}
          </p>
          {warning && value && (
            <p className="text-xs text-theme-accent-yellow mt-1">
              ⚠️ {warning}
            </p>
          )}
          {hasError && (
            <p className="text-xs text-red-500 mt-1 flex items-center">
              <Icons.AlertTriangle size={12} className="mr-1" />
              {typeof hasError === 'string' ? hasError : hasError.message}
              <button
                onClick={() => clearError(key)}
                className="ml-2 text-theme-text-muted hover:text-theme-text-primary"
              >
                <Icons.X size={12} />
              </button>
            </p>
          )}
        </div>
        <label className="relative inline-flex items-center cursor-pointer ml-4">
          <input
            type="checkbox"
            checked={value as boolean}
            onChange={async (e) => {
              const newValue = e.target.checked
              const success = await validateAndHandle(
                key,
                newValue,
                () => true, // Basic validation
                (val) => setSetting(key, val)
              )
              if (!success) {
                // Force re-render with original value if save failed
                setSetting(key, !newValue)
              }
            }}
            className="sr-only peer"
          />
          <div className={`w-11 h-6 bg-theme-bg-tertiary peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-theme-accent-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-theme-accent-primary ${hasError ? 'ring-2 ring-red-500 ring-opacity-50' : ''}`}></div>
        </label>
      </div>
    )
  }

  const renderNumberInput = (key: string, label: string, description?: string) => {
    const schema = schemas.find(s => s.key === key)
    const value = settings[key] ?? schema?.defaultValue ?? 0
    
    return (
      <div>
        <label className="block text-sm font-medium text-theme-text-secondary mb-2">
          {label}
        </label>
        {description && (
          <p className="text-xs text-theme-text-muted mb-2">{description}</p>
        )}
        <div className="flex items-center space-x-4">
          <span className="text-xs text-theme-text-muted">{schema?.min}</span>
          <input
            type="range"
            min={schema?.min}
            max={schema?.max}
            step={schema?.step}
            value={value as number}
            onChange={(e) => setSetting(key, parseInt(e.target.value))}
            className="flex-1 h-2 bg-theme-bg-tertiary rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-xs text-theme-text-muted">{schema?.max}</span>
          <span className="text-sm font-medium text-theme-text-primary w-16">
            {value === 0 ? 'Disabled' : `${value}${key.includes('Days') ? 'd' : key.includes('Minutes') ? 'm' : 's'}`}
          </span>
        </div>
        {allErrors[key] && (
          <p className="mt-1 text-xs text-red-500 flex items-center">
            <Icons.AlertTriangle size={12} className="mr-1" />
            {typeof allErrors[key] === 'string' ? allErrors[key] : allErrors[key].message}
            <button
              onClick={() => clearError(key)}
              className="ml-2 text-theme-text-muted hover:text-theme-text-primary"
            >
              <Icons.X size={12} />
            </button>
          </p>
        )}
      </div>
    )
  }

  const renderPasswordInput = (key: string, label: string, placeholder: string) => {
    const value = settings[key] || ''
    
    return (
      <div>
        <label className="block text-sm font-medium text-theme-text-secondary mb-2">
          {label}
        </label>
        <input
          type="password"
          value={value as string}
          onChange={(e) => setSetting(key, e.target.value)}
          placeholder={placeholder}
          className={`w-full px-3 py-2 bg-theme-bg-secondary border rounded-md text-sm text-theme-text-primary focus:outline-none focus:ring-2 focus:ring-theme-accent-primary ${
            allErrors[key] ? 'border-red-500' : 'border-theme-border-primary'
          }`}
        />
        {allErrors[key] && (
          <p className="mt-1 text-xs text-red-500 flex items-center">
            <Icons.AlertTriangle size={12} className="mr-1" />
            {typeof allErrors[key] === 'string' ? allErrors[key] : allErrors[key].message}
            <button
              onClick={() => clearError(key)}
              className="ml-2 text-theme-text-muted hover:text-theme-text-primary"
            >
              <Icons.X size={12} />
            </button>
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Privacy Notice */}
      <div className="p-4 bg-theme-accent-primary/10 border border-theme-accent-primary/20 rounded-lg">
        <div className="flex items-start space-x-3">
          <Icons.Shield size={20} className="text-theme-accent-primary mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-theme-text-primary">Your Privacy Matters</h4>
            <p className="text-xs text-theme-text-muted mt-1">
              Viny is designed with privacy in mind. All your notes are stored locally by default.
              These settings give you control over what data is collected and how it's used.
            </p>
          </div>
        </div>
      </div>

      {/* Analytics & Tracking */}
      <div>
        <h3 className="text-lg font-medium text-theme-text-primary mb-4">
          Analytics & Tracking
        </h3>
        
        <div className="space-y-6">
          {renderToggle(
            'analyticsEnabled',
            'Usage Analytics',
            'Help improve the app by sharing anonymous usage data'
          )}
          
          {renderToggle(
            'crashReporting',
            'Crash Reporting',
            'Automatically send crash reports to help fix issues'
          )}
          
          {renderToggle(
            'anonymousMode',
            'Anonymous Mode',
            'Disable all tracking and telemetry'
          )}
        </div>
      </div>

      {/* Data Storage */}
      <div>
        <h3 className="text-lg font-medium text-theme-text-primary mb-4">
          Data Storage
        </h3>
        
        <div className="space-y-6">
          {renderToggle(
            'localDataOnly',
            'Local Data Only',
            'Keep all data on this device only'
          )}
          
          {renderToggle(
            'encryptLocalStorage',
            'Encrypt Local Storage',
            'Encrypt notes stored on this device',
            'Experimental feature - ensure you remember your encryption key'
          )}
          
          {settings.encryptLocalStorage && (
            renderPasswordInput(
              'encryptionKey',
              'Encryption Key',
              'Enter a strong encryption key'
            )
          )}
          
          {renderToggle(
            'clearDataOnExit',
            'Clear Data on Exit',
            'Remove temporary data when closing the app'
          )}
        </div>
      </div>

      {/* Data Retention */}
      <div>
        <h3 className="text-lg font-medium text-theme-text-primary mb-4">
          Data Retention
        </h3>
        
        <div className="space-y-6">
          {renderNumberInput(
            'dataRetentionDays',
            'Data Retention (Days)',
            'How long to keep deleted notes in trash'
          )}
        </div>
      </div>

      {/* Network Security */}
      <div>
        <h3 className="text-lg font-medium text-theme-text-primary mb-4">
          Network Security
        </h3>
        
        <div className="space-y-6">
          {renderToggle(
            'secureNoteDeletion',
            'Secure Deletion',
            'Overwrite data when deleting notes'
          )}
          
          {renderToggle(
            'autoDeleteOldData',
            'Auto Delete Old Data',
            'Automatically remove data older than retention period'
          )}
          
          {renderNumberInput(
            'clipboardTimeout',
            'Clear Clipboard (Seconds)',
            'Clear clipboard after copying (0 = disabled)'
          )}
        </div>
      </div>

      {/* Security */}
      <div>
        <h3 className="text-lg font-medium text-theme-text-primary mb-4">
          Security
        </h3>
        
        <div className="space-y-6">
          {renderToggle(
            'requirePasswordOnStart',
            'Password on Start',
            'Require password when opening the app'
          )}
          
          {renderToggle(
            'lockAfterInactivity',
            'Lock After Inactivity',
            'Require authentication after being idle'
          )}
          
          {settings.lockAfterInactivity && (
            renderNumberInput(
              'inactivityTimeoutMinutes',
              'Inactivity Timeout (Minutes)',
              'Minutes before requiring authentication'
            )
          )}
          
          {renderToggle(
            'biometricUnlock',
            'Biometric Unlock',
            'Use fingerprint or face unlock',
            'Experimental feature'
          )}
        </div>
      </div>

      {/* Export Settings */}
      <div>
        <h3 className="text-lg font-medium text-theme-text-primary mb-4">
          Data Export Settings
        </h3>
        
        <div className="space-y-6">
          {renderToggle(
            'exportIncludeMetadata',
            'Include Metadata in Exports',
            'Include creation dates and tags when exporting'
          )}
          
          {renderToggle(
            'exportIncludeHistory',
            'Include History in Exports',
            'Include revision history when exporting'
          )}
        </div>
      </div>

      {/* Privacy Actions */}
      <div>
        <h3 className="text-lg font-medium text-theme-text-primary mb-4">
          Privacy Actions
        </h3>
        
        <div className="space-y-3">
          <button
            onClick={async () => {
              if (confirm('This will permanently delete all usage data, analytics, and cached information. This action cannot be undone. Continue?')) {
                setIsClearing(true)
                try {
                  await privacyService.clearUsageData()
                  // Success handled by privacyService
                } catch (error) {
                  handleSettingsError('clearUsageData', error as Error, 'unknown', true)
                } finally {
                  setIsClearing(false)
                }
              }
            }}
            disabled={isClearing}
            className="w-full flex items-center justify-between px-4 py-3 bg-theme-bg-secondary border border-theme-border-primary rounded-md hover:bg-theme-bg-tertiary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center space-x-3">
              <Icons.Trash2 size={16} className="text-theme-text-muted" />
              <span className="text-sm text-theme-text-primary">
                {isClearing ? 'Clearing...' : 'Clear Usage Data'}
              </span>
            </div>
            {!isClearing && <Icons.ChevronRight size={14} className="text-theme-text-muted" />}
          </button>
          
          <button
            onClick={async () => {
              setIsDownloading(true)
              try {
                const includeMetadata = settings.exportIncludeMetadata ?? true
                const includeHistory = settings.exportIncludeHistory ?? false
                await privacyService.downloadUserData(includeMetadata, includeHistory)
                // Success handled by privacyService
              } catch (error) {
                handleSettingsError('downloadUserData', error as Error, 'unknown', true)
              } finally {
                setIsDownloading(false)
              }
            }}
            disabled={isDownloading}
            className="w-full flex items-center justify-between px-4 py-3 bg-theme-bg-secondary border border-theme-border-primary rounded-md hover:bg-theme-bg-tertiary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center space-x-3">
              <Icons.Download size={16} className="text-theme-text-muted" />
              <span className="text-sm text-theme-text-primary">
                {isDownloading ? 'Downloading...' : 'Download My Data'}
              </span>
            </div>
            {!isDownloading && <Icons.ChevronRight size={14} className="text-theme-text-muted" />}
          </button>
        </div>
      </div>
    </div>
  )
}

const PrivacySettings: React.FC = () => {
  return (
    <SettingsErrorBoundary settingsCategory="privacy">
      <PrivacySettingsContent />
    </SettingsErrorBoundary>
  )
}

export default PrivacySettings