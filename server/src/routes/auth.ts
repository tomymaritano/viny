import { Router } from 'express'
import {
  register,
  login,
  logout,
  refreshToken,
  getProfile,
  updateProfile,
  changePassword,
  verifyToken
} from '../controllers/authController'
import { authenticate, authRateLimit } from '../middleware/authMiddleware'

const router = Router()

// Public routes (no authentication required)
router.post('/register', authRateLimit(), register)
router.post('/login', authRateLimit(), login)
router.post('/refresh-token', refreshToken)

// Protected routes (authentication required)
router.use(authenticate) // All routes below this require authentication

router.post('/logout', logout)
router.get('/profile', getProfile)
router.put('/profile', updateProfile)
router.post('/change-password', changePassword)
router.get('/verify-token', verifyToken)

export default router