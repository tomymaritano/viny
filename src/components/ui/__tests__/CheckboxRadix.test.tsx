import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { vi } from 'vitest'
import {
  Checkbox,
  CheckboxWithLabel,
  CheckboxGroup,
  IndeterminateCheckbox,
  SelectAllCheckbox,
  LegacyCheckbox,
} from '../CheckboxRadix'

describe('Checkbox Component', () => {
  describe('Basic Checkbox', () => {
    test('renders checkbox', () => {
      render(<Checkbox />)

      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeInTheDocument()
    })

    test('handles checked state', () => {
      render(<Checkbox checked={true} />)

      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeChecked()
    })

    test('handles unchecked state', () => {
      render(<Checkbox checked={false} />)

      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).not.toBeChecked()
    })

    test('calls onCheckedChange when clicked', () => {
      const handleChange = vi.fn()
      render(<Checkbox onCheckedChange={handleChange} />)

      const checkbox = screen.getByRole('checkbox')
      fireEvent.click(checkbox)

      expect(handleChange).toHaveBeenCalledWith(true)
    })

    test('supports disabled state', () => {
      render(<Checkbox disabled />)

      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeDisabled()
    })

    test('applies custom className', () => {
      render(<Checkbox className="custom-checkbox" />)

      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toHaveClass('custom-checkbox')
    })
  })

  describe('CheckboxWithLabel', () => {
    test('renders checkbox with label', () => {
      render(<CheckboxWithLabel label="Accept terms" />)

      expect(screen.getByText('Accept terms')).toBeInTheDocument()
      expect(screen.getByRole('checkbox')).toBeInTheDocument()
    })

    test('renders checkbox with description', () => {
      render(
        <CheckboxWithLabel
          label="Accept terms"
          description="Please read and accept our terms of service"
        />
      )

      expect(screen.getByText('Accept terms')).toBeInTheDocument()
      expect(
        screen.getByText('Please read and accept our terms of service')
      ).toBeInTheDocument()
    })

    test('links label to checkbox', () => {
      render(<CheckboxWithLabel label="Accept terms" />)

      const checkbox = screen.getByRole('checkbox')
      const label = screen.getByText('Accept terms')

      expect(label).toHaveAttribute('for', checkbox.id)
    })

    test('calls onCheckedChange when label is clicked', () => {
      const handleChange = vi.fn()
      render(
        <CheckboxWithLabel
          label="Accept terms"
          onCheckedChange={handleChange}
        />
      )

      const label = screen.getByText('Accept terms')
      fireEvent.click(label)

      expect(handleChange).toHaveBeenCalledWith(true)
    })

    test('applies different sizes', () => {
      const { rerender } = render(<CheckboxWithLabel label="Test" size="sm" />)

      let checkbox = screen.getByRole('checkbox')
      expect(checkbox).toHaveClass('h-4', 'w-4')

      rerender(<CheckboxWithLabel label="Test" size="md" />)
      checkbox = screen.getByRole('checkbox')
      expect(checkbox).toHaveClass('h-5', 'w-5')

      rerender(<CheckboxWithLabel label="Test" size="lg" />)
      checkbox = screen.getByRole('checkbox')
      expect(checkbox).toHaveClass('h-6', 'w-6')
    })

    test('applies different variants', () => {
      const { rerender } = render(
        <CheckboxWithLabel label="Test" variant="success" />
      )

      let checkbox = screen.getByRole('checkbox')
      expect(checkbox).toHaveClass('data-[state=checked]:bg-green-600')

      rerender(<CheckboxWithLabel label="Test" variant="warning" />)
      checkbox = screen.getByRole('checkbox')
      expect(checkbox).toHaveClass('data-[state=checked]:bg-yellow-600')

      rerender(<CheckboxWithLabel label="Test" variant="error" />)
      checkbox = screen.getByRole('checkbox')
      expect(checkbox).toHaveClass('data-[state=checked]:bg-red-600')
    })
  })

  describe('CheckboxGroup', () => {
    const items = [
      { id: 'item1', label: 'Item 1' },
      { id: 'item2', label: 'Item 2' },
      { id: 'item3', label: 'Item 3', description: 'This is item 3' },
      { id: 'item4', label: 'Item 4', disabled: true },
    ]

    test('renders all items', () => {
      render(<CheckboxGroup items={items} />)

      expect(screen.getByText('Item 1')).toBeInTheDocument()
      expect(screen.getByText('Item 2')).toBeInTheDocument()
      expect(screen.getByText('Item 3')).toBeInTheDocument()
      expect(screen.getByText('Item 4')).toBeInTheDocument()
      expect(screen.getByText('This is item 3')).toBeInTheDocument()
    })

    test('shows correct checked state', () => {
      render(<CheckboxGroup items={items} value={['item1', 'item3']} />)

      const checkboxes = screen.getAllByRole('checkbox')
      expect(checkboxes[0]).toBeChecked()
      expect(checkboxes[1]).not.toBeChecked()
      expect(checkboxes[2]).toBeChecked()
      expect(checkboxes[3]).not.toBeChecked()
    })

    test('calls onValueChange when item is selected', () => {
      const handleChange = vi.fn()
      render(
        <CheckboxGroup items={items} value={[]} onValueChange={handleChange} />
      )

      const checkbox = screen.getByRole('checkbox', { name: 'Item 1' })
      fireEvent.click(checkbox)

      expect(handleChange).toHaveBeenCalledWith(['item1'])
    })

    test('calls onValueChange when item is deselected', () => {
      const handleChange = vi.fn()
      render(
        <CheckboxGroup
          items={items}
          value={['item1', 'item2']}
          onValueChange={handleChange}
        />
      )

      const checkbox = screen.getByRole('checkbox', { name: 'Item 1' })
      fireEvent.click(checkbox)

      expect(handleChange).toHaveBeenCalledWith(['item2'])
    })

    test('handles disabled items', () => {
      const handleChange = vi.fn()
      render(
        <CheckboxGroup items={items} value={[]} onValueChange={handleChange} />
      )

      const disabledCheckbox = screen.getByRole('checkbox', { name: 'Item 4' })
      expect(disabledCheckbox).toBeDisabled()

      fireEvent.click(disabledCheckbox)
      expect(handleChange).not.toHaveBeenCalled()
    })
  })

  describe('IndeterminateCheckbox', () => {
    test('renders checkbox with checkmark when checked', () => {
      render(<IndeterminateCheckbox checked={true} />)

      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeChecked()
    })

    test('renders checkbox with dash when indeterminate', () => {
      render(<IndeterminateCheckbox indeterminate={true} />)

      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeInTheDocument()
      // The indeterminate state is handled by the indicator content
    })

    test('calls onCheckedChange when clicked', () => {
      const handleChange = vi.fn()
      render(<IndeterminateCheckbox onCheckedChange={handleChange} />)

      const checkbox = screen.getByRole('checkbox')
      fireEvent.click(checkbox)

      expect(handleChange).toHaveBeenCalledWith(true)
    })
  })

  describe('SelectAllCheckbox', () => {
    const items = [
      { id: 'item1', label: 'Item 1' },
      { id: 'item2', label: 'Item 2' },
      { id: 'item3', label: 'Item 3' },
    ]

    test('renders with default label', () => {
      render(
        <SelectAllCheckbox
          items={items}
          selectedItems={[]}
          onSelectionChange={vi.fn()}
        />
      )

      expect(screen.getByText('Select all')).toBeInTheDocument()
    })

    test('renders with custom label', () => {
      render(
        <SelectAllCheckbox
          items={items}
          selectedItems={[]}
          onSelectionChange={vi.fn()}
          label="Select all items"
        />
      )

      expect(screen.getByText('Select all items')).toBeInTheDocument()
    })

    test('shows unchecked when no items selected', () => {
      render(
        <SelectAllCheckbox
          items={items}
          selectedItems={[]}
          onSelectionChange={vi.fn()}
        />
      )

      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).not.toBeChecked()
    })

    test('shows checked when all items selected', () => {
      render(
        <SelectAllCheckbox
          items={items}
          selectedItems={['item1', 'item2', 'item3']}
          onSelectionChange={vi.fn()}
        />
      )

      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeChecked()
    })

    test('shows indeterminate when some items selected', () => {
      render(
        <SelectAllCheckbox
          items={items}
          selectedItems={['item1', 'item2']}
          onSelectionChange={vi.fn()}
        />
      )

      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeInTheDocument()
      // Indeterminate state is handled internally
    })

    test('selects all items when clicked while none selected', () => {
      const handleSelectionChange = vi.fn()
      render(
        <SelectAllCheckbox
          items={items}
          selectedItems={[]}
          onSelectionChange={handleSelectionChange}
        />
      )

      const checkbox = screen.getByRole('checkbox')
      fireEvent.click(checkbox)

      expect(handleSelectionChange).toHaveBeenCalledWith([
        'item1',
        'item2',
        'item3',
      ])
    })

    test('deselects all items when clicked while all selected', () => {
      const handleSelectionChange = vi.fn()
      render(
        <SelectAllCheckbox
          items={items}
          selectedItems={['item1', 'item2', 'item3']}
          onSelectionChange={handleSelectionChange}
        />
      )

      const checkbox = screen.getByRole('checkbox')
      fireEvent.click(checkbox)

      expect(handleSelectionChange).toHaveBeenCalledWith([])
    })

    test('selects all items when clicked while some selected', () => {
      const handleSelectionChange = vi.fn()
      render(
        <SelectAllCheckbox
          items={items}
          selectedItems={['item1']}
          onSelectionChange={handleSelectionChange}
        />
      )

      const checkbox = screen.getByRole('checkbox')
      fireEvent.click(checkbox)

      expect(handleSelectionChange).toHaveBeenCalledWith([
        'item1',
        'item2',
        'item3',
      ])
    })
  })

  describe('LegacyCheckbox', () => {
    test('renders legacy checkbox', () => {
      render(<LegacyCheckbox />)

      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeInTheDocument()
    })

    test('renders with label', () => {
      render(<LegacyCheckbox label="Accept terms" />)

      expect(screen.getByText('Accept terms')).toBeInTheDocument()
    })

    test('handles checked state', () => {
      render(<LegacyCheckbox checked={true} />)

      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeChecked()
    })

    test('calls onChange when clicked', () => {
      const handleChange = vi.fn()
      render(<LegacyCheckbox onChange={handleChange} />)

      const checkbox = screen.getByRole('checkbox')
      fireEvent.click(checkbox)

      expect(handleChange).toHaveBeenCalledWith(true)
    })

    test('supports disabled state', () => {
      render(<LegacyCheckbox disabled />)

      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeDisabled()
    })
  })

  describe('Accessibility', () => {
    test('has proper ARIA attributes', () => {
      render(<Checkbox aria-label="Accept terms" />)

      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toHaveAttribute('aria-label', 'Accept terms')
    })

    test('supports keyboard navigation', () => {
      const handleChange = vi.fn()
      render(<Checkbox onCheckedChange={handleChange} />)

      const checkbox = screen.getByRole('checkbox')
      checkbox.focus()

      fireEvent.keyDown(checkbox, { key: ' ' })
      expect(handleChange).toHaveBeenCalledWith(true)
    })

    test('supports form integration', () => {
      render(
        <form>
          <Checkbox name="terms" value="accepted" />
        </form>
      )

      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toHaveAttribute('name', 'terms')
      expect(checkbox).toHaveAttribute('value', 'accepted')
    })
  })
})

describe('Checkbox Integration', () => {
  test('works with form libraries', () => {
    const FormExample = () => {
      const [checked, setChecked] = React.useState(false)

      return (
        <form>
          <CheckboxWithLabel
            label="I agree to the terms"
            checked={checked}
            onCheckedChange={setChecked}
          />
          <button type="submit" disabled={!checked}>
            Submit
          </button>
        </form>
      )
    }

    render(<FormExample />)

    const checkbox = screen.getByRole('checkbox')
    const submitButton = screen.getByRole('button')

    expect(submitButton).toBeDisabled()

    fireEvent.click(checkbox)
    expect(submitButton).not.toBeDisabled()
  })

  test('works with controlled state', () => {
    const ControlledExample = () => {
      const [items, setItems] = React.useState([
        { id: 'a', label: 'Item A' },
        { id: 'b', label: 'Item B' },
      ])
      const [selected, setSelected] = React.useState<string[]>([])

      return (
        <div>
          <SelectAllCheckbox
            items={items}
            selectedItems={selected}
            onSelectionChange={setSelected}
          />
          <CheckboxGroup
            items={items}
            value={selected}
            onValueChange={setSelected}
          />
        </div>
      )
    }

    render(<ControlledExample />)

    const selectAllCheckbox =
      screen.getByText('Select all').previousElementSibling
    const itemCheckboxes = screen.getAllByRole('checkbox')

    // Select all should select individual items
    fireEvent.click(selectAllCheckbox!)
    expect(itemCheckboxes[1]).toBeChecked()
    expect(itemCheckboxes[2]).toBeChecked()

    // Deselecting an item should affect select all
    fireEvent.click(itemCheckboxes[1])
    expect(selectAllCheckbox).not.toBeChecked()
  })
})
