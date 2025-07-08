import { Router } from 'express'
import {
  getNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote
} from '../controllers/notesController'

const router = Router()

// GET /api/notes - Get all notes with optional filtering
router.get('/', getNotes)

// GET /api/notes/:id - Get specific note
router.get('/:id', getNoteById)

// POST /api/notes - Create new note
router.post('/', createNote)

// PUT /api/notes/:id - Update note
router.put('/:id', updateNote)

// DELETE /api/notes/:id - Delete note permanently
router.delete('/:id', deleteNote)

export default router