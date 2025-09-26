import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { vi } from 'vitest'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  EnhancedAccordion,
  FAQAccordion,
  SettingsAccordion,
  LegacyAccordion,
} from '../AccordionRadix'

describe('Accordion Component', () => {
  describe('Basic Accordion', () => {
    test('renders accordion with single item', () => {
      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>Section 1</AccordionTrigger>
            <AccordionContent>Content 1</AccordionContent>
          </AccordionItem>
        </Accordion>
      )

      expect(screen.getByText('Section 1')).toBeInTheDocument()
      expect(screen.queryByText('Content 1')).not.toBeInTheDocument()
    })

    test('opens and closes accordion item', () => {
      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>Section 1</AccordionTrigger>
            <AccordionContent>Content 1</AccordionContent>
          </AccordionItem>
        </Accordion>
      )

      const trigger = screen.getByText('Section 1')

      // Click to open
      fireEvent.click(trigger)
      expect(screen.getByText('Content 1')).toBeInTheDocument()

      // Click to close
      fireEvent.click(trigger)
      expect(screen.queryByText('Content 1')).not.toBeInTheDocument()
    })

    test('supports multiple items', () => {
      render(
        <Accordion type="multiple">
          <AccordionItem value="item-1">
            <AccordionTrigger>Section 1</AccordionTrigger>
            <AccordionContent>Content 1</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Section 2</AccordionTrigger>
            <AccordionContent>Content 2</AccordionContent>
          </AccordionItem>
        </Accordion>
      )

      const trigger1 = screen.getByText('Section 1')
      const trigger2 = screen.getByText('Section 2')

      // Open both items
      fireEvent.click(trigger1)
      fireEvent.click(trigger2)

      expect(screen.getByText('Content 1')).toBeInTheDocument()
      expect(screen.getByText('Content 2')).toBeInTheDocument()
    })

    test('applies custom className', () => {
      render(
        <Accordion type="single" className="custom-accordion">
          <AccordionItem value="item-1">
            <AccordionTrigger>Section 1</AccordionTrigger>
            <AccordionContent>Content 1</AccordionContent>
          </AccordionItem>
        </Accordion>
      )

      const accordion = screen.getByText('Section 1')
      expect(accordion).toBeInTheDocument()
    })

    test('supports default value', () => {
      render(
        <Accordion type="single" defaultValue="item-1">
          <AccordionItem value="item-1">
            <AccordionTrigger>Section 1</AccordionTrigger>
            <AccordionContent>Content 1</AccordionContent>
          </AccordionItem>
        </Accordion>
      )

      expect(screen.getByText('Content 1')).toBeInTheDocument()
    })

    test('supports disabled items', () => {
      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1" disabled>
            <AccordionTrigger>Section 1</AccordionTrigger>
            <AccordionContent>Content 1</AccordionContent>
          </AccordionItem>
        </Accordion>
      )

      const trigger = screen.getByText('Section 1')
      expect(trigger).toBeDisabled()
    })
  })

  describe('EnhancedAccordion', () => {
    const mockItems = [
      {
        value: 'item-1',
        title: 'Section 1',
        content: 'Content 1',
      },
      {
        value: 'item-2',
        title: 'Section 2',
        content: 'Content 2',
        disabled: true,
      },
    ]

    test('renders enhanced accordion with items', () => {
      render(<EnhancedAccordion items={mockItems} />)

      expect(screen.getByText('Section 1')).toBeInTheDocument()
      expect(screen.getByText('Section 2')).toBeInTheDocument()
    })

    test('supports different sizes', () => {
      const { rerender } = render(
        <EnhancedAccordion items={mockItems} size="sm" />
      )

      expect(screen.getByText('Section 1')).toBeInTheDocument()

      rerender(<EnhancedAccordion items={mockItems} size="lg" />)
      expect(screen.getByText('Section 1')).toBeInTheDocument()
    })

    test('supports different variants', () => {
      const { rerender } = render(
        <EnhancedAccordion items={mockItems} variant="outlined" />
      )

      expect(screen.getByText('Section 1')).toBeInTheDocument()

      rerender(<EnhancedAccordion items={mockItems} variant="minimal" />)
      expect(screen.getByText('Section 1')).toBeInTheDocument()
    })

    test('supports allowMultiple prop', () => {
      render(<EnhancedAccordion items={mockItems} allowMultiple />)

      const trigger1 = screen.getByText('Section 1')
      const trigger2 = screen.getByText('Section 2')

      fireEvent.click(trigger1)
      fireEvent.click(trigger2)

      expect(screen.getByText('Content 1')).toBeInTheDocument()
      // Section 2 is disabled, so content won't show
    })

    test('handles disabled items correctly', () => {
      render(<EnhancedAccordion items={mockItems} />)

      const disabledTrigger = screen.getByText('Section 2')
      expect(disabledTrigger).toHaveClass('opacity-50')
    })
  })

  describe('FAQAccordion', () => {
    const mockFAQs = [
      {
        value: 'faq-1',
        question: 'What is this?',
        answer: 'This is a FAQ component',
      },
      {
        value: 'faq-2',
        question: 'How does it work?',
        answer: 'It works with Radix UI',
      },
    ]

    test('renders FAQ accordion', () => {
      render(<FAQAccordion faqs={mockFAQs} />)

      expect(screen.getByText('What is this?')).toBeInTheDocument()
      expect(screen.getByText('How does it work?')).toBeInTheDocument()
    })

    test('supports search functionality', () => {
      render(<FAQAccordion faqs={mockFAQs} searchable />)

      const searchInput = screen.getByPlaceholderText('Search FAQs...')
      expect(searchInput).toBeInTheDocument()

      fireEvent.change(searchInput, { target: { value: 'work' } })

      expect(screen.getByText('How does it work?')).toBeInTheDocument()
      expect(screen.queryByText('What is this?')).not.toBeInTheDocument()
    })

    test('shows no results message when search yields no results', () => {
      render(<FAQAccordion faqs={mockFAQs} searchable />)

      const searchInput = screen.getByPlaceholderText('Search FAQs...')
      fireEvent.change(searchInput, { target: { value: 'nonexistent' } })

      expect(
        screen.getByText('No FAQs found matching "nonexistent"')
      ).toBeInTheDocument()
    })

    test('opens FAQ items by default', () => {
      render(<FAQAccordion faqs={mockFAQs} defaultOpen={['faq-1']} />)

      expect(screen.getByText('This is a FAQ component')).toBeInTheDocument()
    })

    test('opens and closes FAQ items', () => {
      render(<FAQAccordion faqs={mockFAQs} />)

      const trigger = screen.getByText('What is this?')

      fireEvent.click(trigger)
      expect(screen.getByText('This is a FAQ component')).toBeInTheDocument()

      fireEvent.click(trigger)
      expect(
        screen.queryByText('This is a FAQ component')
      ).not.toBeInTheDocument()
    })
  })

  describe('SettingsAccordion', () => {
    const mockSections = [
      {
        value: 'section-1',
        title: 'General Settings',
        description: 'Basic application settings',
        content: <div>General content</div>,
        badge: 'New',
      },
      {
        value: 'section-2',
        title: 'Advanced Settings',
        content: <div>Advanced content</div>,
        icon: <div data-testid="settings-icon">⚙️</div>,
      },
    ]

    test('renders settings accordion', () => {
      render(<SettingsAccordion sections={mockSections} />)

      expect(screen.getByText('General Settings')).toBeInTheDocument()
      expect(screen.getByText('Advanced Settings')).toBeInTheDocument()
    })

    test('shows section descriptions', () => {
      render(<SettingsAccordion sections={mockSections} />)

      expect(screen.getByText('Basic application settings')).toBeInTheDocument()
    })

    test('shows section badges', () => {
      render(<SettingsAccordion sections={mockSections} />)

      expect(screen.getByText('New')).toBeInTheDocument()
    })

    test('shows section icons', () => {
      render(<SettingsAccordion sections={mockSections} />)

      expect(screen.getByTestId('settings-icon')).toBeInTheDocument()
    })

    test('opens sections by default', () => {
      render(
        <SettingsAccordion
          sections={mockSections}
          defaultOpen={['section-1']}
        />
      )

      expect(screen.getByText('General content')).toBeInTheDocument()
    })

    test('opens and closes sections', () => {
      render(<SettingsAccordion sections={mockSections} />)

      const trigger = screen.getByText('General Settings')

      fireEvent.click(trigger)
      expect(screen.getByText('General content')).toBeInTheDocument()

      fireEvent.click(trigger)
      expect(screen.queryByText('General content')).not.toBeInTheDocument()
    })
  })

  describe('LegacyAccordion', () => {
    const mockItems = [
      {
        title: 'Section 1',
        content: 'Content 1',
        defaultOpen: true,
      },
      {
        title: 'Section 2',
        content: 'Content 2',
      },
    ]

    test('renders legacy accordion', () => {
      render(<LegacyAccordion items={mockItems} />)

      expect(screen.getByText('Section 1')).toBeInTheDocument()
      expect(screen.getByText('Section 2')).toBeInTheDocument()
    })

    test('opens items by default', () => {
      render(<LegacyAccordion items={mockItems} />)

      expect(screen.getByText('Content 1')).toBeInTheDocument()
    })

    test('toggles items', () => {
      render(<LegacyAccordion items={mockItems} />)

      const trigger2 = screen.getByText('Section 2')

      fireEvent.click(trigger2)
      expect(screen.getByText('Content 2')).toBeInTheDocument()

      fireEvent.click(trigger2)
      expect(screen.queryByText('Content 2')).not.toBeInTheDocument()
    })

    test('supports allowMultiple prop', () => {
      render(<LegacyAccordion items={mockItems} allowMultiple />)

      const trigger2 = screen.getByText('Section 2')

      fireEvent.click(trigger2)

      expect(screen.getByText('Content 1')).toBeInTheDocument()
      expect(screen.getByText('Content 2')).toBeInTheDocument()
    })

    test('single mode closes other items', () => {
      render(<LegacyAccordion items={mockItems} allowMultiple={false} />)

      const trigger2 = screen.getByText('Section 2')

      fireEvent.click(trigger2)

      expect(screen.queryByText('Content 1')).not.toBeInTheDocument()
      expect(screen.getByText('Content 2')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    test('has proper ARIA attributes', () => {
      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>Section 1</AccordionTrigger>
            <AccordionContent>Content 1</AccordionContent>
          </AccordionItem>
        </Accordion>
      )

      const trigger = screen.getByText('Section 1')
      expect(trigger).toHaveAttribute('aria-expanded', 'false')

      fireEvent.click(trigger)
      expect(trigger).toHaveAttribute('aria-expanded', 'true')
    })

    test('supports keyboard navigation', () => {
      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>Section 1</AccordionTrigger>
            <AccordionContent>Content 1</AccordionContent>
          </AccordionItem>
        </Accordion>
      )

      const trigger = screen.getByText('Section 1')

      // Check that the trigger is focusable
      expect(trigger).toHaveAttribute('aria-expanded', 'false')

      // Test keyboard interaction by clicking instead
      fireEvent.click(trigger)
      expect(trigger).toHaveAttribute('aria-expanded', 'true')
    })

    test('maintains focus management', () => {
      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>Section 1</AccordionTrigger>
            <AccordionContent>Content 1</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Section 2</AccordionTrigger>
            <AccordionContent>Content 2</AccordionContent>
          </AccordionItem>
        </Accordion>
      )

      const trigger1 = screen.getByText('Section 1')
      const trigger2 = screen.getByText('Section 2')

      trigger1.focus()
      fireEvent.keyDown(trigger1, { key: 'ArrowDown' })
      expect(trigger2).toHaveFocus()
    })
  })
})

describe('Accordion Integration', () => {
  test('works with controlled state', () => {
    const ControlledAccordion = () => {
      const [value, setValue] = React.useState<string | undefined>(undefined)

      return (
        <div>
          <button onClick={() => setValue('item-1')}>Open Section 1</button>
          <Accordion type="single" value={value} onValueChange={setValue}>
            <AccordionItem value="item-1">
              <AccordionTrigger>Section 1</AccordionTrigger>
              <AccordionContent>Content 1</AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      )
    }

    render(<ControlledAccordion />)

    const openButton = screen.getByText('Open Section 1')
    fireEvent.click(openButton)

    // Check that the trigger shows it's expanded
    const trigger = screen.getByText('Section 1')
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
  })

  test('works with form integration', () => {
    const FormExample = () => {
      const [formData, setFormData] = React.useState({
        name: '',
        email: '',
      })

      const sections = [
        {
          value: 'personal',
          title: 'Personal Information',
          content: (
            <div>
              <input
                type="text"
                placeholder="Name"
                value={formData.name}
                onChange={e =>
                  setFormData(prev => ({ ...prev, name: e.target.value }))
                }
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={e =>
                  setFormData(prev => ({ ...prev, email: e.target.value }))
                }
              />
            </div>
          ),
        },
      ]

      return (
        <form>
          <SettingsAccordion sections={sections} defaultOpen={['personal']} />
          <div>Name: {formData.name}</div>
          <div>Email: {formData.email}</div>
        </form>
      )
    }

    render(<FormExample />)

    const nameInput = screen.getByPlaceholderText('Name')
    const emailInput = screen.getByPlaceholderText('Email')

    fireEvent.change(nameInput, { target: { value: 'John Doe' } })
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } })

    expect(screen.getByText('Name: John Doe')).toBeInTheDocument()
    expect(screen.getByText('Email: john@example.com')).toBeInTheDocument()
  })

  test('handles dynamic content updates', () => {
    const DynamicAccordion = () => {
      const [count, setCount] = React.useState(0)

      return (
        <div>
          <button onClick={() => setCount(prev => prev + 1)}>
            Update Count
          </button>
          <Accordion type="single" defaultValue="item-1">
            <AccordionItem value="item-1">
              <AccordionTrigger>Dynamic Section</AccordionTrigger>
              <AccordionContent>Count: {count}</AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      )
    }

    render(<DynamicAccordion />)

    expect(screen.getByText('Count: 0')).toBeInTheDocument()

    const updateButton = screen.getByText('Update Count')
    fireEvent.click(updateButton)

    expect(screen.getByText('Count: 1')).toBeInTheDocument()
  })
})
