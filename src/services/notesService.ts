// Notes service extensions for Knowledge Graph features
import type { Note } from '../types'
import { createDocumentRepository } from '../lib/repositories/RepositoryFactory'

export async function searchNotes(query: string): Promise<Note[]> {
  const repository = createDocumentRepository()
  await repository.initialize()

  const allNotes = await repository.getAll()

  // Simple text search - in production, use proper search index
  const searchQuery = query.toLowerCase()
  return allNotes.filter(
    note =>
      note.title.toLowerCase().includes(searchQuery) ||
      note.content.toLowerCase().includes(searchQuery) ||
      note.tags.some(tag => tag.toLowerCase().includes(searchQuery))
  )
}

export async function getNotesByIds(ids: string[]): Promise<Note[]> {
  const repository = createDocumentRepository()
  await repository.initialize()

  const notes: Note[] = []
  for (const id of ids) {
    const note = await repository.get(id)
    if (note) notes.push(note)
  }

  return notes
}

export async function getNotesInDateRange(
  startDate: Date,
  endDate: Date
): Promise<Note[]> {
  const repository = createDocumentRepository()
  await repository.initialize()

  const allNotes = await repository.getAll()

  return allNotes.filter(note => {
    const noteDate = new Date(note.updatedAt)
    return noteDate >= startDate && noteDate <= endDate
  })
}

export async function getRelatedNotes(noteId: string): Promise<Note[]> {
  const repository = createDocumentRepository()
  await repository.initialize()

  const note = await repository.get(noteId)
  if (!note) return []

  const allNotes = await repository.getAll()

  // Find notes with similar tags
  const relatedByTags = allNotes.filter(
    n => n.id !== noteId && n.tags.some(tag => note.tags.includes(tag))
  )

  // Find notes that reference this note
  const relatedByReference = allNotes.filter(
    n => n.id !== noteId && n.content.includes(noteId)
  )

  // Combine and deduplicate
  const relatedSet = new Set([...relatedByTags, ...relatedByReference])
  return Array.from(relatedSet)
}

export async function analyzeNoteLinks(note: Note): Promise<{
  backlinks: string[]
  forwardLinks: string[]
}> {
  const repository = createDocumentRepository()
  await repository.initialize()

  const allNotes = await repository.getAll()

  // Find notes that link to this note (backlinks)
  const backlinks = allNotes
    .filter(n => n.id !== note.id && n.content.includes(note.id))
    .map(n => n.id)

  // Find notes this note links to (forward links)
  // Simple pattern matching for [[note-id]] or note IDs
  const noteIdPattern = /\[\[([^\]]+)\]\]|note-[\w-]+/g
  const matches = note.content.matchAll(noteIdPattern)
  const forwardLinks: string[] = []

  for (const match of matches) {
    const potentialId = match[1] || match[0]
    if (allNotes.some(n => n.id === potentialId)) {
      forwardLinks.push(potentialId)
    }
  }

  return {
    backlinks: [...new Set(backlinks)],
    forwardLinks: [...new Set(forwardLinks)],
  }
}
