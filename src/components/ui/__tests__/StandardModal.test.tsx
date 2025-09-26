import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import StandardModal from '../StandardModal'

// Mock Icons and IconButton
vi.mock('../../Icons', () => ({
  default: {
    X: () => null,
  },
}))

vi.mock('../IconButton', () => ({
  default: ({ onClick, 'aria-label': ariaLabel }: any) => (
    <button onClick={onClick} aria-label={ariaLabel}>
      Close
    </button>
  ),
}))

describe('StandardModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    children: <div>Modal content</div>,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    // Clean up any body styles
    document.body.style.overflow = ''
  })

  it('renders when isOpen is true', () => {
    render(<StandardModal {...defaultProps} />)

    expect(screen.getByText('Modal content')).toBeInTheDocument()
  })

  it('does not render when isOpen is false', () => {
    render(<StandardModal {...defaultProps} isOpen={false} />)

    expect(screen.queryByText('Modal content')).not.toBeInTheDocument()
  })

  it('renders with title', () => {
    render(<StandardModal {...defaultProps} title="Test Modal" />)

    expect(screen.getByText('Test Modal')).toBeInTheDocument()
  })

  it('shows close button by default', () => {
    render(<StandardModal {...defaultProps} />)

    expect(screen.getByLabelText('Close modal')).toBeInTheDocument()
  })

  it('hides close button when showCloseButton is false', () => {
    render(<StandardModal {...defaultProps} showCloseButton={false} />)

    expect(screen.queryByLabelText('Close modal')).not.toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn()
    render(<StandardModal {...defaultProps} onClose={onClose} />)

    fireEvent.click(screen.getByLabelText('Close modal'))

    expect(onClose).toHaveBeenCalled()
  })

  it('closes on backdrop click by default', () => {
    const onClose = vi.fn()
    const { container } = render(
      <StandardModal {...defaultProps} onClose={onClose} />
    )

    // Click on the backdrop (the outer div with fixed positioning)
    const backdrop = container.querySelector('.fixed.inset-0')
    if (backdrop) {
      fireEvent.click(backdrop)
    }

    expect(onClose).toHaveBeenCalled()
  })

  it('does not close on backdrop click when closeOnBackdrop is false', () => {
    const onClose = vi.fn()
    render(
      <StandardModal
        {...defaultProps}
        onClose={onClose}
        closeOnBackdrop={false}
      />
    )

    const backdrop =
      screen.getByText('Modal content').parentElement?.parentElement
    if (backdrop) {
      fireEvent.click(backdrop)
    }

    expect(onClose).not.toHaveBeenCalled()
  })

  it('does not close when clicking modal content', () => {
    const onClose = vi.fn()
    render(<StandardModal {...defaultProps} onClose={onClose} />)

    fireEvent.click(screen.getByText('Modal content'))

    expect(onClose).not.toHaveBeenCalled()
  })

  it('closes on Escape key by default', () => {
    const onClose = vi.fn()
    render(<StandardModal {...defaultProps} onClose={onClose} />)

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(onClose).toHaveBeenCalled()
  })

  it('does not close on Escape key when closeOnEscape is false', () => {
    const onClose = vi.fn()
    render(
      <StandardModal
        {...defaultProps}
        onClose={onClose}
        closeOnEscape={false}
      />
    )

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(onClose).not.toHaveBeenCalled()
  })

  it('prevents body scroll when open by default', () => {
    render(<StandardModal {...defaultProps} />)

    expect(document.body.style.overflow).toBe('hidden')
  })

  it('restores body scroll when closed', () => {
    const { rerender } = render(<StandardModal {...defaultProps} />)

    expect(document.body.style.overflow).toBe('hidden')

    rerender(<StandardModal {...defaultProps} isOpen={false} />)

    expect(document.body.style.overflow).toBe('unset')
  })

  it('does not prevent body scroll when preventBodyScroll is false', () => {
    render(<StandardModal {...defaultProps} preventBodyScroll={false} />)

    expect(document.body.style.overflow).toBe('')
  })

  it('renders footer when provided', () => {
    const footer = <div>Footer content</div>
    render(<StandardModal {...defaultProps} footer={footer} />)

    expect(screen.getByText('Footer content')).toBeInTheDocument()
  })

  it('applies correct size classes', () => {
    const sizes: Array<'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'large' | 'full'> = [
      'xs',
      'sm',
      'md',
      'lg',
      'xl',
      'large',
      'full',
    ]
    const expectedClasses = [
      'max-w-xs',
      'max-w-sm',
      'max-w-md',
      'max-w-lg',
      'max-w-xl',
      'max-w-4xl',
      'max-w-full',
    ]

    sizes.forEach((size, index) => {
      const { container } = render(
        <StandardModal {...defaultProps} size={size} />
      )
      const modalContent = container.querySelector('.bg-theme-bg-secondary')
      expect(modalContent).toHaveClass(expectedClasses[index])
    })
  })

  it('applies correct position classes', () => {
    const positions: Array<'center' | 'top' | 'bottom'> = [
      'center',
      'top',
      'bottom',
    ]
    const expectedClasses = ['items-center', 'items-start', 'items-end']

    positions.forEach((position, index) => {
      const { container } = render(
        <StandardModal {...defaultProps} position={position} />
      )
      const overlay = container.querySelector('.fixed.inset-0')
      expect(overlay).toHaveClass(expectedClasses[index])
    })
  })

  it('applies custom className', () => {
    const { container } = render(
      <StandardModal {...defaultProps} className="custom-modal" />
    )

    const modalContent = container.querySelector('.bg-theme-bg-secondary')
    expect(modalContent).toHaveClass('custom-modal')
  })

  it('applies custom overlayClassName', () => {
    const { container } = render(
      <StandardModal {...defaultProps} overlayClassName="custom-overlay" />
    )

    const overlay = container.querySelector('.fixed.inset-0')
    expect(overlay).toHaveClass('custom-overlay')
  })

  it('removes event listener on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener')
    const { unmount } = render(<StandardModal {...defaultProps} />)

    unmount()

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'keydown',
      expect.any(Function)
    )
  })

  it('does not add event listener when closed', () => {
    const addEventListenerSpy = vi.spyOn(document, 'addEventListener')
    render(<StandardModal {...defaultProps} isOpen={false} />)

    expect(addEventListenerSpy).not.toHaveBeenCalledWith(
      'keydown',
      expect.any(Function)
    )
  })

  it('handles complex nested content', () => {
    const complexContent = (
      <div>
        <h3>Complex Content</h3>
        <p>Paragraph</p>
        <button>Action</button>
      </div>
    )

    render(<StandardModal {...defaultProps}>{complexContent}</StandardModal>)

    expect(screen.getByText('Complex Content')).toBeInTheDocument()
    expect(screen.getByText('Paragraph')).toBeInTheDocument()
    expect(screen.getByText('Action')).toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    render(<StandardModal {...defaultProps} title="Accessible Modal" />)

    const closeButton = screen.getByLabelText('Close modal')
    expect(closeButton).toHaveAttribute('aria-label', 'Close modal')
  })
})
