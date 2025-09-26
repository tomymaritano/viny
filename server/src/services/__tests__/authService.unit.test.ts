import { describe, it, expect, beforeEach, vi } from 'vitest'
import { AuthService } from '../authService'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

// Simple unit tests without database dependency
describe('AuthService Unit Tests', () => {
  let authService: AuthService
  let mockPrisma: any

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks()
    
    // Mock the prisma instance
    mockPrisma = {
      user: {
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
    }
    
    // Create fresh service instance with mocked prisma
    authService = new AuthService(mockPrisma)
  })

  describe('Password Operations', () => {
    it('should hash password correctly', async () => {
      const password = 'testPassword123'
      const hashedPassword = await authService.hashPassword(password)
      
      expect(hashedPassword).toBeDefined()
      expect(hashedPassword).not.toBe(password)
      expect(hashedPassword.length).toBeGreaterThan(50)
    })

    it('should verify password correctly', async () => {
      const password = 'testPassword123'
      const hashedPassword = await authService.hashPassword(password)
      
      const isValid = await authService.verifyPassword(password, hashedPassword)
      expect(isValid).toBe(true)
      
      const isInvalid = await authService.verifyPassword('wrongPassword', hashedPassword)
      expect(isInvalid).toBe(false)
    })

    it('should reject invalid passwords', async () => {
      const validHash = await authService.hashPassword('validPassword')
      
      const isValid = await authService.verifyPassword('invalidPassword', validHash)
      expect(isValid).toBe(false)
    })
  })

  describe('JWT Token Operations', () => {
    const mockPayload = {
      userId: 1,
      email: 'test@example.com',
      name: 'Test User'
    }

    it('should generate access token', () => {
      const token = authService.generateAccessToken(mockPayload)
      
      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      expect(token.split('.').length).toBe(3) // JWT has 3 parts
    })

    it('should generate refresh token', () => {
      const token = authService.generateRefreshToken(mockPayload)
      
      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      expect(token.split('.').length).toBe(3)
    })

    it('should verify access token correctly', () => {
      const token = authService.generateAccessToken(mockPayload)
      const decoded = authService.verifyAccessToken(token)
      
      expect(decoded.userId).toBe(mockPayload.userId)
      expect(decoded.email).toBe(mockPayload.email)
      expect(decoded.name).toBe(mockPayload.name)
    })

    it('should verify refresh token correctly', () => {
      const token = authService.generateRefreshToken(mockPayload)
      const decoded = authService.verifyRefreshToken(token)
      
      expect(decoded.userId).toBe(mockPayload.userId)
      expect(decoded.email).toBe(mockPayload.email)
      expect(decoded.name).toBe(mockPayload.name)
    })

    it('should reject invalid access token', () => {
      expect(() => {
        authService.verifyAccessToken('invalid.token.here')
      }).toThrow('Invalid or expired access token')
    })

    it('should reject invalid refresh token', () => {
      expect(() => {
        authService.verifyRefreshToken('invalid.token.here')
      }).toThrow('Invalid or expired refresh token')
    })
  })

  describe('User Registration', () => {
    it('should register new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123'
      }

      const mockUser = {
        id: 1,
        email: userData.email,
        name: userData.name,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      mockPrisma.user.findUnique.mockResolvedValue(null) // User doesn't exist
      mockPrisma.user.create.mockResolvedValue(mockUser)
      mockPrisma.user.update.mockResolvedValue(mockUser)

      const result = await authService.register(userData)

      expect(result.user.email).toBe(userData.email)
      expect(result.user.name).toBe(userData.name)
      expect(result.accessToken).toBeDefined()
      expect(result.refreshToken).toBeDefined()
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          email: userData.email,
          name: userData.name,
          password: expect.any(String)
        },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          updatedAt: true
        }
      })
    })

    it('should reject registration with existing email', async () => {
      const userData = {
        email: 'existing@example.com',
        password: 'password123'
      }

      mockPrisma.user.findUnique.mockResolvedValue({ id: 1 }) // User exists

      await expect(authService.register(userData)).rejects.toThrow(
        'User with this email already exists'
      )
    })

    it('should handle registration without name', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123'
      }

      const mockUser = {
        id: 1,
        email: userData.email,
        name: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      mockPrisma.user.findUnique.mockResolvedValue(null)
      mockPrisma.user.create.mockResolvedValue(mockUser)
      mockPrisma.user.update.mockResolvedValue(mockUser)

      const result = await authService.register(userData)

      expect(result.user.email).toBe(userData.email)
      expect(result.user.name).toBeNull()
    })
  })

  describe('User Login', () => {
    it('should login user successfully', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      }

      const hashedPassword = await authService.hashPassword(loginData.password)
      const mockUser = {
        id: 1,
        email: loginData.email,
        name: 'Test User',
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: new Date()
      }

      mockPrisma.user.findUnique.mockResolvedValue(mockUser)
      mockPrisma.user.update.mockResolvedValue(mockUser)

      const result = await authService.login(loginData)

      expect(result.user.email).toBe(loginData.email)
      expect(result.accessToken).toBeDefined()
      expect(result.refreshToken).toBeDefined()
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: {
          refreshToken: expect.any(String),
          lastLogin: expect.any(Date)
        }
      })
    })

    it('should reject login with non-existent email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      }

      mockPrisma.user.findUnique.mockResolvedValue(null)

      await expect(authService.login(loginData)).rejects.toThrow(
        'Invalid email or password'
      )
    })

    it('should reject login with incorrect password', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      }

      const hashedPassword = await authService.hashPassword('correctpassword')
      const mockUser = {
        id: 1,
        email: loginData.email,
        password: hashedPassword
      }

      mockPrisma.user.findUnique.mockResolvedValue(mockUser)

      await expect(authService.login(loginData)).rejects.toThrow(
        'Invalid email or password'
      )
    })
  })

  describe('Token Refresh', () => {
    it('should refresh access token successfully', async () => {
      const payload = {
        userId: 1,
        email: 'test@example.com',
        name: 'Test User'
      }

      const refreshToken = authService.generateRefreshToken(payload)
      const mockUser = {
        id: 1,
        email: payload.email,
        name: payload.name,
        refreshToken
      }

      mockPrisma.user.findFirst.mockResolvedValue(mockUser)
      mockPrisma.user.update.mockResolvedValue(mockUser)

      // Wait a bit to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 1))

      const result = await authService.refreshAccessToken(refreshToken)

      expect(result.accessToken).toBeDefined()
      expect(result.refreshToken).toBeDefined()
      expect(typeof result.refreshToken).toBe('string')
      expect(result.refreshToken.split('.').length).toBe(3) // Should be valid JWT
    })

    it('should reject refresh with invalid token', async () => {
      await expect(
        authService.refreshAccessToken('invalid.token.here')
      ).rejects.toThrow('Invalid or expired refresh token')
    })

    it('should reject refresh with token not in database', async () => {
      const payload = {
        userId: 1,
        email: 'test@example.com',
        name: 'Test User'
      }

      const refreshToken = authService.generateRefreshToken(payload)
      mockPrisma.user.findFirst.mockResolvedValue(null) // Token not in DB

      await expect(
        authService.refreshAccessToken(refreshToken)
      ).rejects.toThrow('Invalid or expired refresh token')
    })
  })

  describe('User Operations', () => {
    it('should get user by ID successfully', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        avatar: null,
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: new Date()
      }

      mockPrisma.user.findUnique.mockResolvedValue(mockUser)

      const result = await authService.getUserById(1)

      expect(result).toEqual(mockUser)
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
          lastLogin: true
        }
      })
    })

    it('should throw error for non-existent user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)

      await expect(authService.getUserById(999)).rejects.toThrow('User not found')
    })

    it('should update user profile successfully', async () => {
      const updateData = {
        name: 'Updated Name',
        avatar: 'https://example.com/avatar.jpg'
      }

      const mockUser = {
        id: 1,
        email: 'test@example.com',
        ...updateData,
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: new Date()
      }

      mockPrisma.user.update.mockResolvedValue(mockUser)

      const result = await authService.updateProfile(1, updateData)

      expect(result).toEqual(mockUser)
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateData,
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
          lastLogin: true
        }
      })
    })

    it('should logout user successfully', async () => {
      mockPrisma.user.update.mockResolvedValue({})

      await authService.logout(1)

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { refreshToken: null }
      })
    })
  })

  describe('Password Change', () => {
    it('should change password successfully', async () => {
      const userId = 1
      const currentPassword = 'oldPassword123'
      const newPassword = 'newPassword123'

      const hashedCurrentPassword = await authService.hashPassword(currentPassword)
      const mockUser = {
        id: userId,
        email: 'test@example.com',
        password: hashedCurrentPassword
      }

      mockPrisma.user.findUnique.mockResolvedValue(mockUser)
      mockPrisma.user.update.mockResolvedValue({})

      await authService.changePassword(userId, currentPassword, newPassword)

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: {
          password: expect.any(String),
          refreshToken: null
        }
      })
    })

    it('should reject password change for non-existent user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)

      await expect(
        authService.changePassword(999, 'oldPassword', 'newPassword')
      ).rejects.toThrow('User not found')
    })

    it('should reject password change with incorrect current password', async () => {
      const userId = 1
      const currentPassword = 'wrongPassword'
      const newPassword = 'newPassword123'

      const hashedCurrentPassword = await authService.hashPassword('correctPassword')
      const mockUser = {
        id: userId,
        email: 'test@example.com',
        password: hashedCurrentPassword
      }

      mockPrisma.user.findUnique.mockResolvedValue(mockUser)

      await expect(
        authService.changePassword(userId, currentPassword, newPassword)
      ).rejects.toThrow('Current password is incorrect')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty strings', async () => {
      await expect(authService.hashPassword('')).resolves.toBeDefined()
      
      const hash = await authService.hashPassword('test')
      await expect(authService.verifyPassword('', hash)).resolves.toBe(false)
    })

    it('should handle very long passwords', async () => {
      const longPassword = 'a'.repeat(1000)
      const hash = await authService.hashPassword(longPassword)
      const isValid = await authService.verifyPassword(longPassword, hash)
      
      expect(isValid).toBe(true)
    })

    it('should handle special characters in passwords', async () => {
      const specialPassword = '!@#$%^&*()_+[]{}|;:,.<>?'
      const hash = await authService.hashPassword(specialPassword)
      const isValid = await authService.verifyPassword(specialPassword, hash)
      
      expect(isValid).toBe(true)
    })
  })
})