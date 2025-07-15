import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { getEditorColor } from '../config/editorColors'
import { isImageUrlAllowed } from './imageUtils'

/**
 * Processes images in HTML and replaces blocked ones with informative placeholders
 * Also resolves viny:// image references
 * @param {string} html - The HTML content to process
 * @returns {string} HTML with processed images
 */
const processBlockedImages = html => {
  return html.replace(
    /<img([^>]*?)src=["']([^"']+)["']([^>]*?)>/g,
    (match, before, src, after) => {
      // Handle viny:// image references
      if (src.startsWith('viny://image:')) {
        const imageId = src.replace('viny://image:', '')

        // Try to get from memory first
        let dataUri = null
        if (window.vinyImageStore && window.vinyImageStore.has(imageId)) {
          dataUri = window.vinyImageStore.get(imageId)
        } else {
          // Try to load from localStorage
          try {
            const storedImages = JSON.parse(
              localStorage.getItem('viny-images') || '{}'
            )
            if (storedImages[imageId]) {
              dataUri = storedImages[imageId]
              // Cache in memory for next time
              if (!window.vinyImageStore) {
                window.vinyImageStore = new Map()
              }
              window.vinyImageStore.set(imageId, dataUri)
            }
          } catch (error) {
            console.error('Failed to load image from storage:', error)
          }
        }

        if (dataUri) {
          return `<img${before}src="${dataUri}"${after}>`
        } else {
          // Image reference not found
          const altMatch = match.match(/alt=["']([^"']*?)["']/)
          const altText = altMatch ? altMatch[1] : 'Missing image'
          return `<div class="missing-image-placeholder" style="
          border: 2px dashed ${getEditorColor('borderSubtle')};
          border-radius: 8px;
          padding: 20px;
          margin: 16px 0;
          text-align: center;
          background-color: ${getEditorColor('codeBackground')};
          color: ${getEditorColor('textSecondary')};
        ">
          <div style="margin-bottom: 8px;">⚠️</div>
          <div style="font-weight: 500; margin-bottom: 4px;">Image Not Found</div>
          <div style="font-size: 0.875rem; opacity: 0.8;">${altText}</div>
          <div style="font-size: 0.75rem; opacity: 0.6;">Reference: ${imageId}</div>
        </div>`
        }
      }

      if (!isImageUrlAllowed(src)) {
        // Create an informative placeholder for blocked images
        const altMatch = match.match(/alt=["']([^"']*?)["']/)
        const altText = altMatch ? altMatch[1] : 'External image'

        return `<div class="blocked-image-placeholder" style="
        border: 2px dashed ${getEditorColor('borderSubtle')};
        border-radius: 8px;
        padding: 20px;
        margin: 16px 0;
        text-align: center;
        background-color: ${getEditorColor('codeBackground')};
        color: ${getEditorColor('textSecondary')};
      ">
        <div style="margin-bottom: 8px;">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
          </svg>
        </div>
        <div style="font-weight: 500; margin-bottom: 4px;">External Image Blocked</div>
        <div style="font-size: 0.875rem; opacity: 0.8; margin-bottom: 8px;">${altText}</div>
        <div style="font-size: 0.75rem; opacity: 0.6;">
          Source: <code style="background: none; padding: 0;">${src}</code>
        </div>
        <div style="font-size: 0.75rem; margin-top: 8px; opacity: 0.7;">
          <strong>To display this image:</strong><br>
          • Download and use as local file: <code style="background: none; padding: 0;">./image.jpg</code><br>
          • Convert to data URI for security
        </div>
      </div>`
      }

      return match // Return original if allowed
    }
  )
}

/**
 * Renders markdown content to HTML with consistent styling
 * @param {string} content - The markdown content to render
 * @param {Object} options - Additional options for marked
 * @returns {string} Sanitized HTML string
 */
export const renderMarkdownToHtml = (content, options = {}) => {
  if (!content) {
    return '<p class="text-theme-text-tertiary">This note is empty</p>'
  }

  const html = marked(content, {
    breaks: true,
    gfm: true,
    headerIds: false,
    mangle: false,
    ...options,
  })

  // Add inline styles using CSS variables (no !important)
  // Configure DOMPurify to allow our custom viny:// protocol
  let styledHtml = DOMPurify.sanitize(html, {
    ALLOWED_URI_REGEXP:
      /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|viny):|[^a-z]|[a-z+.-]+(?:[^a-z+.-:]|$))/i,
  })

  // Styles are now handled by CSS in MarkdownPreview component

  // Process blocked images and replace with informative placeholders
  styledHtml = processBlockedImages(styledHtml)

  return styledHtml
}

/**
 * Renders markdown for editor preview (split view)
 * @param {string} content - The markdown content to render
 * @returns {string} Sanitized HTML string
 */
export const renderMarkdownForEditor = content => {
  if (!content) {
    return '<p class="text-theme-text-muted">Start writing to see preview...</p>'
  }

  return renderMarkdownToHtml(content)
}
