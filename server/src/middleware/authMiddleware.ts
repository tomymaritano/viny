import { Request, Response, NextFunction } from 'express'
import { authService } from '../services/authService'
import { AuthPayload } from '../services/authService'

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload
    }
  }
}

/**
 * Middleware to authenticate requests using JWT tokens
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'Access token required'
      })
      return
    }
    
    const token = authHeader.substring(7) // Remove 'Bearer ' prefix
    
    // Verify token
    const payload = authService.verifyAccessToken(token)
    
    // Add user data to request object
    req.user = payload
    
    next()
  } catch (error) {
    res.status(401).json({
      success: false,
      error: error instanceof Error ? error.message : 'Authentication failed'
    })
  }
}

/**
 * Optional authentication middleware - doesn't fail if no token provided
 */
export const optionalAuthenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      const payload = authService.verifyAccessToken(token)
      req.user = payload
    }
    
    next()
  } catch (error) {
    // Don't fail if token is invalid in optional auth
    next()
  }
}

/**
 * Middleware to check if user owns the resource
 */
export const authorize = (resourceUserIdParam: string = 'userId') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const currentUserId = req.user?.userId
      const resourceUserId = parseInt(req.params[resourceUserIdParam] || req.body.userId)
      
      if (!currentUserId) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        })
        return
      }
      
      if (currentUserId !== resourceUserId) {
        res.status(403).json({
          success: false,
          error: 'Access denied - insufficient permissions'
        })
        return
      }
      
      next()
    } catch (error) {
      res.status(403).json({
        success: false,
        error: error instanceof Error ? error.message : 'Authorization failed'
      })
    }
  }
}

/**
 * Middleware to ensure user is authenticated and add user ID to request body
 */
export const injectUserId = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const userId = req.user?.userId
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated'
      })
      return
    }
    
    // Add userId to request body for database operations
    req.body.userId = userId
    
    next()
  } catch (error) {
    res.status(401).json({
      success: false,
      error: error instanceof Error ? error.message : 'User injection failed'
    })
  }
}

/**
 * Middleware to check if user is admin (for future use)
 */
export const requireAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.userId
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated'
      })
      return
    }
    
    // For now, we don't have admin roles, but this is where we'd check
    // const user = await authService.getUserById(userId)
    // if (!user.isAdmin) {
    //   return res.status(403).json({
    //     success: false,
    //     error: 'Admin access required'
    //   })
    // }
    
    next()
  } catch (error) {
    res.status(403).json({
      success: false,
      error: error instanceof Error ? error.message : 'Admin check failed'
    })
  }
}

/**
 * Rate limiting middleware for auth endpoints
 */
export const authRateLimit = (windowMs: number = 15 * 60 * 1000, max: number = 5) => {
  const attempts = new Map<string, { count: number; resetTime: number }>()
  
  return (req: Request, res: Response, next: NextFunction): void => {
    const clientIp = req.ip || req.connection.remoteAddress || 'unknown'
    const now = Date.now()
    
    const clientAttempts = attempts.get(clientIp)
    
    if (!clientAttempts || now > clientAttempts.resetTime) {
      attempts.set(clientIp, { count: 1, resetTime: now + windowMs })
      next()
      return
    }
    
    if (clientAttempts.count >= max) {
      res.status(429).json({
        success: false,
        error: 'Too many authentication attempts. Please try again later.',
        retryAfter: Math.ceil((clientAttempts.resetTime - now) / 1000)
      })
      return
    }
    
    clientAttempts.count++
    next()
  }
}