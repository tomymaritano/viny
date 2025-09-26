import type { StateCreator } from 'zustand'

export interface SearchSlice {
  // Search state
  searchQuery: string
  filterTags: string[]
  searchHistory: string[]
  maxHistoryItems: number

  // Search actions
  setSearchQuery: (query: string) => void
  setFilterTags: (tags: string[]) => void
  addTagToFilter: (tag: string) => void
  removeTagFromFilter: (tag: string) => void
  clearFilterTags: () => void
  addToSearchHistory: (query: string) => void
  clearSearchHistory: () => void
  clearSearch: () => void
}

export const createSearchSlice: StateCreator<SearchSlice> = set => ({
  // Initial state
  searchQuery: '',
  filterTags: [],
  searchHistory: [],
  maxHistoryItems: 10,

  // Actions
  setSearchQuery: searchQuery => set({ searchQuery }),
  setFilterTags: filterTags => set({ filterTags }),

  addTagToFilter: tag =>
    set(state => ({
      filterTags: state.filterTags.includes(tag)
        ? state.filterTags
        : [...state.filterTags, tag],
    })),

  removeTagFromFilter: tag =>
    set(state => ({
      filterTags: state.filterTags.filter(t => t !== tag),
    })),

  clearFilterTags: () => set({ filterTags: [] }),

  addToSearchHistory: query =>
    set(state => {
      if (!query.trim() || state.searchHistory.includes(query)) {
        return state
      }

      const newHistory = [
        query,
        ...state.searchHistory.filter(h => h !== query),
      ].slice(0, state.maxHistoryItems)

      return { searchHistory: newHistory }
    }),

  clearSearchHistory: () => set({ searchHistory: [] }),

  clearSearch: () =>
    set({
      searchQuery: '',
      filterTags: [],
    }),
})
