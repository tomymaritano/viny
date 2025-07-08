import { z } from 'zod'

// Note schemas
export const CreateNoteSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().default(''),
  notebook: z.string().default('Personal'),
  status: z.enum(['draft', 'in-progress', 'review', 'completed', 'archived']).default('draft'),
  isPinned: z.boolean().default(false),
  tags: z.array(z.string()).default([])
})

export const UpdateNoteSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  content: z.string().optional(),
  notebook: z.string().optional(),
  status: z.enum(['draft', 'in-progress', 'review', 'completed', 'archived']).optional(),
  isPinned: z.boolean().optional(),
  isTrashed: z.boolean().optional(),
  tags: z.array(z.string()).optional()
})

// Tag schemas
export const CreateTagSchema = z.object({
  name: z.string().min(1, 'Tag name is required'),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format').default('#268bd2')
})

export const UpdateTagSchema = z.object({
  name: z.string().min(1, 'Tag name is required').optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format').optional()
})

// Notebook schemas
export const CreateNotebookSchema = z.object({
  name: z.string().min(1, 'Notebook name is required'),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format').default('#268bd2')
})

export const UpdateNotebookSchema = z.object({
  name: z.string().min(1, 'Notebook name is required').optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format').optional()
})

// Query schemas
export const NotesQuerySchema = z.object({
  notebook: z.string().optional(),
  status: z.enum(['draft', 'in-progress', 'review', 'completed', 'archived']).optional(),
  isPinned: z.boolean().optional(),
  isTrashed: z.boolean().optional(),
  tags: z.string().optional(), // Comma-separated tag names
  search: z.string().optional(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0)
})

// Type exports
export type CreateNoteInput = z.infer<typeof CreateNoteSchema>
export type UpdateNoteInput = z.infer<typeof UpdateNoteSchema>
export type CreateTagInput = z.infer<typeof CreateTagSchema>
export type UpdateTagInput = z.infer<typeof UpdateTagSchema>
export type CreateNotebookInput = z.infer<typeof CreateNotebookSchema>
export type UpdateNotebookInput = z.infer<typeof UpdateNotebookSchema>
export type NotesQueryInput = z.infer<typeof NotesQuerySchema>