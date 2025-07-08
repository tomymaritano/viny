import { Router } from 'express'
import {
  getTags,
  getTagById,
  createTag,
  updateTag,
  deleteTag
} from '../controllers/tagsController'

const router = Router()

// GET /api/tags - Get all tags
router.get('/', getTags)

// GET /api/tags/:id - Get specific tag
router.get('/:id', getTagById)

// POST /api/tags - Create new tag
router.post('/', createTag)

// PUT /api/tags/:id - Update tag
router.put('/:id', updateTag)

// DELETE /api/tags/:id - Delete tag
router.delete('/:id', deleteTag)

export default router