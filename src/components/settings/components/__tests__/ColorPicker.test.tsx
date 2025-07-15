import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ColorPicker from '../ColorPicker'

describe('ColorPicker', () => {
  const defaultProps = {
    value: '#3b82f6',
    onChange: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders current color value', () => {
    render(<ColorPicker {...defaultProps} />)
    
    expect(screen.getByText('#3B82F6')).toBeInTheDocument()
  })

  it('renders color preview box', () => {
    render(<ColorPicker {...defaultProps} />)
    
    const colorBox = screen.getByText('#3B82F6').previousElementSibling
    expect(colorBox).toHaveStyle({ backgroundColor: '#3b82f6' })
  })

  it('renders label when provided', () => {
    render(<ColorPicker {...defaultProps} label="Theme Color" />)
    
    expect(screen.getByText('Theme Color')).toBeInTheDocument()
  })

  it('opens color picker when clicked', () => {
    render(<ColorPicker {...defaultProps} />)
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    expect(screen.getByText('Preset Colors')).toBeInTheDocument()
  })

  it('closes color picker when clicking outside', () => {
    render(<ColorPicker {...defaultProps} />)
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    expect(screen.getByText('Preset Colors')).toBeInTheDocument()
    
    // Click on backdrop
    const backdrop = document.querySelector('.fixed.inset-0')
    fireEvent.click(backdrop!)
    
    expect(screen.queryByText('Preset Colors')).not.toBeInTheDocument()
  })

  it('renders default preset colors', () => {
    render(<ColorPicker {...defaultProps} />)
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    const colorButtons = screen.getAllByRole('button').filter(btn => 
      btn.style.backgroundColor && btn.style.backgroundColor !== ''
    )
    
    // Should have 20 preset colors
    expect(colorButtons.length).toBe(20)
  })

  it('renders custom preset colors', () => {
    const customColors = ['#ff0000', '#00ff00', '#0000ff']
    render(<ColorPicker {...defaultProps} presetColors={customColors} />)
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    const colorButtons = screen.getAllByRole('button').filter(btn => 
      btn.style.backgroundColor && btn.style.backgroundColor !== ''
    )
    
    // Should have 3 custom colors
    expect(colorButtons.length).toBe(3)
  })

  it('calls onChange when preset color is selected', () => {
    const onChange = vi.fn()
    render(<ColorPicker {...defaultProps} onChange={onChange} />)
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    const colorButtons = screen.getAllByRole('button').filter(btn => 
      btn.style.backgroundColor === 'rgb(239, 68, 68)'
    )
    
    fireEvent.click(colorButtons[0])
    
    expect(onChange).toHaveBeenCalledWith('#ef4444')
  })

  it('highlights currently selected color', () => {
    render(<ColorPicker {...defaultProps} value="#ef4444" />)
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    const selectedButton = screen.getAllByRole('button').find(btn => 
      btn.style.backgroundColor === 'rgb(239, 68, 68)'
    )
    
    expect(selectedButton).toHaveClass('border-theme-accent-primary')
  })

  it('shows custom color input when allowCustom is true', () => {
    render(<ColorPicker {...defaultProps} />)
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    expect(screen.getByText('Custom Color')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('#000000')).toBeInTheDocument()
  })

  it('does not show custom color input when allowCustom is false', () => {
    render(<ColorPicker {...defaultProps} allowCustom={false} />)
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    expect(screen.queryByText('Custom Color')).not.toBeInTheDocument()
  })

  it('updates color with color input', () => {
    const onChange = vi.fn()
    render(<ColorPicker {...defaultProps} onChange={onChange} />)
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    // Get the color input specifically (type="color")
    const colorInput = screen.getAllByDisplayValue('#3b82f6')[0]
    fireEvent.change(colorInput, { target: { value: '#ff0000' } })
    
    expect(onChange).toHaveBeenCalledWith('#ff0000')
  })

  it('validates hex color format in text input', () => {
    const onChange = vi.fn()
    render(<ColorPicker {...defaultProps} onChange={onChange} />)
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    const textInput = screen.getByPlaceholderText('#000000')
    
    // Invalid format - should not call onChange
    fireEvent.change(textInput, { target: { value: 'invalid' } })
    expect(onChange).not.toHaveBeenCalled()
    
    // Valid format - should call onChange
    fireEvent.change(textInput, { target: { value: '#ff0000' } })
    expect(onChange).toHaveBeenCalledWith('#ff0000')
  })

  it('disables button when disabled prop is true', () => {
    render(<ColorPicker {...defaultProps} disabled={true} />)
    
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button).toHaveClass('opacity-50', 'cursor-not-allowed')
  })

  it('does not open picker when disabled', () => {
    render(<ColorPicker {...defaultProps} disabled={true} />)
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    expect(screen.queryByText('Preset Colors')).not.toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <ColorPicker {...defaultProps} className="custom-class" />
    )
    
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('closes picker after selecting preset color', () => {
    render(<ColorPicker {...defaultProps} />)
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    const colorButtons = screen.getAllByRole('button').filter(btn => 
      btn.style.backgroundColor === 'rgb(239, 68, 68)'
    )
    
    fireEvent.click(colorButtons[0])
    
    expect(screen.queryByText('Preset Colors')).not.toBeInTheDocument()
  })

  it('renders with correct button styling', () => {
    render(<ColorPicker {...defaultProps} />)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass(
      'flex', 'items-center', 'space-x-2', 
      'px-3', 'py-2', 'bg-theme-bg-secondary'
    )
  })

  it('renders label with correct styling', () => {
    render(<ColorPicker {...defaultProps} label="Color Setting" />)
    
    const label = screen.getByText('Color Setting')
    expect(label).toHaveClass('block', 'text-sm', 'font-medium', 'text-theme-text-secondary')
  })

  it('maintains uppercase hex format', () => {
    render(<ColorPicker {...defaultProps} value="#abcdef" />)
    
    expect(screen.getByText('#ABCDEF')).toBeInTheDocument()
  })
})