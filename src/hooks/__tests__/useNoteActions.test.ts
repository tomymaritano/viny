import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import type { Note } from '../../types'

// Mock dependencies
vi.mock('../../stores/newSimpleStore')
vi.mock('../../lib/storage')
vi.mock('../../lib/markdown')
vi.mock('../../utils/logger')

// Mock timers for Date.now() consistency
vi.useFakeTimers()

describe('useNoteActions', () => {
  // Mock store functions
  const mockAddNote = vi.fn()
  const mockUpdateNote = vi.fn()
  const mockRemoveNote = vi.fn()
  const mockSetCurrentNote = vi.fn()
  const mockSetSelectedNoteId = vi.fn()
  const mockSetIsEditorOpen = vi.fn()
  const mockShowSuccess = vi.fn()
  const mockShowError = vi.fn()
  const mockCreateNoteFromTemplate = vi.fn()

  // Mock storage service
  const mockStorageService = {
    saveNote: vi.fn(),
    deleteNote: vi.fn(),
    getNotes: vi.fn(),
    flushPendingSaves: vi.fn().mockResolvedValue(undefined)
  }

  // Mock markdown processor
  const mockMarkdownProcessor = {
    extractTitle: vi.fn()
  }

  // Mock logger
  const mockLogger = {
    debug: vi.fn(),
    error: vi.fn(),
    info: vi.fn()
  }

  // Test data
  const mockNote: Note = {
    id: '1',
    title: 'Test Note',
    content: 'Test content',
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z',
    tags: ['test'],
    notebook: 'personal',
    status: 'draft',
    isPinned: false,
    isTrashed: false
  }

  const mockNotes = [mockNote]

  beforeEach(async () => {
    // Mock current date
    vi.setSystemTime(new Date('2023-01-01T00:00:00.000Z'))

    // Setup store mock
    const { useAppStore } = await import('../../stores/newSimpleStore')
    vi.mocked(useAppStore).mockReturnValue({
      activeSection: 'notes',
      notes: mockNotes,
      addNote: mockAddNote,
      updateNote: mockUpdateNote,
      removeNote: mockRemoveNote,
      setCurrentNote: mockSetCurrentNote,
      setSelectedNoteId: mockSetSelectedNoteId,
      setIsEditorOpen: mockSetIsEditorOpen,
      showSuccess: mockShowSuccess,
      showError: mockShowError,
      createNoteFromTemplate: mockCreateNoteFromTemplate,
      addToast: vi.fn()
    })

    // Setup storage mock
    const storageModule = await import('../../lib/storage')
    Object.defineProperty(storageModule, 'storageService', {
      value: mockStorageService,
      writable: true
    })

    // Setup markdown mock
    const markdownModule = await import('../../lib/markdown')
    Object.defineProperty(markdownModule, 'MarkdownProcessor', {
      value: mockMarkdownProcessor,
      writable: true
    })

    // Setup logger mock
    const loggerModule = await import('../../utils/logger')
    Object.defineProperty(loggerModule, 'noteLogger', {
      value: mockLogger,
      writable: true
    })

    // Mock global window for electron detection
    Object.defineProperty(global, 'window', {
      value: {},
      writable: true
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.clearAllTimers()
  })

  describe('createNewNote', () => {
    it('should create a new note with default properties', async () => {
      const { useNoteActions } = await import('../useNoteActions')
      const { result } = renderHook(() => useNoteActions())

      let createdNote: Note
      await act(async () => {
        createdNote = result.current.createNewNote()
      })

      // Check note properties
      expect(createdNote!).toMatchObject({
        title: 'Untitled Note',
        content: '',
        notebook: 'personal',
        tags: [],
        status: 'draft',
        isPinned: false,
        isTrashed: false
      })

      // Check store calls
      expect(mockAddNote).toHaveBeenCalledWith(createdNote!)
      expect(mockSetCurrentNote).toHaveBeenCalledWith(createdNote!)
      expect(mockSetSelectedNoteId).toHaveBeenCalledWith(createdNote!.id)
      expect(mockSetIsEditorOpen).toHaveBeenCalledWith(true)
      expect(mockStorageService.saveNote).toHaveBeenCalledWith(createdNote!)
    })

    it('should create a pinned note when in pinned section', async () => {
      // Update store mock for this test
      const { useAppStore } = await import('../../stores/newSimpleStore')
      vi.mocked(useAppStore).mockReturnValue({
        activeSection: 'pinned',
        notes: mockNotes,
        addNote: mockAddNote,
        updateNote: mockUpdateNote,
        removeNote: mockRemoveNote,
        setCurrentNote: mockSetCurrentNote,
        setSelectedNoteId: mockSetSelectedNoteId,
        setIsEditorOpen: mockSetIsEditorOpen,
        showSuccess: mockShowSuccess,
        showError: mockShowError,
        createNoteFromTemplate: mockCreateNoteFromTemplate,
        addToast: vi.fn()
      })

      const { useNoteActions } = await import('../useNoteActions')
      const { result } = renderHook(() => useNoteActions())

      let createdNote: Note
      await act(async () => {
        createdNote = result.current.createNewNote()
      })

      expect(createdNote!.isPinned).toBe(true)
    })

    it('should create note with status when in status section', async () => {
      // Update store mock for this test
      const { useAppStore } = await import('../../stores/newSimpleStore')
      vi.mocked(useAppStore).mockReturnValue({
        activeSection: 'status-in-progress',
        notes: mockNotes,
        addNote: mockAddNote,
        updateNote: mockUpdateNote,
        removeNote: mockRemoveNote,
        setCurrentNote: mockSetCurrentNote,
        setSelectedNoteId: mockSetSelectedNoteId,
        setIsEditorOpen: mockSetIsEditorOpen,
        showSuccess: mockShowSuccess,
        showError: mockShowError,
        createNoteFromTemplate: mockCreateNoteFromTemplate,
        addToast: vi.fn()
      })

      const { useNoteActions } = await import('../useNoteActions')
      const { result } = renderHook(() => useNoteActions())

      let createdNote: Note
      await act(async () => {
        createdNote = result.current.createNewNote()
      })

      expect(createdNote!.status).toBe('in-progress')
    })

    it('should handle storage save error', async () => {
      mockStorageService.saveNote.mockImplementationOnce(() => {
        throw new Error('Storage error')
      })

      const { useNoteActions } = await import('../useNoteActions')
      const { result } = renderHook(() => useNoteActions())

      await act(async () => {
        result.current.createNewNote()
      })

      expect(mockShowError).toHaveBeenCalledWith('Failed to save note')
    })
  })

  describe('handleSaveNote', () => {
    it('should save note with existing title', async () => {
      // Setup getNotes to return the note for verification
      mockStorageService.getNotes.mockReturnValue([mockNote])

      const { useNoteActions } = await import('../useNoteActions')
      const { result } = renderHook(() => useNoteActions())

      let savedNote: Note
      await act(async () => {
        savedNote = await result.current.handleSaveNote(mockNote)
      })

      expect(savedNote.title).toBe('Test Note')
      expect(savedNote.updatedAt).toBe('2023-01-01T00:00:00.000Z')
      expect(mockUpdateNote).toHaveBeenCalledWith(savedNote)
      expect(mockStorageService.saveNote).toHaveBeenCalledWith(savedNote)
      expect(mockStorageService.flushPendingSaves).toHaveBeenCalled()
    })

    it('should extract title from content when title is empty', async () => {
      const noteWithoutTitle = { ...mockNote, title: '' }
      mockMarkdownProcessor.extractTitle.mockReturnValue('Extracted Title')
      // Setup getNotes to return the note for verification
      mockStorageService.getNotes.mockReturnValue([noteWithoutTitle])

      const { useNoteActions } = await import('../useNoteActions')
      const { result } = renderHook(() => useNoteActions())

      let savedNote: Note
      await act(async () => {
        savedNote = await result.current.handleSaveNote(noteWithoutTitle)
      })

      expect(savedNote.title).toBe('Extracted Title')
      expect(mockMarkdownProcessor.extractTitle).toHaveBeenCalledWith('Test content')
    })

    it('should handle save verification failure', async () => {
      mockStorageService.getNotes.mockReturnValue([])

      const { useNoteActions } = await import('../useNoteActions')
      const { result } = renderHook(() => useNoteActions())

      await act(async () => {
        await expect(result.current.handleSaveNote(mockNote)).rejects.toThrow('Save verification failed - note not found')
      })

      expect(mockShowError).toHaveBeenCalledWith('Failed to save note: Save verification failed - note not found')
    })
  })

  describe('handleDeleteNote', () => {
    it('should move note to trash', async () => {
      const { useNoteActions } = await import('../useNoteActions')
      const { result } = renderHook(() => useNoteActions())

      await act(async () => {
        result.current.handleDeleteNote(mockNote)
      })

      expect(mockUpdateNote).toHaveBeenCalledWith({
        ...mockNote,
        isTrashed: true,
        trashedAt: '2023-01-01T00:00:00.000Z'
      })
      expect(mockStorageService.saveNote).toHaveBeenCalled()
      expect(mockShowSuccess).toHaveBeenCalledWith('Note moved to trash')
    })

    it('should handle delete error', async () => {
      mockStorageService.saveNote.mockImplementationOnce(() => {
        throw new Error('Delete error')
      })

      const { useNoteActions } = await import('../useNoteActions')
      const { result } = renderHook(() => useNoteActions())

      await act(async () => {
        result.current.handleDeleteNote(mockNote)
      })

      expect(mockShowError).toHaveBeenCalledWith('Failed to delete note')
    })
  })

  describe('handleTogglePin', () => {
    it('should pin unpinned note', async () => {
      const { useNoteActions } = await import('../useNoteActions')
      const { result } = renderHook(() => useNoteActions())

      await act(async () => {
        result.current.handleTogglePin(mockNote)
      })

      expect(mockUpdateNote).toHaveBeenCalledWith({
        ...mockNote,
        isPinned: true,
        updatedAt: '2023-01-01T00:00:00.000Z'
      })
      expect(mockShowSuccess).toHaveBeenCalledWith('Note pinned')
    })

    it('should unpin pinned note', async () => {
      const pinnedNote = { ...mockNote, isPinned: true }

      const { useNoteActions } = await import('../useNoteActions')
      const { result } = renderHook(() => useNoteActions())

      await act(async () => {
        result.current.handleTogglePin(pinnedNote)
      })

      expect(mockUpdateNote).toHaveBeenCalledWith({
        ...pinnedNote,
        isPinned: false,
        updatedAt: '2023-01-01T00:00:00.000Z'
      })
      expect(mockShowSuccess).toHaveBeenCalledWith('Note unpinned')
    })
  })

  describe('handleDuplicateNote', () => {
    it('should duplicate note successfully', async () => {
      const { useNoteActions } = await import('../useNoteActions')
      const { result } = renderHook(() => useNoteActions())

      let duplicatedNote: Note
      await act(async () => {
        duplicatedNote = await result.current.handleDuplicateNote(mockNote)
      })

      expect(duplicatedNote.title).toBe('Test Note (Copy)')
      expect(duplicatedNote.content).toBe('Test content')
      expect(duplicatedNote.isPinned).toBe(false)
      expect(duplicatedNote.id).not.toBe(mockNote.id)
      expect(mockAddNote).toHaveBeenCalledWith(duplicatedNote)
      expect(mockStorageService.saveNote).toHaveBeenCalledWith(duplicatedNote)
      expect(mockShowSuccess).toHaveBeenCalledWith('Note duplicated successfully')
    })
  })

  describe('handleRestoreNote', () => {
    it('should restore note from trash', async () => {
      const trashedNote = { ...mockNote, isTrashed: true, trashedAt: '2023-01-01T00:00:00.000Z' }

      const { useNoteActions } = await import('../useNoteActions')
      const { result } = renderHook(() => useNoteActions())

      await act(async () => {
        result.current.handleRestoreNote(trashedNote)
      })

      expect(mockUpdateNote).toHaveBeenCalledWith({
        ...trashedNote,
        isTrashed: false,
        trashedAt: undefined,
        updatedAt: '2023-01-01T00:00:00.000Z'
      })
      expect(mockStorageService.saveNote).toHaveBeenCalled()
      expect(mockShowSuccess).toHaveBeenCalledWith('Note restored')
    })
  })

  describe('handlePermanentDelete', () => {
    it('should permanently delete note', async () => {
      const { useNoteActions } = await import('../useNoteActions')
      const { result } = renderHook(() => useNoteActions())

      await act(async () => {
        result.current.handlePermanentDelete(mockNote)
      })

      expect(mockRemoveNote).toHaveBeenCalledWith(mockNote.id)
      expect(mockStorageService.deleteNote).toHaveBeenCalledWith(mockNote.id)
      expect(mockShowSuccess).toHaveBeenCalledWith('Note permanently deleted')
    })
  })
})