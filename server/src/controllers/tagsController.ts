import { Request, Response, NextFunction } from 'express'
import { prisma } from '../index'
import { CreateTagSchema, UpdateTagSchema } from '../types'
import { createError } from '../middleware/errorHandler'

// Get all tags
export const getTags = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tags = await prisma.tag.findMany({
      include: {
        _count: {
          select: {
            notes: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    const transformedTags = tags.map(tag => ({
      id: tag.id,
      name: tag.name,
      color: tag.color,
      noteCount: tag._count.notes
    }))

    res.json(transformedTags)
  } catch (error) {
    next(error)
  }
}

// Get tag by ID
export const getTagById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const tagId = parseInt(id)

    if (isNaN(tagId)) {
      throw createError('Invalid tag ID', 400)
    }

    const tag = await prisma.tag.findUnique({
      where: { id: tagId },
      include: {
        _count: {
          select: {
            notes: true
          }
        }
      }
    })

    if (!tag) {
      throw createError('Tag not found', 404)
    }

    const transformedTag = {
      id: tag.id,
      name: tag.name,
      color: tag.color,
      noteCount: tag._count.notes
    }

    res.json(transformedTag)
  } catch (error) {
    next(error)
  }
}

// Create new tag
export const createTag = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = CreateTagSchema.parse(req.body)

    const tag = await prisma.tag.create({
      data: validatedData,
      include: {
        _count: {
          select: {
            notes: true
          }
        }
      }
    })

    const transformedTag = {
      id: tag.id,
      name: tag.name,
      color: tag.color,
      noteCount: tag._count.notes
    }

    res.status(201).json(transformedTag)
  } catch (error) {
    next(error)
  }
}

// Update tag
export const updateTag = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const tagId = parseInt(id)

    if (isNaN(tagId)) {
      throw createError('Invalid tag ID', 400)
    }

    const validatedData = UpdateTagSchema.parse(req.body)

    const existingTag = await prisma.tag.findUnique({
      where: { id: tagId }
    })

    if (!existingTag) {
      throw createError('Tag not found', 404)
    }

    const tag = await prisma.tag.update({
      where: { id: tagId },
      data: validatedData,
      include: {
        _count: {
          select: {
            notes: true
          }
        }
      }
    })

    const transformedTag = {
      id: tag.id,
      name: tag.name,
      color: tag.color,
      noteCount: tag._count.notes
    }

    res.json(transformedTag)
  } catch (error) {
    next(error)
  }
}

// Delete tag
export const deleteTag = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const tagId = parseInt(id)

    if (isNaN(tagId)) {
      throw createError('Invalid tag ID', 400)
    }

    const tag = await prisma.tag.findUnique({
      where: { id: tagId }
    })

    if (!tag) {
      throw createError('Tag not found', 404)
    }

    // Delete tag (this will cascade delete note_tags relationships)
    await prisma.tag.delete({
      where: { id: tagId }
    })

    res.status(204).send()
  } catch (error) {
    next(error)
  }
}