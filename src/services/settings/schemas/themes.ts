import type { SettingsSchema } from '../types'

export const themesSchema: SettingsSchema[] = [
  {
    key: 'theme',
    type: 'select',
    defaultValue: 'system',
    label: 'Theme',
    description: 'The overall interface theme',
    category: 'themes',
    options: [
      { value: 'light', label: 'Light', icon: 'Sun' },
      { value: 'dark', label: 'Dark', icon: 'Moon' },
      { value: 'solarized', label: 'Solarized', icon: 'Palette' },
      { value: 'hacklab', label: 'Hacklab', icon: 'Monitor' },
      { value: 'system', label: 'System', icon: 'Monitor' }
    ]
  },
  {
    key: 'interfaceFontSize',
    type: 'number',
    defaultValue: 14,
    label: 'Interface Font Size',
    description: 'Base font size for the interface',
    category: 'themes',
    min: 10,
    max: 24,
    step: 1
  },
  {
    key: 'animationSpeed',
    type: 'select',
    defaultValue: 'normal',
    label: 'Animation Speed',
    description: 'Speed of interface animations',
    category: 'themes',
    options: [
      { value: 'slow', label: 'Slow' },
      { value: 'normal', label: 'Normal' },
      { value: 'fast', label: 'Fast' },
      { value: 'none', label: 'Disabled' }
    ]
  },
  {
    key: 'syntaxTheme',
    type: 'select',
    defaultValue: 'default',
    label: 'Syntax Highlighting',
    description: 'Color scheme for code blocks',
    category: 'themes',
    options: [
      { value: 'default', label: 'Default (follows theme)' },
      { value: 'default-dark', label: 'Default Dark' },
      { value: 'default-light', label: 'Default Light' },
      { value: 'github', label: 'GitHub' },
      { value: 'monokai', label: 'Monokai' },
      { value: 'solarized', label: 'Solarized' },
      { value: 'dracula', label: 'Dracula' },
      { value: 'nord', label: 'Nord' },
      { value: 'one-dark', label: 'One Dark' },
      { value: 'gruvbox', label: 'Gruvbox' }
    ]
  },
  {
    key: 'previewTheme',
    category: 'themes',
    label: 'Preview Theme',
    description: 'Styling theme for note preview',
    type: 'select',
    defaultValue: 'default',
    options: [
      { value: 'default', label: 'Default (follows theme)' },
      { value: 'default-light', label: 'Default Light' },
      { value: 'default-dark', label: 'Default Dark' },
      { value: 'github', label: 'GitHub' },
      { value: 'minimal', label: 'Minimal' },
      { value: 'academic', label: 'Academic' },
      { value: 'modern', label: 'Modern' }
    ]
  },
  {
    key: 'editorFontSize',
    category: 'themes',
    label: 'Editor Font Size',
    description: 'Font size for the editor content',
    type: 'number',
    defaultValue: 14,
    min: 12,
    max: 20,
    step: 1,
    applyToDOM: true
  },
  {
    key: 'lineHeight',
    category: 'themes',
    label: 'Line Height',
    description: 'Line height for better readability',
    type: 'number',
    defaultValue: 1.6,
    min: 1.2,
    max: 2.0,
    step: 0.1,
    applyToDOM: true
  },
  {
    key: 'fontFamily',
    category: 'themes',
    label: 'Editor Font',
    description: 'Font family for the editor',
    type: 'select',
    defaultValue: 'default',
    options: [
      { value: 'default', label: 'System Default' },
      { value: 'sf-mono', label: 'SF Mono' },
      { value: 'fira-code', label: 'Fira Code' },
      { value: 'jetbrains-mono', label: 'JetBrains Mono' },
      { value: 'consolas', label: 'Consolas' },
      { value: 'monaco', label: 'Monaco' }
    ]
  },
  {
    key: 'customCSSEnabled',
    category: 'themes',
    label: 'Enable Custom CSS',
    description: 'Apply custom CSS to personalize the interface',
    type: 'boolean',
    defaultValue: false
  },
  {
    key: 'customCSS',
    category: 'themes',
    label: 'Custom CSS',
    description: 'CSS rules to apply to the interface',
    type: 'string',
    defaultValue: '',
    placeholder: '/* Add your custom CSS here */\n.note-content {\n  /* Custom styles */\n}',
    applyToDOM: true,
    dependencies: [{
      condition: (value) => value === '',
      targetKey: 'customCSSEnabled',
      targetValue: false
    }]
  },
  {
    key: 'accentColor',
    category: 'themes',
    label: 'Accent Color',
    description: 'Primary accent color for the interface',
    type: 'select',
    defaultValue: 'blue',
    options: [
      { value: 'blue', label: 'Blue' },
      { value: 'green', label: 'Green' },
      { value: 'orange', label: 'Orange' },
      { value: 'violet', label: 'Violet' },
      { value: 'red', label: 'Red' },
      { value: 'cyan', label: 'Cyan' }
    ],
    experimental: true
  },
  {
    key: 'compactMode',
    category: 'themes',
    label: 'Compact Mode',
    description: 'Reduce spacing for more content density',
    type: 'boolean',
    defaultValue: false,
    applyToDOM: true
  }
]