import type { SettingsSchema } from '../types'

export const editorSchema: SettingsSchema[] = [
  {
    key: 'editorMode',
    category: 'editor',
    label: 'Editor Mode',
    description: 'Choose your preferred editor',
    type: 'select',
    defaultValue: 'markdown',
    options: [
      { value: 'markdown', label: 'Markdown Editor' }
    ]
  },
  {
    key: 'tabSize',
    category: 'editor',
    label: 'Tab Size',
    description: 'Number of spaces for tabs',
    type: 'number',
    defaultValue: 2,
    min: 1,
    max: 8,
    step: 1
  },
  {
    key: 'indentUnit',
    category: 'editor',
    label: 'Indent Unit',
    description: 'Number of spaces for indentation',
    type: 'number',
    defaultValue: 2,
    min: 1,
    max: 8,
    step: 1
  },
  {
    key: 'wordWrap',
    category: 'editor',
    label: 'Word Wrap',
    description: 'Wrap long lines in the editor',
    type: 'boolean',
    defaultValue: true
  },
  {
    key: 'showLineNumbers',
    category: 'editor',
    label: 'Line Numbers',
    description: 'Show line numbers in the editor',
    type: 'boolean',
    defaultValue: true
  },
  {
    key: 'highlightActiveLine',
    category: 'editor',
    label: 'Highlight Active Line',
    description: 'Highlight the line with cursor',
    type: 'boolean',
    defaultValue: true
  },
  {
    key: 'showInvisibleCharacters',
    category: 'editor',
    label: 'Show Invisible Characters',
    description: 'Show spaces, tabs, and line breaks',
    type: 'boolean',
    defaultValue: false
  },
  {
    key: 'bracketMatching',
    category: 'editor',
    label: 'Bracket Matching',
    description: 'Highlight matching brackets',
    type: 'boolean',
    defaultValue: true
  },
  {
    key: 'autoCloseBrackets',
    category: 'editor',
    label: 'Auto Close Brackets',
    description: 'Automatically close brackets and quotes',
    type: 'boolean',
    defaultValue: true
  },
  {
    key: 'scrollPastEnd',
    category: 'editor',
    label: 'Scroll Past End',
    description: 'Allow scrolling past the last line',
    type: 'boolean',
    defaultValue: true
  },
  {
    key: 'cursorScrollMargin',
    category: 'editor',
    label: 'Cursor Scroll Margin',
    description: 'Pixels to keep between cursor and edge',
    type: 'number',
    defaultValue: 100,
    min: 0,
    max: 200,
    step: 10
  },
  {
    key: 'pasteURLAsLink',
    category: 'editor',
    label: 'Paste URL as Link',
    description: 'Convert URLs to markdown links when pasting',
    type: 'boolean',
    defaultValue: true
  },
  {
    key: 'autoFormatOnPaste',
    category: 'editor',
    label: 'Auto Format on Paste',
    description: 'Format pasted content automatically',
    type: 'boolean',
    defaultValue: false
  },
  {
    key: 'vimMode',
    category: 'editor',
    label: 'Vim Mode',
    description: 'Enable Vim keybindings (experimental)',
    type: 'boolean',
    defaultValue: false,
    experimental: true
  },
  {
    key: 'minimap',
    category: 'editor',
    label: 'Show Minimap',
    description: 'Show code minimap for navigation',
    type: 'boolean',
    defaultValue: false
  },
  {
    key: 'autoCompletion',
    category: 'editor',
    label: 'Auto Completion',
    description: 'Enable intelligent code completion',
    type: 'boolean',
    defaultValue: true,
    experimental: true
  },
  {
    key: 'snippetsEnabled',
    category: 'editor',
    label: 'Enable Snippets',
    description: 'Use code snippets and templates',
    type: 'boolean',
    defaultValue: true
  },
  {
    key: 'showToolbar',
    category: 'editor',
    label: 'Show Toolbar',
    description: 'Display formatting toolbar',
    type: 'boolean',
    defaultValue: true
  },
  {
    key: 'readableLineLength',
    category: 'editor',
    label: 'Readable Line Length',
    description: 'Limit editor width for readability',
    type: 'boolean',
    defaultValue: false
  },
  {
    key: 'maxLineLength',
    category: 'editor',
    label: 'Max Line Length',
    description: 'Maximum characters per line',
    type: 'number',
    defaultValue: 80,
    min: 50,
    max: 120,
    step: 10,
    dependencies: [{
      condition: (value) => value > 0,
      targetKey: 'readableLineLength',
      targetValue: true
    }]
  }
]