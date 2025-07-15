import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeAll, vi } from 'vitest'
import React from 'react'

// Make React available globally for JSX
global.React = React

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
global.localStorage = localStorageMock

// Mock global functions
global.alert = vi.fn()
global.confirm = vi.fn()
global.prompt = vi.fn()

// Mock Electron API
window.electron = {
  invoke: vi.fn(),
  send: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
  once: vi.fn(),
}

// Mock CodeMirror
vi.mock('@uiw/react-codemirror', () => ({
  default: vi.fn(() => null),
}))

// Mock Monaco Editor
vi.mock('@monaco-editor/react', () => ({
  default: vi.fn(() => null),
}))

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: React.forwardRef(
      ({ children, initial, animate, exit, transition, ...rest }, ref) =>
        React.createElement('div', { ...rest, ref }, children)
    ),
    button: React.forwardRef(
      ({ children, initial, animate, exit, transition, ...rest }, ref) =>
        React.createElement('button', { ...rest, ref }, children)
    ),
    span: React.forwardRef(
      ({ children, initial, animate, exit, transition, ...rest }, ref) =>
        React.createElement('span', { ...rest, ref }, children)
    ),
  },
  AnimatePresence: ({ children }) => children,
  useAnimation: () => ({
    start: vi.fn(),
    set: vi.fn(),
  }),
  useMotionValue: initial => ({
    get: () => initial,
    set: vi.fn(),
  }),
}))

// Mock React 19 specific features
if (!React.use) {
  React.use = vi.fn()
}

// Setup store mocks
beforeAll(() => {
  // Reset store state before tests
  vi.mock('../stores/useStore', () => ({
    default: () => ({
      settings: {
        enableAnalytics: false,
        enableCrashReporting: false,
        autoSaveInterval: 30000,
        dataRetentionDays: 365,
        lockAfterInactivity: false,
        inactivityTimeout: 15,
        theme: 'dark',
      },
      updateSettings: vi.fn(),
      addToast: vi.fn(),
    }),
  }))
})
