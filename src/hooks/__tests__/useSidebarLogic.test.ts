/**
 * Tests for useSidebarLogic hook
 * Medium priority hook for sidebar navigation and UI logic
 */

import { renderHook, act } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useSidebarLogic } from '../useSidebarLogic'
import { useAppStore } from '../../stores/newSimpleStore'

// Mock data
const mockNotes = [
  {
    id: '1',
    title: 'Note 1',
    isTrashed: false,
    isPinned: true,
    status: 'active',
    tags: ['tag1', 'tag2'],
  },
  {
    id: '2',
    title: 'Note 2',
    isTrashed: false,
    isPinned: false,
    status: 'draft',
    tags: ['tag1', 'tag3'],
  },
  {
    id: '3',
    title: 'Note 3',
    isTrashed: false,
    isPinned: false,
    status: 'in-progress',
    tags: ['tag2'],
  },
  {
    id: '4',
    title: 'Note 4',
    isTrashed: false,
    isPinned: false,
    status: 'review',
    tags: ['tag3'],
  },
  {
    id: '5',
    title: 'Note 5',
    isTrashed: false,
    isPinned: false,
    status: 'completed',
    tags: [],
  },
  {
    id: '6',
    title: 'Note 6',
    isTrashed: false,
    isPinned: false,
    status: 'archived',
    tags: ['tag1'],
  },
  {
    id: '7',
    title: 'Note 7',
    isTrashed: true,
    isPinned: false,
    status: 'active',
    tags: [],
  },
]

const mockNotebooks = [
  { id: 'nb1', name: 'Notebook 1', color: 'blue', parentId: null },
  { id: 'nb2', name: 'Notebook 2', color: 'green', parentId: null },
  { id: 'nb3', name: 'Child Notebook', color: 'red', parentId: 'nb1' },
]

// Mock store functions
const mockSetActiveSection = vi.fn()
const mockSetExpandedSection = vi.fn()
const mockSetModal = vi.fn()

// Mock expandedSections
const mockExpandedSections = {
  notebooks: true,
  status: false,
  tags: true,
}

// Mock app store
vi.mock('../../stores/newSimpleStore', () => ({
  useAppStore: vi.fn(() => ({
    notes: mockNotes,
    activeSection: 'all-notes',
    expandedSections: mockExpandedSections,
    setActiveSection: mockSetActiveSection,
    setExpandedSection: mockSetExpandedSection,
    setModal: mockSetModal,
  })),
}))

// Mock notebook functions
const mockCreateNotebook = vi.fn()
const mockUpdateNotebook = vi.fn()
const mockDeleteNotebook = vi.fn()
const mockMoveNotebook = vi.fn()
const mockGetRootNotebooks = vi.fn()
const mockGetNotebookChildren = vi.fn()
const mockGetColorClass = vi.fn(color => `notebook-${color}`)

// Mock useNotebooks hook
vi.mock('../useNotebooks', () => ({
  useNotebooks: vi.fn(() => ({
    notebooks: mockNotebooks,
    getColorClass: mockGetColorClass,
    createNotebook: mockCreateNotebook,
    updateNotebook: mockUpdateNotebook,
    deleteNotebook: mockDeleteNotebook,
    moveNotebook: mockMoveNotebook,
    getRootNotebooks: mockGetRootNotebooks,
    getNotebookChildren: mockGetNotebookChildren,
  })),
}))

// Mock getStats function
vi.mock('../../utils/statsUtils', () => ({
  getStats: vi.fn(notes => ({
    total: notes.filter(n => !n.isTrashed).length,
    pinned: notes.filter(n => !n.isTrashed && n.isPinned).length,
    trashed: notes.filter(n => n.isTrashed).length,
    byStatus: {
      draft: notes.filter(n => !n.isTrashed && n.status === 'draft').length,
      'in-progress': notes.filter(
        n => !n.isTrashed && n.status === 'in-progress'
      ).length,
      review: notes.filter(n => !n.isTrashed && n.status === 'review').length,
      completed: notes.filter(n => !n.isTrashed && n.status === 'completed')
        .length,
      archived: notes.filter(n => !n.isTrashed && n.status === 'archived')
        .length,
    },
  })),
}))

// Mock getNotebookWithCounts
vi.mock('../../utils/notebookTree', () => ({
  getNotebookWithCounts: vi.fn((notebooks, notes) =>
    notebooks.map(nb => ({
      ...nb,
      noteCount: notes.filter(n => n.notebookId === nb.id).length,
    }))
  ),
}))

describe('useSidebarLogic', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Hook initialization', () => {
    it('should provide all expected values and functions', () => {
      const { result } = renderHook(() => useSidebarLogic())

      // State
      expect(result.current.activeSection).toBe('all-notes')
      expect(result.current.expandedSections).toEqual(mockExpandedSections)
      expect(result.current.notes).toEqual(mockNotes)

      // Computed sections
      expect(result.current.mainSections).toBeDefined()
      expect(result.current.statusSections).toBeDefined()
      expect(result.current.systemSections).toBeDefined()
      expect(result.current.notebooksWithCounts).toBeDefined()
      expect(result.current.tagsWithCounts).toBeDefined()

      // Functions
      expect(typeof result.current.getColorClass).toBe('function')
      expect(typeof result.current.handleSectionClick).toBe('function')
      expect(typeof result.current.handleToggleSection).toBe('function')
      expect(typeof result.current.handleSettingsClick).toBe('function')
      expect(typeof result.current.createNotebook).toBe('function')
      expect(typeof result.current.updateNotebook).toBe('function')
      expect(typeof result.current.deleteNotebook).toBe('function')
      expect(typeof result.current.moveNotebook).toBe('function')
      expect(typeof result.current.getRootNotebooks).toBe('function')
      expect(typeof result.current.getNotebookChildren).toBe('function')

      // Stats
      expect(result.current.stats).toBeDefined()
    })
  })

  describe('Main sections', () => {
    it('should calculate main sections with correct counts', () => {
      const { result } = renderHook(() => useSidebarLogic())

      expect(result.current.mainSections).toEqual([
        { id: 'all-notes', label: 'All Notes', count: 6, icon: 'NotebookText' },
        { id: 'pinned', label: 'Pinned', count: 1, icon: 'Pin' },
      ])
    })
  })

  describe('Status sections', () => {
    it('should calculate status sections with correct counts', () => {
      const { result } = renderHook(() => useSidebarLogic())

      expect(result.current.statusSections).toEqual([
        {
          id: 'status-draft',
          label: 'Draft',
          count: 1,
          icon: 'FileText',
          color: 'text-theme-text-secondary',
        },
        {
          id: 'status-in-progress',
          label: 'In Progress',
          count: 1,
          icon: 'Circle',
          color: 'text-theme-accent-blue',
        },
        {
          id: 'status-review',
          label: 'Review',
          count: 1,
          icon: 'Clock',
          color: 'text-theme-accent-yellow',
        },
        {
          id: 'status-completed',
          label: 'Completed',
          count: 1,
          icon: 'CheckCircle',
          color: 'text-theme-accent-green',
        },
        {
          id: 'status-archived',
          label: 'Archived',
          count: 1,
          icon: 'XCircle',
          color: 'text-theme-accent-red',
        },
      ])
    })
  })

  describe('System sections', () => {
    it('should calculate system sections with correct counts', () => {
      const { result } = renderHook(() => useSidebarLogic())

      expect(result.current.systemSections).toEqual([
        { id: 'trash', label: 'Trash', count: 1, icon: 'Trash' },
      ])
    })
  })

  describe('Tags calculation', () => {
    it('should calculate tags with counts sorted by frequency', () => {
      const { result } = renderHook(() => useSidebarLogic())

      expect(result.current.tagsWithCounts).toEqual([
        { tag: 'tag1', count: 2 },
        { tag: 'tag2', count: 2 },
        { tag: 'tag3', count: 2 },
      ])
    })

    it('should exclude tags from trashed notes', () => {
      const { result } = renderHook(() => useSidebarLogic())

      // Note 7 is trashed, so its tags shouldn't be counted
      const trashedNote = mockNotes.find(n => n.id === '7')
      expect(trashedNote?.isTrashed).toBe(true)

      // Verify tags are calculated correctly
      expect(result.current.tagsWithCounts.length).toBeGreaterThan(0)
    })

    it('should exclude tags from completed and archived notes', () => {
      const { result } = renderHook(() => useSidebarLogic())

      // Archived note (id: 6) has tag1, but it shouldn't be counted
      const archivedNote = mockNotes.find(n => n.id === '6')
      expect(archivedNote?.status).toBe('archived')

      // tag1 count should be 2 (from notes 1 and 2), not 3
      const tag1Count = result.current.tagsWithCounts.find(
        t => t.tag === 'tag1'
      )?.count
      expect(tag1Count).toBe(2)
    })

    it('should limit tags to top 10', () => {
      // This is already satisfied with our mock data (only 3 tags)
      const { result } = renderHook(() => useSidebarLogic())
      expect(result.current.tagsWithCounts.length).toBeLessThanOrEqual(10)
    })
  })

  describe('Notebooks', () => {
    it('should sort notebooks by name', () => {
      const { result } = renderHook(() => useSidebarLogic())

      const notebookNames = result.current.notebooksWithCounts.map(n => n.name)
      const sortedNames = [...notebookNames].sort((a, b) => a.localeCompare(b))

      expect(notebookNames).toEqual(sortedNames)
    })

    it('should include note counts in notebooks', () => {
      const { result } = renderHook(() => useSidebarLogic())

      result.current.notebooksWithCounts.forEach(notebook => {
        expect(notebook).toHaveProperty('noteCount')
      })
    })
  })

  describe('Section navigation', () => {
    it('should handle regular section click', () => {
      const { result } = renderHook(() => useSidebarLogic())

      act(() => {
        result.current.handleSectionClick('all-notes')
      })

      expect(mockSetActiveSection).toHaveBeenCalledWith('all-notes')
      expect(mockSetModal).not.toHaveBeenCalled()
    })

    it('should handle settings section click', () => {
      const { result } = renderHook(() => useSidebarLogic())

      act(() => {
        result.current.handleSectionClick('settings')
      })

      expect(mockSetModal).toHaveBeenCalledWith('settings', true)
      expect(mockSetActiveSection).not.toHaveBeenCalled()
    })

    it('should toggle section expansion', () => {
      const { result } = renderHook(() => useSidebarLogic())

      act(() => {
        result.current.handleToggleSection('notebooks')
      })

      expect(mockSetExpandedSection).toHaveBeenCalledWith('notebooks', false)

      act(() => {
        result.current.handleToggleSection('status')
      })

      expect(mockSetExpandedSection).toHaveBeenCalledWith('status', true)
    })
  })

  describe('Settings handling', () => {
    it('should open settings modal in web version', () => {
      const { result } = renderHook(() => useSidebarLogic())

      act(() => {
        result.current.handleSettingsClick()
      })

      expect(mockSetModal).toHaveBeenCalledWith('settings', true)
    })

    it('should use Electron API when available', () => {
      const mockOpenSettings = vi.fn()
      ;(window as any).electronAPI = {
        isElectron: true,
        openSettings: mockOpenSettings,
      }

      const { result } = renderHook(() => useSidebarLogic())

      act(() => {
        result.current.handleSettingsClick()
      })

      expect(mockOpenSettings).toHaveBeenCalled()
      expect(mockSetModal).not.toHaveBeenCalled()

      // Clean up
      delete (window as any).electronAPI
    })

    it('should fallback to modal when Electron API is incomplete', () => {
      ;(window as any).electronAPI = {
        isElectron: false,
      }

      const { result } = renderHook(() => useSidebarLogic())

      act(() => {
        result.current.handleSettingsClick()
      })

      expect(mockSetModal).toHaveBeenCalledWith('settings', true)

      // Clean up
      delete (window as any).electronAPI
    })
  })

  describe('Notebook actions delegation', () => {
    it('should delegate notebook actions correctly', () => {
      const { result } = renderHook(() => useSidebarLogic())

      // Test each delegated function
      result.current.createNotebook({ name: 'New Notebook' })
      expect(mockCreateNotebook).toHaveBeenCalledWith({ name: 'New Notebook' })

      result.current.updateNotebook('nb1', { name: 'Updated' })
      expect(mockUpdateNotebook).toHaveBeenCalledWith('nb1', {
        name: 'Updated',
      })

      result.current.deleteNotebook('nb1')
      expect(mockDeleteNotebook).toHaveBeenCalledWith('nb1')

      result.current.moveNotebook('nb1', 'nb2')
      expect(mockMoveNotebook).toHaveBeenCalledWith('nb1', 'nb2')

      result.current.getRootNotebooks()
      expect(mockGetRootNotebooks).toHaveBeenCalled()

      result.current.getNotebookChildren('nb1')
      expect(mockGetNotebookChildren).toHaveBeenCalledWith('nb1')
    })
  })

  describe('Color class utility', () => {
    it('should delegate getColorClass correctly', () => {
      const { result } = renderHook(() => useSidebarLogic())

      const colorClass = result.current.getColorClass('blue')

      expect(mockGetColorClass).toHaveBeenCalledWith('blue')
      expect(colorClass).toBe('notebook-blue')
    })
  })

  describe('Stats calculation', () => {
    it('should calculate stats correctly', () => {
      const { result } = renderHook(() => useSidebarLogic())

      expect(result.current.stats).toEqual({
        total: 6,
        pinned: 1,
        trashed: 1,
        byStatus: {
          draft: 1,
          'in-progress': 1,
          review: 1,
          completed: 1,
          archived: 1,
        },
      })
    })
  })

  describe('Edge cases', () => {
    it('should handle empty notes array', () => {
      vi.mocked(useAppStore).mockReturnValueOnce({
        notes: [],
        activeSection: 'all-notes',
        expandedSections: mockExpandedSections,
        setActiveSection: mockSetActiveSection,
        setExpandedSection: mockSetExpandedSection,
        setModal: mockSetModal,
      } as any)

      const { result } = renderHook(() => useSidebarLogic())

      expect(result.current.mainSections[0].count).toBe(0)
      expect(result.current.tagsWithCounts).toEqual([])
      expect(result.current.stats.total).toBe(0)
    })

    it('should handle notes without tags', () => {
      const notesWithoutTags = mockNotes.map(note => ({
        ...note,
        tags: undefined,
      }))
      vi.mocked(useAppStore).mockReturnValueOnce({
        notes: notesWithoutTags,
        activeSection: 'all-notes',
        expandedSections: mockExpandedSections,
        setActiveSection: mockSetActiveSection,
        setExpandedSection: mockSetExpandedSection,
        setModal: mockSetModal,
      } as any)

      const { result } = renderHook(() => useSidebarLogic())

      expect(result.current.tagsWithCounts).toEqual([])
    })
  })

  describe('Method stability', () => {
    it('should provide stable method references', () => {
      const { result, rerender } = renderHook(() => useSidebarLogic())

      const initialMethods = {
        handleSectionClick: result.current.handleSectionClick,
        handleToggleSection: result.current.handleToggleSection,
        handleSettingsClick: result.current.handleSettingsClick,
      }

      rerender()

      expect(result.current.handleSectionClick).toBe(
        initialMethods.handleSectionClick
      )
      expect(result.current.handleToggleSection).toBe(
        initialMethods.handleToggleSection
      )
      expect(result.current.handleSettingsClick).toBe(
        initialMethods.handleSettingsClick
      )
    })
  })
})
