import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import { PrismaClient } from '@prisma/client'

// Import routes
import noteRoutes from './routes/notes'
import tagRoutes from './routes/tags'
import notebookRoutes from './routes/notebooks'
import migrationRoutes from './routes/migration'
import authRoutes from './routes/auth'

// Error handling middleware
import { errorHandler } from './middleware/errorHandler'

const app = express()
const port = process.env.PORT || 3001

// Initialize Prisma Client
export const prisma = new PrismaClient()

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for development
}))

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'], // Vite dev server
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}))

app.use(morgan('combined'))
app.use(cookieParser())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Viny Backend',
    version: '1.0.0'
  })
})

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/notes', noteRoutes)
app.use('/api/tags', tagRoutes)
app.use('/api/notebooks', notebookRoutes)
app.use('/api/migration', migrationRoutes)

// MCP routes (if enabled)
if (process.env.MCP_ENABLED === 'true') {
  import('./routes/mcp').then(mcpModule => {
    app.use('/api/auth', mcpModule.default)
    console.log('📡 MCP integration enabled')
  }).catch(err => {
    console.error('Failed to load MCP routes:', err)
  })
}

// Error handling
app.use(errorHandler)

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl
  })
})

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Received SIGINT, shutting down gracefully...')
  await prisma.$disconnect()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, shutting down gracefully...')
  await prisma.$disconnect()
  process.exit(0)
})

app.listen(port, () => {
  console.log(`🚀 Viny server running on http://localhost:${port}`)
  console.log(`📊 Health check: http://localhost:${port}/health`)
  console.log(`📝 API docs: http://localhost:${port}/api`)
})

export default app