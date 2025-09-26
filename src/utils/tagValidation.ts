/**
 * Validates a tag name against existing tags
 */
export const validateTagName = (
  newTag: string,
  currentTag: string | null,
  existingTags: string[]
): boolean => {
  const trimmedTag = newTag?.trim()

  if (!trimmedTag) {
    return false // Empty tags not allowed
  }

  // Allow the change if it's the same tag with different case
  if (trimmedTag.toLowerCase() === currentTag?.toLowerCase()) {
    return true // Allow capitalization changes
  }

  // Case-insensitive duplicate check
  const existingTagsLower = existingTags.map(tag => tag.toLowerCase())
  if (existingTagsLower.includes(trimmedTag.toLowerCase())) {
    return false // Duplicate tag
  }

  return true
}

/**
 * Adds a new tag to an array if valid
 */
export const addTag = (tagName: string, currentTags: string[]): string[] => {
  if (validateTagName(tagName, null, currentTags)) {
    return [...currentTags, tagName.trim()]
  }
  return currentTags
}

/**
 * Updates a tag name in an array
 */
export const updateTag = (
  newTag: string,
  tagIndex: number,
  currentTags: string[]
): string[] => {
  const currentTag = currentTags[tagIndex]
  const otherTags = currentTags.filter((_, index) => index !== tagIndex)

  if (validateTagName(newTag, currentTag, otherTags)) {
    const updatedTags = [...currentTags]
    updatedTags[tagIndex] = newTag.trim()
    return updatedTags
  }

  return currentTags
}

/**
 * Removes a tag from an array
 */
export const removeTag = (
  tagIndex: number,
  currentTags: string[]
): string[] => {
  return currentTags.filter((_, index) => index !== tagIndex)
}
