import { StateCreator } from 'zustand'
import { Note } from '../../types'
import { storageService } from '../../lib/storage'

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

  // Templates actions
  addTemplate: (template: Template) => void
  updateTemplate: (template: Template) => void
  removeTemplate: (id: string) => void
  createNoteFromTemplate: (templateId: string) => Note | null
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
]

export const createTemplatesSlice: StateCreator<TemplatesSlice, [], [], TemplatesSlice> = (set, get) => ({
  // Initial state
  templates: defaultTemplates,

  // Actions
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

  createNoteFromTemplate: (templateId) => {
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
      
      let content = template.content
        .replace(/\{\{date\}\}/g, dateStr)
        .replace(/\{\{time\}\}/g, timeStr)
        .replace(/\{\{title\}\}/g, 'New Note')

      // Generate unique ID
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

      // Validate note before returning
      if (!newNote.title || !newNote.content) {
        throw new Error('Generated note is invalid')
      }

      // Persist the newly created note
      storageService.saveNote(newNote)

      return newNote
    } catch (error) {
      console.error('Error creating note from template:', error)
      return null
    }
  }
})