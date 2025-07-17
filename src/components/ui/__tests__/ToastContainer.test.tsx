import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { ToastContainer } from '../ToastContainer'
import { ToastProps } from '../Toast'

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

describe('ToastContainer', () => {
  const defaultToast = {
    id: 'toast-1',
    type: 'info' as const,
    message: 'Test toast message'
  }

  const onDismiss = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  it('renders nothing when no toasts', () => {
    const { container } = render(
      <ToastContainer toasts={[]} onDismiss={onDismiss} />
    )
    
    expect(container.firstChild).toBeNull()
  })

  it('renders single toast', () => {
    render(
      <ToastContainer toasts={[defaultToast]} onDismiss={onDismiss} />
    )
    
    expect(screen.getByText('Test toast message')).toBeInTheDocument()
  })

  it('renders multiple toasts', () => {
    const toasts = [
      { id: 'toast-1', type: 'info' as const, message: 'First toast' },
      { id: 'toast-2', type: 'success' as const, message: 'Second toast' },
      { id: 'toast-3', type: 'error' as const, message: 'Third toast' }
    ]
    
    render(
      <ToastContainer toasts={toasts} onDismiss={onDismiss} />
    )
    
    expect(screen.getByText('First toast')).toBeInTheDocument()
    expect(screen.getByText('Second toast')).toBeInTheDocument()
    expect(screen.getByText('Third toast')).toBeInTheDocument()
  })

  it('respects maxToasts limit', () => {
    const toasts = Array.from({ length: 10 }, (_, i) => ({
      id: `toast-${i}`,
      type: 'info' as const,
      message: `Toast ${i}`
    }))
    
    render(
      <ToastContainer toasts={toasts} onDismiss={onDismiss} maxToasts={3} />
    )
    
    // Should only show first 3 toasts
    expect(screen.getByText('Toast 0')).toBeInTheDocument()
    expect(screen.getByText('Toast 1')).toBeInTheDocument()
    expect(screen.getByText('Toast 2')).toBeInTheDocument()
    expect(screen.queryByText('Toast 3')).not.toBeInTheDocument()
  })

  it('auto-dismisses toasts with duration', () => {
    const toast = {
      ...defaultToast,
      duration: 3000
    }
    
    render(
      <ToastContainer toasts={[toast]} onDismiss={onDismiss} />
    )
    
    expect(screen.getByText('Test toast message')).toBeInTheDocument()
    
    // Should not be called yet
    expect(onDismiss).not.toHaveBeenCalled()
    
    // Fast forward time
    vi.advanceTimersByTime(3000)
    
    expect(onDismiss).toHaveBeenCalledWith('toast-1')
  })

  it('does not auto-dismiss toasts without duration', () => {
    render(
      <ToastContainer toasts={[defaultToast]} onDismiss={onDismiss} />
    )
    
    vi.advanceTimersByTime(10000)
    
    expect(onDismiss).not.toHaveBeenCalled()
  })

  it('applies correct position classes for top-right', () => {
    render(
      <ToastContainer 
        toasts={[defaultToast]} 
        onDismiss={onDismiss} 
        position="top-right"
      />
    )
    
    const container = screen.getByText('Test toast message').closest('.fixed')
    expect(container).toHaveClass('top-0', 'right-0', 'items-end')
  })

  it('applies correct position classes for top-left', () => {
    render(
      <ToastContainer 
        toasts={[defaultToast]} 
        onDismiss={onDismiss} 
        position="top-left"
      />
    )
    
    const container = screen.getByText('Test toast message').closest('.fixed')
    expect(container).toHaveClass('top-0', 'left-0', 'items-start')
  })

  it('applies correct position classes for bottom-right', () => {
    render(
      <ToastContainer 
        toasts={[defaultToast]} 
        onDismiss={onDismiss} 
        position="bottom-right"
      />
    )
    
    const container = screen.getByText('Test toast message').closest('.fixed')
    expect(container).toHaveClass('bottom-0', 'right-0', 'items-end')
  })

  it('applies correct position classes for bottom-left', () => {
    render(
      <ToastContainer 
        toasts={[defaultToast]} 
        onDismiss={onDismiss} 
        position="bottom-left"
      />
    )
    
    const container = screen.getByText('Test toast message').closest('.fixed')
    expect(container).toHaveClass('bottom-0', 'left-0', 'items-start')
  })

  it('applies correct position classes for top-center', () => {
    render(
      <ToastContainer 
        toasts={[defaultToast]} 
        onDismiss={onDismiss} 
        position="top-center"
      />
    )
    
    const container = screen.getByText('Test toast message').closest('.fixed')
    expect(container).toHaveClass('top-0', 'left-1/2', 'transform', '-translate-x-1/2', 'items-center')
  })

  it('applies correct position classes for bottom-center', () => {
    render(
      <ToastContainer 
        toasts={[defaultToast]} 
        onDismiss={onDismiss} 
        position="bottom-center"
      />
    )
    
    const container = screen.getByText('Test toast message').closest('.fixed')
    expect(container).toHaveClass('bottom-0', 'left-1/2', 'transform', '-translate-x-1/2', 'items-center')
  })

  it('uses default position when not specified', () => {
    render(
      <ToastContainer toasts={[defaultToast]} onDismiss={onDismiss} />
    )
    
    const container = screen.getByText('Test toast message').closest('.fixed')
    expect(container).toHaveClass('top-0', 'right-0', 'items-end')
  })

  it('applies correct animation classes based on position', () => {
    const { rerender } = render(
      <ToastContainer 
        toasts={[defaultToast]} 
        onDismiss={onDismiss} 
        position="top-right"
      />
    )
    
    // Find the wrapper div with transform class in document.body (portal)
    let animationWrapper = document.body.querySelector('.transform.transition-all')
    expect(animationWrapper).toHaveClass('animate-slide-in-right')
    
    rerender(
      <ToastContainer 
        toasts={[defaultToast]} 
        onDismiss={onDismiss} 
        position="top-left"
      />
    )
    
    animationWrapper = document.body.querySelector('.transform.transition-all')
    expect(animationWrapper).toHaveClass('animate-slide-in-left')
  })

  it('passes toast props correctly to Toast component', () => {
    const toastWithDetails = {
      ...defaultToast,
      details: 'Some details',
      dismissible: false,
      actions: [{ label: 'Action', action: vi.fn() }]
    }
    
    render(
      <ToastContainer toasts={[toastWithDetails]} onDismiss={onDismiss} />
    )
    
    expect(screen.getByText('Test toast message')).toBeInTheDocument()
    expect(screen.getByText('Some details')).toBeInTheDocument()
    expect(screen.getByText('Action')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Dismiss/ })).not.toBeInTheDocument()
  })

  it('handles toast updates correctly', () => {
    const { rerender } = render(
      <ToastContainer toasts={[defaultToast]} onDismiss={onDismiss} />
    )
    
    expect(screen.getByText('Test toast message')).toBeInTheDocument()
    
    const updatedToast = {
      ...defaultToast,
      message: 'Updated message'
    }
    
    rerender(
      <ToastContainer toasts={[updatedToast]} onDismiss={onDismiss} />
    )
    
    expect(screen.queryByText('Test toast message')).not.toBeInTheDocument()
    expect(screen.getByText('Updated message')).toBeInTheDocument()
  })

  it('renders toasts in portal (document.body)', () => {
    render(
      <ToastContainer toasts={[defaultToast]} onDismiss={onDismiss} />
    )
    
    // Toast should be rendered in document.body
    const toast = screen.getByText('Test toast message')
    expect(toast.closest('body')).toBe(document.body)
  })

  it('maintains pointer-events-none on container', () => {
    render(
      <ToastContainer toasts={[defaultToast]} onDismiss={onDismiss} />
    )
    
    const container = screen.getByText('Test toast message').closest('.fixed')
    expect(container).toHaveClass('pointer-events-none')
  })
})