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
      filtered = notes.filter(note => !note.isTrashed)
      break
    case 'pinned':
      filtered = notes.filter(note => note.isPinned && !note.isTrashed)
      break
    case 'trash':
      filtered = notes.filter(note => note.isTrashed)
      break
    case 'recent':
      filtered = notes
        .filter(note => !note.isTrashed)
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
        filtered = notes.filter(note => note.notebook === notebook && !note.isTrashed)
      } else {
        filtered = notes.filter(note => !note.isTrashed)
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

  return filtered
}

export const getStats = (notes: Note[]) => ({
  total: notes.filter(note => !note.isTrashed).length,
  pinned: notes.filter(note => note.isPinned && !note.isTrashed).length,
  trashed: notes.filter(note => note.isTrashed).length,
  byStatus: {
    active: notes.filter(note => note.status === 'active' && !note.isTrashed).length,
    'on-hold': notes.filter(note => note.status === 'on-hold' && !note.isTrashed).length,
    completed: notes.filter(note => note.status === 'completed' && !note.isTrashed).length,
    dropped: notes.filter(note => note.status === 'dropped' && !note.isTrashed).length
  }
})

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

  // Initialize data
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setLoading(true)
        if (notes.length === 0) {
          const storedNotes = storageService.getNotes()
          if (storedNotes.length > 0) {
            setNotes(storedNotes)
          }
        }
      } catch (error) {
        console.error('Failed to initialize app:', error)
        setError('Failed to load your notes')
      } finally {
        setLoading(false)
      }
    }
    initializeApp()
  }, [notes.length, setNotes, setLoading, setError])

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
    addNote,
    updateNote,
    removeNote,
    setCurrentNote,
    setSelectedNoteId,
    setIsEditorOpen,
    addToast
  } = useSimpleStore()

  const createNewNote = useCallback(() => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'Untitled Note',
      content: '',
      notebook: 'personal',
      tags: [],
      status: 'active',
      isPinned: false,
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
  }, [addNote, setCurrentNote, setSelectedNoteId, setIsEditorOpen, addToast])

  const handleOpenNote = useCallback((noteId: string) => {
    // This will be handled by the component
  }, [])

  const handleSaveNote = useCallback((note: Note) => {
    const title = MarkdownProcessor.extractTitle(note.content) || 'Untitled Note'
    const tags = MarkdownProcessor.extractTags(note.content)
    
    const updatedNote = {
      ...note,
      title,
      tags,
      updatedAt: new Date().toISOString()
    }

    updateNote(updatedNote)
    
    try {
      storageService.saveNote(updatedNote)
      addToast({ type: 'success', message: 'Note saved successfully' })
    } catch (error) {
      console.error('Error saving note:', error)
      addToast({ type: 'error', message: 'Failed to save note' })
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
    setExpandedSection
  } = useSimpleStore()
  
  const { notebooks, getColorClass } = useNotebooks()

  const stats = useMemo(() => getStats(notes), [notes])

  const notebooksWithCounts = useMemo(() => {
    const notebookCounts = notes.reduce((acc, note) => {
      if (!note.isTrashed) {
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
      if (!note.isTrashed && note.tags) {
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
    { id: 'status-active', label: 'Active', count: stats.byStatus.active, icon: 'Circle', color: 'text-theme-accent-green' },
    { id: 'status-on-hold', label: 'On Hold', count: stats.byStatus['on-hold'], icon: 'Clock', color: 'text-theme-accent-yellow' },
    { id: 'status-completed', label: 'Completed', count: stats.byStatus.completed, icon: 'CheckCircle', color: 'text-theme-accent-green' },
    { id: 'status-dropped', label: 'Dropped', count: stats.byStatus.dropped, icon: 'XCircle', color: 'text-theme-accent-red' },
  ], [stats])

  const systemSections = useMemo(() => [
    { id: 'trash', label: 'Trash', count: stats.trashed, icon: 'Trash' },
    { id: 'settings', label: 'Settings', icon: 'Settings' },
  ], [stats])

  const handleSectionClick = useCallback((sectionId: string) => {
    setActiveSection(sectionId)
  }, [setActiveSection])

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