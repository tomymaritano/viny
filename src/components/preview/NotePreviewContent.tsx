import React, { useState, useEffect } from 'react'
// import TaskProgress from '../ui/TaskProgress' // removed
import { MarkdownProcessor } from '../../lib/markdown'
import DOMPurify from 'dompurify'
import { useSettings } from '../../hooks/useSettings'
import { useDebounce } from '../../hooks/useDebounce'
import { Note } from '../../types'

interface Settings {
  markdownFontFamily?: string
  markdownFontSize?: string
}

interface NotePreviewContentProps {
  note: Note
  settings: Settings | null
  getTagColor: (tagName: string) => string
}

const NotePreviewContent: React.FC<NotePreviewContentProps> = ({
  note,
  settings,
  getTagColor
}) => {
  const { settings: previewSettings } = useSettings({ category: 'preview' })
  const previewMode = previewSettings.previewMode || 'live'
  const previewDelay = previewSettings.previewDelay || 300
  
  // Use debounced content for live preview mode
  const debouncedContent = useDebounce(note.content, previewMode === 'live' ? previewDelay : 0)
  const [displayContent, setDisplayContent] = useState(note.content)
  const [lastManualUpdate, setLastManualUpdate] = useState(Date.now())
  
  // Update display content based on preview mode
  useEffect(() => {
    if (previewMode === 'live') {
      setDisplayContent(debouncedContent)
    } else if (previewMode === 'manual') {
      // In manual mode, only update on initial load or manual refresh
      if (lastManualUpdate === Date.now()) {
        setDisplayContent(note.content)
      }
    } else if (previewMode === 'off') {
      // Preview is disabled
      setDisplayContent('')
    }
  }, [debouncedContent, previewMode, lastManualUpdate, note.content])
  
  const handleManualRefresh = () => {
    setDisplayContent(note.content)
    setLastManualUpdate(Date.now())
  }
  
  const markdownHtml = React.useMemo(() => {
    if (previewMode === 'off') {
      return ''
    }
    
    // Pass preview settings to the markdown processor
    const rawHtml = MarkdownProcessor.render(displayContent || '', {
      codeHighlighting: previewSettings.codeHighlighting !== false,
      showLineNumbers: previewSettings.showLineNumbers === true,
      copyCodeButton: previewSettings.copyCodeButton !== false,
      renderMath: previewSettings.renderMath !== false,
      renderMermaid: previewSettings.renderMermaid !== false,
      tableOfContents: previewSettings.tableOfContents === true,
      tocPosition: previewSettings.tocPosition || 'top'
    })
    
    // Sanitize to prevent XSS attacks
    return DOMPurify.sanitize(rawHtml, {
      ALLOWED_TAGS: [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'p', 'br', 'div', 'span',
        'strong', 'b', 'em', 'i', 'u', 'code', 'pre',
        'blockquote',
        'ul', 'ol', 'li',
        'a', 'img',
        'table', 'thead', 'tbody', 'tr', 'th', 'td',
        'hr', 'del', 'ins',
        'button', 'svg', 'path', 'rect', 'input'
      ],
      ALLOWED_ATTR: [
        'href', 'src', 'alt', 'title', 'class', 'id',
        'target', 'rel', 'onclick', 'viewBox', 'width', 'height',
        'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin',
        'd', 'x', 'y', 'rx', 'ry', 'type', 'checked', 'disabled'
      ],
      ALLOW_DATA_ATTR: false,
      ADD_TAGS: ['span'],
      ALLOWED_SCHEMES: ['http', 'https', 'mailto', 'tel'],
      // Allow highlight.js classes and enhanced highlighting
      ALLOWED_CLASSES: {
        'pre': ['hljs', /^language-/],
        'code': ['hljs', /^language-/, /^hljs-/],
        'span': [/^hljs-/, 'env-var', /^js-/, 'line-number', 'blockquote-icon'],
        'div': ['code-block-wrapper', 'table-of-contents', 'table-wrapper'],
        'button': ['copy-code-button'],
        'blockquote': ['blockquote', 'blockquote-note', 'blockquote-warning', 'blockquote-tip', 'blockquote-important'],
        'li': ['task-list-item'],
        'table': ['enhanced-table'],
        'hr': ['enhanced-hr'],
        'a': ['external-link']
      }
    })
  }, [displayContent, previewMode, previewSettings])
  
  // Add copy code functionality
  React.useEffect(() => {
    // Define global copy function
    if (typeof window !== 'undefined') {
      (window as any).copyCodeBlock = (id: string) => {
        const wrapper = document.getElementById(id)
        if (!wrapper) return
        
        const codeBlock = wrapper.querySelector('pre code')
        if (!codeBlock) return
        
        const text = codeBlock.textContent || ''
        navigator.clipboard.writeText(text).then(() => {
          const button = wrapper.querySelector('.copy-code-button')
          if (button) {
            button.textContent = 'Copied!'
            setTimeout(() => {
              button.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>`
            }, 2000)
          }
        })
      }
    }
  }, [])

  // Styles are now handled by CSS variables and prose-theme class
  // Remove inline styles to prevent conflicts with CSS variables

  // Show disabled message if preview is off
  if (previewMode === 'off') {
    return (
      <div className="flex-1 overflow-auto flex items-center justify-center">
        <div className="text-center text-theme-text-muted">
          <p className="text-lg mb-2">Preview is disabled</p>
          <p className="text-sm">Enable preview mode in settings to see the rendered content</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-auto relative">
      {/* Manual refresh button */}
      {previewMode === 'manual' && (
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={handleManualRefresh}
            className="px-3 py-1.5 bg-theme-bg-secondary border border-theme-border-primary rounded-md text-sm text-theme-text-primary hover:bg-theme-bg-tertiary transition-colors flex items-center gap-2"
            title="Refresh preview"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      )}
      
      <div className="p-6">
        {/* Task Progress */}
        <div className="mb-6">
          {/* <TaskProgress content={note.content} /> */}
        </div>
        
        {/* Tags */}
        {note.tags && note.tags.length > 0 && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {note.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors"
                  style={{
                    backgroundColor: getTagColor(tag),
                    borderColor: getTagColor(tag),
                    color: 'var(--color-text-primary)'
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* Markdown Content */}
        <div 
          className="prose-theme max-w-none"
          dangerouslySetInnerHTML={{ __html: markdownHtml }}
        />
      </div>
    </div>
  )
}

export default NotePreviewContent