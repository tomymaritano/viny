import type { StateCreator } from 'zustand'

export interface NavigationSlice {
  // Navigation state
  activeSection: string
  expandedSections: {
    notebooks: boolean
    status: boolean
    tags: boolean
  }

  // Navigation actions
  setActiveSection: (section: string) => void
  setExpandedSection: (section: string, expanded: boolean) => void
  toggleExpandedSection: (section: string) => void
  expandAllSections: () => void
  collapseAllSections: () => void
}

export const createNavigationSlice: StateCreator<NavigationSlice> = set => ({
  // Initial state
  activeSection: 'all-notes',
  expandedSections: {
    notebooks: true,
    status: false,
    tags: false,
  },

  // Actions
  setActiveSection: activeSection => set({ activeSection }),

  setExpandedSection: (section, expanded) =>
    set(state => ({
      expandedSections: { ...state.expandedSections, [section]: expanded },
    })),

  toggleExpandedSection: section =>
    set(state => ({
      expandedSections: {
        ...state.expandedSections,
        [section]:
          !state.expandedSections[
            section as keyof typeof state.expandedSections
          ],
      },
    })),

  expandAllSections: () =>
    set({
      expandedSections: {
        notebooks: true,
        status: true,
        tags: true,
      },
    }),

  collapseAllSections: () =>
    set({
      expandedSections: {
        notebooks: false,
        status: false,
        tags: false,
      },
    }),
})
