import React, {
  useMemo,
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
} from 'react'
import DOMPurify from 'dompurify'
import type { Note } from '../types'
import { MarkdownProcessor } from '../lib/markdown'
import { editorLogger } from '../utils/logger'

interface MarkdownPreviewProps {
  note: Note | null
  className?: string
  syncScroll?: boolean
  onScrollSync?: (scrollTop: number, scrollHeight: number) => void
}

export interface MarkdownPreviewHandle {
  syncScrollPosition: (scrollTop: number, scrollHeight: number) => void
}

// DOMPurify configuration - back to original with syntax highlighting support
const purifyConfig = {
  ALLOWED_TAGS: [
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'p',
    'br',
    'div',
    'span',
    'strong',
    'b',
    'em',
    'i',
    'u',
    'code',
    'pre',
    'blockquote',
    'ul',
    'ol',
    'li',
    'a',
    'img',
    'table',
    'thead',
    'tbody',
    'tr',
    'th',
    'td',
    'hr',
    'del',
    'ins',
    'input', // For task list checkboxes
  ],
  ALLOWED_ATTR: [
    'href',
    'src',
    'alt',
    'title',
    'class',
    'id',
    'target',
    'rel',
    'type',
    'checked',
    'disabled', // Checkbox attributes
  ],
  ALLOW_DATA_ATTR: false,
  ADD_TAGS: ['span'],
  ALLOWED_SCHEMES: ['http', 'https', 'mailto', 'tel', 'data'],
  // Allow basic syntax highlighting classes
  ALLOWED_CLASSES: {
    pre: ['hljs'],
    code: ['hljs', /^language-/, /^hljs-/],
    span: [/^hljs-/, 'env-var', 'blockquote-icon'],
    blockquote: [
      'blockquote',
      'blockquote-note',
      'blockquote-warning',
      'blockquote-tip',
      'blockquote-important',
    ],
    li: ['task-list-item'],
    table: ['enhanced-table'],
    hr: ['enhanced-hr'],
    a: ['external-link'],
    div: ['table-wrapper'],
  },
}

const MarkdownPreview = forwardRef<MarkdownPreviewHandle, MarkdownPreviewProps>(
  ({ note, className = '', syncScroll = false, onScrollSync }, ref) => {
    const previewRef = useRef<HTMLDivElement>(null)

    // Convert markdown to HTML with syntax highlighting and sanitization
    const htmlContent = useMemo(() => {
      if (!note?.content) return ''

      try {
        // Use MarkdownProcessor for enhanced rendering with syntax highlighting
        const rawHtml = MarkdownProcessor.render(note.content)

        // Sanitize HTML to prevent XSS attacks while preserving highlight.js classes
        const sanitizedHtml = DOMPurify.sanitize(rawHtml, purifyConfig)

        return sanitizedHtml
      } catch (error) {
        editorLogger.error('Error parsing markdown:', error)
        return `<pre>${DOMPurify.sanitize(note.content)}</pre>` // Fallback to sanitized plain text
      }
    }, [note?.content])

    // Handle scroll sync
    useEffect(() => {
      if (!syncScroll || !onScrollSync || !previewRef.current) return

      const handleScroll = () => {
        if (previewRef.current) {
          const { scrollTop, scrollHeight } = previewRef.current
          onScrollSync(scrollTop, scrollHeight)
        }
      }

      const previewElement = previewRef.current
      previewElement.addEventListener('scroll', handleScroll, { passive: true })

      return () => {
        previewElement.removeEventListener('scroll', handleScroll)
      }
    }, [syncScroll, onScrollSync])

    // Sync scroll position when controlled externally
    const syncScrollPosition = (scrollTop: number, scrollHeight: number) => {
      if (previewRef.current) {
        const { scrollHeight: currentScrollHeight } = previewRef.current
        const ratio = scrollTop / scrollHeight
        previewRef.current.scrollTop = ratio * currentScrollHeight
      }
    }

    // Expose scroll sync method via ref
    useImperativeHandle(
      ref,
      () => ({
        syncScrollPosition,
      }),
      [syncScrollPosition]
    )

    // Handle link clicks and hover
    useEffect(() => {
      if (!previewRef.current) return

      let tooltipElement: HTMLDivElement | null = null
      let tooltipTimeout: NodeJS.Timeout | null = null

      const createTooltip = (link: HTMLAnchorElement) => {
        // Remove any existing tooltip
        if (tooltipElement) {
          tooltipElement.remove()
          tooltipElement = null
        }

        // Create new tooltip
        tooltipElement = document.createElement('div')
        tooltipElement.className = 'link-preview-tooltip'

        // Add content
        const url = link.href
        const text = link.textContent || url

        // Title (if different from URL)
        if (text !== url) {
          const title = document.createElement('div')
          title.className = 'tooltip-title'
          title.textContent = text
          tooltipElement.appendChild(title)
        }

        // URL
        const urlDiv = document.createElement('div')
        urlDiv.className = 'tooltip-url'
        urlDiv.textContent = url
        tooltipElement.appendChild(urlDiv)

        // Check if it's an image URL
        if (/\.(jpg|jpeg|png|gif|svg|webp)$/i.test(url)) {
          const imgPreview = document.createElement('img')
          imgPreview.src = url
          imgPreview.className = 'tooltip-image'
          imgPreview.onerror = () => {
            imgPreview.remove()
          }
          tooltipElement.appendChild(imgPreview)
        }

        // Position tooltip
        const rect = link.getBoundingClientRect()
        const tooltipWidth = 400
        const tooltipHeight = 150 // Estimate

        let left = rect.left
        let top = rect.bottom + 5

        // Adjust if tooltip would go off screen
        if (left + tooltipWidth > window.innerWidth) {
          left = window.innerWidth - tooltipWidth - 10
        }
        if (top + tooltipHeight > window.innerHeight) {
          top = rect.top - tooltipHeight - 5
        }

        tooltipElement.style.left = `${left}px`
        tooltipElement.style.top = `${top}px`

        document.body.appendChild(tooltipElement)
        
        // Add visible class after a frame to trigger animation
        requestAnimationFrame(() => {
          tooltipElement.classList.add('visible')
        })
      }


      const handleClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement
        const link = target.closest('a')
        
        if (link && link.href) {
          e.preventDefault()
          
          // Remove tooltip on click
          if (tooltipElement) {
            tooltipElement.remove()
            tooltipElement = null
          }
          
          // Check if it's an external link
          try {
            const url = new URL(link.href)
            // Open external links in new tab
            window.open(url.href, '_blank', 'noopener,noreferrer')
          } catch (err) {
            // Handle internal links or invalid URLs
            editorLogger.error('Failed to open link:', err)
          }
        }
      }

      const previewElement = previewRef.current
      
      // Use mouseover/mouseout for better event delegation
      const handleMouseOver = (e: MouseEvent) => {
        const target = e.target as HTMLElement
        if (target.tagName === 'A' && (target as HTMLAnchorElement).href) {
          const link = target as HTMLAnchorElement
          // Clear any existing timeout
          if (tooltipTimeout) {
            clearTimeout(tooltipTimeout)
          }
          // Show tooltip after 300ms delay
          tooltipTimeout = setTimeout(() => {
            createTooltip(link)
          }, 300)
        }
      }

      const handleMouseOut = (e: MouseEvent) => {
        const target = e.target as HTMLElement
        if (target.tagName === 'A') {
          // Clear timeout
          if (tooltipTimeout) {
            clearTimeout(tooltipTimeout)
            tooltipTimeout = null
          }
          // Remove tooltip
          if (tooltipElement) {
            tooltipElement.remove()
            tooltipElement = null
          }
        }
      }
      
      previewElement.addEventListener('click', handleClick)
      previewElement.addEventListener('mouseover', handleMouseOver)
      previewElement.addEventListener('mouseout', handleMouseOut)

      return () => {
        previewElement.removeEventListener('click', handleClick)
        previewElement.removeEventListener('mouseover', handleMouseOver)
        previewElement.removeEventListener('mouseout', handleMouseOut)
        
        // Clean up tooltip
        if (tooltipTimeout) {
          clearTimeout(tooltipTimeout)
        }
        if (tooltipElement) {
          tooltipElement.remove()
        }
      }
    }, [htmlContent]) // Re-attach when content changes

    if (!note) {
      return (
        <div
          className={`flex items-center justify-center h-full bg-theme-bg-primary ${className}`}
        >
          <div className="text-center">
            <div className="text-6xl mb-4 opacity-50">📝</div>
            <h3 className="text-lg font-medium text-theme-text-secondary mb-2">
              No note selected
            </h3>
            <p className="text-theme-text-muted">
              Select a note to see the preview
            </p>
          </div>
        </div>
      )
    }

    if (!note.content) {
      return (
        <div
          className={`flex items-center justify-center h-full bg-theme-bg-primary ${className}`}
        >
          <div className="text-center">
            <div className="text-6xl mb-4 opacity-50">✏️</div>
            <h3 className="text-lg font-medium text-theme-text-secondary mb-2">
              Empty note
            </h3>
            <p className="text-theme-text-muted">
              Start writing to see the preview
            </p>
          </div>
        </div>
      )
    }

    return (
      <div
        ref={previewRef}
        className={`h-full overflow-y-auto overflow-x-hidden bg-theme-bg-primary custom-scrollbar ${className}`}
      >
        <div className="p-6 max-w-none overflow-hidden">
          {/* Note metadata */}
          <div className="mb-6 pb-4 border-b border-theme-border-primary">
            <h1 className="text-2xl font-bold text-theme-text-primary mb-2">
              {note.title || 'Untitled'}
            </h1>

            <div className="flex items-center gap-4 text-sm text-theme-text-muted">
              <span>
                Updated: {new Date(note.updatedAt).toLocaleDateString()}
              </span>

              {note.notebook && (
                <span className="flex items-center gap-1">
                  📁 {note.notebook}
                </span>
              )}

              {note.tags.length > 0 && (
                <div className="flex items-center gap-1">
                  <span>🏷️</span>
                  <span>{note.tags.join(', ')}</span>
                </div>
              )}

              {note.isPinned && (
                <span className="text-theme-accent-orange">📌 Pinned</span>
              )}
            </div>
          </div>

          {/* Rendered markdown content */}
          <div
            className="prose-theme max-w-none break-words overflow-wrap-anywhere"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </div>
      </div>
    )
  }
)

MarkdownPreview.displayName = 'MarkdownPreview'

export { MarkdownPreview }
