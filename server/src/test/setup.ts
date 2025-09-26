import { beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest'
import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'
import { resolve } from 'path'

declare global {
  var __TEST_PRISMA_CLIENT__: PrismaClient
}

// Test database setup
const testDatabaseUrl = 'file:./test.db'

// Global test database client
global.__TEST_PRISMA_CLIENT__ = new PrismaClient({
  datasources: {
    db: {
      url: testDatabaseUrl
    }
  }
})

beforeAll(async () => {
  // Set test database URL
  process.env.DATABASE_URL = testDatabaseUrl
  process.env.NODE_ENV = 'test'
  
  try {
    // Run migrations on test database
    execSync('npx prisma migrate deploy', {
      env: {
        ...process.env,
        DATABASE_URL: testDatabaseUrl
      },
      stdio: 'inherit'
    })
    
    // Connect to test database
    await global.__TEST_PRISMA_CLIENT__.$connect()
    
    console.log('✅ Test database setup complete')
  } catch (error) {
    console.error('❌ Test database setup failed:', error)
    throw error
  }
})

beforeEach(async () => {
  // Clean database before each test
  await cleanDatabase()
})

afterEach(async () => {
  // Clean database after each test
  await cleanDatabase()
})

afterAll(async () => {
  // Close database connection
  await global.__TEST_PRISMA_CLIENT__.$disconnect()
  
  try {
    // Clean up test database file
    const fs = await import('fs')
    const testDbPath = resolve(__dirname, '../../test.db')
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath)
    }
    
    console.log('✅ Test database cleanup complete')
  } catch (error) {
    console.error('❌ Test database cleanup failed:', error)
  }
})

/**
 * Clean all tables in the test database
 */
async function cleanDatabase() {
  const client = global.__TEST_PRISMA_CLIENT__
  
  try {
    // Delete in reverse order to respect foreign key constraints
    await client.note.deleteMany()
    await client.tag.deleteMany()
    await client.notebook.deleteMany()
    await client.user.deleteMany()
  } catch (error) {
    console.error('❌ Database cleanup failed:', error)
    throw error
  }
}

/**
 * Get test database client
 */
export function getTestClient(): PrismaClient {
  return global.__TEST_PRISMA_CLIENT__
}

/**
 * Create test user helper
 */
export async function createTestUser(overrides: Partial<{
  email: string
  name: string
  password: string
}> = {}) {
  const client = getTestClient()
  const bcrypt = await import('bcrypt')
  
  const userData = {
    email: overrides.email || 'test@example.com',
    name: overrides.name || 'Test User',
    password: await bcrypt.hash(overrides.password || 'password123', 10)
  }
  
  return client.user.create({
    data: userData
  })
}

/**
 * Create test notebook helper
 */
export async function createTestNotebook(userId: string, overrides: Partial<{
  name: string
  description: string
}> = {}) {
  const client = getTestClient()
  
  return client.notebook.create({
    data: {
      name: overrides.name || 'Test Notebook',
      description: overrides.description || 'Test notebook description',
      userId: parseInt(userId)
    }
  })
}

/**
 * Create test note helper
 */
export async function createTestNote(userId: string, overrides: Partial<{
  title: string
  content: string
  notebookId: string
}> = {}) {
  const client = getTestClient()
  
  return client.note.create({
    data: {
      title: overrides.title || 'Test Note',
      content: overrides.content || 'Test note content',
      userId: parseInt(userId),
      notebookId: overrides.notebookId ? parseInt(overrides.notebookId) : undefined
    }
  })
}

/**
 * Create test tag helper
 */
export async function createTestTag(userId: string, overrides: Partial<{
  name: string
  color: string
}> = {}) {
  const client = getTestClient()
  
  return client.tag.create({
    data: {
      name: overrides.name || 'test-tag',
      color: overrides.color || '#3B82F6',
      userId: parseInt(userId)
    }
  })
}

/**
 * Generate JWT token for testing
 */
export async function generateTestJWT(userId: string) {
  const jwt = await import('jsonwebtoken')
  
  return jwt.sign(
    { userId: parseInt(userId) },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '1h' }
  )
}

/**
 * Mock Express request object
 */
export function mockRequest(overrides: any = {}) {
  return {
    body: {},
    params: {},
    query: {},
    headers: {},
    cookies: {},
    user: undefined,
    ...overrides
  }
}

/**
 * Mock Express response object
 */
export function mockResponse() {
  const res: any = {}
  res.status = vi.fn().mockReturnValue(res)
  res.json = vi.fn().mockReturnValue(res)
  res.cookie = vi.fn().mockReturnValue(res)
  res.clearCookie = vi.fn().mockReturnValue(res)
  res.send = vi.fn().mockReturnValue(res)
  return res
}

// Mock global functions for testing
global.console = {
  ...console,
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn()
}