import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import SettingItem from '../SettingItem'

describe('SettingItem', () => {
  it('renders label correctly', () => {
    render(
      <SettingItem label="Test Setting">
        <input type="checkbox" />
      </SettingItem>
    )
    
    expect(screen.getByText('Test Setting')).toBeInTheDocument()
  })

  it('renders children correctly', () => {
    render(
      <SettingItem label="Test Setting">
        <button data-testid="test-button">Test Button</button>
      </SettingItem>
    )
    
    expect(screen.getByTestId('test-button')).toBeInTheDocument()
    expect(screen.getByText('Test Button')).toBeInTheDocument()
  })

  it('renders description when provided', () => {
    render(
      <SettingItem 
        label="Test Setting" 
        description="This is a test description"
      >
        <input type="checkbox" />
      </SettingItem>
    )
    
    expect(screen.getByText('This is a test description')).toBeInTheDocument()
  })

  it('does not render description when not provided', () => {
    render(
      <SettingItem label="Test Setting">
        <input type="checkbox" />
      </SettingItem>
    )
    
    expect(screen.queryByText('This is a test description')).not.toBeInTheDocument()
  })

  it('applies correct CSS classes', () => {
    const { container } = render(
      <SettingItem label="Test Setting">
        <input type="checkbox" />
      </SettingItem>
    )
    
    const settingItem = container.querySelector('.setting-item')
    expect(settingItem).toHaveClass('py-3', 'border-b', 'border-theme-border-primary', 'last:border-b-0')
  })

  it('renders label with correct styling', () => {
    render(
      <SettingItem label="Test Setting">
        <input type="checkbox" />
      </SettingItem>
    )
    
    const label = screen.getByText('Test Setting')
    expect(label).toHaveClass('text-sm', 'font-medium', 'text-theme-text-secondary')
  })

  it('renders description with correct styling', () => {
    render(
      <SettingItem 
        label="Test Setting" 
        description="Test description"
      >
        <input type="checkbox" />
      </SettingItem>
    )
    
    const description = screen.getByText('Test description')
    expect(description).toHaveClass('text-xs', 'text-theme-text-tertiary', 'mt-1')
  })

  it('applies correct layout classes', () => {
    const { container } = render(
      <SettingItem label="Test Setting">
        <input type="checkbox" />
      </SettingItem>
    )
    
    const flexContainer = container.querySelector('.flex.items-center.justify-between')
    expect(flexContainer).toBeInTheDocument()
    
    const labelContainer = container.querySelector('.flex-1')
    expect(labelContainer).toBeInTheDocument()
    
    const childrenContainer = container.querySelector('.ml-4')
    expect(childrenContainer).toBeInTheDocument()
  })

  it('renders multiple children correctly', () => {
    render(
      <SettingItem label="Test Setting">
        <button>Button 1</button>
        <button>Button 2</button>
      </SettingItem>
    )
    
    expect(screen.getByText('Button 1')).toBeInTheDocument()
    expect(screen.getByText('Button 2')).toBeInTheDocument()
  })

  it('renders with complex children', () => {
    render(
      <SettingItem label="Test Setting">
        <div className="custom-control">
          <select>
            <option>Option 1</option>
            <option>Option 2</option>
          </select>
        </div>
      </SettingItem>
    )
    
    const select = screen.getByRole('combobox')
    expect(select).toBeInTheDocument()
    expect(screen.getByText('Option 1')).toBeInTheDocument()
    expect(screen.getByText('Option 2')).toBeInTheDocument()
  })
})