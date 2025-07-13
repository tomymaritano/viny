/**
 * Date utility functions for note metadata
 */

interface FormatDateOptions {
  includeTime?: boolean
  relative?: boolean
  longFormat?: boolean
}

/**
 * Format date for display in note metadata
 */
export const formatDate = (
  date: string | Date | null | undefined,
  options: FormatDateOptions = {}
): string => {
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
  const dateOptions: Intl.DateTimeFormatOptions = {
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
 */
export const formatRelativeDate = (date: Date): string => {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
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