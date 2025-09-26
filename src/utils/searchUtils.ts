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

// ======================================
// Enhanced Search Utilities for Advanced Search Components
// ======================================

export interface HighlightedText {
  text: string
  highlighted: boolean
}

/**
 * Advanced fuzzy search with scoring algorithm
 * Returns matches ranked by relevance score
 */
export function fuzzySearch<T>(
  items: T[],
  query: string,
  getSearchableText: (item: T) => string,
  options: {
    threshold?: number
    maxResults?: number
    caseSensitive?: boolean
  } = {}
): T[] {
  const { threshold = 0.3, maxResults = 50, caseSensitive = false } = options

  if (!query.trim()) {
    return items.slice(0, maxResults)
  }

  const searchQuery = caseSensitive ? query : query.toLowerCase()
  const results: Array<{ item: T; score: number }> = []

  for (const item of items) {
    const text = caseSensitive
      ? getSearchableText(item)
      : getSearchableText(item).toLowerCase()

    const score = calculateFuzzyScore(text, searchQuery)

    if (score >= threshold) {
      results.push({ item, score })
    }
  }

  // Sort by score (descending) and return items
  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
    .map(result => result.item)
}

/**
 * Calculate fuzzy match score between text and query
 * Returns a score between 0 and 1, where 1 is a perfect match
 */
function calculateFuzzyScore(text: string, query: string): number {
  if (text === query) return 1
  if (!query || !text) return 0

  // Exact substring match gets high score
  if (text.includes(query)) {
    const startBonus = text.startsWith(query) ? 0.3 : 0
    const lengthRatio = query.length / text.length
    return 0.8 + startBonus + lengthRatio * 0.2
  }

  // Character-by-character fuzzy matching
  let queryIndex = 0
  let matchedChars = 0
  let consecutiveMatches = 0
  let maxConsecutive = 0

  for (let i = 0; i < text.length && queryIndex < query.length; i++) {
    if (text[i] === query[queryIndex]) {
      matchedChars++
      queryIndex++
      consecutiveMatches++
      maxConsecutive = Math.max(maxConsecutive, consecutiveMatches)
    } else {
      consecutiveMatches = 0
    }
  }

  if (matchedChars === 0) return 0

  const matchRatio = matchedChars / query.length
  const consecutiveBonus = (maxConsecutive / query.length) * 0.3
  const lengthPenalty = Math.min(text.length / (query.length * 3), 1) * 0.1

  return matchRatio * 0.7 + consecutiveBonus - lengthPenalty
}

/**
 * Highlight matching characters in text based on search query
 */
export function highlightMatches(
  text: string,
  query: string,
  caseSensitive = false
): HighlightedText[] {
  if (!query.trim()) {
    return [{ text, highlighted: false }]
  }

  const searchText = caseSensitive ? text : text.toLowerCase()
  const searchQuery = caseSensitive ? query : query.toLowerCase()

  // First try exact substring match
  const exactIndex = searchText.indexOf(searchQuery)
  if (exactIndex !== -1) {
    const parts: HighlightedText[] = []

    if (exactIndex > 0) {
      parts.push({ text: text.substring(0, exactIndex), highlighted: false })
    }

    parts.push({
      text: text.substring(exactIndex, exactIndex + query.length),
      highlighted: true,
    })

    if (exactIndex + query.length < text.length) {
      parts.push({
        text: text.substring(exactIndex + query.length),
        highlighted: false,
      })
    }

    return parts
  }

  // Fallback to character-by-character highlighting
  const result: HighlightedText[] = []
  let queryIndex = 0
  let currentSegment = ''
  let isHighlighted = false

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    const matches =
      queryIndex < query.length && searchText[i] === searchQuery[queryIndex]

    if (matches !== isHighlighted) {
      // Segment boundary - save current segment
      if (currentSegment) {
        result.push({ text: currentSegment, highlighted: isHighlighted })
        currentSegment = ''
      }
      isHighlighted = matches
    }

    currentSegment += char

    if (matches) {
      queryIndex++
    }
  }

  // Add final segment
  if (currentSegment) {
    result.push({ text: currentSegment, highlighted: isHighlighted })
  }

  return result
}

/**
 * Performance-optimized search with memoization
 */
export class SearchCache<T> {
  private cache = new Map<string, T[]>()
  private maxCacheSize: number

  constructor(maxCacheSize = 100) {
    this.maxCacheSize = maxCacheSize
  }

  search(
    items: T[],
    query: string,
    searchFn: (items: T[], query: string) => T[],
    cacheKey?: string
  ): T[] {
    const key = cacheKey || `${query}_${items.length}`

    if (this.cache.has(key)) {
      return this.cache.get(key)!
    }

    const results = searchFn(items, query)

    // Manage cache size
    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }

    this.cache.set(key, results)
    return results
  }

  clear(): void {
    this.cache.clear()
  }

  has(key: string): boolean {
    return this.cache.has(key)
  }
}

/**
 * Debounced search hook for React components
 */
export function createDebouncedSearch<T>(
  searchFn: (query: string) => T[],
  delay = 300
) {
  let timeoutId: NodeJS.Timeout | null = null

  return (query: string, callback: (results: T[]) => void) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      const results = searchFn(query)
      callback(results)
      timeoutId = null
    }, delay)
  }
}

/**
 * Virtual scrolling helpers for large lists
 */
export interface VirtualScrollConfig {
  itemHeight: number
  containerHeight: number
  overscan?: number
}

export function calculateVirtualItems<T>(
  items: T[],
  scrollTop: number,
  config: VirtualScrollConfig
) {
  const { itemHeight, containerHeight, overscan = 5 } = config

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  )

  const visibleItems = items.slice(startIndex, endIndex + 1)
  const totalHeight = items.length * itemHeight
  const offsetY = startIndex * itemHeight

  return {
    visibleItems,
    startIndex,
    endIndex,
    totalHeight,
    offsetY,
  }
}
