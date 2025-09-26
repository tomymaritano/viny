import type { StateCreator } from 'zustand'

export interface FilterState {
  notebookFilter: string | null // Notebook ID to filter by
  focusedNotebookId: string | null // Notebook ID for focus mode (detail view)
  tagFilters: string[] // Tags to filter by
  statusFilter: string | null // Status to filter by
  searchQuery: string // Search query
  dateRange: {
    start: Date | null
    end: Date | null
  } | null
}

export interface FilterSlice extends FilterState {
  // Actions
  setNotebookFilter: (notebookId: string | null) => void
  setFocusedNotebook: (notebookId: string | null) => void
  addTagFilter: (tag: string) => void
  removeTagFilter: (tag: string) => void
  clearTagFilters: () => void
  setStatusFilter: (status: string | null) => void
  setSearchQuery: (query: string) => void
  setDateRange: (range: { start: Date | null; end: Date | null } | null) => void
  clearAllFilters: () => void
  exitFocusMode: () => void

  // Computed
  hasActiveFilters: () => boolean
  getActiveFilterCount: () => number
  isInFocusMode: () => boolean
}

export const createFilterSlice: StateCreator<FilterSlice> = (set, get) => ({
  // Initial state
  notebookFilter: null,
  focusedNotebookId: null,
  tagFilters: [],
  statusFilter: null,
  searchQuery: '',
  dateRange: null,

  // Actions
  setNotebookFilter: notebookId => set({ notebookFilter: notebookId }),

  setFocusedNotebook: notebookId => set({ focusedNotebookId: notebookId }),

  addTagFilter: tag =>
    set(state => ({
      tagFilters: [...state.tagFilters, tag],
    })),

  removeTagFilter: tag =>
    set(state => ({
      tagFilters: state.tagFilters.filter(t => t !== tag),
    })),

  clearTagFilters: () => set({ tagFilters: [] }),

  setStatusFilter: status => set({ statusFilter: status }),

  setSearchQuery: query => set({ searchQuery: query }),

  setDateRange: range => set({ dateRange: range }),

  clearAllFilters: () =>
    set({
      notebookFilter: null,
      focusedNotebookId: null,
      tagFilters: [],
      statusFilter: null,
      searchQuery: '',
      dateRange: null,
    }),

  exitFocusMode: () => set({ focusedNotebookId: null }),

  // Computed
  hasActiveFilters: () => {
    const state = get()
    return !!(
      state.notebookFilter ||
      state.tagFilters.length > 0 ||
      state.statusFilter ||
      state.searchQuery ||
      state.dateRange
    )
  },

  getActiveFilterCount: () => {
    const state = get()
    let count = 0
    if (state.notebookFilter) count++
    if (state.tagFilters.length > 0) count += state.tagFilters.length
    if (state.statusFilter) count++
    if (state.searchQuery) count++
    if (state.dateRange) count++
    return count
  },

  isInFocusMode: () => {
    const state = get()
    return state.focusedNotebookId !== null
  },
})
