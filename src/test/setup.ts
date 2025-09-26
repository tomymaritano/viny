import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeAll, vi } from 'vitest'
import React from 'react'

// Type declarations for global objects
declare global {
  interface Window {
    electron: {
      invoke: () => unknown
      send: () => void
      on: () => void
      off: () => void
      once: () => void
    }
  }

  const React: typeof import('react')
  const IntersectionObserver: typeof window.IntersectionObserver
  const ResizeObserver: typeof window.ResizeObserver
  const localStorage: Storage
  const alert: (message?: string) => void
  const confirm: (message?: string) => boolean
  const prompt: (message?: string, defaultText?: string) => string | null
}

// Make React available globally for JSX
global.React = React

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
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
  disconnect(): void {}
  observe(): void {}
  unobserve(): void {}
}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect(): void {}
  observe(): void {}
  unobserve(): void {}
}

// Mock localStorage
const localStorageMock: Storage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  key: vi.fn(),
  length: 0,
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
    div: React.forwardRef<
      HTMLDivElement,
      React.HTMLProps<HTMLDivElement> & {
        initial?: unknown
        animate?: unknown
        exit?: unknown
        transition?: unknown
      }
    >(({ children, initial, animate, exit, transition, ...rest }, ref) =>
      React.createElement('div', { ...rest, ref }, children)
    ),
    button: React.forwardRef<
      HTMLButtonElement,
      React.HTMLProps<HTMLButtonElement> & {
        initial?: unknown
        animate?: unknown
        exit?: unknown
        transition?: unknown
      }
    >(({ children, initial, animate, exit, transition, ...rest }, ref) =>
      React.createElement('button', { ...rest, ref }, children)
    ),
    span: React.forwardRef<
      HTMLSpanElement,
      React.HTMLProps<HTMLSpanElement> & {
        initial?: unknown
        animate?: unknown
        exit?: unknown
        transition?: unknown
      }
    >(({ children, initial, animate, exit, transition, ...rest }, ref) =>
      React.createElement('span', { ...rest, ref }, children)
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
  useAnimation: () => ({
    start: vi.fn(),
    set: vi.fn(),
  }),
  useMotionValue: (initial: unknown) => ({
    get: () => initial,
    set: vi.fn(),
  }),
}))

// Mock React 19 specific features
if (!(React as typeof React & { use?: unknown }).use) {
  ;(React as typeof React & { use: unknown }).use = vi.fn()
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
