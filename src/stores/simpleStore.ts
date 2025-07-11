// Simplified store without any computed functions to avoid infinite loops
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { Note } from '../types'
import { storageService } from '../lib/storage'

export interface Template {
  id: string
  name: string
  content: string
  description: string
  category: string
  createdAt: string
}

interface SimpleAppStore {
  // Basic state only - no computed functions
  notes: Note[]
  templates: Template[]
  currentNote: Note | null
  selectedNoteId: string | null
  isEditorOpen: boolean
  isLoading: boolean
  error: string | null
  activeSection: string
  viewMode: 'edit' | 'preview'
  searchQuery: string
  filterTags: string[]
  sortBy: 'title' | 'date' | 'updated' | 'notebook'
  sortDirection: 'asc' | 'desc'
  tagColors: Record<string, string>

  // UI state
  isPreviewVisible: boolean
  expandedSections: {
    notebooks: boolean
    status: boolean
    tags: boolean
  }
  modals: {
    settings: boolean
    search: boolean
    export: boolean
    notebookManager: boolean
    template: boolean
    tagModal: boolean
  }
  toasts: Array<{
    id: string
    type: 'success' | 'error' | 'warning' | 'info'
    message: string
    duration?: number
    timestamp: string
  }>
  theme: string

  // Simple setters only
  setNotes: (notes: Note[]) => void
  setCurrentNote: (note: Note | null) => void
  setSelectedNoteId: (id: string | null) => void
  setIsEditorOpen: (open: boolean) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setActiveSection: (section: string) => void
  setViewMode: (mode: 'edit' | 'preview') => void
  setSearchQuery: (query: string) => void
  setFilterTags: (tags: string[]) => void
  setIsPreviewVisible: (visible: boolean) => void
  setExpandedSection: (section: string, expanded: boolean) => void
  setModal: (modal: string, open: boolean) => void
  addToast: (toast: any) => void
  removeToast: (id: string) => void
  setTheme: (theme: string) => void

  // Tag management methods
  setTagColor: (tag: string, color: string) => void
  getTagColor: (tag: string) => string

  // Basic note operations
  addNote: (note: Note) => void
  updateNote: (note: Note) => void
  removeNote: (id: string) => void
  setSortBy: (sortBy: 'title' | 'date' | 'updated' | 'notebook') => void
  setSortDirection: (direction: 'asc' | 'desc') => void
  sortNotes: () => void

  // Template operations
  addTemplate: (template: Template) => void
  updateTemplate: (template: Template) => void
  removeTemplate: (id: string) => void
  createNoteFromTemplate: (templateId: string) => Note | null
}

export const useSimpleStore = create<SimpleAppStore>()(
  devtools(
    (set) => ({
      // Initial state
      notes: [],
      templates: [
        {
          id: 'daily-note',
          name: 'Daily Note',
          content: `# Daily Note - {{date}}

## Today's Goals
- 
- 
- 

## Notes


## Tasks
- [ ] 
- [ ] 
- [ ] 

## Reflection


---
Created: {{date}}`,
          description: 'A template for daily note-taking',
          category: 'Personal',
          createdAt: new Date().toISOString()
        },
        {
          id: 'meeting-notes',
          name: 'Meeting Notes',
          content: `# {{title}}

**Date:** {{date}}
**Time:** 
**Attendees:** 

## Agenda
1. 
2. 
3. 

## Discussion Points


## Action Items
- [ ] 
- [ ] 
- [ ] 

## Next Steps


---
Meeting ended: `,
          description: 'Template for meeting notes and action items',
          category: 'Work',
          createdAt: new Date().toISOString()
        },
        {
          id: 'project-planning',
          name: 'Project Planning',
          content: `# Project: {{title}}

## Overview


## Goals & Objectives
- 
- 
- 

## Timeline
| Phase | Description | Due Date |
|-------|-------------|----------|
|       |             |          |
|       |             |          |

## Resources Needed


## Risks & Mitigation


## Success Metrics


---
Created: {{date}}`,
          description: 'Template for project planning and tracking',
          category: 'Work',
          createdAt: new Date().toISOString()
        }
      ],
      currentNote: null,
      selectedNoteId: null,
      isEditorOpen: false,
      isLoading: false,
      error: null,
      activeSection: 'all-notes',
      viewMode: 'edit',
      searchQuery: '',
      filterTags: [],
      sortBy: 'updated',
      sortDirection: 'desc',
      isPreviewVisible: false,
      expandedSections: {
        notebooks: true,
        status: false,
        tags: false
      },
      modals: {
        settings: false,
        search: false,
        export: false,
        notebookManager: false,
        template: false,
        tagModal: false
      },
      toasts: [],
      theme: 'dark',
      tagColors: storageService.getTagColors(),

      // Simple setters
      setNotes: (notes) => set({ notes }),
      setCurrentNote: (currentNote) => set({ currentNote }),
      setSelectedNoteId: (selectedNoteId) => set({ selectedNoteId }),
      setIsEditorOpen: (isEditorOpen) => set({ isEditorOpen }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      setActiveSection: (activeSection) => set({ activeSection }),
      setViewMode: (viewMode) => set({ viewMode }),
      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setFilterTags: (filterTags) => set({ filterTags }),
      setIsPreviewVisible: (isPreviewVisible) => set({ isPreviewVisible }),
      
      setExpandedSection: (section, expanded) =>
        set((state) => ({
          expandedSections: { ...state.expandedSections, [section]: expanded }
        })),

      setModal: (modal, open) =>
        set((state) => ({
          modals: { ...state.modals, [modal]: open }
        })),

      addToast: (toast) =>
        set((state) => ({
          toasts: [...state.toasts, {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            ...toast
          }]
        })),

      removeToast: (toastId) =>
        set((state) => ({
          toasts: state.toasts.filter(toast => toast.id !== toastId)
        })),

      setTheme: (theme) => set({ theme }),

      // Tag color management
      setTagColor: (tag, color) =>
        set((state) => {
          const newTagColors = { ...state.tagColors, [tag]: color }
          // Persist to localStorage
          storageService.saveTagColors(newTagColors)
          return { tagColors: newTagColors }
        }),

      getTagColor: (tag) => {
        const state = useSimpleStore.getState()
        const { getCustomTagColor } = require('../utils/customTagColors')
        
        // Get custom color object
        const colorObj = getCustomTagColor(tag, state.tagColors)
        
        // Return the color key for storage compatibility, but we'll use colorObj for rendering
        return colorObj
      },

      // Basic note operations
      addNote: (note) =>
        set((state) => ({ notes: [note, ...state.notes] })),

      updateNote: (updatedNote) =>
        set((state) => ({
          notes: state.notes.map(note => 
            note.id === updatedNote.id ? updatedNote : note
          ),
          currentNote: state.currentNote?.id === updatedNote.id 
            ? updatedNote 
            : state.currentNote
        })),

      removeNote: (noteId) =>
        set((state) => ({
          notes: state.notes.filter(note => note.id !== noteId),
          currentNote: state.currentNote?.id === noteId ? null : state.currentNote,
          selectedNoteId: state.selectedNoteId === noteId ? null : state.selectedNoteId,
          isEditorOpen: state.currentNote?.id === noteId ? false : state.isEditorOpen
        })),

      setSortBy: (sortBy) => set({ sortBy }),
      setSortDirection: (sortDirection) => set({ sortDirection }),
      
      sortNotes: () =>
        set((state) => {
          const sortedNotes = [...state.notes].sort((a, b) => {
            let comparison = 0
            
            switch (state.sortBy) {
              case 'title':
                comparison = a.title.toLowerCase().localeCompare(b.title.toLowerCase())
                break
              case 'date':
                comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                break
              case 'updated':
                comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
                break
              case 'notebook':
                comparison = a.notebook.toLowerCase().localeCompare(b.notebook.toLowerCase())
                break
            }
            
            return state.sortDirection === 'asc' ? comparison : -comparison
          })
          
          return { notes: sortedNotes }
        }),

      // Template operations
      addTemplate: (template) =>
        set((state) => ({
          templates: [...state.templates, template]
        })),

      updateTemplate: (updatedTemplate) =>
        set((state) => ({
          templates: state.templates.map(template =>
            template.id === updatedTemplate.id ? updatedTemplate : template
          )
        })),

      removeTemplate: (templateId) =>
        set((state) => ({
          templates: state.templates.filter(template => template.id !== templateId)
        })),

      createNoteFromTemplate: (templateId) =>
        set((state) => {
          try {
            // Input validation
            if (!templateId || typeof templateId !== 'string') {
              throw new Error('Invalid template ID provided')
            }

            const template = state.templates.find(t => t.id === templateId)
            if (!template) {
              throw new Error(`Template with ID "${templateId}" not found`)
            }

            // Validate template structure
            if (!template.content || !template.name) {
              throw new Error('Template is missing required fields')
            }

            // Replace template variables with error handling
            const now = new Date()
            const dateStr = now.toLocaleDateString()
            const timeStr = now.toLocaleTimeString()
            
            let content = template.content
              .replace(/\{\{date\}\}/g, dateStr)
              .replace(/\{\{time\}\}/g, timeStr)
              .replace(/\{\{title\}\}/g, 'New Note')

            // Generate unique ID with better collision avoidance
            const newId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

            // Generate smart title based on template type
            const generateTitle = (templateName: string, date: string) => {
              if (templateName.toLowerCase().includes('daily')) return `Daily Note - ${date}`
              if (templateName.toLowerCase().includes('meeting')) return 'Meeting Notes'
              if (templateName.toLowerCase().includes('project')) return 'Project Planning'
              return templateName || 'New Note'
            }

            const newNote: Note = {
              id: newId,
              title: generateTitle(template.name, dateStr),
              content,
              notebook: 'personal',
              tags: [template.category.toLowerCase()],
              status: 'draft',
              isPinned: false,
              isTrashed: false,
              createdAt: now.toISOString(),
              updatedAt: now.toISOString()
            }

            // Validate note before adding
            if (!newNote.title || !newNote.content) {
              throw new Error('Generated note is invalid')
            }

            // Persist the newly created note
            storageService.saveNote(newNote)

            return {
              notes: [newNote, ...state.notes],
              currentNote: newNote,
              selectedNoteId: newNote.id,
              isEditorOpen: true
            }
          } catch (error) {
            console.error('Error creating note from template:', error)
            // Return current state on error - UI will handle error display
            return state
          }
        })
    }),
    { name: 'simple-store' }
  )
)

export default useSimpleStore