import React, { useState } from 'react'
import { useAppStore } from '../../../stores/newSimpleStore'
import Icons from '../../Icons'

interface Keybinding {
  action: string
  keys: string
  category: string
  description: string
}

const KeybindingsSettings: React.FC = () => {
  const { settings, updateSettings } = useAppStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [editingKeybind, setEditingKeybind] = useState<string | null>(null)

  const keymapPresets = [
    { value: 'default', label: 'Nototo Default' },
    { value: 'vscode', label: 'VS Code' },
    { value: 'vim', label: 'Vim' },
    { value: 'emacs', label: 'Emacs' },
    { value: 'sublime', label: 'Sublime Text' },
  ]

  const defaultKeybindings: Keybinding[] = [
    // File Operations
    { action: 'new_note', keys: 'Ctrl+N', category: 'File', description: 'Create new note' },
    { action: 'save_note', keys: 'Ctrl+S', category: 'File', description: 'Save current note' },
    { action: 'open_note', keys: 'Ctrl+O', category: 'File', description: 'Open note' },
    { action: 'close_note', keys: 'Ctrl+W', category: 'File', description: 'Close current note' },
    { action: 'export_note', keys: 'Ctrl+E', category: 'File', description: 'Export note' },
    
    // Edit Operations
    { action: 'copy', keys: 'Ctrl+C', category: 'Edit', description: 'Copy selection' },
    { action: 'paste', keys: 'Ctrl+V', category: 'Edit', description: 'Paste' },
    { action: 'cut', keys: 'Ctrl+X', category: 'Edit', description: 'Cut selection' },
    { action: 'undo', keys: 'Ctrl+Z', category: 'Edit', description: 'Undo' },
    { action: 'redo', keys: 'Ctrl+Y', category: 'Edit', description: 'Redo' },
    { action: 'select_all', keys: 'Ctrl+A', category: 'Edit', description: 'Select all' },
    { action: 'find', keys: 'Ctrl+F', category: 'Edit', description: 'Find in note' },
    { action: 'replace', keys: 'Ctrl+H', category: 'Edit', description: 'Find and replace' },
    
    // Formatting
    { action: 'bold', keys: 'Ctrl+B', category: 'Format', description: 'Toggle bold' },
    { action: 'italic', keys: 'Ctrl+I', category: 'Format', description: 'Toggle italic' },
    { action: 'strikethrough', keys: 'Ctrl+Shift+S', category: 'Format', description: 'Toggle strikethrough' },
    { action: 'code', keys: 'Ctrl+`', category: 'Format', description: 'Toggle inline code' },
    { action: 'link', keys: 'Ctrl+K', category: 'Format', description: 'Insert link' },
    { action: 'heading_1', keys: 'Ctrl+1', category: 'Format', description: 'Heading 1' },
    { action: 'heading_2', keys: 'Ctrl+2', category: 'Format', description: 'Heading 2' },
    { action: 'heading_3', keys: 'Ctrl+3', category: 'Format', description: 'Heading 3' },
    { action: 'bullet_list', keys: 'Ctrl+Shift+8', category: 'Format', description: 'Bullet list' },
    { action: 'numbered_list', keys: 'Ctrl+Shift+7', category: 'Format', description: 'Numbered list' },
    { action: 'quote', keys: 'Ctrl+Shift+9', category: 'Format', description: 'Block quote' },
    { action: 'code_block', keys: 'Ctrl+Shift+C', category: 'Format', description: 'Code block' },
    
    // View
    { action: 'toggle_preview', keys: 'Ctrl+Shift+V', category: 'View', description: 'Toggle preview' },
    { action: 'toggle_sidebar', keys: 'Ctrl+\\', category: 'View', description: 'Toggle sidebar' },
    { action: 'focus_editor', keys: 'Ctrl+Shift+E', category: 'View', description: 'Focus editor' },
    { action: 'focus_sidebar', keys: 'Ctrl+Shift+S', category: 'View', description: 'Focus sidebar' },
    { action: 'zen_mode', keys: 'F11', category: 'View', description: 'Toggle zen mode' },
    
    // Navigation
    { action: 'go_to_line', keys: 'Ctrl+G', category: 'Navigation', description: 'Go to line' },
    { action: 'scroll_up', keys: 'Ctrl+Up', category: 'Navigation', description: 'Scroll up' },
    { action: 'scroll_down', keys: 'Ctrl+Down', category: 'Navigation', description: 'Scroll down' },
    { action: 'jump_to_top', keys: 'Ctrl+Home', category: 'Navigation', description: 'Jump to top' },
    { action: 'jump_to_bottom', keys: 'Ctrl+End', category: 'Navigation', description: 'Jump to bottom' },
    
    // Application
    { action: 'settings', keys: 'Ctrl+,', category: 'App', description: 'Open settings' },
    { action: 'command_palette', keys: 'Ctrl+Shift+P', category: 'App', description: 'Command palette' },
    { action: 'reload', keys: 'F5', category: 'App', description: 'Reload application' },
    { action: 'dev_tools', keys: 'F12', category: 'App', description: 'Developer tools' },
  ]

  const categories = Array.from(new Set(defaultKeybindings.map(k => k.category)))

  const filteredKeybindings = defaultKeybindings.filter(kb =>
    kb.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    kb.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    kb.keys.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatKeys = (keys: string) => {
    return keys.split('+').map((key, index) => (
      <span key={index}>
        <kbd className="px-2 py-1 text-xs bg-theme-bg-tertiary border border-theme-border-primary rounded">
          {key}
        </kbd>
        {index < keys.split('+').length - 1 && <span className="mx-1">+</span>}
      </span>
    ))
  }

  return (
    <div className="space-y-8">
      {/* Keymap Preset */}
      <div>
        <h3 className="text-lg font-medium text-theme-text-primary mb-4">
          Keymap Preset
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-theme-text-secondary mb-2">
              Choose a keymap preset
            </label>
            <select
              value={settings.keymapPreset || 'default'}
              onChange={(e) => updateSettings({ keymapPreset: e.target.value })}
              className="w-full px-3 py-2 bg-theme-bg-secondary border border-theme-border-primary rounded-md text-sm text-theme-text-primary focus:outline-none focus:ring-2 focus:ring-theme-accent-primary"
            >
              {keymapPresets.map((preset) => (
                <option key={preset.value} value={preset.value} className="bg-theme-bg-secondary text-theme-text-primary">
                  {preset.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-theme-text-muted">
              Choose a familiar keymap or stick with Nototo's defaults
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-theme-text-primary">
                Enable Custom Keybindings
              </h4>
              <p className="text-xs text-theme-text-muted mt-1">
                Allow overriding default shortcuts with custom ones
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableCustomKeybindings || false}
                onChange={(e) => updateSettings({ enableCustomKeybindings: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-theme-bg-tertiary peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-theme-accent-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-theme-accent-primary"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Search */}
      <div>
        <h3 className="text-lg font-medium text-theme-text-primary mb-4">
          Keyboard Shortcuts
        </h3>
        
        <div className="relative mb-4">
          <Icons.Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-text-muted" />
          <input
            type="text"
            placeholder="Search shortcuts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-theme-bg-secondary border border-theme-border-primary rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-theme-accent-primary"
          />
        </div>
      </div>

      {/* Keybindings List */}
      <div className="space-y-6">
        {categories.map((category) => {
          const categoryKeybindings = filteredKeybindings.filter(kb => kb.category === category)
          
          if (categoryKeybindings.length === 0) return null
          
          return (
            <div key={category}>
              <h4 className="text-sm font-medium text-theme-text-primary mb-3 px-1">
                {category}
              </h4>
              
              <div className="space-y-1">
                {categoryKeybindings.map((keybinding) => (
                  <div
                    key={keybinding.action}
                    className="flex items-center justify-between p-3 bg-theme-bg-secondary border border-theme-border-primary rounded-md hover:bg-theme-bg-tertiary transition-colors"
                  >
                    <div className="flex-1">
                      <div className="text-sm font-medium text-theme-text-primary">
                        {keybinding.description}
                      </div>
                      <div className="text-xs text-theme-text-muted">
                        {keybinding.action}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className="text-sm">
                        {formatKeys(keybinding.keys)}
                      </div>
                      
                      {settings.enableCustomKeybindings && (
                        <button
                          onClick={() => setEditingKeybind(keybinding.action)}
                          className="p-1 text-theme-text-muted hover:text-theme-text-secondary transition-colors"
                        >
                          <Icons.Edit2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Advanced Options */}
      <div>
        <h3 className="text-lg font-medium text-theme-text-primary mb-4">
          Advanced
        </h3>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-theme-text-primary">
                Show Keyboard Shortcuts in Tooltips
              </h4>
              <p className="text-xs text-theme-text-muted mt-1">
                Display keyboard shortcuts in button tooltips
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.showKeybindingsInTooltips || true}
                onChange={(e) => updateSettings({ showKeybindingsInTooltips: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-theme-bg-tertiary peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-theme-accent-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-theme-accent-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-theme-text-primary">
                Enable Global Shortcuts
              </h4>
              <p className="text-xs text-theme-text-muted mt-1">
                Allow shortcuts to work when the app is not focused
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableGlobalShortcuts || false}
                onChange={(e) => updateSettings({ enableGlobalShortcuts: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-theme-bg-tertiary peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-theme-accent-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-theme-accent-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-theme-text-primary">
                Vim Mode
              </h4>
              <p className="text-xs text-theme-text-muted mt-1">
                Enable Vim-style keybindings in the editor
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
        </div>
      </div>

      {/* Reset to Defaults */}
      <div>
        <h3 className="text-lg font-medium text-theme-text-primary mb-4">
          Reset Keybindings
        </h3>
        
        <button
          onClick={() => {
            // Reset keybindings to defaults
            updateSettings({ 
              keymapPreset: 'default',
              enableCustomKeybindings: false,
              customKeybindings: {}
            })
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-theme-bg-secondary border border-theme-border-primary rounded-md hover:bg-theme-bg-tertiary transition-colors text-sm"
        >
          <Icons.RotateCcw size={16} className="text-theme-text-muted" />
          <span className="text-theme-text-primary">Reset to Defaults</span>
        </button>
        <p className="mt-2 text-xs text-theme-text-muted">
          This will reset all keybindings to their default values
        </p>
      </div>
    </div>
  )
}

export default KeybindingsSettings