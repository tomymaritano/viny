/**
 * Search utility functions for highlighting and formatting
 */

/**
 * Highlight search terms in text
 * @param {string} text - Text to highlight
 * @param {string} searchTerm - Term to highlight
 * @returns {string} HTML string with highlighted terms
 */
export const highlightText = (text, searchTerm) => {
  if (!searchTerm.trim()) return text

  const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi')
  return text.replace(regex, '<mark class="search-highlight">$1</mark>')
}

/**
 * Escape special regex characters
 * @param {string} string - String to escape
 * @returns {string} Escaped string
 */
export const escapeRegExp = string => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Truncate text to specified length with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 100) => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + '...'
}

/**
 * Extract preview text from content
 * @param {string} content - Full content
 * @param {string} searchTerm - Search term for context
 * @param {number} previewLength - Preview length
 * @returns {string} Preview text
 */
export const extractPreview = (
  content,
  searchTerm = '',
  previewLength = 150
) => {
  if (!content) return ''

  // Remove markdown formatting for preview
  const cleanContent = content
    .replace(/#{1,6}\s+/g, '') // Remove headers
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.*?)\*/g, '$1') // Remove italic
    .replace(/`(.*?)`/g, '$1') // Remove inline code
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links
    .replace(/\n+/g, ' ') // Replace newlines with spaces
    .trim()

  if (
    searchTerm &&
    cleanContent.toLowerCase().includes(searchTerm.toLowerCase())
  ) {
    // Find the position of the search term for context
    const termIndex = cleanContent
      .toLowerCase()
      .indexOf(searchTerm.toLowerCase())
    const contextStart = Math.max(0, termIndex - 50)
    const contextEnd = Math.min(
      cleanContent.length,
      termIndex + searchTerm.length + 100
    )

    let preview = cleanContent.substring(contextStart, contextEnd)
    if (contextStart > 0) preview = '...' + preview
    if (contextEnd < cleanContent.length) preview = preview + '...'

    return preview
  }

  return truncateText(cleanContent, previewLength)
}

/**
 * Format date for search results
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatSearchDate = date => {
  if (!date) return ''

  const dateObj = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffMs = now - dateObj
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return 'Today'
  } else if (diffDays === 1) {
    return 'Yesterday'
  } else if (diffDays < 7) {
    return `${diffDays} days ago`
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7)
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30)
    return `${months} month${months > 1 ? 's' : ''} ago`
  } else {
    return dateObj.toLocaleDateString()
  }
}

/**
 * Get icon for search result type
 * @param {Object} note - Note object
 * @returns {string} Icon name
 */
export const getSearchResultIcon = note => {
  if (note.isPinned) return 'Pin'
  if (note.tags && note.tags.length > 0) return 'Tag'
  if (note.notebook) return 'FolderOpen'
  return 'FileText'
}

/**
 * Sort search results by relevance
 * @param {Array} results - Search results
 * @param {string} searchTerm - Search term
 * @returns {Array} Sorted results
 */
export const sortSearchResults = (results, searchTerm) => {
  if (!searchTerm) return results

  const term = searchTerm.toLowerCase()

  return results.sort((a, b) => {
    // Prioritize title matches
    const aTitleMatch = a.title.toLowerCase().includes(term)
    const bTitleMatch = b.title.toLowerCase().includes(term)

    if (aTitleMatch && !bTitleMatch) return -1
    if (!aTitleMatch && bTitleMatch) return 1

    // Then prioritize exact matches
    const aExactTitle = a.title.toLowerCase() === term
    const bExactTitle = b.title.toLowerCase() === term

    if (aExactTitle && !bExactTitle) return -1
    if (!aExactTitle && bExactTitle) return 1

    // Then by pinned status
    if (a.isPinned && !b.isPinned) return -1
    if (!a.isPinned && b.isPinned) return 1

    // Finally by last modified date
    return new Date(b.lastModified || 0) - new Date(a.lastModified || 0)
  })
}

/**
 * Create keyboard shortcut description
 * @param {Array} keys - Array of key names
 * @returns {string} Formatted shortcut string
 */
export const formatKeyboardShortcut = keys => {
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0

  return keys
    .map(key => {
      switch (key) {
        case 'cmd':
          return isMac ? '⌘' : 'Ctrl'
        case 'shift':
          return '⇧'
        case 'alt':
          return isMac ? '⌥' : 'Alt'
        case 'enter':
          return '↵'
        case 'escape':
          return '⎋'
        case 'tab':
          return '⇥'
        case 'up':
          return '↑'
        case 'down':
          return '↓'
        default:
          return key.toUpperCase()
      }
    })
    .join(' + ')
}
