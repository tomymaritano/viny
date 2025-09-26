import express, { Express } from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import helmet from 'helmet'
import authRoutes from '../routes/auth'
import { authenticate } from '../middleware/authMiddleware'
import { errorHandler } from '../middleware/errorHandler'

/**
 * Create Express app for testing
 */
export async function createTestApp(): Promise<Express> {
  const app = express()

  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: false, // Disable for testing
    crossOriginEmbedderPolicy: false
  }))

  // CORS configuration
  app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }))

  // Request parsing
  app.use(express.json({ limit: '10mb' }))
  app.use(express.urlencoded({ extended: true, limit: '10mb' }))
  app.use(cookieParser())

  // Logging (only for non-test environments)
  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('combined'))
  }

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      environment: 'test'
    })
  })

  // Auth routes
  app.use('/auth', authRoutes)

  // Protected routes (add other routes here as needed)
  app.use('/api', authenticate)
  
  // Example protected route for testing
  app.get('/api/protected', (req, res) => {
    res.json({ 
      message: 'This is a protected route',
      user: req.user
    })
  })

  // Error handling middleware
  app.use(errorHandler)

  // 404 handler
  app.use('*', (req, res) => {
    res.status(404).json({
      success: false,
      error: 'Route not found'
    })
  })

  return app
}