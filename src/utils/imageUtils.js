// Image utilities for secure image handling
// These utilities help users work with images while maintaining security
//
// SECURITY POLICY:
// This application blocks external image URLs for security and privacy reasons:
// - Prevents tracking pixels and analytics
// - Blocks potentially malicious content
// - Ensures user privacy
// - Makes notes self-contained and portable
//
// ALLOWED IMAGE SOURCES:
// ✅ data: URIs (base64 encoded images)
// ✅ blob: URLs (temporary URLs for uploaded files)
// ✅ Relative paths (./image.jpg, /assets/image.png)
// ✅ Same-origin URLs (same domain)
// ❌ External URLs (https://external-site.com/image.jpg)
//
// RECOMMENDATIONS:
// - For small images: Convert to data URI using fileToDataUri()
// - For large images: Use blob URLs with createBlobUrl()
// - For permanent images: Save locally and use relative paths

/**
 * Converts a File object to a data URI
 * @param {File} file - The image file
 * @returns {Promise<string>} - Promise that resolves to a data URI
 */
export function fileToDataUri(file) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('File must be an image'))
      return
    }

    const reader = new FileReader()
    reader.onload = e => resolve(e.target.result)
    reader.onerror = e => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

/**
 * Creates a blob URL from a File object
 * @param {File} file - The image file
 * @returns {string} - Blob URL
 */
export function createBlobUrl(file) {
  if (!file.type.startsWith('image/')) {
    throw new Error('File must be an image')
  }
  return URL.createObjectURL(file)
}

/**
 * Validates if an image URL is allowed by our security policy
 * @param {string} url - The image URL to validate
 * @returns {boolean} - True if URL is allowed
 */
export function isImageUrlAllowed(url) {
  // Allow data URIs
  if (url.startsWith('data:image/')) return true

  // Allow blob URLs
  if (url.startsWith('blob:')) return true

  // Allow nototo:// image references
  if (url.startsWith('nototo://image:')) return true

  // Allow relative paths (local files)
  if (!url.includes('://')) return true

  // Allow same-origin URLs
  if (url.startsWith(window.location.origin)) return true

  // Block external URLs for security
  return false
}

/**
 * Sanitizes an image URL, returning a safe placeholder if needed
 * @param {string} url - The image URL to sanitize
 * @returns {string} - Safe image URL or placeholder
 */
export function sanitizeImageUrl(url) {
  if (isImageUrlAllowed(url)) {
    return url
  }

  // Return placeholder for blocked URLs
  return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iMzAiIHZpZXdCb3g9IjAgMCA0MCAzMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjMwIiBmaWxsPSIjZjBmMGYwIiBzdHJva2U9IiNjY2MiLz4KPHN2ZyB4PSIxMyIgeT0iOCIgd2lkdGg9IjE0IiBoZWlnaHQ9IjE0IiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiPgo8cGF0aCBkPSJtMyAzaDE4djE4SDN6bTMgMTVsNi02IDItMiA0IDQgMy0zIiBzdHJva2U9IiM5OTkiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0ibm9uZSIvPgo8Y2lyY2xlIGN4PSI4LjUiIGN5PSI4LjUiIHI9IjEuNSIgZmlsbD0iIzk5OSIvPgo8L3N2Zz4KPC9zdmc+'
}

/**
 * Creates safe markdown for an image
 * @param {string} altText - Alt text for the image
 * @param {string} url - Image URL
 * @returns {string} - Safe markdown string
 */
export function createSafeImageMarkdown(altText, url) {
  const safeUrl = sanitizeImageUrl(url)
  return `![${altText}](${safeUrl})`
}

// USAGE EXAMPLES:
//
// 1. Convert uploaded file to data URI (recommended for small images):
//    const file = event.target.files[0]
//    const dataUri = await fileToDataUri(file)
//    insertText(`![Uploaded image](${dataUri})`)
//
// 2. Create blob URL for large images (temporary):
//    const blobUrl = createBlobUrl(file)
//    insertText(`![Large image](${blobUrl})`)
//
// 3. Use local images (permanent):
//    insertText('![Local image](./assets/my-image.jpg)')
//
// 4. Handle external URLs safely:
//    const safeMarkdown = createSafeImageMarkdown('Alt text', externalUrl)
//    insertText(safeMarkdown)
//
// 5. Validate before processing:
//    if (isImageUrlAllowed(url)) {
//      insertText(`![Safe image](${url})`)
//    } else {
//      console.warn('External URL blocked for security')
//    }
//
// TROUBLESHOOTING:
// - "External Image Blocked" message: The URL is not in the allow list
// - CORS errors: Server doesn't allow cross-origin requests
// - Large data URIs: Consider using blob URLs or local files instead
// - Performance: data URIs increase note file size significantly
