import { Router } from 'express'
import {
  getNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote
} from '../controllers/notesController'
import { authenticate, injectUserId } from '../middleware/authMiddleware'

const router = Router()

// Apply authentication to all routes
router.use(authenticate)

// GET /api/notes - Get all notes with optional filtering
router.get('/', getNotes)

// GET /api/notes/:id - Get specific note
router.get('/:id', getNoteById)

// POST /api/notes - Create new note
router.post('/', injectUserId, createNote)

// PUT /api/notes/:id - Update note
router.put('/:id', updateNote)

// DELETE /api/notes/:id - Delete note permanently
router.delete('/:id', deleteNote)

export default router