import React, { useState, useEffect } from 'react'
import { useAppStore } from '../../../stores/newSimpleStore'
import { Icons } from '../../Icons'
import { applyThemeCompletely, type ThemeValue } from '../../../utils/themeUtils'
import { themeLogger } from '../../../utils/logger'

const ThemesSettings: React.FC = () => {
  const { setTheme, updateSettings, settings, loading } = useAppStore()
  const [localSettings, setLocalSettings] = useState<any>({})

  // Sync store settings with local state
  useEffect(() => {
    setLocalSettings(settings)
  }, [settings])

  // Define theme options directly
  const themes = [
    { value: 'light', label: 'Light', icon: 'Sun' },
    { value: 'dark', label: 'Dark', icon: 'Moon' },
    { value: 'solarized', label: 'Solarized', icon: 'Palette' },
    { value: 'hacklab', label: 'Hacklab', icon: 'Monitor' },
    { value: 'system', label: 'System', icon: 'Monitor' }
  ]

  const syntaxThemes = [
    { value: 'default', label: 'Default (follows theme)' },
    { value: 'default-dark', label: 'Default Dark' },
    { value: 'default-light', label: 'Default Light' },
    { value: 'github', label: 'GitHub' },
    { value: 'monokai', label: 'Monokai' },
    { value: 'solarized', label: 'Solarized' },
    { value: 'dracula', label: 'Dracula' },
    { value: 'nord', label: 'Nord' },
    { value: 'one-dark', label: 'One Dark' },
    { value: 'gruvbox', label: 'Gruvbox' }
  ]

  const previewThemes = [
    { value: 'default', label: 'Default (follows theme)' },
    { value: 'default-light', label: 'Default Light' },
    { value: 'default-dark', label: 'Default Dark' },
    { value: 'github', label: 'GitHub' },
    { value: 'minimal', label: 'Minimal' },
    { value: 'academic', label: 'Academic' },
    { value: 'modern', label: 'Modern' }
  ]

  if (loading) {
    return <div className="p-4">Loading theme settings...</div>
  }

  const getIcon = (iconName: string) => {
    const Icon = Icons[iconName as keyof typeof Icons]
    return Icon ? <Icon size={16} /> : null
  }

  const handleThemeChange = async (key: string, value: any) => {
    try {
      themeLogger.group('Theme Change Debug')
      themeLogger.debug('Theme change initiated:', { key, value })
      
      // Update local state immediately for UI responsiveness
      setLocalSettings(prev => ({ ...prev, [key]: value }))
      
      // Update store if it's theme
      if (key === 'theme') {
        themeLogger.debug('Applying theme to DOM and store')
        // Apply theme using centralized utility
        applyThemeCompletely(value as ThemeValue, {
          updateMetaColor: true,
          updateStore: async (theme) => await setTheme(theme)
        })
      } else {
        // For non-theme settings, use updateSettings
        await updateSettings({ [key]: value })
      }
      
      themeLogger.info('Theme change completed successfully:', { key, value })
      themeLogger.groupEnd()
      
    } catch (error) {
      themeLogger.error('Failed to update theme setting:', { key, value, error })
      themeLogger.groupEnd()
    }
  }

  // Removed complex preview functions - simplified for desktop app

  return (
    <div className="space-y-8">
      {/* Removed complex preview controls - simplified for desktop app */}

      {/* UI Theme */}
      <div>
        <h3 className="text-lg font-medium text-theme-text-primary mb-4">
          UI Theme
        </h3>
        
        <div className="grid grid-cols-3 gap-3">
          {themes.map((theme) => (
            <button
              key={theme.value}
              onClick={() => handleThemeChange('theme', theme.value)}
              data-testid={`theme-${theme.value}`}
              className={`
                p-4 rounded-lg border transition-all flex flex-col items-center space-y-2
                ${
                  localSettings.theme === theme.value
                    ? 'border-theme-accent-primary bg-theme-accent-primary/10'
                    : 'border-theme-border-primary hover:border-theme-border-secondary'
                }
              `}
            >
              <div className={`w-6 h-6 ${
                localSettings.theme === theme.value ? 'text-theme-accent-primary' : 'text-theme-text-muted'
              }`}>
                {getIcon(theme.icon)}
              </div>
              <span className="text-sm font-medium text-theme-text-primary">{theme.label}</span>
            </button>
          ))}
        </div>
        
        <p className="mt-3 text-xs text-theme-text-muted">
          System theme automatically switches between light and dark based on your OS preferences
        </p>
      </div>

      {/* Syntax Highlighting Theme */}
      <div>
        <h3 className="text-lg font-medium text-theme-text-primary mb-4">
          Syntax Highlighting
        </h3>
        
        <div className="grid grid-cols-2 gap-3">
          {syntaxThemes.map((theme) => (
            <button
              key={theme.value}
              onClick={() => handleThemeChange('syntaxTheme', theme.value)}
              className={`
                p-3 rounded-lg border transition-all text-left
                ${
                  localSettings.syntaxTheme === theme.value
                    ? 'border-theme-accent-primary bg-theme-accent-primary/10'
                    : 'border-theme-border-primary hover:border-theme-border-secondary'
                }
              `}
            >
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-theme-text-primary">{theme.label}</span>
              </div>
            </button>
          ))}
        </div>
        
        <p className="mt-3 text-xs text-theme-text-muted">
          Choose the color scheme for code blocks and syntax highlighting in your notes
        </p>
      </div>

      {/* Preview Theme */}
      <div>
        <h3 className="text-lg font-medium text-theme-text-primary mb-4">
          Preview Theme
        </h3>
        
        <div className="grid grid-cols-2 gap-3">
          {previewThemes.map((theme) => (
            <button
              key={theme.value}
              onClick={() => handleThemeChange('previewTheme', theme.value)}
              className={`
                p-3 rounded-lg border transition-all text-left
                ${
                  localSettings.previewTheme === theme.value
                    ? 'border-theme-accent-primary bg-theme-accent-primary/10'
                    : 'border-theme-border-primary hover:border-theme-border-secondary'
                }
              `}
            >
              <span className="text-sm font-medium text-theme-text-primary">{theme.label}</span>
            </button>
          ))}
        </div>
        
        <p className="mt-3 text-xs text-theme-text-muted">
          Set the styling theme for note preview and rendered markdown
        </p>
      </div>

      {/* Font Settings */}
      <div>
        <h3 className="text-lg font-medium text-theme-text-primary mb-4">
          Typography
        </h3>
        
        <div className="space-y-6">
          {/* Font Size */}
          <div>
            <label className="block text-sm font-medium text-theme-text-secondary mb-2">
              Font Size
            </label>
            <div className="flex items-center space-x-4">
              <span className="text-xs text-theme-text-muted">12px</span>
              <input
                type="range"
                min="12"
                max="20"
                value={localSettings.editorFontSize || 14}
                onChange={(e) => handleThemeChange('editorFontSize', parseInt(e.target.value))}
                className="flex-1 h-2 bg-theme-bg-tertiary rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-xs text-theme-text-muted">20px</span>
              <span className="text-sm font-medium text-theme-text-primary w-12">
                {localSettings.editorFontSize || 14}px
              </span>
            </div>
          </div>

          {/* Line Height */}
          <div>
            <label className="block text-sm font-medium text-theme-text-secondary mb-2">
              Line Height
            </label>
            <div className="flex items-center space-x-4">
              <span className="text-xs text-theme-text-muted">1.2</span>
              <input
                type="range"
                min="1.2"
                max="2.0"
                step="0.1"
                value={localSettings.lineHeight || 1.6}
                onChange={(e) => handleThemeChange('lineHeight', parseFloat(e.target.value))}
                className="flex-1 h-2 bg-theme-bg-tertiary rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-xs text-theme-text-muted">2.0</span>
              <span className="text-sm font-medium text-theme-text-primary w-12">
                {localSettings.lineHeight || 1.6}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS */}
      <div>
        <h3 className="text-lg font-medium text-theme-text-primary mb-4">
          Custom Styling
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-theme-text-primary">
                Enable Custom CSS
              </h4>
              <p className="text-xs text-theme-text-muted mt-1">
                Apply custom CSS to personalize your interface
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={localSettings.customCSSEnabled || false}
                onChange={(e) => handleThemeChange('customCSSEnabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-theme-bg-tertiary peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-theme-accent-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-theme-accent-primary"></div>
            </label>
          </div>

          {localSettings.customCSSEnabled && (
            <div>
              <label className="block text-sm font-medium text-theme-text-secondary mb-2">
                Custom CSS
              </label>
              <textarea
                value={localSettings.customCSS || ''}
                onChange={(e) => handleThemeChange('customCSS', e.target.value)}
                placeholder="/* Add your custom CSS here */\n.note-content {\n  /* Custom styles */\n}"
                className="w-full h-32 px-3 py-2 bg-theme-bg-secondary border border-theme-border-primary rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-theme-accent-primary resize-none"
              />
              <p className="mt-1 text-xs text-theme-text-muted">
                CSS will be applied to the note editor and preview
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ThemesSettings