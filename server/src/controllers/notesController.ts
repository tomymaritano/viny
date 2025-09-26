import { Request, Response, NextFunction } from 'express'
import { prisma } from '../index'
import { CreateNoteSchema, UpdateNoteSchema, NotesQuerySchema } from '../types'
import { createError } from '../middleware/errorHandler'

// Get all notes with optional filtering
export const getNotes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId
    if (!userId) {
      throw createError('User not authenticated', 401)
    }

    const query = NotesQuerySchema.parse({
      ...req.query,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      offset: req.query.offset ? parseInt(req.query.offset as string) : undefined,
      isPinned: req.query.isPinned ? req.query.isPinned === 'true' : undefined,
      isTrashed: req.query.isTrashed ? req.query.isTrashed === 'true' : undefined
    })

    const where: any = {
      userId: userId
    }
    
    if (query.notebook) where.notebook = query.notebook
    if (query.status) where.status = query.status
    if (query.isPinned !== undefined) where.isPinned = query.isPinned
    if (query.isTrashed !== undefined) where.isTrashed = query.isTrashed
    
    // Search functionality
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { content: { contains: query.search, mode: 'insensitive' } }
      ]
    }

    // Tag filtering
    if (query.tags) {
      const tagNames = query.tags.split(',').map(tag => tag.trim())
      where.tags = {
        some: {
          tag: {
            name: {
              in: tagNames
            }
          }
        }
      }
    }

    const notes = await prisma.note.findMany({
      where,
      include: {
        tags: {
          include: {
            tag: true
          }
        }
      },
      orderBy: [
        { isPinned: 'desc' },
        { updatedAt: 'desc' }
      ],
      take: query.limit,
      skip: query.offset
    })

    // Transform the response to match frontend format
    const transformedNotes = notes.map(note => ({
      id: note.id,
      title: note.title,
      content: note.content,
      preview: note.preview || note.content.substring(0, 100) + (note.content.length > 100 ? '...' : ''),
      notebook: note.notebook,
      status: note.status,
      isPinned: note.isPinned,
      isTrashed: note.isTrashed,
      createdAt: note.createdAt.toISOString(),
      updatedAt: note.updatedAt.toISOString(),
      trashedAt: note.trashedAt?.toISOString() || null,
      date: note.createdAt.toISOString().split('T')[0], // Frontend compatibility
      tags: note.tags.map(nt => nt.tag.name)
    }))

    const total = await prisma.note.count({ where })

    res.json({
      notes: transformedNotes,
      pagination: {
        total,
        limit: query.limit,
        offset: query.offset,
        hasMore: query.offset + query.limit < total
      }
    })
  } catch (error) {
    next(error)
  }
}

// Get single note by ID
export const getNoteById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId
    if (!userId) {
      throw createError('User not authenticated', 401)
    }

    const { id } = req.params
    const noteId = parseInt(id)

    if (isNaN(noteId)) {
      throw createError('Invalid note ID', 400)
    }

    const note = await prisma.note.findFirst({
      where: { 
        id: noteId,
        userId: userId
      },
      include: {
        tags: {
          include: {
            tag: true
          }
        }
      }
    })

    if (!note) {
      throw createError('Note not found', 404)
    }

    const transformedNote = {
      id: note.id,
      title: note.title,
      content: note.content,
      preview: note.preview || note.content.substring(0, 100) + (note.content.length > 100 ? '...' : ''),
      notebook: note.notebook,
      status: note.status,
      isPinned: note.isPinned,
      isTrashed: note.isTrashed,
      createdAt: note.createdAt.toISOString(),
      updatedAt: note.updatedAt.toISOString(),
      trashedAt: note.trashedAt?.toISOString() || null,
      date: note.createdAt.toISOString().split('T')[0],
      tags: note.tags.map(nt => nt.tag.name)
    }

    res.json(transformedNote)
  } catch (error) {
    next(error)
  }
}

// Create new note
export const createNote = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId
    if (!userId) {
      throw createError('User not authenticated', 401)
    }

    const validatedData = CreateNoteSchema.parse(req.body)
    
    // Generate preview
    const preview = validatedData.content.length > 0 
      ? validatedData.content.substring(0, 100) + (validatedData.content.length > 100 ? '...' : '')
      : ''

    // Create note
    const note = await prisma.note.create({
      data: {
        title: validatedData.title,
        content: validatedData.content,
        preview,
        notebook: validatedData.notebook,
        status: validatedData.status,
        isPinned: validatedData.isPinned,
        userId: userId
      }
    })

    // Handle tags - optimized with parallel operations
    if (validatedData.tags.length > 0) {
      // Find existing tags in parallel (filtered by userId)
      const existingTags = await prisma.tag.findMany({
        where: { 
          name: { in: validatedData.tags },
          userId: userId
        }
      })
      
      const existingTagNames = new Set(existingTags.map(tag => tag.name))
      const newTagNames = validatedData.tags.filter(name => !existingTagNames.has(name))
      
      // Create new tags in parallel
      const newTags = newTagNames.length > 0 
        ? await Promise.all(
            newTagNames.map(name => 
              prisma.tag.create({ data: { name, userId: userId } })
            )
          )
        : []
      
      // Combine all tags
      const allTags = [...existingTags, ...newTags]
      
      // Create note-tag relationships in parallel
      await Promise.all(
        allTags.map(tag =>
          prisma.noteTags.create({
            data: {
              noteId: note.id,
              tagId: tag.id
            }
          })
        )
      )
    }

    // Fetch the complete note with tags
    const completeNote = await prisma.note.findUnique({
      where: { id: note.id },
      include: {
        tags: {
          include: {
            tag: true
          }
        }
      }
    })

    const transformedNote = {
      id: completeNote!.id,
      title: completeNote!.title,
      content: completeNote!.content,
      preview: completeNote!.preview,
      notebook: completeNote!.notebook,
      status: completeNote!.status,
      isPinned: completeNote!.isPinned,
      isTrashed: completeNote!.isTrashed,
      createdAt: completeNote!.createdAt.toISOString(),
      updatedAt: completeNote!.updatedAt.toISOString(),
      trashedAt: completeNote!.trashedAt?.toISOString() || null,
      date: completeNote!.createdAt.toISOString().split('T')[0],
      tags: completeNote!.tags.map(nt => nt.tag.name)
    }

    res.status(201).json(transformedNote)
  } catch (error) {
    next(error)
  }
}

// Update note
export const updateNote = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId
    if (!userId) {
      throw createError('User not authenticated', 401)
    }

    const { id } = req.params
    const noteId = parseInt(id)

    if (isNaN(noteId)) {
      throw createError('Invalid note ID', 400)
    }

    const validatedData = UpdateNoteSchema.parse(req.body)

    // Check if note exists and belongs to user
    const existingNote = await prisma.note.findFirst({
      where: { 
        id: noteId,
        userId: userId
      }
    })

    if (!existingNote) {
      throw createError('Note not found', 404)
    }

    // Prepare update data
    const updateData: any = {}
    
    if (validatedData.title !== undefined) updateData.title = validatedData.title
    if (validatedData.content !== undefined) {
      updateData.content = validatedData.content
      updateData.preview = validatedData.content.substring(0, 100) + (validatedData.content.length > 100 ? '...' : '')
    }
    if (validatedData.notebook !== undefined) updateData.notebook = validatedData.notebook
    if (validatedData.status !== undefined) updateData.status = validatedData.status
    if (validatedData.isPinned !== undefined) updateData.isPinned = validatedData.isPinned
    if (validatedData.isTrashed !== undefined) {
      updateData.isTrashed = validatedData.isTrashed
      if (validatedData.isTrashed) {
        updateData.trashedAt = new Date()
      } else {
        updateData.trashedAt = null
      }
    }

    // Update note
    const note = await prisma.note.update({
      where: { id: noteId },
      data: updateData
    })

    // Handle tags update - optimized with parallel operations
    if (validatedData.tags !== undefined) {
      // Remove existing tags
      await prisma.noteTags.deleteMany({
        where: { noteId }
      })

      if (validatedData.tags.length > 0) {
        // Find existing tags in parallel (filtered by userId)
        const existingTags = await prisma.tag.findMany({
          where: { 
            name: { in: validatedData.tags },
            userId: userId
          }
        })
        
        const existingTagNames = new Set(existingTags.map(tag => tag.name))
        const newTagNames = validatedData.tags.filter(name => !existingTagNames.has(name))
        
        // Create new tags in parallel
        const newTags = newTagNames.length > 0 
          ? await Promise.all(
              newTagNames.map(name => 
                prisma.tag.create({ data: { name, userId: userId } })
              )
            )
          : []
        
        // Combine all tags
        const allTags = [...existingTags, ...newTags]
        
        // Create note-tag relationships in parallel
        await Promise.all(
          allTags.map(tag =>
            prisma.noteTags.create({
              data: {
                noteId,
                tagId: tag.id
              }
            })
          )
        )
      }
    }

    // Fetch updated note with tags
    const updatedNote = await prisma.note.findUnique({
      where: { id: noteId },
      include: {
        tags: {
          include: {
            tag: true
          }
        }
      }
    })

    const transformedNote = {
      id: updatedNote!.id,
      title: updatedNote!.title,
      content: updatedNote!.content,
      preview: updatedNote!.preview,
      notebook: updatedNote!.notebook,
      status: updatedNote!.status,
      isPinned: updatedNote!.isPinned,
      isTrashed: updatedNote!.isTrashed,
      createdAt: updatedNote!.createdAt.toISOString(),
      updatedAt: updatedNote!.updatedAt.toISOString(),
      trashedAt: updatedNote!.trashedAt?.toISOString() || null,
      date: updatedNote!.createdAt.toISOString().split('T')[0],
      tags: updatedNote!.tags.map(nt => nt.tag.name)
    }

    res.json(transformedNote)
  } catch (error) {
    next(error)
  }
}

// Delete note permanently
export const deleteNote = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId
    if (!userId) {
      throw createError('User not authenticated', 401)
    }

    const { id } = req.params
    const noteId = parseInt(id)

    if (isNaN(noteId)) {
      throw createError('Invalid note ID', 400)
    }

    const note = await prisma.note.findFirst({
      where: { 
        id: noteId,
        userId: userId
      }
    })

    if (!note) {
      throw createError('Note not found', 404)
    }

    // Delete note (this will cascade delete tags due to foreign key constraints)
    await prisma.note.delete({
      where: { id: noteId }
    })

    res.status(204).send()
  } catch (error) {
    next(error)
  }
}