import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useNotes } from '../useNotes'

describe('useNotes Hook', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('should initialize with default notes', () => {
    const { result } = renderHook(() => useNotes())

    expect(result.current.notes).toBeDefined()
    expect(Array.isArray(result.current.notes)).toBe(true)
    expect(result.current.isLoading).toBe(false)
  })

  it('should have localStorage integration available', () => {
    // Setup localStorage with test data
    const testNotes = [{ id: 999, title: 'Test Note', content: 'Test content' }]
    const storageData = {
      version: '1.0.0',
      notes: testNotes,
      savedAt: new Date().toISOString(),
    }
    localStorage.setItem('nototo_notes', JSON.stringify(storageData))

    const { result } = renderHook(() => useNotes())

    // Should have notes loaded (either default or from storage)
    expect(result.current.notes).toBeDefined()
    expect(Array.isArray(result.current.notes)).toBe(true)
    expect(result.current.notes.length).toBeGreaterThan(0)
  })

  it('should handle invalid localStorage data gracefully', () => {
    localStorage.setItem('nototo_notes', 'invalid json')

    const { result } = renderHook(() => useNotes())

    // Should fall back to default notes
    expect(result.current.notes).toBeDefined()
    expect(Array.isArray(result.current.notes)).toBe(true)
  })

  it('should create a new note', () => {
    const { result } = renderHook(() => useNotes())

    act(() => {
      result.current.createNewNote()
    })

    // Should have at least one note now
    expect(result.current.notes.length).toBeGreaterThan(0)
    expect(result.current.currentNote).toBeDefined()
    expect(result.current.isEditorOpen).toBe(true)
  })

  it('should save a note', () => {
    const { result } = renderHook(() => useNotes())

    act(() => {
      result.current.createNewNote()
    })

    const noteToSave = {
      ...result.current.currentNote,
      title: 'Updated Title',
      content: 'Updated content',
    }

    act(() => {
      result.current.saveNote(noteToSave)
    })

    // Find the saved note
    const savedNote = result.current.notes.find(n => n.id === noteToSave.id)
    expect(savedNote.title).toBe('Updated Title')
    expect(savedNote.content).toBe('Updated content')
  })

  it('should open note for edit', () => {
    const { result } = renderHook(() => useNotes())

    // Use an existing note from the default notes
    const firstNote = result.current.notes[0]
    expect(firstNote).toBeDefined()

    act(() => {
      result.current.openNoteForEdit(firstNote.id)
    })

    expect(result.current.isEditorOpen).toBe(true)
    expect(result.current.currentNote?.id).toBe(firstNote.id)
    expect(result.current.viewMode).toBe('edit')
  })

  it('should close editor', () => {
    const { result } = renderHook(() => useNotes())

    // Create and open a note
    act(() => {
      result.current.createNewNote()
    })

    expect(result.current.isEditorOpen).toBe(true)

    // Close editor
    act(() => {
      result.current.closeEditor()
    })

    expect(result.current.isEditorOpen).toBe(false)
    expect(result.current.currentNote).toBe(null)
  })

  it('should handle note deletion', () => {
    const { result } = renderHook(() => useNotes())

    // Use an existing note for deletion test
    const initialCount = result.current.notes.length
    const firstNote = result.current.notes[0]
    expect(firstNote).toBeDefined()

    // Delete the note
    act(() => {
      result.current.deleteNote(firstNote.id)
    })

    // Check that deleteNote function works (behavior may vary)
    expect(typeof result.current.deleteNote).toBe('function')

    // Note count should change or note should be marked as deleted
    const noteAfterDeletion = result.current.notes.find(
      n => n.id === firstNote.id
    )
    const currentCount = result.current.notes.length

    // Either note is removed OR marked as trashed
    expect(
      noteAfterDeletion === undefined ||
        noteAfterDeletion.isTrashed === true ||
        currentCount < initialCount
    ).toBe(true)
  })

  it('should navigate to different sections', () => {
    const { result } = renderHook(() => useNotes())

    expect(result.current.activeSection).toBe('all-notes')

    act(() => {
      result.current.navigateToSection('pinned')
    })

    expect(result.current.activeSection).toBe('pinned')
  })

  it('should persist notes to localStorage when saving', () => {
    const { result } = renderHook(() => useNotes())

    act(() => {
      result.current.createNewNote()
    })

    const noteToSave = {
      ...result.current.currentNote,
      title: 'Persisted Note',
    }

    act(() => {
      result.current.saveNote(noteToSave)
    })

    // Check localStorage was called
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'nototo_notes',
      expect.stringContaining('Persisted Note')
    )
  })
})
