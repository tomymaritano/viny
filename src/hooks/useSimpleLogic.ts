// Coordinating logic hooks that combine specialized hooks
import { useMemo } from 'react'
import { useAppStore } from '../stores/newSimpleStore'
import { useNotebooks } from './useNotebooks'
import type { Note } from '../types'
import type { NotebookWithCounts } from '../types/notebook'
import { useAppInit } from './useAppInit'
import { useNoteActions } from './useNoteActions'
import { useSidebarLogic } from './useSidebarLogic'
import { getStats } from '../utils/statsUtils'

// Helper function to get all child notebook names recursively
const getAllChildNotebooks = (notebooks: any[], parentId: string): string[] => {
  const children: string[] = []
  const parentNotebook = notebooks.find(nb => nb.id === parentId)

  if (parentNotebook && parentNotebook.children?.length > 0) {
    parentNotebook.children.forEach((childId: string) => {
      const childNotebook = notebooks.find(nb => nb.id === childId)
      if (childNotebook) {
        children.push(childNotebook.name)
        // Recursively get children of children
        children.push(...getAllChildNotebooks(notebooks, childId))
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
  notebooks: unknown[] = [],
  notebookFilter?: string | null,
  statusFilter?: string | null,
  focusedNotebookId?: string | null
): Note[] => {
  let filtered = notes

  // If in focus mode, filter to only show notes from the focused notebook and its children
  if (focusedNotebookId) {
    const focusedNotebook = notebooks.find(nb => nb.id === focusedNotebookId)
    if (focusedNotebook) {
      // Get all child notebook names recursively
      const childNotebookNames = getAllChildNotebooks(
        notebooks,
        focusedNotebookId
      )
      const allNotebooksToInclude = [
        focusedNotebook.name,
        ...childNotebookNames,
      ]

      // Filter notes that belong to the focused notebook or its children
      filtered = filtered.filter(note =>
        allNotebooksToInclude.some(
          nb => nb.toLowerCase() === note.notebook.toLowerCase()
        )
      )
    } else {
      // If focused notebook not found, return empty array
      return []
    }
  }

  // Then apply section-based filtering
  switch (activeSection) {
    case 'all-notes':
      // Hide completed and archived notes by default (like Inkdrop)
      filtered = notes.filter(
        note =>
          !note.isTrashed && !['completed', 'archived'].includes(note.status)
      )
      break
    case 'pinned':
      // Show pinned notes but exclude completed/archived unless specifically in those tabs
      filtered = notes.filter(
        note =>
          note.isPinned &&
          !note.isTrashed &&
          !['completed', 'archived'].includes(note.status)
      )
      break
    case 'trash':
      filtered = notes.filter(note => note.isTrashed)
      break
    case 'recent':
      filtered = notes
        .filter(
          note =>
            !note.isTrashed && !['completed', 'archived'].includes(note.status)
        )
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )
        .slice(0, 10)
      break
    default:
      if (activeSection.startsWith('status-')) {
        const status = activeSection.replace('status-', '')
        filtered = notes.filter(
          note => note.status === status && !note.isTrashed
        )
      } else if (activeSection.startsWith('tag-')) {
        const tag = activeSection.replace('tag-', '')
        filtered = notes.filter(
          note => note.tags.includes(tag) && !note.isTrashed
        )
      } else if (activeSection.startsWith('notebook-')) {
        const notebookFromSection = activeSection.replace('notebook-', '')
        
        // Debug logging
        console.log('🔍 Filtering by notebook:', {
          activeSection,
          notebookFromSection,
          availableNotebooks: notebooks.map(nb => ({ id: nb.id, name: nb.name }))
        })

        // Find the actual notebook object to get its real name and ID (preserving case)
        const actualNotebook = notebooks.find(
          nb => nb.name.toLowerCase() === notebookFromSection.toLowerCase()
        )

        if (actualNotebook) {
          const notebookName = actualNotebook.name
          // Get all child notebook names recursively using the notebook ID
          const childNotebookNames = getAllChildNotebooks(
            notebooks,
            actualNotebook.id
          )
          const allNotebooksToInclude = [notebookName, ...childNotebookNames]
          
          // Also include the lowercase version of the notebook name
          // since notes might be stored with lowercase notebook names
          const notebookVariations = [
            ...allNotebooksToInclude,
            ...allNotebooksToInclude.map(nb => nb.toLowerCase())
          ]
          
          console.log('🔍 Notebook variations to match:', notebookVariations)

          // Filter notes from parent notebook and all its children (case-insensitive)
          filtered = notes.filter(
            note => {
              const matches = notebookVariations.some(
                nb => nb.toLowerCase() === note.notebook.toLowerCase()
              ) &&
              !note.isTrashed &&
              !['completed', 'archived'].includes(note.status)
              
              if (note.notebook.toLowerCase() === notebookFromSection.toLowerCase()) {
                console.log('📝 Note matches notebook:', {
                  noteId: note.id,
                  noteTitle: note.title,
                  noteNotebook: note.notebook,
                  notebookFromSection
                })
              }
              
              return matches
            }
          )
          
          console.log('🔍 Filtered notes count:', filtered.length)
        } else {
          // Notebook not found, show no notes
          console.warn('⚠️ Notebook not found:', notebookFromSection)
          filtered = []
        }
      } else {
        // Default filter excludes completed/archived
        filtered = notes.filter(
          note =>
            !note.isTrashed && !['completed', 'archived'].includes(note.status)
        )
      }
  }

  // Apply notebook filter if set
  if (notebookFilter) {
    // Find the notebook by ID to get its name
    const filteredNotebook = notebooks.find(nb => nb.id === notebookFilter)
    if (filteredNotebook) {
      // Get all child notebook names recursively using the notebook ID
      const childNotebookNames = getAllChildNotebooks(notebooks, notebookFilter)
      const allNotebooksToInclude = [
        filteredNotebook.name,
        ...childNotebookNames,
      ]

      // Filter notes that belong to the filtered notebook or its children
      filtered = filtered.filter(note =>
        allNotebooksToInclude.some(
          nb => nb.toLowerCase() === note.notebook.toLowerCase()
        )
      )
    } else {
      // If notebook not found, return empty array
      return []
    }
  }

  // Apply status filter if set
  if (statusFilter) {
    filtered = filtered.filter(note => note.status === statusFilter)
  }

  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase()
    filtered = filtered.filter(
      note =>
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

// Re-export getStats from utils for backward compatibility
export { getStats } from '../utils/statsUtils'

// Main app logic hook - now a coordinating hook
export const useAppLogic = () => {
  const { notebooks, getFlattenedNotebooks } = useNotebooks()
  const flatNotebooks = getFlattenedNotebooks()

  const {
    notes,
    currentNote,
    selectedNoteId,
    isEditorOpen,
    isLoading,
    activeSection,
    searchQuery,
    filterTags,
    notebookFilter,
    statusFilter,
    tagFilters,
    focusedNotebookId,
  } = useAppStore()

  // Initialize the app
  useAppInit()

  // Computed values with proper memoization
  const filteredNotes = useMemo(
    () =>
      getFilteredNotes(
        notes,
        activeSection,
        searchQuery,
        [...filterTags, ...tagFilters], // Combine legacy filterTags with new tagFilters
        notebooks, // Use hierarchical notebooks instead of flat ones for proper parent-child filtering
        notebookFilter,
        statusFilter,
        focusedNotebookId
      ),
    [
      notes,
      activeSection,
      searchQuery,
      filterTags,
      tagFilters,
      notebooks, // Changed from flatNotebooks to notebooks
      notebookFilter,
      statusFilter,
      focusedNotebookId,
    ]
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
    filteredNotes,
  }
}

// Legacy export - now delegates to the specialized hook
export { useNoteActions } from './useNoteActions'

// Legacy export - now delegates to the specialized hook
export { useSidebarLogic } from './useSidebarLogic'
