import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

interface MCPAuthTokenPayload {
  userId: number
  email: string
  scope: string[]
  iat?: number
  exp?: number
}

export class MCPAuthService {
  private readonly jwtSecret: string
  private readonly tokenExpiry = '30d' // MCP tokens are long-lived

  constructor(jwtSecret: string) {
    this.jwtSecret = jwtSecret
  }

  /**
   * Generate an MCP access token for a user
   */
  async generateMCPToken(email: string, password: string): Promise<string> {
    // Authenticate user
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      throw new Error('Invalid credentials')
    }

    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) {
      throw new Error('Invalid credentials')
    }

    // Generate MCP token with appropriate scopes
    const payload: MCPAuthTokenPayload = {
      userId: user.id,
      email: user.email,
      scope: [
        'notes.read',
        'notes.write',
        'notes.delete',
        'notebooks.read',
        'notebooks.write',
        'tags.read',
        'tags.write',
        'analytics.read'
      ]
    }

    return jwt.sign(payload, this.jwtSecret, { expiresIn: this.tokenExpiry })
  }

  /**
   * Verify and decode an MCP token
   */
  verifyToken(token: string): MCPAuthTokenPayload {
    try {
      return jwt.verify(token, this.jwtSecret) as MCPAuthTokenPayload
    } catch (error) {
      throw new Error('Invalid or expired token')
    }
  }

  /**
   * Check if a token has the required scope
   */
  hasScope(token: string, requiredScope: string): boolean {
    try {
      const payload = this.verifyToken(token)
      return payload.scope.includes(requiredScope)
    } catch {
      return false
    }
  }

  /**
   * Revoke a token (add to blacklist)
   */
  async revokeToken(token: string): Promise<void> {
    // In a production environment, you'd store revoked tokens in Redis or similar
    // For now, we'll just log it
    console.log('Token revoked:', token.substring(0, 20) + '...')
  }
}