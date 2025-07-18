import React from 'react'
import { useAppStore } from '../../../stores/newSimpleStore'
import { useSettings } from '../../../hooks/useSettings'
import { useNotebooks } from '../../../hooks/useNotebooks'
import { getSettingsService } from '../../../services/settings'
import { Icons } from '../../Icons'
import { ElectronAPI, isElectronAPI } from '../../../types/settings'
import { logger } from '../../../utils/logger'

const GeneralSettings: React.FC = () => {
  const { showSuccess, showError } = useAppStore()
  const { notebooks = [] } = useNotebooks()
  
  // Helper function to convert setting values to appropriate types
  const stringValue = (value: any): string => typeof value === 'string' ? value : ''
  const booleanValue = (value: any): boolean => typeof value === 'boolean' ? value : false
  
  const {
    settings,
    setSetting,
    updateSettings,
    resetSettings,
    loading,
    error
  } = useSettings()

  // Export and import functions
  const exportSettings = () => {
    return JSON.stringify(settings, null, 2)
  }

  const importSettings = async (jsonData: string) => {
    try {
      const parsedSettings = JSON.parse(jsonData)
      updateSettings(parsedSettings)
      return true
    } catch (err) {
      return false
    }
  }

  // Define language options directly
  const languages = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Español' },
    { value: 'fr', label: 'Français' },
    { value: 'de', label: 'Deutsch' }
  ].map(opt => {
    const flags: Record<string, string> = {
      'en': '🇺🇸',
      'es': '🇪🇸',
      'fr': '🇫🇷',
      'de': '🇩🇪',
      'it': '🇮🇹',
      'pt-br': '🇧🇷',
      'zh-cn': '🇨🇳',
      'ja': '🇯🇵',
      'ko': '🇰🇷'
    }
    return {
      value: opt.value,
      label: opt.label,
      flag: flags[opt.value as string] || '🌐'
    }
  }) || []

  const handleExportSettings = () => {
    try {
      const settingsJson = exportSettings()
      const blob = new Blob([JSON.stringify(settingsJson, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'viny-settings.json'
      a.click()
      URL.revokeObjectURL(url)
      
      showSuccess('Settings exported successfully')
    } catch (error) {
      logger.error('Failed to export settings:', error)
      showError('Failed to export settings')
    }
  }

  const handleImportSettings = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const data = e.target?.result as string
          const success = await importSettings(data)
          
          if (success) {
            showSuccess('Settings imported successfully')
          } else {
            showError('Invalid settings file format')
          }
        } catch (error) {
          logger.error('Failed to import settings:', error)
          showError('Failed to import settings. Please check the file format.')
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
              value={stringValue(settings.defaultNotebook) || 'inbox'}
              onChange={(e) => setSetting('defaultNotebook', e.target.value)}
              className={`w-full px-3 py-2 bg-theme-bg-secondary border rounded-md text-sm text-theme-text-primary focus:outline-none focus:ring-2 focus:ring-theme-accent-primary ${
                'border-theme-border-primary'
              }`}
            >
              {notebooks.map((notebook) => (
                <option key={notebook.id} value={notebook.id} className="bg-theme-bg-secondary text-theme-text-primary">
                  {notebook.name}
                </option>
              ))}
            </select>
            {
              <p className="mt-1 text-xs text-theme-text-muted">
                New notes will be saved to this notebook by default
              </p>
            }
          </div>

          {/* Language */}
          <div>
            <label className="block text-sm font-medium text-theme-text-secondary mb-2">
              Language
            </label>
            <select
              value={stringValue(settings.language) || 'en'}
              onChange={(e) => setSetting('language', e.target.value)}
              className="w-full px-3 py-2 bg-theme-bg-secondary border border-theme-border-primary rounded-md text-sm text-theme-text-primary focus:outline-none focus:ring-2 focus:ring-theme-accent-primary"
            >
              {languages.map((lang) => (
                <option key={lang.value} value={lang.value} className="bg-theme-bg-secondary text-theme-text-primary">
                  {lang.flag} {lang.label}
                </option>
              ))}
            </select>
            {
              <p className="mt-1 text-xs text-theme-text-muted">
                Choose your preferred language for the interface
              </p>
            }
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
                checked={booleanValue(settings.checkForUpdates)}
                onChange={(e) => setSetting('checkForUpdates', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-theme-bg-tertiary peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-theme-accent-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-theme-accent-primary"></div>
            </label>
          </div>
          
          {settings.checkForUpdates && (
            <div>
              <label className="block text-sm font-medium text-theme-text-secondary mb-2">
                Update Channel
              </label>
              <select
                value={stringValue(settings.updateChannel) || 'stable'}
                onChange={(e) => setSetting('updateChannel', e.target.value)}
                className="w-full px-3 py-2 bg-theme-bg-secondary border border-theme-border-primary rounded-md text-sm text-theme-text-primary focus:outline-none focus:ring-2 focus:ring-theme-accent-primary"
              >
                <option value="stable">Stable</option>
                <option value="beta">Beta</option>
                <option value="alpha">Alpha</option>
              </select>
              {
                <p className="mt-1 text-xs text-theme-text-muted">
                  Choose which type of updates to receive
                </p>
              }
            </div>
          )}
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
                checked={booleanValue(settings.developmentMode)}
                onChange={(e) => setSetting('developmentMode', e.target.checked)}
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