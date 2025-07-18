import React from 'react'
import { useSettings } from '../../../hooks/useSettings'
import { Icons } from '../../Icons'

const EditingSettings: React.FC = () => {
  const { settings, setSetting } = useSettings()

  // Helper function to convert setting values to appropriate types
  const stringValue = (value: any): string => typeof value === 'string' ? value : ''
  const booleanValue = (value: any): boolean => typeof value === 'boolean' ? value : false
  const numberValue = (value: any): number => typeof value === 'number' ? value : 0

  // Define font family options
  const fontFamilies = [
    { value: 'Inter', label: 'Inter' },
    { value: 'Monaco', label: 'Monaco' },
    { value: 'Menlo', label: 'Menlo' },
    { value: 'Consolas', label: 'Consolas' },
    { value: 'Courier New', label: 'Courier New' },
    { value: 'monospace', label: 'Monospace' }
  ]

  // Define editor mode options
  const editorModes = [
    { value: 'wysiwyg', label: 'WYSIWYG' },
    { value: 'markdown', label: 'Markdown' },
    { value: 'split', label: 'Split View' }
  ]

  const renderToggle = (key: string, label: string, description: string, testId?: string) => {
    const value = booleanValue(settings[key as keyof typeof settings])
    
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
            onChange={(e) => setSetting(key as keyof typeof settings, e.target.checked)}
            className="sr-only peer"
            data-testid={testId}
          />
          <div className="w-11 h-6 bg-theme-bg-tertiary peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-theme-accent-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-theme-accent-primary"></div>
        </label>
      </div>
    )
  }

  const renderNumberInput = (key: string, label: string, testId?: string) => {
    const value = numberValue(settings[key as keyof typeof settings])
    
    // Define min/max values for different settings
    const ranges = {
      editorFontSize: { min: 10, max: 24 },
      lineHeight: { min: 1.0, max: 2.0 },
      tabSize: { min: 2, max: 8 },
      previewFontSize: { min: 10, max: 24 }
    }
    
    const range = ranges[key as keyof typeof ranges] || { min: 0, max: 100 }
    
    return (
      <div>
        <label className="block text-sm font-medium text-theme-text-secondary mb-2">
          {label}
        </label>
        <div className="flex items-center space-x-4">
          <span className="text-xs text-theme-text-muted">{range.min}</span>
          <input
            type="range"
            min={range.min}
            max={range.max}
            step={key === 'lineHeight' ? 0.1 : 1}
            value={value as number}
            onChange={(e) => setSetting(key as keyof typeof settings, parseFloat(e.target.value))}
            className="flex-1 h-2 bg-theme-bg-tertiary rounded-lg appearance-none cursor-pointer"
            data-testid={testId}
          />
          <span className="text-xs text-theme-text-muted">{range.max}</span>
          <span className="text-sm font-medium text-theme-text-primary w-12">
            {key === 'lineHeight' ? (value as number).toFixed(1) : String(value)}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Editor Mode */}
      <div>
        <h3 className="text-lg font-medium text-theme-text-primary mb-4">
          Editor Mode
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-theme-text-secondary mb-2">
              Choose Editor
            </label>
            <select
              value={stringValue(settings.editorMode) || 'markdown'}
              onChange={(e) => setSetting('editorMode' as keyof typeof settings, e.target.value)}
              className="w-full px-3 py-2 bg-theme-bg-secondary border border-theme-border-primary rounded-md text-sm text-theme-text-primary focus:outline-none focus:ring-2 focus:ring-theme-accent-primary"
            >
              {editorModes.map((mode) => (
                <option key={mode.value} value={mode.value} className="bg-theme-bg-secondary text-theme-text-primary">
                  {mode.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Editor Behavior */}
      <div>
        <h3 className="text-lg font-medium text-theme-text-primary mb-4">
          Editor Behavior
        </h3>
        
        <div className="space-y-6">
          {renderToggle('autoSave', 'Auto Save', 'Automatically save changes as you type', 'auto-save-toggle')}
          {renderToggle('spellCheck', 'Spell Check', 'Check spelling as you type')}
          {renderToggle('wordWrap', 'Word Wrap', 'Wrap long lines in the editor')}
          {renderToggle('showLineNumbers', 'Line Numbers', 'Display line numbers in the editor')}
          {renderToggle('highlightActiveLine', 'Highlight Active Line', 'Highlight the line where your cursor is')}
          {renderToggle('bracketMatching', 'Bracket Matching', 'Highlight matching brackets')}
          {renderToggle('autoCloseBrackets', 'Auto Close Brackets', 'Automatically close brackets and quotes')}
          {renderToggle('autoComplete', 'Auto Complete', 'Show autocomplete suggestions while typing')}
          {renderToggle('showInvisibles', 'Show Invisible Characters', 'Display spaces, tabs, and line breaks')}
        </div>
      </div>

      {/* Typography */}
      <div>
        <h3 className="text-lg font-medium text-theme-text-primary mb-4">
          Typography
        </h3>
        
        <div className="space-y-6">
          {/* Font Family */}
          <div>
            <label className="block text-sm font-medium text-theme-text-secondary mb-2">
              Font Family
            </label>
            <select
              value={stringValue(settings.editorFontFamily) || 'Inter'}
              onChange={(e) => setSetting('editorFontFamily' as keyof typeof settings, e.target.value)}
              className="w-full px-3 py-2 bg-theme-bg-secondary border border-theme-border-primary rounded-md text-sm text-theme-text-primary focus:outline-none focus:ring-2 focus:ring-theme-accent-primary"
            >
              {fontFamilies.map((font) => (
                <option key={font.value} value={font.value} className="bg-theme-bg-secondary text-theme-text-primary">
                  {font.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Indentation */}
      <div>
        <h3 className="text-lg font-medium text-theme-text-primary mb-4">
          Indentation
        </h3>
        
        <div className="space-y-6">
          {renderNumberInput('tabSize', 'Tab Size')}
          {renderNumberInput('lineHeight', 'Line Height')}
          {renderNumberInput('editorFontSize', 'Editor Font Size', 'font-size-slider')}
        </div>
      </div>

      {/* Advanced */}
      <div>
        <h3 className="text-lg font-medium text-theme-text-primary mb-4">
          Advanced
        </h3>
        
        <div className="space-y-6">
          {renderToggle('scrollBeyondLastLine', 'Scroll Beyond Last Line', 'Allow scrolling past the last line')}
          {renderToggle('minimap', 'Show Minimap', 'Display code minimap for navigation')}
          {renderToggle('vimMode', 'Vim Mode', 'Enable Vim keybindings')}
          {renderToggle('smoothScrolling', 'Smooth Scrolling', 'Enable smooth scrolling animations')}
          {renderToggle('folding', 'Code Folding', 'Enable code folding for sections')}
          {renderToggle('emmetEnabled', 'Emmet Support', 'Enable Emmet abbreviations for HTML/CSS')}
        </div>
      </div>

      {/* Clipboard */}
      <div>
        <h3 className="text-lg font-medium text-theme-text-primary mb-4">
          Clipboard
        </h3>
        
        <div className="space-y-6">
          {/* Auto Save Delay */}
          <div>
            <label className="block text-sm font-medium text-theme-text-secondary mb-2">
              Auto Save Delay (ms)
            </label>
            <input
              type="number"
              value={numberValue(settings.autoSaveDelay) || 2000}
              onChange={(e) => setSetting('autoSaveDelay' as keyof typeof settings, parseInt(e.target.value))}
              min={500}
              max={10000}
              step={500}
              className="w-full px-3 py-2 bg-theme-bg-secondary border border-theme-border-primary rounded-md text-sm text-theme-text-primary focus:outline-none focus:ring-2 focus:ring-theme-accent-primary"
            />
            <p className="mt-1 text-xs text-theme-text-muted">
              Delay before auto-saving changes
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditingSettings