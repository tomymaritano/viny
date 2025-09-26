import { Request, Response } from 'express'
import { authService } from '../services/authService'
import { z } from 'zod'

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  name: z.string().min(1).max(100).optional(),
  password: z.string().min(8, 'Password must be at least 8 characters long')
})

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
})

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required')
})

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters long')
})

const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  avatar: z.string().url().optional()
})

/**
 * Register new user
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = registerSchema.parse(req.body)
    
    const result = await authService.register(validatedData)
    
    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })
    
    res.status(201).json({
      success: true,
      data: {
        user: result.user,
        accessToken: result.accessToken
      },
      message: 'User registered successfully'
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors
      })
      return
    }
    
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Registration failed'
    })
    return
  }
}

/**
 * Login user
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = loginSchema.parse(req.body)
    
    const result = await authService.login(validatedData)
    
    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })
    
    res.json({
      success: true,
      data: {
        user: result.user,
        accessToken: result.accessToken
      },
      message: 'Login successful'
    })
    return
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors
      })
      return
    }
    
    res.status(401).json({
      success: false,
      error: error instanceof Error ? error.message : 'Login failed'
    })
    return
  }
}

/**
 * Refresh access token
 */
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    // Try to get refresh token from cookie first, then from body
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken
    
    if (!refreshToken) {
      res.status(401).json({
        success: false,
        error: 'Refresh token not provided'
      })
      return
    }
    
    const result = await authService.refreshAccessToken(refreshToken)
    
    // Set new refresh token as httpOnly cookie
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })
    
    res.json({
      success: true,
      data: {
        accessToken: result.accessToken
      },
      message: 'Token refreshed successfully'
    })
    return
  } catch (error) {
    res.status(401).json({
      success: false,
      error: error instanceof Error ? error.message : 'Token refresh failed'
    })
    return
  }
}

/**
 * Logout user
 */
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated'
      })
      return
    }
    
    await authService.logout(userId)
    
    // Clear refresh token cookie
    res.clearCookie('refreshToken')
    
    res.json({
      success: true,
      message: 'Logout successful'
    })
    return
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Logout failed'
    })
    return
  }
}

/**
 * Get current user profile
 */
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated'
      })
      return
    }
    
    const user = await authService.getUserById(userId)
    
    res.json({
      success: true,
      data: { user },
      message: 'Profile retrieved successfully'
    })
    return
  } catch (error) {
    res.status(404).json({
      success: false,
      error: error instanceof Error ? error.message : 'Profile not found'
    })
    return
  }
}

/**
 * Update user profile
 */
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated'
      })
      return
    }
    
    const validatedData = updateProfileSchema.parse(req.body)
    
    const user = await authService.updateProfile(userId, validatedData)
    
    res.json({
      success: true,
      data: { user },
      message: 'Profile updated successfully'
    })
    return
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors
      })
      return
    }
    
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Profile update failed'
    })
    return
  }
}

/**
 * Change password
 */
export const changePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated'
      })
      return
    }
    
    const validatedData = changePasswordSchema.parse(req.body)
    
    await authService.changePassword(userId, validatedData.currentPassword, validatedData.newPassword)
    
    // Clear refresh token cookie to force re-login
    res.clearCookie('refreshToken')
    
    res.json({
      success: true,
      message: 'Password changed successfully. Please log in again.'
    })
    return
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors
      })
      return
    }
    
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Password change failed'
    })
    return
  }
}

/**
 * Verify access token (for frontend to check if user is authenticated)
 */
export const verifyToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated'
      })
      return
    }
    
    const user = await authService.getUserById(userId)
    
    res.json({
      success: true,
      data: { user },
      message: 'Token is valid'
    })
    return
  } catch (error) {
    res.status(401).json({
      success: false,
      error: error instanceof Error ? error.message : 'Token verification failed'
    })
    return
  }
}