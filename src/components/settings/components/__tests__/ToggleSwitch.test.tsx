import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ToggleSwitch from '../ToggleSwitch'

describe('ToggleSwitch', () => {
  const defaultProps = {
    checked: false,
    onChange: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders unchecked state correctly', () => {
    render(<ToggleSwitch {...defaultProps} />)

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).not.toBeChecked()
  })

  it('renders checked state correctly', () => {
    render(<ToggleSwitch {...defaultProps} checked={true} />)

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeChecked()
  })

  it('calls onChange when clicked', () => {
    const onChange = vi.fn()
    render(<ToggleSwitch {...defaultProps} onChange={onChange} />)

    const checkbox = screen.getByRole('checkbox')
    fireEvent.click(checkbox)

    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('calls onChange with false when unchecking', () => {
    const onChange = vi.fn()
    render(
      <ToggleSwitch {...defaultProps} checked={true} onChange={onChange} />
    )

    const checkbox = screen.getByRole('checkbox')
    fireEvent.click(checkbox)

    expect(onChange).toHaveBeenCalledWith(false)
  })

  it('checkbox is disabled when disabled prop is true', () => {
    render(<ToggleSwitch {...defaultProps} disabled={true} />)

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeDisabled()
    expect(checkbox).toHaveAttribute('disabled')
  })

  it('applies disabled styles when disabled', () => {
    const { container } = render(
      <ToggleSwitch {...defaultProps} disabled={true} />
    )

    const label = container.querySelector('label')
    expect(label).toHaveClass('opacity-50', 'cursor-not-allowed')

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeDisabled()
  })

  it('renders with small size', () => {
    const { container } = render(<ToggleSwitch {...defaultProps} size="sm" />)

    const toggleDiv = container.querySelector('.w-8.h-4')
    expect(toggleDiv).toBeInTheDocument()
  })

  it('renders with medium size by default', () => {
    const { container } = render(<ToggleSwitch {...defaultProps} />)

    const toggleDiv = container.querySelector('.w-11.h-6')
    expect(toggleDiv).toBeInTheDocument()
  })

  it('renders with large size', () => {
    const { container } = render(<ToggleSwitch {...defaultProps} size="lg" />)

    const toggleDiv = container.querySelector('.w-14.h-8')
    expect(toggleDiv).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <ToggleSwitch {...defaultProps} className="custom-class" />
    )

    const label = container.querySelector('label')
    expect(label).toHaveClass('custom-class')
  })

  it('has sr-only checkbox for accessibility', () => {
    render(<ToggleSwitch {...defaultProps} />)

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toHaveClass('sr-only')
  })

  it('applies focus styles', () => {
    const { container } = render(<ToggleSwitch {...defaultProps} />)

    const toggleDiv = container.querySelector('div[class*="peer-focus:ring-4"]')
    expect(toggleDiv).toBeInTheDocument()
  })

  it('applies checked background color', () => {
    const { container } = render(
      <ToggleSwitch {...defaultProps} checked={true} />
    )

    const toggleDiv = container.querySelector(
      'div[class*="peer-checked:bg-theme-accent-primary"]'
    )
    expect(toggleDiv).toBeInTheDocument()
  })

  it('maintains state when re-rendered', () => {
    const { rerender } = render(
      <ToggleSwitch {...defaultProps} checked={false} />
    )

    let checkbox = screen.getByRole('checkbox')
    expect(checkbox).not.toBeChecked()

    rerender(<ToggleSwitch {...defaultProps} checked={true} />)

    checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeChecked()
  })

  it('handles rapid clicks correctly', () => {
    const onChange = vi.fn()
    render(<ToggleSwitch {...defaultProps} onChange={onChange} />)

    const checkbox = screen.getByRole('checkbox')

    fireEvent.click(checkbox)
    fireEvent.click(checkbox)
    fireEvent.click(checkbox)

    expect(onChange).toHaveBeenCalledTimes(3)
    expect(onChange).toHaveBeenNthCalledWith(1, true)
    expect(onChange).toHaveBeenNthCalledWith(2, true)
    expect(onChange).toHaveBeenNthCalledWith(3, true)
  })

  it('applies correct cursor styles', () => {
    const { container } = render(<ToggleSwitch {...defaultProps} />)

    const label = container.querySelector('label')
    expect(label).toHaveClass('cursor-pointer')
  })

  it('renders with proper transition classes', () => {
    const { container } = render(<ToggleSwitch {...defaultProps} />)

    const toggleDiv = container.querySelector(
      'div[class*="after:transition-all"]'
    )
    expect(toggleDiv).toBeInTheDocument()
  })

  it('applies correct thumb size for small variant', () => {
    const { container } = render(<ToggleSwitch {...defaultProps} size="sm" />)

    const toggleDiv = container.querySelector('div[class*="h-3"][class*="w-3"]')
    expect(toggleDiv).toBeInTheDocument()
  })

  it('applies correct thumb size for large variant', () => {
    const { container } = render(<ToggleSwitch {...defaultProps} size="lg" />)

    const toggleDiv = container.querySelector('div[class*="h-7"][class*="w-7"]')
    expect(toggleDiv).toBeInTheDocument()
  })
})
