/**
 * SidebarLogicProviderV2 - Clean Architecture Implementation
 * Provides sidebar context using TanStack Query and services
 */

import type { ReactNode } from 'react'
import React, { createContext, useContext, useMemo } from 'react'
import { useNavigationStore, useNotebookUI, useModalStore } from '../../stores/cleanUIStore'
import { 
  useActiveNotesQueryV2,
  useTrashedNotesQueryV2,
  useCreateNoteMutationV2,
  useEmptyTrashMutationV2,
} from '../../hooks/queries/useNotesServiceQueryV2'
import {
  useNotebooksWithCountsQueryV2,
  useNotebookTreeQueryV2,
  useCreateNotebookMutationV2,
  useUpdateNotebookMutationV2,
  useDeleteNotebookMutationV2,
  useMoveNotebookMutationV2,
} from '../../hooks/queries/useNotebooksServiceQueryV2'
import { getCustomTagColor } from '../../utils/customTagColors'
import { useSettingsQuery } from '../../hooks/queries'
import type { Note, Notebook } from '../../types'

interface SidebarContextType {
  // Navigation
  activeSection: string
  handleSectionClick: (section: string) => void
  
  // Notebooks
  notebookTree: any[]
  notebooksWithCounts: any[]
  isLoadingNotebooks: boolean
  createNotebook: (data: any) => void
  updateNotebook: (id: string, data: any) => void
  deleteNotebook: (id: string) => void
  moveNotebook: (id: string, parentId: string | null) => void
  getNotebook: (id: string) => Notebook | undefined
  
  // Notebook UI
  expandedNotebooks: Set<string>
  toggleNotebookExpanded: (id: string) => void
  
  // Notes
  notes: Note[]
  trashedNotes: Note[]
  isLoadingNotes: boolean
  
  // Tags
  tagsWithCounts: any[]
  getTagColor: (tag: string) => {
    bg: string
    border: string
    text: string
    name: string
  }
  
  // Actions
  createNewNote: (notebookId?: string) => void
  handleEmptyTrash: () => void
  handleSettingsClick: () => void
  
  // Sections
  mainSections: any[]
  statusSections: any[]
  systemSections: any[]
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export const useSidebarContext = () => {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebarContext must be used within a SidebarLogicProviderV2')
  }
  return context
}

interface SidebarLogicProviderV2Props {
  children: ReactNode
}

const SidebarLogicProviderV2: React.FC<SidebarLogicProviderV2Props> = ({ children }) => {
  // UI State
  const { activeSection, setActiveSection } = useNavigationStore()
  const { expandedNotebooks, toggleNotebookExpanded } = useNotebookUI()
  const { openModal } = useModalStore()
  
  // Data Queries
  const { data: activeNotes = [], isLoading: isLoadingNotes } = useActiveNotesQueryV2()
  const { data: trashedNotes = [] } = useTrashedNotesQueryV2()
  const { data: notebookTree = [], isLoading: isLoadingNotebooks } = useNotebookTreeQueryV2()
  const { data: notebooksWithCounts = [] } = useNotebooksWithCountsQueryV2()
  const { data: settings } = useSettingsQuery()
  
  // Mutations
  const createNoteMutation = useCreateNoteMutationV2()
  const emptyTrashMutation = useEmptyTrashMutationV2()
  const createNotebookMutation = useCreateNotebookMutationV2()
  const updateNotebookMutation = useUpdateNotebookMutationV2()
  const deleteNotebookMutation = useDeleteNotebookMutationV2()
  const moveNotebookMutation = useMoveNotebookMutationV2()
  
  // Calculate tags with counts
  const tagsWithCounts = useMemo(() => {
    const tagCounts = new Map<string, number>()
    
    activeNotes.forEach(note => {
      note.tags?.forEach(tag => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)
      })
    })
    
    return Array.from(tagCounts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
  }, [activeNotes])
  
  // Calculate stats for sections
  const stats = useMemo(() => {
    const stats = {
      total: activeNotes.length,
      pinned: activeNotes.filter(n => n.isPinned).length,
      trashed: trashedNotes.length,
      byStatus: {
        draft: activeNotes.filter(n => n.status === 'draft').length,
        'in-progress': activeNotes.filter(n => n.status === 'in-progress').length,
        review: activeNotes.filter(n => n.status === 'review').length,
        completed: activeNotes.filter(n => n.status === 'completed').length,
        archived: activeNotes.filter(n => n.status === 'archived').length,
      }
    }
    return stats
  }, [activeNotes, trashedNotes])
  
  // Section definitions - MATCHING V1 EXACTLY
  const mainSections = useMemo(() => [
    {
      id: 'all-notes',
      label: 'All Notes',
      count: stats.total,
      icon: 'NotebookText',
    },
    {
      id: 'recent',
      label: 'Recent',
      count: Math.min(stats.total, 20), // Show up to 20 recent notes
      icon: 'Clock',
    },
    { 
      id: 'pinned', 
      label: 'Pinned', 
      count: stats.pinned, 
      icon: 'Pin' 
    },
  ], [stats])
  
  const statusSections = useMemo(() => [
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
  ], [stats])
  
  const systemSections = useMemo(() => [
    { 
      id: 'trash', 
      label: 'Trash', 
      count: stats.trashed, 
      icon: 'Trash' 
    },
  ], [stats])
  
  // Handlers
  const handleSectionClick = (section: string) => {
    console.log('🎯 SidebarLogicProviderV2 handleSectionClick:', section)
    setActiveSection(section)
    // In V2, the activeSection is the only source of truth for which section/notebook is selected
    // The filtering is handled by useFilteredNotesV2 based on activeSection
  }
  
  const createNewNote = (notebookId?: string) => {
    let targetNotebookName = 'default'
    
    if (notebookId) {
      // Find notebook by ID to get its name
      const notebook = notebooksWithCounts.find(n => n.id === notebookId)
      targetNotebookName = notebook?.name || 'default'
    } else if (activeSection.startsWith('notebook-')) {
      // Extract notebook name from activeSection (it comes in lowercase)
      const notebookNameLower = activeSection.replace('notebook-', '')
      // Find the actual notebook to get its proper name
      const actualNotebook = notebooksWithCounts.find(
        n => n.name.toLowerCase() === notebookNameLower
      )
      targetNotebookName = actualNotebook?.name || 'default'
    }
    
    console.log('🆕 Creating new note with notebook name:', targetNotebookName, 'from activeSection:', activeSection)
    
    createNoteMutation.mutate({
      title: 'New Note',
      content: '',
      notebook: targetNotebookName, // Use notebook NAME for consistency
      status: activeSection.startsWith('status-') 
        ? activeSection.replace('status-', '') as any
        : 'draft',
      tags: activeSection.startsWith('tag-')
        ? [activeSection.replace('tag-', '')]
        : [],
    })
  }
  
  const handleEmptyTrash = () => {
    emptyTrashMutation.mutate()
  }
  
  const handleSettingsClick = () => {
    openModal('settings')
  }
  
  const getTagColor = (tag: string) => {
    return getCustomTagColor(tag, settings?.tagColors || {})
  }
  
  const getNotebook = (id: string): Notebook | undefined => {
    return notebooksWithCounts.find(nb => nb.id === id)
  }
  
  const contextValue: SidebarContextType = {
    // Navigation
    activeSection,
    handleSectionClick,
    
    // Notebooks
    notebookTree,
    notebooksWithCounts,
    isLoadingNotebooks,
    createNotebook: (data) => createNotebookMutation.mutate(data),
    updateNotebook: (id, data) => updateNotebookMutation.mutate({ id, data }),
    deleteNotebook: (id) => deleteNotebookMutation.mutate({ id }),
    moveNotebook: (notebookId, newParentId) => moveNotebookMutation.mutate({ notebookId, newParentId }),
    getNotebook,
    
    // Notebook UI
    expandedNotebooks,
    toggleNotebookExpanded,
    
    // Notes
    notes: activeNotes,
    trashedNotes,
    isLoadingNotes,
    
    // Tags
    tagsWithCounts,
    getTagColor,
    
    // Actions
    createNewNote,
    handleEmptyTrash,
    handleSettingsClick,
    
    // Sections
    mainSections,
    statusSections,
    systemSections,
  }
  
  return (
    <SidebarContext.Provider value={contextValue}>
      {children}
    </SidebarContext.Provider>
  )
}

export default SidebarLogicProviderV2