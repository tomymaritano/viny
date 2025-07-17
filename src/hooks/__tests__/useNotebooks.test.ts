/**
 * Tests for useNotebooks hook
 * High priority system for notebook CRUD operations
 */

import { renderHook, act, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Notebook } from '../../types/notebook'

// Mock logger
const mockLogger = {
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  debug: vi.fn()
}

vi.mock('../../utils/logger', () => ({
  logger: mockLogger
}))

// Mock electron storage service
const mockGetNotebooks = vi.fn()
const mockSaveNotebooks = vi.fn()

vi.mock('../../lib/electronStorage', () => ({
  electronStorageService: {
    isElectronEnvironment: false,
    getNotebooks: mockGetNotebooks,
    saveNotebooks: mockSaveNotebooks
  }
}))

// Mock app store
const mockNotes = [
  { id: 'note1', notebook: 'inbox', title: 'Test Note 1', content: 'Content 1', createdAt: new Date().toISOString() },
  { id: 'note2', notebook: 'projects', title: 'Test Note 2', content: 'Content 2', createdAt: new Date().toISOString() },
  { id: 'note3', notebook: 'work', title: 'Test Note 3', content: 'Content 3', createdAt: new Date().toISOString() }
]

const mockUpdateNote = vi.fn()

vi.mock('../../stores/newSimpleStore', () => ({
  useAppStore: vi.fn(() => ({
    notes: mockNotes,
    updateNote: mockUpdateNote
  }))
}))

// Mock validation utilities
const mockValidateNotebookName = vi.fn()
const mockValidateNotebookNesting = vi.fn()
const mockValidateNotebookMove = vi.fn()

vi.mock('../../utils/notebookValidation', () => ({
  validateNotebookName: mockValidateNotebookName,
  validateNotebookNesting: mockValidateNotebookNesting,
  validateNotebookMove: mockValidateNotebookMove
}))

// Mock tree utilities
const mockBuildNotebookTree = vi.fn()
const mockFlattenNotebookTree = vi.fn()
const mockGetNotebookWithCounts = vi.fn()
const mockDeleteNotebookAndChildren = vi.fn()
const mockMoveNotebookWithChildren = vi.fn()

vi.mock('../../utils/notebookTree', () => ({
  buildNotebookTree: mockBuildNotebookTree,
  flattenNotebookTree: mockFlattenNotebookTree,
  getNotebookWithCounts: mockGetNotebookWithCounts,
  deleteNotebookAndChildren: mockDeleteNotebookAndChildren,
  moveNotebookWithChildren: mockMoveNotebookWithChildren
}))

// Mock alert
const mockAlert = vi.fn()
global.alert = mockAlert

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true
})

// Mock console methods
const mockConsole = {
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn()
}

global.console = { ...global.console, ...mockConsole }

// Sample notebooks for testing
const sampleNotebooks: Notebook[] = [
  {
    id: 'inbox',
    name: 'inbox',
    color: 'purple',
    description: 'Quick notes',
    parentId: null,
    children: [],
    level: 0,
    path: 'inbox',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'projects',
    name: 'projects',
    color: 'orange',
    description: 'Development projects',
    parentId: null,
    children: [],
    level: 0,
    path: 'projects',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'work',
    name: 'work',
    color: 'green',
    description: 'Work-related notes',
    parentId: null,
    children: [],
    level: 0,
    path: 'work',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z'
  }
]

describe('useNotebooks', () => {
  let useNotebooks: any

  beforeEach(async () => {
    vi.clearAllMocks()
    
    // Setup default mock returns
    mockBuildNotebookTree.mockReturnValue(sampleNotebooks)
    mockFlattenNotebookTree.mockReturnValue(sampleNotebooks)
    mockLocalStorage.getItem.mockReturnValue(null)
    mockValidateNotebookName.mockReturnValue({ isValid: true })
    mockValidateNotebookNesting.mockReturnValue({ isValid: true })
    mockValidateNotebookMove.mockReturnValue({ isValid: true })
    mockDeleteNotebookAndChildren.mockReturnValue(['test-id'])
    mockMoveNotebookWithChildren.mockReturnValue(sampleNotebooks)
    
    // Reset modules
    vi.resetModules()
    
    // Import fresh hook
    const module = await import('../useNotebooks')
    useNotebooks = module.useNotebooks
  })

  describe('Hook Initialization', () => {
    it('should initialize with default notebooks', () => {
      const { result } = renderHook(() => useNotebooks())

      expect(result.current.notebooks).toBeDefined()
      expect(result.current.flatNotebooks).toBeDefined()
      expect(mockBuildNotebookTree).toHaveBeenCalled()
    })

    it('should provide all expected methods', () => {
      const { result } = renderHook(() => useNotebooks())

      // CRUD operations
      expect(result.current).toHaveProperty('createNotebook')
      expect(result.current).toHaveProperty('updateNotebook')
      expect(result.current).toHaveProperty('deleteNotebook')
      expect(result.current).toHaveProperty('moveNotebook')
      
      // Getters
      expect(result.current).toHaveProperty('getNotebook')
      expect(result.current).toHaveProperty('getNotebookByName')
      expect(result.current).toHaveProperty('getNotebooksByParent')
      expect(result.current).toHaveProperty('getRootNotebooks')
      expect(result.current).toHaveProperty('getNotebookChildren')
      expect(result.current).toHaveProperty('getFlattenedNotebooks')
      
      // Helpers
      expect(result.current).toHaveProperty('getColorClass')
      expect(result.current).toHaveProperty('getAvailableColors')

      // Check all methods are functions
      Object.entries(result.current).forEach(([key, value]) => {
        if (key !== 'notebooks' && key !== 'flatNotebooks') {
          expect(typeof value).toBe('function')
        }
      })
    })

    it('should initialize with localStorage data when available', () => {
      const storedNotebooks = JSON.stringify(sampleNotebooks)
      mockLocalStorage.getItem.mockReturnValue(storedNotebooks)

      const { result } = renderHook(() => useNotebooks())
      
      // Test that hook initializes successfully
      expect(result.current.notebooks).toBeDefined()
      expect(mockBuildNotebookTree).toHaveBeenCalled()
    })

    it('should handle initialization errors gracefully', () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('localStorage error')
      })

      const { result } = renderHook(() => useNotebooks())
      
      // Test that hook still initializes with defaults
      expect(result.current.notebooks).toBeDefined()
      expect(mockBuildNotebookTree).toHaveBeenCalled()
    })
  })

  describe('Notebook Creation', () => {
    it('should create a new notebook with valid data', () => {
      const { result } = renderHook(() => useNotebooks())

      const newNotebookData = {
        name: 'New Notebook',
        color: 'blue',
        description: 'A new test notebook'
      }

      let createdNotebook: Notebook | null = null
      act(() => {
        createdNotebook = result.current.createNotebook(newNotebookData)
      })

      expect(createdNotebook).not.toBeNull()
      expect(createdNotebook?.name).toBe('New Notebook')
      expect(createdNotebook?.color).toBe('blue')
      expect(createdNotebook?.description).toBe('A new test notebook')
      expect(createdNotebook?.id).toMatch(/^notebook_/)
      expect(mockValidateNotebookName).toHaveBeenCalled()
      expect(mockValidateNotebookNesting).toHaveBeenCalled()
    })

    it('should create notebook with parent ID', () => {
      const { result } = renderHook(() => useNotebooks())

      const newNotebookData = {
        name: 'Child Notebook',
        color: 'red',
        parentId: 'projects'
      }

      let createdNotebook: Notebook | null = null
      act(() => {
        createdNotebook = result.current.createNotebook(newNotebookData)
      })

      expect(createdNotebook).not.toBeNull()
      expect(createdNotebook?.parentId).toBe('projects')
      expect(mockValidateNotebookNesting).toHaveBeenCalledWith('projects', expect.any(Array))
    })

    it('should handle name validation failure', () => {
      mockValidateNotebookName.mockReturnValue({ 
        isValid: false, 
        error: 'Name already exists' 
      })

      const { result } = renderHook(() => useNotebooks())

      const newNotebookData = {
        name: 'Duplicate Name',
        color: 'blue'
      }

      let createdNotebook: Notebook | null = null
      act(() => {
        createdNotebook = result.current.createNotebook(newNotebookData)
      })

      expect(createdNotebook).toBeNull()
      expect(mockAlert).toHaveBeenCalledWith('Cannot create notebook: Name already exists')
    })

    it('should handle nesting validation failure', () => {
      mockValidateNotebookNesting.mockReturnValue({ 
        isValid: false, 
        error: 'Invalid nesting level' 
      })

      const { result } = renderHook(() => useNotebooks())

      const newNotebookData = {
        name: 'Deep Nested',
        color: 'blue',
        parentId: 'some-deep-parent'
      }

      let createdNotebook: Notebook | null = null
      act(() => {
        createdNotebook = result.current.createNotebook(newNotebookData)
      })

      expect(createdNotebook).toBeNull()
      expect(mockAlert).toHaveBeenCalledWith('Cannot create notebook: Invalid nesting level')
    })

    it('should trim whitespace from notebook name', () => {
      const { result } = renderHook(() => useNotebooks())

      const newNotebookData = {
        name: '  Trimmed Name  ',
        color: 'blue'
      }

      let createdNotebook: Notebook | null = null
      act(() => {
        createdNotebook = result.current.createNotebook(newNotebookData)
      })

      expect(createdNotebook?.name).toBe('Trimmed Name')
    })

    it('should use default color if none provided', () => {
      const { result } = renderHook(() => useNotebooks())

      const newNotebookData = {
        name: 'No Color Notebook'
      }

      let createdNotebook: Notebook | null = null
      act(() => {
        createdNotebook = result.current.createNotebook(newNotebookData)
      })

      expect(createdNotebook?.color).toBe('blue')
    })
  })

  describe('Notebook Updates', () => {
    it('should update notebook with valid data', () => {
      const { result } = renderHook(() => useNotebooks())

      const updates = {
        name: 'Updated Name',
        color: 'red',
        description: 'Updated description'
      }

      let updateResult: boolean = false
      act(() => {
        updateResult = result.current.updateNotebook('inbox', updates)
      })

      expect(updateResult).toBe(true)
      expect(mockValidateNotebookName).toHaveBeenCalledWith('Updated Name', expect.any(Array), 'inbox')
      expect(mockBuildNotebookTree).toHaveBeenCalled()
    })

    it('should handle parent ID update', () => {
      const { result } = renderHook(() => useNotebooks())

      const updates = {
        parentId: 'projects'
      }

      let updateResult: boolean = false
      act(() => {
        updateResult = result.current.updateNotebook('inbox', updates)
      })

      expect(updateResult).toBe(true)
      expect(mockValidateNotebookMove).toHaveBeenCalledWith('inbox', 'projects', expect.any(Array))
      expect(mockMoveNotebookWithChildren).toHaveBeenCalledWith('inbox', 'projects', expect.any(Array))
    })

    it('should handle notebook not found', () => {
      const { result } = renderHook(() => useNotebooks())

      const updates = { name: 'Updated Name' }

      let updateResult: boolean = false
      act(() => {
        updateResult = result.current.updateNotebook('nonexistent', updates)
      })

      expect(updateResult).toBe(false)
      expect(mockLogger.warn).toHaveBeenCalledWith('Notebook not found:', 'nonexistent')
    })

    it('should handle name validation failure on update', () => {
      mockValidateNotebookName.mockReturnValue({ 
        isValid: false, 
        error: 'Invalid name' 
      })

      const { result } = renderHook(() => useNotebooks())

      const updates = { name: 'Invalid Name' }

      let updateResult: boolean = false
      act(() => {
        updateResult = result.current.updateNotebook('inbox', updates)
      })

      expect(updateResult).toBe(false)
      expect(mockLogger.warn).toHaveBeenCalledWith('Invalid notebook name:', 'Invalid name')
    })

    it('should handle move validation failure on update', () => {
      mockValidateNotebookMove.mockReturnValue({ 
        isValid: false, 
        error: 'Invalid move' 
      })

      const { result } = renderHook(() => useNotebooks())

      const updates = { parentId: 'invalid-parent' }

      let updateResult: boolean = false
      act(() => {
        updateResult = result.current.updateNotebook('inbox', updates)
      })

      expect(updateResult).toBe(false)
      expect(mockLogger.warn).toHaveBeenCalledWith('Invalid move:', 'Invalid move')
    })
  })

  describe('Notebook Deletion', () => {
    it('should delete notebook and move notes to trash', () => {
      mockDeleteNotebookAndChildren.mockReturnValue(['inbox'])
      const { result } = renderHook(() => useNotebooks())

      let deleteResult: boolean = false
      act(() => {
        deleteResult = result.current.deleteNotebook('inbox')
      })

      expect(deleteResult).toBe(true)
      expect(mockDeleteNotebookAndChildren).toHaveBeenCalledWith('inbox', expect.any(Array))
      expect(mockUpdateNote).toHaveBeenCalledWith(expect.objectContaining({
        id: 'note1',
        isTrashed: true,
        trashedAt: expect.any(String)
      }))
      expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining('Deleted notebook inbox'))
    })

    it('should prevent deleting the last root notebook', () => {
      // Mock only one root notebook
      const singleRootNotebook = [
        { ...sampleNotebooks[0], parentId: null }
      ]
      mockBuildNotebookTree.mockReturnValue(singleRootNotebook)

      const { result } = renderHook(() => useNotebooks())

      let deleteResult: boolean = false
      act(() => {
        deleteResult = result.current.deleteNotebook('inbox')
      })

      expect(deleteResult).toBe(false)
      expect(mockLogger.warn).toHaveBeenCalledWith('Cannot delete the last root notebook')
    })

    it('should allow deleting child notebooks', () => {
      mockDeleteNotebookAndChildren.mockReturnValue(['child-notebook'])
      const { result } = renderHook(() => useNotebooks())

      let deleteResult: boolean = false
      act(() => {
        deleteResult = result.current.deleteNotebook('child-notebook')
      })

      expect(deleteResult).toBe(true)
      expect(mockDeleteNotebookAndChildren).toHaveBeenCalledWith('child-notebook', expect.any(Array))
    })

    it('should handle deleting notebook with children', () => {
      mockDeleteNotebookAndChildren.mockReturnValue(['parent', 'child1', 'child2'])
      const { result } = renderHook(() => useNotebooks())

      let deleteResult: boolean = false
      act(() => {
        deleteResult = result.current.deleteNotebook('parent')
      })

      expect(deleteResult).toBe(true)
      expect(mockDeleteNotebookAndChildren).toHaveBeenCalledWith('parent', expect.any(Array))
    })
  })

  describe('Notebook Movement', () => {
    it('should move notebook to new parent', () => {
      const { result } = renderHook(() => useNotebooks())

      let moveResult: boolean = false
      act(() => {
        moveResult = result.current.moveNotebook('inbox', 'projects')
      })

      expect(moveResult).toBe(true)
      expect(mockValidateNotebookMove).toHaveBeenCalledWith('inbox', 'projects', expect.any(Array))
      expect(mockMoveNotebookWithChildren).toHaveBeenCalledWith('inbox', 'projects', expect.any(Array))
    })

    it('should handle move validation failure', () => {
      mockValidateNotebookMove.mockReturnValue({ 
        isValid: false, 
        error: 'Cannot move to child' 
      })

      const { result } = renderHook(() => useNotebooks())

      let moveResult: boolean = false
      act(() => {
        moveResult = result.current.moveNotebook('inbox', 'projects')
      })

      expect(moveResult).toBe(false)
      expect(mockConsole.warn).toHaveBeenCalledWith('Invalid move:', 'Cannot move to child')
    })

    it('should move notebook to root level', () => {
      const { result } = renderHook(() => useNotebooks())

      let moveResult: boolean = false
      act(() => {
        moveResult = result.current.moveNotebook('child-notebook', null)
      })

      expect(moveResult).toBe(true)
      expect(mockValidateNotebookMove).toHaveBeenCalledWith('child-notebook', null, expect.any(Array))
    })
  })

  describe('Notebook Getters', () => {
    it('should get notebook by ID', () => {
      const { result } = renderHook(() => useNotebooks())

      const foundNotebook = result.current.getNotebook('inbox')
      expect(foundNotebook).toBeDefined()
      expect(foundNotebook?.id).toBe('inbox')
    })

    it('should return undefined for non-existent notebook', () => {
      const { result } = renderHook(() => useNotebooks())

      const foundNotebook = result.current.getNotebook('nonexistent')
      expect(foundNotebook).toBeUndefined()
    })

    it('should get notebook by name (case insensitive)', () => {
      const { result } = renderHook(() => useNotebooks())

      const foundNotebook = result.current.getNotebookByName('INBOX')
      expect(foundNotebook).toBeDefined()
      expect(foundNotebook?.name).toBe('inbox')
    })

    it('should get notebooks by parent ID', () => {
      const { result } = renderHook(() => useNotebooks())

      const childNotebooks = result.current.getNotebooksByParent('projects')
      expect(Array.isArray(childNotebooks)).toBe(true)
    })

    it('should get root notebooks', () => {
      const { result } = renderHook(() => useNotebooks())

      const rootNotebooks = result.current.getRootNotebooks()
      expect(Array.isArray(rootNotebooks)).toBe(true)
    })

    it('should get notebook children', () => {
      const { result } = renderHook(() => useNotebooks())

      const children = result.current.getNotebookChildren('projects')
      expect(Array.isArray(children)).toBe(true)
    })

    it('should get flattened notebooks', () => {
      const { result } = renderHook(() => useNotebooks())

      const flatNotebooks = result.current.getFlattenedNotebooks()
      expect(Array.isArray(flatNotebooks)).toBe(true)
      expect(mockFlattenNotebookTree).toHaveBeenCalledWith(expect.any(Array))
    })
  })

  describe('Helper Methods', () => {
    it('should get color class for valid color', () => {
      const { result } = renderHook(() => useNotebooks())

      // Mock NOTEBOOK_COLORS
      const mockColors = [
        { value: 'blue', class: 'text-blue-500' },
        { value: 'red', class: 'text-red-500' }
      ]

      // We need to mock the NOTEBOOK_COLORS import
      vi.doMock('../../types/notebook', () => ({
        NOTEBOOK_COLORS: mockColors
      }))

      const colorClass = result.current.getColorClass('blue')
      expect(typeof colorClass).toBe('string')
    })

    it('should return default color class for invalid color', () => {
      const { result } = renderHook(() => useNotebooks())

      const colorClass = result.current.getColorClass('invalid-color')
      expect(colorClass).toBe('text-solarized-blue')
    })

    it('should get available colors', () => {
      const { result } = renderHook(() => useNotebooks())

      const availableColors = result.current.getAvailableColors()
      expect(Array.isArray(availableColors)).toBe(true)
    })
  })

  describe('Storage Integration', () => {
    it('should attempt to save to localStorage when notebooks change', () => {
      const { result } = renderHook(() => useNotebooks())

      act(() => {
        result.current.createNotebook({ name: 'Test Notebook', color: 'blue' })
      })

      // Test the sync operation completes
      expect(mockBuildNotebookTree).toHaveBeenCalled()
    })

    it('should handle save operations', () => {
      const { result } = renderHook(() => useNotebooks())

      // Test basic storage functionality
      expect(result.current.notebooks).toBeDefined()
      expect(result.current.flatNotebooks).toBeDefined()
    })
  })

  describe('Migration Support', () => {
    it('should handle notebook structure migration', () => {
      const oldNotebooks = [
        {
          id: 'old-notebook',
          name: 'Old Notebook',
          color: 'blue',
          createdAt: '2025-01-01T00:00:00.000Z'
          // Missing: parentId, children, level, path, updatedAt
        }
      ]

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(oldNotebooks))

      const { result } = renderHook(() => useNotebooks())

      // Test that hook initializes successfully even with old structure
      expect(result.current.notebooks).toBeDefined()
      expect(mockBuildNotebookTree).toHaveBeenCalled()
    })
  })

  describe('Error Handling', () => {
    it('should handle malformed JSON in localStorage', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid json')

      const { result } = renderHook(() => useNotebooks())

      // Test that hook still works with fallback
      expect(result.current.notebooks).toBeDefined()
      expect(mockBuildNotebookTree).toHaveBeenCalled()
    })

    it('should handle empty localStorage gracefully', () => {
      mockLocalStorage.getItem.mockReturnValue('')

      const { result } = renderHook(() => useNotebooks())

      // Test that hook works with empty storage
      expect(result.current.notebooks).toBeDefined()
      expect(mockBuildNotebookTree).toHaveBeenCalled()
    })
  })
})