// Test setup file
import { vi } from 'vitest'
import '@testing-library/jest-dom'
import 'fake-indexeddb/auto'

// Setup fake timers globally (but not for integration tests)
beforeEach(() => {
  // Don't use fake timers for integration tests
  const testFile = expect.getState().testPath || ''
  if (!testFile.includes('integration/')) {
    vi.useFakeTimers()
  }
})

afterEach(() => {
  vi.useRealTimers()
  vi.clearAllMocks()
})

// Mock localStorage for testing
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
})

// Mock window.electron for Electron-specific functionality
Object.defineProperty(window, 'electron', {
  value: {
    ipcRenderer: {
      invoke: vi.fn(),
      on: vi.fn(),
      removeAllListeners: vi.fn(),
    },
  },
  writable: true,
})

// Global test utilities
global.localStorageMock = localStorageMock
