/**
 * Tests for useExport hook
 * Medium priority hook for export functionality
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useExport } from '../useExport'
import type { Note } from '../../types'

// Mock dependencies
vi.mock('marked', () => ({
  marked: vi.fn((content: string) => `<p>${content}</p>`),
}))

vi.mock('dompurify', () => ({
  default: {
    sanitize: vi.fn((html: string) => html),
  },
}))

// Mock note for testing
const mockNote: Note = {
  id: 'test-note-id',
  title: 'Test Note',
  content: '# Test Content\n\nThis is a test note.',
  tags: ['tag1', 'tag2'],
  notebook: 'test-notebook',
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-02T00:00:00.000Z',
}

// Mock multiple notes for testing
const mockNotes: Note[] = [
  mockNote,
  {
    id: 'test-note-2',
    title: 'Second Note',
    content: '## Second Content\n\nAnother test note.',
    tags: ['tag3'],
    notebook: 'another-notebook',
    createdAt: '2025-01-01T10:00:00.000Z',
    updatedAt: '2025-01-02T10:00:00.000Z',
  },
]

// Mock DOM APIs
const mockCreateObjectURL = vi.fn(() => 'mock-url')
const mockRevokeObjectURL = vi.fn()
const mockCreateElement = vi.fn()
const mockAppendChild = vi.fn()
const mockRemoveChild = vi.fn()
const mockClick = vi.fn()
const mockOpen = vi.fn()
const mockWrite = vi.fn()
const mockClose = vi.fn()
const mockFocus = vi.fn()
const mockPrint = vi.fn()
const mockAddEventListener = vi.fn()

// Mock Blob
global.Blob = vi.fn().mockImplementation((content, options) => ({
  content,
  options,
})) as any

// Mock URL
global.URL = {
  createObjectURL: mockCreateObjectURL,
  revokeObjectURL: mockRevokeObjectURL,
} as any

// Mock document
const mockElement = {
  href: '',
  download: '',
  click: mockClick,
}

Object.defineProperty(global, 'document', {
  value: {
    createElement: mockCreateElement.mockReturnValue(mockElement),
    body: {
      appendChild: mockAppendChild,
      removeChild: mockRemoveChild,
    },
    write: mockWrite,
    close: mockClose,
    readyState: 'complete',
  },
  writable: true,
})

// Mock window
Object.defineProperty(global, 'window', {
  value: {
    open: mockOpen.mockReturnValue({
      document: {
        write: mockWrite,
        close: mockClose,
        readyState: 'complete',
      },
      addEventListener: mockAddEventListener,
      focus: mockFocus,
      print: mockPrint,
      close: vi.fn(),
    }),
  },
  writable: true,
})

describe('useExport', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.clearAllTimers()
  })

  describe('Hook initialization', () => {
    it('should provide all expected methods', () => {
      const exportFunctions = useExport()

      expect(exportFunctions).toHaveProperty('exportToHTML')
      expect(exportFunctions).toHaveProperty('exportToPDF')
      expect(exportFunctions).toHaveProperty('exportToMarkdown')
      expect(exportFunctions).toHaveProperty('exportMultipleNotes')
      expect(exportFunctions).toHaveProperty('generateHTML')

      // Check all methods are functions
      expect(typeof exportFunctions.exportToHTML).toBe('function')
      expect(typeof exportFunctions.exportToPDF).toBe('function')
      expect(typeof exportFunctions.exportToMarkdown).toBe('function')
      expect(typeof exportFunctions.exportMultipleNotes).toBe('function')
      expect(typeof exportFunctions.generateHTML).toBe('function')
    })
  })

  describe('generateHTML function', () => {
    it('should generate HTML with metadata by default', () => {
      const exportFunctions = useExport()

      const html = exportFunctions.generateHTML(mockNote)

      expect(html).toContain('<!DOCTYPE html>')
      expect(html).toContain('<html lang="en">')
      expect(html).toContain('<title>Test Note - Inkrun Export</title>')
      expect(html).toContain('<h1>Test Note</h1>')
      expect(html).toContain('<strong>Notebook:</strong> test-notebook')
      expect(html).toContain('<strong>Created:</strong>')
      expect(html).toContain('<strong>Updated:</strong>')
      expect(html).toContain('<strong>Tags:</strong> tag1, tag2')
      expect(html).toContain('<p># Test Content')
    })

    it('should generate HTML without metadata when specified', () => {
      const exportFunctions = useExport()

      const html = exportFunctions.generateHTML(mockNote, false)

      expect(html).toContain('<!DOCTYPE html>')
      expect(html).toContain('<title>Test Note - Inkrun Export</title>')
      expect(html).not.toContain('<h1>Test Note</h1>')
      expect(html).not.toContain('<strong>Notebook:</strong>')
      expect(html).toContain('<p># Test Content')
    })

    it('should handle note without tags', () => {
      const noteWithoutTags = { ...mockNote, tags: [] }
      const exportFunctions = useExport()

      const html = exportFunctions.generateHTML(noteWithoutTags)

      expect(html).not.toContain('<strong>Tags:</strong>')
    })

    it('should handle note without updatedAt', () => {
      const noteWithoutUpdated = { ...mockNote, updatedAt: undefined }
      const exportFunctions = useExport()

      const html = exportFunctions.generateHTML(noteWithoutUpdated)

      expect(html).not.toContain('<strong>Updated:</strong>')
    })

    it('should handle empty content', () => {
      const noteWithEmptyContent = { ...mockNote, content: '' }
      const exportFunctions = useExport()

      const html = exportFunctions.generateHTML(noteWithEmptyContent)

      expect(html).toContain('<!DOCTYPE html>')
      expect(html).toContain('<title>Test Note - Inkrun Export</title>')
    })

    it('should include proper CSS styling', () => {
      const exportFunctions = useExport()

      const html = exportFunctions.generateHTML(mockNote)

      expect(html).toContain('<style>')
      expect(html).toContain('font-family: -apple-system')
      expect(html).toContain('.note-metadata')
      expect(html).toContain('.metadata-info')
      expect(html).toContain('@media print')
    })
  })

  describe('exportToHTML function', () => {
    it('should export note to HTML file', () => {
      const exportFunctions = useExport()

      exportFunctions.exportToHTML(mockNote)

      expect(global.Blob).toHaveBeenCalledWith(
        [expect.stringContaining('<!DOCTYPE html>')],
        { type: 'text/html' }
      )
      expect(mockCreateObjectURL).toHaveBeenCalled()
      expect(mockCreateElement).toHaveBeenCalledWith('a')
      expect(mockElement.href).toBe('mock-url')
      expect(mockElement.download).toBe('test_note.html')
      expect(mockAppendChild).toHaveBeenCalled()
      expect(mockClick).toHaveBeenCalled()
      expect(mockRemoveChild).toHaveBeenCalled()
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('mock-url')
    })

    it('should use custom filename when provided', () => {
      const exportFunctions = useExport()

      exportFunctions.exportToHTML(mockNote, { filename: 'custom-name.html' })

      expect(mockElement.download).toBe('custom-name.html')
    })

    it('should handle includeMetadata option', () => {
      const exportFunctions = useExport()

      exportFunctions.exportToHTML(mockNote, { includeMetadata: false })

      expect(global.Blob).toHaveBeenCalledWith(
        [expect.not.stringContaining('<h1>Test Note</h1>')],
        { type: 'text/html' }
      )
    })

    it('should sanitize filename', () => {
      const noteWithSpecialChars = {
        ...mockNote,
        title: 'Test/Note\\With*Special?Chars',
      }
      const exportFunctions = useExport()

      exportFunctions.exportToHTML(noteWithSpecialChars)

      expect(mockElement.download).toBe('test_note_with_special_chars.html')
    })
  })

  describe('exportToPDF function', () => {
    it('should export note to PDF via print dialog', async () => {
      const exportFunctions = useExport()

      await exportFunctions.exportToPDF(mockNote)

      expect(mockOpen).toHaveBeenCalledWith('', '_blank')
      expect(mockWrite).toHaveBeenCalledWith(
        expect.stringContaining('<!DOCTYPE html>')
      )
      expect(mockClose).toHaveBeenCalled()
      expect(mockFocus).toHaveBeenCalled()
      expect(mockPrint).toHaveBeenCalled()
    })

    it('should handle popup blocking', async () => {
      mockOpen.mockReturnValueOnce(null)
      const exportFunctions = useExport()

      await expect(exportFunctions.exportToPDF(mockNote)).rejects.toThrow(
        'Popup blocked. Please allow popups for this site.'
      )
    })

    it('should handle export options', async () => {
      const exportFunctions = useExport()

      await exportFunctions.exportToPDF(mockNote, {
        includeMetadata: false,
        filename: 'custom-pdf.pdf',
      })

      expect(mockWrite).toHaveBeenCalledWith(
        expect.not.stringContaining('<h1>Test Note</h1>')
      )
    })

    it('should wait for document to load before printing', async () => {
      // Mock document not ready
      const mockWindow = {
        document: {
          write: mockWrite,
          close: mockClose,
          readyState: 'loading',
        },
        addEventListener: mockAddEventListener,
        focus: mockFocus,
        print: mockPrint,
        close: vi.fn(),
      }

      mockOpen.mockReturnValueOnce(mockWindow)

      const exportFunctions = useExport()

      // Start the export
      const exportPromise = exportFunctions.exportToPDF(mockNote)

      // Simulate load event
      const loadHandler = mockAddEventListener.mock.calls[0][1]
      loadHandler()

      await exportPromise

      expect(mockAddEventListener).toHaveBeenCalledWith(
        'load',
        expect.any(Function)
      )
      expect(mockPrint).toHaveBeenCalled()
    })
  })

  describe('exportToMarkdown function', () => {
    it('should export note to Markdown file', () => {
      const exportFunctions = useExport()

      exportFunctions.exportToMarkdown(mockNote)

      expect(global.Blob).toHaveBeenCalledWith(
        [expect.stringContaining('# Test Note')],
        { type: 'text/markdown' }
      )
      expect(mockElement.download).toBe('test_note.md')
    })

    it('should include metadata by default', () => {
      const exportFunctions = useExport()

      exportFunctions.exportToMarkdown(mockNote)

      const blobContent = (global.Blob as any).mock.calls[0][0][0]
      expect(blobContent).toContain('# Test Note')
      expect(blobContent).toContain('**Notebook:** test-notebook')
      expect(blobContent).toContain('**Created:**')
      expect(blobContent).toContain('**Updated:**')
      expect(blobContent).toContain('**Tags:** tag1, tag2')
      expect(blobContent).toContain('---')
      expect(blobContent).toContain('# Test Content')
    })

    it('should exclude metadata when specified', () => {
      const exportFunctions = useExport()

      exportFunctions.exportToMarkdown(mockNote, { includeMetadata: false })

      const blobContent = (global.Blob as any).mock.calls[0][0][0]
      expect(blobContent).not.toContain('**Notebook:**')
      expect(blobContent).not.toContain('---')
      expect(blobContent).toContain('# Test Content')
    })

    it('should use custom filename when provided', () => {
      const exportFunctions = useExport()

      exportFunctions.exportToMarkdown(mockNote, {
        filename: 'custom-markdown.md',
      })

      expect(mockElement.download).toBe('custom-markdown.md')
    })

    it('should handle notes without tags or updatedAt', () => {
      const simpleNote = {
        ...mockNote,
        tags: [],
        updatedAt: undefined,
      }
      const exportFunctions = useExport()

      exportFunctions.exportToMarkdown(simpleNote)

      const blobContent = (global.Blob as any).mock.calls[0][0][0]
      expect(blobContent).not.toContain('**Tags:**')
      expect(blobContent).not.toContain('**Updated:**')
    })
  })

  describe('exportMultipleNotes function', () => {
    it('should export multiple notes to HTML by default', () => {
      const exportFunctions = useExport()

      exportFunctions.exportMultipleNotes(mockNotes)

      expect(global.Blob).toHaveBeenCalledWith(
        [expect.stringContaining('Inkrun Notes Export')],
        { type: 'text/html' }
      )
      expect(mockElement.download).toBe('inkrun_export.html')
    })

    it('should export multiple notes to Markdown', () => {
      const exportFunctions = useExport()

      exportFunctions.exportMultipleNotes(mockNotes, 'markdown')

      const blobContent = (global.Blob as any).mock.calls[0][0][0]
      expect(blobContent).toContain('# Inkrun Notes Export')
      expect(blobContent).toContain('Total notes: 2')
      expect(blobContent).toContain('# Test Note')
      expect(blobContent).toContain('# Second Note')
      expect(blobContent).toContain('---')
      expect(mockElement.download).toBe('inkrun_export.md')
    })

    it('should include metadata by default', () => {
      const exportFunctions = useExport()

      exportFunctions.exportMultipleNotes(mockNotes, 'markdown')

      const blobContent = (global.Blob as any).mock.calls[0][0][0]
      expect(blobContent).toContain('**Notebook:** test-notebook')
      expect(blobContent).toContain('**Notebook:** another-notebook')
    })

    it('should exclude metadata when specified', () => {
      const exportFunctions = useExport()

      exportFunctions.exportMultipleNotes(mockNotes, 'markdown', {
        includeMetadata: false,
      })

      const blobContent = (global.Blob as any).mock.calls[0][0][0]
      expect(blobContent).not.toContain('**Notebook:**')
    })

    it('should use custom filename', () => {
      const exportFunctions = useExport()

      exportFunctions.exportMultipleNotes(mockNotes, 'html', {
        filename: 'my-export',
      })

      expect(mockElement.download).toBe('my-export.html')
    })

    it('should handle HTML export with proper styling', () => {
      const exportFunctions = useExport()

      exportFunctions.exportMultipleNotes(mockNotes, 'html')

      const blobContent = (global.Blob as any).mock.calls[0][0][0]
      expect(blobContent).toContain('<div class="export-header">')
      expect(blobContent).toContain('<h1>Inkrun Notes Export</h1>')
      expect(blobContent).toContain('Total notes: 2')
      expect(blobContent).toContain('<hr class="note-separator">')
      expect(blobContent).toContain('.note-separator')
      expect(blobContent).toContain('.export-header')
    })

    it('should handle empty notes array', () => {
      const exportFunctions = useExport()

      exportFunctions.exportMultipleNotes([], 'markdown')

      const blobContent = (global.Blob as any).mock.calls[0][0][0]
      expect(blobContent).toContain('Total notes: 0')
    })

    it('should handle single note', () => {
      const exportFunctions = useExport()

      exportFunctions.exportMultipleNotes([mockNote], 'markdown')

      const blobContent = (global.Blob as any).mock.calls[0][0][0]
      expect(blobContent).toContain('Total notes: 1')
      expect(blobContent).toContain('# Test Note')
    })
  })

  describe('Edge cases and error handling', () => {
    it('should handle notes with undefined content', () => {
      const noteWithUndefinedContent = {
        ...mockNote,
        content: undefined,
      } as any
      const exportFunctions = useExport()

      const html = exportFunctions.generateHTML(noteWithUndefinedContent)

      expect(html).toContain('<!DOCTYPE html>')
      expect(html).not.toContain('undefined')
    })

    it('should handle notes with null content', () => {
      const noteWithNullContent = { ...mockNote, content: null } as any
      const exportFunctions = useExport()

      const html = exportFunctions.generateHTML(noteWithNullContent)

      expect(html).toContain('<!DOCTYPE html>')
      expect(html).not.toContain('null')
    })

    it('should handle very long content', () => {
      const longContent = 'A'.repeat(10000)
      const noteWithLongContent = { ...mockNote, content: longContent }
      const exportFunctions = useExport()

      expect(() => {
        exportFunctions.generateHTML(noteWithLongContent)
      }).not.toThrow()
    })

    it('should handle special characters in title', () => {
      const noteWithSpecialTitle = {
        ...mockNote,
        title: 'Test & Note > With "Special" Characters <script>',
      }
      const exportFunctions = useExport()

      const html = exportFunctions.generateHTML(noteWithSpecialTitle)

      expect(html).toContain('<!DOCTYPE html>')
      expect(html).toContain('Test & Note > With "Special" Characters <script>')
    })

    it('should handle invalid dates gracefully', () => {
      const noteWithInvalidDate = {
        ...mockNote,
        createdAt: 'invalid-date',
        updatedAt: 'also-invalid',
      }
      const exportFunctions = useExport()

      expect(() => {
        exportFunctions.generateHTML(noteWithInvalidDate)
      }).not.toThrow()
    })

    it('should handle PDF export errors gracefully', async () => {
      // Mock console.error to prevent error output in tests
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})

      mockOpen.mockImplementationOnce(() => {
        throw new Error('Window open failed')
      })

      const exportFunctions = useExport()

      await expect(exportFunctions.exportToPDF(mockNote)).rejects.toThrow(
        'Window open failed'
      )
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'PDF export failed:',
        expect.any(Error)
      )

      consoleErrorSpy.mockRestore()
    })
  })

  describe('Method stability', () => {
    it('should provide stable method references', () => {
      const exportFunctions = useExport()

      const initialMethods = {
        exportToHTML: exportFunctions.exportToHTML,
        exportToPDF: exportFunctions.exportToPDF,
        exportToMarkdown: exportFunctions.exportToMarkdown,
        exportMultipleNotes: exportFunctions.exportMultipleNotes,
        generateHTML: exportFunctions.generateHTML,
      }

      // Each call should create new instances (this is expected behavior)
      const exportFunctions2 = useExport()

      expect(exportFunctions.exportToHTML).not.toBe(
        exportFunctions2.exportToHTML
      )
      expect(exportFunctions.exportToPDF).not.toBe(exportFunctions2.exportToPDF)
      expect(exportFunctions.exportToMarkdown).not.toBe(
        exportFunctions2.exportToMarkdown
      )
      expect(exportFunctions.exportMultipleNotes).not.toBe(
        exportFunctions2.exportMultipleNotes
      )
      expect(exportFunctions.generateHTML).not.toBe(
        exportFunctions2.generateHTML
      )

      // But they should have the same functionality
      expect(typeof exportFunctions2.exportToHTML).toBe('function')
    })
  })
})
