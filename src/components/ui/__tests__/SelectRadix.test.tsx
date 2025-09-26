import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SimpleSelect,
  AdvancedSelect,
} from '../SelectRadix'

// Mock Icons
vi.mock('../../Icons', () => ({
  Icons: {
    ChevronDown: ({ className }: { className?: string }) => (
      <div data-testid="chevron-down" className={className}>
        ▼
      </div>
    ),
    ChevronUp: ({ className }: { className?: string }) => (
      <div data-testid="chevron-up" className={className}>
        ▲
      </div>
    ),
    Check: ({ className }: { className?: string }) => (
      <div data-testid="check-icon" className={className}>
        ✓
      </div>
    ),
    User: ({ className }: { className?: string }) => (
      <div data-testid="user-icon" className={className}>
        👤
      </div>
    ),
  },
}))

describe('Select Components', () => {
  it('renders basic select with trigger and content', () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
          <SelectItem value="option2">Option 2</SelectItem>
        </SelectContent>
      </Select>
    )

    expect(screen.getByRole('combobox')).toBeInTheDocument()
    expect(screen.getByText('Select an option')).toBeInTheDocument()
  })

  it('opens dropdown when trigger is clicked', async () => {
    const user = userEvent.setup()

    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
          <SelectItem value="option2">Option 2</SelectItem>
        </SelectContent>
      </Select>
    )

    const trigger = screen.getByRole('combobox')
    await user.click(trigger)

    expect(screen.getByText('Option 1')).toBeInTheDocument()
    expect(screen.getByText('Option 2')).toBeInTheDocument()
  })

  it('selects item when clicked', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()

    render(
      <Select onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
          <SelectItem value="option2">Option 2</SelectItem>
        </SelectContent>
      </Select>
    )

    const trigger = screen.getByRole('combobox')
    await user.click(trigger)

    const option1 = screen.getByText('Option 1')
    await user.click(option1)

    expect(onValueChange).toHaveBeenCalledWith('option1')
  })

  it('supports keyboard navigation', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()

    render(
      <Select onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
          <SelectItem value="option2">Option 2</SelectItem>
        </SelectContent>
      </Select>
    )

    const trigger = screen.getByRole('combobox')

    // Focus and open with Enter
    await user.tab()
    expect(trigger).toHaveFocus()

    await user.keyboard('{Enter}')
    expect(screen.getByText('Option 1')).toBeInTheDocument()

    // Navigate with arrow keys
    await user.keyboard('{ArrowDown}')
    await user.keyboard('{Enter}')

    expect(onValueChange).toHaveBeenCalledWith('option2')
  })

  it('closes dropdown when Escape is pressed', async () => {
    const user = userEvent.setup()

    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
        </SelectContent>
      </Select>
    )

    const trigger = screen.getByRole('combobox')
    await user.click(trigger)

    expect(screen.getByText('Option 1')).toBeInTheDocument()

    await user.keyboard('{Escape}')
    expect(screen.queryByText('Option 1')).not.toBeInTheDocument()
  })

  it('shows selected value in trigger', () => {
    render(
      <Select value="option1">
        <SelectTrigger>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
          <SelectItem value="option2">Option 2</SelectItem>
        </SelectContent>
      </Select>
    )

    expect(screen.getByText('Option 1')).toBeInTheDocument()
  })

  it('handles disabled state', () => {
    render(
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
        </SelectContent>
      </Select>
    )

    const trigger = screen.getByRole('combobox')
    expect(trigger).toBeDisabled()
  })
})

describe('SimpleSelect', () => {
  const options = [
    { value: 'apple', label: 'Apple' },
    { value: 'banana', label: 'Banana' },
    { value: 'cherry', label: 'Cherry' },
  ]

  it('renders with options', () => {
    render(
      <SimpleSelect
        options={options}
        placeholder="Choose a fruit"
        onValueChange={vi.fn()}
      />
    )

    expect(screen.getByText('Choose a fruit')).toBeInTheDocument()
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('calls onValueChange when option is selected', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()

    render(<SimpleSelect options={options} onValueChange={onValueChange} />)

    const trigger = screen.getByRole('combobox')
    await user.click(trigger)

    const appleOption = screen.getByText('Apple')
    await user.click(appleOption)

    expect(onValueChange).toHaveBeenCalledWith('apple')
  })

  it('shows selected value', () => {
    render(
      <SimpleSelect options={options} value="banana" onValueChange={vi.fn()} />
    )

    expect(screen.getByText('Banana')).toBeInTheDocument()
  })

  it('handles disabled options', async () => {
    const user = userEvent.setup()
    const optionsWithDisabled = [
      ...options,
      { value: 'disabled', label: 'Disabled Option', disabled: true },
    ]

    render(
      <SimpleSelect options={optionsWithDisabled} onValueChange={vi.fn()} />
    )

    const trigger = screen.getByRole('combobox')
    await user.click(trigger)

    const disabledOption = screen.getByText('Disabled Option')
    expect(disabledOption).toHaveAttribute('aria-disabled', 'true')
  })
})

describe('AdvancedSelect', () => {
  const advancedOptions = [
    { value: 'user', label: 'User Profile', icon: '👤' },
    { value: 'settings', label: 'Settings', icon: '⚙️' },
    'Simple Option',
  ]

  it('renders with mixed option types', () => {
    render(
      <AdvancedSelect
        options={advancedOptions}
        placeholder="Select an action"
        onValueChange={vi.fn()}
      />
    )

    expect(screen.getByText('Select an action')).toBeInTheDocument()
  })

  it('handles different option formats', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()

    render(
      <AdvancedSelect options={advancedOptions} onValueChange={onValueChange} />
    )

    const trigger = screen.getByRole('combobox')
    await user.click(trigger)

    // Object option
    const userOption = screen.getByText('User Profile')
    await user.click(userOption)
    expect(onValueChange).toHaveBeenCalledWith('user')

    // String option
    await user.click(trigger)
    const simpleOption = screen.getByText('Simple Option')
    await user.click(simpleOption)
    expect(onValueChange).toHaveBeenCalledWith('Simple Option')
  })

  it('applies correct size classes', () => {
    const { rerender } = render(
      <AdvancedSelect
        options={advancedOptions}
        size="sm"
        onValueChange={vi.fn()}
      />
    )

    let trigger = screen.getByRole('combobox')
    expect(trigger).toHaveClass('h-10', 'px-3', 'text-sm')

    rerender(
      <AdvancedSelect
        options={advancedOptions}
        size="lg"
        onValueChange={vi.fn()}
      />
    )

    trigger = screen.getByRole('combobox')
    expect(trigger).toHaveClass('h-14', 'px-6', 'text-lg')
  })

  it('handles numeric values', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    const numericOptions = [
      { value: 1, label: 'One' },
      { value: 2, label: 'Two' },
    ]

    render(
      <AdvancedSelect options={numericOptions} onValueChange={onValueChange} />
    )

    const trigger = screen.getByRole('combobox')
    await user.click(trigger)

    const oneOption = screen.getByText('One')
    await user.click(oneOption)

    expect(onValueChange).toHaveBeenCalledWith('1')
  })
})

describe('Select Accessibility', () => {
  it('has proper ARIA attributes', () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
        </SelectContent>
      </Select>
    )

    const trigger = screen.getByRole('combobox')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(trigger).toHaveAttribute('aria-haspopup', 'listbox')
  })

  it('updates ARIA attributes when opened', async () => {
    const user = userEvent.setup()

    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
        </SelectContent>
      </Select>
    )

    const trigger = screen.getByRole('combobox')
    await user.click(trigger)

    expect(trigger).toHaveAttribute('aria-expanded', 'true')
  })

  it('supports screen reader navigation', async () => {
    const user = userEvent.setup()

    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
          <SelectItem value="option2">Option 2</SelectItem>
        </SelectContent>
      </Select>
    )

    const trigger = screen.getByRole('combobox')
    await user.tab()
    expect(trigger).toHaveFocus()

    await user.keyboard('{Enter}')
    const listbox = screen.getByRole('listbox')
    expect(listbox).toBeInTheDocument()

    const options = screen.getAllByRole('option')
    expect(options).toHaveLength(2)
  })
})
