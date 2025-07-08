import { prisma } from '../index'

// Migration utility to import notes from localStorage format
export interface LocalStorageNote {
  id: number
  title: string
  content: string
  preview?: string
  date: string
  notebook: string
  isPinned: boolean
  tags?: string[]
  status?: string
  isTrashed?: boolean
  trashedAt?: string
  updatedAt?: string
}

export const migrateFromLocalStorage = async (notes: LocalStorageNote[]) => {
  console.log(`Starting migration of ${notes.length} notes...`)
  
  let migratedCount = 0
  let skippedCount = 0

  for (const note of notes) {
    try {
      // Check if note already exists
      const existingNote = await prisma.note.findUnique({
        where: { id: note.id }
      })

      if (existingNote) {
        console.log(`Note ${note.id} already exists, skipping...`)
        skippedCount++
        continue
      }

      // Create the note
      const createdNote = await prisma.note.create({
        data: {
          id: note.id,
          title: note.title,
          content: note.content,
          preview: note.preview || note.content.substring(0, 100) + (note.content.length > 100 ? '...' : ''),
          notebook: note.notebook,
          status: note.status || 'draft',
          isPinned: note.isPinned || false,
          isTrashed: note.isTrashed || false,
          createdAt: new Date(note.date),
          updatedAt: note.updatedAt ? new Date(note.updatedAt) : new Date(note.date),
          trashedAt: note.trashedAt ? new Date(note.trashedAt) : null
        }
      })

      // Handle tags
      if (note.tags && note.tags.length > 0) {
        for (const tagName of note.tags) {
          // Find or create tag
          let tag = await prisma.tag.findUnique({
            where: { name: tagName }
          })

          if (!tag) {
            tag = await prisma.tag.create({
              data: { name: tagName }
            })
          }

          // Link tag to note
          await prisma.noteTags.create({
            data: {
              noteId: createdNote.id,
              tagId: tag.id
            }
          })
        }
      }

      migratedCount++
      console.log(`✓ Migrated note: ${note.title}`)
    } catch (error) {
      console.error(`✗ Failed to migrate note ${note.id}:`, error)
    }
  }

  console.log(`Migration completed: ${migratedCount} migrated, ${skippedCount} skipped`)
  return { migratedCount, skippedCount }
}

// Create default notebooks
export const createDefaultNotebooks = async () => {
  const defaultNotebooks = [
    { name: 'Personal', color: '#268bd2' },
    { name: 'Work', color: '#859900' },
    { name: 'Projects', color: '#d33682' },
    { name: 'Learning', color: '#cb4b16' },
    { name: 'Archive', color: '#6c71c4' }
  ]

  for (const notebook of defaultNotebooks) {
    try {
      const existing = await prisma.notebook.findUnique({
        where: { name: notebook.name }
      })

      if (!existing) {
        await prisma.notebook.create({
          data: notebook
        })
        console.log(`✓ Created notebook: ${notebook.name}`)
      }
    } catch (error) {
      console.error(`✗ Failed to create notebook ${notebook.name}:`, error)
    }
  }
}