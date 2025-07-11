// Simple logic hooks that use the simplified store
import { useEffect, useMemo, useCallback } from 'react'
import { useSimpleStore } from '../stores/simpleStore'
import { useSettings } from './useSettings'
import { useNotebooks } from './useNotebooks'
import { storageService } from '../lib/storage'
import MarkdownProcessor from '../lib/markdown'
import { Note } from '../types'

// Helper functions
export const getFilteredNotes = (
  notes: Note[], 
  activeSection: string, 
  searchQuery: string, 
  filterTags: string[]
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
        const notebook = activeSection.replace('notebook-', '')
        // When viewing a notebook, hide completed/archived unless specifically viewing those status tabs
        filtered = notes.filter(note => note.notebook === notebook && !note.isTrashed && !['completed', 'archived'].includes(note.status))
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

// Main app logic hook
export const useAppLogic = () => {
  const { settings } = useSettings()
  
  const {
    notes,
    currentNote,
    selectedNoteId,
    isEditorOpen,
    isLoading,
    error,
    activeSection,
    searchQuery,
    filterTags,
    theme,
    setNotes,
    setLoading,
    setCurrentNote,
    setSelectedNoteId,
    setIsEditorOpen,
    setError,
    setTheme
  } = useSimpleStore()

  // Initialize data with proper async loading - fix race condition
  useEffect(() => {
    let isInitialized = false
    
    const initializeApp = async () => {
      if (isInitialized) return // Prevent double initialization
      
      try {
        setLoading(true)
        setError(null)
        
        // First, run storage diagnostics
        console.log('[Init] Running storage diagnostics...')
        const { diagnoseSaveIssues, checkStorageAvailability } = await import('../lib/storageUtils')
        
        const storageInfo = checkStorageAvailability()
        console.log('[Init] Storage availability:', storageInfo)
        
        const issues = await diagnoseSaveIssues()
        if (issues.length > 0) {
          console.warn('[Init] Storage issues detected:', issues)
          issues.forEach(issue => console.warn('[Init] Issue:', issue))
        } else {
          console.log('[Init] No storage issues detected')
        }
        
        console.log('[Init] Loading notes from storage...')
        const storedNotes = await storageService.loadNotes()
        
        console.log('[Init] Loaded notes count:', storedNotes.length)
        if (storedNotes.length >= 0) { // Always set notes, even if empty array
          setNotes(storedNotes)
          isInitialized = true
          console.log('[Init] App initialization completed successfully')
        }
      } catch (error) {
        console.error('[Init] Failed to initialize app:', error)
        setError('Failed to load your notes. Please refresh the page.')
      } finally {
        setLoading(false)
      }
    }
    
    initializeApp()
  }, [setNotes, setLoading, setError]) // Remove notes.length dependency to prevent infinite loops

  // Apply theme
  useEffect(() => {
    const finalTheme = settings?.theme || theme || 'dark'
    const resolvedTheme = finalTheme === 'system'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      : finalTheme
    document.documentElement.setAttribute('data-theme', resolvedTheme)
    setTheme(resolvedTheme)
  }, [settings?.theme, theme, setTheme])

  // Computed values with proper memoization
  const filteredNotes = useMemo(() => 
    getFilteredNotes(notes, activeSection, searchQuery, filterTags), 
    [notes, activeSection, searchQuery, filterTags]
  )

  const selectedNote = useMemo(() => 
    filteredNotes.find(note => note.id === selectedNoteId), 
    [filteredNotes, selectedNoteId]
  )

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

// Note actions hook
export const useNoteActions = () => {
  const {
    activeSection,
    addNote,
    updateNote,
    removeNote,
    setCurrentNote,
    setSelectedNoteId,
    setIsEditorOpen,
    addToast
  } = useSimpleStore()

  const createNewNote = useCallback(() => {
    // Determine properties based on current context
    const isPinned = activeSection === 'pinned'
    const status = activeSection.startsWith('status-') ? activeSection.replace('status-', '') as Note['status'] : 'draft'
    const notebook = activeSection.startsWith('notebook-') ? activeSection.replace('notebook-', '') : 'personal'
    
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'Untitled Note',
      content: '',
      notebook,
      tags: [],
      status,
      isPinned,
      isTrashed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    addNote(newNote)
    setCurrentNote(newNote)
    setSelectedNoteId(newNote.id)
    setIsEditorOpen(true)

    try {
      storageService.saveNote(newNote)
      addToast({ type: 'success', message: `Created "${newNote.title}"` })
    } catch (error) {
      console.error('Error saving new note:', error)
      addToast({ type: 'error', message: 'Failed to save note' })
    }

    return newNote
  }, [activeSection, addNote, setCurrentNote, setSelectedNoteId, setIsEditorOpen, addToast])

  const handleOpenNote = useCallback((noteId: string) => {
    // This will be handled by the component
  }, [])

  const handleSaveNote = useCallback(async (note: Note) => {
    try {
      console.log('[SaveNote] Starting save for note:', note.title)
      
      // Use the provided title, or extract from content if not provided or empty
      const title = note.title && note.title.trim() 
        ? note.title 
        : MarkdownProcessor.extractTitle(note.content) || 'Untitled Note'
      
      // Extract tags from content and merge with existing tags
      const contentTags = MarkdownProcessor.extractTags(note.content)
      const existingTags = note.tags || []
      
      // Combine and deduplicate tags (case-insensitive)
      const combinedTags = [...existingTags, ...contentTags]
      const uniqueTags = combinedTags.filter((tag, index, arr) => 
        arr.findIndex(t => t.toLowerCase() === tag.toLowerCase()) === index
      )
      
      const updatedNote = {
        ...note,
        title,
        tags: uniqueTags,
        updatedAt: new Date().toISOString()
      }

      console.log('[SaveNote] Prepared note for saving:', {
        id: updatedNote.id,
        title: updatedNote.title,
        contentLength: updatedNote.content.length,
        updatedAt: updatedNote.updatedAt
      })

      // Update in-memory state first
      updateNote(updatedNote)
      console.log('[SaveNote] Updated in-memory state')
      
      // Then persist to storage - ensure this actually saves
      await new Promise<void>((resolve, reject) => {
        try {
          storageService.saveNote(updatedNote)
          console.log('[SaveNote] Storage service saveNote called')
          
          // Verify the save worked by checking if we can retrieve it
          setTimeout(() => {
            try {
              const savedNotes = storageService.getNotes()
              const foundNote = savedNotes.find(n => n.id === updatedNote.id)
              if (foundNote && foundNote.updatedAt === updatedNote.updatedAt) {
                console.log('[SaveNote] Verified note was saved successfully')
                resolve()
              } else {
                console.error('[SaveNote] Note not found after save or timestamp mismatch')
                reject(new Error('Save verification failed'))
              }
            } catch (verifyError) {
              console.error('[SaveNote] Error verifying save:', verifyError)
              reject(verifyError)
            }
          }, 150) // Give debouncing time to complete
        } catch (saveError) {
          console.error('[SaveNote] Storage service error:', saveError)
          reject(saveError)
        }
      })
      
      console.log('[SaveNote] Successfully saved and verified note:', updatedNote.title)
      return updatedNote
    } catch (error) {
      console.error('[SaveNote] Error saving note:', error)
      addToast({ type: 'error', message: 'Failed to save note: ' + error.message })
      throw error // Re-throw so auto-save can handle it
    }
  }, [updateNote, addToast])

  const handleDeleteNote = useCallback((note: Note) => {
    if (window.confirm(`Are you sure you want to move "${note.title}" to trash?`)) {
      const trashedNote = {
        ...note,
        isTrashed: true,
        trashedAt: new Date().toISOString(),
      }
      updateNote(trashedNote)
      
      try {
        storageService.saveNote(trashedNote)
        addToast({ type: 'success', message: `"${note.title}" moved to trash` })
      } catch (error) {
        console.error('Error deleting note:', error)
        addToast({ type: 'error', message: 'Failed to delete note' })
      }
    }
  }, [updateNote, addToast])

  const handleTogglePin = useCallback((note: Note) => {
    const updatedNote = {
      ...note,
      isPinned: !note.isPinned,
      updatedAt: new Date().toISOString(),
    }
    updateNote(updatedNote)
    
    try {
      storageService.saveNote(updatedNote)
    } catch (error) {
      console.error('Error updating note:', error)
      addToast({ type: 'error', message: 'Failed to update note' })
    }
  }, [updateNote, addToast])

  const handleDuplicateNote = useCallback((note: Note) => {
    const duplicatedNote: Note = {
      ...note,
      id: Date.now().toString(),
      title: `${note.title} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPinned: false
    }

    addNote(duplicatedNote)
    
    try {
      storageService.saveNote(duplicatedNote)
      addToast({ type: 'success', message: `"${note.title}" duplicated` })
    } catch (error) {
      console.error('Error duplicating note:', error)
      addToast({ type: 'error', message: 'Failed to duplicate note' })
    }

    return duplicatedNote
  }, [addNote, addToast])

  return {
    createNewNote,
    handleOpenNote,
    handleSaveNote,
    handleDeleteNote,
    handleTogglePin,
    handleDuplicateNote
  }
}

// Sidebar logic hook
export const useSidebarLogic = () => {
  const { 
    notes, 
    activeSection, 
    expandedSections,
    setActiveSection,
    setExpandedSection,
    setModal
  } = useSimpleStore()
  
  const { notebooks, getColorClass } = useNotebooks()

  const stats = useMemo(() => getStats(notes), [notes])

  const notebooksWithCounts = useMemo(() => {
    const notebookCounts = notes.reduce((acc, note) => {
      if (!note.isTrashed && !['completed', 'archived'].includes(note.status)) {
        acc[note.notebook] = (acc[note.notebook] || 0) + 1
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

  const mainSections = useMemo(() => [
    { id: 'all-notes', label: 'All Notes', count: stats.total, icon: 'FileText' },
    { id: 'pinned', label: 'Pinned', count: stats.pinned, icon: 'Star' },
  ], [stats])

  const statusSections = useMemo(() => [
    { id: 'status-draft', label: 'Draft', count: stats.byStatus.draft || 0, icon: 'FileText', color: 'text-theme-text-secondary' },
    { id: 'status-in-progress', label: 'In Progress', count: stats.byStatus['in-progress'], icon: 'Circle', color: 'text-theme-accent-blue' },
    { id: 'status-review', label: 'Review', count: stats.byStatus.review, icon: 'Clock', color: 'text-theme-accent-yellow' },
    { id: 'status-completed', label: 'Completed', count: stats.byStatus.completed, icon: 'CheckCircle', color: 'text-theme-accent-green' },
    { id: 'status-archived', label: 'Archived', count: stats.byStatus.archived, icon: 'XCircle', color: 'text-theme-accent-red' },
  ], [stats])

  const systemSections = useMemo(() => [
    { id: 'trash', label: 'Trash', count: stats.trashed, icon: 'Trash' },
    { id: 'settings', label: 'Settings', icon: 'Settings' },
  ], [stats])

  const handleSectionClick = useCallback((sectionId: string) => {
    if (sectionId === 'settings') {
      // Check if we're in Electron
      if ((window as any).electronAPI?.isElectron) {
        // Open settings in new window
        (window as any).electronAPI.openSettings()
      } else {
        // Fallback to modal for web version
        setModal('settings', true)
      }
    } else {
      setActiveSection(sectionId)
    }
  }, [setActiveSection, setModal])

  const handleToggleSection = useCallback((section: string) => {
    setExpandedSection(section, !expandedSections[section as keyof typeof expandedSections])
  }, [expandedSections, setExpandedSection])

  return {
    activeSection,
    expandedSections,
    notes,
    mainSections,
    statusSections,
    systemSections,
    notebooksWithCounts,
    tagsWithCounts,
    getColorClass,
    handleSectionClick,
    handleToggleSection
  }
}