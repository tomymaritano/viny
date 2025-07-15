import React, { useState } from 'react'
import { useAppStore } from '../../../stores/newSimpleStore'
import Icons from '../../Icons'
import { useLivePreview } from '../../../hooks/useLivePreview'
import LivePreviewControls from '../../ui/LivePreviewControls'

const ThemesSettings: React.FC = () => {
  const { settings, updateSettings } = useAppStore()
  const [showPreviewDetails, setShowPreviewDetails] = useState(false)

  // Live preview for theme changes
  const {
    isPreviewActive,
    startPreview,
    applyPreview,
    revertPreview,
    cancelPreview,
    getEffectiveValue,
    isKeyModified,
    getPreviewStatus
  } = useLivePreview(['uiTheme', 'syntaxTheme', 'previewTheme'], {
    previewDelay: 150,
    resetDelay: 5000,
    autoRevert: true
  })

  const previewStatus = getPreviewStatus()

  const uiThemes = [
    { value: 'light', label: 'Light', icon: 'Sun' },
    { value: 'dark', label: 'Dark', icon: 'Moon' },
    { value: 'solarized', label: 'Solarized', icon: 'Monitor' },
    { value: 'system', label: 'System', icon: 'Monitor' },
  ]

  const syntaxThemes = [
    { value: 'default-dark', label: 'Default Dark', preview: '#1e1e1e' },
    { value: 'default-light', label: 'Default Light', preview: '#ffffff' },
    { value: 'github', label: 'GitHub', preview: '#f6f8fa' },
    { value: 'monokai', label: 'Monokai', preview: '#272822' },
    { value: 'solarized', label: 'Solarized', preview: '#002b36' },
    { value: 'dracula', label: 'Dracula', preview: '#282a36' },
  ]

  const previewThemes = [
    { value: 'github', label: 'GitHub' },
    { value: 'minimal', label: 'Minimal' },
    { value: 'academic', label: 'Academic' },
    { value: 'modern', label: 'Modern' },
  ]

  const getIcon = (iconName: string) => {
    const Icon = Icons[iconName as keyof typeof Icons]
    return Icon ? <Icon size={16} /> : null
  }

  return (
    <div className="space-y-8">
      {/* Live Preview Controls */}
      <LivePreviewControls
        isActive={isPreviewActive}
        modifiedCount={previewStatus.modifiedCount}
        modifiedKeys={previewStatus.modifiedKeys}
        onApply={applyPreview}
        onRevert={revertPreview}
        onCancel={cancelPreview}
        showDetails={showPreviewDetails}
      />

      {/* UI Theme */}
      <div>
        <h3 className="text-lg font-medium text-theme-text-primary mb-4">
          UI Theme
        </h3>
        
        <div className="grid grid-cols-3 gap-3">
          {uiThemes.map((theme) => (
            <button
              key={theme.value}
              onClick={() => startPreview('uiTheme', theme.value)}
              className={`
                p-4 rounded-lg border transition-all flex flex-col items-center space-y-2
                ${
                  getEffectiveValue('uiTheme') === theme.value
                    ? 'border-theme-accent-primary bg-theme-accent-primary/10'
                    : 'border-theme-border-primary hover:border-theme-border-secondary'
                }
                ${
                  isKeyModified('uiTheme') && getEffectiveValue('uiTheme') === theme.value
                    ? 'ring-2 ring-blue-500 ring-opacity-50'
                    : ''
                }
              `}
            >
              <div className={`w-6 h-6 ${
                getEffectiveValue('uiTheme') === theme.value ? 'text-theme-accent-primary' : 'text-theme-text-muted'
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
              onClick={() => updateSettings({ syntaxTheme: theme.value })}
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
                <div 
                  className="w-4 h-4 rounded border border-theme-border-primary"
                  style={{ backgroundColor: theme.preview }}
                />
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
              onClick={() => updateSettings({ previewTheme: theme.value })}
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
                value={settings.fontSize || 14}
                onChange={(e) => updateSettings({ fontSize: parseInt(e.target.value) })}
                className="flex-1 h-2 bg-theme-bg-tertiary rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-xs text-theme-text-muted">20px</span>
              <span className="text-sm font-medium text-theme-text-primary w-12">
                {settings.fontSize || 14}px
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
                value={settings.lineHeight || 1.6}
                onChange={(e) => updateSettings({ lineHeight: parseFloat(e.target.value) })}
                className="flex-1 h-2 bg-theme-bg-tertiary rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-xs text-theme-text-muted">2.0</span>
              <span className="text-sm font-medium text-theme-text-primary w-12">
                {settings.lineHeight || 1.6}
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
                checked={settings.customCSSEnabled || false}
                onChange={(e) => updateSettings({ customCSSEnabled: e.target.checked })}
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
                onChange={(e) => updateSettings({ customCSS: e.target.value })}
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