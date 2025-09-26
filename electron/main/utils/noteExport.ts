import type { Note, ExportOptions } from '../../shared/types'

export function convertNoteToMarkdown(note: Note, options: ExportOptions): string {
  let content = ''
  
  // Add metadata if requested
  if (options.includeMetadata) {
    content += `---\n`
    content += `title: ${note.title}\n`
    content += `created: ${note.createdAt}\n`
    content += `updated: ${note.updatedAt}\n`
    if (note.tags.length > 0) {
      content += `tags: [${note.tags.join(', ')}]\n`
    }
    if (note.notebook) {
      content += `notebook: ${note.notebook}\n`
    }
    content += `---\n\n`
  }
  
  // Add title
  content += `# ${note.title}\n\n`
  
  // Add content
  content += note.content
  
  return content
}

export function convertNoteToHTML(note: Note, options: ExportOptions): string {
  let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(note.title)}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    h1 { color: #2c3e50; margin-bottom: 10px; }
    .metadata {
      color: #666;
      font-size: 0.9em;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 1px solid #eee;
    }
    .tag {
      display: inline-block;
      background: #e0e0e0;
      padding: 2px 8px;
      border-radius: 3px;
      margin-right: 5px;
      font-size: 0.85em;
    }
    pre {
      background: #f4f4f4;
      padding: 10px;
      border-radius: 5px;
      overflow-x: auto;
    }
    code {
      background: #f4f4f4;
      padding: 2px 4px;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
    }
    blockquote {
      border-left: 4px solid #ddd;
      margin-left: 0;
      padding-left: 20px;
      color: #666;
    }
  </style>
</head>
<body>
  <h1>${escapeHtml(note.title)}</h1>`
  
  // Add metadata if requested
  if (options.includeMetadata) {
    html += `\n  <div class="metadata">`
    html += `\n    <div>Created: ${new Date(note.createdAt).toLocaleString()}</div>`
    html += `\n    <div>Updated: ${new Date(note.updatedAt).toLocaleString()}</div>`
    
    if (note.tags.length > 0) {
      html += `\n    <div>Tags: `
      note.tags.forEach(tag => {
        html += `<span class="tag">${escapeHtml(tag)}</span>`
      })
      html += `</div>`
    }
    
    html += `\n  </div>`
  }
  
  // Convert markdown to HTML (basic conversion)
  const htmlContent = convertMarkdownToHtml(note.content)
  
  html += `\n  <div class="content">\n    ${htmlContent}\n  </div>`
  html += `\n</body>\n</html>`
  
  return html
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }
  return text.replace(/[&<>"']/g, m => map[m])
}

function convertMarkdownToHtml(markdown: string): string {
  // This is a very basic markdown to HTML converter
  // For production, you'd want to use a proper markdown parser
  
  let html = markdown
  
  // Escape HTML first
  html = escapeHtml(html)
  
  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>')
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>')
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>')
  
  // Bold
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  
  // Italic
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>')
  
  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
  
  // Line breaks
  html = html.replace(/\n\n/g, '</p><p>')
  html = `<p>${html}</p>`
  
  // Code blocks
  html = html.replace(/```([^`]+)```/g, '<pre><code>$1</code></pre>')
  
  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>')
  
  // Lists
  html = html.replace(/^\* (.+)$/gim, '<li>$1</li>')
  html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
  
  // Blockquotes
  html = html.replace(/^> (.+)$/gim, '<blockquote>$1</blockquote>')
  
  return html
}