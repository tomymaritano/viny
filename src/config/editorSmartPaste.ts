/**
 * Smart Paste Extension for CodeMirror
 * Handles HTML to Markdown conversion and image pasting
 */

import { EditorView } from '@codemirror/view'
import { editorLogger } from '../utils/logger'
import type { Note } from '../types'

// HTML to Markdown converter
class HtmlToMarkdownConverter {
  static convert(html: string): string {
    // Create a temporary DOM element to parse HTML
    const div = document.createElement('div')
    div.innerHTML = html
    
    return this.convertNode(div)
  }
  
  private static convertNode(node: Node): string {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent || ''
    }
    
    if (node.nodeType !== Node.ELEMENT_NODE) {
      return ''
    }
    
    const element = node as HTMLElement
    const tagName = element.tagName.toLowerCase()
    const children = Array.from(node.childNodes)
      .map(child => this.convertNode(child))
      .join('')
    
    switch (tagName) {
      // Headers
      case 'h1': return `# ${children}\n\n`
      case 'h2': return `## ${children}\n\n`
      case 'h3': return `### ${children}\n\n`
      case 'h4': return `#### ${children}\n\n`
      case 'h5': return `##### ${children}\n\n`
      case 'h6': return `###### ${children}\n\n`
      
      // Text formatting
      case 'strong':
      case 'b': return `**${children}**`
      case 'em':
      case 'i': return `*${children}*`
      case 'code': return `\`${children}\``
      case 'del':
      case 's': return `~~${children}~~`
      
      // Links
      case 'a': {
        const href = element.getAttribute('href') || '#'
        const title = element.getAttribute('title')
        return title ? `[${children}](${href} "${title}")` : `[${children}](${href})`
      }
      
      // Images
      case 'img': {
        const src = element.getAttribute('src') || ''
        const alt = element.getAttribute('alt') || 'image'
        const title = element.getAttribute('title')
        return title ? `![${alt}](${src} "${title}")` : `![${alt}](${src})`
      }
      
      // Lists
      case 'ul': {
        return children.split('\n')
          .filter(line => line.trim())
          .map(line => `- ${line.trim()}`)
          .join('\n') + '\n\n'
      }
      case 'ol': {
        let counter = 1
        return children.split('\n')
          .filter(line => line.trim())
          .map(line => `${counter++}. ${line.trim()}`)
          .join('\n') + '\n\n'
      }
      case 'li': return children + '\n'
      
      // Block elements
      case 'p': return children + '\n\n'
      case 'br': return '\n'
      case 'hr': return '\n---\n\n'
      case 'blockquote': return children.split('\n')
        .map(line => `> ${line}`)
        .join('\n') + '\n\n'
      
      // Code blocks
      case 'pre': {
        const codeElement = element.querySelector('code')
        if (codeElement) {
          const language = codeElement.className.match(/language-(\w+)/)?.[1] || ''
          const code = codeElement.textContent || ''
          return `\n\`\`\`${language}\n${code}\n\`\`\`\n\n`
        }
        return `\n\`\`\`\n${children}\n\`\`\`\n\n`
      }
      
      // Tables (simple conversion)
      case 'table': {
        const rows = Array.from(element.querySelectorAll('tr'))
        if (rows.length === 0) return ''
        
        const headers = Array.from(rows[0].querySelectorAll('th, td'))
          .map(cell => cell.textContent?.trim() || '')
        
        let markdown = `| ${headers.join(' | ')} |\n`
        markdown += `| ${headers.map(() => '---').join(' | ')} |\n`
        
        rows.slice(1).forEach(row => {
          const cells = Array.from(row.querySelectorAll('td'))
            .map(cell => cell.textContent?.trim() || '')
          markdown += `| ${cells.join(' | ')} |\n`
        })
        
        return markdown + '\n'
      }
      
      // Default: just return children
      default: return children
    }
  }
}

// Image paste handler
const handleImagePaste = async (
  view: EditorView, 
  file: File
): Promise<string | null> => {
  try {
    // Check if it's an image
    if (!file.type.startsWith('image/')) {
      return null
    }
    
    // Convert to base64 for now (in production, you'd upload to a server)
    const reader = new FileReader()
    const base64 = await new Promise<string>((resolve, reject) => {
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
    
    // Generate markdown for the image
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = file.name || `pasted-image-${timestamp}.png`
    
    // Store image data in a temporary location (this would be handled by your storage system)
    // For now, we'll use the base64 data URL
    const imageMarkdown = `![${filename}](${base64})`
    
    editorLogger.debug('Image pasted:', { filename, size: file.size })
    
    return imageMarkdown
  } catch (error) {
    editorLogger.error('Failed to handle image paste:', error)
    return null
  }
}

// Smart paste extension
export const smartPasteExtension = EditorView.domEventHandlers({
  paste: (event, view) => {
    editorLogger.info('Smart Paste: Paste event triggered')
    
    const clipboardData = event.clipboardData
    if (!clipboardData) {
      editorLogger.info('Smart Paste: No clipboard data')
      return false
    }
    
    // Log what's available in the clipboard
    editorLogger.info('Smart Paste: Available types:', Array.from(clipboardData.types))
    
    // Check for files (images)
    if (clipboardData.files.length > 0) {
      event.preventDefault()
      
      Array.from(clipboardData.files).forEach(async (file) => {
        const imageMarkdown = await handleImagePaste(view, file)
        if (imageMarkdown) {
          const pos = view.state.selection.main.from
          view.dispatch({
            changes: { from: pos, to: pos, insert: imageMarkdown + '\n' }
          })
        }
      })
      
      return true
    }
    
    // Check for HTML content
    const htmlData = clipboardData.getData('text/html')
    editorLogger.info('Smart Paste: HTML data:', htmlData ? 'Found' : 'Not found')
    
    if (htmlData && htmlData.trim()) {
      event.preventDefault()
      
      editorLogger.info('Smart Paste: HTML detected', htmlData.substring(0, 200) + '...')
      
      // Convert HTML to Markdown
      const markdown = HtmlToMarkdownConverter.convert(htmlData)
      
      editorLogger.info('Smart Paste: Converted to markdown:', markdown)
      
      // Insert the converted markdown
      const { from, to } = view.state.selection.main
      view.dispatch({
        changes: { from, to, insert: markdown },
        selection: { anchor: from + markdown.length }
      })
      
      editorLogger.debug('Converted HTML to Markdown on paste')
      return true
    }
    
    // Check for plain text URLs
    const textData = clipboardData.getData('text/plain')
    if (textData) {
      // Auto-link URLs
      const urlRegex = /^(https?:\/\/[^\s]+)$/
      if (urlRegex.test(textData.trim())) {
        event.preventDefault()
        
        // If there's selected text, make it a link
        const { from, to } = view.state.selection.main
        const selectedText = view.state.doc.sliceString(from, to)
        
        const linkMarkdown = selectedText 
          ? `[${selectedText}](${textData.trim()})`
          : `<${textData.trim()}>`
        
        view.dispatch({
          changes: { from, to, insert: linkMarkdown }
        })
        
        return true
      }
    }
    
    // Let default paste behavior handle plain text
    editorLogger.info('Smart Paste: Fallback to default paste behavior')
    return false
  },
  
  drop: (event, view) => {
    const dataTransfer = event.dataTransfer
    if (!dataTransfer) return false
    
    // Handle file drops (images)
    if (dataTransfer.files.length > 0) {
      event.preventDefault()
      
      const pos = view.posAtCoords({ x: event.clientX, y: event.clientY })
      if (pos === null) return true
      
      Array.from(dataTransfer.files).forEach(async (file) => {
        const imageMarkdown = await handleImagePaste(view, file)
        if (imageMarkdown) {
          view.dispatch({
            changes: { from: pos, to: pos, insert: imageMarkdown + '\n' }
          })
        }
      })
      
      return true
    }
    
    return false
  }
})

// Helper to save pasted images properly (to be integrated with your storage system)
export const createImageSaveHandler = (saveImage: (file: File) => Promise<string>) => {
  return EditorView.domEventHandlers({
    paste: async (event, view) => {
      const clipboardData = event.clipboardData
      if (!clipboardData || clipboardData.files.length === 0) return false
      
      event.preventDefault()
      
      for (const file of Array.from(clipboardData.files)) {
        if (file.type.startsWith('image/')) {
          try {
            // Save image and get URL
            const imageUrl = await saveImage(file)
            const filename = file.name || 'pasted-image.png'
            const imageMarkdown = `![${filename}](${imageUrl})`
            
            const pos = view.state.selection.main.from
            view.dispatch({
              changes: { from: pos, to: pos, insert: imageMarkdown + '\n' }
            })
          } catch (error) {
            editorLogger.error('Failed to save pasted image:', error)
          }
        }
      }
      
      return true
    }
  })
}