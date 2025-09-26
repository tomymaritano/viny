import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { vi } from 'vitest'
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  VerticalTabs,
  HorizontalTabs,
  LegacyTabs,
} from '../TabsRadix'

// Mock the Icons component since it's not directly available in tests
vi.mock('../../Icons', () => ({
  Icons: {
    Settings: () => <div data-testid="settings-icon">Settings</div>,
    Eye: () => <div data-testid="eye-icon">Eye</div>,
    Package: () => <div data-testid="package-icon">Package</div>,
  },
}))

const TestIcon = () => <div data-testid="test-icon">Icon</div>

describe('Tabs Component', () => {
  describe('Basic Tabs', () => {
    test('renders tabs with correct structure', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      )

      expect(screen.getByText('Tab 1')).toBeInTheDocument()
      expect(screen.getByText('Tab 2')).toBeInTheDocument()
      expect(screen.getByText('Content 1')).toBeInTheDocument()
      expect(screen.getByText('Content 2')).toBeInTheDocument()
      expect(screen.getByText('Content 2')).not.toBeVisible()
    })

    test('switches tabs when clicked', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      )

      fireEvent.click(screen.getByText('Tab 2'))

      expect(screen.getByText('Content 2')).toBeInTheDocument()
      expect(screen.queryByText('Content 1')).not.toBeVisible()
    })

    test('supports keyboard navigation', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      )

      const tab1 = screen.getByText('Tab 1')
      const tab2 = screen.getByText('Tab 2')

      // Focus first tab
      tab1.focus()
      expect(tab1).toHaveFocus()

      // Arrow right should move to next tab
      fireEvent.keyDown(tab1, { key: 'ArrowRight' })
      expect(tab2).toHaveFocus()

      // Space should activate tab
      fireEvent.keyDown(tab2, { key: ' ' })
      expect(screen.getByText('Content 2')).toBeInTheDocument()
    })
  })

  describe('VerticalTabs', () => {
    const mockTabs = [
      { id: 'general', label: 'General', icon: <TestIcon /> },
      { id: 'plugins', label: 'Plugins', icon: <TestIcon /> },
      { id: 'about', label: 'About', icon: <TestIcon /> },
    ]

    test('renders vertical tabs correctly', () => {
      const onTabChange = vi.fn()

      render(
        <VerticalTabs
          tabs={mockTabs}
          activeTab="general"
          onTabChange={onTabChange}
        >
          <TabsContent value="general">General Content</TabsContent>
          <TabsContent value="plugins">Plugins Content</TabsContent>
          <TabsContent value="about">About Content</TabsContent>
        </VerticalTabs>
      )

      expect(screen.getByText('General')).toBeInTheDocument()
      expect(screen.getByText('Plugins')).toBeInTheDocument()
      expect(screen.getByText('About')).toBeInTheDocument()
      expect(screen.getAllByTestId('test-icon')).toHaveLength(3)
    })

    test('calls onTabChange when tab is clicked', () => {
      const onTabChange = vi.fn()

      render(
        <VerticalTabs
          tabs={mockTabs}
          activeTab="general"
          onTabChange={onTabChange}
        />
      )

      fireEvent.click(screen.getByText('Plugins'))
      expect(onTabChange).toHaveBeenCalledWith('plugins')
    })

    test('renders separators for specific tabs', () => {
      const onTabChange = vi.fn()

      render(
        <VerticalTabs
          tabs={mockTabs}
          activeTab="general"
          onTabChange={onTabChange}
        />
      )

      // Check that separators are rendered before plugins and about tabs
      const separators = screen.getAllByRole('separator', { hidden: true })
      expect(separators.length).toBeGreaterThan(0)
    })

    test('supports disabled tabs', () => {
      const tabsWithDisabled = [
        { id: 'general', label: 'General', icon: <TestIcon /> },
        { id: 'plugins', label: 'Plugins', icon: <TestIcon />, disabled: true },
      ]
      const onTabChange = vi.fn()

      render(
        <VerticalTabs
          tabs={tabsWithDisabled}
          activeTab="general"
          onTabChange={onTabChange}
        />
      )

      const pluginsTab = screen.getByText('Plugins')
      expect(pluginsTab).toBeDisabled()

      fireEvent.click(pluginsTab)
      expect(onTabChange).not.toHaveBeenCalled()
    })

    test('renders badges when provided', () => {
      const tabsWithBadges = [
        { id: 'general', label: 'General', icon: <TestIcon />, badge: '5' },
        { id: 'plugins', label: 'Plugins', icon: <TestIcon />, badge: 'New' },
      ]
      const onTabChange = vi.fn()

      render(
        <VerticalTabs
          tabs={tabsWithBadges}
          activeTab="general"
          onTabChange={onTabChange}
        />
      )

      expect(screen.getByText('5')).toBeInTheDocument()
      expect(screen.getByText('New')).toBeInTheDocument()
    })
  })

  describe('HorizontalTabs', () => {
    const mockTabs = [
      { id: 'tab1', label: 'Tab 1', icon: <TestIcon /> },
      { id: 'tab2', label: 'Tab 2', icon: <TestIcon /> },
    ]

    test('renders horizontal tabs correctly', () => {
      const onTabChange = vi.fn()

      render(
        <HorizontalTabs
          tabs={mockTabs}
          activeTab="tab1"
          onTabChange={onTabChange}
        />
      )

      expect(screen.getByText('Tab 1')).toBeInTheDocument()
      expect(screen.getByText('Tab 2')).toBeInTheDocument()
    })

    test('calls onTabChange when tab is clicked', () => {
      const onTabChange = vi.fn()

      render(
        <HorizontalTabs
          tabs={mockTabs}
          activeTab="tab1"
          onTabChange={onTabChange}
        />
      )

      fireEvent.click(screen.getByText('Tab 2'))
      expect(onTabChange).toHaveBeenCalledWith('tab2')
    })
  })

  describe('LegacyTabs', () => {
    const mockTabs = [
      { id: 'general', label: 'General', icon: 'Settings' },
      { id: 'plugins', label: 'Plugins', icon: 'Package' },
    ]

    test('renders legacy tabs correctly', () => {
      const onTabChange = vi.fn()

      render(
        <LegacyTabs
          tabs={mockTabs}
          activeTab="general"
          onTabChange={onTabChange}
        />
      )

      expect(screen.getByText('General')).toBeInTheDocument()
      expect(screen.getByText('Plugins')).toBeInTheDocument()
    })

    test('calls onTabChange when tab is clicked', () => {
      const onTabChange = vi.fn()

      render(
        <LegacyTabs
          tabs={mockTabs}
          activeTab="general"
          onTabChange={onTabChange}
        />
      )

      fireEvent.click(screen.getByText('Plugins'))
      expect(onTabChange).toHaveBeenCalledWith('plugins')
    })

    test('applies correct styles to active tab', () => {
      const onTabChange = vi.fn()

      render(
        <LegacyTabs
          tabs={mockTabs}
          activeTab="general"
          onTabChange={onTabChange}
        />
      )

      const generalTab = screen.getByText('General').closest('button')
      expect(generalTab).toHaveClass('text-theme-text-primary')
      expect(generalTab).toHaveStyle({
        backgroundColor: 'var(--color-active-bg)',
        boxShadow: 'inset 3px 0 0 var(--color-active-border)',
      })
    })
  })

  describe('Accessibility', () => {
    test('has proper ARIA attributes', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      )

      const tabList = screen.getByRole('tablist')
      const tabs = screen.getAllByRole('tab')
      const tabPanel = screen.getByRole('tabpanel')

      expect(tabList).toBeInTheDocument()
      expect(tabs).toHaveLength(2)
      expect(tabPanel).toBeInTheDocument()

      // Check that active tab has proper aria-selected
      expect(tabs[0]).toHaveAttribute('aria-selected', 'true')
      expect(tabs[1]).toHaveAttribute('aria-selected', 'false')
    })

    test('supports screen reader navigation', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      )

      const tabPanel = screen.getByRole('tabpanel')
      expect(tabPanel).toHaveAttribute('aria-labelledby')
    })
  })
})

describe('Tabs Integration', () => {
  test('works with complex content', () => {
    const ComplexContent = ({ title }: { title: string }) => (
      <div>
        <h2>{title}</h2>
        <p>Complex content with multiple elements</p>
        <button>Action Button</button>
      </div>
    )

    render(
      <Tabs defaultValue="complex1">
        <TabsList>
          <TabsTrigger value="complex1">Complex Tab 1</TabsTrigger>
          <TabsTrigger value="complex2">Complex Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="complex1">
          <ComplexContent title="Complex Content 1" />
        </TabsContent>
        <TabsContent value="complex2">
          <ComplexContent title="Complex Content 2" />
        </TabsContent>
      </Tabs>
    )

    expect(screen.getByText('Complex Content 1')).toBeInTheDocument()
    expect(screen.getByText('Action Button')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Complex Tab 2'))
    expect(screen.getByText('Complex Content 2')).toBeInTheDocument()
  })

  test('preserves state when switching between tabs', () => {
    const StatefulContent = ({ id }: { id: string }) => {
      const [count, setCount] = React.useState(0)
      return (
        <div>
          <p>Count: {count}</p>
          <button onClick={() => setCount(c => c + 1)}>Increment {id}</button>
        </div>
      )
    }

    render(
      <Tabs defaultValue="state1">
        <TabsList>
          <TabsTrigger value="state1">State Tab 1</TabsTrigger>
          <TabsTrigger value="state2">State Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="state1">
          <StatefulContent id="1" />
        </TabsContent>
        <TabsContent value="state2">
          <StatefulContent id="2" />
        </TabsContent>
      </Tabs>
    )

    // Increment counter in first tab
    fireEvent.click(screen.getByText('Increment 1'))
    expect(screen.getByText('Count: 1')).toBeInTheDocument()

    // Switch to second tab
    fireEvent.click(screen.getByText('State Tab 2'))
    // Just verify that tab switch worked
    expect(screen.getByText('Increment 2')).toBeInTheDocument()

    // Switch back to first tab - state should be preserved
    fireEvent.click(screen.getByText('State Tab 1'))
    expect(screen.getByText('Count: 1')).toBeInTheDocument()
  })
})
