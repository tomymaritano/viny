import type { SettingsSchema } from '../types'

// Preview settings for markdown rendering
export const previewSchema: SettingsSchema[] = [
  {
    key: 'syncScrolling',
    category: 'preview',
    label: 'Sync Scrolling',
    description: 'Synchronize scrolling between editor and preview',
    type: 'boolean',
    defaultValue: true
  },
  {
    key: 'previewMode',
    category: 'preview',
    label: 'Preview Mode',
    description: 'How the preview updates',
    type: 'select',
    defaultValue: 'live',
    options: [
      { value: 'live', label: 'Live Preview' },
      { value: 'manual', label: 'Manual Refresh' },
      { value: 'off', label: 'Disabled' }
    ]
  },
  {
    key: 'livePreview',
    category: 'preview',
    label: 'Live Preview',
    description: 'Update preview as you type',
    type: 'boolean',
    defaultValue: true
  },
  {
    key: 'previewDelay',
    category: 'preview',
    label: 'Preview Delay',
    description: 'Milliseconds to wait before updating preview',
    type: 'number',
    defaultValue: 300,
    min: 100,
    max: 2000,
    step: 100
  },
  {
    key: 'codeHighlighting',
    category: 'preview',
    label: 'Code Highlighting',
    description: 'Syntax highlighting for code blocks',
    type: 'boolean',
    defaultValue: true
  },
  {
    key: 'renderMath',
    category: 'preview',
    label: 'Render Math',
    description: 'Render LaTeX math expressions in preview',
    type: 'boolean',
    defaultValue: true
  },
  {
    key: 'mathEngine',
    category: 'preview',
    label: 'Math Engine',
    description: 'Engine for rendering math',
    type: 'select',
    defaultValue: 'katex',
    options: [
      { value: 'katex', label: 'KaTeX (Fast)' },
      { value: 'mathjax', label: 'MathJax (Full Featured)' }
    ]
  },
  {
    key: 'renderMermaid',
    category: 'preview',
    label: 'Render Mermaid Diagrams',
    description: 'Render Mermaid diagrams in preview',
    type: 'boolean',
    defaultValue: true
  },
  {
    key: 'showLineNumbers',
    category: 'preview',
    label: 'Show Line Numbers in Code',
    description: 'Display line numbers in code blocks',
    type: 'boolean',
    defaultValue: false
  },
  {
    key: 'copyCodeButton',
    category: 'preview',
    label: 'Copy Code Button',
    description: 'Show copy button on code blocks',
    type: 'boolean',
    defaultValue: true
  },
  {
    key: 'codeTheme',
    category: 'preview',
    label: 'Code Theme',
    description: 'Syntax highlighting theme',
    type: 'select',
    defaultValue: 'github',
    options: [
      { value: 'github', label: 'GitHub' },
      { value: 'dracula', label: 'Dracula' },
      { value: 'monokai', label: 'Monokai' },
      { value: 'nord', label: 'Nord' },
      { value: 'one-dark', label: 'One Dark' },
      { value: 'solarized-dark', label: 'Solarized Dark' },
      { value: 'solarized-light', label: 'Solarized Light' }
    ]
  },
  {
    key: 'tableOfContents',
    category: 'preview',
    label: 'Table of Contents',
    description: 'Auto-generate table of contents from headings',
    type: 'boolean',
    defaultValue: false
  },
  {
    key: 'tocPosition',
    category: 'preview',
    label: 'TOC Position',
    description: 'Where to display the table of contents',
    type: 'select',
    defaultValue: 'top',
    options: [
      { value: 'top', label: 'Top' },
      { value: 'bottom', label: 'Bottom' },
      { value: 'sidebar', label: 'Sidebar' }
    ]
  },
  {
    key: 'previewFontSize',
    category: 'preview',
    label: 'Preview Font Size',
    description: 'Font size for preview content',
    type: 'number',
    defaultValue: 16,
    min: 12,
    max: 24,
    step: 1
  },
  {
    key: 'previewLineHeight',
    category: 'preview',
    label: 'Preview Line Height',
    description: 'Line height for preview content',
    type: 'number',
    defaultValue: 1.7,
    min: 1.2,
    max: 2.5,
    step: 0.1
  },
  {
    key: 'linkBehavior',
    category: 'preview',
    label: 'Link Behavior',
    description: 'How to handle link clicks',
    type: 'select',
    defaultValue: 'external',
    options: [
      { value: 'external', label: 'Open in Browser' },
      { value: 'internal', label: 'Open in App' },
      { value: 'ask', label: 'Ask Each Time' }
    ]
  },
  {
    key: 'imageLazyLoading',
    category: 'preview',
    label: 'Lazy Load Images',
    description: 'Load images only when visible',
    type: 'boolean',
    defaultValue: true
  },
  {
    key: 'maxImageWidth',
    category: 'preview',
    label: 'Max Image Width',
    description: 'Maximum width for images in preview',
    type: 'select',
    defaultValue: '100%',
    options: [
      { value: '100%', label: 'Full Width' },
      { value: '800px', label: 'Large (800px)' },
      { value: '600px', label: 'Medium (600px)' },
      { value: '400px', label: 'Small (400px)' }
    ]
  },
  {
    key: 'sanitizeHTML',
    category: 'preview',
    label: 'Sanitize HTML',
    description: 'Remove potentially dangerous HTML',
    type: 'boolean',
    defaultValue: true
  },
  {
    key: 'embedVideos',
    category: 'preview',
    label: 'Embed Videos',
    description: 'Auto-embed YouTube and Vimeo links',
    type: 'boolean',
    defaultValue: true
  },
  {
    key: 'footnotes',
    category: 'preview',
    label: 'Enable Footnotes',
    description: 'Support markdown footnotes',
    type: 'boolean',
    defaultValue: true
  },
  {
    key: 'smartPunctuation',
    category: 'preview',
    label: 'Smart Punctuation',
    description: 'Convert quotes and dashes to smart characters',
    type: 'boolean',
    defaultValue: false
  }
]