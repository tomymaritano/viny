// Hook for all sidebar-related logic and computations
import { useMemo, useCallback } from 'react'
import { useAppStore, getStats } from '../stores/appStoreFixed'
import { useNotebooks } from './useNotebooks'

interface SidebarSection {
  id: string
  label: string
  count?: number
  icon: React.ReactNode
  color?: string
}

export const useSidebarLogic = () => {
  const {
    notes,
    activeSection,
    setActiveSection
  } = useAppStore(state => ({
    notes: state.notes,
    activeSection: state.activeSection,
    setActiveSection: state.setActiveSection
  }))

  const {
    expandedSections,
    toggleSection
  } = useAppStore(state => ({
    expandedSections: state.expandedSections,
    toggleSection: state.toggleSection
  }))

  const { notebooks, getColorClass } = useNotebooks()

  // Memoized stats
  const stats = useMemo(() => getStats(notes), [notes])

  // Memoized notebooks with counts
  const notebooksWithCounts = useMemo(() => {
    const notebookCounts = notes.reduce((acc, note) => {
      if (!note.isTrashed) {
        const notebook = note.notebook
        acc[notebook] = (acc[notebook] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    return notebooks
      .map(notebook => ({
        ...notebook,
        count: notebookCounts[notebook.name] || 0,
      }))
      .sort((a, b) => b.count - a.count)
  }, [notes, notebooks])

  // Memoized tags with counts
  const tagsWithCounts = useMemo(() => {
    const tagCounts = notes.reduce((acc, note) => {
      if (!note.isTrashed && note.tags && Array.isArray(note.tags)) {
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

  // Memoized main sections
  const mainSections = useMemo<SidebarSection[]>(() => [
    {
      id: 'all-notes',
      label: 'All Notes',
      count: stats.total,
      icon: 'FileText',
    },
    {
      id: 'pinned',
      label: 'Pinned',
      count: stats.pinned,
      icon: 'Star',
    },
  ], [stats])

  // Memoized status sections
  const statusSections = useMemo<SidebarSection[]>(() => [
    {
      id: 'status-active',
      label: 'Active',
      count: stats.byStatus.active,
      icon: 'Circle',
      color: 'text-theme-accent-green',
    },
    {
      id: 'status-on-hold',
      label: 'On Hold',
      count: stats.byStatus['on-hold'],
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
      id: 'status-dropped',
      label: 'Dropped',
      count: stats.byStatus.dropped,
      icon: 'XCircle',
      color: 'text-theme-accent-red',
    },
  ], [stats])

  // Memoized system sections
  const systemSections = useMemo<SidebarSection[]>(() => [
    {
      id: 'trash',
      label: 'Trash',
      count: stats.trashed,
      icon: 'Trash',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: 'Settings',
    },
  ], [stats])

  // Event handlers
  const handleSectionClick = useCallback((sectionId: string) => {
    setActiveSection(sectionId)
  }, [setActiveSection])

  const handleToggleSection = useCallback((section: string) => {
    toggleSection(section)
  }, [toggleSection])

  const handleManageNotebooks = useCallback(() => {
    // TODO: Implement with store
    console.log('Manage notebooks')
  }, [])

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
    handleManageNotebooks
  }
}