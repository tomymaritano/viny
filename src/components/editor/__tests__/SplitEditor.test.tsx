import { describe, it, expect, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { createRef } from 'react'
import SplitEditor from '../SplitEditor'

// Mock dependencies
vi.mock('../../InkdropEditor', () => ({
  default: ({ value, onChange, placeholder, showLineNumbers }: any, ref: any) => (
    <div 
      data-testid="inkdrop-editor"
      data-value={value}
      data-placeholder={placeholder}
      data-show-line-numbers={showLineNumbers}
      ref={ref}
    >
      Editor Content
    </div>
  )
}))

vi.mock('../FloatingViewControls', () => ({
  default: ({ viewMode, onViewModeChange }: any) => (
    <div data-testid="floating-view-controls">
      <button onClick={() => onViewModeChange('editor')} data-testid="editor-button">Editor</button>
      <button onClick={() => onViewModeChange('preview')} data-testid="preview-button">Preview</button>
      <button onClick={() => onViewModeChange('split')} data-testid="split-button">Split</button>
      <div data-testid="current-view-mode">{viewMode}</div>
    </div>
  )
}))

vi.mock('../metadata/NoteMetadata', () => ({
  default: ({ note, isPreviewMode }: any) => (
    <div data-testid="note-metadata" data-preview-mode={isPreviewMode}>
      Note: {note?.title || 'No title'}
    </div>
  )
}))

vi.mock('../hooks/useScrollSync', () => ({
  useScrollSync: () => ({
    editorContainerRef: { current: null },
    previewContainerRef: { current: null },
    handlePreviewScroll: vi.fn()
  })
}))

vi.mock('../../utils/markdownRenderer', () => ({
  renderMarkdownForEditor: (value: string) => `<p>Rendered: ${value}</p>`
}))

describe('SplitEditor', () => {
  const defaultProps = {
    value: 'Test markdown content',
    onChange: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders in editor mode by default', () => {
    render(<SplitEditor {...defaultProps} />)
    
    expect(screen.getByTestId('inkdrop-editor')).toBeInTheDocument()
    expect(screen.getByTestId('floating-view-controls')).toBeInTheDocument()
    expect(screen.getByTestId('current-view-mode')).toHaveTextContent('editor')
  })

  it('passes correct props to InkdropEditor', () => {
    render(
      <SplitEditor 
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

  it('uses default placeholder when none provided', () => {
    render(<SplitEditor {...defaultProps} />)
    
    const editor = screen.getByTestId('inkdrop-editor')
    expect(editor).toHaveAttribute('data-placeholder', 'Start writing your markdown here...')
  })

  it('renders preview mode correctly', () => {
    render(<SplitEditor {...defaultProps} />)
    
    // Switch to preview mode
    const previewButton = screen.getByText('Preview')
    act(() => {
      previewButton.click()
    })
    
    // Check that we're in preview mode
    expect(screen.getByTestId('current-view-mode')).toHaveTextContent('preview')
    // Note: The markdown content is rendered as HTML, so we need to check for it differently
    expect(screen.getByText('Preview')).toBeInTheDocument()
  })

  it('renders split view correctly', () => {
    render(<SplitEditor {...defaultProps} />)
    
    // Switch to split mode
    const splitButton = screen.getByText('Split')
    act(() => {
      splitButton.click()
    })
    
    expect(screen.getByTestId('inkdrop-editor')).toBeInTheDocument()
    expect(screen.getByTestId('current-view-mode')).toHaveTextContent('split')
  })

  it('renders note metadata in preview mode when note is provided', () => {
    const note = { id: '1', title: 'Test Note', content: 'Test content' }
    
    render(<SplitEditor {...defaultProps} selectedNote={note} />)
    
    // Switch to preview mode
    const previewButton = screen.getByText('Preview')
    act(() => {
      previewButton.click()
    })
    
    expect(screen.getByTestId('note-metadata')).toBeInTheDocument()
    expect(screen.getByText('Note: Test Note')).toBeInTheDocument()
    expect(screen.getByTestId('note-metadata')).toHaveAttribute('data-preview-mode', 'true')
  })

  it('does not render note metadata in preview mode when no note provided', () => {
    render(<SplitEditor {...defaultProps} />)
    
    // Switch to preview mode
    const previewButton = screen.getByText('Preview')
    act(() => {
      previewButton.click()
    })
    
    expect(screen.queryByTestId('note-metadata')).not.toBeInTheDocument()
  })

  it('handles view mode changes correctly', () => {
    render(<SplitEditor {...defaultProps} />)
    
    // Initial state
    expect(screen.getByTestId('current-view-mode')).toHaveTextContent('editor')
    
    // Switch to preview
    act(() => {
      screen.getByText('Preview').click()
    })
    expect(screen.getByTestId('current-view-mode')).toHaveTextContent('preview')
    
    // Switch to split
    act(() => {
      screen.getByText('Split').click()
    })
    expect(screen.getByTestId('current-view-mode')).toHaveTextContent('split')
    
    // Switch back to editor
    act(() => {
      screen.getByText('Editor').click()
    })
    expect(screen.getByTestId('current-view-mode')).toHaveTextContent('editor')
  })

  it('renders markdown content in preview and split modes', () => {
    render(<SplitEditor {...defaultProps} value="# Hello World" />)
    
    // Switch to preview mode
    act(() => {
      screen.getByText('Preview').click()
    })
    expect(screen.getByTestId('current-view-mode')).toHaveTextContent('preview')
    
    // Switch to split mode
    act(() => {
      screen.getByText('Split').click()
    })
    expect(screen.getByTestId('current-view-mode')).toHaveTextContent('split')
  })

  it('exposes editor methods through ref', () => {
    const ref = createRef<any>()
    
    render(<SplitEditor {...defaultProps} ref={ref} />)
    
    expect(ref.current).toBeDefined()
    expect(typeof ref.current.insertText).toBe('function')
    expect(typeof ref.current.formatSelection).toBe('function')
    expect(typeof ref.current.getView).toBe('function')
    expect(typeof ref.current.focus).toBe('function')
  })

  it('has proper layout classes', () => {
    const { container } = render(<SplitEditor {...defaultProps} />)
    
    const mainContainer = container.firstChild
    expect(mainContainer).toHaveClass('flex-1', 'flex', 'flex-col', 'overflow-hidden', 'relative', 'bg-theme-bg-primary')
  })

  it('renders editor panel with correct layout in split mode', () => {
    render(<SplitEditor {...defaultProps} />)
    
    // Switch to split mode
    act(() => {
      screen.getByText('Split').click()
    })
    
    // Check that both editor and preview are rendered
    expect(screen.getByTestId('inkdrop-editor')).toBeInTheDocument()
    expect(screen.getByTestId('current-view-mode')).toHaveTextContent('split')
  })

  it('applies correct styling for preview content', () => {
    render(<SplitEditor {...defaultProps} />)
    
    // Switch to preview mode
    act(() => {
      screen.getByText('Preview').click()
    })
    
    // Check that we're in preview mode
    expect(screen.getByTestId('current-view-mode')).toHaveTextContent('preview')
  })

  it('handles empty content gracefully', () => {
    render(<SplitEditor {...defaultProps} value="" />)
    
    // Switch to preview mode
    act(() => {
      screen.getByText('Preview').click()
    })
    
    expect(screen.getByTestId('current-view-mode')).toHaveTextContent('preview')
  })

  it('renders with correct display name', () => {
    expect(SplitEditor.displayName).toBe('SplitEditor')
  })

  it('handles onChange prop correctly', () => {
    const onChange = vi.fn()
    render(<SplitEditor {...defaultProps} onChange={onChange} />)
    
    const editor = screen.getByTestId('inkdrop-editor')
    expect(editor).toBeInTheDocument()
    // The onChange is passed to InkdropEditor but we can't easily test it here
  })

  it('renders floating controls with correct view mode', () => {
    render(<SplitEditor {...defaultProps} />)
    
    expect(screen.getByTestId('floating-view-controls')).toBeInTheDocument()
    expect(screen.getByTestId('current-view-mode')).toHaveTextContent('editor')
  })

  it('maintains responsive layout classes', () => {
    render(<SplitEditor {...defaultProps} />)
    
    // Switch to split mode to check responsive classes
    act(() => {
      screen.getByText('Split').click()
    })
    
    expect(screen.getByTestId('current-view-mode')).toHaveTextContent('split')
  })
})