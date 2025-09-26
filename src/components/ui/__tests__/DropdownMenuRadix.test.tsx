import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuRadioGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '../DropdownMenuRadix'

// Mock Icons
vi.mock('../../Icons', () => ({
  Icons: {
    Settings: ({ className }: { className?: string }) => (
      <div data-testid="settings-icon" className={className}>
        ⚙️
      </div>
    ),
    User: ({ className }: { className?: string }) => (
      <div data-testid="user-icon" className={className}>
        👤
      </div>
    ),
    LogOut: ({ className }: { className?: string }) => (
      <div data-testid="logout-icon" className={className}>
        🚪
      </div>
    ),
    Plus: ({ className }: { className?: string }) => (
      <div data-testid="plus-icon" className={className}>
        +
      </div>
    ),
  },
}))

describe('DropdownMenu', () => {
  it('renders trigger and opens content when clicked', async () => {
    const user = userEvent.setup()

    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
          <DropdownMenuItem>Item 2</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )

    const trigger = screen.getByText('Open Menu')
    expect(trigger).toBeInTheDocument()

    await user.click(trigger)

    expect(screen.getByText('Item 1')).toBeInTheDocument()
    expect(screen.getByText('Item 2')).toBeInTheDocument()
  })

  it('closes menu when item is clicked', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()

    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onSelect={onSelect}>Item 1</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )

    const trigger = screen.getByText('Open Menu')
    await user.click(trigger)

    const item = screen.getByText('Item 1')
    await user.click(item)

    expect(onSelect).toHaveBeenCalled()
    expect(screen.queryByText('Item 1')).not.toBeInTheDocument()
  })

  it('supports keyboard navigation', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()

    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onSelect={onSelect}>Item 1</DropdownMenuItem>
          <DropdownMenuItem>Item 2</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )

    const trigger = screen.getByText('Open Menu')
    await user.tab()
    expect(trigger).toHaveFocus()

    // Open with Enter
    await user.keyboard('{Enter}')
    expect(screen.getByText('Item 1')).toBeInTheDocument()

    // Navigate with Arrow Down
    await user.keyboard('{ArrowDown}')

    // Select with Enter
    await user.keyboard('{Enter}')
    expect(onSelect).toHaveBeenCalled()
  })

  it('closes menu when Escape is pressed', async () => {
    const user = userEvent.setup()

    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )

    const trigger = screen.getByText('Open Menu')
    await user.click(trigger)

    expect(screen.getByText('Item 1')).toBeInTheDocument()

    await user.keyboard('{Escape}')
    expect(screen.queryByText('Item 1')).not.toBeInTheDocument()
  })

  it('renders items with icons', async () => {
    const user = userEvent.setup()

    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem icon={<div data-testid="settings-icon">⚙️</div>}>
            Settings
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )

    const trigger = screen.getByText('Open Menu')
    await user.click(trigger)

    expect(screen.getByTestId('settings-icon')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('handles disabled items', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()

    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem disabled onSelect={onSelect}>
            Disabled Item
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )

    const trigger = screen.getByText('Open Menu')
    await user.click(trigger)

    const disabledItem = screen.getByText('Disabled Item')
    expect(disabledItem).toHaveAttribute('aria-disabled', 'true')

    await user.click(disabledItem)
    expect(onSelect).not.toHaveBeenCalled()
  })
})

describe('DropdownMenuCheckboxItem', () => {
  it('renders checkbox item with correct state', async () => {
    const user = userEvent.setup()
    const onCheckedChange = vi.fn()

    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuCheckboxItem
            checked={false}
            onCheckedChange={onCheckedChange}
          >
            Checkbox Item
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )

    const trigger = screen.getByText('Open Menu')
    await user.click(trigger)

    const checkboxItem = screen.getByText('Checkbox Item')
    expect(checkboxItem).toHaveAttribute('aria-checked', 'false')

    await user.click(checkboxItem)
    expect(onCheckedChange).toHaveBeenCalledWith(true)
  })

  it('shows check indicator when checked', async () => {
    const user = userEvent.setup()

    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuCheckboxItem checked={true}>
            Checked Item
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )

    const trigger = screen.getByText('Open Menu')
    await user.click(trigger)

    const checkboxItem = screen.getByText('Checked Item')
    expect(checkboxItem).toHaveAttribute('aria-checked', 'true')
  })
})

describe('DropdownMenuRadioGroup', () => {
  it('renders radio group with correct selection', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()

    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuRadioGroup value="option1" onValueChange={onValueChange}>
            <DropdownMenuRadioItem value="option1">
              Option 1
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="option2">
              Option 2
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    )

    const trigger = screen.getByText('Open Menu')
    await user.click(trigger)

    const option1 = screen.getByText('Option 1')
    const option2 = screen.getByText('Option 2')

    expect(option1).toHaveAttribute('aria-checked', 'true')
    expect(option2).toHaveAttribute('aria-checked', 'false')

    await user.click(option2)
    expect(onValueChange).toHaveBeenCalledWith('option2')
  })
})

describe('DropdownMenuSub', () => {
  it('renders submenu on hover', async () => {
    const user = userEvent.setup()

    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>More Options</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>Sub Item 1</DropdownMenuItem>
              <DropdownMenuItem>Sub Item 2</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
    )

    const trigger = screen.getByText('Open Menu')
    await user.click(trigger)

    const subTrigger = screen.getByText('More Options')
    await user.hover(subTrigger)

    expect(screen.getByText('Sub Item 1')).toBeInTheDocument()
    expect(screen.getByText('Sub Item 2')).toBeInTheDocument()
  })

  it('navigates to submenu with arrow keys', async () => {
    const user = userEvent.setup()

    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>More Options</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>Sub Item 1</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
    )

    const trigger = screen.getByText('Open Menu')
    await user.click(trigger)

    const subTrigger = screen.getByText('More Options')
    subTrigger.focus()

    await user.keyboard('{ArrowRight}')
    expect(screen.getByText('Sub Item 1')).toBeInTheDocument()
  })
})

describe('DropdownMenu Layout Elements', () => {
  it('renders labels and separators', async () => {
    const user = userEvent.setup()

    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Profile</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )

    const trigger = screen.getByText('Open Menu')
    await user.click(trigger)

    expect(screen.getByText('My Account')).toBeInTheDocument()
    expect(screen.getByText('Profile')).toBeInTheDocument()
  })

  it('renders shortcuts', async () => {
    const user = userEvent.setup()

    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>
            Profile
            <DropdownMenuShortcut>⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )

    const trigger = screen.getByText('Open Menu')
    await user.click(trigger)

    expect(screen.getByText('Profile')).toBeInTheDocument()
    expect(screen.getByText('⌘P')).toBeInTheDocument()
  })

  it('renders grouped items', async () => {
    const user = userEvent.setup()

    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuGroup>
            <DropdownMenuItem>Item 1</DropdownMenuItem>
            <DropdownMenuItem>Item 2</DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    )

    const trigger = screen.getByText('Open Menu')
    await user.click(trigger)

    expect(screen.getByText('Item 1')).toBeInTheDocument()
    expect(screen.getByText('Item 2')).toBeInTheDocument()
  })
})

describe('DropdownMenu Accessibility', () => {
  it('has proper ARIA attributes', () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )

    const trigger = screen.getByText('Open Menu')
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('updates ARIA attributes when opened', async () => {
    const user = userEvent.setup()

    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )

    const trigger = screen.getByText('Open Menu')
    await user.click(trigger)

    expect(trigger).toHaveAttribute('aria-expanded', 'true')
  })

  it('supports focus management', async () => {
    const user = userEvent.setup()

    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
          <DropdownMenuItem>Item 2</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )

    const trigger = screen.getByText('Open Menu')
    await user.tab()
    expect(trigger).toHaveFocus()

    await user.keyboard('{Enter}')

    const firstItem = screen.getByText('Item 1')
    expect(firstItem).toHaveFocus()
  })

  it('supports roving tabindex', async () => {
    const user = userEvent.setup()

    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
          <DropdownMenuItem>Item 2</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )

    const trigger = screen.getByText('Open Menu')
    await user.click(trigger)

    await user.keyboard('{ArrowDown}')
    expect(screen.getByText('Item 2')).toHaveFocus()

    await user.keyboard('{ArrowUp}')
    expect(screen.getByText('Item 1')).toHaveFocus()
  })
})
