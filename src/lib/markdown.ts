// Markdown processing utilities
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js/lib/core'

// Register common languages
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import css from 'highlight.js/lib/languages/css'
import xml from 'highlight.js/lib/languages/xml'
import json from 'highlight.js/lib/languages/json'

hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('css', css)
hljs.registerLanguage('html', xml)
hljs.registerLanguage('xml', xml)
hljs.registerLanguage('json', json)

// Configure markdown-it instance with plugins
const md = new MarkdownIt({
  html: true,
  breaks: true,
  linkify: true,
  typographer: true,
  highlight: function (str: string, lang: string) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        const highlighted = hljs.highlight(str, { 
          language: lang, 
          ignoreIllegals: true 
        }).value
        return `<pre class="hljs"><code class="language-${lang}">${highlighted}</code></pre>`
      } catch (error) {
        console.warn('Syntax highlighting failed:', error)
      }
    }
    return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`
  }
})

// Add markdown-it plugins (commented out until packages are installed)
// md.use(require('markdown-it-task-lists'), { enabled: true })
// md.use(require('markdown-it-mark'))
// md.use(require('markdown-it-sub'))
// md.use(require('markdown-it-sup'))

export class MarkdownProcessor {
  static render(content: string): string {
    if (!content.trim()) {
      return '<div class="empty-state">Start typing to see your markdown rendered here...</div>'
    }

    try {
      return md.render(content)
    } catch (error) {
      console.error('Markdown rendering error:', error)
      return '<div class="empty-state error">Error rendering markdown</div>'
    }
  }

  static extractTitle(content: string): string {
    const lines = content.split('\n')
    
    // Look for first heading
    for (const line of lines) {
      const trimmed = line.trim()
      if (trimmed.startsWith('#')) {
        return trimmed.replace(/^#+\s*/, '').trim()
      }
    }
    
    // Fallback to first non-empty line
    const firstLine = lines.find(line => line.trim())
    return firstLine ? firstLine.trim().substring(0, 50) : 'Untitled Note'
  }

  static extractTags(content: string): string[] {
    const tagRegex = /#(\w+)/g
    const tags = new Set<string>()
    let match

    while ((match = tagRegex.exec(content)) !== null) {
      tags.add(match[1])
    }

    return Array.from(tags)
  }

  static getWordCount(content: string): number {
    return content.trim().split(/\s+/).filter(word => word.length > 0).length
  }

  static getCharCount(content: string): number {
    return content.length
  }

  static getReadingTime(content: string): number {
    const words = this.getWordCount(content)
    const wordsPerMinute = 200
    return Math.ceil(words / wordsPerMinute)
  }
}

export default MarkdownProcessor
