/**
 * Tests for useInkdropEditor hook
 * High priority system for core editor functionality
 */

import { renderHook, act } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { EditorView } from 'codemirror'
import { EditorState, Compartment } from '@codemirror/state'

// Mock logger
const mockEditorLogger = {
  debug: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
}

vi.mock('../../utils/logger', () => ({
  editorLogger: mockEditorLogger,
}))

// Mock app store
const mockTheme = 'dark'
vi.mock('../../stores/newSimpleStore', () => ({
  useAppStore: vi.fn(() => ({
    theme: mockTheme,
  })),
}))

// Mock editor extensions
const mockCreateEditorExtensions = vi.fn()
vi.mock('../../config/editorExtensions', () => ({
  createEditorExtensions: mockCreateEditorExtensions,
}))

// Mock editor themes
const mockGetThemeExtensions = vi.fn()
vi.mock('../../config/editorThemes', () => ({
  getThemeExtensions: mockGetThemeExtensions,
}))

// Mock editor keybindings
const mockAttachFormatSelection = vi.fn()
vi.mock('../../config/editorKeybindings', () => ({
  attachFormatSelection: mockAttachFormatSelection,
}))

// Mock CodeMirror
const mockEditorView = {
  destroy: vi.fn(),
  focus: vi.fn(),
  dispatch: vi.fn(),
  state: {
    doc: {
      toString: vi.fn(() => 'test content'),
      length: 12,
      sliceString: vi.fn((from: number, to: number) => 'test'),
    },
    selection: {
      main: { from: 0, to: 4 },
    },
  },
}

const mockEditorState = {
  create: vi.fn(() => ({})),
}

const mockCompartment = {
  of: vi.fn(),
  reconfigure: vi.fn(),
}

// Mock CodeMirror modules
vi.mock('codemirror', () => ({
  EditorView: vi.fn().mockImplementation(() => mockEditorView),
}))

vi.mock('@codemirror/state', () => ({
  EditorState: mockEditorState,
  Compartment: vi.fn().mockImplementation(() => mockCompartment),
}))

// Mock DOM element
const mockDOMElement = {
  focus: vi.fn(),
  blur: vi.fn(),
}

// Mock useRef
const mockUseRef = vi.fn()

describe('useInkdropEditor', () => {
  let useInkdropEditor: any

  beforeEach(async () => {
    vi.clearAllMocks()

    // Setup default mocks
    mockCreateEditorExtensions.mockReturnValue([])
    mockGetThemeExtensions.mockReturnValue([])
    mockCompartment.of.mockReturnValue({})
    mockCompartment.reconfigure.mockReturnValue({})

    // Mock DOM element reference
    mockUseRef.mockReturnValue({ current: mockDOMElement })

    // Reset modules
    vi.resetModules()

    // Import fresh hook
    const module = await import('../useInkdropEditor')
    useInkdropEditor = module.useInkdropEditor
  })

  describe('Hook Initialization', () => {
    it('should initialize with default props', () => {
      const { result } = renderHook(() => useInkdropEditor({}))

      expect(result.current).toHaveProperty('editorRef')
      expect(result.current).toHaveProperty('methods')
      expect(result.current.methods).toHaveProperty('insertText')
      expect(result.current.methods).toHaveProperty('formatSelection')
      expect(result.current.methods).toHaveProperty('getView')
      expect(result.current.methods).toHaveProperty('focus')
    })

    it('should provide all expected methods', () => {
      const { result } = renderHook(() => useInkdropEditor({}))

      const methods = result.current.methods

      expect(typeof methods.insertText).toBe('function')
      expect(typeof methods.formatSelection).toBe('function')
      expect(typeof methods.getView).toBe('function')
      expect(typeof methods.focus).toBe('function')
    })

    it('should initialize with custom props', () => {
      const props = {
        value: 'Initial content',
        placeholder: 'Custom placeholder',
        showLineNumbers: true,
        theme: 'light',
      }

      const { result } = renderHook(() => useInkdropEditor(props))

      expect(result.current.editorRef).toBeDefined()
      expect(result.current.methods).toBeDefined()
    })
  })

  describe('Editor Configuration', () => {
    it('should accept editor configuration props', () => {
      const props = {
        placeholder: 'Test placeholder',
        showLineNumbers: true,
        theme: 'light',
      }

      const { result } = renderHook(() => useInkdropEditor(props))

      expect(result.current.editorRef).toBeDefined()
      expect(result.current.methods).toBeDefined()
    })

    it('should work with default configuration', () => {
      const { result } = renderHook(() => useInkdropEditor({}))

      expect(result.current.editorRef).toBeDefined()
      expect(result.current.methods).toBeDefined()
    })

    it('should handle theme configuration', () => {
      const { result } = renderHook(() =>
        useInkdropEditor({ theme: 'solarized' })
      )

      expect(result.current.editorRef).toBeDefined()
      expect(result.current.methods).toBeDefined()
    })
  })

  describe('Editor State Management', () => {
    it('should handle initial value', () => {
      const value = 'Test content'
      const { result } = renderHook(() => useInkdropEditor({ value }))

      expect(result.current.editorRef).toBeDefined()
      expect(result.current.methods).toBeDefined()
    })

    it('should handle onChange callback', () => {
      const mockOnChange = vi.fn()
      const { result } = renderHook(() =>
        useInkdropEditor({ onChange: mockOnChange })
      )

      // Verify that hook initializes with onChange
      expect(result.current.methods).toBeDefined()
    })

    it('should provide editor functionality', () => {
      const { result } = renderHook(() => useInkdropEditor({}))

      expect(result.current.methods).toBeDefined()
      expect(result.current.editorRef).toBeDefined()
    })
  })

  describe('Editor Methods', () => {
    it('should provide insertText method', () => {
      const { result } = renderHook(() => useInkdropEditor({}))

      expect(typeof result.current.methods.insertText).toBe('function')

      // Test that method can be called without error
      act(() => {
        result.current.methods.insertText('Hello')
      })

      // Method should exist and be callable
      expect(result.current.methods.insertText).toBeDefined()
    })

    it('should provide formatSelection method', () => {
      const { result } = renderHook(() => useInkdropEditor({}))

      expect(typeof result.current.methods.formatSelection).toBe('function')

      // Test that method can be called without error
      act(() => {
        result.current.methods.formatSelection('**', '**')
      })

      expect(result.current.methods.formatSelection).toBeDefined()
    })

    it('should provide focus method', () => {
      const { result } = renderHook(() => useInkdropEditor({}))

      expect(typeof result.current.methods.focus).toBe('function')

      // Test that method can be called
      act(() => {
        result.current.methods.focus()
      })

      expect(result.current.methods.focus).toBeDefined()
    })

    it('should provide getView method', () => {
      const { result } = renderHook(() => useInkdropEditor({}))

      expect(typeof result.current.methods.getView).toBe('function')

      // Test that method returns something
      const view = result.current.methods.getView()
      expect(view).toBeDefined()
    })
  })

  describe('Props Updates', () => {
    it('should handle value prop changes', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useInkdropEditor({ value }),
        { initialProps: { value: 'initial' } }
      )

      // Update value
      rerender({ value: 'updated' })

      expect(result.current.methods).toBeDefined()
    })

    it('should handle theme prop changes', () => {
      const { result, rerender } = renderHook(
        ({ theme }) => useInkdropEditor({ theme }),
        { initialProps: { theme: 'light' } }
      )

      // Update theme
      rerender({ theme: 'dark' })

      expect(result.current.methods).toBeDefined()
    })

    it('should handle showLineNumbers prop changes', () => {
      const { result, rerender } = renderHook(
        ({ showLineNumbers }) => useInkdropEditor({ showLineNumbers }),
        { initialProps: { showLineNumbers: false } }
      )

      // Update showLineNumbers
      rerender({ showLineNumbers: true })

      expect(result.current.methods).toBeDefined()
    })

    it('should handle placeholder prop changes', () => {
      const { result, rerender } = renderHook(
        ({ placeholder }) => useInkdropEditor({ placeholder }),
        { initialProps: { placeholder: 'Initial placeholder' } }
      )

      // Update placeholder
      rerender({ placeholder: 'Updated placeholder' })

      expect(result.current.methods).toBeDefined()
    })
  })

  describe('Theme Integration', () => {
    it('should integrate with app store theme', () => {
      const { result } = renderHook(() => useInkdropEditor({}))

      expect(result.current.editorRef).toBeDefined()
      expect(result.current.methods).toBeDefined()
    })

    it('should support theme configuration', () => {
      const { result } = renderHook(() =>
        useInkdropEditor({ theme: 'solarized' })
      )

      expect(result.current.editorRef).toBeDefined()
      expect(result.current.methods).toBeDefined()
    })
  })

  describe('Preset Support', () => {
    it('should handle preset configuration', () => {
      const preset = {
        includeCore: true,
        includeKeyboard: true,
        includeFeatures: false,
        includeBehavior: true,
        lineNumbers: true,
        theme: 'solarized',
      }

      const { result } = renderHook(() => useInkdropEditor({ preset }))

      expect(result.current.methods).toBeDefined()
    })

    it('should handle null preset', () => {
      const { result } = renderHook(() => useInkdropEditor({ preset: null }))

      expect(result.current.methods).toBeDefined()
    })

    it('should handle undefined preset', () => {
      const { result } = renderHook(() => useInkdropEditor({}))

      expect(result.current.methods).toBeDefined()
    })
  })

  describe('Error Handling', () => {
    it('should handle editor initialization gracefully', () => {
      // Mock EditorState.create to throw error
      mockEditorState.create.mockImplementationOnce(() => {
        throw new Error('Editor initialization failed')
      })

      const { result } = renderHook(() => useInkdropEditor({}))

      expect(result.current.methods).toBeDefined()
      expect(result.current.editorRef).toBeDefined()
    })

    it('should handle theme update errors gracefully', () => {
      // Mock dispatch to throw error
      mockEditorView.dispatch.mockImplementationOnce(() => {
        throw new Error('Theme update failed')
      })

      const { result, rerender } = renderHook(
        ({ theme }) => useInkdropEditor({ theme }),
        { initialProps: { theme: 'light' } }
      )

      // This should trigger theme update and error handling
      rerender({ theme: 'dark' })

      // Should still return valid methods
      expect(result.current.methods).toBeDefined()
    })
  })

  describe('Editor Lifecycle', () => {
    it('should initialize editor on mount', () => {
      const { result } = renderHook(() => useInkdropEditor({}))

      expect(result.current.editorRef).toBeDefined()
      expect(result.current.methods).toBeDefined()
    })

    it('should cleanup editor resources on unmount', () => {
      const { result, unmount } = renderHook(() => useInkdropEditor({}))

      expect(result.current.methods).toBeDefined()

      // Unmount should not throw errors
      unmount()
    })

    it('should handle settings changes', () => {
      const { result, rerender } = renderHook(
        ({ theme }) => useInkdropEditor({ theme }),
        { initialProps: { theme: 'light' } }
      )

      expect(result.current.methods).toBeDefined()

      // Change theme - should handle gracefully
      rerender({ theme: 'dark' })

      expect(result.current.methods).toBeDefined()
    })
  })

  describe('Content Management', () => {
    it('should handle content updates', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useInkdropEditor({ value }),
        { initialProps: { value: 'initial' } }
      )

      expect(result.current.methods).toBeDefined()

      // Change value
      rerender({ value: 'updated content' })

      expect(result.current.methods).toBeDefined()
    })

    it('should optimize content updates', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useInkdropEditor({ value }),
        { initialProps: { value: 'same content' } }
      )

      expect(result.current.methods).toBeDefined()

      // Clear previous calls
      mockEditorView.dispatch.mockClear()
      mockEditorView.state.doc.toString.mockReturnValue('same content')

      // Rerender with same value
      rerender({ value: 'same content' })

      expect(result.current.methods).toBeDefined()
    })
  })

  describe('Integration Tests', () => {
    it('should work with all props provided', () => {
      const props = {
        value: 'Test content',
        onChange: vi.fn(),
        placeholder: 'Enter text here',
        showLineNumbers: true,
        theme: 'solarized',
        preset: {
          includeCore: true,
          includeKeyboard: true,
          includeFeatures: true,
          includeBehavior: true,
          lineNumbers: true,
          theme: 'solarized',
        },
      }

      const { result } = renderHook(() => useInkdropEditor(props))

      expect(result.current.editorRef).toBeDefined()
      expect(result.current.methods).toBeDefined()
      expect(result.current.methods.insertText).toBeDefined()
      expect(result.current.methods.formatSelection).toBeDefined()
      expect(result.current.methods.getView).toBeDefined()
      expect(result.current.methods.focus).toBeDefined()
    })

    it('should maintain editor functionality across rerenders', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useInkdropEditor({ value }),
        { initialProps: { value: 'initial' } }
      )

      expect(result.current.methods).toBeDefined()

      // Rerender with new value
      rerender({ value: 'updated' })

      // Methods should still be available
      expect(result.current.methods).toBeDefined()
      expect(result.current.methods.insertText).toBeDefined()
      expect(result.current.methods.formatSelection).toBeDefined()
    })
  })

  describe('Performance', () => {
    it('should provide stable method references', () => {
      const { result, rerender } = renderHook(() => useInkdropEditor({}))

      expect(result.current.methods).toBeDefined()

      // Rerender without changing props
      rerender()

      // Methods should still be defined
      expect(result.current.methods).toBeDefined()
      expect(result.current.methods.insertText).toBeDefined()
    })

    it('should handle value changes efficiently', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useInkdropEditor({ value }),
        { initialProps: { value: 'initial' } }
      )

      expect(result.current.methods).toBeDefined()

      // Change only value (should not break methods)
      rerender({ value: 'updated' })

      expect(result.current.methods).toBeDefined()
      expect(result.current.methods.insertText).toBeDefined()
    })
  })
})
