import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import {
  Separator,
  EnhancedSeparator,
  SectionSeparator,
  MenuSeparator,
  ContentSeparator,
  VerticalSeparator,
  LegacySeparator,
} from '../SeparatorRadix'

describe('Separator Component', () => {
  describe('Basic Separator', () => {
    test('renders horizontal separator by default', () => {
      render(<Separator data-testid="separator" />)

      const separator = screen.getByTestId('separator')
      expect(separator).toBeInTheDocument()
      expect(separator).toHaveAttribute('aria-orientation', 'horizontal')
    })

    test('renders vertical separator when specified', () => {
      render(<Separator orientation="vertical" data-testid="separator" />)

      const separator = screen.getByTestId('separator')
      expect(separator).toHaveAttribute('aria-orientation', 'vertical')
    })

    test('applies custom className', () => {
      render(<Separator className="custom-separator" data-testid="separator" />)

      const separator = screen.getByTestId('separator')
      expect(separator).toHaveClass('custom-separator')
    })

    test('is decorative by default', () => {
      render(<Separator data-testid="separator" />)

      const separator = screen.getByTestId('separator')
      expect(separator).toHaveAttribute('role', 'none')
    })

    test('can be semantic when decorative is false', () => {
      render(<Separator decorative={false} data-testid="separator" />)

      const separator = screen.getByTestId('separator')
      expect(separator).toHaveAttribute('role', 'separator')
    })

    test('has correct default styling classes', () => {
      render(<Separator data-testid="separator" />)

      const separator = screen.getByTestId('separator')
      expect(separator).toHaveClass(
        'shrink-0',
        'bg-theme-border-primary',
        'h-[1px]',
        'w-full'
      )
    })

    test('has correct vertical styling classes', () => {
      render(<Separator orientation="vertical" data-testid="separator" />)

      const separator = screen.getByTestId('separator')
      expect(separator).toHaveClass(
        'shrink-0',
        'bg-theme-border-primary',
        'h-full',
        'w-[1px]'
      )
    })
  })

  describe('EnhancedSeparator', () => {
    test('renders enhanced separator with default props', () => {
      render(<EnhancedSeparator data-testid="separator" />)

      const separator = screen.getByTestId('separator')
      expect(separator).toBeInTheDocument()
      expect(separator).toHaveClass('bg-theme-border-primary')
    })

    test('renders separator with label', () => {
      render(
        <EnhancedSeparator label="Section Title" data-testid="separator" />
      )

      expect(screen.getByText('Section Title')).toBeInTheDocument()
    })

    test('supports different variants', () => {
      const { rerender } = render(
        <EnhancedSeparator variant="dashed" data-testid="separator" />
      )

      let separator = screen.getByTestId('separator')
      expect(separator).toHaveClass('border-dashed', 'bg-transparent')

      rerender(<EnhancedSeparator variant="gradient" data-testid="separator" />)
      separator = screen.getByTestId('separator')
      expect(separator).toHaveClass('bg-gradient-to-r')
    })

    test('supports different sizes', () => {
      const { rerender } = render(
        <EnhancedSeparator size="sm" data-testid="separator" />
      )

      let separator = screen.getByTestId('separator')
      expect(separator).toHaveClass('h-px')

      rerender(<EnhancedSeparator size="lg" data-testid="separator" />)
      separator = screen.getByTestId('separator')
      expect(separator).toHaveClass('h-[2px]')
    })

    test('supports different colors', () => {
      const { rerender } = render(
        <EnhancedSeparator color="accent" data-testid="separator" />
      )

      let separator = screen.getByTestId('separator')
      expect(separator).toHaveClass('bg-theme-accent-primary')

      rerender(<EnhancedSeparator color="success" data-testid="separator" />)
      separator = screen.getByTestId('separator')
      expect(separator).toHaveClass('bg-green-500')
    })

    test('renders vertical separator with correct classes', () => {
      render(
        <EnhancedSeparator
          orientation="vertical"
          size="lg"
          data-testid="separator"
        />
      )

      const separator = screen.getByTestId('separator')
      expect(separator).toHaveClass('w-[2px]', 'h-full')
    })

    test('renders label correctly with horizontal orientation', () => {
      render(
        <EnhancedSeparator
          label="Test Label"
          orientation="horizontal"
          data-testid="separator"
        />
      )

      const label = screen.getByText('Test Label')
      expect(label).toBeInTheDocument()
      expect(label).toHaveClass('px-3', 'text-sm', 'text-theme-text-secondary')
    })
  })

  describe('SectionSeparator', () => {
    test('renders section separator with title', () => {
      render(<SectionSeparator title="Section Title" data-testid="separator" />)

      expect(screen.getByText('Section Title')).toBeInTheDocument()
      expect(screen.getByText('Section Title')).toHaveClass(
        'text-lg',
        'font-semibold'
      )
    })

    test('renders section separator with description', () => {
      render(
        <SectionSeparator
          title="Section Title"
          description="Section description"
          data-testid="separator"
        />
      )

      expect(screen.getByText('Section Title')).toBeInTheDocument()
      expect(screen.getByText('Section description')).toBeInTheDocument()
    })

    test('renders section separator with icon', () => {
      const icon = <span data-testid="icon">📁</span>
      render(
        <SectionSeparator
          title="Section Title"
          icon={icon}
          data-testid="separator"
        />
      )

      expect(screen.getByTestId('icon')).toBeInTheDocument()
    })

    test('renders section separator with actions', () => {
      const actions = <button data-testid="action">Action</button>
      render(
        <SectionSeparator
          title="Section Title"
          actions={actions}
          data-testid="separator"
        />
      )

      expect(screen.getByTestId('action')).toBeInTheDocument()
    })

    test('applies custom className', () => {
      render(
        <SectionSeparator
          title="Title"
          className="custom-section"
          data-testid="separator"
        />
      )

      const container = screen.getByTestId('separator')
      expect(container).toHaveClass('custom-section')
    })
  })

  describe('MenuSeparator', () => {
    test('renders menu separator with default spacing', () => {
      render(<MenuSeparator data-testid="separator" />)

      const separator = screen.getByTestId('separator')
      expect(separator).toBeInTheDocument()
      expect(separator).toHaveClass('my-2')
    })

    test('supports different spacing options', () => {
      const { rerender } = render(
        <MenuSeparator spacing="sm" data-testid="separator" />
      )

      let separator = screen.getByTestId('separator')
      expect(separator).toHaveClass('my-1')

      rerender(<MenuSeparator spacing="lg" data-testid="separator" />)
      separator = screen.getByTestId('separator')
      expect(separator).toHaveClass('my-3')
    })

    test('applies custom className', () => {
      render(<MenuSeparator className="custom-menu" data-testid="separator" />)

      const separator = screen.getByTestId('separator')
      expect(separator).toHaveClass('custom-menu')
    })
  })

  describe('ContentSeparator', () => {
    test('renders content separator with default spacing', () => {
      render(<ContentSeparator data-testid="separator" />)

      const container = screen.getByTestId('separator')
      expect(container).toBeInTheDocument()
      expect(container).toHaveClass('my-8')
    })

    test('supports different spacing options', () => {
      const { rerender } = render(
        <ContentSeparator spacing="sm" data-testid="separator" />
      )

      let container = screen.getByTestId('separator')
      expect(container).toHaveClass('my-4')

      rerender(<ContentSeparator spacing="xl" data-testid="separator" />)
      container = screen.getByTestId('separator')
      expect(container).toHaveClass('my-12')
    })

    test('supports fade effect', () => {
      render(<ContentSeparator fade data-testid="separator" />)

      const container = screen.getByTestId('separator')
      const separator = container.querySelector('[role="none"]')
      expect(separator).toHaveClass('bg-gradient-to-r')
    })

    test('applies custom className', () => {
      render(
        <ContentSeparator className="custom-content" data-testid="separator" />
      )

      const container = screen.getByTestId('separator')
      expect(container).toHaveClass('custom-content')
    })
  })

  describe('VerticalSeparator', () => {
    test('renders vertical separator with default props', () => {
      render(<VerticalSeparator data-testid="separator" />)

      const separator = screen.getByTestId('separator')
      expect(separator).toBeInTheDocument()
      expect(separator).toHaveAttribute('aria-orientation', 'vertical')
      expect(separator).toHaveClass('mx-2')
    })

    test('supports different spacing options', () => {
      const { rerender } = render(
        <VerticalSeparator spacing="sm" data-testid="separator" />
      )

      let separator = screen.getByTestId('separator')
      expect(separator).toHaveClass('mx-1')

      rerender(<VerticalSeparator spacing="lg" data-testid="separator" />)
      separator = screen.getByTestId('separator')
      expect(separator).toHaveClass('mx-3')
    })

    test('supports custom height as string', () => {
      render(<VerticalSeparator height="2rem" data-testid="separator" />)

      const separator = screen.getByTestId('separator')
      expect(separator).toHaveStyle({ height: '2rem' })
    })

    test('supports custom height as number', () => {
      render(<VerticalSeparator height={24} data-testid="separator" />)

      const separator = screen.getByTestId('separator')
      expect(separator).toHaveStyle({ height: '24px' })
    })

    test('applies custom className', () => {
      render(
        <VerticalSeparator
          className="custom-vertical"
          data-testid="separator"
        />
      )

      const separator = screen.getByTestId('separator')
      expect(separator).toHaveClass('custom-vertical')
    })
  })

  describe('LegacySeparator', () => {
    test('renders legacy separator with default props', () => {
      render(<LegacySeparator data-testid="separator" />)

      const separator = screen.getByTestId('separator')
      expect(separator).toBeInTheDocument()
      expect(separator).toHaveClass('bg-theme-border-primary')
    })

    test('renders horizontal separator by default', () => {
      render(<LegacySeparator data-testid="separator" />)

      const separator = screen.getByTestId('separator')
      expect(separator).toHaveClass('w-full', 'my-4')
    })

    test('renders vertical separator when specified', () => {
      render(<LegacySeparator type="vertical" data-testid="separator" />)

      const separator = screen.getByTestId('separator')
      expect(separator).toHaveClass('h-full', 'mx-4')
    })

    test('supports custom thickness', () => {
      render(<LegacySeparator thickness={2} data-testid="separator" />)

      const separator = screen.getByTestId('separator')
      expect(separator).toHaveClass('h-[2px]')
    })

    test('supports custom color', () => {
      render(<LegacySeparator color="bg-red-500" data-testid="separator" />)

      const separator = screen.getByTestId('separator')
      expect(separator).toHaveClass('bg-red-500')
    })

    test('supports custom margin', () => {
      render(<LegacySeparator margin="my-8" data-testid="separator" />)

      const separator = screen.getByTestId('separator')
      expect(separator).toHaveClass('my-8')
    })

    test('applies custom className', () => {
      render(
        <LegacySeparator className="custom-legacy" data-testid="separator" />
      )

      const separator = screen.getByTestId('separator')
      expect(separator).toHaveClass('custom-legacy')
    })
  })

  describe('Accessibility', () => {
    test('has proper ARIA attributes for decorative separator', () => {
      render(<Separator data-testid="separator" />)

      const separator = screen.getByTestId('separator')
      expect(separator).toHaveAttribute('role', 'none')
      expect(separator).toHaveAttribute('aria-orientation', 'horizontal')
    })

    test('has proper ARIA attributes for semantic separator', () => {
      render(<Separator decorative={false} data-testid="separator" />)

      const separator = screen.getByTestId('separator')
      expect(separator).toHaveAttribute('role', 'separator')
      expect(separator).toHaveAttribute('aria-orientation', 'horizontal')
    })

    test('maintains orientation attribute for vertical separators', () => {
      render(<Separator orientation="vertical" data-testid="separator" />)

      const separator = screen.getByTestId('separator')
      expect(separator).toHaveAttribute('aria-orientation', 'vertical')
    })

    test('section separator has proper heading structure', () => {
      render(<SectionSeparator title="Test Section" data-testid="separator" />)

      const heading = screen.getByText('Test Section')
      expect(heading.tagName).toBe('H3')
      expect(heading).toHaveClass('text-lg', 'font-semibold')
    })
  })
})

describe('Separator Integration', () => {
  test('works in list layouts', () => {
    const items = ['Item 1', 'Item 2', 'Item 3']

    render(
      <div data-testid="list">
        {items.map((item, index) => (
          <React.Fragment key={item}>
            <div>{item}</div>
            {index < items.length - 1 && (
              <Separator data-testid={`separator-${index}`} />
            )}
          </React.Fragment>
        ))}
      </div>
    )

    expect(screen.getByText('Item 1')).toBeInTheDocument()
    expect(screen.getByText('Item 2')).toBeInTheDocument()
    expect(screen.getByText('Item 3')).toBeInTheDocument()
    expect(screen.getByTestId('separator-0')).toBeInTheDocument()
    expect(screen.getByTestId('separator-1')).toBeInTheDocument()
  })

  test('works with breadcrumb navigation', () => {
    const breadcrumbs = ['Home', 'Category', 'Product']

    render(
      <nav data-testid="breadcrumbs" className="flex items-center">
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={crumb}>
            <span>{crumb}</span>
            {index < breadcrumbs.length - 1 && (
              <VerticalSeparator data-testid={`separator-${index}`} />
            )}
          </React.Fragment>
        ))}
      </nav>
    )

    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Category')).toBeInTheDocument()
    expect(screen.getByText('Product')).toBeInTheDocument()
    expect(screen.getByTestId('separator-0')).toBeInTheDocument()
    expect(screen.getByTestId('separator-1')).toBeInTheDocument()
  })

  test('works in form sections', () => {
    render(
      <form data-testid="form">
        <div>
          <label>Name</label>
          <input type="text" />
        </div>
        <SectionSeparator title="Contact Information" />
        <div>
          <label>Email</label>
          <input type="email" />
        </div>
        <div>
          <label>Phone</label>
          <input type="tel" />
        </div>
      </form>
    )

    expect(screen.getByText('Contact Information')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toBeInTheDocument()
    expect(screen.getByDisplayValue('')).toBeInTheDocument()
  })

  test('works with dynamic content', () => {
    const DynamicSeparator = () => {
      const [variant, setVariant] = React.useState<
        'default' | 'dashed' | 'gradient'
      >('default')

      return (
        <div>
          <button onClick={() => setVariant('dashed')}>Dashed</button>
          <button onClick={() => setVariant('gradient')}>Gradient</button>
          <EnhancedSeparator
            variant={variant}
            data-testid="dynamic-separator"
          />
        </div>
      )
    }

    render(<DynamicSeparator />)

    const separator = screen.getByTestId('dynamic-separator')
    expect(separator).toHaveClass('bg-theme-border-primary')
  })
})
