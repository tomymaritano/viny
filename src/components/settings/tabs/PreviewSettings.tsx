import React from 'react'
import { useSettingsService } from '../../../hooks/useSettingsService'
import { Icons } from '../../Icons'

const PreviewSettings: React.FC = () => {
  const {
    settings,
    setSetting,
    schemas,
    errors
  } = useSettingsService({ category: 'preview' })

  // Get schema options
  const previewThemeSchema = schemas.find(s => s.key === 'previewTheme')
  const previewThemes = previewThemeSchema?.options || []

  const codeThemeSchema = schemas.find(s => s.key === 'codeTheme')
  const codeThemes = codeThemeSchema?.options || []

  const mathEngineSchema = schemas.find(s => s.key === 'mathEngine')
  const mathEngines = mathEngineSchema?.options || []

  const tocPositionSchema = schemas.find(s => s.key === 'tocPosition')
  const tocPositions = tocPositionSchema?.options || []

  const renderToggle = (key: string, label: string, description: string) => {
    const schema = schemas.find(s => s.key === key)
    const value = settings[key] ?? schema?.defaultValue ?? false
    
    return (
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium text-theme-text-primary">
            {label}
          </h4>
          <p className="text-xs text-theme-text-muted mt-1">
            {description}
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={value as boolean}
            onChange={(e) => setSetting(key, e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-theme-bg-tertiary peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-theme-accent-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-theme-accent-primary"></div>
        </label>
      </div>
    )
  }

  const renderNumberInput = (key: string, label: string, description?: string) => {
    const schema = schemas.find(s => s.key === key)
    const value = settings[key] ?? schema?.defaultValue ?? 0
    
    if (!schema) {
      return (
        <div>
          <label className="block text-sm font-medium text-theme-text-secondary mb-2">
            {label}
          </label>
          <p className="text-xs text-red-500">Schema not found for key: {key}</p>
          <p className="text-xs text-theme-text-muted">Available: {schemas.map(s => s.key).join(', ')}</p>
        </div>
      )
    }
    
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
            onChange={(e) => setSetting(key, parseFloat(e.target.value))}
            className="flex-1 h-2 bg-theme-bg-tertiary rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-xs text-theme-text-muted">{schema?.max}</span>
          <span className="text-sm font-medium text-theme-text-primary w-12">
            {value}
          </span>
        </div>
        {errors[key] && (
          <p className="mt-1 text-xs text-red-500">{errors[key]}</p>
        )}
      </div>
    )
  }

  const getIcon = (iconName?: string) => {
    if (!iconName) return null
    const Icon = Icons[iconName as keyof typeof Icons]
    return Icon ? <Icon size={16} /> : null
  }

  return (
    <div className="space-y-8">
      {/* Live Preview */}
      <div>
        <h3 className="text-lg font-medium text-theme-text-primary mb-4">
          Live Preview
        </h3>
        
        <div className="space-y-6">
          {renderToggle('syncScrolling', 'Sync Scrolling', 'Synchronize scrolling between editor and preview')}
          
          <div>
            <label className="block text-sm font-medium text-theme-text-secondary mb-2">
              Preview Mode
            </label>
            <select
              value={settings.previewMode || 'live'}
              onChange={(e) => setSetting('previewMode', e.target.value)}
              className="w-full px-3 py-2 bg-theme-bg-secondary border border-theme-border-primary rounded-md text-sm text-theme-text-primary focus:outline-none focus:ring-2 focus:ring-theme-accent-primary"
            >
              <option value="live">Live Preview</option>
              <option value="manual">Manual Refresh</option>
              <option value="off">Disabled</option>
            </select>
          </div>
          
          {settings.previewMode === 'live' && (
            renderNumberInput('previewDelay', 'Preview Delay (ms)', 'Delay before updating preview in live mode')
          )}
        </div>
      </div>

      {/* Rendering Options */}
      <div>
        <h3 className="text-lg font-medium text-theme-text-primary mb-4">
          Rendering Options
        </h3>
        
        <div className="space-y-6">
          {/* Preview Theme */}
          <div>
            <label className="block text-sm font-medium text-theme-text-secondary mb-2">
              Preview Theme
            </label>
            <select
              value={settings.previewTheme || 'github'}
              onChange={(e) => setSetting('previewTheme', e.target.value)}
              className="w-full px-3 py-2 bg-theme-bg-secondary border border-theme-border-primary rounded-md text-sm text-theme-text-primary focus:outline-none focus:ring-2 focus:ring-theme-accent-primary"
            >
              {previewThemes.map((theme) => (
                <option key={theme.value} value={theme.value} className="bg-theme-bg-secondary text-theme-text-primary">
                  {theme.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* Math & Diagrams */}
          {renderToggle('renderMath', 'Render Math', 'Render LaTeX math expressions in preview')}
          
          {settings.renderMath && (
            <div>
              <label className="block text-sm font-medium text-theme-text-secondary mb-2">
                Math Engine
              </label>
              <select
                value={settings.mathEngine || 'katex'}
                onChange={(e) => setSetting('mathEngine', e.target.value)}
                className="w-full px-3 py-2 bg-theme-bg-secondary border border-theme-border-primary rounded-md text-sm text-theme-text-primary focus:outline-none focus:ring-2 focus:ring-theme-accent-primary"
              >
                {mathEngines.map((engine) => (
                  <option key={engine.value} value={engine.value} className="bg-theme-bg-secondary text-theme-text-primary">
                    {engine.label}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          {renderToggle('renderMermaid', 'Render Mermaid Diagrams', 'Render Mermaid diagrams in preview')}
          
          {/* Code Highlighting */}
          {renderToggle('codeHighlighting', 'Code Highlighting', 'Syntax highlighting for code blocks')}
          
          {settings.codeHighlighting && (
            <>
              <div>
                <label className="block text-sm font-medium text-theme-text-secondary mb-2">
                  Code Theme
                </label>
                <select
                  value={settings.codeTheme || 'github'}
                  onChange={(e) => setSetting('codeTheme', e.target.value)}
                  className="w-full px-3 py-2 bg-theme-bg-secondary border border-theme-border-primary rounded-md text-sm text-theme-text-primary focus:outline-none focus:ring-2 focus:ring-theme-accent-primary"
                >
                  {codeThemes.map((theme) => (
                    <option key={theme.value} value={theme.value} className="bg-theme-bg-secondary text-theme-text-primary">
                      {theme.label}
                    </option>
                  ))}
                </select>
              </div>
              
              {renderToggle('showLineNumbers', 'Show Line Numbers in Code', 'Display line numbers in code blocks')}
              {renderToggle('copyCodeButton', 'Copy Code Button', 'Show copy button on code blocks')}
            </>
          )}
          
          {/* Table of Contents */}
          {renderToggle('tableOfContents', 'Table of Contents', 'Auto-generate table of contents from headings')}
          
          {settings.tableOfContents && (
            <div>
              <label className="block text-sm font-medium text-theme-text-secondary mb-2">
                TOC Position
              </label>
              <select
                value={settings.tocPosition || 'top'}
                onChange={(e) => setSetting('tocPosition', e.target.value)}
                className="w-full px-3 py-2 bg-theme-bg-secondary border border-theme-border-primary rounded-md text-sm text-theme-text-primary focus:outline-none focus:ring-2 focus:ring-theme-accent-primary"
              >
                {tocPositions.map((position) => (
                  <option key={position.value} value={position.value} className="bg-theme-bg-secondary text-theme-text-primary">
                    {position.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Typography */}
      <div>
        <h3 className="text-lg font-medium text-theme-text-primary mb-4">
          Typography
        </h3>
        
        <div className="space-y-6">
          {renderNumberInput('previewFontSize', 'Font Size', 'Font size for preview content')}
          {renderNumberInput('previewLineHeight', 'Line Height', 'Line height for preview content')}
          {renderToggle('printStyles', 'Print-Optimized Styles', 'Use print-friendly styles when printing')}
        </div>
      </div>

      {/* Links & Images */}
      <div>
        <h3 className="text-lg font-medium text-theme-text-primary mb-4">
          Links & Images
        </h3>
        
        <div className="space-y-6">
          {renderToggle('linkPreview', 'Link Preview', 'Show preview tooltips for internal links')}
          {renderToggle('imageZoom', 'Image Zoom', 'Allow zooming images in preview')}
          {renderToggle('embedEnabled', 'Enable Embeds', 'Show embedded content (videos, tweets, etc.)')}
        </div>
      </div>

      {/* Advanced */}
      <div>
        <h3 className="text-lg font-medium text-theme-text-primary mb-4">
          Advanced
        </h3>
        
        <div className="space-y-6">
          {renderToggle('allowHTML', 'Allow HTML', 'Render HTML tags in markdown (security risk)')}
          
          {settings.allowHTML && (
            renderToggle('sanitizeHTML', 'Sanitize HTML', 'Remove potentially dangerous HTML content')
          )}
          
          {/* Export Quality */}
          <div>
            <label className="block text-sm font-medium text-theme-text-secondary mb-2">
              Export Quality
            </label>
            <select
              value={settings.exportQuality || 'high'}
              onChange={(e) => setSetting('exportQuality', e.target.value)}
              className="w-full px-3 py-2 bg-theme-bg-secondary border border-theme-border-primary rounded-md text-sm text-theme-text-primary focus:outline-none focus:ring-2 focus:ring-theme-accent-primary"
            >
              <option value="low">Low (Fast)</option>
              <option value="medium">Medium</option>
              <option value="high">High (Slow)</option>
            </select>
            <p className="mt-1 text-xs text-theme-text-muted">
              Quality for PDF and image exports
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PreviewSettings