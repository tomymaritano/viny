/**
 * Date utility functions for note metadata
 */

/**
 * Format date for display in note metadata
 * @param {string|Date} date - Date to format
 * @param {Object} options - Formatting options
 * @returns {string} Formatted date string
 */
export const formatDate = (date, options = {}) => {
  if (!date) return ''

  const { includeTime = true, relative = false, longFormat = false } = options

  const dateObj = typeof date === 'string' ? new Date(date) : date

  if (isNaN(dateObj.getTime())) {
    return 'Invalid date'
  }

  if (relative) {
    return formatRelativeDate(dateObj)
  }

  if (longFormat) {
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...(includeTime && {
        hour: '2-digit',
        minute: '2-digit',
      }),
    })
  }

  // Default format
  const dateOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }

  if (includeTime) {
    dateOptions.hour = '2-digit'
    dateOptions.minute = '2-digit'
  }

  return dateObj.toLocaleDateString('en-US', dateOptions)
}

/**
 * Format date relative to now (e.g., "2 hours ago", "Yesterday")
 * @param {Date} date - Date to format
 * @returns {string} Relative date string
 */
export const formatRelativeDate = date => {
  const now = new Date()
  const diffMs = now - date
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)
  const diffWeeks = Math.floor(diffDays / 7)
  const diffMonths = Math.floor(diffDays / 30)
  const diffYears = Math.floor(diffDays / 365)

  if (diffSecs < 60) {
    return 'Just now'
  } else if (diffMins < 60) {
    return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
  } else if (diffDays === 1) {
    return 'Yesterday'
  } else if (diffDays < 7) {
    return `${diffDays} days ago`
  } else if (diffWeeks === 1) {
    return '1 week ago'
  } else if (diffWeeks < 4) {
    return `${diffWeeks} weeks ago`
  } else if (diffMonths === 1) {
    return '1 month ago'
  } else if (diffMonths < 12) {
    return `${diffMonths} months ago`
  } else if (diffYears === 1) {
    return '1 year ago'
  } else {
    return `${diffYears} years ago`
  }
}

/**
 * Get time of day greeting
 * @param {Date} date - Date to get greeting for (defaults to now)
 * @returns {string} Time-based greeting
 */
export const getTimeGreeting = (date = new Date()) => {
  const hour = date.getHours()

  if (hour < 6) return 'Good night'
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  if (hour < 22) return 'Good evening'
  return 'Good night'
}

/**
 * Check if date is today
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if date is today
 */
export const isToday = date => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const today = new Date()

  return dateObj.toDateString() === today.toDateString()
}

/**
 * Check if date is yesterday
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if date is yesterday
 */
export const isYesterday = date => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)

  return dateObj.toDateString() === yesterday.toDateString()
}

/**
 * Get human-readable file size
 * @param {number} bytes - Size in bytes
 * @returns {string} Human-readable size
 */
export const formatFileSize = bytes => {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Calculate reading time based on word count
 * @param {string} content - Text content
 * @param {number} wordsPerMinute - Reading speed (default: 250)
 * @returns {string} Reading time estimate
 */
export const calculateReadingTime = (content, wordsPerMinute = 250) => {
  if (!content) return '0 min read'

  const words = content.trim().split(/\s+/).length
  const minutes = Math.ceil(words / wordsPerMinute)

  return `${minutes} min read`
}
