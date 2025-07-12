// Coordinating logic hooks that combine specialized hooks
import { useMemo } from 'react'
import { useAppStore } from '../stores/newSimpleStore'
import { useNotebooks } from './useNotebooks'
import { Note } from '../types'
import { useAppInit } from './useAppInit'
import { useNoteActions } from './useNoteActions'
import { useSidebarLogic } from './useSidebarLogic'

// Helper function to get all child notebook names recursively
const getAllChildNotebooks = (notebooks: unknown[], parentName: string): string[] => {
  const children: string[] = []
  // Case-insensitive search for parent notebook
  const parentNotebook = notebooks.find((nb: any) => nb.name.toLowerCase() === parentName.toLowerCase())
  
  if (parentNotebook && parentNotebook.children?.length > 0) {
    parentNotebook.children.forEach((childId: string) => {
      const childNotebook = notebooks.find((nb: any) => nb.id === childId)
      if (childNotebook) {
        children.push(childNotebook.name)
        // Recursively get children of children
        children.push(...getAllChildNotebooks(notebooks, childNotebook.name))
      }
    })
  }
  
  return children
}

// Helper functions
export const getFilteredNotes = (
  notes: Note[], 
  activeSection: string, 
  searchQuery: string, 
  filterTags: string[],
  notebooks: unknown[] = []
): Note[] => {
  let filtered = notes

  switch (activeSection) {
    case 'all-notes':
      // Hide completed and archived notes by default (like Inkdrop)
      filtered = notes.filter(note => !note.isTrashed && !['completed', 'archived'].includes(note.status))
      break
    case 'pinned':
      // Show pinned notes but exclude completed/archived unless specifically in those tabs
      filtered = notes.filter(note => note.isPinned && !note.isTrashed && !['completed', 'archived'].includes(note.status))
      break
    case 'trash':
      filtered = notes.filter(note => note.isTrashed)
      break
    case 'recent':
      filtered = notes
        .filter(note => !note.isTrashed && !['completed', 'archived'].includes(note.status))
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 10)
      break
    default:
      if (activeSection.startsWith('status-')) {
        const status = activeSection.replace('status-', '')
        filtered = notes.filter(note => note.status === status && !note.isTrashed)
      } else if (activeSection.startsWith('tag-')) {
        const tag = activeSection.replace('tag-', '')
        filtered = notes.filter(note => note.tags.includes(tag) && !note.isTrashed)
      } else if (activeSection.startsWith('notebook-')) {
        const notebookFromSection = activeSection.replace('notebook-', '')
        
        // Find the actual notebook object to get its real name (preserving case)
        const actualNotebook = notebooks.find((nb: any) => nb.name.toLowerCase() === notebookFromSection.toLowerCase())
        const notebookName = actualNotebook ? actualNotebook.name : notebookFromSection
        
        // Get all child notebooks recursively
        const childNotebooks = getAllChildNotebooks(notebooks, notebookName)
        const allNotebooksToInclude = [notebookName, ...childNotebooks]
        
        // Filter notes from parent notebook and all its children (case-insensitive)
        filtered = notes.filter(note => 
          allNotebooksToInclude.some(nb => nb.toLowerCase() === note.notebook.toLowerCase()) && 
          !note.isTrashed && 
          !['completed', 'archived'].includes(note.status)
        )
      } else {
        // Default filter excludes completed/archived
        filtered = notes.filter(note => !note.isTrashed && !['completed', 'archived'].includes(note.status))
      }
  }

  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase()
    filtered = filtered.filter(note =>
      note.title.toLowerCase().includes(query) ||
      note.content.toLowerCase().includes(query) ||
      note.tags.some(tag => tag.toLowerCase().includes(query)) ||
      note.notebook.toLowerCase().includes(query)
    )
  }

  if (filterTags.length > 0) {
    filtered = filtered.filter(note =>
      filterTags.every(tag => note.tags.includes(tag))
    )
  }

  // Sort pinned notes to the top
  return filtered.sort((a, b) => {
    if (a.isPinned !== b.isPinned) {
      return a.isPinned ? -1 : 1
    }
    // Then sort by updated date (most recent first)
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  })
}

export const getStats = (notes: Note[]) => {
  // Filter out trashed notes
  const activeNotes = notes.filter(note => !note.isTrashed)
  
  // Filter out completed/archived for main counts (consistent with UI filtering)
  const visibleNotes = activeNotes.filter(note => !['completed', 'archived'].includes(note.status))
  
  return {
    total: visibleNotes.length,
    pinned: visibleNotes.filter(note => note.isPinned).length,
    trashed: notes.filter(note => note.isTrashed).length,
    byStatus: {
      draft: activeNotes.filter(note => note.status === 'draft').length,
      'in-progress': activeNotes.filter(note => note.status === 'in-progress').length,
      review: activeNotes.filter(note => note.status === 'review').length,
      completed: activeNotes.filter(note => note.status === 'completed').length,
      archived: activeNotes.filter(note => note.status === 'archived').length
    }
  }
}

// Main app logic hook - now a coordinating hook
export const useAppLogic = () => {
  const { flatNotebooks } = useNotebooks()
  
  const {
    notes,
    currentNote,
    selectedNoteId,
    isEditorOpen,
    isLoading,
    activeSection,
    searchQuery,
    filterTags
  } = useAppStore()

  // Initialize the app
  useAppInit()

  // Computed values with proper memoization
  const filteredNotes = useMemo(() => 
    getFilteredNotes(notes, activeSection, searchQuery, filterTags, flatNotebooks), 
    [notes, activeSection, searchQuery, filterTags, flatNotebooks]
  )

  const selectedNote = useMemo(() => {
    // If we're editing a note, use currentNote to avoid losing it due to filter changes
    if (isEditorOpen && currentNote) {
      return currentNote
    }
    // Otherwise find from filtered notes
    return filteredNotes.find(note => note.id === selectedNoteId)
  }, [filteredNotes, selectedNoteId, isEditorOpen, currentNote])

  return {
    notes,
    currentNote,
    selectedNote,
    selectedNoteId,
    isEditorOpen,
    isLoading,
    filteredNotes
  }
}

// Legacy export - now delegates to the specialized hook
export { useNoteActions } from './useNoteActions'

// Legacy export - now delegates to the specialized hook  
export { useSidebarLogic } from './useSidebarLogic'
