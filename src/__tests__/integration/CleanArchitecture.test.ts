/**
 * Integration tests for Clean Architecture implementation
 * Tests the complete flow through all 4 layers
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'

// Use real timers for these integration tests
vi.useRealTimers()

// Repository
import { DexieCrudRepository } from '../../repositories/dexie/DexieCrudRepository'
import type { IRepository } from '../../repositories/interfaces/IBaseRepository'

// Services
import { NoteServiceV2 } from '../../services/notes/NoteServiceV2'
import { NotebookServiceV2 } from '../../services/notebooks/NotebookServiceV2'
import { SettingsServiceV2 } from '../../services/settings/SettingsServiceV2'

// Hooks
import { useActiveNotesQueryV2, useCreateNoteMutationV2 } from '../../hooks/queries/useNotesServiceQueryV2'
import { useNotebooksQueryV2, useCreateNotebookMutationV2 } from '../../hooks/queries/useNotebooksServiceQueryV2'
import { useSettingsQueryV2, useUpdateSettingsMutationV2 } from '../../hooks/queries/useSettingsServiceQueryV2'

// Import ServiceProviderV2
import { ServiceProviderV2 } from '../../contexts/ServiceProviderV2'

// Mock the ServiceProviderV2 module
vi.mock('../../contexts/ServiceProviderV2', () => {
  const ServiceContext = React.createContext<any>(null)
  
  return {
    ServiceProviderV2: ({ children, services }: any) => 
      React.createElement(ServiceContext.Provider, { value: services }, children),
    useServices: () => {
      const context = React.useContext(ServiceContext)
      if (!context) throw new Error('useServices must be used within ServiceProvider')
      return context
    },
    useNoteService: () => {
      const context = React.useContext(ServiceContext)
      if (!context) throw new Error('useNoteService must be used within ServiceProvider')
      return context.noteService
    },
    useNotebookService: () => {
      const context = React.useContext(ServiceContext)
      if (!context) throw new Error('useNotebookService must be used within ServiceProvider')
      return context.notebookService
    },
    useSettingsService: () => {
      const context = React.useContext(ServiceContext)
      if (!context) throw new Error('useSettingsService must be used within ServiceProvider')
      return context.settingsService
    },
  }
})

// Test utilities
const createWrapper = (services: any) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  
  return ({ children }: { children: React.ReactNode }) => {
    return React.createElement(
      QueryClientProvider,
      { client: queryClient },
      React.createElement(
        ServiceProviderV2 as any,
        { services },
        children
      )
    )
  }
}

describe('Clean Architecture Integration', () => {
  let repository: IRepository
  let noteService: NoteServiceV2
  let notebookService: NotebookServiceV2
  let settingsService: SettingsServiceV2
  
  beforeEach(async () => {
    // Create repository
    repository = new DexieCrudRepository()
    await repository.initialize()
    
    // Create services
    noteService = new NoteServiceV2(repository)
    notebookService = new NotebookServiceV2(repository)
    settingsService = new SettingsServiceV2(repository)
  }, 30000) // Increase timeout for IndexedDB operations
  
  afterEach(async () => {
    // Clean up database state
    if (repository) {
      // Clear all data between tests
      const allNotes = await repository.notes.findAll()
      for (const note of allNotes) {
        await repository.notes.delete(note.id)
      }
      
      const allNotebooks = await repository.notebooks.findAll()
      for (const notebook of allNotebooks) {
        if (notebook.id !== 'default') {
          await repository.notebooks.delete(notebook.id)
        }
      }
      
      // Close repository
      await repository.close()
    }
  })
  
  describe('Repository Layer', () => {
    it('should perform pure CRUD operations without business logic', async () => {
      // Create a note with repository
      const note = await repository.notes.create({
        id: '1',
        title: 'Test Note',
        content: 'Content',
        notebookId: 'default',
        status: 'active',
        tags: ['test'],
        isPinned: false,
        isTrashed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      
      expect(note.id).toBe('1')
      expect(note.title).toBe('Test Note')
      
      // Repository should NOT filter by isTrashed
      const allNotes = await repository.notes.findAll()
      expect(allNotes).toHaveLength(1)
      
      // Update note to trashed
      await repository.notes.update('1', { isTrashed: true })
      
      // Repository still returns all notes (no filtering)
      const notesAfterTrash = await repository.notes.findAll()
      expect(notesAfterTrash).toHaveLength(1)
      expect(notesAfterTrash[0].isTrashed).toBe(true)
    })
  })
  
  describe('Service Layer', () => {
    it('should handle business logic and filtering', async () => {
      // Create notes through service
      const activeNote = await noteService.createNote({
        title: 'Active Note',
        content: 'Content',
      })
      
      const trashedNote = await noteService.createNote({
        title: 'Trashed Note',
        content: 'Content',
      })
      
      // Move one to trash
      await noteService.moveToTrash(trashedNote.id)
      
      // Service filters active notes
      const activeNotes = await noteService.getActiveNotes()
      expect(activeNotes).toHaveLength(1)
      expect(activeNotes[0].title).toBe('Active Note')
      
      // Service can get trashed notes
      const trashedNotes = await noteService.getTrashedNotes()
      expect(trashedNotes).toHaveLength(1)
      expect(trashedNotes[0].title).toBe('Trashed Note')
    })
    
    it('should validate data before saving', async () => {
      // Try to create note without title
      await expect(
        noteService.createNote({ title: '', content: 'Content' })
      ).rejects.toThrow('Title is required')
      
      // Try to create notebook without name
      await expect(
        notebookService.createNotebook({ name: '' })
      ).rejects.toThrow('Notebook name is required')
    })
  })
  
  describe('TanStack Query Layer', () => {
    it('should cache and manage data state', async () => {
      const services = { noteService, notebookService, settingsService, repository }
      
      const wrapper = createWrapper(services)
      
      // Test note query
      const { result } = renderHook(() => useActiveNotesQueryV2(), { wrapper })
      
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })
      
      // Should initially have no notes (clean database)
      expect(result.current.data).toEqual([])
      
      // Create a note
      const { result: mutationResult } = renderHook(
        () => useCreateNoteMutationV2(),
        { wrapper }
      )
      
      await mutationResult.current.mutateAsync({
        title: 'New Note',
        content: 'Content',
      })
      
      // Query should be updated
      await waitFor(() => {
        expect(result.current.data).toHaveLength(1)
      })
    })
  })
  
  describe('End-to-End Flow', () => {
    it('should handle complete note lifecycle', async () => {
      // 1. Create notebook
      const notebook = await notebookService.createNotebook({
        name: 'My Notebook',
      })
      
      // 2. Create note in notebook
      const note = await noteService.createNote({
        title: 'My Note',
        content: '# Hello World',
        notebookId: notebook.id,
      })
      
      // 3. Update note
      const updated = await noteService.updateNote(note.id, {
        title: 'Updated Note',
        tags: ['important'],
      })
      
      expect(updated.title).toBe('Updated Note')
      expect(updated.tags).toContain('important')
      
      // 4. Pin note
      const pinned = await noteService.togglePin(note.id)
      expect(pinned.isPinned).toBe(true)
      
      // 5. Move to trash
      await noteService.moveToTrash(note.id)
      
      // 6. Verify it's in trash
      const activeNotes = await noteService.getActiveNotes()
      const trashedNotes = await noteService.getTrashedNotes()
      
      expect(activeNotes).toHaveLength(0)
      expect(trashedNotes).toHaveLength(1)
      
      // 7. Restore from trash
      const restored = await noteService.restoreNote(note.id)
      expect(restored.isTrashed).toBe(false)
      
      // 8. Permanently delete
      await noteService.deleteNote(note.id, true)
      
      // 9. Verify it's gone
      const allNotes = await noteService.getAllNotes()
      expect(allNotes).toHaveLength(0)
    })
    
    it('should handle settings lifecycle', async () => {
      // Get default settings
      const defaults = await settingsService.getSettings()
      expect(defaults.theme).toBe('dark')
      
      // Update theme
      await settingsService.setTheme('light')
      
      const updated = await settingsService.getSettings()
      expect(updated.theme).toBe('light')
      
      // Export settings
      const exported = await settingsService.exportSettings()
      expect(exported).toContain('"theme": "light"')
      
      // Reset settings
      await settingsService.resetSettings()
      
      const reset = await settingsService.getSettings()
      expect(reset.theme).toBe('dark')
      
      // Import settings
      const importResult = await settingsService.importSettings(exported)
      expect(importResult.success).toBe(true)
      expect(importResult.settings.theme).toBe('light')
    })
  })
  
  describe('Error Handling', () => {
    it('should handle repository errors gracefully', async () => {
      // Mock repository error
      vi.spyOn(repository.notes, 'findAll').mockRejectedValueOnce(
        new Error('Database error')
      )
      
      await expect(noteService.getAllNotes()).rejects.toThrow(
        'Failed to retrieve notes'
      )
    })
    
    it('should validate business rules', async () => {
      // Create notebook
      const notebook = await notebookService.createNotebook({
        name: 'Parent',
      })
      
      // Create child notebook
      const child = await notebookService.createNotebook({
        name: 'Child',
        parentId: notebook.id,
      })
      
      // Try to move parent under child (circular reference)
      await expect(
        notebookService.moveNotebook(notebook.id, child.id)
      ).rejects.toThrow('Cannot move notebook to this location')
      
      // Try to delete notebook with children
      await expect(
        notebookService.deleteNotebook(notebook.id)
      ).rejects.toThrow('Cannot delete notebook with child notebooks')
    })
  })
})