/**
 * CodeMirror Extensions Configuration
 * Centralized configuration for all CodeMirror extensions
 */

import { minimalSetup } from 'codemirror'
import {
  EditorView,
  keymap,
  placeholder as placeholderExtension,
  lineNumbers,
} from '@codemirror/view'
import {
  history,
  defaultKeymap,
  historyKeymap,
  insertNewlineAndIndent,
} from '@codemirror/commands'
import { searchKeymap, search } from '@codemirror/search'
import { markdown } from '@codemirror/lang-markdown'
import { getThemeExtensions } from './editorThemes'
import { imageWidgetPlugin } from './editorImageWidget'
import { enhancedMarkdownKeybindings } from './editorKeybindingsEnhanced'
import { smartPasteExtension } from './editorSmartPaste'
import { slashMenuExtension } from './editorSlashMenu'
import { linkPreviewExtension, linkClickHandler, autoLinkExtension } from './editorLinkPreview'

/**
 * Creates the core set of editor extensions
 * @param {Object} options - Configuration options
 * @param {string} options.placeholder - Placeholder text
 * @param {boolean} options.showLineNumbers - Whether to show line numbers
 * @param {Function} options.onChange - Change handler function
 * @param {string} options.theme - Theme variant name
 * @returns {Array} Array of CodeMirror extensions
 */
interface EditorExtensionsOptions {
  placeholder?: string
  showLineNumbers?: boolean
  onChange?: (value: string) => void
  theme?: string
}

export const createEditorExtensions = ({
  placeholder = 'Start writing your markdown here...',
  showLineNumbers = false,
  onChange,
  theme = 'default',
}: EditorExtensionsOptions = {}) => {
  const extensions = [
    // Core functionality
    minimalSetup,
    history(),

    // Keyboard shortcuts (custom keybindings first to have priority)
    enhancedMarkdownKeybindings, // Enhanced markdown formatting shortcuts with Tab support
    keymap.of([...defaultKeymap, ...historyKeymap, ...searchKeymap]),

    // Features
    search(),
    markdown(),
    imageWidgetPlugin, // Display images inline
    smartPasteExtension, // Smart paste with HTML to Markdown conversion
    slashMenuExtension, // Slash menu with visual feedback
    linkPreviewExtension, // Show link preview on hover
    linkClickHandler, // Handle link clicks
    autoLinkExtension, // Auto-detect and convert URLs to links

    // Theme and appearance
    ...getThemeExtensions(theme),
    placeholderExtension(placeholder),

    // Editor behavior
    EditorView.lineWrapping, // Enable line wrapping

    // Change listener
    ...(onChange
      ? [
          EditorView.updateListener.of(update => {
            if (update.docChanged) {
              const newValue = update.state.doc.toString()
              onChange(newValue)
            }
          }),
        ]
      : []),
  ]

  // Conditionally add line numbers
  if (showLineNumbers) {
    extensions.push(lineNumbers())
  }

  return extensions
}

/**
 * Extension categories for modular configuration
 */
export const extensionCategories = {
  core: [minimalSetup, history()],

  keyboard: [keymap.of([...defaultKeymap, ...historyKeymap, ...searchKeymap])],

  features: [search(), markdown(), imageWidgetPlugin, smartPasteExtension, slashMenuExtension, linkPreviewExtension, linkClickHandler, autoLinkExtension],

  behavior: [EditorView.lineWrapping],

  optional: {
    lineNumbers: () => [lineNumbers()],
    placeholder: text => [placeholderExtension(text)],
    changeListener: onChange => [
      EditorView.updateListener.of(update => {
        if (update.docChanged) {
          const newValue = update.state.doc.toString()
          onChange(newValue)
        }
      }),
    ],
  },
}

interface ExtensionCategoriesOptions {
  includeCore?: boolean
  includeKeyboard?: boolean
  includeFeatures?: boolean
  includeBehavior?: boolean
  lineNumbers?: boolean
  placeholder?: string
  onChange?: (value: string) => void
  theme?: string
  customExtensions?: any[]
}

/**
 * Create extensions from categories
 * @param {Object} options - Configuration options
 * @returns {Array} CodeMirror extensions
 */
export const createExtensionsFromCategories = (
  options: ExtensionCategoriesOptions = {}
) => {
  const {
    includeCore = true,
    includeKeyboard = true,
    includeFeatures = true,
    includeBehavior = true,
    lineNumbers = false,
    placeholder = '',
    onChange,
    theme = 'default',
    customExtensions = [],
  } = options

  const extensions = []

  // Add core categories
  if (includeCore) extensions.push(...extensionCategories.core)
  if (includeKeyboard) extensions.push(...extensionCategories.keyboard)
  if (includeFeatures) extensions.push(...extensionCategories.features)
  if (includeBehavior) extensions.push(...extensionCategories.behavior)

  // Add theme
  extensions.push(...getThemeExtensions(theme))

  // Add optional extensions
  if (lineNumbers) {
    extensions.push(...extensionCategories.optional.lineNumbers())
  }

  if (placeholder) {
    extensions.push(...extensionCategories.optional.placeholder(placeholder))
  }

  if (onChange) {
    extensions.push(...extensionCategories.optional.changeListener(onChange))
  }

  // Add any custom extensions
  if (customExtensions.length > 0) {
    extensions.push(...customExtensions)
  }

  return extensions
}

/**
 * Preset configurations for common use cases
 */
export const editorPresets = {
  minimal: {
    includeCore: true,
    includeKeyboard: false,
    includeFeatures: false,
    includeBehavior: true,
    theme: 'minimal',
  },

  full: {
    includeCore: true,
    includeKeyboard: true,
    includeFeatures: true,
    includeBehavior: true,
    lineNumbers: true,
    theme: 'default',
  },

  writing: {
    includeCore: true,
    includeKeyboard: true,
    includeFeatures: true,
    includeBehavior: true,
    lineNumbers: false,
    theme: 'default',
  },
}

/**
 * Get extensions for a specific preset
 * @param {string} presetName - Preset name
 * @param {Object} overrides - Option overrides
 * @returns {Array} CodeMirror extensions
 */
export const getPresetExtensions = (presetName, overrides = {}) => {
  const preset = editorPresets[presetName] || editorPresets.full
  const options = { ...preset, ...overrides }
  return createExtensionsFromCategories(options)
}
