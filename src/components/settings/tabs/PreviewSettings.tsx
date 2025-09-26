import React from 'react'
import { useSettings } from '../../../hooks/useSettings'
import { Icons } from '../../Icons'
import { SliderWithLabels } from '../../ui/SliderRadix'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/SelectRadix'
import { SwitchWithLabel } from '../../ui/SwitchRadix'

const PreviewSettings: React.FC = () => {
  const { settings, setSetting, error } = useSettings()

  // Static schema options (temporary fix)
  const previewThemes = [
    { value: 'github', label: 'GitHub' },
    { value: 'github-dark', label: 'GitHub Dark' },
    { value: 'default', label: 'Default' },
  ]

  const codeThemes = [
    { value: 'github', label: 'GitHub' },
    { value: 'monokai', label: 'Monokai' },
    { value: 'dracula', label: 'Dracula' },
    { value: 'nord', label: 'Nord' },
  ]

  const mathEngines = [
    { value: 'katex', label: 'KaTeX' },
    { value: 'mathjax', label: 'MathJax' },
  ]

  const tocPositions = [
    { value: 'left', label: 'Left' },
    { value: 'right', label: 'Right' },
    { value: 'none', label: 'None' },
  ]

  const renderToggle = (key: string, label: string, description: string) => {
    const value = settings[key] ?? false

    return (
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium text-theme-text-primary">
            {label}
          </h4>
          <p className="text-xs text-theme-text-muted mt-1">{description}</p>
        </div>
        <SwitchWithLabel
          checked={value as boolean}
          onCheckedChange={checked => setSetting(key, checked)}
        />
      </div>
    )
  }

  const renderNumberInput = (
    key: string,
    label: string,
    description?: string
  ) => {
    const value = settings[key] ?? 0

    return (
      <div>
        <SliderWithLabels
          label={label}
          description={description}
          value={[value as number]}
          min={0}
          max={100}
          step={1}
          showValue={true}
          showRange={true}
          formatValue={val => String(val)}
          onValueChange={values =>
            setSetting(key, parseFloat(values[0].toString()))
          }
          className="w-full"
        />
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
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
          {renderToggle(
            'syncScrolling',
            'Sync Scrolling',
            'Synchronize scrolling between editor and preview'
          )}

          <div>
            <label className="block text-sm font-medium text-theme-text-secondary mb-2">
              Preview Mode
            </label>
            <Select
              value={settings.previewMode || 'live'}
              onValueChange={value => setSetting('previewMode', value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select preview mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="live">Live Preview</SelectItem>
                <SelectItem value="manual">Manual Refresh</SelectItem>
                <SelectItem value="off">Disabled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {settings.previewMode === 'live' &&
            renderNumberInput(
              'previewDelay',
              'Preview Delay (ms)',
              'Delay before updating preview in live mode'
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
            <Select
              value={settings.previewTheme || 'github'}
              onValueChange={value => setSetting('previewTheme', value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select preview theme" />
              </SelectTrigger>
              <SelectContent>
                {previewThemes.map(theme => (
                  <SelectItem key={theme.value} value={theme.value}>
                    {theme.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Math & Diagrams */}
          {renderToggle(
            'renderMath',
            'Render Math',
            'Render LaTeX math expressions in preview'
          )}

          {settings.renderMath && (
            <div>
              <label className="block text-sm font-medium text-theme-text-secondary mb-2">
                Math Engine
              </label>
              <Select
                value={settings.mathEngine || 'katex'}
                onValueChange={value => setSetting('mathEngine', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select math engine" />
                </SelectTrigger>
                <SelectContent>
                  {mathEngines.map(engine => (
                    <SelectItem key={engine.value} value={engine.value}>
                      {engine.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {renderToggle(
            'renderMermaid',
            'Render Mermaid Diagrams',
            'Render Mermaid diagrams in preview'
          )}

          {/* Code Highlighting */}
          {renderToggle(
            'codeHighlighting',
            'Code Highlighting',
            'Syntax highlighting for code blocks'
          )}

          {settings.codeHighlighting && (
            <>
              <div>
                <label className="block text-sm font-medium text-theme-text-secondary mb-2">
                  Code Theme
                </label>
                <Select
                  value={settings.codeTheme || 'github'}
                  onValueChange={value => setSetting('codeTheme', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select code theme" />
                  </SelectTrigger>
                  <SelectContent>
                    {codeThemes.map(theme => (
                      <SelectItem key={theme.value} value={theme.value}>
                        {theme.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {renderToggle(
                'showLineNumbers',
                'Show Line Numbers in Code',
                'Display line numbers in code blocks'
              )}
              {renderToggle(
                'copyCodeButton',
                'Copy Code Button',
                'Show copy button on code blocks'
              )}
            </>
          )}

          {/* Table of Contents */}
          {renderToggle(
            'tableOfContents',
            'Table of Contents',
            'Auto-generate table of contents from headings'
          )}

          {settings.tableOfContents && (
            <div>
              <label className="block text-sm font-medium text-theme-text-secondary mb-2">
                TOC Position
              </label>
              <Select
                value={settings.tocPosition || 'top'}
                onValueChange={value => setSetting('tocPosition', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select TOC position" />
                </SelectTrigger>
                <SelectContent>
                  {tocPositions.map(position => (
                    <SelectItem key={position.value} value={position.value}>
                      {position.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
          {renderNumberInput(
            'previewFontSize',
            'Font Size',
            'Font size for preview content'
          )}
          {renderNumberInput(
            'previewLineHeight',
            'Line Height',
            'Line height for preview content'
          )}
          {renderToggle(
            'printStyles',
            'Print-Optimized Styles',
            'Use print-friendly styles when printing'
          )}
        </div>
      </div>

      {/* Links & Images */}
      <div>
        <h3 className="text-lg font-medium text-theme-text-primary mb-4">
          Links & Images
        </h3>

        <div className="space-y-6">
          {renderToggle(
            'linkPreview',
            'Link Preview',
            'Show preview tooltips for internal links'
          )}
          {renderToggle(
            'imageZoom',
            'Image Zoom',
            'Allow zooming images in preview'
          )}
          {renderToggle(
            'embedEnabled',
            'Enable Embeds',
            'Show embedded content (videos, tweets, etc.)'
          )}
        </div>
      </div>

      {/* Advanced */}
      <div>
        <h3 className="text-lg font-medium text-theme-text-primary mb-4">
          Advanced
        </h3>

        <div className="space-y-6">
          {renderToggle(
            'allowHTML',
            'Allow HTML',
            'Render HTML tags in markdown (security risk)'
          )}

          {settings.allowHTML &&
            renderToggle(
              'sanitizeHTML',
              'Sanitize HTML',
              'Remove potentially dangerous HTML content'
            )}

          {/* Export Quality */}
          <div>
            <label className="block text-sm font-medium text-theme-text-secondary mb-2">
              Export Quality
            </label>
            <Select
              value={settings.exportQuality || 'high'}
              onValueChange={value => setSetting('exportQuality', value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select export quality" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low (Fast)</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High (Slow)</SelectItem>
              </SelectContent>
            </Select>
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
