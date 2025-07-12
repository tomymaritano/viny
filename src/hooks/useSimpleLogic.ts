// Simple logic hooks that use the simplified store
import { useEffect, useMemo, useCallback } from 'react'
import { useSimpleStore } from '../stores/simpleStore'
import { useSettings } from './useSettings'
import { useNotebooks } from './useNotebooks'
import { getNotebookWithCounts } from '../utils/notebookTree'
import { storageService } from '../lib/storage'
import MarkdownProcessor from '../lib/markdown'
import { Note } from '../types'

// Helper function to get all child notebook names recursively
const getAllChildNotebooks = (notebooks: any[], parentName: string): string[] => {
  const children: string[] = []
  // Case-insensitive search for parent notebook
  const parentNotebook = notebooks.find(nb => nb.name.toLowerCase() === parentName.toLowerCase())
  
  if (parentNotebook && parentNotebook.children?.length > 0) {
    parentNotebook.children.forEach((childId: string) => {
      const childNotebook = notebooks.find(nb => nb.id === childId)
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
  notebooks: any[] = []
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
        const actualNotebook = notebooks.find(nb => nb.name.toLowerCase() === notebookFromSection.toLowerCase())
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

// Main app logic hook
export const useAppLogic = () => {
  const { settings } = useSettings()
  const { flatNotebooks } = useNotebooks()
  
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

    console.log('[createNewNote] Creating new note with ID:', newNote.id)
    
    addNote(newNote)
    setCurrentNote(newNote)
    setSelectedNoteId(newNote.id)
    setIsEditorOpen(true)
    
    // Verify the note was set correctly
    console.log('[createNewNote] Current note after setting:', useSimpleStore.getState().currentNote?.id)

    try {
      storageService.saveNote(newNote)
      // Removed success toast for cleaner UX
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
      console.log('[SaveNote] Starting save for note:', note.title, 'ID:', note.id)
      
      // Use the provided title, or extract from content if not provided or empty
      const title = note.title && note.title.trim() 
        ? note.title 
        : MarkdownProcessor.extractTitle(note.content) || 'Untitled Note'
      
      // Extract tags from content and merge with existing tags
      // Comment out automatic tag extraction to allow manual tag management
      // const contentTags = MarkdownProcessor.extractTags(note.content)
      const existingTags = note.tags || []
      
      // For now, only use manually set tags
      const uniqueTags = existingTags
      
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
      try {
        storageService.saveNote(updatedNote)
        console.log('[SaveNote] Storage service saveNote called')
        
        // Force immediate save and wait for completion
        await storageService.flushPendingSaves()
        console.log('[SaveNote] Pending saves flushed')
        
        // Verify the save worked by checking if we can retrieve it
        const savedNotes = storageService.getNotes()
        const foundNote = savedNotes.find(n => n.id === updatedNote.id)
        
        if (!foundNote) {
          console.error('[SaveNote] Note not found after save. Notes in storage:', savedNotes.length)
          console.error('[SaveNote] Looking for note ID:', updatedNote.id)
          console.error('[SaveNote] Existing note IDs:', savedNotes.map(n => n.id))
          throw new Error('Save verification failed - note not found')
        }
        
        // Note found - check if it's reasonably recent (allow for small timestamp differences)
        const savedTime = new Date(foundNote.updatedAt).getTime()
        const expectedTime = new Date(updatedNote.updatedAt).getTime()
        const timeDiff = Math.abs(savedTime - expectedTime)
        
        if (timeDiff < 1000) { // Allow 1 second difference
          console.log('[SaveNote] Verified note was saved successfully')
        } else {
          console.warn('[SaveNote] Note found but timestamp mismatch:', {
            expected: updatedNote.updatedAt,
            found: foundNote.updatedAt,
            diff: timeDiff
          })
          // Still continue since the note exists
        }
      } catch (saveError) {
        console.error('[SaveNote] Storage service error:', saveError)
        throw saveError
      }
      
      console.log('[SaveNote] Successfully saved and verified note:', updatedNote.title)
      return updatedNote
    } catch (error) {
      console.error('[SaveNote] Error saving note:', error)
      addToast({ type: 'error', message: 'Failed to save note: ' + error.message })
      throw error // Re-throw so auto-save can handle it
    }
  }, [updateNote, addToast])

  const handleDeleteNote = useCallback((note: Note) => {
    const trashedNote = {
      ...note,
      isTrashed: true,
      trashedAt: new Date().toISOString(),
    }
    updateNote(trashedNote)
    
    try {
      storageService.saveNote(trashedNote)
      // Removed toast notification for cleaner UX
    } catch (error) {
      console.error('Error deleting note:', error)
      addToast({ type: 'error', message: 'Failed to delete note' })
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
      // Removed success toast for cleaner UX
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
  
  const { notebooks, flatNotebooks, getColorClass, createNotebook, updateNotebook, deleteNotebook, moveNotebook, getRootNotebooks, getNotebookChildren } = useNotebooks()

  const stats = useMemo(() => getStats(notes), [notes])

  const notebooksWithCounts = useMemo(() => {
    return getNotebookWithCounts(notebooks, notes)
      .sort((a, b) => b.totalCount - a.totalCount)
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
    { id: 'all-notes', label: 'All Notes', count: stats.total, icon: 'NotebookText' },
    { id: 'pinned', label: 'Pinned', count: stats.pinned, icon: 'Pin' },
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
    handleToggleSection,
    handleSettingsClick,
    createNotebook,
    updateNotebook,
    deleteNotebook,
    moveNotebook,
    getRootNotebooks,
    getNotebookChildren
  }
}