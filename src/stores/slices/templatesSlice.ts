import type { StateCreator } from 'zustand'
import type { Note } from '../../types'
import type { IDocumentRepository } from '../../lib/repositories/RepositoryFactory'
import {
  createDocumentRepository,
  StorageError,
} from '../../lib/repositories/RepositoryFactory'
import { storageLogger as logger } from '../../utils/logger'
import { generateId } from '../../utils/idUtils'
import { getCurrentTimestamp } from '../../utils/dateUtils'

export interface Template {
  id: string
  name: string
  content: string
  description: string
  category: string
  createdAt: string
}

export interface TemplatesSlice {
  // Templates state
  templates: Template[]
  loading: boolean
  error: string | null

  // Templates actions (now async)
  loadTemplates: () => Promise<void>
  addTemplate: (template: Template) => Promise<Template | null>
  updateTemplate: (template: Template) => Promise<void>
  removeTemplate: (id: string) => Promise<void>
  createNoteFromTemplate: (
    templateId: string,
    notesSlice?: any
  ) => Promise<Note | null>

  // Internal methods
  _setTemplates: (templates: Template[]) => void
  _setError: (error: string | null) => void
  _setLoading: (loading: boolean) => void
}

// Default templates
const defaultTemplates: Template[] = [
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
    createdAt: getCurrentTimestamp(),
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
    createdAt: getCurrentTimestamp(),
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
    createdAt: getCurrentTimestamp(),
  },
]

export const createTemplatesSlice: StateCreator<
  TemplatesSlice,
  [],
  [],
  TemplatesSlice
> = (set, get) => {
  // Initialize repository
  const repository: IDocumentRepository = createDocumentRepository()

  // Helper to handle async operations with error handling
  const withErrorHandling = async <T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T | null> => {
    try {
      set({ loading: true, error: null })
      const result = await operation()
      set({ loading: false })
      return result
    } catch (error) {
      const errorMessage =
        error instanceof StorageError
          ? `${operationName} failed: ${error.message}`
          : `${operationName} failed unexpectedly`

      logger.error(`Templates ${operationName} error:`, error)
      set({ loading: false, error: errorMessage })
      return null
    }
  }

  return {
    // Initial state
    templates: defaultTemplates,
    loading: false,
    error: null,

    // Load templates from storage (for future use)
    loadTemplates: async () => {
      // For now, templates are static defaults
      // In future, we could load custom templates from storage
      set({ templates: defaultTemplates })
      logger.debug('Templates loaded successfully')
    },

    addTemplate: async template => {
      // For now, just add to memory (could be enhanced to persist)
      const success = await withErrorHandling(async () => {
        // TODO: Persist template to storage when template persistence is needed
        return template
      }, 'add')

      if (success) {
        set(state => ({
          templates: [...state.templates, template],
        }))
        logger.debug('Template added successfully', template.id)
      }

      return success
    },

    updateTemplate: async updatedTemplate => {
      const success = await withErrorHandling(async () => {
        // TODO: Persist template to storage when template persistence is needed
        return true
      }, 'update')

      if (success) {
        set(state => ({
          templates: state.templates.map(template =>
            template.id === updatedTemplate.id ? updatedTemplate : template
          ),
        }))
        logger.debug('Template updated successfully', updatedTemplate.id)
      }
    },

    removeTemplate: async templateId => {
      const success = await withErrorHandling(async () => {
        // TODO: Remove template from storage when template persistence is needed
        return true
      }, 'remove')

      if (success) {
        set(state => ({
          templates: state.templates.filter(
            template => template.id !== templateId
          ),
        }))
        logger.debug('Template removed successfully', templateId)
      }
    },

    createNoteFromTemplate: async (templateId, notesSlice?) => {
      const state = get()

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

        // Replace template variables
        const now = new Date()
        const dateStr = now.toLocaleDateString()
        const timeStr = now.toLocaleTimeString()

        const content = template.content
          .replace(/\{\{date\}\}/g, dateStr)
          .replace(/\{\{time\}\}/g, timeStr)
          .replace(/\{\{title\}\}/g, 'New Note')

        // Generate unique ID
        const newId = generateId('note')

        // Generate smart title based on template type
        const generateTitle = (templateName: string, date: string) => {
          if (templateName.toLowerCase().includes('daily'))
            return `Daily Note - ${date}`
          if (templateName.toLowerCase().includes('meeting'))
            return 'Meeting Notes'
          if (templateName.toLowerCase().includes('project'))
            return 'Project Planning'
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
          updatedAt: now.toISOString(),
        }

        // Validate note before returning
        if (!newNote.title || !newNote.content) {
          throw new Error('Generated note is invalid')
        }

        // Save the note using repository pattern
        const savedNote = await withErrorHandling(async () => {
          const result = await repository.saveNote(newNote)
          return result
        }, 'create from template')

        if (savedNote && notesSlice?.addNote) {
          // Add to notes slice if provided
          await notesSlice.addNote(savedNote)
        }

        return savedNote
      } catch (error) {
        logger.error('Error creating note from template:', error)
        return null
      }
    },

    // Internal state management
    _setTemplates: templates => set({ templates }),
    _setError: error => set({ error }),
    _setLoading: loading => set({ loading }),
  }
}

// Initialize templates on slice creation
export const initializeTemplates = async (slice: TemplatesSlice) => {
  await slice.loadTemplates()
}
