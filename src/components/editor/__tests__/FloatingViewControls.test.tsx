import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import FloatingViewControls from '../FloatingViewControls'

// Mock Icons
vi.mock('../../Icons', () => ({
  default: {
    Eye: ({ size }: { size?: number }) => (
      <div data-testid="eye-icon" data-size={size}>
        Eye
      </div>
    ),
    EyeOff: ({ size }: { size?: number }) => (
      <div data-testid="eye-off-icon" data-size={size}>
        EyeOff
      </div>
    ),
    Sidebar: ({ size }: { size?: number }) => (
      <div data-testid="sidebar-icon" data-size={size}>
        Sidebar
      </div>
    ),
    PanelRight: ({ size }: { size?: number }) => (
      <div data-testid="panel-right-icon" data-size={size}>
        PanelRight
      </div>
    ),
  },
}))

describe('FloatingViewControls', () => {
  const mockOnViewModeChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders in editor mode', () => {
    render(
      <FloatingViewControls
        viewMode="editor"
        onViewModeChange={mockOnViewModeChange}
      />
    )

    expect(screen.getByLabelText('Open preview only')).toBeInTheDocument()
    expect(screen.getByLabelText('Open split view')).toBeInTheDocument()
    expect(screen.getByTestId('eye-icon')).toBeInTheDocument()
    expect(screen.getByTestId('panel-right-icon')).toBeInTheDocument()
  })

  it('renders in preview mode', () => {
    render(
      <FloatingViewControls
        viewMode="preview"
        onViewModeChange={mockOnViewModeChange}
      />
    )

    expect(screen.getByLabelText('Close preview')).toBeInTheDocument()
    expect(screen.getByLabelText('Open split view')).toBeInTheDocument()
    expect(screen.getByTestId('eye-off-icon')).toBeInTheDocument()
    expect(screen.getByTestId('panel-right-icon')).toBeInTheDocument()
  })

  it('renders in split mode', () => {
    render(
      <FloatingViewControls
        viewMode="split"
        onViewModeChange={mockOnViewModeChange}
      />
    )

    expect(screen.getByLabelText('Open preview only')).toBeInTheDocument()
    expect(screen.getByLabelText('Close split view')).toBeInTheDocument()
    expect(screen.getByTestId('eye-icon')).toBeInTheDocument()
    expect(screen.getByTestId('sidebar-icon')).toBeInTheDocument()
  })

  it('applies active styles to preview button when in preview mode', () => {
    render(
      <FloatingViewControls
        viewMode="preview"
        onViewModeChange={mockOnViewModeChange}
      />
    )

    const previewButton = screen.getByLabelText('Close preview')
    expect(previewButton).toHaveClass(
      'text-white',
      'border-white/20',
      'bg-white/10'
    )
  })

  it('applies active styles to split button when in split mode', () => {
    render(
      <FloatingViewControls
        viewMode="split"
        onViewModeChange={mockOnViewModeChange}
      />
    )

    const splitButton = screen.getByLabelText('Close split view')
    expect(splitButton).toHaveClass(
      'text-white',
      'border-white/20',
      'bg-white/10'
    )
  })

  it('applies inactive styles when not active', () => {
    render(
      <FloatingViewControls
        viewMode="editor"
        onViewModeChange={mockOnViewModeChange}
      />
    )

    const previewButton = screen.getByLabelText('Open preview only')
    const splitButton = screen.getByLabelText('Open split view')

    expect(previewButton).toHaveClass('text-theme-text-secondary')
    expect(splitButton).toHaveClass('text-theme-text-secondary')
  })

  it('toggles to preview mode when preview button is clicked from editor', () => {
    render(
      <FloatingViewControls
        viewMode="editor"
        onViewModeChange={mockOnViewModeChange}
      />
    )

    fireEvent.click(screen.getByLabelText('Open preview only'))
    expect(mockOnViewModeChange).toHaveBeenCalledWith('preview')
  })

  it('toggles to editor mode when preview button is clicked from preview', () => {
    render(
      <FloatingViewControls
        viewMode="preview"
        onViewModeChange={mockOnViewModeChange}
      />
    )

    fireEvent.click(screen.getByLabelText('Close preview'))
    expect(mockOnViewModeChange).toHaveBeenCalledWith('editor')
  })

  it('toggles to split mode when split button is clicked from editor', () => {
    render(
      <FloatingViewControls
        viewMode="editor"
        onViewModeChange={mockOnViewModeChange}
      />
    )

    fireEvent.click(screen.getByLabelText('Open split view'))
    expect(mockOnViewModeChange).toHaveBeenCalledWith('split')
  })

  it('toggles to editor mode when split button is clicked from split', () => {
    render(
      <FloatingViewControls
        viewMode="split"
        onViewModeChange={mockOnViewModeChange}
      />
    )

    fireEvent.click(screen.getByLabelText('Close split view'))
    expect(mockOnViewModeChange).toHaveBeenCalledWith('editor')
  })

  it('has proper accessibility attributes', () => {
    render(
      <FloatingViewControls
        viewMode="editor"
        onViewModeChange={mockOnViewModeChange}
      />
    )

    const previewButton = screen.getByLabelText('Open preview only')
    const splitButton = screen.getByLabelText('Open split view')

    expect(previewButton).toHaveAttribute('title', 'Open preview only')
    expect(splitButton).toHaveAttribute('title', 'Open split view')
  })

  it('renders icons with correct size', () => {
    render(
      <FloatingViewControls
        viewMode="editor"
        onViewModeChange={mockOnViewModeChange}
      />
    )

    const eyeIcon = screen.getByTestId('eye-icon')
    const panelRightIcon = screen.getByTestId('panel-right-icon')

    expect(eyeIcon).toHaveAttribute('data-size', '16')
    expect(panelRightIcon).toHaveAttribute('data-size', '16')
  })

  it('is positioned as floating controls', () => {
    const { container } = render(
      <FloatingViewControls
        viewMode="editor"
        onViewModeChange={mockOnViewModeChange}
      />
    )

    const floatingContainer = container.firstChild
    expect(floatingContainer).toHaveClass(
      'fixed',
      'bottom-2',
      'right-2',
      'z-50'
    )
  })

  it('has backdrop blur styling', () => {
    const { container } = render(
      <FloatingViewControls
        viewMode="editor"
        onViewModeChange={mockOnViewModeChange}
      />
    )

    const floatingContainer = container.firstChild
    expect(floatingContainer).toHaveClass('backdrop-blur-sm', 'bg-black/20')
  })

  it('handles all view mode transitions correctly', () => {
    const { rerender } = render(
      <FloatingViewControls
        viewMode="editor"
        onViewModeChange={mockOnViewModeChange}
      />
    )

    // From editor to preview
    fireEvent.click(screen.getByLabelText('Open preview only'))
    expect(mockOnViewModeChange).toHaveBeenCalledWith('preview')

    // From editor to split
    fireEvent.click(screen.getByLabelText('Open split view'))
    expect(mockOnViewModeChange).toHaveBeenCalledWith('split')

    // Re-render in split mode
    rerender(
      <FloatingViewControls
        viewMode="split"
        onViewModeChange={mockOnViewModeChange}
      />
    )

    // From split to editor
    fireEvent.click(screen.getByLabelText('Close split view'))
    expect(mockOnViewModeChange).toHaveBeenCalledWith('editor')
  })

  it('maintains button state consistency', () => {
    const { rerender } = render(
      <FloatingViewControls
        viewMode="editor"
        onViewModeChange={mockOnViewModeChange}
      />
    )

    // Initial state
    expect(screen.getByLabelText('Open preview only')).toBeInTheDocument()
    expect(screen.getByLabelText('Open split view')).toBeInTheDocument()

    // Preview mode
    rerender(
      <FloatingViewControls
        viewMode="preview"
        onViewModeChange={mockOnViewModeChange}
      />
    )

    expect(screen.getByLabelText('Close preview')).toBeInTheDocument()
    expect(screen.getByLabelText('Open split view')).toBeInTheDocument()

    // Split mode
    rerender(
      <FloatingViewControls
        viewMode="split"
        onViewModeChange={mockOnViewModeChange}
      />
    )

    expect(screen.getByLabelText('Open preview only')).toBeInTheDocument()
    expect(screen.getByLabelText('Close split view')).toBeInTheDocument()
  })
})
