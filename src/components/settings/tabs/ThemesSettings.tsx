import React, { useState } from 'react'
import { useSettingsService, useSetting } from '../../../hooks/useSettingsService'
import { Icons } from '../../Icons'
import { LivePreviewControls } from '../LivePreview'

const ThemesSettings: React.FC = () => {
  const {
    settings,
    setSetting,
    previewSetting,
    clearPreview,
    schemas,
    errors
  } = useSettingsService({ category: 'themes' })

  const [previewingKeys, setPreviewingKeys] = useState<Set<string>>(new Set())
  const [pendingChanges, setPendingChanges] = useState<Record<string, any>>({})

  // Get schema options for themes - usando los nombres correctos del schema
  const themeSchema = schemas.find(s => s.key === 'theme')
  const themes = themeSchema?.options || []

  const syntaxThemeSchema = schemas.find(s => s.key === 'syntaxTheme')
  const syntaxThemes = syntaxThemeSchema?.options || []

  const previewThemeSchema = schemas.find(s => s.key === 'previewTheme')
  const previewThemes = previewThemeSchema?.options || []

  const getIcon = (iconName: string) => {
    const Icon = Icons[iconName as keyof typeof Icons]
    return Icon ? <Icon size={16} /> : null
  }

  const handleThemeChange = async (key: string, value: any, preview = true) => {
    try {
      if (preview && (key === 'theme' || key === 'editorFontSize' || key === 'lineHeight')) {
        await previewSetting(key, value)
        setPreviewingKeys(prev => new Set(prev).add(key))
        setPendingChanges(prev => ({ ...prev, [key]: value }))
      } else {
        await setSetting(key, value)
      }
    } catch (error) {
      console.error(`Failed to update ${key}:`, error)
    }
  }

  const applyPreview = async (key: string) => {
    if (pendingChanges[key] !== undefined) {
      await setSetting(key, pendingChanges[key])
      setPreviewingKeys(prev => {
        const newSet = new Set(prev)
        newSet.delete(key)
        return newSet
      })
      setPendingChanges(prev => {
        const newChanges = { ...prev }
        delete newChanges[key]
        return newChanges
      })
    }
  }

  const cancelPreview = async (key: string) => {
    await clearPreview(key)
    setPreviewingKeys(prev => {
      const newSet = new Set(prev)
      newSet.delete(key)
      return newSet
    })
    setPendingChanges(prev => {
      const newChanges = { ...prev }
      delete newChanges[key]
      return newChanges
    })
  }

  return (
    <div className="space-y-8">
      {/* Live Preview Controls */}
      {previewingKeys.size > 0 && (
        <div className="mb-6 p-4 bg-theme-accent-primary/10 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-theme-text-secondary">
              {previewingKeys.size} settings in preview mode
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  previewingKeys.forEach(key => applyPreview(key))
                }}
                className="px-3 py-1 text-xs bg-theme-accent-primary text-white rounded hover:opacity-90"
              >
                Apply All
              </button>
              <button
                onClick={() => {
                  previewingKeys.forEach(key => cancelPreview(key))
                }}
                className="px-3 py-1 text-xs bg-theme-bg-secondary text-theme-text-primary rounded hover:bg-theme-bg-tertiary"
              >
                Cancel All
              </button>
            </div>
          </div>
        </div>
      )}

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
                  (pendingChanges.theme || settings.theme) === theme.value
                    ? 'border-theme-accent-primary bg-theme-accent-primary/10'
                    : 'border-theme-border-primary hover:border-theme-border-secondary'
                }
                ${
                  previewingKeys.has('theme') && pendingChanges.theme === theme.value
                    ? 'ring-2 ring-blue-500 ring-opacity-50'
                    : ''
                }
              `}
            >
              <div className={`w-6 h-6 ${
                (pendingChanges.theme || settings.theme) === theme.value ? 'text-theme-accent-primary' : 'text-theme-text-muted'
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
              onClick={() => handleThemeChange('syntaxTheme', theme.value, false)}
              className={`
                p-3 rounded-lg border transition-all text-left
                ${
                  settings.syntaxTheme === theme.value
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
              onClick={() => handleThemeChange('previewTheme', theme.value, false)}
              className={`
                p-3 rounded-lg border transition-all text-left
                ${
                  settings.previewTheme === theme.value
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
                value={pendingChanges.editorFontSize !== undefined ? pendingChanges.editorFontSize : (settings.editorFontSize || 14)}
                onChange={(e) => handleThemeChange('editorFontSize', parseInt(e.target.value))}
                className="flex-1 h-2 bg-theme-bg-tertiary rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-xs text-theme-text-muted">20px</span>
              <span className="text-sm font-medium text-theme-text-primary w-12">
                {pendingChanges.editorFontSize !== undefined ? pendingChanges.editorFontSize : (settings.editorFontSize || 14)}px
              </span>
            </div>
            {previewingKeys.has('editorFontSize') && (
              <LivePreviewControls
                isActive={true}
                onApply={() => applyPreview('editorFontSize')}
                onRevert={() => cancelPreview('editorFontSize')}
                className="mt-2"
              />
            )}
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
                value={pendingChanges.lineHeight !== undefined ? pendingChanges.lineHeight : (settings.lineHeight || 1.6)}
                onChange={(e) => handleThemeChange('lineHeight', parseFloat(e.target.value))}
                className="flex-1 h-2 bg-theme-bg-tertiary rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-xs text-theme-text-muted">2.0</span>
              <span className="text-sm font-medium text-theme-text-primary w-12">
                {pendingChanges.lineHeight !== undefined ? pendingChanges.lineHeight : (settings.lineHeight || 1.6)}
              </span>
            </div>
            {previewingKeys.has('lineHeight') && (
              <LivePreviewControls
                isActive={true}
                onApply={() => applyPreview('lineHeight')}
                onRevert={() => cancelPreview('lineHeight')}
                className="mt-2"
              />
            )}
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
                checked={settings.customCSSEnabled || false}
                onChange={(e) => handleThemeChange('customCSSEnabled', e.target.checked, false)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-theme-bg-tertiary peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-theme-accent-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-theme-accent-primary"></div>
            </label>
          </div>

          {settings.customCSSEnabled && (
            <div>
              <label className="block text-sm font-medium text-theme-text-secondary mb-2">
                Custom CSS
              </label>
              <textarea
                value={settings.customCSS || ''}
                onChange={(e) => handleThemeChange('customCSS', e.target.value, false)}
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