import { z } from 'zod'
import { SettingsSchema } from '../types'

export const keybindingSettings: SettingsSchema[] = [
  {
    key: 'keymapPreset',
    category: 'keybindings',
    label: 'Keymap Preset',
    description: 'Choose a predefined keymap',
    type: 'select',
    defaultValue: 'default',
    options: [
      { value: 'default', label: 'Default' },
      { value: 'vim', label: 'Vim' },
      { value: 'emacs', label: 'Emacs' },
      { value: 'vscode', label: 'VS Code' },
      { value: 'sublime', label: 'Sublime Text' },
      { value: 'custom', label: 'Custom' }
    ]
  },
  {
    key: 'enableKeybindings',
    category: 'keybindings',
    label: 'Enable Keybindings',
    description: 'Use keyboard shortcuts',
    type: 'boolean',
    defaultValue: true
  },
  {
    key: 'showKeybindingHints',
    category: 'keybindings',
    label: 'Show Hints',
    description: 'Display keyboard shortcut hints',
    type: 'boolean',
    defaultValue: true
  },
  {
    key: 'customKeybindings',
    category: 'keybindings',
    label: 'Custom Keybindings',
    description: 'Define your own keyboard shortcuts',
    type: 'object',
    defaultValue: {},
    validation: z.record(z.string())
  },
  {
    key: 'commandPaletteKey',
    category: 'keybindings',
    label: 'Command Palette',
    description: 'Shortcut to open command palette',
    type: 'string',
    defaultValue: 'Cmd+Shift+P',
    placeholder: 'e.g., Cmd+Shift+P'
  },
  {
    key: 'quickSwitcherKey',
    category: 'keybindings',
    label: 'Quick Switcher',
    description: 'Shortcut to open quick switcher',
    type: 'string',
    defaultValue: 'Cmd+P',
    placeholder: 'e.g., Cmd+P'
  },
  {
    key: 'searchKey',
    category: 'keybindings',
    label: 'Search',
    description: 'Shortcut to open search',
    type: 'string',
    defaultValue: 'Cmd+Shift+F',
    placeholder: 'e.g., Cmd+Shift+F'
  },
  {
    key: 'newNoteKey',
    category: 'keybindings',
    label: 'New Note',
    description: 'Shortcut to create new note',
    type: 'string',
    defaultValue: 'Cmd+N',
    placeholder: 'e.g., Cmd+N'
  },
  {
    key: 'saveNoteKey',
    category: 'keybindings',
    label: 'Save Note',
    description: 'Shortcut to save current note',
    type: 'string',
    defaultValue: 'Cmd+S',
    placeholder: 'e.g., Cmd+S'
  },
  {
    key: 'togglePreviewKey',
    category: 'keybindings',
    label: 'Toggle Preview',
    description: 'Shortcut to toggle preview pane',
    type: 'string',
    defaultValue: 'Cmd+E',
    placeholder: 'e.g., Cmd+E'
  },
  {
    key: 'toggleSidebarKey',
    category: 'keybindings',
    label: 'Toggle Sidebar',
    description: 'Shortcut to toggle sidebar',
    type: 'string',
    defaultValue: 'Cmd+\\',
    placeholder: 'e.g., Cmd+\\'
  },
  {
    key: 'multiCursorModifier',
    category: 'keybindings',
    label: 'Multi-Cursor Modifier',
    description: 'Modifier key for multi-cursor',
    type: 'select',
    defaultValue: 'Alt',
    options: [
      { value: 'Alt', label: 'Alt' },
      { value: 'Cmd', label: 'Cmd/Ctrl' },
      { value: 'Shift', label: 'Shift' }
    ]
  },
  {
    key: 'enableVimMode',
    category: 'keybindings',
    label: 'Enable Vim Mode',
    description: 'Use Vim keybindings in editor',
    type: 'boolean',
    defaultValue: false,
    dependencies: [{
      condition: (value) => value === true,
      targetKey: 'keymapPreset',
      targetValue: 'vim'
    }]
  },
  {
    key: 'conflictResolution',
    category: 'keybindings',
    label: 'Conflict Resolution',
    description: 'How to handle keybinding conflicts',
    type: 'select',
    defaultValue: 'warn',
    options: [
      { value: 'warn', label: 'Show Warning' },
      { value: 'override', label: 'Override System' },
      { value: 'ignore', label: 'Use System' }
    ]
  }
]