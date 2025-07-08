import { Request, Response, NextFunction } from 'express'
import { prisma } from '../index'
import { migrateFromLocalStorage, createDefaultNotebooks, LocalStorageNote } from '../utils/migration'
import { createError } from '../middleware/errorHandler'
import { z } from 'zod'

const MigrationSchema = z.object({
  notes: z.array(z.object({
    id: z.number(),
    title: z.string(),
    content: z.string(),
    preview: z.string().optional(),
    date: z.string(),
    notebook: z.string(),
    isPinned: z.boolean(),
    tags: z.array(z.string()).optional(),
    status: z.string().optional(),
    isTrashed: z.boolean().optional(),
    trashedAt: z.string().optional(),
    updatedAt: z.string().optional()
  }))
})

// Import notes from localStorage
export const importFromLocalStorage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = MigrationSchema.parse(req.body)
    
    // Create default notebooks first
    await createDefaultNotebooks()
    
    // Migrate notes
    const result = await migrateFromLocalStorage(validatedData.notes)
    
    res.json({
      message: 'Migration completed successfully',
      ...result
    })
  } catch (error) {
    next(error)
  }
}

// Export all data for backup
export const exportAllData = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get all notes with tags
    const notes = await prisma.note.findMany({
      include: {
        tags: {
          include: {
            tag: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    // Get all notebooks
    const notebooks = await prisma.notebook.findMany({
      orderBy: {
        name: 'asc'
      }
    })

    // Get all tags
    const tags = await prisma.tag.findMany({
      orderBy: {
        name: 'asc'
      }
    })

    // Transform notes to match frontend format
    const transformedNotes = notes.map(note => ({
      id: note.id,
      title: note.title,
      content: note.content,
      preview: note.preview,
      notebook: note.notebook,
      status: note.status,
      isPinned: note.isPinned,
      isTrashed: note.isTrashed,
      createdAt: note.createdAt.toISOString(),
      updatedAt: note.updatedAt.toISOString(),
      trashedAt: note.trashedAt?.toISOString() || null,
      date: note.createdAt.toISOString().split('T')[0],
      tags: note.tags.map(nt => nt.tag.name)
    }))

    const exportData = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      notes: transformedNotes,
      notebooks: notebooks.map(nb => ({
        id: nb.id,
        name: nb.name,
        color: nb.color,
        createdAt: nb.createdAt.toISOString()
      })),
      tags: tags.map(tag => ({
        id: tag.id,
        name: tag.name,
        color: tag.color
      })),
      stats: {
        totalNotes: notes.length,
        totalNotebooks: notebooks.length,
        totalTags: tags.length,
        pinnedNotes: notes.filter(n => n.isPinned).length,
        trashedNotes: notes.filter(n => n.isTrashed).length
      }
    }

    res.json(exportData)
  } catch (error) {
    next(error)
  }
}

// Get database statistics
export const getStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const totalNotes = await prisma.note.count()
    const pinnedNotes = await prisma.note.count({ where: { isPinned: true } })
    const trashedNotes = await prisma.note.count({ where: { isTrashed: true } })
    const activeNotes = await prisma.note.count({ where: { isTrashed: false } })
    
    const totalTags = await prisma.tag.count()
    const totalNotebooks = await prisma.notebook.count()

    // Notes by status
    const notesByStatus = await prisma.note.groupBy({
      by: ['status'],
      _count: {
        id: true
      },
      where: {
        isTrashed: false
      }
    })

    // Notes by notebook
    const notesByNotebook = await prisma.note.groupBy({
      by: ['notebook'],
      _count: {
        id: true
      },
      where: {
        isTrashed: false
      }
    })

    const stats = {
      notes: {
        total: totalNotes,
        active: activeNotes,
        pinned: pinnedNotes,
        trashed: trashedNotes,
        byStatus: notesByStatus.map(item => ({
          status: item.status,
          count: item._count.id
        })),
        byNotebook: notesByNotebook.map(item => ({
          notebook: item.notebook,
          count: item._count.id
        }))
      },
      tags: {
        total: totalTags
      },
      notebooks: {
        total: totalNotebooks
      }
    }

    res.json(stats)
  } catch (error) {
    next(error)
  }
}

// Reset database (development only)
export const resetDatabase = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      throw createError('Database reset not allowed in production', 403)
    }

    // Delete all data in correct order (respecting foreign keys)
    await prisma.noteTags.deleteMany()
    await prisma.note.deleteMany()
    await prisma.tag.deleteMany()
    await prisma.notebook.deleteMany()

    // Create default notebooks
    await createDefaultNotebooks()

    res.json({
      message: 'Database reset successfully',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    next(error)
  }
}