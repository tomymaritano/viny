/**
 * Shared ID generation utilities to eliminate duplicated ID logic across hooks
 */

/**
 * Generates a random string suffix for IDs
 */
const generateRandomSuffix = (): string => {
  return Math.random().toString(36).substr(2, 9)
}

/**
 * Generates a timestamp-based ID
 */
const generateTimestampId = (): string => {
  return Date.now().toString()
}

/**
 * Generates a note ID with consistent format
 */
export const generateNoteId = (): string => {
  return `note_${generateTimestampId()}_${generateRandomSuffix()}`
}

/**
 * Generates a notebook ID with consistent format
 */
export const generateNotebookId = (): string => {
  return `notebook_${generateTimestampId()}_${generateRandomSuffix()}`
}

/**
 * Generates a toast ID with consistent format
 */
export const generateToastId = (): string => {
  return `toast_${generateTimestampId()}_${generateRandomSuffix()}`
}

/**
 * Generates a generic ID with custom prefix
 */
export const generateId = (prefix: string): string => {
  return `${prefix}_${generateTimestampId()}_${generateRandomSuffix()}`
}

/**
 * Generates a simple timestamp-based ID (for backwards compatibility)
 */
export const generateSimpleId = (): string => {
  return generateTimestampId()
}

/**
 * Validates if an ID follows the expected format
 */
export const isValidId = (id: string, prefix?: string): boolean => {
  if (!id || typeof id !== 'string') {
    return false
  }
  
  if (prefix) {
    return id.startsWith(`${prefix}_`) && id.split('_').length === 3
  }
  
  // Check for any valid format (prefix_timestamp_random)
  const parts = id.split('_')
  return parts.length === 3 && !isNaN(Number(parts[1]))
}

/**
 * Extracts timestamp from ID
 */
export const getTimestampFromId = (id: string): number | null => {
  const parts = id.split('_')
  if (parts.length >= 2) {
    const timestamp = Number(parts[1])
    return isNaN(timestamp) ? null : timestamp
  }
  return null
}

/**
 * Extracts prefix from ID
 */
export const getPrefixFromId = (id: string): string | null => {
  const parts = id.split('_')
  return parts.length >= 3 ? parts[0] : null
}