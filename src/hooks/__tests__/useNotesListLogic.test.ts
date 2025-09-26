/**
 * Tests for useNotesListLogic hook
 * Medium priority hook for notes list utilities
 */

import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useNotesListLogic } from '../useNotesListLogic'
import type { Note } from '../../types'

// Mock dateUtils
vi.mock('../../utils/dateUtils', () => ({
  formatDate: vi.fn((dateString, options) => {
    if (options?.relative) {
      // Simple mock implementation for relative dates
      const date = new Date(dateString)
      const now = new Date()
      const diff = now.getTime() - date.getTime()
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))

      if (days === 0) return 'Today'
      if (days === 1) return 'Yesterday'
      if (days < 7) return `${days} days ago`
      return date.toLocaleDateString()
    }
    return dateString
  }),
}))

// Mock notes data
const mockNotes: Note[] = [
  {
    id: '1',
    title: 'First Note',
    content: '# Hello World\n\nThis is a **test** note with `code`.',
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-15T10:00:00Z',
    tags: ['test'],
    isPinned: false,
    isTrashed: false,
    status: 'active',
  },
  {
    id: '2',
    title: 'Second Note',
    content:
      '## Another Note\n\n* Item 1\n* Item 2\n\nSome more content here...',
    createdAt: '2025-01-14T10:00:00Z',
    updatedAt: '2025-01-14T10:00:00Z',
    tags: ['demo'],
    isPinned: true,
    isTrashed: false,
    status: 'active',
  },
  {
    id: '3',
    title: 'Long Note',
    content:
      'This is a very long note content that exceeds the preview length limit and should be truncated when displayed in the preview. It contains lots of text to test the truncation functionality properly.',
    createdAt: '2025-01-10T10:00:00Z',
    updatedAt: '2025-01-10T10:00:00Z',
    tags: [],
    isPinned: false,
    isTrashed: false,
    status: 'active',
  },
]

describe('useNotesListLogic', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Hook initialization', () => {
    it('should provide all expected values and functions', () => {
      const { result } = renderHook(() => useNotesListLogic(mockNotes))

      expect(result.current).toHaveProperty('isEmpty')
      expect(result.current).toHaveProperty('notesCount')
      expect(result.current).toHaveProperty('formatDate')
      expect(result.current).toHaveProperty('getPreviewText')

      expect(typeof result.current.isEmpty).toBe('boolean')
      expect(typeof result.current.notesCount).toBe('number')
      expect(typeof result.current.formatDate).toBe('function')
      expect(typeof result.current.getPreviewText).toBe('function')
    })
  })

  describe('Notes count and empty state', () => {
    it('should correctly count notes', () => {
      const { result } = renderHook(() => useNotesListLogic(mockNotes))

      expect(result.current.notesCount).toBe(3)
      expect(result.current.isEmpty).toBe(false)
    })

    it('should handle empty notes array', () => {
      const { result } = renderHook(() => useNotesListLogic([]))

      expect(result.current.notesCount).toBe(0)
      expect(result.current.isEmpty).toBe(true)
    })

    it('should handle single note', () => {
      const { result } = renderHook(() => useNotesListLogic([mockNotes[0]]))

      expect(result.current.notesCount).toBe(1)
      expect(result.current.isEmpty).toBe(false)
    })

    it('should update counts when notes change', () => {
      const { result, rerender } = renderHook(
        ({ notes }) => useNotesListLogic(notes),
        { initialProps: { notes: mockNotes } }
      )

      expect(result.current.notesCount).toBe(3)

      rerender({ notes: mockNotes.slice(0, 2) })
      expect(result.current.notesCount).toBe(2)

      rerender({ notes: [] })
      expect(result.current.notesCount).toBe(0)
      expect(result.current.isEmpty).toBe(true)
    })
  })

  describe('Date formatting', () => {
    it('should format date with relative option', async () => {
      const { formatDate } = await import('../../utils/dateUtils')
      const { result } = renderHook(() => useNotesListLogic(mockNotes))

      const formattedDate = result.current.formatDate('2025-01-15T10:00:00Z')

      expect(formatDate).toHaveBeenCalledWith('2025-01-15T10:00:00Z', {
        relative: true,
      })
      expect(typeof formattedDate).toBe('string')
    })

    it('should handle different date formats', () => {
      const { result } = renderHook(() => useNotesListLogic(mockNotes))

      // Test various date strings
      const dates = [
        '2025-01-15T10:00:00Z',
        '2025-01-14T10:00:00Z',
        '2025-01-10T10:00:00Z',
        new Date().toISOString(),
      ]

      dates.forEach(date => {
        const formatted = result.current.formatDate(date)
        expect(typeof formatted).toBe('string')
      })
    })
  })

  describe('Preview text extraction', () => {
    it('should extract preview text with default length', () => {
      const { result } = renderHook(() => useNotesListLogic(mockNotes))

      const preview = result.current.getPreviewText(mockNotes[0].content)

      expect(preview).toBe('Hello World\n\nThis is a test note with code....')
      expect(preview.endsWith('...')).toBe(true)
      expect(preview.length).toBeLessThanOrEqual(103) // 100 + '...'
    })

    it('should strip markdown formatting', () => {
      const { result } = renderHook(() => useNotesListLogic(mockNotes))

      const contentWithMarkdown = '# Header\n**Bold** *italic* `code` text'
      const preview = result.current.getPreviewText(contentWithMarkdown)

      expect(preview).not.toContain('#')
      expect(preview).not.toContain('*')
      expect(preview).not.toContain('`')
      expect(preview).toBe('Header\nBold italic code text...')
    })

    it('should handle custom max length', () => {
      const { result } = renderHook(() => useNotesListLogic(mockNotes))

      const preview = result.current.getPreviewText(mockNotes[2].content, 50)

      expect(preview).toBe(
        'This is a very long note content that exceeds the ...'
      )
      expect(preview.length).toBe(53) // 50 + '...'
    })

    it('should handle empty content', () => {
      const { result } = renderHook(() => useNotesListLogic(mockNotes))

      const preview = result.current.getPreviewText('')

      expect(preview).toBe('...')
    })

    it('should handle content shorter than max length', () => {
      const { result } = renderHook(() => useNotesListLogic(mockNotes))

      const shortContent = 'Short content'
      const preview = result.current.getPreviewText(shortContent, 100)

      expect(preview).toBe('Short content...')
    })

    it('should handle special markdown characters', () => {
      const { result } = renderHook(() => useNotesListLogic(mockNotes))

      const specialContent = '### Header\n```code block```\n***bold italic***'
      const preview = result.current.getPreviewText(specialContent)

      expect(preview).toBe('Header\ncode block\nbold italic...')
    })

    it('should preserve newlines', () => {
      const { result } = renderHook(() => useNotesListLogic(mockNotes))

      const contentWithNewlines = 'Line 1\nLine 2\nLine 3'
      const preview = result.current.getPreviewText(contentWithNewlines)

      expect(preview).toContain('\n')
    })
  })

  describe('Edge cases', () => {
    it('should handle very long content gracefully', () => {
      const { result } = renderHook(() => useNotesListLogic(mockNotes))

      const veryLongContent = 'A'.repeat(10000)
      const preview = result.current.getPreviewText(veryLongContent)

      expect(preview.length).toBe(103) // 100 + '...'
      expect(preview).toBe('A'.repeat(100) + '...')
    })

    it('should handle Unicode characters', () => {
      const { result } = renderHook(() => useNotesListLogic(mockNotes))

      const unicodeContent = '🎉 Unicode test 你好世界 émojis 🌟'
      const preview = result.current.getPreviewText(unicodeContent, 20)

      expect(preview).toBe('🎉 Unicode test 你好世界...')
    })

    it('should handle null or undefined notes array', () => {
      const { result: resultNull } = renderHook(() =>
        useNotesListLogic(null as any)
      )
      const { result: resultUndefined } = renderHook(() =>
        useNotesListLogic(undefined as any)
      )

      // Should handle gracefully without crashing
      expect(resultNull.current.isEmpty).toBe(true)
      expect(resultNull.current.notesCount).toBe(0)

      expect(resultUndefined.current.isEmpty).toBe(true)
      expect(resultUndefined.current.notesCount).toBe(0)
    })
  })

  describe('Method stability', () => {
    it('should provide stable method references', () => {
      const { result, rerender } = renderHook(() =>
        useNotesListLogic(mockNotes)
      )

      const initialFormatDate = result.current.formatDate
      const initialGetPreviewText = result.current.getPreviewText

      rerender()

      expect(result.current.formatDate).toBe(initialFormatDate)
      expect(result.current.getPreviewText).toBe(initialGetPreviewText)
    })

    it('should maintain stable references when notes change', () => {
      const { result, rerender } = renderHook(
        ({ notes }) => useNotesListLogic(notes),
        { initialProps: { notes: mockNotes } }
      )

      const initialFormatDate = result.current.formatDate
      const initialGetPreviewText = result.current.getPreviewText

      rerender({ notes: [] })

      expect(result.current.formatDate).toBe(initialFormatDate)
      expect(result.current.getPreviewText).toBe(initialGetPreviewText)
    })
  })

  describe('Performance', () => {
    it('should memoize isEmpty value', () => {
      const { result, rerender } = renderHook(
        ({ notes }) => useNotesListLogic(notes),
        { initialProps: { notes: mockNotes } }
      )

      const isEmpty1 = result.current.isEmpty

      // Rerender with same notes array
      rerender({ notes: mockNotes })

      const isEmpty2 = result.current.isEmpty

      expect(isEmpty1).toBe(isEmpty2)
      expect(isEmpty1).toBe(false)
    })

    it('should memoize notesCount value', () => {
      const { result, rerender } = renderHook(
        ({ notes }) => useNotesListLogic(notes),
        { initialProps: { notes: mockNotes } }
      )

      const count1 = result.current.notesCount

      // Rerender with same notes array
      rerender({ notes: mockNotes })

      const count2 = result.current.notesCount

      expect(count1).toBe(count2)
      expect(count1).toBe(3)
    })
  })

  describe('Integration scenarios', () => {
    it('should work with typical notes list usage', () => {
      const { result } = renderHook(() => useNotesListLogic(mockNotes))

      // Check if list is empty
      expect(result.current.isEmpty).toBe(false)

      // Get count for display
      expect(result.current.notesCount).toBe(3)

      // Format dates for each note
      mockNotes.forEach(note => {
        const formattedDate = result.current.formatDate(note.updatedAt)
        expect(typeof formattedDate).toBe('string')
      })

      // Get preview text for each note
      mockNotes.forEach(note => {
        const preview = result.current.getPreviewText(note.content)
        expect(preview).toBeTruthy()
        expect(preview.endsWith('...')).toBe(true)
      })
    })

    it('should handle dynamic notes list', () => {
      const { result, rerender } = renderHook(
        ({ notes }) => useNotesListLogic(notes),
        { initialProps: { notes: [] } }
      )

      // Start with empty list
      expect(result.current.isEmpty).toBe(true)
      expect(result.current.notesCount).toBe(0)

      // Add notes
      rerender({ notes: [mockNotes[0]] })
      expect(result.current.isEmpty).toBe(false)
      expect(result.current.notesCount).toBe(1)

      // Add more notes
      rerender({ notes: mockNotes })
      expect(result.current.notesCount).toBe(3)

      // Clear notes
      rerender({ notes: [] })
      expect(result.current.isEmpty).toBe(true)
    })
  })
})
