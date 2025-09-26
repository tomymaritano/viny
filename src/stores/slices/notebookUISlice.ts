/**
 * Notebook UI Slice - UI state only, no data
 * Data is managed by TanStack Query
 */

import { StateCreator } from 'zustand'

export interface NotebookUISlice {
  // Expanded notebooks in sidebar
  expandedNotebooks: Set<string>
  toggleNotebookExpanded: (notebookId: string) => void
  expandNotebook: (notebookId: string) => void
  collapseNotebook: (notebookId: string) => void
  expandAllNotebooks: () => void
  collapseAllNotebooks: () => void
  
  // Notebook being edited
  editingNotebookId: string | null
  startEditingNotebook: (notebookId: string) => void
  stopEditingNotebook: () => void
  
  // Notebook being created
  isCreatingNotebook: boolean
  parentNotebookId: string | null
  startCreatingNotebook: (parentId?: string) => void
  stopCreatingNotebook: () => void
  
  // Drag and drop state
  draggingNotebookId: string | null
  dragOverNotebookId: string | null
  setDraggingNotebook: (notebookId: string | null) => void
  setDragOverNotebook: (notebookId: string | null) => void
  
  // Context menu state
  contextMenuNotebookId: string | null
  setContextMenuNotebook: (notebookId: string | null) => void
}

export const createNotebookUISlice: StateCreator<NotebookUISlice> = (set, get) => ({
  // Expanded notebooks in sidebar
  expandedNotebooks: new Set(['default']), // Default notebook starts expanded
  toggleNotebookExpanded: (notebookId) => set((state) => {
    const expanded = new Set(state.expandedNotebooks)
    if (expanded.has(notebookId)) {
      expanded.delete(notebookId)
    } else {
      expanded.add(notebookId)
    }
    return { expandedNotebooks: expanded }
  }),
  expandNotebook: (notebookId) => set((state) => {
    const expanded = new Set(state.expandedNotebooks)
    expanded.add(notebookId)
    return { expandedNotebooks: expanded }
  }),
  collapseNotebook: (notebookId) => set((state) => {
    const expanded = new Set(state.expandedNotebooks)
    expanded.delete(notebookId)
    return { expandedNotebooks: expanded }
  }),
  expandAllNotebooks: () => set((state) => {
    // This would need notebook IDs from TanStack Query
    // For now, just expand common ones
    const expanded = new Set(['default', ...state.expandedNotebooks])
    return { expandedNotebooks: expanded }
  }),
  collapseAllNotebooks: () => set({
    expandedNotebooks: new Set(),
  }),
  
  // Notebook being edited
  editingNotebookId: null,
  startEditingNotebook: (notebookId) => set({
    editingNotebookId: notebookId,
  }),
  stopEditingNotebook: () => set({
    editingNotebookId: null,
  }),
  
  // Notebook being created
  isCreatingNotebook: false,
  parentNotebookId: null,
  startCreatingNotebook: (parentId) => set({
    isCreatingNotebook: true,
    parentNotebookId: parentId || null,
  }),
  stopCreatingNotebook: () => set({
    isCreatingNotebook: false,
    parentNotebookId: null,
  }),
  
  // Drag and drop state
  draggingNotebookId: null,
  dragOverNotebookId: null,
  setDraggingNotebook: (notebookId) => set({
    draggingNotebookId: notebookId,
  }),
  setDragOverNotebook: (notebookId) => set({
    dragOverNotebookId: notebookId,
  }),
  
  // Context menu state
  contextMenuNotebookId: null,
  setContextMenuNotebook: (notebookId) => set({
    contextMenuNotebookId: notebookId,
  }),
})