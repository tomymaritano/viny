// Monaco Editor configuration for optimal performance
import { loader } from '@monaco-editor/react'
import * as monaco from 'monaco-editor'

// Configure Monaco to use local files
loader.config({ monaco })

// Pre-configure Monaco options for better performance
export const monacoOptions = {
  // Basic editor options
  automaticLayout: true,
  wordWrap: 'on',
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  fontSize: 14,
  lineHeight: 1.6,
  fontFamily: 'JetBrains Mono, Monaco, Consolas, monospace',

  // Performance optimizations
  quickSuggestions: false,
  parameterHints: { enabled: false },
  suggestOnTriggerCharacters: false,
  acceptSuggestionOnEnter: 'off',
  tabCompletion: 'off',
  wordBasedSuggestions: false,

  // Rendering optimizations
  renderLineHighlight: 'line',
  renderWhitespace: 'none',
  renderControlCharacters: false,

  // Scrolling optimizations
  smoothScrolling: true,
  cursorSmoothCaretAnimation: true,

  // Disable heavy features for better performance
  hover: { enabled: true, delay: 500 },
  links: false,
  colorDecorators: false,

  // Language specific optimizations
  bracketPairColorization: { enabled: false },
  guides: {
    bracketPairs: false,
    indentation: false,
  },
}

// Theme configuration
export const editorTheme = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'comment', foreground: '586e75', fontStyle: 'italic' },
    { token: 'keyword', foreground: '859900' },
    { token: 'string', foreground: '2aa198' },
    { token: 'number', foreground: 'd33682' },
    { token: 'regexp', foreground: 'dc322f' },
    { token: 'operator', foreground: '859900' },
    { token: 'namespace', foreground: 'b58900' },
    { token: 'type', foreground: 'b58900' },
    { token: 'struct', foreground: 'b58900' },
    { token: 'class', foreground: 'b58900' },
    { token: 'interface', foreground: 'b58900' },
    { token: 'parameter', foreground: '839496' },
    { token: 'variable', foreground: '839496' },
    { token: 'function', foreground: '268bd2' },
    { token: 'member', foreground: '268bd2' },
  ],
  colors: {
    'editor.background': '#002b36',
    'editor.foreground': '#839496',
    'editor.lineHighlightBackground': '#073642',
    'editor.selectionBackground': '#274642',
    'editor.selectionHighlightBackground': '#274642',
    'editor.findMatchBackground': '#b58900',
    'editor.findMatchHighlightBackground': '#b5890040',
    'editorCursor.foreground': '#839496',
    'editorWhitespace.foreground': '#073642',
    'editorLineNumber.foreground': '#586e75',
    'editorLineNumber.activeForeground': '#93a1a1',
  },
}

// Initialize Monaco Editor with optimizations
export const initializeMonaco = () => {
  if (typeof window !== 'undefined' && window.monaco) {
    // Define custom theme
    window.monaco.editor.defineTheme('solarized-dark', editorTheme)

    // Configure Monaco languages
    window.monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      target: window.monaco.languages.typescript.ScriptTarget.ES2020,
      allowNonTsExtensions: true,
      moduleResolution:
        window.monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: window.monaco.languages.typescript.ModuleKind.CommonJS,
      noEmit: true,
      typeRoots: ['node_modules/@types'],
    })

    // Disable validation for better performance
    window.monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions(
      {
        noSemanticValidation: true,
        noSyntaxValidation: false,
      }
    )
  }
}

export default {
  monacoOptions,
  editorTheme,
  initializeMonaco,
}
