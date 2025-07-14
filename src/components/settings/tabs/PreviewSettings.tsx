import React from 'react'
import { useAppStore } from '../../../stores/newSimpleStore'
import Icons from '../../Icons'

const PreviewSettings: React.FC = () => {
  const { settings, updateSettings } = useAppStore()

  const codeBlockThemes = [
    { value: 'github', label: 'GitHub' },
    { value: 'tomorrow', label: 'Tomorrow' },
    { value: 'atom-one-dark', label: 'Atom One Dark' },
    { value: 'vs', label: 'Visual Studio' },
    { value: 'dracula', label: 'Dracula' },
  ]

  const mathRenderers = [
    { value: 'katex', label: 'KaTeX (Recommended)' },
    { value: 'mathjax', label: 'MathJax' },
    { value: 'disabled', label: 'Disabled' },
  ]

  return (
    <div className="space-y-8">
      {/* General Preview Settings */}
      <div>
        <h3 className="text-lg font-medium text-theme-text-primary mb-4">
          General
        </h3>
        
        <div className="space-y-6">
          {/* Auto Preview */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-theme-text-primary">
                Auto Preview
              </h4>
              <p className="text-xs text-theme-text-muted mt-1">
                Automatically show preview when opening notes
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoPreview || true}
                onChange={(e) => updateSettings({ autoPreview: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-theme-bg-tertiary peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-theme-accent-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-theme-accent-primary"></div>
            </label>
          </div>

          {/* Sync Scroll */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-theme-text-primary">
                Sync Scroll
              </h4>
              <p className="text-xs text-theme-text-muted mt-1">
                Synchronize scrolling between editor and preview
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.syncScroll || true}
                onChange={(e) => updateSettings({ syncScroll: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-theme-bg-tertiary peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-theme-accent-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-theme-accent-primary"></div>
            </label>
          </div>

          {/* Break on Single Newline */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-theme-text-primary">
                Break on Single Newline
              </h4>
              <p className="text-xs text-theme-text-muted mt-1">
                Treat single line breaks as paragraph breaks
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.breakOnSingleNewline || false}
                onChange={(e) => updateSettings({ breakOnSingleNewline: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-theme-bg-tertiary peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-theme-accent-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-theme-accent-primary"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Typography */}
      <div>
        <h3 className="text-lg font-medium text-theme-text-primary mb-4">
          Typography
        </h3>
        
        <div className="space-y-6">
          {/* Preview Font Size */}
          <div>
            <label className="block text-sm font-medium text-theme-text-secondary mb-2">
              Preview Font Size
            </label>
            <div className="flex items-center space-x-4">
              <span className="text-xs text-theme-text-muted">12px</span>
              <input
                type="range"
                min="12"
                max="24"
                value={settings.previewFontSize || 16}
                onChange={(e) => updateSettings({ previewFontSize: parseInt(e.target.value) })}
                className="flex-1 h-2 bg-theme-bg-tertiary rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-xs text-theme-text-muted">24px</span>
              <span className="text-sm font-medium text-theme-text-primary w-12">
                {settings.previewFontSize || 16}px
              </span>
            </div>
          </div>

          {/* Preview Line Height */}
          <div>
            <label className="block text-sm font-medium text-theme-text-secondary mb-2">
              Preview Line Height
            </label>
            <div className="flex items-center space-x-4">
              <span className="text-xs text-theme-text-muted">1.2</span>
              <input
                type="range"
                min="1.2"
                max="2.0"
                step="0.1"
                value={settings.previewLineHeight || 1.7}
                onChange={(e) => updateSettings({ previewLineHeight: parseFloat(e.target.value) })}
                className="flex-1 h-2 bg-theme-bg-tertiary rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-xs text-theme-text-muted">2.0</span>
              <span className="text-sm font-medium text-theme-text-primary w-12">
                {settings.previewLineHeight || 1.7}
              </span>
            </div>
          </div>

          {/* Preview Max Width */}
          <div>
            <label className="block text-sm font-medium text-theme-text-secondary mb-2">
              Preview Max Width (pixels)
            </label>
            <div className="flex items-center space-x-4">
              <span className="text-xs text-theme-text-muted">600px</span>
              <input
                type="range"
                min="600"
                max="1200"
                step="50"
                value={settings.previewMaxWidth || 800}
                onChange={(e) => updateSettings({ previewMaxWidth: parseInt(e.target.value) })}
                className="flex-1 h-2 bg-theme-bg-tertiary rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-xs text-theme-text-muted">1200px</span>
              <span className="text-sm font-medium text-theme-text-primary w-16">
                {settings.previewMaxWidth || 800}px
              </span>
            </div>
            <p className="mt-1 text-xs text-theme-text-muted">
              Maximum width of the preview content for better readability
            </p>
          </div>
        </div>
      </div>

      {/* Code Blocks */}
      <div>
        <h3 className="text-lg font-medium text-theme-text-primary mb-4">
          Code Blocks
        </h3>
        
        <div className="space-y-6">
          {/* Code Block Theme */}
          <div>
            <label className="block text-sm font-medium text-theme-text-secondary mb-2">
              Code Block Theme
            </label>
            <select
              value={settings.codeBlockTheme || 'github'}
              onChange={(e) => updateSettings({ codeBlockTheme: e.target.value })}
              className="w-full px-3 py-2 bg-theme-bg-secondary border border-theme-border-primary rounded-md text-sm text-theme-text-primary focus:outline-none focus:ring-2 focus:ring-theme-accent-primary"
            >
              {codeBlockThemes.map((theme) => (
                <option key={theme.value} value={theme.value} className="bg-theme-bg-secondary text-theme-text-primary">
                  {theme.label}
                </option>
              ))}
            </select>
          </div>

          {/* Show Line Numbers in Code */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-theme-text-primary">
                Show Line Numbers in Code Blocks
              </h4>
              <p className="text-xs text-theme-text-muted mt-1">
                Display line numbers in code blocks
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.showCodeLineNumbers || false}
                onChange={(e) => updateSettings({ showCodeLineNumbers: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-theme-bg-tertiary peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-theme-accent-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-theme-accent-primary"></div>
            </label>
          </div>

          {/* Copy Code Button */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-theme-text-primary">
                Show Copy Code Button
              </h4>
              <p className="text-xs text-theme-text-muted mt-1">
                Add a copy button to code blocks
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.showCopyCodeButton || true}
                onChange={(e) => updateSettings({ showCopyCodeButton: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-theme-bg-tertiary peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-theme-accent-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-theme-accent-primary"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Math & Diagrams */}
      <div>
        <h3 className="text-lg font-medium text-theme-text-primary mb-4">
          Math & Diagrams
        </h3>
        
        <div className="space-y-6">
          {/* Math Renderer */}
          <div>
            <label className="block text-sm font-medium text-theme-text-secondary mb-2">
              Math Renderer
            </label>
            <select
              value={settings.mathRenderer || 'katex'}
              onChange={(e) => updateSettings({ mathRenderer: e.target.value })}
              className="w-full px-3 py-2 bg-theme-bg-secondary border border-theme-border-primary rounded-md text-sm text-theme-text-primary focus:outline-none focus:ring-2 focus:ring-theme-accent-primary"
            >
              {mathRenderers.map((renderer) => (
                <option key={renderer.value} value={renderer.value} className="bg-theme-bg-secondary text-theme-text-primary">
                  {renderer.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-theme-text-muted">
              Choose how mathematical equations are rendered
            </p>
          </div>

          {/* Mermaid Diagrams */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-theme-text-primary">
                Enable Mermaid Diagrams
              </h4>
              <p className="text-xs text-theme-text-muted mt-1">
                Render Mermaid diagrams and flowcharts
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableMermaid || true}
                onChange={(e) => updateSettings({ enableMermaid: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-theme-bg-tertiary peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-theme-accent-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-theme-accent-primary"></div>
            </label>
          </div>

          {/* PlantUML Diagrams */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-theme-text-primary">
                Enable PlantUML Diagrams
              </h4>
              <p className="text-xs text-theme-text-muted mt-1">
                Render PlantUML diagrams
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enablePlantUML || false}
                onChange={(e) => updateSettings({ enablePlantUML: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-theme-bg-tertiary peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-theme-accent-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-theme-accent-primary"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Advanced */}
      <div>
        <h3 className="text-lg font-medium text-theme-text-primary mb-4">
          Advanced
        </h3>
        
        <div className="space-y-6">
          {/* Sanitize HTML */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-theme-text-primary">
                Sanitize HTML
              </h4>
              <p className="text-xs text-theme-text-muted mt-1">
                Remove potentially unsafe HTML elements
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.sanitizeHTML || true}
                onChange={(e) => updateSettings({ sanitizeHTML: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-theme-bg-tertiary peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-theme-accent-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-theme-accent-primary"></div>
            </label>
          </div>

          {/* Enable Task Lists */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-theme-text-primary">
                Enable Task Lists
              </h4>
              <p className="text-xs text-theme-text-muted mt-1">
                Support interactive checkboxes in task lists
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableTaskLists || true}
                onChange={(e) => updateSettings({ enableTaskLists: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-theme-bg-tertiary peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-theme-accent-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-theme-accent-primary"></div>
            </label>
          </div>

          {/* Table of Contents */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-theme-text-primary">
                Auto-generate Table of Contents
              </h4>
              <p className="text-xs text-theme-text-muted mt-1">
                Automatically create TOC from headings
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoGenerateTOC || false}
                onChange={(e) => updateSettings({ autoGenerateTOC: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-theme-bg-tertiary peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-theme-accent-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-theme-accent-primary"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PreviewSettings