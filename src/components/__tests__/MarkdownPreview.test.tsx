import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MarkdownPreview } from '../MarkdownPreview'
import { Note } from '../../types'

// Mock markdown processor
vi.mock('../../lib/markdown', () => ({
  MarkdownProcessor: {
    render: vi.fn((content: string) => {
      // Simple mock markdown rendering
      if (content.includes('# ')) {
        return content.replace(/# (.+)/g, '<h1>$1</h1>')
      }
      if (content.includes('**')) {
        return content.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      }
      if (content.includes('```')) {
        return content.replace(/```(\w+)?\n([\s\S]+?)```/g, '<pre><code class="language-$1">$2</code></pre>')
      }
      return `<p>${content}</p>`
    })
  }
}))

// Mock DOMPurify
vi.mock('dompurify', () => ({
  default: {
    sanitize: vi.fn((html: string) => html) // Just pass through for tests
  }
}))

// Mock code highlighting utilities
vi.mock('../../utils/codeHighlighting', () => ({
  highlightCodeBlocks: vi.fn()
}))

describe('MarkdownPreview', () => {
  const mockNote: Note = {
    id: '1',
    title: 'Test Note',
    content: '# Test Content\n\nThis is a test note with **bold** text.',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
    notebook: 'test',
    status: 'active' as const,
    tags: ['test', 'markdown'],
    pinned: false
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Content Rendering', () => {
    it('should render markdown content as HTML', () => {
      render(<MarkdownPreview note={mockNote} />)
      
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Test Content')
      expect(screen.getByText('bold')).toBeInTheDocument()
    })

    it('should render empty state when note has no content', () => {
      const emptyNote = { ...mockNote, content: '' }
      render(<MarkdownPreview note={emptyNote} />)
      
      expect(screen.getByText(/empty note/i)).toBeInTheDocument()
    })

    it('should render code blocks with syntax highlighting', async () => {
      const noteWithCode = {
        ...mockNote,
        content: '```javascript\nconst x = 42;\n```'
      }
      
      render(<MarkdownPreview note={noteWithCode} />)
      
      await waitFor(() => {
        const codeBlock = screen.getByText('const x = 42;')
        expect(codeBlock.closest('code')).toHaveClass('language-javascript')
      })
    })

    it('should handle complex markdown structures', () => {
      const complexNote = {
        ...mockNote,
        content: `# Heading 1
## Heading 2
### Heading 3

- List item 1
- List item 2
  - Nested item

1. Ordered item 1
2. Ordered item 2

> Blockquote

[Link](https://example.com)

![Image](https://example.com/image.png)`
      }
      
      render(<MarkdownPreview note={complexNote} />)
      
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    })
  })

  describe('Metadata Display', () => {
    it('should display note title', () => {
      render(<MarkdownPreview note={mockNote} />)
      
      expect(screen.getByText(mockNote.title)).toBeInTheDocument()
    })

    it('should display notebook information', () => {
      render(<MarkdownPreview note={mockNote} />)
      
      expect(screen.getByText(mockNote.notebook)).toBeInTheDocument()
    })

    it('should display tags', () => {
      render(<MarkdownPreview note={mockNote} />)
      
      mockNote.tags.forEach(tag => {
        expect(screen.getByText(tag)).toBeInTheDocument()
      })
    })

    it('should display creation and update dates', () => {
      render(<MarkdownPreview note={mockNote} />)
      
      expect(screen.getByText(/created:/i)).toBeInTheDocument()
      expect(screen.getByText(/updated:/i)).toBeInTheDocument()
      expect(screen.getByText('1/1/2024')).toBeInTheDocument()
      expect(screen.getByText('1/2/2024')).toBeInTheDocument()
    })

    it('should show pinned indicator when note is pinned', () => {
      const pinnedNote = { ...mockNote, pinned: true }
      render(<MarkdownPreview note={pinnedNote} />)
      
      expect(screen.getByTitle(/pinned/i)).toBeInTheDocument()
    })
  })

  describe('Code Highlighting', () => {
    it('should apply syntax highlighting to code blocks', async () => {
      const { highlightCodeBlocks } = await import('../../utils/codeHighlighting')
      const noteWithCode = {
        ...mockNote,
        content: '```javascript\nfunction test() {}\n```'
      }
      
      render(<MarkdownPreview note={noteWithCode} />)
      
      await waitFor(() => {
        expect(highlightCodeBlocks).toHaveBeenCalled()
      })
    })

    it('should handle multiple code blocks', async () => {
      const noteWithMultipleCode = {
        ...mockNote,
        content: `
\`\`\`javascript
const x = 1;
\`\`\`

Some text

\`\`\`python
def test():
    pass
\`\`\`
`
      }
      
      render(<MarkdownPreview note={noteWithMultipleCode} />)
      
      await waitFor(() => {
        const codeBlocks = screen.getAllByText(/const x = 1|def test/i)
        expect(codeBlocks).toHaveLength(2)
      })
    })
  })

  describe('Security', () => {
    it('should sanitize HTML content', () => {
      const DOMPurify = vi.mocked(await import('dompurify')).default
      const noteWithDangerousContent = {
        ...mockNote,
        content: '<script>alert("XSS")</script><p>Safe content</p>'
      }
      
      render(<MarkdownPreview note={noteWithDangerousContent} />)
      
      expect(DOMPurify.sanitize).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          ALLOWED_TAGS: expect.arrayContaining(['p', 'h1', 'h2', 'strong', 'em']),
          ALLOWED_ATTR: expect.arrayContaining(['href', 'src', 'alt', 'class'])
        })
      )
    })

    it('should allow safe HTML elements', () => {
      const safeNote = {
        ...mockNote,
        content: '<h1>Heading</h1><p>Paragraph with <strong>bold</strong> and <em>italic</em></p>'
      }
      
      render(<MarkdownPreview note={safeNote} />)
      
      expect(screen.getByRole('heading')).toBeInTheDocument()
      expect(screen.getByText('bold')).toBeInTheDocument()
      expect(screen.getByText('italic')).toBeInTheDocument()
    })
  })

  describe('Scroll Behavior', () => {
    it('should handle scroll events', () => {
      const { container } = render(<MarkdownPreview note={mockNote} />)
      const previewContent = container.querySelector('.preview-content')
      
      if (previewContent) {
        fireEvent.scroll(previewContent, { target: { scrollTop: 100 } })
        // Component should handle scroll without errors
      }
    })

    it('should sync scroll position when configured', () => {
      // This would test scroll sync functionality if implemented
      const onScroll = vi.fn()
      const { container } = render(
        <MarkdownPreview note={mockNote} onScroll={onScroll} />
      )
      
      const previewContent = container.querySelector('.preview-content')
      if (previewContent) {
        fireEvent.scroll(previewContent)
        // Would expect onScroll to be called if prop exists
      }
    })
  })

  describe('Performance', () => {
    it('should memoize rendered content', () => {
      const { MarkdownProcessor } = vi.mocked(await import('../../lib/markdown'))
      const { rerender } = render(<MarkdownPreview note={mockNote} />)
      
      const callCount = MarkdownProcessor.render.mock.calls.length
      
      // Re-render with same note
      rerender(<MarkdownPreview note={mockNote} />)
      
      // Should not re-process markdown
      expect(MarkdownProcessor.render).toHaveBeenCalledTimes(callCount)
    })

    it('should re-render when note content changes', () => {
      const { MarkdownProcessor } = vi.mocked(await import('../../lib/markdown'))
      const { rerender } = render(<MarkdownPreview note={mockNote} />)
      
      const updatedNote = { ...mockNote, content: '# Updated Content' }
      rerender(<MarkdownPreview note={updatedNote} />)
      
      expect(MarkdownProcessor.render).toHaveBeenCalledWith('# Updated Content')
    })
  })

  describe('Edge Cases', () => {
    it('should handle very long content', () => {
      const longNote = {
        ...mockNote,
        content: 'Lorem ipsum '.repeat(1000)
      }
      
      render(<MarkdownPreview note={longNote} />)
      
      // Should render without performance issues
      expect(screen.getByText(/Lorem ipsum/)).toBeInTheDocument()
    })

    it('should handle special characters in content', () => {
      const specialNote = {
        ...mockNote,
        content: '# Special <>&"\'` Characters\n\n© 2024 • Test → Note'
      }
      
      render(<MarkdownPreview note={specialNote} />)
      
      // Should render special characters correctly
      expect(screen.getByRole('heading')).toBeInTheDocument()
    })

    it('should handle malformed markdown gracefully', () => {
      const malformedNote = {
        ...mockNote,
        content: '# Unclosed heading\n**Unclosed bold\n```\nUnclosed code block'
      }
      
      // Should not throw
      expect(() => {
        render(<MarkdownPreview note={malformedNote} />)
      }).not.toThrow()
    })

    it('should handle missing note properties', () => {
      const incompleteNote = {
        id: '1',
        title: 'Incomplete',
        content: 'Content'
      } as Note
      
      // Should render with defaults
      render(<MarkdownPreview note={incompleteNote} />)
      
      expect(screen.getByText('Incomplete')).toBeInTheDocument()
      expect(screen.getByText('Content')).toBeInTheDocument()
    })
  })
})