import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import BaseModal from '../BaseModal'

// Mock dependencies
vi.mock('../../Icons', () => ({
  default: {
    X: () => null
  }
}))

vi.mock('../IconButton', () => ({
  default: ({ onClick, 'aria-label': ariaLabel }: any) => (
    <button onClick={onClick} aria-label={ariaLabel}>
      Close
    </button>
  )
}))

vi.mock('../../constants/theme', () => ({
  THEME_COLORS: {
    MODAL_BG: '#ffffff'
  },
  ANIMATIONS: {
    FADE_IN: 'fade-in',
    ZOOM_IN: 'zoom-in'
  }
}))

vi.mock('../../hooks/useStyles', () => ({
  useStyles: () => ({
    cn: (...classes: string[]) => classes.filter(Boolean).join(' '),
    modal: {
      overlay: () => 'modal-overlay',
      container: (size: string) => `modal-container modal-${size}`,
      header: () => 'modal-header'
    }
  })
}))

describe('BaseModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    title: 'Test Modal',
    children: <div>Modal content</div>
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders when isOpen is true', () => {
    render(<BaseModal {...defaultProps} />)
    
    expect(screen.getByText('Test Modal')).toBeInTheDocument()
    expect(screen.getByText('Modal content')).toBeInTheDocument()
  })

  it('does not render when isOpen is false', () => {
    render(<BaseModal {...defaultProps} isOpen={false} />)
    
    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument()
    expect(screen.queryByText('Modal content')).not.toBeInTheDocument()
  })

  it('renders with icon when provided', () => {
    const icon = <span data-testid="custom-icon">Icon</span>
    render(<BaseModal {...defaultProps} icon={icon} />)
    
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument()
  })

  it('shows close button by default', () => {
    render(<BaseModal {...defaultProps} />)
    
    expect(screen.getByLabelText('Close Test Modal modal')).toBeInTheDocument()
  })

  it('hides close button when showCloseButton is false', () => {
    render(<BaseModal {...defaultProps} showCloseButton={false} />)
    
    expect(screen.queryByLabelText('Close Test Modal modal')).not.toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn()
    render(<BaseModal {...defaultProps} onClose={onClose} />)
    
    fireEvent.click(screen.getByLabelText('Close Test Modal modal'))
    
    expect(onClose).toHaveBeenCalled()
  })

  it('closes on backdrop click by default', () => {
    const onClose = vi.fn()
    render(<BaseModal {...defaultProps} onClose={onClose} />)
    
    const backdrop = screen.getByRole('dialog')
    fireEvent.click(backdrop)
    
    expect(onClose).toHaveBeenCalled()
  })

  it('does not close on backdrop click when closeOnBackdrop is false', () => {
    const onClose = vi.fn()
    render(<BaseModal {...defaultProps} onClose={onClose} closeOnBackdrop={false} />)
    
    const backdrop = screen.getByRole('dialog')
    fireEvent.click(backdrop)
    
    expect(onClose).not.toHaveBeenCalled()
  })

  it('does not close when clicking modal content', () => {
    const onClose = vi.fn()
    render(<BaseModal {...defaultProps} onClose={onClose} />)
    
    fireEvent.click(screen.getByText('Modal content'))
    
    expect(onClose).not.toHaveBeenCalled()
  })

  it('closes on Escape key by default', () => {
    const onClose = vi.fn()
    render(<BaseModal {...defaultProps} onClose={onClose} />)
    
    fireEvent.keyDown(document, { key: 'Escape' })
    
    expect(onClose).toHaveBeenCalled()
  })

  it('does not close on Escape key when closeOnEscape is false', () => {
    const onClose = vi.fn()
    render(<BaseModal {...defaultProps} onClose={onClose} closeOnEscape={false} />)
    
    fireEvent.keyDown(document, { key: 'Escape' })
    
    expect(onClose).not.toHaveBeenCalled()
  })

  it('applies correct size classes', () => {
    const sizes: Array<'sm' | 'md' | 'lg' | 'xl'> = ['sm', 'md', 'lg', 'xl']
    const expectedClasses = {
      'sm': 'max-w-sm',
      'md': 'max-w-md',
      'lg': 'max-w-lg',
      'xl': 'max-w-xl'
    }
    
    sizes.forEach(size => {
      const { container } = render(<BaseModal {...defaultProps} maxWidth={size} />)
      const modalContainer = container.querySelector('[tabindex="-1"]')
      expect(modalContainer).toHaveClass(expectedClasses[size])
    })
  })

  it('has proper accessibility attributes', () => {
    render(<BaseModal {...defaultProps} />)
    
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title')
    
    const title = screen.getByText('Test Modal')
    expect(title).toHaveAttribute('id', 'modal-title')
  })

  it('removes event listener on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener')
    const { unmount } = render(<BaseModal {...defaultProps} />)
    
    unmount()
    
    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
  })

  it('does not add event listener when closed', () => {
    const addEventListenerSpy = vi.spyOn(document, 'addEventListener')
    render(<BaseModal {...defaultProps} isOpen={false} />)
    
    const keydownListeners = addEventListenerSpy.mock.calls.filter(
      call => call[0] === 'keydown'
    )
    expect(keydownListeners.length).toBe(0)
  })

  it('focuses modal when opened', () => {
    const { container } = render(<BaseModal {...defaultProps} />)
    
    const modalContainer = container.querySelector('[tabindex="-1"]')
    expect(modalContainer).toBeTruthy()
  })

  it('applies animation classes', () => {
    const { container } = render(<BaseModal {...defaultProps} />)
    
    const overlay = screen.getByRole('dialog')
    expect(overlay).toHaveClass('animate-in', 'fade-in')
    
    const modalContainer = container.querySelector('[tabindex="-1"]')
    expect(modalContainer).toHaveClass('animate-in', 'zoom-in-95')
  })

  it('stops propagation when clicking inside modal', () => {
    const onClose = vi.fn()
    const { container } = render(<BaseModal {...defaultProps} onClose={onClose} />)
    
    const modalContainer = container.querySelector('[tabindex="-1"]')
    if (modalContainer) {
      const event = new MouseEvent('click', { bubbles: true })
      const stopPropagationSpy = vi.spyOn(event, 'stopPropagation')
      
      modalContainer.dispatchEvent(event)
      
      expect(stopPropagationSpy).toHaveBeenCalled()
    }
  })

  it('handles complex nested content', () => {
    const complexContent = (
      <div>
        <h3>Complex Content</h3>
        <p>Paragraph</p>
        <button>Action</button>
        <ul>
          <li>Item 1</li>
          <li>Item 2</li>
        </ul>
      </div>
    )
    
    render(<BaseModal {...defaultProps}>{complexContent}</BaseModal>)
    
    expect(screen.getByText('Complex Content')).toBeInTheDocument()
    expect(screen.getByText('Paragraph')).toBeInTheDocument()
    expect(screen.getByText('Action')).toBeInTheDocument()
    expect(screen.getByText('Item 1')).toBeInTheDocument()
    expect(screen.getByText('Item 2')).toBeInTheDocument()
  })
})