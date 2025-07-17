/**
 * Centralized color configuration for the editor
 * All editor colors should be defined here and can be made configurable
 */

export const defaultEditorColors = {
  // Syntax highlighting colors - Using brand colors via CSS variables
  heading: 'var(--color-yellow)', // Headers - brand yellow
  bold: 'var(--color-orange)', // Bold text - brand orange
  code: 'var(--editor-code-color)', // Code/kbd - theme-aware color
  link: 'var(--color-cyan)', // Links - brand cyan
  quote: 'var(--color-cyan)', // Blockquotes - brand cyan

  // Editor theme colors - using CSS variables for theme support
  background: 'var(--color-base03)', // Editor background
  text: 'var(--editor-text-color)', // Main text color - theme-aware
  cursor: 'var(--color-yellow)', // Cursor color - brand yellow
  placeholder: 'var(--color-base0)', // Placeholder text
  lineNumber: 'var(--color-base0)', // Line numbers
  list: 'var(--editor-list-color)', // List items - theme-aware

  // UI colors
  border: 'var(--color-base01)', // Borders use theme color
  borderSubtle: 'var(--color-base00)', // Subtle borders

  // Code element backgrounds
  codeBackground: 'var(--editor-code-background)', // Code background - theme-aware
  linkUnderline: 'var(--color-cyan)', // Link underlines - brand cyan
}

/**
 * Get color value with CSS variable fallback
 * @param {string} colorKey - Key from defaultEditorColors
 * @param {string} fallback - Fallback color if CSS variable not found
 * @returns {string} CSS color value or CSS variable
 */
export const getEditorColor = (colorKey, fallback = null) => {
  const cssVar = `--editor-color-${colorKey.replace(/([A-Z])/g, '-$1').toLowerCase()}`
  return `var(${cssVar}, ${fallback || defaultEditorColors[colorKey]})`
}

/**
 * Generate CSS variables for all editor colors
 * @param {object} colors - Color overrides (optional)
 * @returns {object} CSS variables object
 */
export const generateEditorColorVariables = (colors = {}) => {
  const mergedColors = { ...defaultEditorColors, ...colors }
  const cssVariables = {}

  Object.entries(mergedColors).forEach(([key, value]) => {
    const cssVar = `--editor-color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`
    cssVariables[cssVar] = value
  })

  return cssVariables
}

/**
 * Apply editor color variables to document root
 * @param {object} colors - Color overrides (optional)
 */
export const applyEditorColors = (colors = {}) => {
  const variables = generateEditorColorVariables(colors)
  const root = document.documentElement

  Object.entries(variables).forEach(([property, value]) => {
    root.style.setProperty(property, value as string)
  })
}
