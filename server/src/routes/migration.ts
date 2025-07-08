import { Router } from 'express'
import {
  importFromLocalStorage,
  exportAllData,
  getStats,
  resetDatabase
} from '../controllers/migrationController'

const router = Router()

// POST /api/migration/import - Import from localStorage
router.post('/import', importFromLocalStorage)

// GET /api/migration/export - Export all data
router.get('/export', exportAllData)

// GET /api/migration/stats - Get database statistics
router.get('/stats', getStats)

// POST /api/migration/reset - Reset database (development only)
router.post('/reset', resetDatabase)

export default router