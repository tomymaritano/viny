import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import SettingRow from '../SettingRow'

describe('SettingRow', () => {
  it('renders title correctly', () => {
    render(
      <SettingRow title="Test Setting">
        <button>Test Button</button>
      </SettingRow>
    )

    expect(screen.getByText('Test Setting')).toBeInTheDocument()
  })

  it('renders children correctly', () => {
    render(
      <SettingRow title="Test Setting">
        <button data-testid="test-button">Test Button</button>
      </SettingRow>
    )

    expect(screen.getByTestId('test-button')).toBeInTheDocument()
    expect(screen.getByText('Test Button')).toBeInTheDocument()
  })

  it('renders description when provided', () => {
    render(
      <SettingRow title="Test Setting" description="This is a test description">
        <button>Test Button</button>
      </SettingRow>
    )

    expect(screen.getByText('This is a test description')).toBeInTheDocument()
  })

  it('does not render description when not provided', () => {
    render(
      <SettingRow title="Test Setting">
        <button>Test Button</button>
      </SettingRow>
    )

    expect(
      screen.queryByText('This is a test description')
    ).not.toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <SettingRow title="Test Setting" className="custom-class">
        <button>Test Button</button>
      </SettingRow>
    )

    const settingRow = container.firstChild
    expect(settingRow).toHaveClass('custom-class')
  })

  it('applies correct layout classes', () => {
    const { container } = render(
      <SettingRow title="Test Setting">
        <button>Test Button</button>
      </SettingRow>
    )

    const settingRow = container.firstChild
    expect(settingRow).toHaveClass('flex', 'items-center', 'justify-between')
  })

  it('renders title with correct styling', () => {
    render(
      <SettingRow title="Test Setting">
        <button>Test Button</button>
      </SettingRow>
    )

    const title = screen.getByText('Test Setting')
    expect(title).toHaveClass(
      'text-sm',
      'font-medium',
      'text-theme-text-primary'
    )
    expect(title.tagName).toBe('H4')
  })

  it('renders description with correct styling', () => {
    render(
      <SettingRow title="Test Setting" description="Test description">
        <button>Test Button</button>
      </SettingRow>
    )

    const description = screen.getByText('Test description')
    expect(description).toHaveClass('text-xs', 'text-theme-text-muted', 'mt-1')
    expect(description.tagName).toBe('P')
  })

  it('applies correct flex layout to content areas', () => {
    const { container } = render(
      <SettingRow title="Test Setting">
        <button>Test Button</button>
      </SettingRow>
    )

    const leftColumn = container.querySelector('.flex-1.pr-4')
    expect(leftColumn).toBeInTheDocument()

    const rightColumn = container.querySelector('.flex-shrink-0')
    expect(rightColumn).toBeInTheDocument()
  })

  it('renders multiple children correctly', () => {
    render(
      <SettingRow title="Test Setting">
        <button>Button 1</button>
        <button>Button 2</button>
      </SettingRow>
    )

    expect(screen.getByText('Button 1')).toBeInTheDocument()
    expect(screen.getByText('Button 2')).toBeInTheDocument()
  })

  it('renders with complex children', () => {
    render(
      <SettingRow title="Test Setting">
        <div className="flex gap-2">
          <input type="checkbox" data-testid="checkbox" />
          <select data-testid="select">
            <option>Option 1</option>
            <option>Option 2</option>
          </select>
        </div>
      </SettingRow>
    )

    expect(screen.getByTestId('checkbox')).toBeInTheDocument()
    expect(screen.getByTestId('select')).toBeInTheDocument()
  })

  it('handles long title text gracefully', () => {
    const longTitle =
      'This is a very long title that might wrap to multiple lines in a narrow container'

    render(
      <SettingRow title={longTitle}>
        <button>Test Button</button>
      </SettingRow>
    )

    expect(screen.getByText(longTitle)).toBeInTheDocument()
  })

  it('handles long description text gracefully', () => {
    const longDescription =
      'This is a very long description that provides detailed information about the setting and might wrap to multiple lines'

    render(
      <SettingRow title="Test Setting" description={longDescription}>
        <button>Test Button</button>
      </SettingRow>
    )

    expect(screen.getByText(longDescription)).toBeInTheDocument()
  })

  it('maintains structure with empty children', () => {
    render(
      <SettingRow title="Test Setting">
        <></>
      </SettingRow>
    )

    expect(screen.getByText('Test Setting')).toBeInTheDocument()
  })

  it('renders correctly without className prop', () => {
    const { container } = render(
      <SettingRow title="Test Setting">
        <button>Test Button</button>
      </SettingRow>
    )

    const settingRow = container.firstChild
    expect(settingRow).toHaveClass('flex', 'items-center', 'justify-between')
    // Should not have any extra classes beyond the default ones
  })
})
