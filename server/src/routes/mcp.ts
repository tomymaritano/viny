import { Router } from 'express'
import { MCPAuthService } from '../mcp/auth'
import { authenticateToken } from '../middleware/authMiddleware'
import type { Request, Response } from 'express'

const router = Router()
const mcpAuth = new MCPAuthService(process.env.MCP_JWT_SECRET || 'default-secret')

interface MCPTokenRequest {
  email: string
  password: string
}

/**
 * Generate an MCP token for Claude Desktop integration
 */
router.post('/mcp-token', async (req: Request<{}, {}, MCPTokenRequest>, res: Response) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required'
      })
    }

    const token = await mcpAuth.generateMCPToken(email, password)

    res.json({
      token,
      expiresIn: '30d',
      instructions: 'Add this token to your Claude Desktop configuration'
    })
  } catch (error) {
    console.error('MCP token generation error:', error)
    res.status(401).json({
      error: 'Invalid credentials'
    })
  }
})

/**
 * Revoke an MCP token
 */
router.post('/mcp-token/revoke', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { token } = req.body

    if (!token) {
      return res.status(400).json({
        error: 'Token is required'
      })
    }

    await mcpAuth.revokeToken(token)

    res.json({
      message: 'Token revoked successfully'
    })
  } catch (error) {
    console.error('MCP token revocation error:', error)
    res.status(500).json({
      error: 'Failed to revoke token'
    })
  }
})

/**
 * Get MCP integration status and instructions
 */
router.get('/mcp-status', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id

    res.json({
      enabled: process.env.MCP_ENABLED === 'true',
      version: '1.0.0',
      resources: [
        'viny://notes',
        'viny://notebooks', 
        'viny://tags',
        'viny://search',
        'viny://analytics'
      ],
      tools: [
        'search_notes',
        'create_note',
        'update_note',
        'analyze_content',
        'generate_summary'
      ],
      configuration: {
        serverPath: '/path/to/viny/server/src/mcp/dist/server.js',
        configLocation: {
          mac: '~/.claude/claude_desktop_config.json',
          windows: '%APPDATA%\\Claude\\claude_desktop_config.json',
          linux: '~/.claude/claude_desktop_config.json'
        }
      }
    })
  } catch (error) {
    console.error('MCP status error:', error)
    res.status(500).json({
      error: 'Failed to get MCP status'
    })
  }
})

export default router