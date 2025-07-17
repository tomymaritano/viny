/**
 * Tests for useSidebarState hook
 * Medium priority hook for managing sidebar UI state
 */

import { renderHook, act } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useSidebarState } from '../useSidebarState'
import React from 'react'

// Mock notebook data
const mockNotebook = {
  id: 'nb1',
  name: 'Test Notebook',
  color: 'blue',
  parentId: null,
  noteCount: 5
}

// Helper function to create mouse event
const createMouseEvent = (
  x: number,
  y: number,
  options: { preventDefault?: boolean; stopPropagation?: boolean } = {}
): React.MouseEvent => {
  const preventDefault = vi.fn()
  const stopPropagation = vi.fn()
  
  const event = {
    clientX: x,
    clientY: y,
    preventDefault: options.preventDefault !== false ? preventDefault : vi.fn(),
    stopPropagation: options.stopPropagation !== false ? stopPropagation : vi.fn()
  } as any
  
  return event
}

describe('useSidebarState', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Hook initialization', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useSidebarState())
      
      // Context menus
      expect(result.current.tagContextMenu).toEqual({
        isVisible: false,
        position: { x: 0, y: 0 },
        tagName: '',
        showColorPicker: false
      })
      
      expect(result.current.notebookContextMenu).toEqual({
        isVisible: false,
        position: { x: 0, y: 0 },
        notebook: null
      })
      
      expect(result.current.trashContextMenu).toEqual({
        isVisible: false,
        position: { x: 0, y: 0 }
      })
      
      // Modals
      expect(result.current.tagSettingsModal).toEqual({
        show: false,
        tagName: ''
      })
      expect(result.current.createNotebookModal).toBe(false)
      
      // Editing states
      expect(result.current.editingNotebook).toBe(null)
      expect(result.current.editValue).toBe('')
      
      // Expansion states
      expect(result.current.expandedNotebooks).toEqual(new Set())
    })

    it('should provide all expected methods', () => {
      const { result } = renderHook(() => useSidebarState())
      
      // Setters
      expect(typeof result.current.setTagSettingsModal).toBe('function')
      expect(typeof result.current.setCreateNotebookModal).toBe('function')
      expect(typeof result.current.setEditValue).toBe('function')
      
      // Handlers
      expect(typeof result.current.handleTagRightClick).toBe('function')
      expect(typeof result.current.handleNotebookRightClick).toBe('function')
      expect(typeof result.current.handleTrashRightClick).toBe('function')
      expect(typeof result.current.closeAllContextMenus).toBe('function')
      expect(typeof result.current.toggleNotebookExpansion).toBe('function')
      expect(typeof result.current.startEditingNotebook).toBe('function')
      expect(typeof result.current.cancelEditingNotebook).toBe('function')
    })
  })

  describe('Tag context menu', () => {
    it('should show tag context menu on right click', () => {
      const { result } = renderHook(() => useSidebarState())
      const event = createMouseEvent(100, 200)
      
      act(() => {
        result.current.handleTagRightClick(event, 'test-tag')
      })
      
      expect(event.preventDefault).toHaveBeenCalled()
      expect(event.stopPropagation).toHaveBeenCalled()
      expect(result.current.tagContextMenu).toEqual({
        isVisible: true,
        position: { x: 100, y: 200 },
        tagName: 'test-tag',
        showColorPicker: false
      })
    })

    it('should update tag context menu position on subsequent clicks', () => {
      const { result } = renderHook(() => useSidebarState())
      
      act(() => {
        result.current.handleTagRightClick(createMouseEvent(100, 200), 'tag1')
      })
      
      expect(result.current.tagContextMenu.position).toEqual({ x: 100, y: 200 })
      expect(result.current.tagContextMenu.tagName).toBe('tag1')
      
      act(() => {
        result.current.handleTagRightClick(createMouseEvent(300, 400), 'tag2')
      })
      
      expect(result.current.tagContextMenu.position).toEqual({ x: 300, y: 400 })
      expect(result.current.tagContextMenu.tagName).toBe('tag2')
    })
  })

  describe('Notebook context menu', () => {
    it('should show notebook context menu on right click', () => {
      const { result } = renderHook(() => useSidebarState())
      const event = createMouseEvent(150, 250)
      
      act(() => {
        result.current.handleNotebookRightClick(event, mockNotebook)
      })
      
      expect(event.preventDefault).toHaveBeenCalled()
      expect(event.stopPropagation).toHaveBeenCalled()
      expect(result.current.notebookContextMenu).toEqual({
        isVisible: true,
        position: { x: 150, y: 250 },
        notebook: mockNotebook
      })
    })

    it('should update notebook context menu with different notebook', () => {
      const { result } = renderHook(() => useSidebarState())
      const notebook2 = { ...mockNotebook, id: 'nb2', name: 'Another Notebook' }
      
      act(() => {
        result.current.handleNotebookRightClick(createMouseEvent(100, 100), mockNotebook)
      })
      
      expect(result.current.notebookContextMenu.notebook).toEqual(mockNotebook)
      
      act(() => {
        result.current.handleNotebookRightClick(createMouseEvent(200, 200), notebook2)
      })
      
      expect(result.current.notebookContextMenu.notebook).toEqual(notebook2)
    })
  })

  describe('Trash context menu', () => {
    it('should show trash context menu on right click', () => {
      const { result } = renderHook(() => useSidebarState())
      const event = createMouseEvent(200, 300)
      
      act(() => {
        result.current.handleTrashRightClick(event)
      })
      
      expect(event.preventDefault).toHaveBeenCalled()
      expect(event.stopPropagation).toHaveBeenCalled()
      expect(result.current.trashContextMenu).toEqual({
        isVisible: true,
        position: { x: 200, y: 300 }
      })
    })
  })

  describe('Context menu management', () => {
    it('should close all context menus', () => {
      const { result } = renderHook(() => useSidebarState())
      
      // Open all context menus
      act(() => {
        result.current.handleTagRightClick(createMouseEvent(100, 100), 'tag')
        result.current.handleNotebookRightClick(createMouseEvent(200, 200), mockNotebook)
        result.current.handleTrashRightClick(createMouseEvent(300, 300))
      })
      
      expect(result.current.tagContextMenu.isVisible).toBe(true)
      expect(result.current.notebookContextMenu.isVisible).toBe(true)
      expect(result.current.trashContextMenu.isVisible).toBe(true)
      
      // Close all
      act(() => {
        result.current.closeAllContextMenus()
      })
      
      expect(result.current.tagContextMenu.isVisible).toBe(false)
      expect(result.current.tagContextMenu.showColorPicker).toBe(false)
      expect(result.current.notebookContextMenu.isVisible).toBe(false)
      expect(result.current.trashContextMenu.isVisible).toBe(false)
    })

    it('should preserve other state when closing context menus', () => {
      const { result } = renderHook(() => useSidebarState())
      
      act(() => {
        result.current.handleTagRightClick(createMouseEvent(100, 100), 'preserved-tag')
      })
      
      const originalPosition = result.current.tagContextMenu.position
      const originalTagName = result.current.tagContextMenu.tagName
      
      act(() => {
        result.current.closeAllContextMenus()
      })
      
      expect(result.current.tagContextMenu.isVisible).toBe(false)
      expect(result.current.tagContextMenu.position).toEqual(originalPosition)
      expect(result.current.tagContextMenu.tagName).toBe(originalTagName)
    })
  })

  describe('Notebook expansion', () => {
    it('should toggle notebook expansion', () => {
      const { result } = renderHook(() => useSidebarState())
      
      expect(result.current.expandedNotebooks.has('nb1')).toBe(false)
      
      act(() => {
        result.current.toggleNotebookExpansion('nb1')
      })
      
      expect(result.current.expandedNotebooks.has('nb1')).toBe(true)
      
      act(() => {
        result.current.toggleNotebookExpansion('nb1')
      })
      
      expect(result.current.expandedNotebooks.has('nb1')).toBe(false)
    })

    it('should handle multiple notebook expansions', () => {
      const { result } = renderHook(() => useSidebarState())
      
      act(() => {
        result.current.toggleNotebookExpansion('nb1')
        result.current.toggleNotebookExpansion('nb2')
        result.current.toggleNotebookExpansion('nb3')
      })
      
      expect(result.current.expandedNotebooks.has('nb1')).toBe(true)
      expect(result.current.expandedNotebooks.has('nb2')).toBe(true)
      expect(result.current.expandedNotebooks.has('nb3')).toBe(true)
      
      act(() => {
        result.current.toggleNotebookExpansion('nb2')
      })
      
      expect(result.current.expandedNotebooks.has('nb1')).toBe(true)
      expect(result.current.expandedNotebooks.has('nb2')).toBe(false)
      expect(result.current.expandedNotebooks.has('nb3')).toBe(true)
    })
  })

  describe('Notebook editing', () => {
    it('should start editing notebook', () => {
      const { result } = renderHook(() => useSidebarState())
      
      act(() => {
        result.current.startEditingNotebook('nb1', 'Current Name')
      })
      
      expect(result.current.editingNotebook).toBe('nb1')
      expect(result.current.editValue).toBe('Current Name')
    })

    it('should cancel editing notebook', () => {
      const { result } = renderHook(() => useSidebarState())
      
      act(() => {
        result.current.startEditingNotebook('nb1', 'Current Name')
      })
      
      expect(result.current.editingNotebook).toBe('nb1')
      expect(result.current.editValue).toBe('Current Name')
      
      act(() => {
        result.current.cancelEditingNotebook()
      })
      
      expect(result.current.editingNotebook).toBe(null)
      expect(result.current.editValue).toBe('')
    })

    it('should update edit value', () => {
      const { result } = renderHook(() => useSidebarState())
      
      act(() => {
        result.current.startEditingNotebook('nb1', 'Initial Name')
      })
      
      act(() => {
        result.current.setEditValue('Updated Name')
      })
      
      expect(result.current.editValue).toBe('Updated Name')
    })

    it('should handle editing different notebooks sequentially', () => {
      const { result } = renderHook(() => useSidebarState())
      
      act(() => {
        result.current.startEditingNotebook('nb1', 'Name 1')
      })
      
      expect(result.current.editingNotebook).toBe('nb1')
      expect(result.current.editValue).toBe('Name 1')
      
      act(() => {
        result.current.startEditingNotebook('nb2', 'Name 2')
      })
      
      expect(result.current.editingNotebook).toBe('nb2')
      expect(result.current.editValue).toBe('Name 2')
    })
  })

  describe('Modal management', () => {
    it('should manage tag settings modal', () => {
      const { result } = renderHook(() => useSidebarState())
      
      act(() => {
        result.current.setTagSettingsModal({ show: true, tagName: 'test-tag' })
      })
      
      expect(result.current.tagSettingsModal).toEqual({ show: true, tagName: 'test-tag' })
      
      act(() => {
        result.current.setTagSettingsModal({ show: false, tagName: '' })
      })
      
      expect(result.current.tagSettingsModal).toEqual({ show: false, tagName: '' })
    })

    it('should manage create notebook modal', () => {
      const { result } = renderHook(() => useSidebarState())
      
      expect(result.current.createNotebookModal).toBe(false)
      
      act(() => {
        result.current.setCreateNotebookModal(true)
      })
      
      expect(result.current.createNotebookModal).toBe(true)
      
      act(() => {
        result.current.setCreateNotebookModal(false)
      })
      
      expect(result.current.createNotebookModal).toBe(false)
    })
  })

  describe('Edge cases', () => {
    it('should handle empty tag name', () => {
      const { result } = renderHook(() => useSidebarState())
      
      act(() => {
        result.current.handleTagRightClick(createMouseEvent(100, 100), '')
      })
      
      expect(result.current.tagContextMenu.tagName).toBe('')
      expect(result.current.tagContextMenu.isVisible).toBe(true)
    })

    it('should handle null notebook gracefully', () => {
      const { result } = renderHook(() => useSidebarState())
      
      act(() => {
        result.current.handleNotebookRightClick(createMouseEvent(100, 100), null as any)
      })
      
      expect(result.current.notebookContextMenu.notebook).toBe(null)
      expect(result.current.notebookContextMenu.isVisible).toBe(true)
    })

    it('should handle editing empty notebook name', () => {
      const { result } = renderHook(() => useSidebarState())
      
      act(() => {
        result.current.startEditingNotebook('nb1', '')
      })
      
      expect(result.current.editValue).toBe('')
    })

    it('should handle rapid context menu switches', () => {
      const { result } = renderHook(() => useSidebarState())
      
      act(() => {
        result.current.handleTagRightClick(createMouseEvent(100, 100), 'tag1')
        result.current.handleNotebookRightClick(createMouseEvent(200, 200), mockNotebook)
        result.current.handleTrashRightClick(createMouseEvent(300, 300))
      })
      
      // All should be visible
      expect(result.current.tagContextMenu.isVisible).toBe(true)
      expect(result.current.notebookContextMenu.isVisible).toBe(true)
      expect(result.current.trashContextMenu.isVisible).toBe(true)
    })
  })

  describe('Method stability', () => {
    it('should provide stable method references', () => {
      const { result, rerender } = renderHook(() => useSidebarState())
      
      const initialMethods = {
        handleTagRightClick: result.current.handleTagRightClick,
        handleNotebookRightClick: result.current.handleNotebookRightClick,
        handleTrashRightClick: result.current.handleTrashRightClick,
        closeAllContextMenus: result.current.closeAllContextMenus,
        toggleNotebookExpansion: result.current.toggleNotebookExpansion,
        startEditingNotebook: result.current.startEditingNotebook,
        cancelEditingNotebook: result.current.cancelEditingNotebook
      }
      
      rerender()
      
      expect(result.current.handleTagRightClick).toBe(initialMethods.handleTagRightClick)
      expect(result.current.handleNotebookRightClick).toBe(initialMethods.handleNotebookRightClick)
      expect(result.current.handleTrashRightClick).toBe(initialMethods.handleTrashRightClick)
      expect(result.current.closeAllContextMenus).toBe(initialMethods.closeAllContextMenus)
      expect(result.current.toggleNotebookExpansion).toBe(initialMethods.toggleNotebookExpansion)
      expect(result.current.startEditingNotebook).toBe(initialMethods.startEditingNotebook)
      expect(result.current.cancelEditingNotebook).toBe(initialMethods.cancelEditingNotebook)
    })
  })

  describe('Integration scenarios', () => {
    it('should handle complete notebook workflow', () => {
      const { result } = renderHook(() => useSidebarState())
      
      // Expand notebook
      act(() => {
        result.current.toggleNotebookExpansion('nb1')
      })
      
      expect(result.current.expandedNotebooks.has('nb1')).toBe(true)
      
      // Right click on notebook
      act(() => {
        result.current.handleNotebookRightClick(createMouseEvent(100, 100), mockNotebook)
      })
      
      expect(result.current.notebookContextMenu.isVisible).toBe(true)
      
      // Start editing (simulating context menu action)
      act(() => {
        result.current.startEditingNotebook('nb1', 'Old Name')
        result.current.closeAllContextMenus()
      })
      
      expect(result.current.editingNotebook).toBe('nb1')
      expect(result.current.notebookContextMenu.isVisible).toBe(false)
      
      // Update name
      act(() => {
        result.current.setEditValue('New Name')
      })
      
      expect(result.current.editValue).toBe('New Name')
      
      // Cancel editing
      act(() => {
        result.current.cancelEditingNotebook()
      })
      
      expect(result.current.editingNotebook).toBe(null)
      expect(result.current.editValue).toBe('')
    })

    it('should handle tag settings workflow', () => {
      const { result } = renderHook(() => useSidebarState())
      
      // Right click on tag
      act(() => {
        result.current.handleTagRightClick(createMouseEvent(100, 100), 'important')
      })
      
      expect(result.current.tagContextMenu.isVisible).toBe(true)
      expect(result.current.tagContextMenu.tagName).toBe('important')
      
      // Open tag settings modal (simulating context menu action)
      act(() => {
        result.current.setTagSettingsModal({ show: true, tagName: 'important' })
        result.current.closeAllContextMenus()
      })
      
      expect(result.current.tagSettingsModal.show).toBe(true)
      expect(result.current.tagSettingsModal.tagName).toBe('important')
      expect(result.current.tagContextMenu.isVisible).toBe(false)
    })
  })
})