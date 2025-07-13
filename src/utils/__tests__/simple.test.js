import { describe, it, expect } from 'vitest'

// Simple utility functions to test
const addNumbers = (a, b) => a + b
const isValidEmail = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
const formatTitle = title => title?.trim().slice(0, 100) || 'Untitled'
const generateId = () => Math.random().toString(36).substr(2, 9)

describe('Utility Functions', () => {
  describe('addNumbers', () => {
    it('should add two positive numbers', () => {
      expect(addNumbers(2, 3)).toBe(5)
    })

    it('should add negative numbers', () => {
      expect(addNumbers(-2, -3)).toBe(-5)
    })

    it('should handle zero', () => {
      expect(addNumbers(0, 5)).toBe(5)
      expect(addNumbers(5, 0)).toBe(5)
    })

    it('should handle decimal numbers', () => {
      expect(addNumbers(1.5, 2.5)).toBe(4)
    })
  })

  describe('isValidEmail', () => {
    it('should validate correct email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true)
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true)
      expect(isValidEmail('user+tag@example.org')).toBe(true)
    })

    it('should reject invalid email addresses', () => {
      expect(isValidEmail('invalid')).toBe(false)
      expect(isValidEmail('invalid@')).toBe(false)
      expect(isValidEmail('@domain.com')).toBe(false)
      expect(isValidEmail('test@')).toBe(false)
      expect(isValidEmail('')).toBe(false)
    })

    it('should handle edge cases', () => {
      expect(isValidEmail(null)).toBe(false)
      expect(isValidEmail(undefined)).toBe(false)
      expect(isValidEmail('test @example.com')).toBe(false) // space
    })
  })

  describe('formatTitle', () => {
    it('should return the title as-is for normal lengths', () => {
      expect(formatTitle('Short title')).toBe('Short title')
    })

    it('should trim whitespace', () => {
      expect(formatTitle('  Title with spaces  ')).toBe('Title with spaces')
    })

    it('should truncate long titles', () => {
      const longTitle = 'A'.repeat(150)
      const result = formatTitle(longTitle)
      expect(result.length).toBe(100)
      expect(result).toBe('A'.repeat(100))
    })

    it('should handle empty or null titles', () => {
      expect(formatTitle('')).toBe('Untitled')
      expect(formatTitle(null)).toBe('Untitled')
      expect(formatTitle(undefined)).toBe('Untitled')
      expect(formatTitle('   ')).toBe('Untitled')
    })
  })

  describe('generateId', () => {
    it('should generate a string ID', () => {
      const id = generateId()
      expect(typeof id).toBe('string')
      expect(id.length).toBeGreaterThan(0)
    })

    it('should generate unique IDs', () => {
      const id1 = generateId()
      const id2 = generateId()
      expect(id1).not.toBe(id2)
    })

    it('should generate IDs with expected length', () => {
      const id = generateId()
      expect(id.length).toBe(9) // substr(2, 9) from random string
    })

    it('should generate IDs with valid characters', () => {
      const id = generateId()
      expect(id).toMatch(/^[a-z0-9]+$/) // Only lowercase letters and numbers
    })
  })
})

describe('Data Processing', () => {
  const processNoteData = note => {
    if (!note) return null

    return {
      id: note.id || generateId(),
      title: formatTitle(note.title),
      content: note.content || '',
      createdAt: note.createdAt || new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
      tags: Array.isArray(note.tags) ? note.tags : [],
      isPinned: Boolean(note.isPinned),
    }
  }

  describe('processNoteData', () => {
    it('should process valid note data', () => {
      const input = {
        id: 'test-123',
        title: 'Test Note',
        content: 'Some content',
        tags: ['tag1', 'tag2'],
        isPinned: true,
      }

      const result = processNoteData(input)

      expect(result.id).toBe('test-123')
      expect(result.title).toBe('Test Note')
      expect(result.content).toBe('Some content')
      expect(result.tags).toEqual(['tag1', 'tag2'])
      expect(result.isPinned).toBe(true)
      expect(result.createdAt).toBeDefined()
      expect(result.modifiedAt).toBeDefined()
    })

    it('should handle missing data with defaults', () => {
      const input = {
        title: 'Test Note',
      }

      const result = processNoteData(input)

      expect(result.id).toBeDefined()
      expect(result.title).toBe('Test Note')
      expect(result.content).toBe('')
      expect(result.tags).toEqual([])
      expect(result.isPinned).toBe(false)
    })

    it('should handle null input', () => {
      expect(processNoteData(null)).toBeNull()
      expect(processNoteData(undefined)).toBeNull()
    })

    it('should generate ID when missing', () => {
      const input = { title: 'No ID Note' }
      const result = processNoteData(input)

      expect(result.id).toBeDefined()
      expect(typeof result.id).toBe('string')
      expect(result.id.length).toBeGreaterThan(0)
    })

    it('should format title correctly', () => {
      const input = { title: '  Long Title  ' }
      const result = processNoteData(input)

      expect(result.title).toBe('Long Title')
    })

    it('should handle invalid tags', () => {
      const input = {
        title: 'Test',
        tags: 'not-an-array',
      }
      const result = processNoteData(input)

      expect(result.tags).toEqual([])
    })
  })
})

describe('Search and Filter Utils', () => {
  const sampleNotes = [
    {
      id: '1',
      title: 'JavaScript Tutorial',
      content: 'Learn JS basics',
      tags: ['js', 'tutorial'],
    },
    {
      id: '2',
      title: 'React Guide',
      content: 'React components and hooks',
      tags: ['react', 'frontend'],
    },
    {
      id: '3',
      title: 'Node.js API',
      content: 'Building REST APIs',
      tags: ['nodejs', 'backend'],
    },
    {
      id: '4',
      title: 'TypeScript Notes',
      content: 'Type safety in JavaScript',
      tags: ['typescript', 'js'],
    },
  ]

  const searchNotes = (notes, query) => {
    if (!query) return notes

    const lowercaseQuery = query.toLowerCase()

    return notes.filter(
      note =>
        note.title.toLowerCase().includes(lowercaseQuery) ||
        note.content.toLowerCase().includes(lowercaseQuery) ||
        note.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    )
  }

  const filterByTag = (notes, tag) => {
    if (!tag) return notes
    return notes.filter(note => note.tags.includes(tag))
  }

  describe('searchNotes', () => {
    it('should find notes by title', () => {
      const result = searchNotes(sampleNotes, 'React')
      expect(result).toHaveLength(1)
      expect(result[0].title).toBe('React Guide')
    })

    it('should find notes by content', () => {
      const result = searchNotes(sampleNotes, 'REST')
      expect(result).toHaveLength(1)
      expect(result[0].title).toBe('Node.js API')
    })

    it('should find notes by tags', () => {
      const result = searchNotes(sampleNotes, 'js')
      expect(result).toHaveLength(3) // Matches: JavaScript Tutorial, TypeScript Notes, and Learn JS basics
      expect(result.map(n => n.id)).toContain('1')
      expect(result.map(n => n.id)).toContain('4')
    })

    it('should be case insensitive', () => {
      const result = searchNotes(sampleNotes, 'JAVASCRIPT')
      expect(result).toHaveLength(2)
    })

    it('should return all notes for empty query', () => {
      expect(searchNotes(sampleNotes, '')).toHaveLength(4)
      expect(searchNotes(sampleNotes, null)).toHaveLength(4)
    })

    it('should return empty array for no matches', () => {
      const result = searchNotes(sampleNotes, 'nonexistent')
      expect(result).toHaveLength(0)
    })
  })

  describe('filterByTag', () => {
    it('should filter notes by specific tag', () => {
      const result = filterByTag(sampleNotes, 'js')
      expect(result).toHaveLength(2)
      expect(result.map(n => n.id)).toEqual(['1', '4'])
    })

    it('should return empty array for non-existent tag', () => {
      const result = filterByTag(sampleNotes, 'nonexistent')
      expect(result).toHaveLength(0)
    })

    it('should return all notes for empty tag', () => {
      expect(filterByTag(sampleNotes, '')).toHaveLength(4)
      expect(filterByTag(sampleNotes, null)).toHaveLength(4)
    })
  })
})
