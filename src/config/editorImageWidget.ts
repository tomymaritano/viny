/**
 * CodeMirror Image Widget Extension
 * Displays images inline in the editor
 */

import type { EditorView, ViewUpdate } from '@codemirror/view'
import { WidgetType, Decoration, ViewPlugin } from '@codemirror/view'
import { RangeSetBuilder } from '@codemirror/state'
import { editorLogger } from '../utils/logger'

class ImageWidget extends WidgetType {
  constructor(
    public src: string,
    public alt = ''
  ) {
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

    // Handle viny:// image URLs
    let resolvedSrc = this.src
    if (this.src.startsWith('viny://image:')) {
      const imageId = this.src.replace('viny://image:', '')
      // Try to get from window.vinyImageStore if it exists
      if (typeof window !== 'undefined' && (window as any).vinyImageStore) {
        const entry = (window as any).vinyImageStore.get(imageId)
        if (entry) {
          resolvedSrc = entry
        }
      } else {
        // Fallback to localStorage if memory store not available
        try {
          const storedImages = JSON.parse(
            storageService.getItem(StorageService.KEYS.IMAGES) || '{}'
          )
          if (storedImages[imageId]) {
            resolvedSrc = storedImages[imageId]
          }
        } catch (error) {
          editorLogger.error('Failed to load image from localStorage:', error)
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

  // Skip debug logging for performance
  // editorLogger.debug('Creating image decorations...')

  for (let i = 1; i <= doc.lines; i++) {
    const line = doc.line(i)
    const lineText = line.text
    let match

    imageRegex.lastIndex = 0 // Reset regex
    while ((match = imageRegex.exec(lineText)) !== null) {
      const [fullMatch, alt, src] = match
      const from = line.from + match.index
      const to = from + fullMatch.length

      // Skip debug logging for performance

      // Only show widget if the src looks like a valid image
      if (
        src &&
        (src.startsWith('data:image/') ||
          src.startsWith('blob:') ||
          src.startsWith('./') ||
          src.startsWith('/') ||
          src.startsWith('viny://image:') ||
          src.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i))
      ) {
        // Skip debug logging for performance

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
  // Skip debug logging for performance
  return decorations
}

export const imageWidgetPlugin = ViewPlugin.fromClass(
  class {
    decorations: any

    constructor(view: EditorView) {
      // Skip debug logging for performance
      this.decorations = createImageDecorations(view)
    }

    update(update: ViewUpdate) {
      if (update.docChanged || update.viewportChanged) {
        // Skip debug logging for performance
        this.decorations = createImageDecorations(update.view)
      }
    }
  },
  {
    decorations: v => v.decorations,
  }
)
