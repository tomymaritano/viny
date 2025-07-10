// Main app logic hook - extracts all business logic from App component
import { useEffect, useMemo } from 'react'
import { useAppStore, getFilteredNotes } from '../stores/appStoreFixed'
import { useSettings } from './useSettings'
import { storageService } from '../lib/storage'
import { Note } from '../types'

export const useAppLogic = () => {
  const { settings } = useSettings()

  // Store selectors
  const {
    notes,
    currentNote,
    selectedNoteId,
    isEditorOpen,
    isLoading,
    error: notesError,
    activeSection,
    searchQuery,
    filterTags,
    setNotes,
    setLoading,
    openEditor,
    createNewNote,
    updateNote,
    deleteNote,
    duplicateNote
  } = useAppStore(state => ({
    notes: state.notes,
    currentNote: state.currentNote,
    selectedNoteId: state.selectedNoteId,
    isEditorOpen: state.isEditorOpen,
    isLoading: state.isLoading,
    error: state.error,
    activeSection: state.activeSection,
    searchQuery: state.searchQuery,
    filterTags: state.filterTags,
    setNotes: state.setNotes,
    setLoading: state.setLoading,
    openEditor: state.openEditor,
    createNewNote: state.createNewNote,
    updateNote: state.updateNote,
    deleteNote: state.deleteNote,
    duplicateNote: state.duplicateNote
  }))

  const {
    theme,
    showSuccess,
    showError,
    setTheme
  } = useAppStore(state => ({
    theme: state.theme,
    showSuccess: state.showSuccess,
    showError: state.showError,
    setTheme: state.setTheme
  }))

  // Initialize app data
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setLoading(true)
        
        // Load notes from storage if store is empty
        if (notes.length === 0) {
          const storedNotes = storageService.getNotes()
          if (storedNotes.length > 0) {
            setNotes(storedNotes)
          }
        }
      } catch (error) {
        console.error('Failed to initialize app:', error)
        showError('Failed to load your notes')
      } finally {
        setLoading(false)
      }
    }

    initializeApp()
  }, [notes.length, setNotes, setLoading, showError])

  // Apply theme
  useEffect(() => {
    const finalTheme = settings?.theme || theme || 'dark'
    
    const resolvedTheme = finalTheme === 'system'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      : finalTheme

    document.documentElement.setAttribute('data-theme', resolvedTheme)
    setTheme(resolvedTheme)
  }, [settings?.theme, theme, setTheme])

  // Show error notifications
  useEffect(() => {
    if (notesError) {
      showError(`Error: ${notesError}`)
    }
  }, [notesError, showError])

  return {
    // State
    notes,
    currentNote,
    selectedNoteId,
    isEditorOpen,
    isLoading,
    
    // Computed with memoization to prevent infinite loops
    filteredNotes: useMemo(() => 
      getFilteredNotes(notes, activeSection, searchQuery, filterTags), 
      [notes, activeSection, searchQuery, filterTags]
    ),
    selectedNote: useMemo(() => {
      const filtered = getFilteredNotes(notes, activeSection, searchQuery, filterTags)
      return filtered.find(note => note.id === selectedNoteId)
    }, [notes, activeSection, searchQuery, filterTags, selectedNoteId]),
    
    // Actions
    openEditor,
    createNewNote,
    updateNote,
    deleteNote,
    duplicateNote,
    showSuccess,
    showError
  }
}