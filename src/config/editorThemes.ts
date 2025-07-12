/**
 * CodeMirror Editor Theme Configuration
 * Centralized theme definitions for the InkdropEditor component
 */

import { EditorView } from '@codemirror/view'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { tags as t } from '@lezer/highlight'
import { getEditorColor } from './editorColors'
import { getEditorPadding } from './editorStyles'

/**
 * Creates the main Inkdrop-style editor theme
 */
export const createInkdropTheme = () => {
  return EditorView.theme({
    '&': {
      color: getEditorColor('text'),
      backgroundColor: getEditorColor('background'),
      fontSize: '12px',
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      height: '100%',
    },
    '.cm-content': {
      padding: getEditorPadding(),
      caretColor: getEditorColor('cursor'),
      minHeight: '100%',
      lineHeight: '1.5',
      backgroundColor: getEditorColor('background'),
      fontSize: '12px',
    },
    '.cm-cursor, .cm-dropCursor': {
      borderLeft: `2px solid ${getEditorColor('cursor')}`,
    },
    '.cm-focused': {
      outline: 'none',
    },
    '.cm-editor': {
      border: 'none',
      backgroundColor: getEditorColor('background'),
    },
    '.cm-scroller': {
      overflow: 'auto',
      height: '100%',
      backgroundColor: getEditorColor('background'),
    },
    '.cm-lineNumbers': {
      paddingRight: '4px',
      minWidth: '20px',
      color: getEditorColor('lineNumber'),
      backgroundColor: getEditorColor('background'),
    },
    '.cm-gutters': {
      backgroundColor: getEditorColor('background'),
      color: getEditorColor('lineNumber'),
      border: 'none',
    },
  })
}

/**
 * Creates the placeholder theme for empty editor state
 */
export const createPlaceholderTheme = () => {
  return EditorView.theme({
    '.cm-placeholder': {
      color: getEditorColor('placeholder'),
      fontStyle: 'italic',
    },
  })
}

/**
 * Creates custom syntax highlighting style
 */
export const createSyntaxHighlighting = () => {
  const highlightStyle = HighlightStyle.define([
    // Headers
    {
      tag: t.heading1,
      color: getEditorColor('heading'),
      fontWeight: '700',
      fontSize: '1.8em',
      lineHeight: '1.3',
    },
    {
      tag: t.heading2,
      color: getEditorColor('heading'),
      fontWeight: '700',
      fontSize: '1.6em',
      lineHeight: '1.3',
    },
    {
      tag: t.heading3,
      color: getEditorColor('heading'),
      fontWeight: '700',
      fontSize: '1.4em',
      lineHeight: '1.3',
    },
    {
      tag: t.heading4,
      color: getEditorColor('heading'),
      fontWeight: '600',
      fontSize: '1.2em',
      lineHeight: '1.3',
    },
    {
      tag: t.heading5,
      color: getEditorColor('heading'),
      fontWeight: '600',
      fontSize: '1.1em',
      lineHeight: '1.3',
    },
    {
      tag: t.heading6,
      color: getEditorColor('heading'),
      fontWeight: '600',
      fontSize: '1em',
      lineHeight: '1.3',
    },

    // Bold text
    { tag: t.strong, fontWeight: 'bold', color: getEditorColor('bold') },

    // Links and images
    { tag: t.link, color: getEditorColor('link'), textDecoration: 'underline' },
    { tag: t.url, color: getEditorColor('link') },

    // Code tags
    {
      tag: t.monospace,
      backgroundColor: getEditorColor('codeBackground'),
      padding: '2px 4px',
      color: getEditorColor('code'),
      borderRadius: '3px',
    },

    // Other elements
    { tag: t.emphasis, fontStyle: 'italic', color: getEditorColor('text') },
    { tag: t.quote, color: getEditorColor('quote'), fontStyle: 'italic' },
    { tag: t.list, color: getEditorColor('text') },
  ])

  return syntaxHighlighting(highlightStyle)
}

/**
 * Generates all theme-related extensions for CodeMirror
 */
export const createEditorThemeExtensions = () => {
  return [
    createInkdropTheme(),
    createPlaceholderTheme(),
    createSyntaxHighlighting(),
  ]
}

/**
 * Alternative theme configurations for different editor modes
 */
export const editorThemeVariants = {
  default: {
    name: 'Inkdrop Default',
    createExtensions: createEditorThemeExtensions,
  },

  // Future themes can be added here
  minimal: {
    name: 'Minimal',
    createExtensions: () => [
      EditorView.theme({
        '&': {
          backgroundColor: 'transparent',
          color: 'var(--color-base1)',
        },
        '.cm-content': {
          padding: getEditorPadding(),
        },
        '.cm-focused': {
          outline: 'none',
        },
      }),
      createSyntaxHighlighting(),
    ],
  },
}

/**
 * Get theme extensions by name
 * @param {string} themeName - Theme variant name
 * @returns {Array} CodeMirror extensions
 */
export const getThemeExtensions = (themeName = 'default') => {
  const theme = editorThemeVariants[themeName] || editorThemeVariants.default
  return theme.createExtensions()
}
