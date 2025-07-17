import React from 'react'
import { useSettingsService } from '../../../hooks/useSettingsService'
import { Icons } from '../../Icons'

const EditingSettings: React.FC = () => {
  const editorService = useSettingsService({ category: 'editor' })
  const themesService = useSettingsService({ category: 'themes' })

  // Merge settings from both categories
  const settings = { ...editorService.settings, ...themesService.settings }
  const schemas = [...editorService.schemas, ...themesService.schemas]
  const errors = { ...editorService.errors, ...themesService.errors }

  // Function to set setting in the correct category
  const setSetting = (key: string, value: any) => {
    const editorSchema = editorService.schemas.find(s => s.key === key)
    const themesSchema = themesService.schemas.find(s => s.key === key)
    
    if (editorSchema) {
      editorService.setSetting(key, value)
    } else if (themesSchema) {
      themesService.setSetting(key, value)
    }
  }

  // Get schema options
  const fontFamilySchema = schemas.find(s => s.key === 'fontFamily')
  const fontFamilies = fontFamilySchema?.options || []

  const editorModeSchema = schemas.find(s => s.key === 'editorMode')
  const editorModes = editorModeSchema?.options || []

  const renderToggle = (key: string, label: string, description: string, testId?: string) => {
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
            data-testid={testId}
          />
          <div className="w-11 h-6 bg-theme-bg-tertiary peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-theme-accent-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-theme-accent-primary"></div>
        </label>
      </div>
    )
  }

  const renderNumberInput = (key: string, label: string, testId?: string) => {
    const schema = schemas.find(s => s.key === key)
    const value = settings[key] ?? schema?.defaultValue ?? 0
    
    return (
      <div>
        <label className="block text-sm font-medium text-theme-text-secondary mb-2">
          {label}
        </label>
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
            data-testid={testId}
          />
          <span className="text-xs text-theme-text-muted">{schema?.max}</span>
          <span className="text-sm font-medium text-theme-text-primary w-12">
            {schema?.step && schema.step < 1 ? (value as number).toFixed(1) : String(value)}
          </span>
        </div>
        {errors[key] && (
          <p className="mt-1 text-xs text-red-500">{errors[key]}</p>
        )}
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
              value={settings.editorMode || 'markdown'}
              onChange={(e) => setSetting('editorMode', e.target.value)}
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
              value={settings.fontFamily || 'default'}
              onChange={(e) => setSetting('fontFamily', e.target.value)}
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
              value={settings.autoSaveDelay || 2000}
              onChange={(e) => setSetting('autoSaveDelay', parseInt(e.target.value))}
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