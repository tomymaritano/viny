/**
 * Centralized color configuration for the editor
 * All editor colors should be defined here and can be made configurable
 */

export const defaultEditorColors = {
  // Syntax highlighting colors
  heading: '#EEC951', // Headers (yellow)
  bold: '#ED6E3F', // Bold text (orange)
  code: '#DA5677', // Code/kbd (pink)
  link: '#488076', // Links (teal)
  quote: '#488076', // Blockquotes (teal)

  // Editor theme colors - using CSS variables for theme support
  background: 'var(--color-base03)', // Editor background - uses theme variable
  text: 'var(--color-base3)', // Main text color - uses theme variable
  cursor: '#EEC951', // Cursor color (matches heading)
  placeholder: 'var(--color-base0)', // Placeholder text - uses theme variable
  lineNumber: 'var(--color-base0)', // Line numbers - uses theme variable

  // UI colors
  border: 'rgba(255, 255, 255, 0.1)', // Default borders
  borderSubtle: 'rgba(100, 100, 100, 0.3)', // Subtle borders (headings)

  // Code element backgrounds
  codeBackground: 'rgba(218, 86, 119, 0.1)', // Code background
  linkUnderline: 'rgba(72, 128, 118, 0.3)', // Link underlines
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
    root.style.setProperty(property, value)
  })
}
