import '@testing-library/jest-dom'

// Global test setup
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated
    removeListener: vi.fn(), // Deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
global.localStorage = localStorageMock

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock URL.createObjectURL for file uploads/downloads
global.URL.createObjectURL = vi.fn(() => 'mocked-url')
global.URL.revokeObjectURL = vi.fn()

// Mock CustomEvent for browser environment
global.CustomEvent = vi.fn().mockImplementation((type, options) => ({
  type,
  detail: options?.detail,
  bubbles: options?.bubbles || false,
  cancelable: options?.cancelable || false,
}))

// Mock navigator for clipboard and other APIs
global.navigator = {
  clipboard: {
    writeText: vi.fn().mockResolvedValue(),
    readText: vi.fn().mockResolvedValue(''),
  },
  userAgent: 'test-user-agent',
  language: 'en-US',
  languages: ['en-US', 'en'],
  onLine: true,
}

// Ensure window is available (jsdom should provide this)
if (typeof window !== 'undefined') {
  // Add CustomEvent to window if not already present
  if (!window.CustomEvent) {
    window.CustomEvent = global.CustomEvent
  }

  // Add navigator to window if not already present
  if (!window.navigator) {
    window.navigator = global.navigator
  }
}

// Console suppression for cleaner test output
const originalError = console.error
console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('Warning: ReactDOM.render is no longer supported')
  ) {
    return
  }
  originalError.call(console, ...args)
}
