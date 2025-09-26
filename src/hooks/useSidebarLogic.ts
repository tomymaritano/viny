import { useMemo, useCallback } from 'react'
import { useAppStore } from '../stores/newSimpleStore'
import { useNotebooks } from './useNotebooks'
import { getNotebookWithCounts } from '../utils/notebookTree'
import { getStats } from '../utils/statsUtils' // Import from utils to avoid circular dependency
// Removed pluginService import - plugins only in settings

/**
 * Hook for sidebar-specific logic
 * Handles navigation, sections, and sidebar UI state
 */
export const useSidebarLogic = (focusedNotebookId?: string | null) => {
  const {
    notes,
    activeSection,
    expandedSections,
    setActiveSection,
    setExpandedSection,
    setModal,
  } = useAppStore()

  const {
    notebooks: treeNotebooks,
    createNotebook,
    updateNotebook,
    deleteNotebook,
    moveNotebook,
    getRootNotebooks,
    getNotebookChildren,
    getNotebook,
    getFlattenedNotebooks,
  } = useNotebooks()

  // Use flattened notebooks for getNotebookWithCounts
  const flatNotebooks = getFlattenedNotebooks()
  
  // Debug: Log notebook data
  console.log('🔍 SidebarLogic Debug:', {
    treeNotebooks: treeNotebooks,
    flatNotebooks: flatNotebooks,
    flatNotebooksCount: flatNotebooks.length,
    rootNotebooks: getRootNotebooks(),
    rootNotebooksCount: getRootNotebooks().length,
    allNotebooksTree: flatNotebooks.map(nb => ({
      name: nb.name,
      parentId: nb.parentId || 'ROOT',
      hasChildren: nb.children && nb.children.length > 0
    })),
    expandedSections: expandedSections,
    activeSection: activeSection
  })

  // Filter notes based on focused notebook
  const filteredNotes = useMemo(() => {
    if (!focusedNotebookId) {
      return notes
    }

    // Get the focused notebook
    const focusedNotebook = getNotebook(focusedNotebookId)
    if (!focusedNotebook) {
      return notes
    }

    // Get all child notebooks
    const childNotebooks = getNotebookChildren(focusedNotebookId)
    const allNotebookNames = [
      focusedNotebook.name,
      ...childNotebooks.map(nb => nb.name),
    ]

    // Filter notes that belong to the focused notebook or its children
    return notes.filter(note =>
      allNotebookNames.some(
        nbName => nbName.toLowerCase() === note.notebook.toLowerCase()
      )
    )
  }, [focusedNotebookId, notes, getNotebook, getNotebookChildren])

  // Calculate stats for section counts (now based on filtered notes)
  const stats = useMemo(() => getStats(filteredNotes), [filteredNotes])

  // Calculate notebooks with note counts
  const allNotebooksWithCounts = useMemo(() => {
    return getNotebookWithCounts(flatNotebooks, filteredNotes)
  }, [filteredNotes, flatNotebooks])

  // Get only root notebooks for display
  const notebooksWithCounts = useMemo(() => {
    // First, check if we have any root notebooks
    const rootNotebooks = allNotebooksWithCounts.filter(nb => !nb.parentId)
    
    console.log('📁 Notebook filtering:', {
      allCount: allNotebooksWithCounts.length,
      rootCount: rootNotebooks.length,
      allNotebooks: allNotebooksWithCounts.map(nb => ({
        id: nb.id,
        name: nb.name,
        parentId: nb.parentId,
        totalCount: nb.totalCount
      }))
    })
    
    // If no root notebooks exist, show all notebooks as a fallback
    if (rootNotebooks.length === 0 && allNotebooksWithCounts.length > 0) {
      console.warn('⚠️ No root notebooks found! Showing all notebooks as fallback')
      return allNotebooksWithCounts.sort((a, b) => a.name.localeCompare(b.name))
    }
    
    return rootNotebooks.sort((a, b) => a.name.localeCompare(b.name))
  }, [allNotebooksWithCounts])

  // Optimized tag calculation with early filtering and batch processing
  const tagsWithCounts = useMemo(() => {
    // Pre-filter notes to reduce iteration
    const activeNotes = filteredNotes.filter(
      note =>
        !note.isTrashed &&
        !['completed', 'archived'].includes(note.status) &&
        note.tags?.length > 0
    )

    // Use Map for O(1) lookups instead of object property access
    const tagCountsMap = new Map<string, number>()

    // Batch process tags
    for (const note of activeNotes) {
      for (const tag of note.tags) {
        tagCountsMap.set(tag, (tagCountsMap.get(tag) || 0) + 1)
      }
    }

    // Convert to array and sort only once
    return Array.from(tagCountsMap.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
  }, [filteredNotes])

  // Main navigation sections
  const mainSections = useMemo(
    () => [
      {
        id: 'all-notes',
        label: 'All Notes',
        count: stats.total,
        icon: 'NotebookText',
      },
      { id: 'pinned', label: 'Pinned', count: stats.pinned, icon: 'Pin' },
    ],
    [stats]
  )

  // Status-based sections
  const statusSections = useMemo(
    () => [
      {
        id: 'status-draft',
        label: 'Draft',
        count: stats.byStatus.draft || 0,
        icon: 'FileText',
        color: 'text-theme-text-secondary',
      },
      {
        id: 'status-in-progress',
        label: 'In Progress',
        count: stats.byStatus['in-progress'],
        icon: 'Circle',
        color: 'text-theme-accent-blue',
      },
      {
        id: 'status-review',
        label: 'Review',
        count: stats.byStatus.review,
        icon: 'Clock',
        color: 'text-theme-accent-yellow',
      },
      {
        id: 'status-completed',
        label: 'Completed',
        count: stats.byStatus.completed,
        icon: 'CheckCircle',
        color: 'text-theme-accent-green',
      },
      {
        id: 'status-archived',
        label: 'Archived',
        count: stats.byStatus.archived,
        icon: 'XCircle',
        color: 'text-theme-accent-red',
      },
    ],
    [stats]
  )

  // Plugin sections - REMOVED: plugins should only be in settings, not main sidebar

  // System sections (trash, etc.)
  const systemSections = useMemo(
    () => [
      { id: 'trash', label: 'Trash', count: stats.trashed, icon: 'Trash' },
    ],
    [stats]
  )

  /**
   * Handles section navigation and special actions
   */
  const handleSectionClick = useCallback(
    (sectionId: string) => {
      console.log('🔴 handleSectionClick called with:', sectionId)
      if (sectionId === 'settings') {
        // Open settings modal
        setModal('settings', true)
      } else {
        console.log('🔴 Setting active section to:', sectionId)
        setActiveSection(sectionId)
        // Log current state after setting
        setTimeout(() => {
          console.log('🔴 Active section after update:', sectionId)
        }, 100)
      }
    },
    [setActiveSection, setModal]
  )

  /**
   * Toggles expanded state of sidebar sections
   */
  const handleToggleSection = useCallback(
    (section: string) => {
      const newState =
        !expandedSections[section as keyof typeof expandedSections]
      setExpandedSection(section, newState)
    },
    [expandedSections, setExpandedSection]
  )

  /**
   * Dedicated settings handler
   */
  const handleSettingsClick = useCallback(() => {
    // Open settings modal
    setModal('settings', true)
  }, [setModal])

  /**
   * Handle notebook-related actions
   */

  return {
    // State
    activeSection,
    expandedSections,
    notes,

    // Computed sections
    mainSections,
    statusSections,
    systemSections,
    notebooksWithCounts,
    allNotebooksWithCounts,
    tagsWithCounts,

    // Actions
    handleSectionClick,
    handleToggleSection,
    handleSettingsClick,

    // Notebook actions
    createNotebook,
    updateNotebook,
    deleteNotebook,
    moveNotebook,
    getRootNotebooks,
    getNotebookChildren,
    getNotebook,

    // Stats for external use
    stats,
  }
}
