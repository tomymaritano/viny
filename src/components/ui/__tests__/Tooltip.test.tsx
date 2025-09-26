import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '../Tooltip'

describe('Tooltip', () => {
  it('renders trigger and shows content on hover', async () => {
    const user = userEvent.setup()

    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent>
            <p>Tooltip content</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )

    const trigger = screen.getByText('Hover me')
    expect(trigger).toBeInTheDocument()

    await user.hover(trigger)

    await waitFor(() => {
      expect(screen.getByText('Tooltip content')).toBeInTheDocument()
    })
  })

  it('hides content when mouse leaves trigger', async () => {
    const user = userEvent.setup()

    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent>
            <p>Tooltip content</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )

    const trigger = screen.getByText('Hover me')

    await user.hover(trigger)
    await waitFor(() => {
      expect(screen.getByText('Tooltip content')).toBeInTheDocument()
    })

    await user.unhover(trigger)
    await waitFor(() => {
      expect(screen.queryByText('Tooltip content')).not.toBeInTheDocument()
    })
  })

  it('shows content on focus', async () => {
    const user = userEvent.setup()

    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Focus me</TooltipTrigger>
          <TooltipContent>
            <p>Tooltip content</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )

    const trigger = screen.getByText('Focus me')
    await user.tab()

    expect(trigger).toHaveFocus()

    await waitFor(() => {
      expect(screen.getByText('Tooltip content')).toBeInTheDocument()
    })
  })

  it('hides content on blur', async () => {
    const user = userEvent.setup()

    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Focus me</TooltipTrigger>
          <TooltipContent>
            <p>Tooltip content</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )

    const trigger = screen.getByText('Focus me')
    await user.tab()

    await waitFor(() => {
      expect(screen.getByText('Tooltip content')).toBeInTheDocument()
    })

    await user.tab()

    await waitFor(() => {
      expect(screen.queryByText('Tooltip content')).not.toBeInTheDocument()
    })
  })

  it('supports custom sideOffset', async () => {
    const user = userEvent.setup()

    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent sideOffset={10}>
            <p>Tooltip content</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )

    const trigger = screen.getByText('Hover me')
    await user.hover(trigger)

    await waitFor(() => {
      const tooltip = screen.getByText('Tooltip content')
      expect(tooltip).toBeInTheDocument()
    })
  })

  it('closes on Escape key', async () => {
    const user = userEvent.setup()

    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Focus me</TooltipTrigger>
          <TooltipContent>
            <p>Tooltip content</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )

    const trigger = screen.getByText('Focus me')
    await user.tab()

    await waitFor(() => {
      expect(screen.getByText('Tooltip content')).toBeInTheDocument()
    })

    await user.keyboard('{Escape}')

    await waitFor(() => {
      expect(screen.queryByText('Tooltip content')).not.toBeInTheDocument()
    })
  })

  it('works with Button as trigger', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()

    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button onClick={onClick}>Button with tooltip</button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Button tooltip</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )

    const button = screen.getByText('Button with tooltip')

    // Tooltip should show on hover
    await user.hover(button)
    await waitFor(() => {
      expect(screen.getByText('Button tooltip')).toBeInTheDocument()
    })

    // Button should still be clickable
    await user.click(button)
    expect(onClick).toHaveBeenCalled()
  })

  it('supports controlled state', async () => {
    const user = userEvent.setup()
    let isOpen = false
    const setIsOpen = vi.fn((open: boolean) => {
      isOpen = open
    })

    const { rerender } = render(
      <TooltipProvider>
        <Tooltip open={isOpen} onOpenChange={setIsOpen}>
          <TooltipTrigger>Controlled tooltip</TooltipTrigger>
          <TooltipContent>
            <p>Controlled content</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )

    expect(screen.queryByText('Controlled content')).not.toBeInTheDocument()

    const trigger = screen.getByText('Controlled tooltip')
    await user.hover(trigger)

    expect(setIsOpen).toHaveBeenCalledWith(true)

    // Simulate state change
    isOpen = true
    rerender(
      <TooltipProvider>
        <Tooltip open={isOpen} onOpenChange={setIsOpen}>
          <TooltipTrigger>Controlled tooltip</TooltipTrigger>
          <TooltipContent>
            <p>Controlled content</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )

    expect(screen.getByText('Controlled content')).toBeInTheDocument()
  })

  it('supports different positioning', async () => {
    const user = userEvent.setup()

    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent side="right">
            <p>Right-positioned tooltip</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )

    const trigger = screen.getByText('Hover me')
    await user.hover(trigger)

    await waitFor(() => {
      const tooltip = screen.getByText('Right-positioned tooltip')
      expect(tooltip).toBeInTheDocument()
    })
  })

  it('has proper accessibility attributes', async () => {
    const user = userEvent.setup()

    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Accessible trigger</TooltipTrigger>
          <TooltipContent>
            <p>Accessible tooltip</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )

    const trigger = screen.getByText('Accessible trigger')
    expect(trigger).toHaveAttribute('aria-describedby')

    await user.hover(trigger)

    await waitFor(() => {
      const tooltip = screen.getByText('Accessible tooltip')
      expect(tooltip).toBeInTheDocument()
      expect(tooltip).toHaveAttribute('role', 'tooltip')
    })
  })

  it('applies custom className', async () => {
    const user = userEvent.setup()

    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent className="custom-tooltip">
            <p>Custom styled tooltip</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )

    const trigger = screen.getByText('Hover me')
    await user.hover(trigger)

    await waitFor(() => {
      const tooltip = screen.getByText('Custom styled tooltip')
      expect(tooltip.parentElement).toHaveClass('custom-tooltip')
    })
  })

  it('handles multiple tooltips', async () => {
    const user = userEvent.setup()

    render(
      <TooltipProvider>
        <div>
          <Tooltip>
            <TooltipTrigger>First trigger</TooltipTrigger>
            <TooltipContent>
              <p>First tooltip</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger>Second trigger</TooltipTrigger>
            <TooltipContent>
              <p>Second tooltip</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    )

    const firstTrigger = screen.getByText('First trigger')
    const secondTrigger = screen.getByText('Second trigger')

    await user.hover(firstTrigger)
    await waitFor(() => {
      expect(screen.getByText('First tooltip')).toBeInTheDocument()
    })

    await user.hover(secondTrigger)
    await waitFor(() => {
      expect(screen.getByText('Second tooltip')).toBeInTheDocument()
    })
  })
})
