// Optimized Markdown processing utilities with dynamic language loading
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js/lib/core'
import { editorLogger } from '../utils/logger'

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
  env: 'bash', // Treat .env files as shell scripts
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
const CORE_LANGUAGES = [
  'javascript',
  'typescript',
  'css',
  'html',
  'xml',
  'json',
]

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
    editorLogger.warn(`Language not supported: ${lang} (resolved: ${resolvedLang})`)
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

      editorLogger.debug(`Loaded language: ${resolvedLang}`)
    } catch (error) {
      editorLogger.error(`Failed to load language ${resolvedLang}:`, error)
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
  editorLogger.debug('Core languages pre-loaded')
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
      editorLogger.warn(`Highlighting failed for language ${language}:`, error)
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
            editorLogger.warn(`Highlighting failed for language ${lang}:`, error)
          }
        } else {
          // Trigger async loading for next time
          loadLanguage(lang).catch(error => editorLogger.error('Failed to load language:', error))
        }
      }

      // Fallback to auto-detection or plain text
      try {
        return hljs.highlightAuto(str).value
      } catch (error) {
        return str // Return plain text if highlighting fails
      }
    },
  })

  // Customize link rendering to add target="_blank" and rel="noopener noreferrer"
  const defaultLinkRenderer = md.renderer.rules.link_open || function(tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options)
  }
  
  md.renderer.rules.link_open = function(tokens, idx, options, env, self) {
    const token = tokens[idx]
    const hrefIndex = token.attrIndex('href')
    
    if (hrefIndex >= 0) {
      const href = token.attrs[hrefIndex][1]
      
      // Check if it's an external link
      if (href && (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('//'))) {
        // Add target="_blank" and rel="noopener noreferrer" for external links
        token.attrPush(['target', '_blank'])
        token.attrPush(['rel', 'noopener noreferrer'])
        token.attrPush(['class', 'external-link'])
      }
    }
    
    return defaultLinkRenderer(tokens, idx, options, env, self)
  }

  return md
}

// Export the async highlight function for use in other components
export { highlightCode, loadLanguage }

// Export language utilities
export const getSupportedLanguages = (): string[] => {
  return [...Object.keys(LANGUAGE_MAP), ...Object.keys(LANGUAGE_ALIASES)].sort()
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
      loadLanguage(lang).catch(error => editorLogger.error('Failed to preload language:', error))
    })
  }, 2000) // Wait 2 seconds after initial page load
}

// Performance cache for rendered content
const renderCache = new Map<string, string>()
const CACHE_SIZE_LIMIT = 100 // Maximum cache entries

// Plugin hook types for markdown processing
export interface MarkdownHook {
  beforeMarkdown?: (content: string) => string
  afterHTML?: (html: string, content: string) => string
  customRenderer?: (token: any, md: MarkdownIt) => string | null
}

// Plugin registration for markdown hooks
const markdownPluginHooks: MarkdownHook[] = []

export const registerMarkdownPlugin = (hook: MarkdownHook): (() => void) => {
  markdownPluginHooks.push(hook)
  // Return unregister function
  return () => {
    const index = markdownPluginHooks.indexOf(hook)
    if (index > -1) {
      markdownPluginHooks.splice(index, 1)
    }
  }
}

// MarkdownProcessor class for backward compatibility
export class MarkdownProcessor {
  private static md = createOptimizedMarkdown()

  static render(
    content: string,
    options: {
      codeHighlighting?: boolean
      showLineNumbers?: boolean
      copyCodeButton?: boolean
      renderMath?: boolean
      renderMermaid?: boolean
      tableOfContents?: boolean
      tocPosition?: string
      enablePlugins?: boolean
    } = {}
  ): string {
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
      enablePlugins: true,
      ...options,
    }

    // Apply plugin beforeMarkdown hooks if enabled
    let processedContent = content
    if (finalOptions.enablePlugins) {
      try {
        for (const hook of markdownPluginHooks) {
          if (hook.beforeMarkdown) {
            processedContent = hook.beforeMarkdown(processedContent)
          }
        }
      } catch (error) {
        editorLogger.warn('Plugin beforeMarkdown hook failed:', error)
        // Continue with original content if plugin fails
        processedContent = content
      }
    }

    // Check cache first for performance (include processed content in cache key)
    const cacheKey = this.generateCacheKey(
      processedContent + JSON.stringify(finalOptions)
    )
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
      let rendered = this.md.render(processedContent)

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
        rendered = this.addTableOfContents(
          rendered,
          content,
          finalOptions.tocPosition
        )
      }

      // Process viny:// image references and blocked images
      rendered = this.processImageReferences(rendered)

      // Apply plugin afterHTML hooks if enabled
      if (finalOptions.enablePlugins) {
        try {
          for (const hook of markdownPluginHooks) {
            if (hook.afterHTML) {
              rendered = hook.afterHTML(rendered, processedContent)
            }
          }
        } catch (error) {
          editorLogger.warn('Plugin afterHTML hook failed:', error)
          // Continue with current rendered content if plugin fails
        }
      }

      // Cache the result with size limit
      this.updateCache(cacheKey, rendered)

      return rendered
    } catch (error) {
      editorLogger.error('Markdown rendering error:', error)
      return '<div class="empty-state error">Error rendering markdown</div>'
    }
  }

  private static generateCacheKey(content: string): string {
    // Simple hash function for cache key
    let hash = 0
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i)
      hash = (hash << 5) - hash + char
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
      limit: CACHE_SIZE_LIMIT,
    }
  }

  private static addLineNumbers(html: string): string {
    // Add line numbers to code blocks
    return html.replace(
      /<pre><code.*?>([\s\S]*?)<\/code><\/pre>/g,
      (match, code) => {
        const lines = code.split('\n')
        const numberedLines = lines
          .map((line, i) => `<span class="line-number">${i + 1}</span>${line}`)
          .join('\n')
        return match.replace(code, numberedLines)
      }
    )
  }

  private static addCopyButtons(html: string): string {
    // Add copy buttons to code blocks
    let codeBlockIndex = 0
    return html.replace(/<pre><code.*?>([\s\S]*?)<\/code><\/pre>/g, match => {
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

  private static addTableOfContents(
    html: string,
    markdown: string,
    position: string
  ): string {
    // Extract headings from markdown
    const headingRegex = /^(#{1,6})\s+(.+)$/gm
    const headings: Array<{ level: number; text: string; id: string }> = []
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
    let tocHtml =
      '<div class="table-of-contents"><h2>Table of Contents</h2><ul>'
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
    return content
      .trim()
      .split(/\s+/)
      .filter(word => word.length > 0).length
  }

  static getCharCount(content: string): number {
    return content.length
  }

  static getReadingTime(content: string): number {
    const words = this.getWordCount(content)
    const wordsPerMinute = 200
    return Math.ceil(words / wordsPerMinute)
  }

  // Image processing method
  private static processImageReferences(html: string): string {
    return html.replace(
      /<img([^>]*?)src=["']([^"']+)["']([^>]*?)>/g,
      (match, before, src, after) => {
        // Handle viny:// image references
        if (src.startsWith('viny://image:')) {
          const imageId = src.replace('viny://image:', '')

          // Try to get from memory first
          let dataUri = null
          if (
            typeof window !== 'undefined' &&
            (window as any).vinyImageStore &&
            (window as any).vinyImageStore.has(imageId)
          ) {
            dataUri = (window as any).vinyImageStore.get(imageId)
          } else if (typeof window !== 'undefined') {
            // Try to load from localStorage directly
            try {
              const storedImages = JSON.parse(
                localStorage.getItem('viny-images') || '{}'
              )
              if (storedImages[imageId]) {
                dataUri = storedImages[imageId]
                // Cache in memory for next time
                if (!(window as any).vinyImageStore) {
                  ;(window as any).vinyImageStore = new Map()
                }
                ;(window as any).vinyImageStore.set(imageId, dataUri)
              }
            } catch (error) {
              editorLogger.error('Failed to load image from storage:', error)
            }
          }

          if (dataUri) {
            return `<img${before}src="${dataUri}"${after}>`
          } else {
            // Image reference not found
            const altMatch = match.match(/alt=["']([^"']*?)["']/)
            const altText = altMatch ? altMatch[1] : 'Missing image'
            return `<div class="missing-image-placeholder" style="
            border: 2px dashed #e2e8f0;
            border-radius: 8px;
            padding: 20px;
            margin: 16px 0;
            text-align: center;
            background-color: #f8fafc;
            color: #64748b;
          ">
            <div style="margin-bottom: 8px;">⚠️</div>
            <div style="font-weight: 500; margin-bottom: 4px;">Image Not Found</div>
            <div style="font-size: 0.875rem; opacity: 0.8;">${altText}</div>
            <div style="font-size: 0.75rem; opacity: 0.6;">Reference: ${imageId}</div>
          </div>`
          }
        }

        // Check if external URL is allowed (this preserves existing security)
        if (src.startsWith('http://') || src.startsWith('https://')) {
          // For now, we'll allow them through and let DOMPurify handle security
          // This preserves the existing behavior while fixing viny:// references
          return match
        }

        return match // Return original if it's a data URI, relative path, etc.
      }
    )
  }

  // Plugin support methods
  static injectPluginCSS(css: string, pluginId: string): () => void {
    const styleId = `plugin-css-${pluginId}`
    let styleElement = document.getElementById(styleId) as HTMLStyleElement

    if (!styleElement) {
      styleElement = document.createElement('style')
      styleElement.id = styleId
      styleElement.setAttribute('data-plugin', pluginId)
      document.head.appendChild(styleElement)
    }

    styleElement.textContent = css

    // Return cleanup function
    return () => {
      const element = document.getElementById(styleId)
      if (element) {
        element.remove()
      }
    }
  }

  static removePluginCSS(pluginId: string): void {
    const styleId = `plugin-css-${pluginId}`
    const element = document.getElementById(styleId)
    if (element) {
      element.remove()
    }
  }

  static getRegisteredPlugins(): number {
    return markdownPluginHooks.length
  }
}

// MarkdownProcessor is already exported as a named export above
