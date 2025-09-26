import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface AuthPayload {
  userId: number
  email: string
  name?: string
}

export interface LoginData {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  name?: string
  password: string
}

export class AuthService {
  private readonly JWT_SECRET: string
  private readonly JWT_REFRESH_SECRET: string
  private readonly JWT_EXPIRES_IN: string
  private readonly JWT_REFRESH_EXPIRES_IN: string
  private readonly prisma: PrismaClient

  constructor(prismaInstance?: PrismaClient) {
    this.JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
    this.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production'
    this.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m'
    this.JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d'
    this.prisma = prismaInstance || prisma
  }

  /**
   * Hash password using bcrypt
   */
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12
    return await bcrypt.hash(password, saltRounds)
  }

  /**
   * Verify password against hash
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash)
  }

  /**
   * Generate JWT access token
   */
  generateAccessToken(payload: AuthPayload): string {
    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES_IN,
      issuer: 'viny-api',
      audience: 'viny-client'
    } as jwt.SignOptions)
  }

  /**
   * Generate JWT refresh token
   */
  generateRefreshToken(payload: AuthPayload): string {
    return jwt.sign(payload, this.JWT_REFRESH_SECRET, {
      expiresIn: this.JWT_REFRESH_EXPIRES_IN,
      issuer: 'viny-api',
      audience: 'viny-client'
    } as jwt.SignOptions)
  }

  /**
   * Verify JWT access token
   */
  verifyAccessToken(token: string): AuthPayload {
    try {
      return jwt.verify(token, this.JWT_SECRET, {
        issuer: 'viny-api',
        audience: 'viny-client'
      }) as AuthPayload
    } catch (error) {
      throw new Error('Invalid or expired access token')
    }
  }

  /**
   * Verify JWT refresh token
   */
  verifyRefreshToken(token: string): AuthPayload {
    try {
      return jwt.verify(token, this.JWT_REFRESH_SECRET, {
        issuer: 'viny-api',
        audience: 'viny-client'
      }) as AuthPayload
    } catch (error) {
      throw new Error('Invalid or expired refresh token')
    }
  }

  /**
   * Register new user
   */
  async register(userData: RegisterData) {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: userData.email }
    })

    if (existingUser) {
      throw new Error('User with this email already exists')
    }

    // Hash password
    const hashedPassword = await this.hashPassword(userData.password)

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: userData.email,
        name: userData.name || null,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    // Generate tokens
    const authPayload: AuthPayload = {
      userId: user.id,
      email: user.email,
      name: user.name || undefined
    }

    const accessToken = this.generateAccessToken(authPayload)
    const refreshToken = this.generateRefreshToken(authPayload)

    // Store refresh token in database
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken }
    })

    return {
      user,
      accessToken,
      refreshToken
    }
  }

  /**
   * Login user
   */
  async login(loginData: LoginData) {
    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email: loginData.email }
    })

    if (!user) {
      throw new Error('Invalid email or password')
    }

    // Verify password
    const isPasswordValid = await this.verifyPassword(loginData.password, user.password)
    if (!isPasswordValid) {
      throw new Error('Invalid email or password')
    }

    // Generate tokens
    const authPayload: AuthPayload = {
      userId: user.id,
      email: user.email,
      name: user.name || undefined
    }

    const accessToken = this.generateAccessToken(authPayload)
    const refreshToken = this.generateRefreshToken(authPayload)

    // Store refresh token and update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { 
        refreshToken,
        lastLogin: new Date()
      }
    })

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastLogin: user.lastLogin
      },
      accessToken,
      refreshToken
    }
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken: string) {
    try {
      // Verify refresh token
      const payload = this.verifyRefreshToken(refreshToken)

      // Check if refresh token exists in database
      const user = await this.prisma.user.findFirst({
        where: { 
          id: payload.userId,
          refreshToken: refreshToken
        }
      })

      if (!user) {
        throw new Error('Invalid refresh token')
      }

      // Generate new tokens
      const authPayload: AuthPayload = {
        userId: user.id,
        email: user.email,
        name: user.name || undefined
      }

      const newAccessToken = this.generateAccessToken(authPayload)
      const newRefreshToken = this.generateRefreshToken(authPayload)

      // Update refresh token in database
      await this.prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: newRefreshToken }
      })

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      }
    } catch (error) {
      throw new Error('Invalid or expired refresh token')
    }
  }

  /**
   * Logout user (invalidate refresh token)
   */
  async logout(userId: number) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null }
    })
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
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

    if (!user) {
      throw new Error('User not found')
    }

    return user
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: number, updateData: { name?: string; avatar?: string }) {
    const user = await this.prisma.user.update({
      where: { id: userId },
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

    return user
  }

  /**
   * Change password
   */
  async changePassword(userId: number, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      throw new Error('User not found')
    }

    // Verify current password
    const isCurrentPasswordValid = await this.verifyPassword(currentPassword, user.password)
    if (!isCurrentPasswordValid) {
      throw new Error('Current password is incorrect')
    }

    // Hash new password
    const hashedNewPassword = await this.hashPassword(newPassword)

    // Update password and invalidate refresh token
    await this.prisma.user.update({
      where: { id: userId },
      data: { 
        password: hashedNewPassword,
        refreshToken: null // Force re-login
      }
    })
  }
}

export const authService = new AuthService()