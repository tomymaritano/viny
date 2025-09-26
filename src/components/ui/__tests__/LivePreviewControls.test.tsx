import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import LivePreviewControls from '../LivePreviewControls'

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Check: ({ className }: { className?: string }) => (
    <div data-testid="check-icon" className={className}>
      Check
    </div>
  ),
  X: ({ className }: { className?: string }) => (
    <div data-testid="x-icon" className={className}>
      X
    </div>
  ),
  RotateCcw: ({ className }: { className?: string }) => (
    <div data-testid="rotate-icon" className={className}>
      RotateCcw
    </div>
  ),
  Eye: ({ className }: { className?: string }) => (
    <div data-testid="eye-icon" className={className}>
      Eye
    </div>
  ),
  EyeOff: ({ className }: { className?: string }) => (
    <div data-testid="eye-off-icon" className={className}>
      EyeOff
    </div>
  ),
}))

describe('LivePreviewControls', () => {
  const defaultProps = {
    isActive: true,
    modifiedCount: 1,
    modifiedKeys: ['theme'],
    onApply: vi.fn(),
    onRevert: vi.fn(),
    onCancel: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders nothing when not active', () => {
    const { container } = render(
      <LivePreviewControls {...defaultProps} isActive={false} />
    )

    expect(container.firstChild).toBeNull()
  })

  it('renders nothing when no modifications', () => {
    const { container } = render(
      <LivePreviewControls {...defaultProps} modifiedCount={0} />
    )

    expect(container.firstChild).toBeNull()
  })

  it('renders live preview controls when active with modifications', () => {
    render(<LivePreviewControls {...defaultProps} />)

    expect(screen.getByText('Live Preview Active')).toBeInTheDocument()
    expect(screen.getByText('1 setting modified')).toBeInTheDocument()
    expect(screen.getByTestId('eye-icon')).toBeInTheDocument()
  })

  it('displays correct count for multiple modifications', () => {
    const props = {
      ...defaultProps,
      modifiedCount: 3,
      modifiedKeys: ['theme', 'fontSize', 'lineHeight'],
    }

    render(<LivePreviewControls {...props} />)

    expect(screen.getByText('3 settings modified')).toBeInTheDocument()
  })

  it('shows modified keys when showDetails is true', () => {
    const props = {
      ...defaultProps,
      modifiedKeys: ['theme', 'fontSize'],
      showDetails: true,
    }

    render(<LivePreviewControls {...props} />)

    expect(screen.getByText(/theme, fontSize/)).toBeInTheDocument()
  })

  it('calls onRevert when revert button is clicked', () => {
    render(<LivePreviewControls {...defaultProps} />)

    const revertButton = screen.getByText('Revert')
    fireEvent.click(revertButton)

    expect(defaultProps.onRevert).toHaveBeenCalledTimes(1)
  })

  it('calls onCancel when cancel button is clicked', () => {
    render(<LivePreviewControls {...defaultProps} />)

    const cancelButton = screen.getByText('Cancel')
    fireEvent.click(cancelButton)

    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1)
  })

  it('calls onApply when apply button is clicked', () => {
    render(<LivePreviewControls {...defaultProps} />)

    const applyButton = screen.getByText('Apply')
    fireEvent.click(applyButton)

    expect(defaultProps.onApply).toHaveBeenCalledTimes(1)
  })

  it('applies custom className', () => {
    const { container } = render(
      <LivePreviewControls {...defaultProps} className="custom-class" />
    )

    const controlsElement = container.querySelector('.custom-class')
    expect(controlsElement).toBeInTheDocument()
  })

  it('renders all action buttons with correct icons', () => {
    render(<LivePreviewControls {...defaultProps} />)

    expect(screen.getByTestId('rotate-icon')).toBeInTheDocument()
    expect(screen.getByTestId('x-icon')).toBeInTheDocument()
    expect(screen.getByTestId('check-icon')).toBeInTheDocument()
  })

  it('displays help text about auto-revert', () => {
    render(<LivePreviewControls {...defaultProps} />)

    expect(
      screen.getByText(/Changes will auto-revert in a few seconds/)
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Click Apply to make changes permanent/)
    ).toBeInTheDocument()
  })

  it('handles singular vs plural correctly', () => {
    // Single setting
    const singleProps = {
      ...defaultProps,
      modifiedCount: 1,
      modifiedKeys: ['theme'],
    }

    const { rerender } = render(<LivePreviewControls {...singleProps} />)
    expect(screen.getByText('1 setting modified')).toBeInTheDocument()

    // Multiple settings
    const multipleProps = {
      ...defaultProps,
      modifiedCount: 2,
      modifiedKeys: ['theme', 'fontSize'],
    }

    rerender(<LivePreviewControls {...multipleProps} />)
    expect(screen.getByText('2 settings modified')).toBeInTheDocument()
  })

  it('renders with proper blue theme styling', () => {
    const { container } = render(<LivePreviewControls {...defaultProps} />)

    const controlsContainer = container.firstChild as HTMLElement
    expect(controlsContainer).toHaveClass(
      'bg-blue-50',
      'dark:bg-blue-900/20',
      'border-blue-200',
      'dark:border-blue-800'
    )
  })
})
