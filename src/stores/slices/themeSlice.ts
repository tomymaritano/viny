import { StateCreator } from 'zustand'
import { storageService } from '../../lib/storage'
import { storageLogger as logger } from '../../utils/logger'

export interface ThemeSlice {
  // Theme state
  theme: string
  tagColors: Record<string, string>

  // Theme actions
  setTheme: (theme: string) => void
  setTagColor: (tag: string, color: string) => void
  getTagColor: (tag: string) => string
  resetTagColors: () => void
  loadTagColors: () => Promise<void>
}

// Predefined tag color mappings
const predefinedTagColors = {
  'project': 'ocean',
  'work': 'steel',
  'personal': 'forest',
  'urgent': 'cherry',
  'important': 'sunset',
  'idea': 'golden',
  'note': 'sage',
  'todo': 'royal',
  'meeting': 'turquoise',
  'draft': 'lavender'
} as const

// Available color options for automatic assignment
const colorOptions = [
  'ocean', 'forest', 'royal', 'sunset', 'cherry', 'golden', 
  'lavender', 'turquoise', 'rose', 'sage', 'steel', 'copper'
] as const

// Hash function for consistent color assignment
const hashTagToColor = (tag: string): string => {
  let hash = 0
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash)
  }
  const colorIndex = Math.abs(hash) % colorOptions.length
  return colorOptions[colorIndex]
}

export const createThemeSlice: StateCreator<ThemeSlice, [], [], ThemeSlice> = (set, get) => ({
  // Initial state
  theme: 'dark',
  tagColors: storageService.getTagColors(),

  // Actions
  setTheme: (theme) => set({ theme }),

  setTagColor: (tag, color) => {
    set((state) => {
      const newTagColors = { ...state.tagColors, [tag]: color }
      // Persist to localStorage
      storageService.saveTagColors(newTagColors)
      return { tagColors: newTagColors }
    })
  },

  getTagColor: (tag) => {
    const state = get()
    
    // Return stored color if available
    if (state.tagColors[tag]) {
      return state.tagColors[tag]
    }
    
    // Check predefined colors
    const lowerTag = tag.toLowerCase()
    if (predefinedTagColors[lowerTag as keyof typeof predefinedTagColors]) {
      return predefinedTagColors[lowerTag as keyof typeof predefinedTagColors]
    }
    
    // Generate color based on tag hash for consistency
    return hashTagToColor(tag)
  },

  resetTagColors: () => {
    set({ tagColors: {} })
    storageService.saveTagColors({})
  },

  loadTagColors: async () => {
    try {
      const currentState = get()
      const currentTagColors = currentState.tagColors
      
      const loadedTagColors = await storageService.loadTagColors()
      
      // Only update if async data has more recent/complete data
      // If current state already has data, keep it (it was loaded synchronously)
      if (Object.keys(currentTagColors).length > 0) {
        return
      }
      
      // Only set if we got data from async load
      if (Object.keys(loadedTagColors).length > 0) {
        set({ tagColors: loadedTagColors })
      }
    } catch (error) {
      logger.error('Failed to load tag colors:', error)
    }
  }
})