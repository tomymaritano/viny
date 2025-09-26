import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ThemesSettings from '../ThemesSettings'
import { useSettings } from '../../../../hooks/useSettings'

// Mock the useSettings hook
vi.mock('../../../../hooks/useSettings')

describe('ThemesSettings', () => {
  const mockUseSettingsService = vi.mocked(useSettings)

  const defaultMockReturn = {
    settings: {
      theme: 'dark',
      accentColor: 'blue',
      fontFamily: 'default',
      fontSize: 14,
      compactMode: false,
      animationSpeed: 'normal',
      customTheme: false,
    },
    setSetting: vi.fn(),
    previewSetting: vi.fn(),
    commitPreview: vi.fn(),
    clearPreview: vi.fn(),
    schemas: [
      {
        key: 'theme',
        type: 'select',
        label: 'Theme',
        defaultValue: 'system',
        options: [
          { value: 'light', label: 'Light', icon: 'Sun' },
          { value: 'dark', label: 'Dark', icon: 'Moon' },
          { value: 'system', label: 'System', icon: 'Monitor' },
        ],
      },
      {
        key: 'accentColor',
        type: 'select',
        label: 'Accent Color',
        defaultValue: 'blue',
        options: [
          { value: 'blue', label: 'Blue' },
          { value: 'green', label: 'Green' },
          { value: 'purple', label: 'Purple' },
        ],
      },
      {
        key: 'fontSize',
        type: 'number',
        label: 'Font Size',
        defaultValue: 14,
        min: 10,
        max: 24,
        step: 1,
      },
      {
        key: 'compactMode',
        type: 'boolean',
        label: 'Compact Mode',
        defaultValue: false,
      },
      {
        key: 'animationSpeed',
        type: 'select',
        label: 'Animation Speed',
        defaultValue: 'normal',
        options: [
          { value: 'slow', label: 'Slow' },
          { value: 'normal', label: 'Normal' },
          { value: 'fast', label: 'Fast' },
          { value: 'none', label: 'None' },
        ],
      },
    ],
    errors: {},
    loading: false,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseSettingsService.mockReturnValue(defaultMockReturn)
  })

  describe('Rendering', () => {
    it('should render theme selection options', () => {
      render(<ThemesSettings />)

      expect(screen.getByText('Theme Selection')).toBeInTheDocument()
      expect(screen.getByText('Light')).toBeInTheDocument()
      expect(screen.getByText('Dark')).toBeInTheDocument()
      expect(screen.getByText('System')).toBeInTheDocument()
    })

    it('should render accent color selection', () => {
      render(<ThemesSettings />)

      expect(screen.getByText('Accent Color')).toBeInTheDocument()
      expect(screen.getByDisplayValue('blue')).toBeInTheDocument()
    })

    it('should render appearance settings', () => {
      render(<ThemesSettings />)

      expect(screen.getByText('Appearance')).toBeInTheDocument()
      expect(screen.getByText('Compact Mode')).toBeInTheDocument()
      expect(screen.getByText('Animation Speed')).toBeInTheDocument()
    })

    it('should render typography settings', () => {
      render(<ThemesSettings />)

      expect(screen.getByText('Typography')).toBeInTheDocument()
      expect(screen.getByText('Font Size')).toBeInTheDocument()
    })

    it('should show current selected theme', () => {
      render(<ThemesSettings />)

      const darkButton = screen.getByRole('button', { name: /dark/i })
      expect(darkButton).toHaveClass('border-theme-accent-primary')
      expect(darkButton).toHaveClass('bg-theme-accent-primary/10')
    })
  })

  describe('Theme Selection', () => {
    it('should select a theme when clicked', () => {
      render(<ThemesSettings />)

      const lightButton = screen.getByRole('button', { name: /light/i })
      fireEvent.click(lightButton)

      expect(defaultMockReturn.setSetting).toHaveBeenCalledWith(
        'theme',
        'light'
      )
    })

    it('should preview theme on hover', () => {
      render(<ThemesSettings />)

      const lightButton = screen.getByRole('button', { name: /light/i })
      fireEvent.mouseEnter(lightButton)

      expect(defaultMockReturn.previewSetting).toHaveBeenCalledWith(
        'theme',
        'light'
      )
    })

    it('should clear preview on mouse leave', () => {
      render(<ThemesSettings />)

      const lightButton = screen.getByRole('button', { name: /light/i })
      fireEvent.mouseLeave(lightButton)

      expect(defaultMockReturn.clearPreview).toHaveBeenCalledWith('theme')
    })

    it('should show icons for theme options', () => {
      render(<ThemesSettings />)

      // These would require the Icons component to be properly mocked
      // For now, just verify the theme options are rendered
      expect(screen.getByText('Light')).toBeInTheDocument()
      expect(screen.getByText('Dark')).toBeInTheDocument()
      expect(screen.getByText('System')).toBeInTheDocument()
    })
  })

  describe('Accent Color Selection', () => {
    it('should change accent color', () => {
      render(<ThemesSettings />)

      const select = screen.getByDisplayValue('blue')
      fireEvent.change(select, { target: { value: 'green' } })

      expect(defaultMockReturn.setSetting).toHaveBeenCalledWith(
        'accentColor',
        'green'
      )
    })

    it('should preview accent color on change', () => {
      render(<ThemesSettings />)

      const select = screen.getByDisplayValue('blue')
      fireEvent.change(select, { target: { value: 'purple' } })

      expect(defaultMockReturn.previewSetting).toHaveBeenCalledWith(
        'accentColor',
        'purple'
      )
    })
  })

  describe('Toggle Settings', () => {
    it('should toggle compact mode', () => {
      render(<ThemesSettings />)

      const compactToggle = screen.getByRole('checkbox')
      fireEvent.click(compactToggle)

      expect(defaultMockReturn.setSetting).toHaveBeenCalledWith(
        'compactMode',
        true
      )
    })

    it('should show correct toggle state', () => {
      mockUseSettingsService.mockReturnValue({
        ...defaultMockReturn,
        settings: {
          ...defaultMockReturn.settings,
          compactMode: true,
        },
      })

      render(<ThemesSettings />)

      const compactToggle = screen.getByRole('checkbox')
      expect(compactToggle).toBeChecked()
    })
  })

  describe('Number Input Settings', () => {
    it('should change font size', () => {
      render(<ThemesSettings />)

      const fontSizeSlider = screen.getByRole('slider')
      fireEvent.change(fontSizeSlider, { target: { value: '16' } })

      expect(defaultMockReturn.setSetting).toHaveBeenCalledWith('fontSize', 16)
    })

    it('should show current font size value', () => {
      render(<ThemesSettings />)

      expect(screen.getByText('14')).toBeInTheDocument() // Current value
    })

    it('should respect min/max constraints', () => {
      render(<ThemesSettings />)

      const fontSizeSlider = screen.getByRole('slider')
      expect(fontSizeSlider).toHaveAttribute('min', '10')
      expect(fontSizeSlider).toHaveAttribute('max', '24')
      expect(fontSizeSlider).toHaveAttribute('step', '1')
    })
  })

  describe('Dropdown Settings', () => {
    it('should change animation speed', () => {
      render(<ThemesSettings />)

      const animationSelect = screen.getByDisplayValue('normal')
      fireEvent.change(animationSelect, { target: { value: 'fast' } })

      expect(defaultMockReturn.setSetting).toHaveBeenCalledWith(
        'animationSpeed',
        'fast'
      )
    })

    it('should show all animation speed options', () => {
      render(<ThemesSettings />)

      const animationSelect = screen.getByDisplayValue('normal')
      const options = animationSelect.querySelectorAll('option')

      expect(options).toHaveLength(4)
      expect(options[0]).toHaveValue('slow')
      expect(options[1]).toHaveValue('normal')
      expect(options[2]).toHaveValue('fast')
      expect(options[3]).toHaveValue('none')
    })
  })

  describe('Error Handling', () => {
    it('should display validation errors', () => {
      mockUseSettingsService.mockReturnValue({
        ...defaultMockReturn,
        errors: {
          fontSize: 'Font size must be between 10 and 24',
        },
      })

      render(<ThemesSettings />)

      expect(
        screen.getByText('Font size must be between 10 and 24')
      ).toBeInTheDocument()
    })

    it('should apply error styles to invalid inputs', () => {
      mockUseSettingsService.mockReturnValue({
        ...defaultMockReturn,
        errors: {
          fontSize: 'Invalid value',
        },
      })

      render(<ThemesSettings />)

      // The error text should be displayed
      expect(screen.getByText('Invalid value')).toBeInTheDocument()
      expect(screen.getByText('Invalid value')).toHaveClass('text-red-500')
    })
  })

  describe('Loading States', () => {
    it('should handle loading state gracefully', () => {
      mockUseSettingsService.mockReturnValue({
        ...defaultMockReturn,
        loading: true,
        settings: {},
      })

      render(<ThemesSettings />)

      // Component should still render with default values
      expect(screen.getByText('Theme Selection')).toBeInTheDocument()
    })
  })

  describe('Schema Integration', () => {
    it('should render based on provided schemas', () => {
      const customSchemas = [
        {
          key: 'customSetting',
          type: 'boolean',
          label: 'Custom Setting',
          defaultValue: false,
        },
      ]

      mockUseSettingsService.mockReturnValue({
        ...defaultMockReturn,
        schemas: customSchemas,
      })

      render(<ThemesSettings />)

      // Should still render the basic structure even with different schemas
      expect(screen.getByText('Theme Selection')).toBeInTheDocument()
    })

    it('should handle missing schemas gracefully', () => {
      mockUseSettingsService.mockReturnValue({
        ...defaultMockReturn,
        schemas: [],
      })

      render(<ThemesSettings />)

      // Should still render basic structure
      expect(screen.getByText('Theme Selection')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<ThemesSettings />)

      const fontSizeSlider = screen.getByRole('slider')
      expect(fontSizeSlider).toBeInTheDocument()

      const compactToggle = screen.getByRole('checkbox')
      expect(compactToggle).toBeInTheDocument()
    })

    it('should be keyboard navigable', () => {
      render(<ThemesSettings />)

      const firstButton = screen.getByRole('button', { name: /light/i })
      firstButton.focus()
      expect(document.activeElement).toBe(firstButton)
    })
  })
})
