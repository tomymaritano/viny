import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { vi } from 'vitest'
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverClose,
  PopoverWithTitle,
  ConfirmationPopover,
  FormPopover,
  InfoPopover,
  LegacyPopover,
} from '../PopoverRadix'

// Mock ResizeObserver for tests
global.ResizeObserver = class ResizeObserver {
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback
  }
  callback: ResizeObserverCallback
  observe() {}
  unobserve() {}
  disconnect() {}
}

describe('Popover Component', () => {
  describe('Basic Popover', () => {
    test('renders popover trigger', () => {
      render(
        <Popover>
          <PopoverTrigger>Open Popover</PopoverTrigger>
          <PopoverContent>Popover content</PopoverContent>
        </Popover>
      )

      expect(screen.getByText('Open Popover')).toBeInTheDocument()
    })

    test('shows popover content when trigger is clicked', async () => {
      render(
        <Popover>
          <PopoverTrigger>Open Popover</PopoverTrigger>
          <PopoverContent>Popover content</PopoverContent>
        </Popover>
      )

      const trigger = screen.getByText('Open Popover')
      fireEvent.click(trigger)

      await waitFor(() => {
        expect(screen.getByText('Popover content')).toBeInTheDocument()
      })
    })

    test('hides popover content when closed', async () => {
      render(
        <Popover>
          <PopoverTrigger>Open Popover</PopoverTrigger>
          <PopoverContent>
            Popover content
            <PopoverClose />
          </PopoverContent>
        </Popover>
      )

      const trigger = screen.getByText('Open Popover')
      fireEvent.click(trigger)

      await waitFor(() => {
        expect(screen.getByText('Popover content')).toBeInTheDocument()
      })

      const closeButton = screen.getByRole('button', { name: 'Close' })
      fireEvent.click(closeButton)

      await waitFor(() => {
        expect(screen.queryByText('Popover content')).not.toBeInTheDocument()
      })
    })

    test('applies custom className to content', async () => {
      render(
        <Popover>
          <PopoverTrigger>Open Popover</PopoverTrigger>
          <PopoverContent className="custom-popover">
            Popover content
          </PopoverContent>
        </Popover>
      )

      const trigger = screen.getByText('Open Popover')
      fireEvent.click(trigger)

      await waitFor(() => {
        const content = screen.getByText('Popover content')
        expect(content).toHaveClass('custom-popover')
      })
    })

    test('supports controlled state', async () => {
      const ControlledPopover = () => {
        const [open, setOpen] = React.useState(false)

        return (
          <div>
            <button onClick={() => setOpen(!open)}>Toggle</button>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger>Open Popover</PopoverTrigger>
              <PopoverContent>Popover content</PopoverContent>
            </Popover>
          </div>
        )
      }

      render(<ControlledPopover />)

      const toggleButton = screen.getByText('Toggle')
      fireEvent.click(toggleButton)

      await waitFor(() => {
        expect(screen.getByText('Popover content')).toBeInTheDocument()
      })
    })
  })

  describe('PopoverWithTitle', () => {
    test('renders popover with title', async () => {
      render(
        <PopoverWithTitle title="Test Title" trigger={<button>Open</button>}>
          Test content
        </PopoverWithTitle>
      )

      const trigger = screen.getByText('Open')
      fireEvent.click(trigger)

      await waitFor(() => {
        expect(screen.getByText('Test Title')).toBeInTheDocument()
        expect(screen.getByText('Test content')).toBeInTheDocument()
      })
    })

    test('renders popover with title and description', async () => {
      render(
        <PopoverWithTitle
          title="Test Title"
          description="Test description"
          trigger={<button>Open</button>}
        >
          Test content
        </PopoverWithTitle>
      )

      const trigger = screen.getByText('Open')
      fireEvent.click(trigger)

      await waitFor(() => {
        expect(screen.getByText('Test Title')).toBeInTheDocument()
        expect(screen.getByText('Test description')).toBeInTheDocument()
      })
    })

    test('shows close button by default', async () => {
      render(
        <PopoverWithTitle title="Test Title" trigger={<button>Open</button>}>
          Test content
        </PopoverWithTitle>
      )

      const trigger = screen.getByText('Open')
      fireEvent.click(trigger)

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: 'Close' })
        ).toBeInTheDocument()
      })
    })

    test('hides close button when disabled', async () => {
      render(
        <PopoverWithTitle
          title="Test Title"
          showCloseButton={false}
          trigger={<button>Open</button>}
        >
          Test content
        </PopoverWithTitle>
      )

      const trigger = screen.getByText('Open')
      fireEvent.click(trigger)

      await waitFor(() => {
        expect(
          screen.queryByRole('button', { name: 'Close' })
        ).not.toBeInTheDocument()
      })
    })

    test('supports different sizes', async () => {
      const { rerender } = render(
        <PopoverWithTitle
          title="Test Title"
          size="sm"
          trigger={<button>Open</button>}
        >
          Test content
        </PopoverWithTitle>
      )

      const trigger = screen.getByText('Open')
      fireEvent.click(trigger)

      await waitFor(() => {
        const content = screen.getByText('Test content')
        expect(content.closest('[class*="w-64"]')).toBeInTheDocument()
      })

      fireEvent.click(trigger) // Close

      rerender(
        <PopoverWithTitle
          title="Test Title"
          size="xl"
          trigger={<button>Open</button>}
        >
          Test content
        </PopoverWithTitle>
      )

      fireEvent.click(trigger)

      await waitFor(() => {
        const content = screen.getByText('Test content')
        expect(content.closest('[class*="w-96"]')).toBeInTheDocument()
      })
    })
  })

  describe('ConfirmationPopover', () => {
    test('renders confirmation popover', async () => {
      const handleConfirm = vi.fn()

      render(
        <ConfirmationPopover
          title="Delete Item"
          description="Are you sure you want to delete this item?"
          onConfirm={handleConfirm}
          trigger={<button>Delete</button>}
        />
      )

      const trigger = screen.getByText('Delete')
      fireEvent.click(trigger)

      await waitFor(() => {
        expect(screen.getByText('Delete Item')).toBeInTheDocument()
        expect(
          screen.getByText('Are you sure you want to delete this item?')
        ).toBeInTheDocument()
      })
    })

    test('calls onConfirm when confirm button is clicked', async () => {
      const handleConfirm = vi.fn()

      render(
        <ConfirmationPopover
          title="Delete Item"
          description="Are you sure?"
          onConfirm={handleConfirm}
          trigger={<button>Delete</button>}
        />
      )

      const trigger = screen.getByText('Delete')
      fireEvent.click(trigger)

      await waitFor(() => {
        expect(screen.getByText('Delete Item')).toBeInTheDocument()
      })

      const confirmButton = screen.getByText('Confirm')
      fireEvent.click(confirmButton)

      expect(handleConfirm).toHaveBeenCalled()
    })

    test('calls onCancel when cancel button is clicked', async () => {
      const handleCancel = vi.fn()

      render(
        <ConfirmationPopover
          title="Delete Item"
          description="Are you sure?"
          onConfirm={vi.fn()}
          onCancel={handleCancel}
          trigger={<button>Delete</button>}
        />
      )

      const trigger = screen.getByText('Delete')
      fireEvent.click(trigger)

      await waitFor(() => {
        expect(screen.getByText('Delete Item')).toBeInTheDocument()
      })

      const cancelButton = screen.getByText('Cancel')
      fireEvent.click(cancelButton)

      expect(handleCancel).toHaveBeenCalled()
    })

    test('supports custom button text', async () => {
      render(
        <ConfirmationPopover
          title="Delete Item"
          description="Are you sure?"
          confirmText="Yes, Delete"
          cancelText="No, Keep"
          onConfirm={vi.fn()}
          trigger={<button>Delete</button>}
        />
      )

      const trigger = screen.getByText('Delete')
      fireEvent.click(trigger)

      await waitFor(() => {
        expect(screen.getByText('Yes, Delete')).toBeInTheDocument()
        expect(screen.getByText('No, Keep')).toBeInTheDocument()
      })
    })

    test('supports different variants', async () => {
      render(
        <ConfirmationPopover
          title="Delete Item"
          description="Are you sure?"
          variant="destructive"
          onConfirm={vi.fn()}
          trigger={<button>Delete</button>}
        />
      )

      const trigger = screen.getByText('Delete')
      fireEvent.click(trigger)

      await waitFor(() => {
        const confirmButton = screen.getByText('Confirm')
        expect(confirmButton).toHaveClass('bg-red-600')
      })
    })
  })

  describe('FormPopover', () => {
    test('renders form popover', async () => {
      render(
        <FormPopover
          title="Add Item"
          onSubmit={vi.fn()}
          trigger={<button>Add</button>}
        >
          <input name="name" placeholder="Name" />
        </FormPopover>
      )

      const trigger = screen.getByText('Add')
      fireEvent.click(trigger)

      await waitFor(() => {
        expect(screen.getByText('Add Item')).toBeInTheDocument()
        expect(screen.getByPlaceholderText('Name')).toBeInTheDocument()
      })
    })

    test('calls onSubmit with form data', async () => {
      const handleSubmit = vi.fn()

      render(
        <FormPopover
          title="Add Item"
          onSubmit={handleSubmit}
          trigger={<button>Add</button>}
        >
          <input name="name" placeholder="Name" />
        </FormPopover>
      )

      const trigger = screen.getByText('Add')
      fireEvent.click(trigger)

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Name')).toBeInTheDocument()
      })

      const input = screen.getByPlaceholderText('Name')
      fireEvent.change(input, { target: { value: 'Test Name' } })

      const submitButton = screen.getByText('Submit')
      fireEvent.click(submitButton)

      expect(handleSubmit).toHaveBeenCalledWith({ name: 'Test Name' })
    })

    test('calls onCancel when cancel button is clicked', async () => {
      const handleCancel = vi.fn()

      render(
        <FormPopover
          title="Add Item"
          onSubmit={vi.fn()}
          onCancel={handleCancel}
          trigger={<button>Add</button>}
        >
          <input name="name" placeholder="Name" />
        </FormPopover>
      )

      const trigger = screen.getByText('Add')
      fireEvent.click(trigger)

      await waitFor(() => {
        expect(screen.getByText('Add Item')).toBeInTheDocument()
      })

      const cancelButton = screen.getByText('Cancel')
      fireEvent.click(cancelButton)

      expect(handleCancel).toHaveBeenCalled()
    })

    test('supports custom button text', async () => {
      render(
        <FormPopover
          title="Add Item"
          submitText="Create"
          cancelText="Dismiss"
          onSubmit={vi.fn()}
          trigger={<button>Add</button>}
        >
          <input name="name" placeholder="Name" />
        </FormPopover>
      )

      const trigger = screen.getByText('Add')
      fireEvent.click(trigger)

      await waitFor(() => {
        expect(screen.getByText('Create')).toBeInTheDocument()
        expect(screen.getByText('Dismiss')).toBeInTheDocument()
      })
    })
  })

  describe('InfoPopover', () => {
    test('renders info popover', async () => {
      render(
        <InfoPopover
          content="This is helpful information"
          trigger={<button>Help</button>}
        />
      )

      const trigger = screen.getByText('Help')
      fireEvent.click(trigger)

      await waitFor(() => {
        expect(
          screen.getByText('This is helpful information')
        ).toBeInTheDocument()
      })
    })

    test('supports different sizes', async () => {
      const { rerender } = render(
        <InfoPopover
          content="Small info"
          size="sm"
          trigger={<button>Help</button>}
        />
      )

      const trigger = screen.getByText('Help')
      fireEvent.click(trigger)

      await waitFor(() => {
        const content = screen.getByText('Small info')
        expect(content.closest('[class*="w-48"]')).toBeInTheDocument()
      })

      fireEvent.click(trigger) // Close

      rerender(
        <InfoPopover
          content="Large info"
          size="lg"
          trigger={<button>Help</button>}
        />
      )

      fireEvent.click(trigger)

      await waitFor(() => {
        const content = screen.getByText('Large info')
        expect(content.closest('[class*="w-80"]')).toBeInTheDocument()
      })
    })

    test('supports different positions', async () => {
      render(
        <InfoPopover
          content="Info content"
          side="bottom"
          align="start"
          trigger={<button>Help</button>}
        />
      )

      const trigger = screen.getByText('Help')
      fireEvent.click(trigger)

      await waitFor(() => {
        expect(screen.getByText('Info content')).toBeInTheDocument()
      })
    })
  })

  describe('LegacyPopover', () => {
    test('renders legacy popover', async () => {
      render(
        <LegacyPopover
          content="Legacy content"
          trigger={<button>Open</button>}
        />
      )

      const trigger = screen.getByText('Open')
      fireEvent.click(trigger)

      await waitFor(() => {
        expect(screen.getByText('Legacy content')).toBeInTheDocument()
      })
    })

    test('supports different placements', async () => {
      render(
        <LegacyPopover
          content="Bottom content"
          placement="bottom"
          trigger={<button>Open</button>}
        />
      )

      const trigger = screen.getByText('Open')
      fireEvent.click(trigger)

      await waitFor(() => {
        expect(screen.getByText('Bottom content')).toBeInTheDocument()
      })
    })

    test('calls onVisibilityChange when opened', async () => {
      const handleVisibilityChange = vi.fn()

      render(
        <LegacyPopover
          content="Legacy content"
          onVisibilityChange={handleVisibilityChange}
          trigger={<button>Open</button>}
        />
      )

      const trigger = screen.getByText('Open')
      fireEvent.click(trigger)

      await waitFor(() => {
        expect(handleVisibilityChange).toHaveBeenCalledWith(true)
      })
    })

    test('applies custom className', async () => {
      render(
        <LegacyPopover
          content="Legacy content"
          className="legacy-popover"
          trigger={<button>Open</button>}
        />
      )

      const trigger = screen.getByText('Open')
      fireEvent.click(trigger)

      await waitFor(() => {
        const content = screen.getByText('Legacy content')
        expect(content).toHaveClass('legacy-popover')
      })
    })
  })

  describe('Accessibility', () => {
    test('has proper ARIA attributes', async () => {
      render(
        <Popover>
          <PopoverTrigger>Open Popover</PopoverTrigger>
          <PopoverContent>Popover content</PopoverContent>
        </Popover>
      )

      const trigger = screen.getByText('Open Popover')
      expect(trigger).toHaveAttribute('aria-expanded', 'false')

      fireEvent.click(trigger)

      await waitFor(() => {
        expect(trigger).toHaveAttribute('aria-expanded', 'true')
      })
    })

    test('supports keyboard navigation', async () => {
      render(
        <Popover>
          <PopoverTrigger>Open Popover</PopoverTrigger>
          <PopoverContent>
            Popover content
            <PopoverClose />
          </PopoverContent>
        </Popover>
      )

      const trigger = screen.getByText('Open Popover')

      // Open with Enter key
      fireEvent.keyDown(trigger, { key: 'Enter' })

      await waitFor(() => {
        expect(screen.getByText('Popover content')).toBeInTheDocument()
      })

      // Close with Escape key
      fireEvent.keyDown(document, { key: 'Escape' })

      await waitFor(() => {
        expect(screen.queryByText('Popover content')).not.toBeInTheDocument()
      })
    })

    test('manages focus correctly', async () => {
      render(
        <Popover>
          <PopoverTrigger>Open Popover</PopoverTrigger>
          <PopoverContent>
            Popover content
            <button>Focus me</button>
          </PopoverContent>
        </Popover>
      )

      const trigger = screen.getByText('Open Popover')
      fireEvent.click(trigger)

      await waitFor(() => {
        const focusButton = screen.getByText('Focus me')
        expect(focusButton).toBeInTheDocument()
        focusButton.focus()
        expect(focusButton).toHaveFocus()
      })
    })
  })
})

describe('Popover Integration', () => {
  test('works with form controls', async () => {
    const FormWithPopover = () => {
      const [value, setValue] = React.useState('')

      return (
        <div>
          <input value={value} onChange={e => setValue(e.target.value)} />
          <InfoPopover
            content={`Current value: ${value}`}
            trigger={<button>Show Value</button>}
          />
        </div>
      )
    }

    render(<FormWithPopover />)

    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'test' } })

    const trigger = screen.getByText('Show Value')
    fireEvent.click(trigger)

    await waitFor(() => {
      expect(screen.getByText('Current value: test')).toBeInTheDocument()
    })
  })

  test('works with multiple popovers', async () => {
    render(
      <div>
        <InfoPopover content="First popover" trigger={<button>First</button>} />
        <InfoPopover
          content="Second popover"
          trigger={<button>Second</button>}
        />
      </div>
    )

    const firstTrigger = screen.getByText('First')
    const secondTrigger = screen.getByText('Second')

    fireEvent.click(firstTrigger)

    await waitFor(() => {
      expect(screen.getByText('First popover')).toBeInTheDocument()
    })

    fireEvent.click(secondTrigger)

    await waitFor(() => {
      expect(screen.getByText('Second popover')).toBeInTheDocument()
    })
  })

  test('handles dynamic content updates', async () => {
    const DynamicPopover = () => {
      const [count, setCount] = React.useState(0)

      return (
        <div>
          <button onClick={() => setCount(prev => prev + 1)}>Increment</button>
          <InfoPopover
            content={`Count: ${count}`}
            trigger={<button>Show Count</button>}
          />
        </div>
      )
    }

    render(<DynamicPopover />)

    const incrementButton = screen.getByText('Increment')
    fireEvent.click(incrementButton)

    const trigger = screen.getByText('Show Count')
    fireEvent.click(trigger)

    await waitFor(() => {
      expect(screen.getByText('Count: 1')).toBeInTheDocument()
    })
  })
})
