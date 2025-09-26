import type { StateCreator } from 'zustand'

export interface AppStateSlice {
  // App state
  isLoading: boolean
  error: string | null
  isInitialized: boolean
  lastActivity: string | null

  // App state actions
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setInitialized: (initialized: boolean) => void
  updateLastActivity: () => void
  clearError: () => void
  resetAppState: () => void
}

export const createAppStateSlice: StateCreator<AppStateSlice> = set => ({
  // Initial state
  isLoading: false,
  error: null,
  isInitialized: false,
  lastActivity: null,

  // Actions
  setLoading: isLoading => set({ isLoading }),
  setError: error => set({ error }),
  setInitialized: isInitialized => set({ isInitialized }),

  updateLastActivity: () => set({ lastActivity: new Date().toISOString() }),

  clearError: () => set({ error: null }),

  resetAppState: () =>
    set({
      isLoading: false,
      error: null,
      isInitialized: false,
      lastActivity: null,
    }),
})
