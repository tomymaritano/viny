import React from 'react'
import { useAppStore } from '../../../stores/newSimpleStore'
import Icons from '../../Icons'

const EditingSettings: React.FC = () => {
  const { settings, updateSettings } = useAppStore()

  const fontFamilies = [
    { value: 'system', label: 'System Font' },
    { value: 'source-code-pro', label: 'Source Code Pro' },
    { value: 'fira-code', label: 'Fira Code' },
    { value: 'jetbrains-mono', label: 'JetBrains Mono' },
    { value: 'cascadia-code', label: 'Cascadia Code' },
  ]

  const indentTypes = [
    { value: 'spaces', label: 'Spaces' },
    { value: 'tabs', label: 'Tabs' },
  ]

  return (
    <div className="space-y-8">
      {/* Editor Behavior */}
      <div>
        <h3 className="text-lg font-medium text-theme-text-primary mb-4">
          Editor Behavior
        </h3>
        
        <div className="space-y-6">
          {/* Auto Save */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-theme-text-primary">
                Auto Save
              </h4>
              <p className="text-xs text-theme-text-muted mt-1">
                Automatically save changes as you type
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoSave || true}
                onChange={(e) => updateSettings({ autoSave: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-theme-bg-tertiary peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-theme-accent-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-theme-accent-primary"></div>
            </label>
          </div>

          {/* Auto Save Delay */}
          {settings.autoSave && (
            <div>
              <label className="block text-sm font-medium text-theme-text-secondary mb-2">
                Auto Save Delay (seconds)
              </label>
              <div className="flex items-center space-x-4">
                <span className="text-xs text-theme-text-muted">1s</span>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={settings.autoSaveDelay || 3}
                  onChange={(e) => updateSettings({ autoSaveDelay: parseInt(e.target.value) })}
                  className="flex-1 h-2 bg-theme-bg-tertiary rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-xs text-theme-text-muted">10s</span>
                <span className="text-sm font-medium text-theme-text-primary w-8">
                  {settings.autoSaveDelay || 3}s
                </span>
              </div>
            </div>
          )}

          {/* Word Wrap */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-theme-text-primary">
                Word Wrap
              </h4>
              <p className="text-xs text-theme-text-muted mt-1">
                Wrap long lines to fit in the editor
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.wordWrap || true}
                onChange={(e) => updateSettings({ wordWrap: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-theme-bg-tertiary peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-theme-accent-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-theme-accent-primary"></div>
            </label>
          </div>

          {/* Show Line Numbers */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-theme-text-primary">
                Show Line Numbers
              </h4>
              <p className="text-xs text-theme-text-muted mt-1">
                Display line numbers in the editor
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.showLineNumbers || false}
                onChange={(e) => updateSettings({ showLineNumbers: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-theme-bg-tertiary peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-theme-accent-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-theme-accent-primary"></div>
            </label>
          </div>

          {/* Highlight Active Line */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-theme-text-primary">
                Highlight Active Line
              </h4>
              <p className="text-xs text-theme-text-muted mt-1">
                Highlight the line where your cursor is
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.highlightActiveLine || true}
                onChange={(e) => updateSettings({ highlightActiveLine: e.target.checked })}
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
          {/* Font Family */}
          <div>
            <label className="block text-sm font-medium text-theme-text-secondary mb-2">
              Font Family
            </label>
            <select
              value={settings.fontFamily || 'system'}
              onChange={(e) => updateSettings({ fontFamily: e.target.value })}
              className="w-full px-3 py-2 bg-theme-bg-secondary border border-theme-border-primary rounded-md text-sm text-theme-text-primary focus:outline-none focus:ring-2 focus:ring-theme-accent-primary"
            >
              {fontFamilies.map((font) => (
                <option key={font.value} value={font.value} className="bg-theme-bg-secondary text-theme-text-primary">
                  {font.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-theme-text-muted">
              Choose the font used in the editor
            </p>
          </div>

          {/* Editor Font Size */}
          <div>
            <label className="block text-sm font-medium text-theme-text-secondary mb-2">
              Editor Font Size
            </label>
            <div className="flex items-center space-x-4">
              <span className="text-xs text-theme-text-muted">10px</span>
              <input
                type="range"
                min="10"
                max="24"
                value={settings.editorFontSize || 14}
                onChange={(e) => updateSettings({ editorFontSize: parseInt(e.target.value) })}
                className="flex-1 h-2 bg-theme-bg-tertiary rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-xs text-theme-text-muted">24px</span>
              <span className="text-sm font-medium text-theme-text-primary w-12">
                {settings.editorFontSize || 14}px
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Indentation */}
      <div>
        <h3 className="text-lg font-medium text-theme-text-primary mb-4">
          Indentation
        </h3>
        
        <div className="space-y-6">
          {/* Indent Type */}
          <div>
            <label className="block text-sm font-medium text-theme-text-secondary mb-2">
              Indent Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {indentTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => updateSettings({ indentType: type.value as 'spaces' | 'tabs' })}
                  className={`
                    px-4 py-2 rounded-md border transition-all
                    ${
                      settings.indentType === type.value
                        ? 'border-theme-accent-primary bg-theme-accent-primary/10 text-theme-accent-primary'
                        : 'border-theme-border-primary text-theme-text-secondary hover:border-theme-border-secondary'
                    }
                  `}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Indent Size */}
          <div>
            <label className="block text-sm font-medium text-theme-text-secondary mb-2">
              Indent Size ({settings.indentType === 'tabs' ? 'Tab Width' : 'Spaces'})
            </label>
            <div className="flex items-center space-x-4">
              <span className="text-xs text-theme-text-muted">2</span>
              <input
                type="range"
                min="2"
                max="8"
                value={settings.indentSize || 4}
                onChange={(e) => updateSettings({ indentSize: parseInt(e.target.value) })}
                className="flex-1 h-2 bg-theme-bg-tertiary rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-xs text-theme-text-muted">8</span>
              <span className="text-sm font-medium text-theme-text-primary w-8">
                {settings.indentSize || 4}
              </span>
            </div>
          </div>

          {/* Auto Indent */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-theme-text-primary">
                Auto Indent
              </h4>
              <p className="text-xs text-theme-text-muted mt-1">
                Automatically indent new lines
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoIndent || true}
                onChange={(e) => updateSettings({ autoIndent: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-theme-bg-tertiary peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-theme-accent-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-theme-accent-primary"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Advanced Features */}
      <div>
        <h3 className="text-lg font-medium text-theme-text-primary mb-4">
          Advanced Features
        </h3>
        
        <div className="space-y-6">
          {/* Vim Mode */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-theme-text-primary">
                Vim Mode
              </h4>
              <p className="text-xs text-theme-text-muted mt-1">
                Enable Vim key bindings in the editor
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.vimMode || false}
                onChange={(e) => updateSettings({ vimMode: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-theme-bg-tertiary peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-theme-accent-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-theme-accent-primary"></div>
            </label>
          </div>

          {/* Smart Quotes */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-theme-text-primary">
                Smart Quotes
              </h4>
              <p className="text-xs text-theme-text-muted mt-1">
                Automatically convert straight quotes to curly quotes
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.smartQuotes || false}
                onChange={(e) => updateSettings({ smartQuotes: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-theme-bg-tertiary peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-theme-accent-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-theme-accent-primary"></div>
            </label>
          </div>

          {/* Auto Close Brackets */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-theme-text-primary">
                Auto Close Brackets
              </h4>
              <p className="text-xs text-theme-text-muted mt-1">
                Automatically close brackets, quotes, and parentheses
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoCloseBrackets || true}
                onChange={(e) => updateSettings({ autoCloseBrackets: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-theme-bg-tertiary peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-theme-accent-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-theme-accent-primary"></div>
            </label>
          </div>

          {/* Spell Check */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-theme-text-primary">
                Spell Check
              </h4>
              <p className="text-xs text-theme-text-muted mt-1">
                Check spelling as you type
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.spellCheck || true}
                onChange={(e) => updateSettings({ spellCheck: e.target.checked })}
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

export default EditingSettings