import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Toast, { ToastProps } from '../Toast'

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  X: ({ className }: { className?: string }) => (
    <div data-testid="x-icon" className={className}>X</div>
  ),
  CheckCircle: ({ className }: { className?: string }) => (
    <div data-testid="check-circle" className={className}>CheckCircle</div>
  ),
  AlertCircle: ({ className }: { className?: string }) => (
    <div data-testid="alert-circle" className={className}>AlertCircle</div>
  ),
  AlertTriangle: ({ className }: { className?: string }) => (
    <div data-testid="alert-triangle" className={className}>AlertTriangle</div>
  ),
  Info: ({ className }: { className?: string }) => (
    <div data-testid="info-icon" className={className}>Info</div>
  )
}))

describe('Toast', () => {
  const defaultProps: ToastProps = {
    id: 'test-toast',
    type: 'info',
    message: 'Test message',
    onDismiss: vi.fn()
  }

  it('renders with basic props', () => {
    render(<Toast {...defaultProps} />)
    
    expect(screen.getByText('Test message')).toBeInTheDocument()
    expect(screen.getByTestId('info-icon')).toBeInTheDocument()
  })

  it('renders success toast with correct icon and colors', () => {
    render(<Toast {...defaultProps} type="success" />)
    
    expect(screen.getByTestId('check-circle')).toBeInTheDocument()
    const icon = screen.getByTestId('check-circle')
    expect(icon).toHaveClass('text-green-500')
  })

  it('renders error toast with correct icon and colors', () => {
    render(<Toast {...defaultProps} type="error" />)
    
    expect(screen.getByTestId('alert-circle')).toBeInTheDocument()
    const icon = screen.getByTestId('alert-circle')
    expect(icon).toHaveClass('text-red-500')
  })

  it('renders warning toast with correct icon and colors', () => {
    render(<Toast {...defaultProps} type="warning" />)
    
    expect(screen.getByTestId('alert-triangle')).toBeInTheDocument()
    const icon = screen.getByTestId('alert-triangle')
    expect(icon).toHaveClass('text-yellow-500')
  })

  it('renders with details text', () => {
    render(<Toast {...defaultProps} details="Additional details here" />)
    
    expect(screen.getByText('Test message')).toBeInTheDocument()
    expect(screen.getByText('Additional details here')).toBeInTheDocument()
  })

  it('shows dismiss button by default', () => {
    render(<Toast {...defaultProps} />)
    
    const dismissButton = screen.getByRole('button', { name: /Dismiss/ })
    expect(dismissButton).toBeInTheDocument()
  })

  it('hides dismiss button when dismissible is false', () => {
    render(<Toast {...defaultProps} dismissible={false} />)
    
    expect(screen.queryByRole('button', { name: 'Dismiss' })).not.toBeInTheDocument()
  })

  it('calls onDismiss when dismiss button is clicked', () => {
    const onDismiss = vi.fn()
    render(<Toast {...defaultProps} onDismiss={onDismiss} />)
    
    const dismissButton = screen.getByRole('button', { name: /Dismiss/ })
    fireEvent.click(dismissButton)
    
    expect(onDismiss).toHaveBeenCalledWith('test-toast')
  })

  it('renders action buttons', () => {
    const actions = [
      { label: 'Retry', action: vi.fn() },
      { label: 'Learn More', action: vi.fn() }
    ]
    
    render(<Toast {...defaultProps} actions={actions} />)
    
    expect(screen.getByText('Retry')).toBeInTheDocument()
    expect(screen.getByText('Learn More')).toBeInTheDocument()
  })

  it('calls action callbacks when action buttons are clicked', () => {
    const retryAction = vi.fn()
    const learnMoreAction = vi.fn()
    const actions = [
      { label: 'Retry', action: retryAction },
      { label: 'Learn More', action: learnMoreAction }
    ]
    
    render(<Toast {...defaultProps} actions={actions} />)
    
    fireEvent.click(screen.getByText('Retry'))
    expect(retryAction).toHaveBeenCalled()
    
    fireEvent.click(screen.getByText('Learn More'))
    expect(learnMoreAction).toHaveBeenCalled()
  })

  it('applies correct border color for each type', () => {
    const { rerender, container } = render(<Toast {...defaultProps} type="success" />)
    expect(container.firstChild).toHaveClass('border-l-green-500')
    
    rerender(<Toast {...defaultProps} type="error" />)
    expect(container.firstChild).toHaveClass('border-l-red-500')
    
    rerender(<Toast {...defaultProps} type="warning" />)
    expect(container.firstChild).toHaveClass('border-l-yellow-500')
    
    rerender(<Toast {...defaultProps} type="info" />)
    expect(container.firstChild).toHaveClass('border-l-blue-500')
  })

  it('applies correct background color for each type', () => {
    const { rerender, container } = render(<Toast {...defaultProps} type="success" />)
    expect(container.firstChild).toHaveClass('bg-green-50')
    
    rerender(<Toast {...defaultProps} type="error" />)
    expect(container.firstChild).toHaveClass('bg-red-50')
    
    rerender(<Toast {...defaultProps} type="warning" />)
    expect(container.firstChild).toHaveClass('bg-yellow-50')
    
    rerender(<Toast {...defaultProps} type="info" />)
    expect(container.firstChild).toHaveClass('bg-blue-50')
  })

  it('renders with proper accessibility attributes', () => {
    render(<Toast {...defaultProps} />)
    
    const dismissButton = screen.getByRole('button', { name: /Dismiss/ })
    expect(dismissButton).toHaveAccessibleName('Dismiss X')
  })

  it('renders multiple actions correctly', () => {
    const actions = Array.from({ length: 3 }, (_, i) => ({
      label: `Action ${i + 1}`,
      action: vi.fn()
    }))
    
    render(<Toast {...defaultProps} actions={actions} />)
    
    actions.forEach((action, index) => {
      expect(screen.getByText(`Action ${index + 1}`)).toBeInTheDocument()
    })
  })

  it('handles empty actions array', () => {
    render(<Toast {...defaultProps} actions={[]} />)
    
    // Should not render any action buttons
    expect(screen.queryByRole('button', { name: /Action/ })).not.toBeInTheDocument()
  })

  it('maintains proper layout with long messages', () => {
    const longMessage = 'This is a very long message that might wrap to multiple lines in the toast component'
    const longDetails = 'These are very long details that provide additional context and might also wrap to multiple lines'
    
    render(<Toast {...defaultProps} message={longMessage} details={longDetails} />)
    
    expect(screen.getByText(longMessage)).toBeInTheDocument()
    expect(screen.getByText(longDetails)).toBeInTheDocument()
  })
})