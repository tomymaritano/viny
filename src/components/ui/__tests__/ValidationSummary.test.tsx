import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ValidationSummary from '../ValidationSummary'

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  AlertTriangle: ({ className }: { className?: string }) => (
    <div data-testid="alert-triangle" className={className}>
      AlertTriangle
    </div>
  ),
  AlertCircle: ({ className }: { className?: string }) => (
    <div data-testid="alert-circle" className={className}>
      AlertCircle
    </div>
  ),
  CheckCircle: ({ className }: { className?: string }) => (
    <div data-testid="check-circle" className={className}>
      CheckCircle
    </div>
  ),
  Info: ({ className }: { className?: string }) => (
    <div data-testid="info" className={className}>
      Info
    </div>
  ),
}))

describe('ValidationSummary', () => {
  const defaultProps = {
    hasErrors: false,
    hasWarnings: false,
    errorCount: 0,
    warningCount: 0,
    errors: [],
    warnings: [],
  }

  it('renders success state when no errors or warnings', () => {
    render(<ValidationSummary {...defaultProps} />)

    expect(screen.getByText('All settings are valid')).toBeInTheDocument()
    expect(screen.getByTestId('check-circle')).toBeInTheDocument()
  })

  it('renders error state correctly', () => {
    const props = {
      ...defaultProps,
      hasErrors: true,
      errorCount: 2,
      errors: ['Name is required', 'Email is invalid'],
    }

    render(<ValidationSummary {...props} />)

    expect(screen.getByText('2 errors')).toBeInTheDocument()
    expect(screen.getByTestId('alert-circle')).toBeInTheDocument()
  })

  it('renders warning state correctly', () => {
    const props = {
      ...defaultProps,
      hasWarnings: true,
      warningCount: 1,
      warnings: ['Font size is very small'],
    }

    render(<ValidationSummary {...props} />)

    expect(screen.getByText('1 warning')).toBeInTheDocument()
    expect(screen.getByTestId('alert-triangle')).toBeInTheDocument()
  })

  it('renders both errors and warnings', () => {
    const props = {
      ...defaultProps,
      hasErrors: true,
      hasWarnings: true,
      errorCount: 1,
      warningCount: 2,
      errors: ['Name is required'],
      warnings: ['Font size is small', 'Line height is tight'],
    }

    render(<ValidationSummary {...props} />)

    expect(screen.getByText('1 error, 2 warnings')).toBeInTheDocument()
  })

  it('shows details when showDetails is true', () => {
    const props = {
      ...defaultProps,
      hasErrors: true,
      errorCount: 1,
      errors: ['Name is required'],
      showDetails: true,
    }

    render(<ValidationSummary {...props} />)

    expect(screen.getByText('Errors:')).toBeInTheDocument()
    expect(screen.getByText('Name is required')).toBeInTheDocument()
  })

  it('shows warnings details when showDetails is true', () => {
    const props = {
      ...defaultProps,
      hasWarnings: true,
      warningCount: 1,
      warnings: ['Font size is very small'],
      showDetails: true,
    }

    render(<ValidationSummary {...props} />)

    expect(screen.getByText('Warnings:')).toBeInTheDocument()
    expect(screen.getByText('Font size is very small')).toBeInTheDocument()
  })

  it('toggles details when toggle button is clicked', () => {
    const onToggleDetails = vi.fn()
    const props = {
      ...defaultProps,
      hasErrors: true,
      errorCount: 1,
      errors: ['Name is required'],
      showDetails: false,
      onToggleDetails,
    }

    render(<ValidationSummary {...props} />)

    const toggleButton = screen.getByText('Show details')
    fireEvent.click(toggleButton)

    expect(onToggleDetails).toHaveBeenCalledTimes(1)
  })

  it('shows hide details button when details are shown', () => {
    const onToggleDetails = vi.fn()
    const props = {
      ...defaultProps,
      hasErrors: true,
      errorCount: 1,
      errors: ['Name is required'],
      showDetails: true,
      onToggleDetails,
    }

    render(<ValidationSummary {...props} />)

    expect(screen.getByText('Hide details')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const props = {
      ...defaultProps,
      hasErrors: true,
      errorCount: 1,
      errors: ['Name is required'],
      className: 'custom-class',
    }

    const { container } = render(<ValidationSummary {...props} />)
    const summaryElement = container.querySelector('.custom-class')

    expect(summaryElement).toBeInTheDocument()
  })

  it('handles singular vs plural correctly', () => {
    // Single error
    const singleErrorProps = {
      ...defaultProps,
      hasErrors: true,
      errorCount: 1,
      errors: ['Single error'],
    }

    const { rerender } = render(<ValidationSummary {...singleErrorProps} />)
    expect(screen.getByText('1 error')).toBeInTheDocument()

    // Multiple errors
    const multipleErrorProps = {
      ...defaultProps,
      hasErrors: true,
      errorCount: 3,
      errors: ['Error 1', 'Error 2', 'Error 3'],
    }

    rerender(<ValidationSummary {...multipleErrorProps} />)
    expect(screen.getByText('3 errors')).toBeInTheDocument()
  })

  it('does not render toggle button when no onToggleDetails provided', () => {
    const props = {
      ...defaultProps,
      hasErrors: true,
      errorCount: 1,
      errors: ['Name is required'],
    }

    render(<ValidationSummary {...props} />)

    expect(screen.queryByText('Show details')).not.toBeInTheDocument()
  })

  it('renders nothing when no errors, warnings, or success state', () => {
    const props = {
      hasErrors: false,
      hasWarnings: false,
      errorCount: 0,
      warningCount: 0,
      errors: [],
      warnings: [],
    }

    const { container } = render(<ValidationSummary {...props} />)

    // Should render the success state
    expect(screen.getByText('All settings are valid')).toBeInTheDocument()
  })
})
