import { marked } from 'marked'
import DOMPurify from 'dompurify'
import type { Note } from '../types'
import { noteLogger } from '../utils/logger'

interface ExportOptions {
  includeMetadata?: boolean
  filename?: string
}

export const useExport = () => {
  const generateHTML = (note: Note, includeMetadata = true): string => {
    const html = marked(note.content || '', {
      breaks: true,
      gfm: true,
    })

    const sanitizedHtml = DOMPurify.sanitize(html as string)

    const metadata = includeMetadata
      ? `
      <div class="note-metadata">
        <h1>${note.title}</h1>
        <div class="metadata-info">
          <span><strong>Notebook:</strong> ${note.notebook}</span>
          <span><strong>Created:</strong> ${new Date(note.createdAt).toLocaleDateString()}</span>
          ${note.updatedAt ? `<span><strong>Updated:</strong> ${new Date(note.updatedAt).toLocaleDateString()}</span>` : ''}
          ${note.tags && note.tags.length > 0 ? `<span><strong>Tags:</strong> ${note.tags.join(', ')}</span>` : ''}
        </div>
      </div>
      <hr />
    `
      : ''

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${note.title} - Viny Export</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
            background: #fff;
          }
          
          .note-metadata {
            margin-bottom: 2rem;
            padding: 1rem;
            background: #f8f9fa;
            border-radius: 6px;
            border-left: 4px solid #007acc;
          }
          
          .note-metadata h1 {
            margin: 0 0 1rem 0;
            color: #007acc;
            font-size: 2rem;
          }
          
          .metadata-info {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            font-size: 0.9rem;
            color: #666;
          }
          
          h1 { color: #007acc; font-size: 2rem; margin: 1.5rem 0 1rem 0; }
          h2 { color: #2aa198; font-size: 1.5rem; margin: 1.3rem 0 0.8rem 0; }
          h3 { color: #6c71c4; font-size: 1.3rem; margin: 1.1rem 0 0.6rem 0; }
          h4 { color: #268bd2; font-size: 1.1rem; margin: 1rem 0 0.5rem 0; }
          h5 { color: #b58900; font-size: 1rem; margin: 0.9rem 0 0.4rem 0; }
          h6 { color: #586e75; font-size: 0.9rem; margin: 0.8rem 0 0.3rem 0; }
          
          p { margin: 1rem 0; }
          
          blockquote {
            border-left: 4px solid #6c71c4;
            margin: 1.5rem 0;
            padding: 1rem 1.5rem;
            background: #f8f9fa;
            font-style: italic;
          }
          
          code {
            background: #f1f3f4;
            padding: 0.2rem 0.4rem;
            border-radius: 3px;
            font-family: 'Monaco', 'Consolas', monospace;
            font-size: 0.9em;
          }
          
          pre {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 6px;
            padding: 1rem;
            overflow-x: auto;
            font-family: 'Monaco', 'Consolas', monospace;
          }
          
          pre code {
            background: none;
            padding: 0;
            border-radius: 0;
          }
          
          table {
            border-collapse: collapse;
            width: 100%;
            margin: 1.5rem 0;
          }
          
          th, td {
            border: 1px solid #dee2e6;
            padding: 0.75rem;
            text-align: left;
          }
          
          th {
            background: #f8f9fa;
            font-weight: 600;
          }
          
          a {
            color: #007acc;
            text-decoration: none;
          }
          
          a:hover {
            text-decoration: underline;
          }
          
          ul, ol {
            margin: 1rem 0;
            padding-left: 2rem;
          }
          
          li {
            margin: 0.5rem 0;
          }
          
          hr {
            border: none;
            border-top: 2px solid #e9ecef;
            margin: 2rem 0;
          }
          
          @media print {
            body {
              padding: 1rem;
            }
            
            .note-metadata {
              break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        ${metadata}
        <div class="note-content">
          ${sanitizedHtml}
        </div>
      </body>
      </html>
    `
  }

  const exportToHTML = (note: Note, options: ExportOptions = {}): void => {
    const { includeMetadata = true, filename } = options
    const html = generateHTML(note, includeMetadata)

    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download =
      filename || `${note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.html`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const exportToPDF = async (
    note: Note,
    options: ExportOptions = {}
  ): Promise<void> => {
    const { includeMetadata = true, filename } = options

    try {
      // Create a new window for printing
      const printWindow = window.open('', '_blank')
      if (!printWindow) {
        throw new Error('Popup blocked. Please allow popups for this site.')
      }

      const html = generateHTML(note, includeMetadata)
      printWindow.document.write(html)
      printWindow.document.close()

      // Wait for content to load
      await new Promise<void>(resolve => {
        if (printWindow.document.readyState === 'complete') {
          resolve()
        } else {
          printWindow.addEventListener('load', () => resolve())
        }
      })

      // Focus and print
      printWindow.focus()
      printWindow.print()

      // Close after printing (optional, user might want to keep it open)
      setTimeout(() => {
        printWindow.close()
      }, 1000)
    } catch (error) {
      noteLogger.error('PDF export failed:', error)
      throw error
    }
  }

  const exportToMarkdown = (note: Note, options: ExportOptions = {}): void => {
    const { includeMetadata = true, filename } = options

    let content = ''

    if (includeMetadata) {
      content += `# ${note.title}\n\n`
      content += `**Notebook:** ${note.notebook}\n`
      content += `**Created:** ${new Date(note.createdAt).toLocaleDateString()}\n`
      if (note.updatedAt) {
        content += `**Updated:** ${new Date(note.updatedAt).toLocaleDateString()}\n`
      }
      if (note.tags && note.tags.length > 0) {
        content += `**Tags:** ${note.tags.join(', ')}\n`
      }
      content += '\n---\n\n'
    }

    content += note.content || ''

    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download =
      filename || `${note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const exportMultipleNotes = (
    notes: Note[],
    format: 'html' | 'markdown' = 'html',
    options: ExportOptions = {}
  ): void => {
    const { includeMetadata = true, filename = 'viny_export' } = options

    if (format === 'markdown') {
      let combinedContent = '# Viny Notes Export\n\n'
      combinedContent += `Exported on: ${new Date().toLocaleDateString()}\n`
      combinedContent += `Total notes: ${notes.length}\n\n`
      combinedContent += '---\n\n'

      notes.forEach((note, index) => {
        if (index > 0) combinedContent += '\n\n---\n\n'

        if (includeMetadata) {
          combinedContent += `# ${note.title}\n\n`
          combinedContent += `**Notebook:** ${note.notebook}\n`
          combinedContent += `**Created:** ${new Date(note.createdAt).toLocaleDateString()}\n`
          if (note.updatedAt) {
            combinedContent += `**Updated:** ${new Date(note.updatedAt).toLocaleDateString()}\n`
          }
          if (note.tags && note.tags.length > 0) {
            combinedContent += `**Tags:** ${note.tags.join(', ')}\n`
          }
          combinedContent += '\n'
        }

        combinedContent += note.content || ''
      })

      const blob = new Blob([combinedContent], { type: 'text/markdown' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${filename}.md`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } else if (format === 'html') {
      let combinedHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Viny Notes Export</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 800px;
              margin: 0 auto;
              padding: 2rem;
              background: #fff;
            }
            
            .export-header {
              text-align: center;
              margin-bottom: 3rem;
              padding: 2rem;
              background: #f8f9fa;
              border-radius: 6px;
            }
            
            .note-separator {
              margin: 3rem 0;
              border: none;
              border-top: 3px solid #007acc;
              text-align: center;
            }
            
            .note-separator::after {
              content: '✦';
              background: #fff;
              color: #007acc;
              padding: 0 1rem;
              font-size: 1.2rem;
            }
            
            .note-metadata {
              margin-bottom: 2rem;
              padding: 1rem;
              background: #f8f9fa;
              border-radius: 6px;
              border-left: 4px solid #007acc;
            }
            
            .note-metadata h2 {
              margin: 0 0 1rem 0;
              color: #007acc;
              font-size: 1.5rem;
            }
            
            .metadata-info {
              display: flex;
              flex-direction: column;
              gap: 0.5rem;
              font-size: 0.9rem;
              color: #666;
            }
            
            h1 { color: #007acc; }
            h2 { color: #2aa198; }
            h3 { color: #6c71c4; }
            h4 { color: #268bd2; }
            h5 { color: #b58900; }
            h6 { color: #586e75; }
            
            blockquote {
              border-left: 4px solid #6c71c4;
              margin: 1.5rem 0;
              padding: 1rem 1.5rem;
              background: #f8f9fa;
              font-style: italic;
            }
            
            code {
              background: #f1f3f4;
              padding: 0.2rem 0.4rem;
              border-radius: 3px;
              font-family: 'Monaco', 'Consolas', monospace;
              font-size: 0.9em;
            }
            
            pre {
              background: #f8f9fa;
              border: 1px solid #e9ecef;
              border-radius: 6px;
              padding: 1rem;
              overflow-x: auto;
              font-family: 'Monaco', 'Consolas', monospace;
            }
            
            pre code {
              background: none;
              padding: 0;
            }
            
            table {
              border-collapse: collapse;
              width: 100%;
              margin: 1.5rem 0;
            }
            
            th, td {
              border: 1px solid #dee2e6;
              padding: 0.75rem;
              text-align: left;
            }
            
            th {
              background: #f8f9fa;
              font-weight: 600;
            }
            
            a {
              color: #007acc;
              text-decoration: none;
            }
            
            a:hover {
              text-decoration: underline;
            }
          </style>
        </head>
        <body>
          <div class="export-header">
            <h1>Viny Notes Export</h1>
            <p>Exported on: ${new Date().toLocaleDateString()}</p>
            <p>Total notes: ${notes.length}</p>
          </div>
      `

      notes.forEach((note, index) => {
        if (index > 0) {
          combinedHtml += '<hr class="note-separator">'
        }

        const html = marked(note.content || '', {
          breaks: true,
          gfm: true,
        })

        const sanitizedHtml = DOMPurify.sanitize(html as string)

        if (includeMetadata) {
          combinedHtml += `
            <div class="note-metadata">
              <h2>${note.title}</h2>
              <div class="metadata-info">
                <span><strong>Notebook:</strong> ${note.notebook}</span>
                <span><strong>Created:</strong> ${new Date(note.createdAt).toLocaleDateString()}</span>
                ${note.updatedAt ? `<span><strong>Updated:</strong> ${new Date(note.updatedAt).toLocaleDateString()}</span>` : ''}
                ${note.tags && note.tags.length > 0 ? `<span><strong>Tags:</strong> ${note.tags.join(', ')}</span>` : ''}
              </div>
            </div>
          `
        }

        combinedHtml += `<div class="note-content">${sanitizedHtml}</div>`
      })

      combinedHtml += '</body></html>'

      const blob = new Blob([combinedHtml], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${filename}.html`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }
  }

  return {
    exportToHTML,
    exportToPDF,
    exportToMarkdown,
    exportMultipleNotes,
    generateHTML,
  }
}
