/**
 * Tag utility functions
 */

import { getCustomTagColor } from './customTagColors'

/**
 * Get tag color based on tag name using custom color system
 * @param {string} tagName - Name of the tag
 * @param {Object} tagColors - Map of tag names to color keys
 * @returns {Object} Color object with style properties
 */
export const getTagColor = (tagName, tagColors = {}) => {
  return getCustomTagColor(tagName, tagColors)
}

/**
 * Get circle color for tag using custom color system
 * @param {string} tagName - Name of the tag
 * @param {Object} tagColors - Map of tag names to color keys
 * @returns {string} Background color for circles/dots
 */
export const getTagCircleColor = (tagName, tagColors = {}) => {
  const colorObj = getTagColor(tagName, tagColors)
  return colorObj.text // Use the text color as the circle color for visibility
}

/**
 * Sort tags by count or alphabetically
 * @param {Array} tags - Array of tag objects with tag and count properties
 * @param {string} sortBy - Sort method: 'count' or 'alpha'
 * @returns {Array} Sorted tags
 */
export const sortTags = (tags, sortBy = 'count') => {
  if (sortBy === 'count') {
    return [...tags].sort((a, b) => b.count - a.count)
  } else if (sortBy === 'alpha') {
    return [...tags].sort((a, b) => a.tag.localeCompare(b.tag))
  }
  return tags
}

/**
 * Validate tag name
 * @param {string} tagName - Tag name to validate
 * @returns {Object} { isValid: boolean, error?: string }
 */
export const validateTagName = tagName => {
  if (!tagName || tagName.trim().length === 0) {
    return { isValid: false, error: 'Tag name cannot be empty' }
  }

  if (tagName.length > 50) {
    return { isValid: false, error: 'Tag name cannot exceed 50 characters' }
  }

  // Only allow alphanumeric, hyphen, and underscore
  const validPattern = /^[a-zA-Z0-9_-]+$/
  if (!validPattern.test(tagName)) {
    return {
      isValid: false,
      error:
        'Tag name can only contain letters, numbers, hyphens, and underscores',
    }
  }

  return { isValid: true }
}

/**
 * Format tag for display
 * @param {string} tagName - Tag name
 * @param {boolean} includeHash - Whether to include # prefix
 * @returns {string} Formatted tag name
 */
export const formatTagDisplay = (tagName, includeHash = true) => {
  const formatted = tagName.toLowerCase().replace(/[^a-z0-9_-]/g, '-')
  return includeHash ? `#${formatted}` : formatted
}
