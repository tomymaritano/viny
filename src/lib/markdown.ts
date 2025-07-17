// Optimized Markdown processing utilities with dynamic language loading
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js/lib/core'

// Language mapping for dynamic imports
const LANGUAGE_MAP: Record<string, () => Promise<any>> = {
  // Core Web Technologies (always loaded)
  javascript: () => import('highlight.js/lib/languages/javascript'),
  typescript: () => import('highlight.js/lib/languages/typescript'),
  css: () => import('highlight.js/lib/languages/css'),
  html: () => import('highlight.js/lib/languages/xml'),
  xml: () => import('highlight.js/lib/languages/xml'),
  json: () => import('highlight.js/lib/languages/json'),
  
  // Popular Backend Languages (loaded on demand)
  python: () => import('highlight.js/lib/languages/python'),
  java: () => import('highlight.js/lib/languages/java'),
  cpp: () => import('highlight.js/lib/languages/cpp'),
  csharp: () => import('highlight.js/lib/languages/csharp'),
  php: () => import('highlight.js/lib/languages/php'),
  ruby: () => import('highlight.js/lib/languages/ruby'),
  go: () => import('highlight.js/lib/languages/go'),
  rust: () => import('highlight.js/lib/languages/rust'),
  
  // Shell & DevOps
  bash: () => import('highlight.js/lib/languages/bash'),
  yaml: () => import('highlight.js/lib/languages/yaml'),
  dockerfile: () => import('highlight.js/lib/languages/dockerfile'),
  
  // Database
  sql: () => import('highlight.js/lib/languages/sql'),
  
  // Mobile Development
  swift: () => import('highlight.js/lib/languages/swift'),
  kotlin: () => import('highlight.js/lib/languages/kotlin'),
  dart: () => import('highlight.js/lib/languages/dart'),
  
  // Other popular languages
  scala: () => import('highlight.js/lib/languages/scala'),
  haskell: () => import('highlight.js/lib/languages/haskell'),
  lua: () => import('highlight.js/lib/languages/lua'),
  perl: () => import('highlight.js/lib/languages/perl'),
  r: () => import('highlight.js/lib/languages/r'),
  
  // Configuration formats
  ini: () => import('highlight.js/lib/languages/ini'),
  properties: () => import('highlight.js/lib/languages/properties'),
  makefile: () => import('highlight.js/lib/languages/makefile'),
  
  // Markup
  markdown: () => import('highlight.js/lib/languages/markdown'),
  latex: () => import('highlight.js/lib/languages/latex'),
}

// Language aliases mapping
const LANGUAGE_ALIASES: Record<string, string> = {
  js: 'javascript',
  ts: 'typescript',
  htm: 'html',
  xhtml: 'html',
  svg: 'xml',
  py: 'python',
  'c++': 'cpp',
  cc: 'cpp',
  cxx: 'cpp',
  c: 'cpp', // Use cpp for C highlighting
  cs: 'csharp',
  'c#': 'csharp',
  rb: 'ruby',
  golang: 'go',
  rs: 'rust',
  sh: 'bash',
  shell: 'bash',
  yml: 'yaml',
  kt: 'kotlin',
  kts: 'kotlin',
  hs: 'haskell',
  pl: 'perl',
  pm: 'perl',
  jl: 'julia',
  md: 'markdown',
  scss: 'css', // Use CSS for SCSS
  sass: 'css',
  less: 'css',
  toml: 'ini',
}

// Cache for loaded languages
const loadedLanguages = new Set<string>()
const loadingPromises = new Map<string, Promise<void>>()

// Pre-load core web languages immediately
const CORE_LANGUAGES = ['javascript', 'typescript', 'css', 'html', 'xml', 'json']

// Load a language dynamically
async function loadLanguage(lang: string): Promise<boolean> {
  // Resolve alias
  const resolvedLang = LANGUAGE_ALIASES[lang] || lang
  
  // Check if already loaded
  if (loadedLanguages.has(resolvedLang)) {
    return true
  }
  
  // Check if currently loading
  if (loadingPromises.has(resolvedLang)) {
    await loadingPromises.get(resolvedLang)
    return loadedLanguages.has(resolvedLang)
  }
  
  // Check if we have a loader for this language
  if (!LANGUAGE_MAP[resolvedLang]) {
    console.warn(`Language not supported: ${lang} (resolved: ${resolvedLang})`)
    return false
  }
  
  // Start loading
  const loadingPromise = (async () => {
    try {
      const module = await LANGUAGE_MAP[resolvedLang]()
      hljs.registerLanguage(resolvedLang, module.default)
      loadedLanguages.add(resolvedLang)
      
      // Register aliases
      Object.entries(LANGUAGE_ALIASES).forEach(([alias, target]) => {
        if (target === resolvedLang) {
          hljs.registerLanguage(alias, module.default)
        }
      })
      
      console.debug(`Loaded language: ${resolvedLang}`)
    } catch (error) {
      console.error(`Failed to load language ${resolvedLang}:`, error)
    }
  })()
  
  loadingPromises.set(resolvedLang, loadingPromise)
  await loadingPromise
  loadingPromises.delete(resolvedLang)
  
  return loadedLanguages.has(resolvedLang)
}

// Pre-load core languages
const initPromise = Promise.all(
  CORE_LANGUAGES.map(lang => loadLanguage(lang))
).then(() => {
  console.debug('Core languages pre-loaded')
})

// Enhanced highlight function with dynamic loading
async function highlightCode(code: string, language?: string): Promise<string> {
  // Ensure core languages are loaded
  await initPromise
  
  if (!language) {
    return hljs.highlightAuto(code).value
  }
  
  // Try to load the language if not already loaded
  const loaded = await loadLanguage(language)
  
  if (loaded) {
    const resolvedLang = LANGUAGE_ALIASES[language] || language
    try {
      return hljs.highlight(code, { language: resolvedLang }).value
    } catch (error) {
      console.warn(`Highlighting failed for language ${language}:`, error)
      return hljs.highlightAuto(code).value
    }
  } else {
    // Fallback to auto-detection
    return hljs.highlightAuto(code).value
  }
}

// Create optimized markdown instance
export const createOptimizedMarkdown = (): MarkdownIt => {
  const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    breaks: true,
    highlight: (str, lang) => {
      if (lang) {
        // For synchronous processing, check if language is already loaded
        const resolvedLang = LANGUAGE_ALIASES[lang] || lang
        if (loadedLanguages.has(resolvedLang)) {
          try {
            return hljs.highlight(str, { language: resolvedLang }).value
          } catch (error) {
            console.warn(`Highlighting failed for language ${lang}:`, error)
          }
        } else {
          // Trigger async loading for next time
          loadLanguage(lang).catch(console.error)
        }
      }
      
      // Fallback to auto-detection or plain text
      try {
        return hljs.highlightAuto(str).value
      } catch (error) {
        return str // Return plain text if highlighting fails
      }
    }
  })
  
  return md
}

// Export the async highlight function for use in other components
export { highlightCode, loadLanguage }

// Export language utilities
export const getSupportedLanguages = (): string[] => {
  return [
    ...Object.keys(LANGUAGE_MAP),
    ...Object.keys(LANGUAGE_ALIASES)
  ].sort()
}

export const getLoadedLanguages = (): string[] => {
  return Array.from(loadedLanguages).sort()
}

// Pre-warm popular languages in the background
export const preloadPopularLanguages = async (): Promise<void> => {
  const popular = ['python', 'java', 'bash', 'yaml', 'sql', 'go', 'rust']
  
  // Load popular languages in the background with a delay
  setTimeout(() => {
    popular.forEach(lang => {
      loadLanguage(lang).catch(console.error)
    })
  }, 2000) // Wait 2 seconds after initial page load
}

// Performance cache for rendered content
const renderCache = new Map<string, string>()
const CACHE_SIZE_LIMIT = 100 // Maximum cache entries

// MarkdownProcessor class for backward compatibility
export class MarkdownProcessor {
  private static md = createOptimizedMarkdown()

  static render(content: string, options: {
    codeHighlighting?: boolean
    showLineNumbers?: boolean
    copyCodeButton?: boolean
    renderMath?: boolean
    renderMermaid?: boolean
    tableOfContents?: boolean
    tocPosition?: string
  } = {}): string {
    if (!content.trim()) {
      return '<div class="empty-state">Start typing to see your markdown rendered here...</div>'
    }

    // Apply default options
    const finalOptions = {
      codeHighlighting: true,
      showLineNumbers: false,
      copyCodeButton: true,
      renderMath: true,
      renderMermaid: true,
      tableOfContents: false,
      tocPosition: 'top',
      ...options
    }

    // Check cache first for performance
    const cacheKey = this.generateCacheKey(content + JSON.stringify(finalOptions))
    const cached = renderCache.get(cacheKey)
    if (cached) {
      return cached
    }

    try {
      // Temporarily update highlight function based on options
      const originalHighlight = this.md.options.highlight
      if (!finalOptions.codeHighlighting) {
        this.md.options.highlight = undefined
      }
      
      // Render markdown with all enhancements
      let rendered = this.md.render(content)
      
      // Restore original highlight function
      this.md.options.highlight = originalHighlight
      
      // Post-process for additional features
      if (finalOptions.showLineNumbers) {
        rendered = this.addLineNumbers(rendered)
      }
      
      if (finalOptions.copyCodeButton) {
        rendered = this.addCopyButtons(rendered)
      }
      
      if (finalOptions.tableOfContents) {
        rendered = this.addTableOfContents(rendered, content, finalOptions.tocPosition)
      }
      
      // Cache the result with size limit
      this.updateCache(cacheKey, rendered)
      
      return rendered
    } catch (error) {
      console.error('Markdown rendering error:', error)
      return '<div class="empty-state error">Error rendering markdown</div>'
    }
  }

  private static generateCacheKey(content: string): string {
    // Simple hash function for cache key
    let hash = 0
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return hash.toString(36)
  }

  private static updateCache(key: string, value: string): void {
    // Implement LRU cache behavior
    if (renderCache.size >= CACHE_SIZE_LIMIT) {
      const firstKey = renderCache.keys().next().value
      renderCache.delete(firstKey)
    }
    renderCache.set(key, value)
  }

  static clearCache(): void {
    renderCache.clear()
  }

  static getCacheStats(): { size: number; limit: number } {
    return {
      size: renderCache.size,
      limit: CACHE_SIZE_LIMIT
    }
  }

  private static addLineNumbers(html: string): string {
    // Add line numbers to code blocks
    return html.replace(/<pre><code.*?>([\s\S]*?)<\/code><\/pre>/g, (match, code) => {
      const lines = code.split('\n')
      const numberedLines = lines.map((line, i) => 
        `<span class="line-number">${i + 1}</span>${line}`
      ).join('\n')
      return match.replace(code, numberedLines)
    })
  }

  private static addCopyButtons(html: string): string {
    // Add copy buttons to code blocks
    let codeBlockIndex = 0
    return html.replace(/<pre><code.*?>([\s\S]*?)<\/code><\/pre>/g, (match) => {
      const id = `code-block-${codeBlockIndex++}`
      return `<div class="code-block-wrapper" id="${id}">
        <button class="copy-code-button" onclick="copyCodeBlock('${id}')" title="Copy code">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
        </button>
        ${match}
      </div>`
    })
  }

  private static addTableOfContents(html: string, markdown: string, position: string): string {
    // Extract headings from markdown
    const headingRegex = /^(#{1,6})\s+(.+)$/gm
    const headings: Array<{level: number, text: string, id: string}> = []
    let match
    
    while ((match = headingRegex.exec(markdown)) !== null) {
      const level = match[1].length
      const text = match[2]
      const id = text.toLowerCase().replace(/[^\w]+/g, '-')
      headings.push({ level, text, id })
    }
    
    if (headings.length === 0) {
      return html
    }
    
    // Build TOC HTML
    let tocHtml = '<div class="table-of-contents"><h2>Table of Contents</h2><ul>'
    let currentLevel = 0
    
    headings.forEach(heading => {
      while (currentLevel < heading.level) {
        tocHtml += '<ul>'
        currentLevel++
      }
      while (currentLevel > heading.level) {
        tocHtml += '</ul>'
        currentLevel--
      }
      tocHtml += `<li><a href="#${heading.id}">${heading.text}</a></li>`
    })
    
    while (currentLevel > 0) {
      tocHtml += '</ul>'
      currentLevel--
    }
    tocHtml += '</ul></div>'
    
    // Add IDs to headings in HTML
    html = html.replace(/<h([1-6])>(.*?)<\/h\1>/g, (match, level, text) => {
      const id = text.toLowerCase().replace(/[^\w]+/g, '-')
      return `<h${level} id="${id}">${text}</h${level}>`
    })
    
    // Insert TOC based on position
    if (position === 'bottom') {
      return html + tocHtml
    } else {
      return tocHtml + html
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
    let match: RegExpExecArray | null

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

// MarkdownProcessor is already exported as a named export above