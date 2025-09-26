import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  Toast,
  ToastTitle,
  ToastDescription,
  ToastAction,
  ToastClose,
  ToastProvider,
  ToastViewport,
  toast,
  toastSuccess,
  toastError,
  toastWarning,
  toastInfo,
  useToast,
  Toaster,
} from '../ToastRadix'

// Mock Icons
vi.mock('../../Icons', () => ({
  Icons: {
    X: ({ className }: { className?: string }) => (
      <div data-testid="x-icon" className={className}>
        ✕
      </div>
    ),
    CheckCircle: ({ className }: { className?: string }) => (
      <div data-testid="check-circle" className={className}>
        ✓
      </div>
    ),
    AlertCircle: ({ className }: { className?: string }) => (
      <div data-testid="alert-circle" className={className}>
        ⚠
      </div>
    ),
    AlertTriangle: ({ className }: { className?: string }) => (
      <div data-testid="alert-triangle" className={className}>
        ⚠
      </div>
    ),
    Info: ({ className }: { className?: string }) => (
      <div data-testid="info-icon" className={className}>
        ℹ
      </div>
    ),
  },
}))

// Test component that uses useToast hook
function TestToastComponent() {
  const { toast: toastFn } = useToast()

  return (
    <div>
      <button onClick={() => toastFn({ title: 'Test Toast' })}>
        Show Toast
      </button>
      <button onClick={() => toastSuccess('Success!', 'Operation completed')}>
        Show Success
      </button>
      <button onClick={() => toastError('Error!', 'Something went wrong')}>
        Show Error
      </button>
      <button onClick={() => toastWarning('Warning!', 'Be careful')}>
        Show Warning
      </button>
      <button onClick={() => toastInfo('Info!', 'Just so you know')}>
        Show Info
      </button>
      <Toaster />
    </div>
  )
}

describe('Toast Primitives', () => {
  it('renders toast with title and description', () => {
    render(
      <ToastProvider>
        <Toast open={true}>
          <ToastTitle>Test Title</ToastTitle>
          <ToastDescription>Test Description</ToastDescription>
          <ToastClose />
        </Toast>
        <ToastViewport />
      </ToastProvider>
    )

    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('Test Description')).toBeInTheDocument()
  })

  it('renders toast with action button', () => {
    const actionFn = vi.fn()

    render(
      <ToastProvider>
        <Toast open={true}>
          <ToastTitle>Test Title</ToastTitle>
          <ToastAction altText="Retry" onClick={actionFn}>
            Retry
          </ToastAction>
          <ToastClose />
        </Toast>
        <ToastViewport />
      </ToastProvider>
    )

    const actionButton = screen.getByText('Retry')
    expect(actionButton).toBeInTheDocument()

    fireEvent.click(actionButton)
    expect(actionFn).toHaveBeenCalled()
  })

  it('renders close button', () => {
    render(
      <ToastProvider>
        <Toast open={true}>
          <ToastTitle>Test Title</ToastTitle>
          <ToastClose />
        </Toast>
        <ToastViewport />
      </ToastProvider>
    )

    expect(screen.getByTestId('x-icon')).toBeInTheDocument()
  })

  it('applies variant styles correctly', () => {
    const { rerender } = render(
      <ToastProvider>
        <Toast open={true} variant="success">
          <ToastTitle>Success</ToastTitle>
        </Toast>
        <ToastViewport />
      </ToastProvider>
    )

    let toastElement = screen.getByRole('status')
    expect(toastElement).toHaveClass('success')

    rerender(
      <ToastProvider>
        <Toast open={true} variant="destructive">
          <ToastTitle>Error</ToastTitle>
        </Toast>
        <ToastViewport />
      </ToastProvider>
    )

    toastElement = screen.getByRole('status')
    expect(toastElement).toHaveClass('destructive')
  })

  it('handles keyboard navigation', async () => {
    const user = userEvent.setup()
    const closeFn = vi.fn()

    render(
      <ToastProvider>
        <Toast open={true} onOpenChange={closeFn}>
          <ToastTitle>Test Title</ToastTitle>
          <ToastClose />
        </Toast>
        <ToastViewport />
      </ToastProvider>
    )

    const toastElement = screen.getByRole('status')
    toastElement.focus()

    await user.keyboard('{Escape}')
    expect(closeFn).toHaveBeenCalledWith(false)
  })
})

describe('useToast Hook', () => {
  beforeEach(() => {
    // Clear any existing toasts
    vi.clearAllMocks()
  })

  it('shows basic toast', async () => {
    render(<TestToastComponent />)

    const showButton = screen.getByText('Show Toast')
    fireEvent.click(showButton)

    await waitFor(() => {
      expect(screen.getByText('Test Toast')).toBeInTheDocument()
    })
  })

  it('shows success toast with icon', async () => {
    render(<TestToastComponent />)

    const showButton = screen.getByText('Show Success')
    fireEvent.click(showButton)

    await waitFor(() => {
      expect(screen.getByText('Success!')).toBeInTheDocument()
      expect(screen.getByText('Operation completed')).toBeInTheDocument()
      expect(screen.getByTestId('check-circle')).toBeInTheDocument()
    })
  })

  it('shows error toast with icon', async () => {
    render(<TestToastComponent />)

    const showButton = screen.getByText('Show Error')
    fireEvent.click(showButton)

    await waitFor(() => {
      expect(screen.getByText('Error!')).toBeInTheDocument()
      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
      expect(screen.getByTestId('alert-circle')).toBeInTheDocument()
    })
  })

  it('shows warning toast with icon', async () => {
    render(<TestToastComponent />)

    const showButton = screen.getByText('Show Warning')
    fireEvent.click(showButton)

    await waitFor(() => {
      expect(screen.getByText('Warning!')).toBeInTheDocument()
      expect(screen.getByText('Be careful')).toBeInTheDocument()
      expect(screen.getByTestId('alert-triangle')).toBeInTheDocument()
    })
  })

  it('shows info toast with icon', async () => {
    render(<TestToastComponent />)

    const showButton = screen.getByText('Show Info')
    fireEvent.click(showButton)

    await waitFor(() => {
      expect(screen.getByText('Info!')).toBeInTheDocument()
      expect(screen.getByText('Just so you know')).toBeInTheDocument()
      expect(screen.getByTestId('info-icon')).toBeInTheDocument()
    })
  })

  it('dismisses toast when close button is clicked', async () => {
    render(<TestToastComponent />)

    const showButton = screen.getByText('Show Toast')
    fireEvent.click(showButton)

    await waitFor(() => {
      expect(screen.getByText('Test Toast')).toBeInTheDocument()
    })

    const closeButton = screen.getByTestId('x-icon')
    fireEvent.click(closeButton)

    await waitFor(() => {
      expect(screen.queryByText('Test Toast')).not.toBeInTheDocument()
    })
  })

  it('limits number of toasts to 3', async () => {
    render(<TestToastComponent />)

    // Show 4 toasts
    const showButton = screen.getByText('Show Toast')
    fireEvent.click(showButton)
    fireEvent.click(showButton)
    fireEvent.click(showButton)
    fireEvent.click(showButton)

    await waitFor(() => {
      const toasts = screen.getAllByRole('status')
      expect(toasts).toHaveLength(3)
    })
  })

  it('returns toast control functions', () => {
    const toastResult = toast({ title: 'Test' })

    expect(toastResult).toHaveProperty('id')
    expect(toastResult).toHaveProperty('dismiss')
    expect(toastResult).toHaveProperty('update')
    expect(typeof toastResult.dismiss).toBe('function')
    expect(typeof toastResult.update).toBe('function')
  })

  it('allows updating toast content', async () => {
    render(<TestToastComponent />)

    const toastResult = toast({ title: 'Original Title' })

    await waitFor(() => {
      expect(screen.getByText('Original Title')).toBeInTheDocument()
    })

    toastResult.update({ title: 'Updated Title' })

    await waitFor(() => {
      expect(screen.getByText('Updated Title')).toBeInTheDocument()
      expect(screen.queryByText('Original Title')).not.toBeInTheDocument()
    })
  })

  it('allows dismissing specific toast', async () => {
    render(<TestToastComponent />)

    const toastResult = toast({ title: 'Dismissible Toast' })

    await waitFor(() => {
      expect(screen.getByText('Dismissible Toast')).toBeInTheDocument()
    })

    toastResult.dismiss()

    await waitFor(() => {
      expect(screen.queryByText('Dismissible Toast')).not.toBeInTheDocument()
    })
  })
})

describe('Toast Accessibility', () => {
  it('has proper ARIA attributes', () => {
    render(
      <ToastProvider>
        <Toast open={true}>
          <ToastTitle>Test Title</ToastTitle>
          <ToastDescription>Test Description</ToastDescription>
        </Toast>
        <ToastViewport />
      </ToastProvider>
    )

    const toastElement = screen.getByRole('status')
    expect(toastElement).toHaveAttribute('aria-live', 'polite')
    expect(toastElement).toHaveAttribute('aria-atomic', 'true')
  })

  it('supports keyboard navigation to close button', async () => {
    const user = userEvent.setup()

    render(
      <ToastProvider>
        <Toast open={true}>
          <ToastTitle>Test Title</ToastTitle>
          <ToastClose />
        </Toast>
        <ToastViewport />
      </ToastProvider>
    )

    const closeButton = screen.getByRole('button')
    await user.tab()
    expect(closeButton).toHaveFocus()
  })

  it('supports swipe gestures for dismissal', () => {
    render(
      <ToastProvider>
        <Toast open={true}>
          <ToastTitle>Test Title</ToastTitle>
        </Toast>
        <ToastViewport />
      </ToastProvider>
    )

    const toastElement = screen.getByRole('status')
    expect(toastElement).toHaveAttribute('data-swipe-direction', 'right')
  })

  it('has proper focus management', () => {
    render(
      <ToastProvider>
        <Toast open={true}>
          <ToastTitle>Test Title</ToastTitle>
          <ToastAction altText="Action">Action</ToastAction>
          <ToastClose />
        </Toast>
        <ToastViewport />
      </ToastProvider>
    )

    const actionButton = screen.getByText('Action')
    const closeButton = screen.getByRole('button', { name: /close/i })

    expect(actionButton).toHaveAttribute('tabindex', '0')
    expect(closeButton).toHaveAttribute('tabindex', '0')
  })
})

describe('Toaster Component', () => {
  it('renders toast viewport', () => {
    render(<Toaster />)

    const viewport = screen.getByRole('region')
    expect(viewport).toBeInTheDocument()
    expect(viewport).toHaveAttribute('aria-label', 'Notifications')
  })

  it('renders multiple toasts', async () => {
    render(<TestToastComponent />)

    const showButton = screen.getByText('Show Toast')
    fireEvent.click(showButton)
    fireEvent.click(showButton)

    await waitFor(() => {
      const toasts = screen.getAllByRole('status')
      expect(toasts.length).toBeGreaterThan(1)
    })
  })
})
