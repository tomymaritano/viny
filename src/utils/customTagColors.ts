/**
 * Custom Tag Colors Utility
 * Provides functions to work with custom tag colors instead of Tailwind defaults
 */

import {
  CUSTOM_TAG_COLORS,
  PREDEFINED_TAG_COLORS,
  TAG_COLOR_OPTIONS,
} from '../constants/theme'

interface TagColor {
  bg: string
  border: string
  text: string
  name: string
}

interface CustomTagColors {
  [tagName: string]: string
}

/**
 * Get custom color for a tag
 */
export const getCustomTagColor = (
  tagName: string,
  customTagColors: CustomTagColors = {}
): TagColor => {
  const lowerTagName = tagName.toLowerCase()

  // Check if user has set a custom color for this tag
  if (
    customTagColors[lowerTagName] &&
    CUSTOM_TAG_COLORS[customTagColors[lowerTagName]]
  ) {
    return CUSTOM_TAG_COLORS[customTagColors[lowerTagName]]
  }

  // Check predefined colors for common tag types
  if (PREDEFINED_TAG_COLORS[lowerTagName]) {
    return CUSTOM_TAG_COLORS[PREDEFINED_TAG_COLORS[lowerTagName]]
  }

  // Generate consistent color based on tag name hash
  let hash = 0
  for (let i = 0; i < tagName.length; i++) {
    hash = tagName.charCodeAt(i) + ((hash << 5) - hash)
  }

  const colorIndex = Math.abs(hash) % TAG_COLOR_OPTIONS.length
  const colorKey = TAG_COLOR_OPTIONS[colorIndex]
  return CUSTOM_TAG_COLORS[colorKey]
}

interface TagStyle {
  backgroundColor: string
  border: string
  color: string
}

/**
 * Get CSS style object for a tag
 */
export const getTagStyle = (
  tagName: string,
  customTagColors: CustomTagColors = {}
): TagStyle => {
  const color = getCustomTagColor(tagName, customTagColors)
  return {
    backgroundColor: color.bg,
    border: `1px solid ${color.border}`,
    color: color.text,
  }
}

/**
 * Get Tailwind-compatible CSS classes for a tag (fallback for components that need classes)
 */
export const getTagClasses = (
  tagName: string,
  customTagColors: CustomTagColors = {}
): string => {
  // Return base classes and use CSS custom properties for colors
  return `tag-custom border rounded-md px-2 py-1 text-xs font-medium transition-colors hover:opacity-80`
}

/**
 * Get available color options for tag selection
 * @returns {Array} Array of color options with preview data
 */
export const getAvailableTagColors = () => {
  return TAG_COLOR_OPTIONS.map(colorKey => ({
    key: colorKey,
    name: CUSTOM_TAG_COLORS[colorKey].name,
    preview: CUSTOM_TAG_COLORS[colorKey],
  }))
}

/**
 * Convert old Tailwind color format to new custom color key
 * @param {string} oldColorClass - Old Tailwind color class
 * @returns {string} New color key or default
 */
export const migrateOldColorToNew = oldColorClass => {
  const migrationMap = {
    'bg-blue-900/40 border-blue-500/50 text-blue-300': 'ocean',
    'bg-green-900/40 border-green-500/50 text-green-300': 'forest',
    'bg-purple-900/40 border-purple-500/50 text-purple-300': 'royal',
    'bg-pink-900/40 border-pink-500/50 text-pink-300': 'rose',
    'bg-yellow-900/40 border-yellow-500/50 text-yellow-300': 'golden',
    'bg-indigo-900/40 border-indigo-500/50 text-indigo-300': 'lavender',
    'bg-red-900/40 border-red-500/50 text-red-300': 'cherry',
    'bg-cyan-900/40 border-cyan-500/50 text-cyan-300': 'turquoise',
    'bg-orange-900/40 border-orange-500/50 text-orange-300': 'sunset',
    'bg-emerald-900/40 border-emerald-500/50 text-emerald-300': 'sage',
    'bg-gray-800/40 border-gray-500/50 text-gray-300': 'steel',
  }

  return migrationMap[oldColorClass] || 'ocean'
}

/**
 * Generate CSS custom properties for tag colors
 * @returns {string} CSS custom properties string
 */
export const generateTagColorCSS = () => {
  let css = ':root {\n'

  Object.entries(CUSTOM_TAG_COLORS).forEach(([key, color]) => {
    css += `  --tag-${key}-bg: ${color.bg};\n`
    css += `  --tag-${key}-border: ${color.border};\n`
    css += `  --tag-${key}-text: ${color.text};\n`
  })

  css += '}\n'
  return css
}
