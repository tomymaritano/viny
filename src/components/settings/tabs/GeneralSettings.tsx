import React from 'react'
import { useAppStore } from '../../../stores/newSimpleStore'
import Icons from '../../Icons'

const GeneralSettings: React.FC = () => {
  const { settings, updateSettings } = useAppStore()

  const themes = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'system', label: 'System' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-theme-text-primary mb-4">
          Appearance
        </h3>
        
        {/* Theme Selection */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-theme-text-secondary mb-2">
              Theme
            </label>
            <div className="grid grid-cols-3 gap-2">
              {themes.map((theme) => (
                <button
                  key={theme.value}
                  onClick={() => updateSettings({ theme: theme.value })}
                  className={`
                    px-4 py-2 rounded-md border transition-all
                    ${
                      settings.theme === theme.value
                        ? 'border-theme-accent-primary bg-theme-accent-primary/10 text-theme-accent-primary'
                        : 'border-theme-border-primary text-theme-text-secondary hover:border-theme-border-secondary'
                    }
                  `}
                >
                  {theme.label}
                </button>
              ))}
            </div>
          </div>

          {/* Font Size */}
          <div>
            <label className="block text-sm font-medium text-theme-text-secondary mb-2">
              Font Size
            </label>
            <select
              value={settings.fontSize || 14}
              onChange={(e) => updateSettings({ fontSize: parseInt(e.target.value) })}
              className="w-full px-3 py-2 bg-theme-bg-secondary border border-theme-border-primary rounded-md text-theme-text-primary"
            >
              <option value="12">Small (12px)</option>
              <option value="14">Default (14px)</option>
              <option value="16">Large (16px)</option>
              <option value="18">Extra Large (18px)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="border-t border-theme-border-primary pt-6">
        <h3 className="text-lg font-medium text-theme-text-primary mb-4">
          Behavior
        </h3>
        
        <div className="space-y-4">
          {/* Auto Save */}
          <label className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-theme-text-primary">
                Auto Save
              </div>
              <div className="text-xs text-theme-text-muted">
                Automatically save changes as you type
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.autoSave !== false}
              onChange={(e) => updateSettings({ autoSave: e.target.checked })}
              className="w-4 h-4 text-theme-accent-primary bg-theme-bg-secondary border-theme-border-primary rounded"
            />
          </label>

          {/* Show Line Numbers */}
          <label className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-theme-text-primary">
                Show Line Numbers
              </div>
              <div className="text-xs text-theme-text-muted">
                Display line numbers in the editor
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.showLineNumbers !== false}
              onChange={(e) => updateSettings({ showLineNumbers: e.target.checked })}
              className="w-4 h-4 text-theme-accent-primary bg-theme-bg-secondary border-theme-border-primary rounded"
            />
          </label>

          {/* Spell Check */}
          <label className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-theme-text-primary">
                Spell Check
              </div>
              <div className="text-xs text-theme-text-muted">
                Enable spell checking in the editor
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.spellCheck !== false}
              onChange={(e) => updateSettings({ spellCheck: e.target.checked })}
              className="w-4 h-4 text-theme-accent-primary bg-theme-bg-secondary border-theme-border-primary rounded"
            />
          </label>
        </div>
      </div>
    </div>
  )
}

export default GeneralSettings