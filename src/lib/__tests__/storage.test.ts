import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { storageService } from '../storage'
import type { Note, Notebook, Settings } from '../../types'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

// Mock electron environment
vi.mock('../electronStorage', () => ({
  electronStorageService: {
    isElectronEnvironment: false,
  }
}))

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

describe('StorageService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.clear.mockClear()
    localStorageMock.getItem.mockClear()
    localStorageMock.setItem.mockClear()
    localStorageMock.removeItem.mockClear()
  })

  describe('Notes Storage', () => {
    it('should return empty array when no notes in localStorage', () => {
      localStorageMock.getItem.mockReturnValue(null)
      
      const notes = storageService.getNotes()
      
      expect(notes).toEqual([])
      expect(localStorageMock.getItem).toHaveBeenCalledWith('viny_notes')
    })

    it('should return parsed notes from localStorage', () => {
      const mockNotes: Note[] = [
        {
          id: '1',
          title: 'Test Note',
          content: '# Test Content',
          createdAt: new Date('2025-01-01').toISOString(),
          updatedAt: new Date('2025-01-01').toISOString(),
          tags: ['test'],
          notebook: 'default',
          status: 'none'
        }
      ]
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockNotes))
      
      const notes = storageService.getNotes()
      
      expect(notes).toEqual(mockNotes)
      expect(localStorageMock.getItem).toHaveBeenCalledWith('viny_notes')
    })

    it('should handle invalid JSON in localStorage', () => {
      localStorageMock.getItem.mockReturnValue('invalid json')
      
      const notes = storageService.getNotes()
      
      expect(notes).toEqual([])
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('viny_notes')
    })

    it('should handle non-array data in localStorage', () => {
      localStorageMock.getItem.mockReturnValue('{"not": "array"}')
      
      const notes = storageService.getNotes()
      
      expect(notes).toEqual([])
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('viny_notes')
    })

    it('should save notes array to localStorage', () => {
      const mockNotes: Note[] = [{
        id: '1',
        title: 'New Note',
        content: '# New Content',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: [],
        notebook: 'default',
        status: 'none'
      }]

      storageService.saveNotes(mockNotes)

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'viny_notes',
        expect.stringContaining('"id":"1"')
      )
    })

    it('should save updated notes array to localStorage', () => {
      const updatedNotes: Note[] = [
        {
          id: '1',
          title: 'Updated Title',
          content: 'Updated content',
          createdAt: new Date('2025-01-01').toISOString(),
          updatedAt: new Date().toISOString(),
          tags: [],
          notebook: 'default',
          status: 'none'
        }
      ]
      
      storageService.saveNotes(updatedNotes)

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'viny_notes',
        expect.stringContaining('"title":"Updated Title"')
      )
    })

    it('should validate notes array before saving', () => {
      const invalidNotes = [
        { id: '1', title: 'Valid Note', content: 'Content', createdAt: '2025-01-01', updatedAt: '2025-01-01', tags: [], notebook: 'default', status: 'none' },
        { id: '', title: 'Invalid Note' } // Missing required fields
      ] as Note[]

      // Should throw an error for invalid note structure
      expect(() => storageService.saveNotes(invalidNotes)).toThrow()
    })
  })

  describe('Notebooks Storage', () => {
    it('should return empty array when no notebooks in localStorage', () => {
      localStorageMock.getItem.mockReturnValue(null)
      
      const notebooks = storageService.getNotebooks()
      
      expect(notebooks).toEqual([])
      expect(localStorageMock.getItem).toHaveBeenCalledWith('viny_notebooks')
    })

    it('should save notebooks to localStorage', () => {
      const mockNotebooks: Notebook[] = [
        {
          id: '1',
          name: 'Work',
          color: '#ff0000',
          createdAt: new Date().toISOString(),
          isDefault: false
        }
      ]

      storageService.saveNotebooks(mockNotebooks)

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'viny_notebooks',
        JSON.stringify(mockNotebooks)
      )
    })
  })

  describe('Settings Storage', () => {
    it('should return default settings when no settings in localStorage', () => {
      localStorageMock.getItem.mockReturnValue(null)
      
      const settings = storageService.getSettings()
      
      expect(settings).toBeDefined()
      expect(typeof settings).toBe('object')
    })

    it('should save settings to localStorage', () => {
      const mockSettings: Partial<Settings> = {
        theme: 'dark',
        autoSave: true,
        previewMode: 'split'
      }

      storageService.saveSettings(mockSettings)

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'viny-settings',
        JSON.stringify(mockSettings)
      )
    })

    it('should merge settings with defaults', () => {
      const existingSettings = { theme: 'light' }
      const newSettings = { autoSave: false }

      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingSettings))
      
      storageService.saveSettings(newSettings)

      const savedData = localStorageMock.setItem.mock.calls[0][1]
      const parsedData = JSON.parse(savedData)
      
      expect(parsedData.theme).toBe('light') // Should preserve existing
      expect(parsedData.autoSave).toBe(false) // Should update new
    })
  })

  describe('Tag Colors Storage', () => {
    it('should return empty object when no tag colors in localStorage', () => {
      localStorageMock.getItem.mockReturnValue(null)
      
      const tagColors = storageService.getTagColors()
      
      expect(tagColors).toEqual({})
      expect(localStorageMock.getItem).toHaveBeenCalledWith('viny_tag_colors')
    })

    it('should save tag colors to localStorage', () => {
      const mockTagColors = {
        'work': '#ff0000',
        'personal': '#00ff00'
      }

      storageService.saveTagColors(mockTagColors)

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'viny_tag_colors',
        JSON.stringify(mockTagColors)
      )
    })
  })

  describe('Error Handling', () => {
    it('should handle localStorage quota exceeded error', () => {
      const mockNotes: Note[] = [{
        id: '1',
        title: 'Test',
        content: 'Content',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: [],
        notebook: 'default',
        status: 'none'
      }]

      localStorageMock.setItem.mockImplementation(() => {
        const error = new Error('QuotaExceededError')
        error.name = 'QuotaExceededError'
        throw error
      })

      // Should throw error for quota exceeded
      expect(() => storageService.saveNotes(mockNotes)).toThrow('Storage quota exceeded')
    })

    it('should handle corrupted localStorage data gracefully', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('Storage error')
      })

      const notes = storageService.getNotes()
      
      expect(notes).toEqual([])
    })
  })

  describe('Async Methods', () => {
    it('should load notes asynchronously', () => {
      const mockNotes: Note[] = [
        {
          id: '1',
          title: 'Async Note',
          content: 'Async content',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tags: ['async'],
          notebook: 'default',
          status: 'draft'
        }
      ]
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockNotes))
      
      // Test that the method exists and returns a promise
      const promise = storageService.loadNotes()
      expect(promise).toBeInstanceOf(Promise)
    })

    it('should load notebooks asynchronously', async () => {
      const mockNotebooks: Notebook[] = [
        {
          id: '1',
          name: 'Async Notebook',
          color: 'blue',
          description: 'Async description',
          parentId: null,
          children: [],
          level: 0,
          path: 'async-notebook',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockNotebooks))
      
      const notebooks = await storageService.loadNotebooks()
      
      expect(notebooks).toEqual(mockNotebooks)
      expect(localStorageMock.getItem).toHaveBeenCalledWith('viny_notebooks')
    })

    it('should load settings asynchronously', async () => {
      const mockSettings: Partial<Settings> = {
        theme: 'dark',
        autoSave: true,
        saveInterval: 5000
      }
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockSettings))
      
      const settings = await storageService.loadSettings()
      
      expect(settings).toEqual(mockSettings)
      expect(localStorageMock.getItem).toHaveBeenCalledWith('viny-settings')
    })

    it('should handle async methods existence', () => {
      // Test that async methods exist and return promises
      expect(typeof storageService.loadNotes).toBe('function')
      expect(typeof storageService.loadNotebooks).toBe('function')
      expect(typeof storageService.loadSettings).toBe('function')
    })
  })
})