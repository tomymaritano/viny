/**
 * Note UI Slice - UI state only, no data
 * Data is managed by TanStack Query
 */

import { StateCreator } from 'zustand'

export interface NoteUISlice {
  // Selected note
  selectedNoteId: string | null
  setSelectedNoteId: (id: string | null) => void
  
  // Editor state
  isEditorOpen: boolean
  openEditor: (noteId?: string) => void
  closeEditor: () => void
  
  // Sort preferences
  sortBy: 'title' | 'updatedAt' | 'createdAt'
  sortDirection: 'asc' | 'desc'
  setSortBy: (sortBy: 'title' | 'updatedAt' | 'createdAt') => void
  setSortDirection: (direction: 'asc' | 'desc') => void
  toggleSortDirection: () => void
  
  // View preferences
  viewMode: 'list' | 'grid' | 'compact'
  setViewMode: (mode: 'list' | 'grid' | 'compact') => void
  
  // Temporary UI states
  isDragging: boolean
  setIsDragging: (dragging: boolean) => void
  
  // Multi-select
  selectedNoteIds: Set<string>
  toggleNoteSelection: (id: string) => void
  clearSelection: () => void
  selectAll: (noteIds: string[]) => void
}

export const createNoteUISlice: StateCreator<NoteUISlice> = (set) => ({
  // Selected note
  selectedNoteId: null,
  setSelectedNoteId: (id) => set({ selectedNoteId: id }),
  
  // Editor state
  isEditorOpen: false,
  openEditor: (noteId) => set((state) => ({
    isEditorOpen: true,
    selectedNoteId: noteId || state.selectedNoteId,
  })),
  closeEditor: () => set({ isEditorOpen: false }),
  
  // Sort preferences
  sortBy: 'updatedAt',
  sortDirection: 'desc',
  setSortBy: (sortBy) => set({ sortBy }),
  setSortDirection: (direction) => set({ sortDirection: direction }),
  toggleSortDirection: () => set((state) => ({
    sortDirection: state.sortDirection === 'asc' ? 'desc' : 'asc',
  })),
  
  // View preferences
  viewMode: 'list',
  setViewMode: (mode) => set({ viewMode: mode }),
  
  // Temporary UI states
  isDragging: false,
  setIsDragging: (dragging) => set({ isDragging: dragging }),
  
  // Multi-select
  selectedNoteIds: new Set(),
  toggleNoteSelection: (id) => set((state) => {
    const newSelection = new Set(state.selectedNoteIds)
    if (newSelection.has(id)) {
      newSelection.delete(id)
    } else {
      newSelection.add(id)
    }
    return { selectedNoteIds: newSelection }
  }),
  clearSelection: () => set({ selectedNoteIds: new Set() }),
  selectAll: (noteIds) => set({ selectedNoteIds: new Set(noteIds) }),
})