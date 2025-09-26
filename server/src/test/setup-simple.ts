import { vi } from 'vitest'

// Simple setup for unit tests - no database, no browser mocks
console.log('✅ Simple test setup loaded')

// Mock global functions for testing
global.console = {
  ...console,
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn()
}

// Set test environment
process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = 'test-secret'
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret'