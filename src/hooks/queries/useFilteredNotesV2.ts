/**
 * useFilteredNotesV2 - Memoized note filtering with performance optimizations
 */

import { useMemo } from 'react'
import { useActiveNotesQueryV2 } from './useNotesServiceQueryV2'
import { useSearchQueryV2 } from './useSearchQueryV2'
import { useNotebooksWithCountsQueryV2 } from './useNotebooksServiceQueryV2'
import type { Note } from '../../types'

interface FilterOptions {
  activeSection: string
  selectedNotebookId: string | null
  selectedTag: string | null
  searchQuery: string
  sortBy: 'title' | 'updatedAt' | 'createdAt'
  sortDirection: 'asc' | 'desc'
  showPinnedFirst?: boolean
}

export const useFilteredNotesV2 = (options: FilterOptions) => {
  const {
    activeSection,
    selectedNotebookId,
    selectedTag,
    searchQuery,
    sortBy,
    sortDirection,
    showPinnedFirst = true
  } = options
  
  // Get all notes
  const { data: notes = [], isLoading: notesLoading } = useActiveNotesQueryV2()
  
  // Debug: EXTENSIVE logging for debugging notebook issue
  console.log('🔴 useFilteredNotesV2 DEBUG START:', {
    activeSection,
    selectedNotebookId,
    searchQuery,
    notesCount: notes.length,
    isLoading: notesLoading,
  })
  
  // Log ALL notes with their notebook values
  console.log('🔴 ALL NOTES IN SYSTEM:', notes.map(n => ({
    id: n.id,
    title: n.title,
    notebook: n.notebook,
    status: n.status,
    isPinned: n.isPinned,
    isTrashed: n.isTrashed,
    tags: n.tags
  })))
  
  // Log unique notebook values
  const uniqueNotebooks = [...new Set(notes.map(n => n.notebook))]
  console.log('🔴 UNIQUE NOTEBOOK VALUES IN NOTES:', uniqueNotebooks)
  
  // Use search query if search is active
  const { searchResults, isSearching } = useSearchQueryV2(searchQuery, {
    enabled: !!searchQuery.trim()
  })
  
  // Get notebooks for ID/name mapping
  const { data: notebooks = [] } = useNotebooksWithCountsQueryV2()
  
  // Memoized filtering and sorting
  const filteredNotes = useMemo(() => {
    // If searching, use search results
    if (searchQuery.trim() && searchResults.length > 0) {
      return searchResults
    }
    
    // Start with all notes or empty array
    let filtered = searchQuery.trim() ? [] : [...notes]
    
    // Apply section filters - MATCHING V1 LOGIC
    if (activeSection === 'all-notes') {
      // Show all active notes
      // Already filtered by useActiveNotesQueryV2
    } else if (activeSection === 'pinned') {
      // Show only pinned notes
      filtered = filtered.filter(note => note.isPinned)
    } else if (activeSection.startsWith('status-')) {
      // Status sections
      const status = activeSection.replace('status-', '')
      filtered = filtered.filter(note => note.status === status)
    } else if (activeSection.startsWith('notebook-')) {
      // Notebook sections - activeSection contains the notebook name
      const notebookName = activeSection.replace('notebook-', '')
      
      // Find the notebook by name to get its ID
      const targetNotebook = notebooks.find(nb => 
        nb.name.toLowerCase() === notebookName.toLowerCase()
      )
      
      // EXTENSIVE DEBUG logging
      console.log('🔴🔴🔴 NOTEBOOK FILTERING DEBUG:', {
        activeSection,
        notebookName,
        allNotebooks: notebooks.map(nb => ({ id: nb.id, name: nb.name })),
        targetNotebook: targetNotebook ? { id: targetNotebook.id, name: targetNotebook.name } : null,
        totalNotes: notes.length,
        notesWithNotebook: notes.filter(n => n.notebook).length,
        notesWithoutNotebook: notes.filter(n => !n.notebook).length,
      })
      
      // Log each note's notebook value for detailed analysis
      console.log('🔴 DETAILED NOTE NOTEBOOK VALUES:')
      notes.forEach((note, index) => {
        console.log(`  Note ${index}: id=${note.id}, title="${note.title}", notebook="${note.notebook}"`)
      })
      
      // Also log what notebooks exist in the system
      console.log('🔴 SYSTEM NOTEBOOKS:', notebooks.map(nb => ({
        id: nb.id,
        name: nb.name,
        nameToLower: nb.name.toLowerCase()
      })))
      
      if (!targetNotebook) {
        console.warn('⚠️ V2 Notebook not found:', notebookName)
        filtered = []
      } else {
        // Filter notes by matching either:
        // 1. notebook field equals the notebook ID
        // 2. notebook field equals the notebook name (for backwards compatibility)
        filtered = filtered.filter((note, index) => {
          const noteNotebook = note.notebook || ''
          const matchesId = noteNotebook === targetNotebook.id
          const matchesName = noteNotebook.toLowerCase() === targetNotebook.name.toLowerCase()
          const matches = matchesId || matchesName
          
          // LOG EVERY SINGLE NOTE for debugging
          console.log(`🔴 Checking note ${index}:`, {
            noteId: note.id,
            noteTitle: note.title,
            noteNotebook: note.notebook,
            targetNotebookId: targetNotebook.id,
            targetNotebookName: targetNotebook.name,
            matchesId,
            matchesName,
            matches,
            noteNotebookType: typeof note.notebook,
            targetIdType: typeof targetNotebook.id,
          })
          
          return matches
        })
      }
      
      console.log('🔴🔴🔴 FINAL FILTER RESULTS:', {
        notebookName,
        targetNotebook: targetNotebook ? { id: targetNotebook.id, name: targetNotebook.name } : null,
        filteredCount: filtered.length,
        filteredNotes: filtered.map(n => ({ id: n.id, title: n.title, notebook: n.notebook }))
      })
    } else if (activeSection.startsWith('tag-')) {
      // Tag sections
      const tagName = activeSection.replace('tag-', '')
      filtered = filtered.filter(note => 
        note.tags?.includes(tagName)
      )
    } else if (activeSection === 'trash') {
      // This would be handled by a different query (useTrashedNotesQueryV2)
      filtered = []
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      // Pin sorting - pinned items always come first if enabled
      if (showPinnedFirst) {
        if (a.isPinned && !b.isPinned) return -1
        if (!a.isPinned && b.isPinned) return 1
      }
      
      // Regular sorting
      let aValue: any = a[sortBy]
      let bValue: any = b[sortBy]
      
      // Handle date fields
      if (sortBy === 'updatedAt' || sortBy === 'createdAt') {
        aValue = new Date(aValue).getTime()
        bValue = new Date(bValue).getTime()
      }
      
      // Handle string fields
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }
      
      const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      return sortDirection === 'asc' ? comparison : -comparison
    })
    
    return filtered
  }, [
    notes,
    notebooks,
    searchQuery,
    searchResults,
    activeSection,
    selectedNotebookId,
    selectedTag,
    sortBy,
    sortDirection,
    showPinnedFirst
  ])
  
  // Memoized counts for UI
  const counts = useMemo(() => ({
    total: notes.length,
    filtered: filteredNotes.length,
    pinned: filteredNotes.filter(n => n.isPinned).length,
    notebooks: new Set(notes.map(n => n.notebook)).size,
    tags: new Set(notes.flatMap(n => n.tags)).size,
  }), [notes, filteredNotes])
  
  return {
    notes: filteredNotes,
    isLoading: notesLoading || isSearching,
    counts,
  }
}

/**
 * Hook for getting note statistics
 */
export const useNoteStatsV2 = () => {
  const { data: notes = [] } = useActiveNotesQueryV2()
  
  return useMemo(() => {
    const totalNotes = notes.length
    const totalWords = notes.reduce((sum, note) => 
      sum + note.content.split(/\s+/).filter(word => word.length > 0).length, 0
    )
    const averageWords = totalNotes > 0 ? Math.round(totalWords / totalNotes) : 0
    
    const notebookCounts = notes.reduce((acc, note) => {
      acc[note.notebook] = (acc[note.notebook] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const tagCounts = notes.reduce((acc, note) => {
      note.tags.forEach(tag => {
        acc[tag] = (acc[tag] || 0) + 1
      })
      return acc
    }, {} as Record<string, number>)
    
    return {
      totalNotes,
      totalWords,
      averageWords,
      notebookCounts,
      tagCounts,
      pinnedCount: notes.filter(n => n.isPinned).length,
      lastUpdated: notes.length > 0 
        ? new Date(Math.max(...notes.map(n => new Date(n.updatedAt).getTime())))
        : null
    }
  }, [notes])
}