/**
 * Link Preview Extension for CodeMirror
 * Shows a preview tooltip when hovering over links
 */

import { EditorView, Tooltip, hoverTooltip } from '@codemirror/view'
import { syntaxTree } from '@codemirror/language'
import { editorLogger } from '../utils/logger'

interface LinkInfo {
  url: string
  text: string
  from: number
  to: number
}

// Extract link information from markdown
function getLinkAt(view: EditorView, pos: number): LinkInfo | null {
  const tree = syntaxTree(view.state)
  let linkInfo: LinkInfo | null = null

  tree.iterate({
    from: Math.max(0, pos - 100),
    to: Math.min(view.state.doc.length, pos + 100),
    enter: (node) => {
      // Check for markdown link patterns
      if (node.name === 'Link' || node.name === 'URL') {
        if (node.from <= pos && node.to >= pos) {
          const linkText = view.state.doc.sliceString(node.from, node.to)
          
          // Parse markdown link [text](url)
          const mdLinkMatch = linkText.match(/\[([^\]]+)\]\(([^)]+)\)/)
          if (mdLinkMatch) {
            linkInfo = {
              text: mdLinkMatch[1],
              url: mdLinkMatch[2],
              from: node.from,
              to: node.to
            }
            return false
          }
          
          // Parse plain URL
          const urlMatch = linkText.match(/https?:\/\/[^\s]+/)
          if (urlMatch) {
            linkInfo = {
              text: urlMatch[0],
              url: urlMatch[0],
              from: node.from,
              to: node.to
            }
            return false
          }
        }
      }
    }
  })

  // Fallback: check for URLs in plain text
  if (!linkInfo) {
    const line = view.state.doc.lineAt(pos)
    const lineText = line.text
    
    // Check for markdown links
    const mdLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
    let match
    while ((match = mdLinkRegex.exec(lineText)) !== null) {
      const start = line.from + match.index
      const end = start + match[0].length
      if (start <= pos && end >= pos) {
        linkInfo = {
          text: match[1],
          url: match[2],
          from: start,
          to: end
        }
        break
      }
    }
    
    // Check for plain URLs
    if (!linkInfo) {
      const urlRegex = /https?:\/\/[^\s]+/g
      while ((match = urlRegex.exec(lineText)) !== null) {
        const start = line.from + match.index
        const end = start + match[0].length
        if (start <= pos && end >= pos) {
          linkInfo = {
            text: match[0],
            url: match[0],
            from: start,
            to: end
          }
          break
        }
      }
    }
  }

  return linkInfo
}

// Create tooltip content
function createLinkTooltip(link: LinkInfo): HTMLElement {
  const tooltip = document.createElement('div')
  tooltip.className = 'link-preview-tooltip'
  tooltip.style.cssText = `
    padding: 12px 16px;
    max-width: 400px;
    background: var(--color-bg-secondary, #fff);
    border: 1px solid var(--color-border, #e0e0e0);
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    font-size: 14px;
    line-height: 1.5;
  `

  // Title
  if (link.text !== link.url) {
    const title = document.createElement('div')
    title.style.cssText = `
      font-weight: 600;
      color: var(--color-text-primary, #000);
      margin-bottom: 4px;
    `
    title.textContent = link.text
    tooltip.appendChild(title)
  }

  // URL
  const urlDiv = document.createElement('div')
  urlDiv.style.cssText = `
    color: var(--color-link, #0066cc);
    word-break: break-all;
    font-family: monospace;
    font-size: 12px;
  `
  urlDiv.textContent = link.url
  tooltip.appendChild(urlDiv)

  // Hint
  const hint = document.createElement('div')
  hint.style.cssText = `
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid var(--color-border, #e0e0e0);
    font-size: 12px;
    color: var(--color-text-secondary, #666);
  `
  hint.textContent = 'Click to open • Cmd+Click to edit'
  tooltip.appendChild(hint)

  // Check if it's an image URL
  if (/\.(jpg|jpeg|png|gif|svg|webp)$/i.test(link.url)) {
    const imgPreview = document.createElement('img')
    imgPreview.src = link.url
    imgPreview.style.cssText = `
      max-width: 100%;
      max-height: 200px;
      margin-top: 8px;
      border-radius: 4px;
      display: block;
    `
    imgPreview.onerror = () => {
      imgPreview.remove()
    }
    tooltip.insertBefore(imgPreview, hint)
  }

  return tooltip
}

// Link preview tooltip extension
export const linkPreviewExtension = hoverTooltip((view, pos) => {
  const link = getLinkAt(view, pos)
  
  if (!link) return null

  return {
    pos: link.from,
    end: link.to,
    above: true,
    create: () => {
      const tooltip = createLinkTooltip(link)
      return { dom: tooltip }
    }
  }
}, {
  hideOnChange: true,
  hoverTime: 300 // Show after 300ms hover
})

// Click handler for links
export const linkClickHandler = EditorView.domEventHandlers({
  click: (event, view) => {
    const pos = view.posAtCoords({ x: event.clientX, y: event.clientY })
    if (pos === null) return false

    const link = getLinkAt(view, pos)
    if (!link) return false

    // Cmd/Ctrl + Click to edit, otherwise open
    if (event.metaKey || event.ctrlKey) {
      // Let the editor handle the click for editing
      return false
    }

    // Open the link
    event.preventDefault()
    try {
      window.open(link.url, '_blank', 'noopener,noreferrer')
    } catch (err) {
      editorLogger.error('Failed to open link:', err)
    }
    
    return true
  }
})

// Auto-link detection extension
export const autoLinkExtension = EditorView.inputHandler.of((view, from, to, text) => {
  // Only process space or enter
  if (text !== ' ' && text !== '\n') return false

  // Get the text before the cursor
  const line = view.state.doc.lineAt(from)
  const textBefore = line.text.slice(0, from - line.from)
  
  // Check for URL pattern at the end
  const urlMatch = textBefore.match(/(^|\s)(https?:\/\/[^\s]+)$/)
  if (!urlMatch) return false

  const url = urlMatch[2]
  const urlStart = line.from + urlMatch.index! + urlMatch[1].length

  // Don't auto-link if already in a markdown link
  if (textBefore.includes('[') && textBefore.includes('](')) return false

  // Replace the URL with a markdown link
  view.dispatch({
    changes: {
      from: urlStart,
      to: from,
      insert: `[${url}](${url})`
    }
  })

  return false
})