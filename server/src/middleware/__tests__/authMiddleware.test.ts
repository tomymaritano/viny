import { describe, it, expect, beforeEach, vi } from 'vitest'
import { authenticate, optionalAuthenticate, authorize, injectUserId, authRateLimit } from '../authMiddleware'
import { authService } from '../../services/authService'
import { Request, Response, NextFunction } from 'express'

// Mock authService
vi.mock('../../services/authService', () => ({
  authService: {
    verifyAccessToken: vi.fn(),
  },
}))

describe('AuthMiddleware', () => {
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let mockNext: NextFunction

  beforeEach(() => {
    vi.clearAllMocks()
    
    mockRequest = {
      headers: {},
      user: undefined,
      params: {},
      body: {},
      ip: '127.0.0.1',
      connection: { remoteAddress: '127.0.0.1' } as any,
    }
    
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    }
    
    mockNext = vi.fn()
  })

  describe('authenticate', () => {
    it('should authenticate user with valid token', async () => {
      const mockPayload = {
        userId: 1,
        email: 'test@example.com',
        name: 'Test User',
      }

      mockRequest.headers = {
        authorization: 'Bearer valid-token',
      }

      vi.mocked(authService.verifyAccessToken).mockReturnValue(mockPayload)

      await authenticate(mockRequest as Request, mockResponse as Response, mockNext)

      expect(authService.verifyAccessToken).toHaveBeenCalledWith('valid-token')
      expect(mockRequest.user).toEqual(mockPayload)
      expect(mockNext).toHaveBeenCalled()
      expect(mockResponse.status).not.toHaveBeenCalled()
    })

    it('should reject request without authorization header', async () => {
      mockRequest.headers = {}

      await authenticate(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockResponse.status).toHaveBeenCalledWith(401)
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Access token required',
      })
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('should reject request with invalid authorization format', async () => {
      mockRequest.headers = {
        authorization: 'Invalid token-format',
      }

      await authenticate(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockResponse.status).toHaveBeenCalledWith(401)
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Access token required',
      })
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('should reject request with invalid token', async () => {
      mockRequest.headers = {
        authorization: 'Bearer invalid-token',
      }

      vi.mocked(authService.verifyAccessToken).mockImplementation(() => {
        throw new Error('Invalid token')
      })

      await authenticate(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockResponse.status).toHaveBeenCalledWith(401)
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid token',
      })
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('should handle non-Error exceptions', async () => {
      mockRequest.headers = {
        authorization: 'Bearer invalid-token',
      }

      vi.mocked(authService.verifyAccessToken).mockImplementation(() => {
        throw 'String error'
      })

      await authenticate(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockResponse.status).toHaveBeenCalledWith(401)
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Authentication failed',
      })
      expect(mockNext).not.toHaveBeenCalled()
    })
  })

  describe('optionalAuthenticate', () => {
    it('should authenticate user with valid token', async () => {
      const mockPayload = {
        userId: 1,
        email: 'test@example.com',
        name: 'Test User',
      }

      mockRequest.headers = {
        authorization: 'Bearer valid-token',
      }

      vi.mocked(authService.verifyAccessToken).mockReturnValue(mockPayload)

      await optionalAuthenticate(mockRequest as Request, mockResponse as Response, mockNext)

      expect(authService.verifyAccessToken).toHaveBeenCalledWith('valid-token')
      expect(mockRequest.user).toEqual(mockPayload)
      expect(mockNext).toHaveBeenCalled()
    })

    it('should continue without authentication if no token provided', async () => {
      mockRequest.headers = {}

      await optionalAuthenticate(mockRequest as Request, mockResponse as Response, mockNext)

      expect(authService.verifyAccessToken).not.toHaveBeenCalled()
      expect(mockRequest.user).toBeUndefined()
      expect(mockNext).toHaveBeenCalled()
    })

    it('should continue without authentication if token is invalid', async () => {
      mockRequest.headers = {
        authorization: 'Bearer invalid-token',
      }

      vi.mocked(authService.verifyAccessToken).mockImplementation(() => {
        throw new Error('Invalid token')
      })

      await optionalAuthenticate(mockRequest as Request, mockResponse as Response, mockNext)

      expect(authService.verifyAccessToken).toHaveBeenCalledWith('invalid-token')
      expect(mockRequest.user).toBeUndefined()
      expect(mockNext).toHaveBeenCalled()
    })

    it('should handle invalid authorization format gracefully', async () => {
      mockRequest.headers = {
        authorization: 'Invalid token-format',
      }

      await optionalAuthenticate(mockRequest as Request, mockResponse as Response, mockNext)

      expect(authService.verifyAccessToken).not.toHaveBeenCalled()
      expect(mockRequest.user).toBeUndefined()
      expect(mockNext).toHaveBeenCalled()
    })
  })

  describe('authorize', () => {
    it('should authorize user with matching userId', () => {
      const middleware = authorize('userId')
      
      mockRequest.user = { userId: 1, email: 'test@example.com' }
      mockRequest.params = { userId: '1' }

      middleware(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockNext).toHaveBeenCalled()
      expect(mockResponse.status).not.toHaveBeenCalled()
    })

    it('should authorize user with matching userId from body', () => {
      const middleware = authorize()
      
      mockRequest.user = { userId: 1, email: 'test@example.com' }
      mockRequest.body = { userId: 1 }

      middleware(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockNext).toHaveBeenCalled()
      expect(mockResponse.status).not.toHaveBeenCalled()
    })

    it('should reject unauthenticated user', () => {
      const middleware = authorize('userId')
      
      mockRequest.user = undefined
      mockRequest.params = { userId: '1' }

      middleware(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockResponse.status).toHaveBeenCalledWith(401)
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'User not authenticated',
      })
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('should reject user with non-matching userId', () => {
      const middleware = authorize('userId')
      
      mockRequest.user = { userId: 1, email: 'test@example.com' }
      mockRequest.params = { userId: '2' }

      middleware(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockResponse.status).toHaveBeenCalledWith(403)
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Access denied - insufficient permissions',
      })
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('should handle errors gracefully', () => {
      const middleware = authorize('userId')
      
      mockRequest.user = { userId: 1, email: 'test@example.com' }
      mockRequest.params = { userId: 'invalid' } // Will cause parseInt to return NaN

      middleware(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockResponse.status).toHaveBeenCalledWith(403)
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Access denied - insufficient permissions',
      })
      expect(mockNext).not.toHaveBeenCalled()
    })
  })

  describe('injectUserId', () => {
    it('should inject userId into request body', () => {
      mockRequest.user = { userId: 1, email: 'test@example.com' }
      mockRequest.body = { title: 'Test Note' }

      injectUserId(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockRequest.body.userId).toBe(1)
      expect(mockNext).toHaveBeenCalled()
      expect(mockResponse.status).not.toHaveBeenCalled()
    })

    it('should reject unauthenticated user', () => {
      mockRequest.user = undefined
      mockRequest.body = { title: 'Test Note' }

      injectUserId(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockResponse.status).toHaveBeenCalledWith(401)
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'User not authenticated',
      })
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('should handle errors gracefully', () => {
      mockRequest.user = { userId: 1, email: 'test@example.com' }
      mockRequest.body = undefined // Will cause an error

      injectUserId(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockResponse.status).toHaveBeenCalledWith(401)
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: "Cannot set properties of undefined (setting 'userId')",
      })
      expect(mockNext).not.toHaveBeenCalled()
    })
  })

  describe('authRateLimit', () => {
    it('should allow first request', () => {
      const middleware = authRateLimit(60000, 5) // 1 minute window, 5 attempts
      
      middleware(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockNext).toHaveBeenCalled()
      expect(mockResponse.status).not.toHaveBeenCalled()
    })

    it('should allow multiple requests within limit', () => {
      const middleware = authRateLimit(60000, 5)
      
      // Make 5 requests
      for (let i = 0; i < 5; i++) {
        middleware(mockRequest as Request, mockResponse as Response, mockNext)
      }

      expect(mockNext).toHaveBeenCalledTimes(5)
      expect(mockResponse.status).not.toHaveBeenCalled()
    })

    it('should block requests exceeding limit', () => {
      const middleware = authRateLimit(60000, 2) // 2 attempts limit
      
      // Make 2 allowed requests
      middleware(mockRequest as Request, mockResponse as Response, mockNext)
      middleware(mockRequest as Request, mockResponse as Response, mockNext)
      
      // Third request should be blocked
      vi.clearAllMocks()
      middleware(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockResponse.status).toHaveBeenCalledWith(429)
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Too many authentication attempts. Please try again later.',
        retryAfter: expect.any(Number),
      })
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('should reset after time window', () => {
      const middleware = authRateLimit(10, 1) // 10ms window, 1 attempt
      
      // Make first request
      middleware(mockRequest as Request, mockResponse as Response, mockNext)
      
      // Second request should be blocked
      vi.clearAllMocks()
      middleware(mockRequest as Request, mockResponse as Response, mockNext)
      expect(mockResponse.status).toHaveBeenCalledWith(429)
      
      // Wait for window to reset
      vi.clearAllMocks()
      setTimeout(() => {
        middleware(mockRequest as Request, mockResponse as Response, mockNext)
        expect(mockNext).toHaveBeenCalled()
        expect(mockResponse.status).not.toHaveBeenCalled()
      }, 15) // Wait longer than window
    })

    it('should handle different IP addresses separately', () => {
      const middleware = authRateLimit(60000, 1)
      
      // First IP
      mockRequest.ip = '127.0.0.1'
      middleware(mockRequest as Request, mockResponse as Response, mockNext)
      
      // Second IP should be allowed
      mockRequest.ip = '192.168.1.1'
      vi.clearAllMocks()
      middleware(mockRequest as Request, mockResponse as Response, mockNext)
      
      expect(mockNext).toHaveBeenCalled()
      expect(mockResponse.status).not.toHaveBeenCalled()
    })

    it('should handle missing IP address', () => {
      const middleware = authRateLimit(60000, 1)
      
      mockRequest.ip = undefined
      mockRequest.connection = { remoteAddress: undefined } as any
      
      middleware(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockNext).toHaveBeenCalled()
      expect(mockResponse.status).not.toHaveBeenCalled()
    })
  })

  describe('Edge Cases', () => {
    it('should handle malformed authorization header', async () => {
      mockRequest.headers = {
        authorization: 'Bearer',
      }

      await authenticate(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockResponse.status).toHaveBeenCalledWith(401)
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('should handle empty authorization header', async () => {
      mockRequest.headers = {
        authorization: '',
      }

      await authenticate(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockResponse.status).toHaveBeenCalledWith(401)
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('should handle authorization header with only spaces', async () => {
      mockRequest.headers = {
        authorization: '   ',
      }

      await authenticate(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockResponse.status).toHaveBeenCalledWith(401)
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('should handle case-insensitive Bearer token', async () => {
      const mockPayload = {
        userId: 1,
        email: 'test@example.com',
        name: 'Test User',
      }

      mockRequest.headers = {
        authorization: 'bearer valid-token',
      }

      vi.mocked(authService.verifyAccessToken).mockReturnValue(mockPayload)

      await authenticate(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockNext).not.toHaveBeenCalled()
      expect(mockResponse.status).toHaveBeenCalledWith(401)
    })
  })
})