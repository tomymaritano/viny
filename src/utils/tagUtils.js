/**
 * Tag utility functions
 */

/**
 * Get tag color based on tag name
 * @param {string} tagName - Name of the tag
 * @param {Object} tagColors - Map of tag names to colors
 * @returns {string} Color class for the tag
 */
export const getTagColor = (tagName, tagColors = {}) => {
  const defaultColors = [
    'theme-tag-blue',
    'theme-tag-green',
    'theme-tag-purple',
    'theme-tag-cyan',
    'theme-tag-orange',
    'theme-tag-pink',
    'theme-tag-indigo',
    'theme-tag-amber',
    'theme-tag-emerald',
    'theme-tag-red',
    'theme-tag-violet',
  ]

  // Check if tag has a custom color
  if (tagColors[tagName]) {
    return tagColors[tagName]
  }

  // Generate consistent color based on tag name hash
  let hash = 0
  for (let i = 0; i < tagName.length; i++) {
    hash = tagName.charCodeAt(i) + ((hash << 5) - hash)
  }

  const index = Math.abs(hash) % defaultColors.length
  return defaultColors[index]
}

/**
 * Get circle color for tag (converts theme-tag-* to bg-*)
 * @param {string} tagName - Name of the tag
 * @param {Object} tagColors - Map of tag names to colors
 * @returns {string} Background color class
 */
export const getTagCircleColor = (tagName, tagColors = {}) => {
  const tagColorClass = getTagColor(tagName, tagColors)

  // Map theme-tag-* classes to corresponding background colors
  const colorMap = {
    'theme-tag-blue': 'bg-blue-500',
    'theme-tag-green': 'bg-green-500',
    'theme-tag-purple': 'bg-purple-500',
    'theme-tag-cyan': 'bg-cyan-500',
    'theme-tag-orange': 'bg-orange-500',
    'theme-tag-pink': 'bg-pink-500',
    'theme-tag-indigo': 'bg-indigo-500',
    'theme-tag-amber': 'bg-amber-500',
    'theme-tag-emerald': 'bg-emerald-500',
    'theme-tag-red': 'bg-red-500',
    'theme-tag-violet': 'bg-violet-500',
    'theme-tag-default': 'bg-gray-500',
  }

  return colorMap[tagColorClass] || 'bg-gray-500'
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
