import { Router } from 'express'
import {
  getNotebooks,
  getNotebookById,
  createNotebook,
  updateNotebook,
  deleteNotebook
} from '../controllers/notebooksController'

const router = Router()

// GET /api/notebooks - Get all notebooks
router.get('/', getNotebooks)

// GET /api/notebooks/:id - Get specific notebook
router.get('/:id', getNotebookById)

// POST /api/notebooks - Create new notebook
router.post('/', createNotebook)

// PUT /api/notebooks/:id - Update notebook
router.put('/:id', updateNotebook)

// DELETE /api/notebooks/:id - Delete notebook
router.delete('/:id', deleteNotebook)

export default router