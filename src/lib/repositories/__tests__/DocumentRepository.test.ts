/**
 * Comprehensive tests for DocumentRepository
 * Tests enhanced error handling, retry logic, and repository operations
 */

import { vi, describe, it, expect, beforeEach } from 'vitest'
import { DocumentRepository } from '../DocumentRepository'
import type { Note, Notebook } from '../../../types'
import type { RetryConfig } from '../types/RepositoryTypes'
import { RepositoryErrorCode } from '../types/RepositoryTypes'
import {
  StorageNotAvailableError,
  ConflictError,
  NotFoundError,
  RepositoryErrorFactory,
} from '../errors/RepositoryErrorHandler'

// Mock PouchDB
vi.mock('pouchdb', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      allDocs: vi.fn(),
      get: vi.fn(),
      put: vi.fn(),
      remove: vi.fn(),
      bulkDocs: vi.fn(),
      createIndex: vi.fn(),
      destroy: vi.fn(),
    })),
  }
})

// Mock window.electronAPI
const mockElectronAPI = {
  isElectron: true,
  storage: {
    loadAllNotes: vi.fn(),
    loadNote: vi.fn(),
    saveNote: vi.fn(),
    deleteNote: vi.fn(),
    loadNotebooks: vi.fn(),
    saveNotebooks: vi.fn(),
  },
}

describe('DocumentRepository', () => {
  let repository: DocumentRepository
  let mockDB: any

  const sampleNote: Note = {
    id: 'note-1',
    title: 'Test Note',
    content: 'Test content',
    type: 'note',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
    notebook: 'default',
  }

  const sampleNotebook: Notebook = {
    id: 'notebook-1',
    name: 'Test Notebook',
    type: 'notebook',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  }

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks()

    // Configure fast retry for tests
    const retryConfig: RetryConfig = {
      maxAttempts: 2,
      baseDelayMs: 1,
      maxDelayMs: 10,
      exponentialBackoff: false,
      jitter: false,
    }

    repository = new DocumentRepository(retryConfig)

    // Mock database instance
    mockDB = {
      allDocs: jest.fn(),
      get: jest.fn(),
      put: jest.fn(),
      remove: jest.fn(),
      bulkDocs: jest.fn(),
      createIndex: jest.fn(),
      destroy: jest.fn(),
    }

    // Set up repository internals
    ;(repository as any).db = mockDB
    ;(repository as any).isInitialized = true
  })

  describe('Initialization', () => {
    beforeEach(() => {
      ;(repository as any).isInitialized = false
    })

    it('should initialize for Electron environment', async () => {
      // Mock Electron environment
      Object.defineProperty(window, 'electronAPI', {
        value: mockElectronAPI,
        configurable: true,
      })

      await repository.initialize()
      expect((repository as any).isInitialized).toBe(true)
    })

    it('should initialize for browser environment with IndexedDB', async () => {
      // Mock browser environment
      Object.defineProperty(window, 'electronAPI', {
        value: undefined,
        configurable: true,
      })

      // Mock IndexedDB availability
      Object.defineProperty(global, 'indexedDB', {
        value: {},
        configurable: true,
      })

      await repository.initialize()
      expect((repository as any).isInitialized).toBe(true)
    })

    it('should throw error when IndexedDB is not available in browser', async () => {
      // Mock browser without IndexedDB
      Object.defineProperty(window, 'electronAPI', {
        value: undefined,
        configurable: true,
      })
      Object.defineProperty(global, 'indexedDB', {
        value: undefined,
        configurable: true,
      })

      await expect(repository.initialize()).rejects.toThrow(
        'IndexedDB not available'
      )
    })
  })

  describe('Notes Operations', () => {
    beforeEach(() => {
      // Mock Electron environment for consistent testing
      Object.defineProperty(window, 'electronAPI', {
        value: mockElectronAPI,
        configurable: true,
      })
    })

    describe('getNotes', () => {
      it('should get notes via Electron API', async () => {
        mockElectronAPI.storage.loadAllNotes.mockResolvedValue([sampleNote])

        const notes = await repository.getNotes()

        expect(notes).toEqual([sampleNote])
        expect(mockElectronAPI.storage.loadAllNotes).toHaveBeenCalled()
      })

      it('should get notes via PouchDB in browser', async () => {
        // Mock browser environment
        Object.defineProperty(window, 'electronAPI', {
          value: undefined,
          configurable: true,
        })

        mockDB.allDocs.mockResolvedValue({
          rows: [
            {
              doc: {
                _id: 'note-1',
                ...sampleNote,
                type: 'note',
              },
            },
          ],
        })

        const notes = await repository.getNotes()

        expect(notes).toHaveLength(1)
        expect(notes[0].id).toBe('note-1')
        expect(mockDB.allDocs).toHaveBeenCalledWith({
          include_docs: true,
          startkey: 'note_',
          endkey: 'note_\ufff0',
        })
      })

      it('should handle storage not available error', async () => {
        mockElectronAPI.storage.loadAllNotes.mockRejectedValue(
          new Error('Storage unavailable')
        )

        await expect(repository.getNotes()).rejects.toThrow()
      })

      it('should retry on transient failures', async () => {
        mockElectronAPI.storage.loadAllNotes
          .mockRejectedValueOnce(new Error('Network error'))
          .mockResolvedValue([sampleNote])

        const notes = await repository.getNotes()

        expect(notes).toEqual([sampleNote])
        expect(mockElectronAPI.storage.loadAllNotes).toHaveBeenCalledTimes(2)
      })
    })

    describe('getNote', () => {
      it('should get single note via Electron API', async () => {
        mockElectronAPI.storage.loadNote.mockResolvedValue(sampleNote)

        const note = await repository.getNote('note-1')

        expect(note).toEqual(sampleNote)
        expect(mockElectronAPI.storage.loadNote).toHaveBeenCalledWith('note-1')
      })

      it('should return null for non-existent note', async () => {
        mockElectronAPI.storage.loadNote.mockRejectedValue({ code: 'ENOENT' })

        const note = await repository.getNote('nonexistent')

        expect(note).toBeNull()
      })

      it('should get note via PouchDB in browser', async () => {
        // Mock browser environment
        Object.defineProperty(window, 'electronAPI', {
          value: undefined,
          configurable: true,
        })

        mockDB.get.mockResolvedValue({
          _id: 'note-1',
          ...sampleNote,
          type: 'note',
        })

        const note = await repository.getNote('note-1')

        expect(note?.id).toBe('note-1')
        expect(mockDB.get).toHaveBeenCalledWith('note-1')
      })
    })

    describe('saveNote', () => {
      it('should save note via Electron API', async () => {
        mockElectronAPI.storage.saveNote.mockResolvedValue({ success: true })

        const savedNote = await repository.saveNote(sampleNote)

        expect(savedNote.id).toBe(sampleNote.id)
        expect(savedNote.updatedAt).toBeDefined()
        expect(mockElectronAPI.storage.saveNote).toHaveBeenCalledWith(
          sampleNote
        )
      })

      it('should handle Electron API save failure', async () => {
        mockElectronAPI.storage.saveNote.mockResolvedValue({ success: false })

        await expect(repository.saveNote(sampleNote)).rejects.toThrow()
      })

      it('should save note via PouchDB with conflict resolution', async () => {
        // Mock browser environment
        Object.defineProperty(window, 'electronAPI', {
          value: undefined,
          configurable: true,
        })

        // First attempt fails with conflict
        mockDB.put
          .mockRejectedValueOnce({ status: 409 })
          .mockResolvedValue({ rev: 'new-rev' })

        // Mock getting latest version for conflict resolution
        mockDB.get.mockResolvedValue({ _rev: 'latest-rev' })

        const savedNote = await repository.saveNote(sampleNote)

        expect(savedNote._rev).toBe('new-rev')
        expect(mockDB.put).toHaveBeenCalledTimes(2)
        expect(mockDB.get).toHaveBeenCalledWith(sampleNote.id)
      })

      it('should handle quota exceeded error', async () => {
        // Mock browser environment
        Object.defineProperty(window, 'electronAPI', {
          value: undefined,
          configurable: true,
        })

        const quotaError = new Error('QuotaExceededError')
        quotaError.name = 'QuotaExceededError'
        mockDB.put.mockRejectedValue(quotaError)

        await expect(repository.saveNote(sampleNote)).rejects.toThrow()
      })

      it('should handle unresolvable conflicts', async () => {
        // Mock browser environment
        Object.defineProperty(window, 'electronAPI', {
          value: undefined,
          configurable: true,
        })

        // Both initial save and conflict resolution fail
        mockDB.put.mockRejectedValue({ status: 409 })
        mockDB.get.mockRejectedValue(new Error('Cannot get latest'))

        await expect(repository.saveNote(sampleNote)).rejects.toThrow()
      })
    })

    describe('deleteNote', () => {
      it('should delete note via Electron API', async () => {
        mockElectronAPI.storage.deleteNote.mockResolvedValue({ success: true })

        await repository.deleteNote('note-1')

        expect(mockElectronAPI.storage.deleteNote).toHaveBeenCalledWith(
          'note-1'
        )
      })

      it('should handle deletion of non-existent note gracefully', async () => {
        mockElectronAPI.storage.deleteNote.mockResolvedValue({ success: false })

        // Should not throw
        await repository.deleteNote('nonexistent')
      })

      it('should delete note via PouchDB', async () => {
        // Mock browser environment
        Object.defineProperty(window, 'electronAPI', {
          value: undefined,
          configurable: true,
        })

        const docToDelete = { _id: 'note-1', _rev: 'rev-1' }
        mockDB.get.mockResolvedValue(docToDelete)
        mockDB.remove.mockResolvedValue({ ok: true })

        await repository.deleteNote('note-1')

        expect(mockDB.get).toHaveBeenCalledWith('note-1')
        expect(mockDB.remove).toHaveBeenCalledWith(docToDelete)
      })

      it('should handle 404 errors gracefully in PouchDB', async () => {
        // Mock browser environment
        Object.defineProperty(window, 'electronAPI', {
          value: undefined,
          configurable: true,
        })

        mockDB.get.mockRejectedValue({ status: 404 })

        // Should not throw
        await repository.deleteNote('nonexistent')
      })
    })

    describe('saveNotes (batch)', () => {
      it('should save multiple notes via Electron API', async () => {
        const notes = [sampleNote, { ...sampleNote, id: 'note-2' }]
        mockElectronAPI.storage.saveNote.mockResolvedValue({ success: true })

        const savedNotes = await repository.saveNotes(notes)

        expect(savedNotes).toHaveLength(2)
        expect(mockElectronAPI.storage.saveNote).toHaveBeenCalledTimes(2)
      })

      it('should handle partial failures in batch save', async () => {
        const notes = [sampleNote, { ...sampleNote, id: 'note-2' }]
        mockElectronAPI.storage.saveNote
          .mockResolvedValueOnce({ success: true })
          .mockRejectedValueOnce(new Error('Save failed'))

        const savedNotes = await repository.saveNotes(notes)

        expect(savedNotes).toHaveLength(1) // Only successful saves
      })

      it('should use bulk operations in PouchDB', async () => {
        // Mock browser environment
        Object.defineProperty(window, 'electronAPI', {
          value: undefined,
          configurable: true,
        })

        const notes = [sampleNote, { ...sampleNote, id: 'note-2' }]
        mockDB.bulkDocs.mockResolvedValue([
          { ok: true, rev: 'rev-1' },
          { ok: true, rev: 'rev-2' },
        ])

        const savedNotes = await repository.saveNotes(notes)

        expect(savedNotes).toHaveLength(2)
        expect(mockDB.bulkDocs).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({ _id: 'note-1' }),
            expect.objectContaining({ _id: 'note-2' }),
          ])
        )
      })
    })

    describe('searchNotes', () => {
      it('should search notes by query', async () => {
        const notes = [
          sampleNote,
          {
            ...sampleNote,
            id: 'note-2',
            title: 'Another Note',
            content: 'Different content',
          },
        ]
        mockElectronAPI.storage.loadAllNotes.mockResolvedValue(notes)

        const results = await repository.searchNotes('Test')

        expect(results).toHaveLength(1)
        expect(results[0].title).toBe('Test Note')
      })

      it('should search in title, content, and tags', async () => {
        const notes = [
          { ...sampleNote, tags: ['important'] },
          {
            ...sampleNote,
            id: 'note-2',
            title: 'Other',
            content: 'No match',
            tags: ['work'],
          },
        ]
        mockElectronAPI.storage.loadAllNotes.mockResolvedValue(notes)

        const results = await repository.searchNotes('important')

        expect(results).toHaveLength(1)
        expect(results[0].tags).toContain('important')
      })

      it('should handle multiple search terms', async () => {
        const notes = [
          { ...sampleNote, title: 'Test Important Note' },
          { ...sampleNote, id: 'note-2', title: 'Test Note' },
          { ...sampleNote, id: 'note-3', title: 'Important Document' },
        ]
        mockElectronAPI.storage.loadAllNotes.mockResolvedValue(notes)

        const results = await repository.searchNotes('Test Important')

        expect(results).toHaveLength(1)
        expect(results[0].title).toBe('Test Important Note')
      })
    })
  })

  describe('Notebooks Operations', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'electronAPI', {
        value: mockElectronAPI,
        configurable: true,
      })
    })

    describe('getNotebooks', () => {
      it('should get notebooks via Electron API', async () => {
        mockElectronAPI.storage.loadNotebooks.mockResolvedValue([
          sampleNotebook,
        ])

        const notebooks = await repository.getNotebooks()

        expect(notebooks).toEqual([sampleNotebook])
        expect(mockElectronAPI.storage.loadNotebooks).toHaveBeenCalled()
      })

      it('should get notebooks via PouchDB in browser', async () => {
        // Mock browser environment
        Object.defineProperty(window, 'electronAPI', {
          value: undefined,
          configurable: true,
        })

        mockDB.allDocs.mockResolvedValue({
          rows: [
            {
              doc: {
                _id: 'notebook-1',
                ...sampleNotebook,
                type: 'notebook',
              },
            },
          ],
        })

        const notebooks = await repository.getNotebooks()

        expect(notebooks).toHaveLength(1)
        expect(notebooks[0].id).toBe('notebook-1')
      })
    })

    describe('saveNotebook', () => {
      it('should save notebook via Electron API', async () => {
        mockElectronAPI.storage.loadNotebooks.mockResolvedValue([])
        mockElectronAPI.storage.saveNotebooks.mockResolvedValue({
          success: true,
        })

        const savedNotebook = await repository.saveNotebook(sampleNotebook)

        expect(savedNotebook.id).toBe(sampleNotebook.id)
        expect(mockElectronAPI.storage.saveNotebooks).toHaveBeenCalled()
      })

      it('should handle save failure via Electron API', async () => {
        mockElectronAPI.storage.loadNotebooks.mockResolvedValue([])
        mockElectronAPI.storage.saveNotebooks.mockResolvedValue({
          success: false,
        })

        await expect(repository.saveNotebook(sampleNotebook)).rejects.toThrow()
      })
    })

    describe('deleteNotebook', () => {
      it('should delete notebook via Electron API', async () => {
        mockElectronAPI.storage.loadNotebooks.mockResolvedValue([
          sampleNotebook,
        ])
        mockElectronAPI.storage.saveNotebooks.mockResolvedValue({
          success: true,
        })

        await repository.deleteNotebook('notebook-1')

        expect(mockElectronAPI.storage.saveNotebooks).toHaveBeenCalledWith([])
      })

      it('should handle deletion of non-existent notebook', async () => {
        mockElectronAPI.storage.loadNotebooks.mockResolvedValue([])
        mockElectronAPI.storage.saveNotebooks.mockResolvedValue({
          success: false,
        })

        // Should not throw
        await repository.deleteNotebook('nonexistent')
      })
    })
  })

  describe('Utility Operations', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'electronAPI', {
        value: mockElectronAPI,
        configurable: true,
      })
    })

    describe('exportAll', () => {
      it('should export all documents as JSON', async () => {
        mockElectronAPI.storage.loadAllNotes.mockResolvedValue([sampleNote])
        mockElectronAPI.storage.loadNotebooks.mockResolvedValue([
          sampleNotebook,
        ])

        const exportData = await repository.exportAll()
        const parsed = JSON.parse(exportData)

        expect(parsed.version).toBe('1.0')
        expect(parsed.notes).toEqual([sampleNote])
        expect(parsed.notebooks).toEqual([sampleNotebook])
        expect(parsed.exportDate).toBeDefined()
      })
    })

    describe('importAll', () => {
      it('should import documents from JSON', async () => {
        const importData = {
          version: '1.0',
          notes: [sampleNote],
          notebooks: [sampleNotebook],
        }

        mockElectronAPI.storage.saveNote.mockResolvedValue({ success: true })
        mockElectronAPI.storage.loadNotebooks.mockResolvedValue([])
        mockElectronAPI.storage.saveNotebooks.mockResolvedValue({
          success: true,
        })

        await repository.importAll(JSON.stringify(importData))

        expect(mockElectronAPI.storage.saveNote).toHaveBeenCalledWith(
          sampleNote
        )
        expect(mockElectronAPI.storage.saveNotebooks).toHaveBeenCalled()
      })

      it('should handle malformed import data', async () => {
        await expect(repository.importAll('invalid json')).rejects.toThrow()
      })
    })

    describe('destroy', () => {
      it('should destroy PouchDB instance in browser', async () => {
        // Mock browser environment
        Object.defineProperty(window, 'electronAPI', {
          value: undefined,
          configurable: true,
        })

        mockDB.destroy.mockResolvedValue({ ok: true })

        await repository.destroy()

        expect(mockDB.destroy).toHaveBeenCalled()
        expect((repository as any).isInitialized).toBe(false)
      })

      it('should handle destroy in Electron environment', async () => {
        // Should not call destroy for Electron
        await repository.destroy()

        expect(mockDB.destroy).not.toHaveBeenCalled()
        expect((repository as any).isInitialized).toBe(false)
      })
    })
  })

  describe('Error Handling Integration', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'electronAPI', {
        value: mockElectronAPI,
        configurable: true,
      })
    })

    it('should integrate error handler with repository operations', async () => {
      // Simulate transient failure followed by success
      mockElectronAPI.storage.loadAllNotes
        .mockRejectedValueOnce(new Error('Network timeout'))
        .mockResolvedValue([sampleNote])

      const notes = await repository.getNotes()

      expect(notes).toEqual([sampleNote])
      expect(mockElectronAPI.storage.loadAllNotes).toHaveBeenCalledTimes(2)
    })

    it('should handle permanent errors without retry', async () => {
      // Create a non-retryable error scenario
      const validationError = new Error('Validation failed')
      mockElectronAPI.storage.saveNote.mockRejectedValue(validationError)

      await expect(repository.saveNote(sampleNote)).rejects.toThrow()

      // Should only be called once (no retry for validation errors)
      expect(mockElectronAPI.storage.saveNote).toHaveBeenCalledTimes(1)
    })
  })
})
