import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NoteServiceV2 } from '../NoteServiceV2'
import { DexieCrudRepository } from '../../../repositories/dexie/DexieCrudRepository'
import type { Note } from '../../../types'
import { nanoid } from 'nanoid'

// Mock dependencies
vi.mock('../../../repositories/dexie/DexieCrudRepository')
vi.mock('nanoid', () => ({
  nanoid: vi.fn(() => 'test-id'),
}))
vi.mock('../../../utils/logger', () => ({
  notebookLogger: {
    debug: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  },
}))

describe('NoteServiceV2', () => {
  let service: NoteServiceV2
  let mockRepository: any

  const mockNote: Note = {
    id: 'note-1',
    title: 'Test Note',
    content: 'Test content',
    notebookId: 'notebook-1',
    tags: ['test'],
    status: 'draft',
    isPinned: false,
    isTrashed: false,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  }

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks()
    
    // Create mock repository
    mockRepository = {
      findAll: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findByField: vi.fn(),
      count: vi.fn(),
      search: vi.fn(),
    }
    
    // Mock constructor
    vi.mocked(DexieCrudRepository).mockImplementation(() => mockRepository)
    
    // Create service instance
    service = new NoteServiceV2()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('getAllNotes', () => {
    it('returns all non-trashed notes', async () => {
      const notes = [mockNote, { ...mockNote, id: 'note-2', isTrashed: true }]
      mockRepository.findAll.mockResolvedValue(notes)

      const result = await service.getAllNotes()

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('note-1')
      expect(mockRepository.findAll).toHaveBeenCalled()
    })

    it('returns empty array when no notes exist', async () => {
      mockRepository.findAll.mockResolvedValue([])

      const result = await service.getAllNotes()

      expect(result).toEqual([])
    })
  })

  describe('getActiveNotes', () => {
    it('returns only active notes', async () => {
      const notes = [
        mockNote,
        { ...mockNote, id: 'note-2', isTrashed: true },
        { ...mockNote, id: 'note-3', status: 'archived' },
      ]
      mockRepository.findAll.mockResolvedValue(notes)

      const result = await service.getActiveNotes()

      expect(result).toHaveLength(2) // Active and archived, but not trashed
      expect(result.every(n => !n.isTrashed)).toBe(true)
    })
  })

  describe('getTrashedNotes', () => {
    it('returns only trashed notes', async () => {
      const notes = [
        mockNote,
        { ...mockNote, id: 'note-2', isTrashed: true },
      ]
      mockRepository.findAll.mockResolvedValue(notes)

      const result = await service.getTrashedNotes()

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('note-2')
      expect(result[0].isTrashed).toBe(true)
    })
  })

  describe('getNoteById', () => {
    it('returns note when found', async () => {
      mockRepository.findById.mockResolvedValue(mockNote)

      const result = await service.getNoteById('note-1')

      expect(result).toEqual(mockNote)
      expect(mockRepository.findById).toHaveBeenCalledWith('note-1')
    })

    it('returns null when not found', async () => {
      mockRepository.findById.mockResolvedValue(null)

      const result = await service.getNoteById('non-existent')

      expect(result).toBeNull()
    })
  })

  describe('createNote', () => {
    it('creates note with provided data', async () => {
      const createData = {
        title: 'New Note',
        content: 'New content',
        notebookId: 'notebook-1',
        tags: ['new'],
      }
      
      mockRepository.create.mockResolvedValue({ ...mockNote, ...createData })

      const result = await service.createNote(createData)

      expect(result.title).toBe('New Note')
      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'test-id',
          title: 'New Note',
          content: 'New content',
          notebookId: 'notebook-1',
          tags: ['new'],
          status: 'draft',
          isPinned: false,
          isTrashed: false,
        })
      )
    })

    it('uses defaults for optional fields', async () => {
      const createData = {
        title: 'Minimal Note',
        content: '',
      }
      
      mockRepository.create.mockResolvedValue({ 
        ...mockNote, 
        ...createData,
        notebookId: 'default',
        tags: [],
      })

      await service.createNote(createData)

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Minimal Note',
          content: '',
          notebookId: 'default',
          tags: [],
          status: 'draft',
        })
      )
    })
  })

  describe('updateNote', () => {
    it('updates note with new data', async () => {
      const updates = {
        title: 'Updated Title',
        content: 'Updated content',
      }
      
      mockRepository.update.mockResolvedValue({ ...mockNote, ...updates })

      const result = await service.updateNote('note-1', updates)

      expect(result.title).toBe('Updated Title')
      expect(mockRepository.update).toHaveBeenCalledWith('note-1', updates)
    })

    it('throws error when note not found', async () => {
      mockRepository.update.mockRejectedValue(new Error('Not found'))

      await expect(service.updateNote('non-existent', {}))
        .rejects.toThrow('Not found')
    })
  })

  describe('deleteNote', () => {
    it('permanently deletes note', async () => {
      mockRepository.delete.mockResolvedValue(undefined)

      await service.deleteNote('note-1')

      expect(mockRepository.delete).toHaveBeenCalledWith('note-1')
    })
  })

  describe('moveToTrash', () => {
    it('marks note as trashed', async () => {
      mockRepository.update.mockResolvedValue({ ...mockNote, isTrashed: true })

      const result = await service.moveToTrash('note-1')

      expect(result.isTrashed).toBe(true)
      expect(mockRepository.update).toHaveBeenCalledWith('note-1', { isTrashed: true })
    })
  })

  describe('restoreFromTrash', () => {
    it('restores note from trash', async () => {
      const trashedNote = { ...mockNote, isTrashed: true }
      mockRepository.update.mockResolvedValue({ ...trashedNote, isTrashed: false })

      const result = await service.restoreFromTrash('note-1')

      expect(result.isTrashed).toBe(false)
      expect(mockRepository.update).toHaveBeenCalledWith('note-1', { isTrashed: false })
    })
  })

  describe('togglePin', () => {
    it('toggles pin status from false to true', async () => {
      mockRepository.findById.mockResolvedValue(mockNote)
      mockRepository.update.mockResolvedValue({ ...mockNote, isPinned: true })

      const result = await service.togglePin('note-1')

      expect(result.isPinned).toBe(true)
      expect(mockRepository.update).toHaveBeenCalledWith('note-1', { isPinned: true })
    })

    it('toggles pin status from true to false', async () => {
      const pinnedNote = { ...mockNote, isPinned: true }
      mockRepository.findById.mockResolvedValue(pinnedNote)
      mockRepository.update.mockResolvedValue({ ...pinnedNote, isPinned: false })

      const result = await service.togglePin('note-1')

      expect(result.isPinned).toBe(false)
      expect(mockRepository.update).toHaveBeenCalledWith('note-1', { isPinned: false })
    })

    it('throws error when note not found', async () => {
      mockRepository.findById.mockResolvedValue(null)

      await expect(service.togglePin('non-existent'))
        .rejects.toThrow('Note not found')
    })
  })

  describe('duplicateNote', () => {
    it('creates a copy of the note', async () => {
      mockRepository.findById.mockResolvedValue(mockNote)
      mockRepository.create.mockResolvedValue({
        ...mockNote,
        id: 'test-id',
        title: 'Test Note (Copy)',
      })

      const result = await service.duplicateNote('note-1')

      expect(result.title).toBe('Test Note (Copy)')
      expect(result.id).not.toBe('note-1')
      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test Note (Copy)',
          content: 'Test content',
          notebookId: 'notebook-1',
          tags: ['test'],
        })
      )
    })

    it('throws error when note not found', async () => {
      mockRepository.findById.mockResolvedValue(null)

      await expect(service.duplicateNote('non-existent'))
        .rejects.toThrow('Note not found')
    })
  })

  describe('searchNotes', () => {
    it('searches notes by query', async () => {
      const searchResults = [mockNote]
      mockRepository.search.mockResolvedValue(searchResults)

      const result = await service.searchNotes({ query: 'test' })

      expect(result).toEqual(searchResults)
      expect(mockRepository.search).toHaveBeenCalledWith({ query: 'test' })
    })

    it('filters by notebook', async () => {
      const notebookNotes = [mockNote]
      mockRepository.findByField.mockResolvedValue(notebookNotes)

      const result = await service.searchNotes({ notebook: 'notebook-1' })

      expect(result).toEqual(notebookNotes)
      expect(mockRepository.findByField).toHaveBeenCalledWith('notebookId', 'notebook-1')
    })

    it('filters by tags', async () => {
      const allNotes = [
        mockNote,
        { ...mockNote, id: 'note-2', tags: ['other'] },
      ]
      mockRepository.findAll.mockResolvedValue(allNotes)

      const result = await service.searchNotes({ tags: ['test'] })

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('note-1')
    })

    it('combines query and filters', async () => {
      const searchResults = [mockNote, { ...mockNote, id: 'note-2' }]
      mockRepository.search.mockResolvedValue(searchResults)

      const result = await service.searchNotes({ 
        query: 'test',
        notebook: 'notebook-1',
        tags: ['test'],
      })

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('note-1')
    })
  })

  describe('getNotesByNotebook', () => {
    it('returns notes for specific notebook', async () => {
      const notebookNotes = [mockNote]
      mockRepository.findByField.mockResolvedValue(notebookNotes)

      const result = await service.getNotesByNotebook('notebook-1')

      expect(result).toEqual(notebookNotes)
      expect(mockRepository.findByField).toHaveBeenCalledWith('notebookId', 'notebook-1')
    })
  })

  describe('getNotesByTag', () => {
    it('returns notes with specific tag', async () => {
      const allNotes = [
        mockNote,
        { ...mockNote, id: 'note-2', tags: ['other'] },
      ]
      mockRepository.findAll.mockResolvedValue(allNotes)

      const result = await service.getNotesByTag('test')

      expect(result).toHaveLength(1)
      expect(result[0].tags).toContain('test')
    })
  })

  describe('getPinnedNotes', () => {
    it('returns only pinned non-trashed notes', async () => {
      const allNotes = [
        { ...mockNote, isPinned: true },
        { ...mockNote, id: 'note-2', isPinned: false },
        { ...mockNote, id: 'note-3', isPinned: true, isTrashed: true },
      ]
      mockRepository.findAll.mockResolvedValue(allNotes)

      const result = await service.getPinnedNotes()

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('note-1')
      expect(result[0].isPinned).toBe(true)
      expect(result[0].isTrashed).toBe(false)
    })
  })
})