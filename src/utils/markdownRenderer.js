import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { getEditorColor } from '../config/editorColors'

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
  let styledHtml = DOMPurify.sanitize(html)

  // Apply heading styles with configurable thin lines
  styledHtml = styledHtml.replace(
    /<h([1-6])([^>]*)>/g,
    `<h$1$2 style="border-bottom: 1px solid ${getEditorColor('borderSubtle')}; padding-bottom: 0.3em; margin-top: 1.5em; margin-bottom: 0.5em;">`
  )

  // Apply configurable code colors
  styledHtml = styledHtml.replace(
    /<code([^>]*)>/g,
    `<code$1 style="color: ${getEditorColor('code')}; background-color: ${getEditorColor('codeBackground')}; padding: 0.2em 0.4em; border-radius: 3px;">`
  )

  // Apply configurable link colors
  styledHtml = styledHtml.replace(
    /<a([^>]*)>/g,
    `<a$1 style="color: ${getEditorColor('link')}; text-decoration: none; border-bottom: 1px solid ${getEditorColor('linkUnderline')};">`
  )

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
