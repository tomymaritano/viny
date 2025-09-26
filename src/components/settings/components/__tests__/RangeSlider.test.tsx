import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import RangeSlider from '../RangeSlider'

describe('RangeSlider', () => {
  const defaultProps = {
    value: 50,
    onChange: vi.fn(),
    min: 0,
    max: 100,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders with current value', () => {
    render(<RangeSlider {...defaultProps} />)

    const slider = screen.getByRole('slider')
    expect(slider).toHaveValue('50')
  })

  it('displays the value when showValue is true', () => {
    render(<RangeSlider {...defaultProps} />)

    expect(screen.getByText('50')).toBeInTheDocument()
  })

  it('does not display value when showValue is false', () => {
    render(<RangeSlider {...defaultProps} showValue={false} />)

    expect(screen.queryByText('50')).not.toBeInTheDocument()
  })

  it('renders label when provided', () => {
    render(<RangeSlider {...defaultProps} label="Volume" />)

    expect(screen.getByText('Volume')).toBeInTheDocument()
  })

  it('renders min and max labels when provided', () => {
    render(<RangeSlider {...defaultProps} minLabel="Min" maxLabel="Max" />)

    expect(screen.getByText('Min')).toBeInTheDocument()
    expect(screen.getByText('Max')).toBeInTheDocument()
  })

  it('calls onChange when value changes', () => {
    const onChange = vi.fn()
    render(<RangeSlider {...defaultProps} onChange={onChange} />)

    const slider = screen.getByRole('slider')
    fireEvent.change(slider, { target: { value: '75' } })

    expect(onChange).toHaveBeenCalledWith(75)
  })

  it('respects min and max boundaries', () => {
    render(<RangeSlider {...defaultProps} min={10} max={90} />)

    const slider = screen.getByRole('slider')
    expect(slider).toHaveAttribute('min', '10')
    expect(slider).toHaveAttribute('max', '90')
  })

  it('uses custom step value', () => {
    render(<RangeSlider {...defaultProps} step={5} />)

    const slider = screen.getByRole('slider')
    expect(slider).toHaveAttribute('step', '5')
  })

  it('uses default step of 1', () => {
    render(<RangeSlider {...defaultProps} />)

    const slider = screen.getByRole('slider')
    expect(slider).toHaveAttribute('step', '1')
  })

  it('formats value with custom formatter', () => {
    const formatter = (value: number) => `${value}%`
    render(<RangeSlider {...defaultProps} valueFormatter={formatter} />)

    expect(screen.getByText('50%')).toBeInTheDocument()
  })

  it('disables slider when disabled prop is true', () => {
    render(<RangeSlider {...defaultProps} disabled={true} />)

    const slider = screen.getByRole('slider')
    expect(slider).toBeDisabled()
  })

  it('applies custom className', () => {
    const { container } = render(
      <RangeSlider {...defaultProps} className="custom-class" />
    )

    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('handles decimal values correctly', () => {
    const onChange = vi.fn()
    render(
      <RangeSlider
        {...defaultProps}
        value={1.5}
        min={0}
        max={10}
        step={0.1}
        onChange={onChange}
      />
    )

    const slider = screen.getByRole('slider')
    expect(slider).toHaveValue('1.5')

    fireEvent.change(slider, { target: { value: '2.5' } })
    expect(onChange).toHaveBeenCalledWith(2.5)
  })

  it('applies correct styling classes', () => {
    render(<RangeSlider {...defaultProps} />)

    const slider = screen.getByRole('slider')
    expect(slider).toHaveClass(
      'flex-1',
      'h-2',
      'bg-theme-bg-tertiary',
      'rounded-lg'
    )
  })

  it('applies disabled styles when disabled', () => {
    render(<RangeSlider {...defaultProps} disabled={true} />)

    const slider = screen.getByRole('slider')
    expect(slider).toHaveClass(
      'disabled:opacity-50',
      'disabled:cursor-not-allowed'
    )
  })

  it('renders label with correct styling', () => {
    render(<RangeSlider {...defaultProps} label="Test Label" />)

    const label = screen.getByText('Test Label')
    expect(label).toHaveClass(
      'block',
      'text-sm',
      'font-medium',
      'text-theme-text-secondary'
    )
  })

  it('renders min/max labels with correct styling', () => {
    render(<RangeSlider {...defaultProps} minLabel="0%" maxLabel="100%" />)

    const minLabel = screen.getByText('0%')
    const maxLabel = screen.getByText('100%')

    expect(minLabel).toHaveClass('text-xs', 'text-theme-text-muted')
    expect(maxLabel).toHaveClass('text-xs', 'text-theme-text-muted')
  })

  it('renders value display with correct styling', () => {
    render(<RangeSlider {...defaultProps} />)

    const valueDisplay = screen.getByText('50')
    expect(valueDisplay).toHaveClass(
      'text-sm',
      'font-medium',
      'text-theme-text-primary',
      'min-w-[3rem]',
      'text-right'
    )
  })

  it('maintains value when re-rendered', () => {
    const { rerender } = render(<RangeSlider {...defaultProps} value={25} />)

    let slider = screen.getByRole('slider')
    expect(slider).toHaveValue('25')

    rerender(<RangeSlider {...defaultProps} value={75} />)

    slider = screen.getByRole('slider')
    expect(slider).toHaveValue('75')
  })

  it('handles edge case values', () => {
    const onChange = vi.fn()
    render(<RangeSlider value={0} onChange={onChange} min={-100} max={100} />)

    const slider = screen.getByRole('slider')
    expect(slider).toHaveValue('0')

    fireEvent.change(slider, { target: { value: '-50' } })
    expect(onChange).toHaveBeenCalledWith(-50)
  })
})
