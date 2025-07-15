import React from 'react'
import { useAppStore } from '../../../stores/newSimpleStore'
import Icons from '../../Icons'
import { ElectronAPI, isElectronAPI } from '../../../types/settings'
import { logger } from '../../../utils/logger'
import { useFormValidation } from '../../../hooks/useFormValidation'
import { SettingsValidation } from '../../../utils/validation'
import ValidationMessage from '../../ui/ValidationMessage'

const GeneralSettings: React.FC = () => {
  const { settings, updateSettings, notebooks = [] } = useAppStore()

  // Get available notebook IDs for validation
  const availableNotebooks = notebooks.map(nb => nb.id)

  // Form validation
  const {
    values,
    errors,
    warnings,
    getFieldProps,
    handleFieldChange,
    validateAllFields
  } = useFormValidation({
    initialValues: {
      language: settings.language || 'en',
      defaultNotebook: settings.defaultNotebook || 'personal'
    },
    validationRules: {
      language: SettingsValidation.general.language,
      defaultNotebook: (value: string) => SettingsValidation.general.defaultNotebook(value, availableNotebooks)
    },
    validateOnChange: true,
    validateOnBlur: true
  })

  const languages = [
    { value: 'en', label: 'English (US)', flag: '🇺🇸' },
    { value: 'en-gb', label: 'English (UK)', flag: '🇬🇧' },
    { value: 'es', label: 'Español', flag: '🇪🇸' },
    { value: 'es-mx', label: 'Español (México)', flag: '🇲🇽' },
    { value: 'fr', label: 'Français', flag: '🇫🇷' },
    { value: 'de', label: 'Deutsch', flag: '🇩🇪' },
    { value: 'it', label: 'Italiano', flag: '🇮🇹' },
    { value: 'pt-br', label: 'Português (Brasil)', flag: '🇧🇷' },
    { value: 'zh-cn', label: '中文 (简体)', flag: '🇨🇳' },
    { value: 'ja', label: '日本語', flag: '🇯🇵' },
    { value: 'ko', label: '한국어', flag: '🇰🇷' },
  ]

  const handleExportSettings = () => {
    try {
      const settingsJson = JSON.stringify(settings, null, 2)
      const blob = new Blob([settingsJson], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'viny-settings.json'
      a.click()
      URL.revokeObjectURL(url)
      
      // Show success message
      updateSettings({ showToast: { type: 'success', message: 'Settings exported successfully' } })
    } catch (error) {
      logger.error('Failed to export settings:', error)
      updateSettings({ showToast: { type: 'error', message: 'Failed to export settings' } })
    }
  }

  const handleImportSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const importedSettings = JSON.parse(e.target?.result as string)
          
          // Validate imported settings
          const validationResult = validateAllFields()
          if (!validationResult.isValid) {
            updateSettings({ showToast: { type: 'error', message: 'Invalid settings file format' } })
            return
          }
          
          // Update settings and show success
          updateSettings(importedSettings)
          updateSettings({ showToast: { type: 'success', message: 'Settings imported successfully' } })
        } catch (error) {
          logger.error('Failed to import settings:', error)
          updateSettings({ showToast: { type: 'error', message: 'Failed to import settings. Please check the file format.' } })
        }
      }
      reader.readAsText(file)
    }
  }

  const openConfigFolder = () => {
    const electronAPI = (window as any).electronAPI as ElectronAPI | undefined
    if (electronAPI && isElectronAPI(electronAPI) && electronAPI.openConfigFolder) {
      electronAPI.openConfigFolder().catch(logger.error)
    } else {
      logger.info('Config folder access not available in web version')
    }
  }

  const openAPIDocumentation = () => {
    window.open('https://docs.viny.app/api', '_blank')
  }

  return (
    <div className="space-y-8">
      {/* General Configuration */}
      <div>
        <h3 className="text-lg font-medium text-theme-text-primary mb-4">
          General
        </h3>
        
        <div className="space-y-6">
          {/* Default Notebook */}
          <div>
            <label className="block text-sm font-medium text-theme-text-secondary mb-2">
              Default Notebook
            </label>
            <select
              value={values.defaultNotebook}
              onChange={(e) => {
                const value = e.target.value
                handleFieldChange('defaultNotebook', value)
                updateSettings({ defaultNotebook: value })
              }}
              onBlur={() => getFieldProps('defaultNotebook').onBlur()}
              className={`w-full px-3 py-2 bg-theme-bg-secondary border rounded-md text-sm text-theme-text-primary focus:outline-none focus:ring-2 focus:ring-theme-accent-primary ${
                errors.defaultNotebook ? 'border-red-500' : 'border-theme-border-primary'
              }`}
            >
              {notebooks.map((notebook) => (
                <option key={notebook.id} value={notebook.id} className="bg-theme-bg-secondary text-theme-text-primary">
                  {notebook.name}
                </option>
              ))}
            </select>
            {errors.defaultNotebook && (
              <ValidationMessage type="error" message={errors.defaultNotebook} />
            )}
            {warnings.defaultNotebook && (
              <ValidationMessage type="warning" message={warnings.defaultNotebook} />
            )}
            {!errors.defaultNotebook && !warnings.defaultNotebook && (
              <p className="mt-1 text-xs text-theme-text-muted">
                New notes will be saved to this notebook by default
              </p>
            )}
          </div>

          {/* Language */}
          <div>
            <label className="block text-sm font-medium text-theme-text-secondary mb-2">
              Language
            </label>
            <select
              value={values.language}
              onChange={(e) => {
                const value = e.target.value
                handleFieldChange('language', value)
                updateSettings({ language: value })
              }}
              onBlur={() => getFieldProps('language').onBlur()}
              className={`w-full px-3 py-2 bg-theme-bg-secondary border rounded-md text-sm text-theme-text-primary focus:outline-none focus:ring-2 focus:ring-theme-accent-primary ${
                errors.language ? 'border-red-500' : 'border-theme-border-primary'
              }`}
            >
              {languages.map((lang) => (
                <option key={lang.value} value={lang.value} className="bg-theme-bg-secondary text-theme-text-primary">
                  {lang.flag} {lang.label}
                </option>
              ))}
            </select>
            {errors.language && (
              <ValidationMessage type="error" message={errors.language} />
            )}
            {warnings.language && (
              <ValidationMessage type="warning" message={warnings.language} />
            )}
            {!errors.language && !warnings.language && (
              <p className="mt-1 text-xs text-theme-text-muted">
                Choose your preferred language for the interface
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Auto Updates */}
      <div>
        <h3 className="text-lg font-medium text-theme-text-primary mb-4">
          Auto Updates
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-theme-text-primary">
                Check for Updates Automatically
              </h4>
              <p className="text-xs text-theme-text-muted mt-1">
                Download new versions automatically to stay up to date
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoUpdates || false}
                onChange={(e) => updateSettings({ autoUpdates: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-theme-bg-tertiary peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-theme-accent-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-theme-accent-primary"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Development */}
      <div>
        <h3 className="text-lg font-medium text-theme-text-primary mb-4">
          Development
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-theme-text-primary">
                Development Mode
              </h4>
              <p className="text-xs text-theme-text-muted mt-1">
                Enable development tools and debugging features
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.developmentMode || false}
                onChange={(e) => updateSettings({ developmentMode: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-theme-bg-tertiary peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-theme-accent-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-theme-accent-primary"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-medium text-theme-text-primary mb-4">
          Quick Actions
        </h3>
        
        <div className="grid grid-cols-1 gap-3">
          <button
            onClick={openAPIDocumentation}
            className="flex items-center justify-between px-4 py-3 bg-theme-bg-secondary border border-theme-border-primary rounded-md hover:bg-theme-bg-tertiary transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Icons.FileText size={16} className="text-theme-text-muted" />
              <span className="text-sm text-theme-text-primary">API Documentation</span>
            </div>
            <Icons.ArrowRight size={14} className="text-theme-text-muted" />
          </button>
          
          {(() => {
            const electronAPI = (window as any).electronAPI as ElectronAPI | undefined
            return electronAPI && isElectronAPI(electronAPI)
          })() && (
            <button
              onClick={openConfigFolder}
              className="flex items-center justify-between px-4 py-3 bg-theme-bg-secondary border border-theme-border-primary rounded-md hover:bg-theme-bg-tertiary transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Icons.Folder size={16} className="text-theme-text-muted" />
                <span className="text-sm text-theme-text-primary">Open Config Folder</span>
              </div>
              <Icons.ChevronRight size={14} className="text-theme-text-muted" />
            </button>
          )}
        </div>
      </div>

      {/* Settings Management */}
      <div>
        <h3 className="text-lg font-medium text-theme-text-primary mb-4">
          Settings Management
        </h3>
        
        <div className="grid grid-cols-1 gap-3">
          <button
            onClick={handleExportSettings}
            className="flex items-center justify-between px-4 py-3 bg-theme-bg-secondary border border-theme-border-primary rounded-md hover:bg-theme-bg-tertiary transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Icons.Download size={16} className="text-theme-text-muted" />
              <span className="text-sm text-theme-text-primary">Export Settings</span>
            </div>
          </button>
          
          <label className="flex items-center justify-between px-4 py-3 bg-theme-bg-secondary border border-theme-border-primary rounded-md hover:bg-theme-bg-tertiary transition-colors cursor-pointer">
            <div className="flex items-center space-x-3">
              <Icons.Upload size={16} className="text-theme-text-muted" />
              <span className="text-sm text-theme-text-primary">Import Settings</span>
            </div>
            <input
              type="file"
              accept=".json"
              onChange={handleImportSettings}
              className="hidden"
            />
          </label>
        </div>
      </div>
    </div>
  )
}

export default GeneralSettings