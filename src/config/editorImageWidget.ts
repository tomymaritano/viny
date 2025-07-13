/**
 * CodeMirror Image Widget Extension
 * Displays images inline in the editor
 */

import { EditorView, WidgetType, Decoration, ViewPlugin, ViewUpdate } from '@codemirror/view'
import { RangeSetBuilder } from '@codemirror/state'

class ImageWidget extends WidgetType {
  constructor(public src: string, public alt: string = '') {
    super()
  }

  eq(other: ImageWidget) {
    return this.src === other.src && this.alt === other.alt
  }

  toDOM() {
    const container = document.createElement('div')
    container.style.cssText = `
      display: block;
      margin: 12px 0;
      max-width: 100%;
      border-radius: 8px;
      overflow: hidden;
      background: rgba(255, 255, 255, 0.02);
      padding: 8px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    `

    // Handle nototo:// image URLs
    let resolvedSrc = this.src
    if (this.src.startsWith('nototo://image:')) {
      const imageId = this.src.replace('nototo://image:', '')
      // Try to get from window.nototoImageStore if it exists
      if (typeof window !== 'undefined' && (window as any).nototoImageStore) {
        const entry = (window as any).nototoImageStore.get(imageId)
        if (entry) {
          resolvedSrc = entry
        }
      } else {
        // Fallback to localStorage if memory store not available
        try {
          const storedImages = JSON.parse(localStorage.getItem('nototo-images') || '{}')
          if (storedImages[imageId]) {
            resolvedSrc = storedImages[imageId]
          }
        } catch (error) {
          console.error('Failed to load image from localStorage:', error)
        }
      }
    }

    const img = document.createElement('img')
    img.src = resolvedSrc
    img.alt = this.alt
    img.style.cssText = `
      max-width: 100%;
      max-height: 300px;
      min-height: 80px;
      object-fit: contain;
      display: block;
      border-radius: 6px;
      transition: all 0.2s ease;
      cursor: pointer;
      background: rgba(0, 0, 0, 0.1);
    `

    // Add hover effect
    img.onmouseover = () => {
      img.style.transform = 'scale(1.02)'
      img.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)'
    }
    
    img.onmouseout = () => {
      img.style.transform = 'scale(1)'
      img.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.15)'
    }

    // Handle loading errors
    img.onerror = () => {
      container.innerHTML = `
        <div style="
          padding: 12px 16px;
          background: rgba(239, 83, 80, 0.1);
          border: 1px solid rgba(239, 83, 80, 0.3);
          border-radius: 6px;
          color: #ef5350;
          font-size: 13px;
          text-align: center;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        ">
          🖼️ Failed to load image: ${this.alt || 'Unknown'}
        </div>
      `
    }

    container.appendChild(img)
    return container
  }

  get estimatedHeight() {
    return 100 // Estimated height for layout
  }
}

function createImageDecorations(view: EditorView) {
  const builder = new RangeSetBuilder<Decoration>()
  const doc = view.state.doc

  // Regex to match markdown images: ![alt](src)
  const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g
  
  console.log('Creating image decorations for', doc.lines, 'lines') // Debug log
  
  for (let i = 1; i <= doc.lines; i++) {
    const line = doc.line(i)
    const lineText = line.text
    let match

    imageRegex.lastIndex = 0 // Reset regex
    while ((match = imageRegex.exec(lineText)) !== null) {
      const [fullMatch, alt, src] = match
      const from = line.from + match.index
      const to = from + fullMatch.length

      console.log('Found image markdown:', { fullMatch, alt, src, from, to }) // Debug log

      // Only show widget if the src looks like a valid image
      if (src && (src.startsWith('data:image/') || 
                 src.startsWith('blob:') || 
                 src.startsWith('./') || 
                 src.startsWith('/') ||
                 src.startsWith('nototo://image:') ||
                 src.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i))) {
        
        console.log('Adding image widget for:', src) // Debug log
        
        // Create a decoration that shows the image after the markdown
        builder.add(
          to,
          to,
          Decoration.widget({
            widget: new ImageWidget(src, alt),
            side: 1, // After the text
            block: false, // Use inline widget to avoid plugin restriction
          })
        )
      }
    }
  }

  const decorations = builder.finish()
  console.log('Built decorations:', decorations.size, 'decorations') // Debug log
  return decorations
}

export const imageWidgetPlugin = ViewPlugin.fromClass(
  class {
    decorations: any

    constructor(view: EditorView) {
      console.log('ImageWidget plugin initialized') // Debug log
      this.decorations = createImageDecorations(view)
    }

    update(update: ViewUpdate) {
      if (update.docChanged || update.viewportChanged) {
        console.log('ImageWidget plugin updating...') // Debug log
        this.decorations = createImageDecorations(update.view)
      }
    }
  },
  {
    decorations: v => v.decorations,
  }
)