import { useMemo, useCallback } from 'react'
import { useAppStore } from '../stores/newSimpleStore'
import { useNotebooks } from './useNotebooks'
import { getNotebookWithCounts } from '../utils/notebookTree'
import { getStats } from './useSimpleLogic' // Import existing stats function


/**
 * Hook for sidebar-specific logic
 * Handles navigation, sections, and sidebar UI state
 */
export const useSidebarLogic = () => {
  const { 
    notes, 
    activeSection, 
    expandedSections,
    setActiveSection,
    setExpandedSection,
    setModal
  } = useAppStore()
  
  const { 
    notebooks, 
    getColorClass, 
    createNotebook, 
    updateNotebook, 
    deleteNotebook, 
    moveNotebook, 
    getRootNotebooks, 
    getNotebookChildren 
  } = useNotebooks()

  // Calculate stats for section counts
  const stats = useMemo(() => getStats(notes), [notes])

  // Calculate notebooks with note counts
  const notebooksWithCounts = useMemo(() => {
    return getNotebookWithCounts(notebooks, notes)
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [notes, notebooks])

  // Calculate tags with counts (top 10)
  const tagsWithCounts = useMemo(() => {
    const tagCounts = notes.reduce((acc, note) => {
      if (!note.isTrashed && !['completed', 'archived'].includes(note.status) && note.tags) {
        note.tags.forEach(tag => {
          acc[tag] = (acc[tag] || 0) + 1
        })
      }
      return acc
    }, {} as Record<string, number>)

    return Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
  }, [notes])

  // Main navigation sections
  const mainSections = useMemo(() => [
    { id: 'all-notes', label: 'All Notes', count: stats.total, icon: 'NotebookText' },
    { id: 'pinned', label: 'Pinned', count: stats.pinned, icon: 'Pin' },
  ], [stats])

  // Status-based sections
  const statusSections = useMemo(() => [
    { 
      id: 'status-draft', 
      label: 'Draft', 
      count: stats.byStatus.draft || 0, 
      icon: 'FileText', 
      color: 'text-theme-text-secondary' 
    },
    { 
      id: 'status-in-progress', 
      label: 'In Progress', 
      count: stats.byStatus['in-progress'], 
      icon: 'Circle', 
      color: 'text-theme-accent-blue' 
    },
    { 
      id: 'status-review', 
      label: 'Review', 
      count: stats.byStatus.review, 
      icon: 'Clock', 
      color: 'text-theme-accent-yellow' 
    },
    { 
      id: 'status-completed', 
      label: 'Completed', 
      count: stats.byStatus.completed, 
      icon: 'CheckCircle', 
      color: 'text-theme-accent-green' 
    },
    { 
      id: 'status-archived', 
      label: 'Archived', 
      count: stats.byStatus.archived, 
      icon: 'XCircle', 
      color: 'text-theme-accent-red' 
    },
  ], [stats])

  // System sections (trash, etc.)
  const systemSections = useMemo(() => [
    { id: 'trash', label: 'Trash', count: stats.trashed, icon: 'Trash' },
  ], [stats])

  /**
   * Handles section navigation and special actions
   */
  const handleSectionClick = useCallback((sectionId: string) => {
    if (sectionId === 'settings') {
      // Always open settings as modal
      setModal('settings', true)
    } else {
      setActiveSection(sectionId)
    }
  }, [setActiveSection, setModal])

  /**
   * Toggles expanded state of sidebar sections
   */
  const handleToggleSection = useCallback((section: string) => {
    const newState = !expandedSections[section as keyof typeof expandedSections]
    setExpandedSection(section, newState)
  }, [expandedSections, setExpandedSection])

  /**
   * Dedicated settings handler
   */
  const handleSettingsClick = useCallback(() => {
    // Check if we're in Electron
    if ((window as any).electronAPI?.isElectron) {
      // Open settings in new window
      (window as any).electronAPI.openSettings()
    } else {
      // Fallback to modal for web version
      setModal('settings', true)
    }
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
    tagsWithCounts,

    // Utilities
    getColorClass,

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

    // Stats for external use
    stats
  }
}