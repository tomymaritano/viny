import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createStore } from 'zustand'
import { createNotesSlice, NotesSlice } from '../slices/notesSlice'
import type { Note } from '../../types'

// Mock storage service
vi.mock('../../lib/storage', () => ({
  storageService: {
    saveNote: vi.fn(),
    deleteNote: vi.fn(),
    getNotes: vi.fn().mockReturnValue([])
  }
}))

describe('NotesSlice', () => {
  let store: ReturnType<typeof createStore<NotesSlice>>

  const mockNote1: Note = {
    id: '1',
    title: 'First Note',
    content: 'Content 1',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    tags: ['tag1'],
    notebook: 'work',
    status: 'active'
  }

  const mockNote2: Note = {
    id: '2',
    title: 'Second Note',
    content: 'Content 2',
    createdAt: '2025-01-02T00:00:00.000Z',
    updatedAt: '2025-01-02T00:00:00.000Z',
    tags: ['tag2'],
    notebook: 'personal',
    status: 'none'
  }

  beforeEach(() => {
    store = createStore<NotesSlice>()(createNotesSlice)
  })

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = store.getState()
      expect(state.notes).toEqual([])
      expect(state.currentNote).toBeNull()
      expect(state.selectedNoteId).toBeNull()
      expect(state.isEditorOpen).toBe(false)
      expect(state.sortBy).toBe('updated')
      expect(state.sortDirection).toBe('desc')
    })
  })

  describe('Notes Management', () => {
    it('should set notes', () => {
      const notes = [mockNote1, mockNote2]
      
      store.getState().setNotes(notes)
      
      expect(store.getState().notes).toEqual(notes)
    })

    it('should add new note', () => {
      store.getState().addNote(mockNote1)
      
      expect(store.getState().notes).toEqual([mockNote1])
    })

    it('should update existing note', () => {
      // Set initial notes
      store.getState().setNotes([mockNote1, mockNote2])
      
      const updatedNote = { ...mockNote1, title: 'Updated Title' }
      store.getState().updateNote(updatedNote)
      
      const notes = store.getState().notes
      expect(notes.find(n => n.id === '1')?.title).toBe('Updated Title')
    })

    it('should remove note', () => {
      // Set initial notes
      store.getState().setNotes([mockNote1, mockNote2])
      
      store.getState().removeNote('1')
      
      expect(store.getState().notes).toEqual([mockNote2])
    })

    it('should handle removing non-existent note', () => {
      store.getState().setNotes([mockNote1])
      
      store.getState().removeNote('999')
      
      expect(store.getState().notes).toEqual([mockNote1])
    })
  })

  describe('Current Note Management', () => {
    it('should set current note', () => {
      store.getState().setCurrentNote(mockNote1)
      
      expect(store.getState().currentNote).toEqual(mockNote1)
    })

    it('should clear current note', () => {
      store.getState().setCurrentNote(mockNote1)
      store.getState().setCurrentNote(null)
      
      expect(store.getState().currentNote).toBeNull()
    })

    it('should set selected note ID', () => {
      store.getState().setSelectedNoteId('1')
      
      expect(store.getState().selectedNoteId).toBe('1')
    })

    it('should set editor open state', () => {
      store.getState().setIsEditorOpen(true)
      
      expect(store.getState().isEditorOpen).toBe(true)
    })
  })

  describe('Sorting', () => {
    it('should set sort criteria', () => {
      store.getState().setSortBy('title')
      
      expect(store.getState().sortBy).toBe('title')
    })

    it('should set sort direction', () => {
      store.getState().setSortDirection('asc')
      
      expect(store.getState().sortDirection).toBe('asc')
    })

    it('should sort notes by title ascending', () => {
      store.getState().setNotes([mockNote2, mockNote1]) // Start unsorted
      store.getState().setSortBy('title')
      store.getState().setSortDirection('asc')
      
      store.getState().sortNotes()
      
      const notes = store.getState().notes
      expect(notes[0].title).toBe('First Note')
      expect(notes[1].title).toBe('Second Note')
    })

    it('should sort notes by title descending', () => {
      store.getState().setNotes([mockNote1, mockNote2])
      store.getState().setSortBy('title')
      store.getState().setSortDirection('desc')
      
      store.getState().sortNotes()
      
      const notes = store.getState().notes
      expect(notes[0].title).toBe('Second Note')
      expect(notes[1].title).toBe('First Note')
    })

    it('should sort notes by date', () => {
      store.getState().setNotes([mockNote2, mockNote1]) // Start with newer first
      store.getState().setSortBy('date')
      store.getState().setSortDirection('asc')
      
      store.getState().sortNotes()
      
      const notes = store.getState().notes
      expect(notes[0].id).toBe('1') // Older note first
      expect(notes[1].id).toBe('2')
    })

    it('should sort notes by updated date', () => {
      store.getState().setNotes([mockNote1, mockNote2])
      store.getState().setSortBy('updated')
      store.getState().setSortDirection('desc')
      
      store.getState().sortNotes()
      
      const notes = store.getState().notes
      expect(notes[0].id).toBe('2') // Newer updated note first
      expect(notes[1].id).toBe('1')
    })

    it('should sort notes by notebook', () => {
      store.getState().setNotes([mockNote1, mockNote2]) // work, personal
      store.getState().setSortBy('notebook')
      store.getState().setSortDirection('asc')
      
      store.getState().sortNotes()
      
      const notes = store.getState().notes
      expect(notes[0].notebook).toBe('personal') // Alphabetically first
      expect(notes[1].notebook).toBe('work')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty notes array for sorting', () => {
      store.getState().setSortBy('title')
      store.getState().setSortDirection('asc')
      
      store.getState().sortNotes()
      
      expect(store.getState().notes).toEqual([])
    })

    it('should handle single note for sorting', () => {
      store.getState().setNotes([mockNote1])
      store.getState().setSortBy('title')
      store.getState().setSortDirection('asc')
      
      store.getState().sortNotes()
      
      expect(store.getState().notes).toEqual([mockNote1])
    })

    it('should handle notes with same values when sorting', () => {
      const note1 = { ...mockNote1, title: 'Same Title' }
      const note2 = { ...mockNote2, title: 'Same Title' }
      
      store.getState().setNotes([note1, note2])
      store.getState().setSortBy('title')
      store.getState().setSortDirection('asc')
      
      store.getState().sortNotes()
      
      // Should maintain relative order for same values
      const notes = store.getState().notes
      expect(notes).toHaveLength(2)
      expect(notes.every(n => n.title === 'Same Title')).toBe(true)
    })

    it('should handle updating note that does not exist', () => {
      store.getState().setNotes([mockNote1])
      const nonExistentNote = { ...mockNote2, id: '999' }
      
      store.getState().updateNote(nonExistentNote)
      
      // Current implementation only updates existing notes, doesn't add new ones
      const notes = store.getState().notes
      expect(notes).toEqual([mockNote1])
    })
  })

  describe('Complex Scenarios', () => {
    it('should handle multiple operations in sequence', () => {
      // Add note
      store.getState().addNote(mockNote1)
      expect(store.getState().notes).toEqual([mockNote1])

      // Set current note
      store.getState().setCurrentNote(mockNote1)
      expect(store.getState().currentNote).toEqual(mockNote1)

      // Open editor
      store.getState().setIsEditorOpen(true)
      expect(store.getState().isEditorOpen).toBe(true)

      // Update note
      const updatedNote = { ...mockNote1, title: 'Updated' }
      store.getState().updateNote(updatedNote)
      expect(store.getState().notes[0].title).toBe('Updated')
      expect(store.getState().currentNote?.title).toBe('Updated')
    })

    it('should maintain data integrity during operations', () => {
      store.getState().setNotes([mockNote1, mockNote2])
      
      // Update and remove in sequence
      const updatedNote = { ...mockNote1, title: 'Updated' }
      store.getState().updateNote(updatedNote)
      
      const notesAfterUpdate = store.getState().notes
      expect(notesAfterUpdate.find(n => n.id === '1')?.title).toBe('Updated')
      
      store.getState().removeNote('2')
      
      const finalNotes = store.getState().notes
      expect(finalNotes).toHaveLength(1)
      expect(finalNotes[0].id).toBe('1')
    })
  })
})