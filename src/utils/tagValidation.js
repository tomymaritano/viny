/**
 * Validates a tag name against existing tags
 * @param {string} newTag - The new tag name to validate
 * @param {string} currentTag - The current tag name (for edits)
 * @param {string[]} existingTags - Array of existing tag names
 * @returns {boolean} - Whether the tag name is valid
 */
export const validateTagName = (newTag, currentTag, existingTags) => {
  const trimmedTag = newTag?.trim()

  if (!trimmedTag) {
    return false // Empty tags not allowed
  }

  if (trimmedTag === currentTag) {
    return false // No change
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
 * @param {string} tagName - The tag name to add
 * @param {string[]} currentTags - Current array of tags
 * @returns {string[]} - Updated array of tags
 */
export const addTag = (tagName, currentTags) => {
  if (validateTagName(tagName, null, currentTags)) {
    return [...currentTags, tagName.trim()]
  }
  return currentTags
}

/**
 * Updates a tag name in an array
 * @param {string} newTag - The new tag name
 * @param {number} tagIndex - Index of the tag to update
 * @param {string[]} currentTags - Current array of tags
 * @returns {string[]} - Updated array of tags
 */
export const updateTag = (newTag, tagIndex, currentTags) => {
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
 * @param {number} tagIndex - Index of the tag to remove
 * @param {string[]} currentTags - Current array of tags
 * @returns {string[]} - Updated array of tags
 */
export const removeTag = (tagIndex, currentTags) => {
  return currentTags.filter((_, index) => index !== tagIndex)
}
