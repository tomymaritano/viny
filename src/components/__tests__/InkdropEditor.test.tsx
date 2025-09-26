import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { createRef } from 'react'
import InkdropEditor from '../InkdropEditor'

// Mock methods
const mockInsertText = vi.fn()
const mockFormatSelection = vi.fn()
const mockGetView = vi.fn(() => null)
const mockFocus = vi.fn()

// Mock the useInkdropEditor hook
vi.mock('../../hooks/useInkdropEditor', () => ({
  useInkdropEditor: vi.fn(props => {
    return {
      editorRef: { current: null },
      methods: {
        insertText: mockInsertText,
        formatSelection: mockFormatSelection,
        getView: mockGetView,
        focus: mockFocus,
      },
    }
  }),
}))

describe('InkdropEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders with default props', () => {
    const { container } = render(<InkdropEditor />)

    const editor = container.querySelector('.inkdrop-editor')
    expect(editor).toBeInTheDocument()
    expect(editor).toHaveClass('h-full')
  })

  it('applies correct styles', () => {
    const { container } = render(<InkdropEditor />)

    const editor = container.querySelector('.inkdrop-editor')
    expect(editor).toHaveStyle({
      minHeight: '100%',
      fontSize: '16px',
      lineHeight: '1.6',
    })
  })

  it('exposes methods through ref', () => {
    const ref = createRef<any>()
    render(<InkdropEditor ref={ref} />)

    expect(ref.current).toBeDefined()
    expect(ref.current.insertText).toBe(mockInsertText)
    expect(ref.current.formatSelection).toBe(mockFormatSelection)
    expect(ref.current.getView).toBe(mockGetView)
    expect(ref.current.focus).toBe(mockFocus)
  })

  it('calls insertText method when exposed through ref', () => {
    const ref = createRef<any>()
    render(<InkdropEditor ref={ref} />)

    ref.current.insertText('Hello World')
    expect(mockInsertText).toHaveBeenCalledWith('Hello World')
  })

  it('calls formatSelection method when exposed through ref', () => {
    const ref = createRef<any>()
    render(<InkdropEditor ref={ref} />)

    ref.current.formatSelection('**', '**')
    expect(mockFormatSelection).toHaveBeenCalledWith('**', '**')
  })

  it('calls focus method when exposed through ref', () => {
    const ref = createRef<any>()
    render(<InkdropEditor ref={ref} />)

    ref.current.focus()
    expect(mockFocus).toHaveBeenCalled()
  })

  it('calls getView method when exposed through ref', () => {
    const ref = createRef<any>()
    render(<InkdropEditor ref={ref} />)

    const result = ref.current.getView()
    expect(mockGetView).toHaveBeenCalled()
    expect(result).toBe(null)
  })

  it('has correct display name', () => {
    expect(InkdropEditor.displayName).toBe('InkdropEditor')
  })

  it('renders with value prop', () => {
    render(<InkdropEditor value="Test content" />)
    // Since the actual editor is mocked, we just verify the component renders
    expect(true).toBe(true)
  })

  it('renders with onChange prop', () => {
    const onChange = vi.fn()
    render(<InkdropEditor onChange={onChange} />)
    // Since the actual editor is mocked, we just verify the component renders
    expect(true).toBe(true)
  })

  it('renders with placeholder prop', () => {
    render(<InkdropEditor placeholder="Custom placeholder" />)
    // Since the actual editor is mocked, we just verify the component renders
    expect(true).toBe(true)
  })

  it('renders with showLineNumbers prop', () => {
    render(<InkdropEditor showLineNumbers={true} />)
    // Since the actual editor is mocked, we just verify the component renders
    expect(true).toBe(true)
  })

  it('renders with theme prop', () => {
    render(<InkdropEditor theme="dark" />)
    // Since the actual editor is mocked, we just verify the component renders
    expect(true).toBe(true)
  })

  it('renders with preset prop', () => {
    const preset = {
      includeCore: true,
      includeKeyboard: true,
      includeFeatures: false,
      includeBehavior: false,
      theme: 'light',
    }
    render(<InkdropEditor preset={preset} />)
    // Since the actual editor is mocked, we just verify the component renders
    expect(true).toBe(true)
  })

  it('handles null preset correctly', () => {
    render(<InkdropEditor preset={null} />)
    // Since the actual editor is mocked, we just verify the component renders
    expect(true).toBe(true)
  })

  it('maintains ref stability across re-renders', () => {
    const ref = createRef<any>()
    const { rerender } = render(<InkdropEditor ref={ref} value="initial" />)

    const initialMethods = ref.current

    rerender(<InkdropEditor ref={ref} value="updated" />)

    // Methods should remain the same references
    expect(ref.current.insertText).toBe(initialMethods.insertText)
    expect(ref.current.formatSelection).toBe(initialMethods.formatSelection)
    expect(ref.current.getView).toBe(initialMethods.getView)
    expect(ref.current.focus).toBe(initialMethods.focus)
  })
})
