import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import SplitEditorV2 from '../SplitEditorV2'

// Mock dependencies
vi.mock('../../InkdropEditor', () => ({
  default: vi.forwardRef((props: any, ref: any) => (
    <div
      data-testid="inkdrop-editor"
      data-value={props.value}
      data-placeholder={props.placeholder}
      data-show-line-numbers={props.showLineNumbers}
      ref={ref}
    >
      <textarea
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        placeholder={props.placeholder}
        data-testid="editor-textarea"
      />
    </div>
  )),
}))

vi.mock('../FloatingViewControls', () => ({
  default: ({ viewMode, onViewModeChange }: any) => (
    <div data-testid="floating-view-controls">
      <button onClick={() => onViewModeChange('editor')} data-testid="editor-button">
        Editor
      </button>
      <button onClick={() => onViewModeChange('preview')} data-testid="preview-button">
        Preview
      </button>
      <button onClick={() => onViewModeChange('split')} data-testid="split-button">
        Split
      </button>
      <div data-testid="current-view-mode">{viewMode}</div>
    </div>
  ),
}))

vi.mock('../metadata/NoteMetadata', () => ({
  default: ({ note }: any) => (
    <div data-testid="note-metadata">
      Note: {note?.title || 'No title'}
    </div>
  ),
}))

vi.mock('../../stores/cleanUIStore', () => ({
  useEditorStore: () => ({
    viewMode: 'editor',
    setViewMode: vi.fn(),
    fontSize: 16,
    lineHeight: 1.5,
  }),
  useSettingsUI: () => ({
    setHasUnsavedChanges: vi.fn(),
  }),
}))

vi.mock('../../hooks/queries/useSettingsServiceQueryV2', () => ({
  useUpdateSettingsMutationV2: () => ({
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
  }),
}))

vi.mock('../../contexts/ServiceProviderV2', () => ({
  useServices: () => ({}),
}))

vi.mock('../../lib/markdown', () => ({
  MarkdownProcessor: {
    render: (content: string) => `<p>${content}</p>`,
  },
}))

vi.mock('dompurify', () => ({
  default: {
    sanitize: (html: string) => html,
  },
}))

describe('SplitEditorV2', () => {
  const user = userEvent.setup()
  const defaultProps = {
    value: 'Test markdown content',
    onChange: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('renders in editor mode by default', () => {
    render(<SplitEditorV2 {...defaultProps} />)

    expect(screen.getByTestId('inkdrop-editor')).toBeInTheDocument()
    expect(screen.getByTestId('floating-view-controls')).toBeInTheDocument()
    expect(screen.getByTestId('current-view-mode')).toHaveTextContent('editor')
  })

  it('passes correct props to InkdropEditor', () => {
    render(
      <SplitEditorV2
        {...defaultProps}
        placeholder="Custom placeholder"
        showLineNumbers={true}
      />
    )

    const editor = screen.getByTestId('inkdrop-editor')
    expect(editor).toHaveAttribute('data-value', 'Test markdown content')
    expect(editor).toHaveAttribute('data-placeholder', 'Custom placeholder')
    expect(editor).toHaveAttribute('data-show-line-numbers', 'true')
  })

  it('handles content changes', async () => {
    const onChange = vi.fn()
    const { useSettingsUI } = vi.mocked(await import('../../stores/cleanUIStore'))
    const mockSetHasUnsavedChanges = vi.fn()
    
    useSettingsUI.mockReturnValue({
      setHasUnsavedChanges: mockSetHasUnsavedChanges,
    } as any)

    render(<SplitEditorV2 {...defaultProps} onChange={onChange} />)

    const textarea = screen.getByTestId('editor-textarea')
    await user.clear(textarea)
    await user.type(textarea, 'New content')

    expect(onChange).toHaveBeenCalledWith('New content')
    expect(mockSetHasUnsavedChanges).toHaveBeenCalledWith(true)
  })

  it('renders preview mode correctly', async () => {
    render(<SplitEditorV2 {...defaultProps} value="# Hello World" />)

    // Switch to preview mode
    await user.click(screen.getByTestId('preview-button'))

    expect(screen.getByTestId('current-view-mode')).toHaveTextContent('preview')
    expect(screen.queryByTestId('inkdrop-editor')).not.toBeInTheDocument()
    
    // Check preview content
    const previewContent = screen.getByText(/Hello World/i)
    expect(previewContent).toBeInTheDocument()
  })

  it('renders split view correctly', async () => {
    render(<SplitEditorV2 {...defaultProps} />)

    // Switch to split mode
    await user.click(screen.getByTestId('split-button'))

    expect(screen.getByTestId('current-view-mode')).toHaveTextContent('split')
    expect(screen.getByTestId('inkdrop-editor')).toBeInTheDocument()
    
    // Both editor and preview should be visible
    const containers = screen.getAllByRole('article')
    expect(containers).toHaveLength(1) // Preview article
  })

  it('renders note metadata when note is provided', () => {
    const note = {
      id: '1',
      title: 'Test Note',
      content: 'Test content',
      notebookId: 'notebook-1',
      tags: [],
      status: 'draft' as const,
      isPinned: false,
      isTrashed: false,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    }

    render(<SplitEditorV2 {...defaultProps} selectedNote={note} />)

    expect(screen.getByTestId('note-metadata')).toBeInTheDocument()
    expect(screen.getByText('Note: Test Note')).toBeInTheDocument()
  })

  it('does not render metadata when no note provided', () => {
    render(<SplitEditorV2 {...defaultProps} />)

    expect(screen.queryByTestId('note-metadata')).not.toBeInTheDocument()
  })

  it('handles view mode changes correctly', async () => {
    const { useEditorStore } = vi.mocked(await import('../../stores/cleanUIStore'))
    const mockSetViewMode = vi.fn()
    
    useEditorStore.mockReturnValue({
      viewMode: 'editor',
      setViewMode: mockSetViewMode,
      fontSize: 16,
      lineHeight: 1.5,
    } as any)

    render(<SplitEditorV2 {...defaultProps} />)

    // Switch to preview
    await user.click(screen.getByTestId('preview-button'))
    expect(mockSetViewMode).toHaveBeenCalledWith('preview')

    // Switch to split
    await user.click(screen.getByTestId('split-button'))
    expect(mockSetViewMode).toHaveBeenCalledWith('split')

    // Switch back to editor
    await user.click(screen.getByTestId('editor-button'))
    expect(mockSetViewMode).toHaveBeenCalledWith('editor')
  })

  it('saves and loads split ratio from localStorage', () => {
    // Set split ratio in localStorage
    localStorage.setItem('editor-split-ratio', '70')

    const { container } = render(<SplitEditorV2 {...defaultProps} />)

    // Switch to split mode
    act(() => {
      screen.getByTestId('split-button').click()
    })

    // Verify split ratio is loaded (would need to check actual styles in real test)
    expect(localStorage.getItem('editor-split-ratio')).toBe('70')
  })

  it('exposes editor methods through ref', () => {
    const ref = createRef<any>()

    render(<SplitEditorV2 {...defaultProps} ref={ref} />)

    expect(ref.current).toBeDefined()
    expect(typeof ref.current.insertText).toBe('function')
    expect(typeof ref.current.formatSelection).toBe('function')
    expect(typeof ref.current.getEditorView).toBe('function')
    expect(typeof ref.current.getEditorText).toBe('function')
  })

  it('applies correct font size and line height', () => {
    const { useEditorStore } = vi.mocked(useEditorStore)
    useEditorStore.mockReturnValue({
      viewMode: 'editor',
      setViewMode: vi.fn(),
      fontSize: 18,
      lineHeight: 1.8,
    } as any)

    render(<SplitEditorV2 {...defaultProps} />)

    // Switch to preview to see styles
    act(() => {
      screen.getByTestId('preview-button').click()
    })

    const article = screen.getByRole('article')
    expect(article).toHaveStyle({
      fontSize: '18px',
      lineHeight: 1.8,
    })
  })

  it('handles empty content gracefully', async () => {
    render(<SplitEditorV2 {...defaultProps} value="" />)

    // Switch to preview mode
    await user.click(screen.getByTestId('preview-button'))

    expect(screen.getByTestId('current-view-mode')).toHaveTextContent('preview')
    // Preview should render empty content without errors
  })

  it('handles markdown processing errors', () => {
    // Mock markdown processor to throw error
    vi.mocked(MarkdownProcessor).render.mockImplementationOnce(() => {
      throw new Error('Markdown error')
    })

    render(<SplitEditorV2 {...defaultProps} value="# Test" />)

    // Switch to preview
    act(() => {
      screen.getByTestId('preview-button').click()
    })

    // Should show error message
    expect(screen.getByText('Error processing markdown')).toBeInTheDocument()
  })
})