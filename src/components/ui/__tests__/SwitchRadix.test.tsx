import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Switch, SwitchWithLabel, SettingsSwitch } from '../SwitchRadix'

describe('Switch', () => {
  it('renders with correct default state', () => {
    render(<Switch />)

    const switchElement = screen.getByRole('switch')
    expect(switchElement).toBeInTheDocument()
    expect(switchElement).toHaveAttribute('aria-checked', 'false')
  })

  it('renders as checked when checked prop is true', () => {
    render(<Switch checked={true} />)

    const switchElement = screen.getByRole('switch')
    expect(switchElement).toHaveAttribute('aria-checked', 'true')
  })

  it('calls onCheckedChange when clicked', async () => {
    const onCheckedChange = vi.fn()

    render(<Switch checked={false} onCheckedChange={onCheckedChange} />)

    const switchElement = screen.getByRole('switch')
    fireEvent.click(switchElement)

    expect(onCheckedChange).toHaveBeenCalledWith(true)
  })

  it('can be toggled with keyboard', () => {
    const onCheckedChange = vi.fn()

    render(<Switch checked={false} onCheckedChange={onCheckedChange} />)

    const switchElement = screen.getByRole('switch')
    switchElement.focus()

    // Space key should toggle
    fireEvent.keyDown(switchElement, { key: ' ' })
    expect(onCheckedChange).toHaveBeenCalledWith(true)
  })

  it('does not call onCheckedChange when disabled', () => {
    const onCheckedChange = vi.fn()

    render(
      <Switch checked={false} onCheckedChange={onCheckedChange} disabled />
    )

    const switchElement = screen.getByRole('switch')
    fireEvent.click(switchElement)

    expect(onCheckedChange).not.toHaveBeenCalled()
    expect(switchElement).toBeDisabled()
  })

  it('applies correct size classes', () => {
    const { rerender } = render(<Switch size="sm" />)
    let switchElement = screen.getByRole('switch')
    expect(switchElement).toHaveClass('h-4', 'w-7')

    rerender(<Switch size="md" />)
    switchElement = screen.getByRole('switch')
    expect(switchElement).toHaveClass('h-6', 'w-11')

    rerender(<Switch size="lg" />)
    switchElement = screen.getByRole('switch')
    expect(switchElement).toHaveClass('h-8', 'w-14')
  })

  it('has proper accessibility attributes', () => {
    render(<Switch checked={true} />)

    const switchElement = screen.getByRole('switch')
    expect(switchElement).toHaveAttribute('type', 'button')
    expect(switchElement).toHaveAttribute('aria-checked', 'true')
    expect(switchElement).toHaveAttribute('data-state', 'checked')
  })
})

describe('SwitchWithLabel', () => {
  it('renders with label', () => {
    render(
      <SwitchWithLabel
        label="Enable notifications"
        checked={false}
        onCheckedChange={vi.fn()}
      />
    )

    expect(screen.getByText('Enable notifications')).toBeInTheDocument()
    expect(screen.getByRole('switch')).toBeInTheDocument()
  })

  it('renders with label and description', () => {
    render(
      <SwitchWithLabel
        label="Dark mode"
        description="Switch to dark theme"
        checked={false}
        onCheckedChange={vi.fn()}
      />
    )

    expect(screen.getByText('Dark mode')).toBeInTheDocument()
    expect(screen.getByText('Switch to dark theme')).toBeInTheDocument()
  })

  it('associates label with switch using htmlFor', () => {
    render(
      <SwitchWithLabel
        label="Enable feature"
        checked={false}
        onCheckedChange={vi.fn()}
      />
    )

    const label = screen.getByText('Enable feature')
    const switchElement = screen.getByRole('switch')

    expect(label.getAttribute('for')).toBe(switchElement.id)
  })

  it('toggles when label is clicked', () => {
    const onCheckedChange = vi.fn()

    render(
      <SwitchWithLabel
        label="Enable feature"
        checked={false}
        onCheckedChange={onCheckedChange}
      />
    )

    const label = screen.getByText('Enable feature')
    fireEvent.click(label)

    expect(onCheckedChange).toHaveBeenCalledWith(true)
  })

  it('renders with left label position', () => {
    render(
      <SwitchWithLabel
        label="Enable feature"
        labelPosition="left"
        checked={false}
        onCheckedChange={vi.fn()}
      />
    )

    const container =
      screen.getByText('Enable feature').parentElement?.parentElement
    expect(container).toHaveClass('flex-row-reverse')
  })
})

describe('SettingsSwitch', () => {
  it('renders with title and description', () => {
    render(
      <SettingsSwitch
        title="Push Notifications"
        description="Receive notifications about updates"
        checked={false}
        onCheckedChange={vi.fn()}
      />
    )

    expect(screen.getByText('Push Notifications')).toBeInTheDocument()
    expect(
      screen.getByText('Receive notifications about updates')
    ).toBeInTheDocument()
    expect(screen.getByRole('switch')).toBeInTheDocument()
  })

  it('renders without description', () => {
    render(
      <SettingsSwitch
        title="Auto-sync"
        checked={false}
        onCheckedChange={vi.fn()}
      />
    )

    expect(screen.getByText('Auto-sync')).toBeInTheDocument()
    expect(screen.getByRole('switch')).toBeInTheDocument()
  })

  it('has proper layout structure', () => {
    render(
      <SettingsSwitch
        title="Privacy Mode"
        description="Hide sensitive information"
        checked={false}
        onCheckedChange={vi.fn()}
      />
    )

    const container =
      screen.getByText('Privacy Mode').parentElement?.parentElement
    expect(container).toHaveClass('flex', 'items-center', 'justify-between')
  })
})

describe('Switch Accessibility', () => {
  it('supports keyboard navigation', () => {
    const onCheckedChange = vi.fn()

    render(<Switch checked={false} onCheckedChange={onCheckedChange} />)

    const switchElement = screen.getByRole('switch')

    // Focus the switch
    switchElement.focus()
    expect(switchElement).toHaveFocus()

    // Space to toggle
    fireEvent.keyDown(switchElement, { key: ' ' })
    expect(onCheckedChange).toHaveBeenCalledWith(true)
  })

  it('has proper ARIA attributes', () => {
    render(<Switch checked={true} disabled />)

    const switchElement = screen.getByRole('switch')
    expect(switchElement).toHaveAttribute('aria-checked', 'true')
    expect(switchElement).toHaveAttribute('disabled')
    expect(switchElement).toHaveAttribute('data-state', 'checked')
    expect(switchElement).toHaveAttribute('data-disabled')
  })

  it('supports screen reader announcements', () => {
    const { rerender } = render(<Switch checked={false} />)

    let switchElement = screen.getByRole('switch')
    expect(switchElement).toHaveAttribute('aria-checked', 'false')

    rerender(<Switch checked={true} />)
    switchElement = screen.getByRole('switch')
    expect(switchElement).toHaveAttribute('aria-checked', 'true')
  })
})
