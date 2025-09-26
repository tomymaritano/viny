/**
 * Simplified integration test to debug the clean architecture
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { DexieCrudRepository } from '../../repositories/dexie/DexieCrudRepository'
import { NoteServiceV2 } from '../../services/notes/NoteServiceV2'

// Use real timers
vi.useRealTimers()

describe('Simple Clean Architecture Test', () => {
  it('should initialize repository', async () => {
    const repository = new DexieCrudRepository()
    
    // Test initialization
    await expect(repository.initialize()).resolves.not.toThrow()
    
    // Test close
    await expect(repository.close()).resolves.not.toThrow()
  })
  
  it('should create a note through repository', async () => {
    const repository = new DexieCrudRepository()
    await repository.initialize()
    
    // Create a note
    const note = await repository.notes.create({
      id: 'test-1',
      title: 'Test Note',
      content: 'Test Content',
      notebookId: 'default',
      status: 'active',
      tags: [],
      isPinned: false,
      isTrashed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    
    expect(note.id).toBe('test-1')
    expect(note.title).toBe('Test Note')
    
    // Clean up
    await repository.close()
  })
  
  it('should create a note through service', async () => {
    const repository = new DexieCrudRepository()
    await repository.initialize()
    
    const noteService = new NoteServiceV2(repository)
    
    // Create a note
    const note = await noteService.createNote({
      title: 'Service Test Note',
      content: 'Service Test Content',
    })
    
    expect(note.title).toBe('Service Test Note')
    expect(note.isTrashed).toBe(false)
    
    // Clean up
    await repository.close()
  })
})