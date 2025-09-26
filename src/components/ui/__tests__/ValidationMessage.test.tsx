import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ValidationMessage from '../ValidationMessage'

describe('ValidationMessage', () => {
  describe('Error messages', () => {
    it('should render error message correctly', () => {
      render(
        <ValidationMessage type="error" message="This field is required" />
      )

      expect(screen.getByText('This field is required')).toBeInTheDocument()
      const icon = document.querySelector('svg')
      expect(icon).toBeInTheDocument() // Icon
    })

    it('should apply error styling', () => {
      render(<ValidationMessage type="error" message="Error message" />)

      const message = screen.getByText('Error message')
      expect(message).toHaveClass('text-red-600', 'dark:text-red-400')
    })
  })

  describe('Warning messages', () => {
    it('should render warning message correctly', () => {
      render(
        <ValidationMessage type="warning" message="This might cause issues" />
      )

      expect(screen.getByText('This might cause issues')).toBeInTheDocument()
    })

    it('should apply warning styling', () => {
      render(<ValidationMessage type="warning" message="Warning message" />)

      const message = screen.getByText('Warning message')
      expect(message).toHaveClass('text-yellow-600', 'dark:text-yellow-400')
    })
  })

  describe('Success messages', () => {
    it('should render success message correctly', () => {
      render(<ValidationMessage type="success" message="All good!" />)

      expect(screen.getByText('All good!')).toBeInTheDocument()
    })

    it('should apply success styling', () => {
      render(<ValidationMessage type="success" message="Success message" />)

      const message = screen.getByText('Success message')
      expect(message).toHaveClass('text-green-600', 'dark:text-green-400')
    })
  })

  describe('Custom styling', () => {
    it('should apply custom className', () => {
      render(
        <ValidationMessage
          type="error"
          message="Custom message"
          className="custom-class"
        />
      )

      const container = screen.getByText('Custom message').closest('div')
      expect(container).toHaveClass('custom-class')
    })
  })

  describe('Icons', () => {
    it('should display correct icon for each type', () => {
      const { rerender } = render(
        <ValidationMessage type="error" message="Error" />
      )

      // Test error icon (AlertCircle)
      let icon = document.querySelector('svg')
      expect(icon).toHaveClass('text-red-500')

      // Test warning icon (AlertTriangle)
      rerender(<ValidationMessage type="warning" message="Warning" />)
      icon = document.querySelector('svg')
      expect(icon).toHaveClass('text-yellow-500')

      // Test success icon (CheckCircle)
      rerender(<ValidationMessage type="success" message="Success" />)
      icon = document.querySelector('svg')
      expect(icon).toHaveClass('text-green-500')
    })
  })

  describe('Layout', () => {
    it('should have correct layout structure', () => {
      render(<ValidationMessage type="error" message="Test message" />)

      const container = screen.getByText('Test message').closest('div')
      expect(container).toHaveClass('flex', 'items-center', 'gap-2')
    })

    it('should have correct text size', () => {
      render(<ValidationMessage type="error" message="Test message" />)

      const container = screen.getByText('Test message').closest('div')
      expect(container).toHaveClass('text-sm')
    })
  })

  describe('Accessibility', () => {
    it('should have proper semantic structure', () => {
      render(<ValidationMessage type="error" message="Accessibility test" />)

      // Should have an icon and text
      expect(document.querySelector('svg')).toBeInTheDocument()
      expect(screen.getByText('Accessibility test')).toBeInTheDocument()
    })

    it('should maintain proper color contrast classes', () => {
      render(<ValidationMessage type="error" message="Contrast test" />)

      const message = screen.getByText('Contrast test')
      // Should have both light and dark mode classes for proper contrast
      expect(message).toHaveClass('text-red-600')
      expect(message).toHaveClass('dark:text-red-400')
    })
  })

  describe('Edge cases', () => {
    it('should handle empty message gracefully', () => {
      render(<ValidationMessage type="error" message="" />)

      // Should still render the icon
      expect(document.querySelector('svg')).toBeInTheDocument()
    })

    it('should handle very long messages', () => {
      const longMessage =
        'This is a very long error message that might wrap to multiple lines and should still be displayed correctly without breaking the layout or causing any visual issues'

      render(<ValidationMessage type="error" message={longMessage} />)

      expect(screen.getByText(longMessage)).toBeInTheDocument()
    })

    it('should handle special characters in messages', () => {
      const specialMessage =
        'Error: <script>alert("xss")</script> & "quotes" & \'apostrophes\''

      render(<ValidationMessage type="error" message={specialMessage} />)

      expect(screen.getByText(specialMessage)).toBeInTheDocument()
    })
  })
})
