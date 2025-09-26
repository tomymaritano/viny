/**
 * Comprehensive tests for SecurityValidator components
 * Tests validation wrapper, secure input, and secure textarea
 */

import React, { useState } from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  SecurityValidator,
  SecureInput,
  SecureTextarea,
} from '../SecurityValidator'
import { ServiceProvider } from '../../../services/ServiceProvider'
import type { SecurityService } from '../../../services/SecurityService'

// Mock SecurityService for testing
const mockSecurityService = {
  validateInput: vi.fn(),
  getSecurityMetrics: vi.fn(),
} as unknown as SecurityService

// Mock service provider with our mock security service
const TestServiceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <ServiceProvider services={{ securityService: mockSecurityService }}>
    {children}
  </ServiceProvider>
)

// Test component using SecurityValidator
const TestValidatorComponent: React.FC = () => {
  const [validationResult, setValidationResult] = useState<any>(null)

  return (
    <SecurityValidator>
      {({ validate, isSecure, violations }) => (
        <div>
          <div data-testid="security-status">
            Security: {isSecure ? 'Enabled' : 'Disabled'}
          </div>
          <div data-testid="violation-count">Violations: {violations}</div>
          <button
            data-testid="validate-button"
            onClick={() => {
              const result = validate('test input')
              setValidationResult(result)
            }}
          >
            Validate
          </button>
          {validationResult && (
            <div data-testid="validation-result">
              Valid: {validationResult.isValid.toString()}
            </div>
          )}
        </div>
      )}
    </SecurityValidator>
  )
}

// Test component using SecureInput
const TestSecureInputComponent: React.FC = () => {
  const [value, setValue] = useState('')
  const [validationResult, setValidationResult] = useState<any>(null)

  return (
    <div>
      <SecureInput
        data-testid="secure-input"
        value={value}
        onChange={e => setValue(e.target.value)}
        onValidationChange={setValidationResult}
        showValidationFeedback={true}
        validationType="text"
        maxLength={100}
      />
      <div data-testid="input-value">{value}</div>
      {validationResult && (
        <div data-testid="input-validation">
          Valid: {validationResult.isValid.toString()}
        </div>
      )}
    </div>
  )
}

// Test component using SecureTextarea
const TestSecureTextareaComponent: React.FC = () => {
  const [value, setValue] = useState('')
  const [validationResult, setValidationResult] = useState<any>(null)

  return (
    <div>
      <SecureTextarea
        data-testid="secure-textarea"
        value={value}
        onChange={e => setValue(e.target.value)}
        onValidationChange={setValidationResult}
        showValidationFeedback={true}
        validationType="html"
        maxLength={200}
      />
      <div data-testid="textarea-value">{value}</div>
      {validationResult && (
        <div data-testid="textarea-validation">
          Valid: {validationResult.isValid.toString()}
        </div>
      )}
    </div>
  )
}

describe('SecurityValidator', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Default mock implementations
    mockSecurityService.validateInput = vi.fn().mockReturnValue({
      isValid: true,
      errors: [],
      warnings: [],
    })

    mockSecurityService.getSecurityMetrics = vi.fn().mockReturnValue({
      cspEnabled: true,
      validationEnabled: true,
      violationCount: 0,
      violations: [],
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('SecurityValidator Wrapper', () => {
    it('should provide security context to children', () => {
      render(
        <TestServiceProvider>
          <TestValidatorComponent />
        </TestServiceProvider>
      )

      expect(screen.getByTestId('security-status')).toHaveTextContent(
        'Security: Enabled'
      )
      expect(screen.getByTestId('violation-count')).toHaveTextContent(
        'Violations: 0'
      )
    })

    it('should call validation service when validate is used', async () => {
      render(
        <TestServiceProvider>
          <TestValidatorComponent />
        </TestServiceProvider>
      )

      const validateButton = screen.getByTestId('validate-button')
      fireEvent.click(validateButton)

      expect(mockSecurityService.validateInput).toHaveBeenCalledWith(
        'test input',
        {}
      )
      expect(screen.getByTestId('validation-result')).toHaveTextContent(
        'Valid: true'
      )
    })

    it('should track validation violations', async () => {
      mockSecurityService.validateInput = vi.fn().mockReturnValue({
        isValid: false,
        errors: ['Test error'],
        warnings: [],
      })

      mockSecurityService.getSecurityMetrics = vi
        .fn()
        .mockReturnValueOnce({
          cspEnabled: true,
          validationEnabled: true,
          violationCount: 0,
          violations: [],
        })
        .mockReturnValueOnce({
          cspEnabled: true,
          validationEnabled: true,
          violationCount: 1,
          violations: [{ type: 'validation', timestamp: new Date() }],
        })

      render(
        <TestServiceProvider>
          <TestValidatorComponent />
        </TestServiceProvider>
      )

      const validateButton = screen.getByTestId('validate-button')
      fireEvent.click(validateButton)

      await waitFor(() => {
        expect(screen.getByTestId('violation-count')).toHaveTextContent(
          'Violations: 1'
        )
      })
    })

    it('should reflect security service configuration', () => {
      mockSecurityService.getSecurityMetrics = vi.fn().mockReturnValue({
        cspEnabled: false,
        validationEnabled: false,
        violationCount: 5,
        violations: [],
      })

      render(
        <TestServiceProvider>
          <TestValidatorComponent />
        </TestServiceProvider>
      )

      expect(screen.getByTestId('security-status')).toHaveTextContent(
        'Security: Disabled'
      )
      expect(screen.getByTestId('violation-count')).toHaveTextContent(
        'Violations: 5'
      )
    })
  })

  describe('SecureInput Component', () => {
    it('should render input with validation', () => {
      render(
        <TestServiceProvider>
          <TestSecureInputComponent />
        </TestServiceProvider>
      )

      const input = screen.getByTestId('secure-input')
      expect(input).toBeInTheDocument()
      expect(input).toHaveAttribute('maxLength', '100')
    })

    it('should validate input on change', async () => {
      const user = userEvent.setup()

      render(
        <TestServiceProvider>
          <TestSecureInputComponent />
        </TestServiceProvider>
      )

      const input = screen.getByTestId('secure-input')
      await user.type(input, 'test input')

      expect(mockSecurityService.validateInput).toHaveBeenCalledWith(
        'test input',
        {
          type: 'text',
          maxLength: 100,
        }
      )

      expect(screen.getByTestId('input-value')).toHaveTextContent('test input')
      expect(screen.getByTestId('input-validation')).toHaveTextContent(
        'Valid: true'
      )
    })

    it('should handle validation errors', async () => {
      const user = userEvent.setup()

      mockSecurityService.validateInput = vi.fn().mockReturnValue({
        isValid: false,
        errors: ['Input too long'],
        warnings: [],
      })

      render(
        <TestServiceProvider>
          <TestSecureInputComponent />
        </TestServiceProvider>
      )

      const input = screen.getByTestId('secure-input')
      await user.type(input, 'invalid input')

      expect(screen.getByTestId('input-validation')).toHaveTextContent(
        'Valid: false'
      )
      expect(screen.getByText('⚠️ Input too long')).toBeInTheDocument()
    })

    it('should handle validation warnings', async () => {
      const user = userEvent.setup()

      mockSecurityService.validateInput = vi.fn().mockReturnValue({
        isValid: true,
        errors: [],
        warnings: ['Input was sanitized'],
      })

      render(
        <TestServiceProvider>
          <TestSecureInputComponent />
        </TestServiceProvider>
      )

      const input = screen.getByTestId('secure-input')
      await user.type(input, 'warning input')

      expect(screen.getByText('⚡ Input was sanitized')).toBeInTheDocument()
    })

    it('should apply sanitized content when available', async () => {
      const user = userEvent.setup()

      mockSecurityService.validateInput = vi.fn().mockReturnValue({
        isValid: true,
        sanitized: 'sanitized content',
        errors: [],
        warnings: ['Content was sanitized'],
      })

      render(
        <TestServiceProvider>
          <TestSecureInputComponent />
        </TestServiceProvider>
      )

      const input = screen.getByTestId('secure-input')
      await user.type(input, 'unsafe content')

      expect(screen.getByTestId('input-value')).toHaveTextContent(
        'sanitized content'
      )
    })

    it('should show success message for valid input', async () => {
      const user = userEvent.setup()

      render(
        <TestServiceProvider>
          <TestSecureInputComponent />
        </TestServiceProvider>
      )

      const input = screen.getByTestId('secure-input')
      await user.type(input, 'safe input')

      expect(screen.getByText('✅ Input is secure')).toBeInTheDocument()
    })

    it('should apply appropriate CSS classes based on validation', async () => {
      const user = userEvent.setup()

      mockSecurityService.validateInput = vi.fn().mockReturnValue({
        isValid: false,
        errors: ['Validation failed'],
        warnings: [],
      })

      render(
        <TestServiceProvider>
          <TestSecureInputComponent />
        </TestServiceProvider>
      )

      const input = screen.getByTestId('secure-input')
      await user.type(input, 'invalid')

      expect(input).toHaveClass('border-red-500', 'focus:border-red-500')
    })

    it('should respect different validation types', async () => {
      const user = userEvent.setup()

      const EmailInputComponent = () => (
        <SecureInput
          data-testid="email-input"
          validationType="email"
          onChange={() => {}}
        />
      )

      render(
        <TestServiceProvider>
          <EmailInputComponent />
        </TestServiceProvider>
      )

      const input = screen.getByTestId('email-input')
      await user.type(input, 'test@example.com')

      expect(mockSecurityService.validateInput).toHaveBeenCalledWith(
        'test@example.com',
        {
          type: 'email',
          maxLength: 50000,
        }
      )
    })
  })

  describe('SecureTextarea Component', () => {
    it('should render textarea with validation', () => {
      render(
        <TestServiceProvider>
          <TestSecureTextareaComponent />
        </TestServiceProvider>
      )

      const textarea = screen.getByTestId('secure-textarea')
      expect(textarea).toBeInTheDocument()
      expect(textarea).toHaveAttribute('maxLength', '200')
    })

    it('should validate textarea content on change', async () => {
      const user = userEvent.setup()

      render(
        <TestServiceProvider>
          <TestSecureTextareaComponent />
        </TestServiceProvider>
      )

      const textarea = screen.getByTestId('secure-textarea')
      await user.type(textarea, '<p>HTML content</p>')

      expect(mockSecurityService.validateInput).toHaveBeenCalledWith(
        '<p>HTML content</p>',
        {
          type: 'html',
          maxLength: 200,
        }
      )

      expect(screen.getByTestId('textarea-value')).toHaveTextContent(
        '<p>HTML content</p>'
      )
      expect(screen.getByTestId('textarea-validation')).toHaveTextContent(
        'Valid: true'
      )
    })

    it('should handle HTML sanitization in textarea', async () => {
      const user = userEvent.setup()

      mockSecurityService.validateInput = vi.fn().mockReturnValue({
        isValid: true,
        sanitized: '<p>Safe HTML</p>',
        errors: [],
        warnings: ['HTML was sanitized'],
      })

      render(
        <TestServiceProvider>
          <TestSecureTextareaComponent />
        </TestServiceProvider>
      )

      const textarea = screen.getByTestId('secure-textarea')
      await user.type(textarea, '<script>alert("xss")</script><p>Content</p>')

      expect(screen.getByTestId('textarea-value')).toHaveTextContent(
        '<p>Safe HTML</p>'
      )
      expect(screen.getByText('⚡ HTML was sanitized')).toBeInTheDocument()
    })

    it('should display validation errors for textarea', async () => {
      const user = userEvent.setup()

      mockSecurityService.validateInput = vi.fn().mockReturnValue({
        isValid: false,
        errors: ['Content too long', 'Invalid HTML'],
        warnings: [],
      })

      render(
        <TestServiceProvider>
          <TestSecureTextareaComponent />
        </TestServiceProvider>
      )

      const textarea = screen.getByTestId('secure-textarea')
      await user.type(textarea, 'Very long invalid content...')

      expect(screen.getByText('⚠️ Content too long')).toBeInTheDocument()
      expect(screen.getByText('⚠️ Invalid HTML')).toBeInTheDocument()
      expect(screen.getByTestId('textarea-validation')).toHaveTextContent(
        'Valid: false'
      )
    })

    it('should apply error styling to textarea', async () => {
      const user = userEvent.setup()

      mockSecurityService.validateInput = vi.fn().mockReturnValue({
        isValid: false,
        errors: ['Validation error'],
        warnings: [],
      })

      render(
        <TestServiceProvider>
          <TestSecureTextareaComponent />
        </TestServiceProvider>
      )

      const textarea = screen.getByTestId('secure-textarea')
      await user.type(textarea, 'invalid content')

      expect(textarea).toHaveClass('border-red-500', 'focus:border-red-500')
    })

    it('should show success state for valid textarea content', async () => {
      const user = userEvent.setup()

      render(
        <TestServiceProvider>
          <TestSecureTextareaComponent />
        </TestServiceProvider>
      )

      const textarea = screen.getByTestId('secure-textarea')
      await user.type(textarea, '<p>Valid HTML content</p>')

      expect(screen.getByText('✅ Content is secure')).toBeInTheDocument()
    })
  })

  describe('Integration with SecurityService', () => {
    it('should pass validation options correctly', async () => {
      const user = userEvent.setup()

      const CustomValidationComponent = () => (
        <SecureInput
          data-testid="custom-input"
          validationType="url"
          maxLength={500}
          onChange={() => {}}
        />
      )

      render(
        <TestServiceProvider>
          <CustomValidationComponent />
        </TestServiceProvider>
      )

      const input = screen.getByTestId('custom-input')
      await user.type(input, 'https://example.com')

      expect(mockSecurityService.validateInput).toHaveBeenCalledWith(
        'https://example.com',
        {
          type: 'url',
          maxLength: 500,
        }
      )
    })

    it('should handle service errors gracefully', async () => {
      const user = userEvent.setup()

      mockSecurityService.validateInput = vi.fn().mockImplementation(() => {
        throw new Error('Service error')
      })

      // Mock console.error to prevent test noise
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      render(
        <TestServiceProvider>
          <TestSecureInputComponent />
        </TestServiceProvider>
      )

      const input = screen.getByTestId('secure-input')
      await user.type(input, 'test')

      // Should not crash the component
      expect(input).toBeInTheDocument()
      expect(screen.getByTestId('input-value')).toHaveTextContent('test')

      consoleSpy.mockRestore()
    })

    it('should work without showValidationFeedback', async () => {
      const user = userEvent.setup()

      const NoFeedbackComponent = () => (
        <SecureInput
          data-testid="no-feedback-input"
          showValidationFeedback={false}
          onChange={() => {}}
        />
      )

      render(
        <TestServiceProvider>
          <NoFeedbackComponent />
        </TestServiceProvider>
      )

      const input = screen.getByTestId('no-feedback-input')
      await user.type(input, 'test input')

      // Should not show validation feedback UI
      expect(screen.queryByText(/Input is secure/)).not.toBeInTheDocument()
      expect(screen.queryByText(/⚠️/)).not.toBeInTheDocument()
    })
  })

  describe('Performance and Edge Cases', () => {
    it('should handle rapid input changes efficiently', async () => {
      const user = userEvent.setup()

      render(
        <TestServiceProvider>
          <TestSecureInputComponent />
        </TestServiceProvider>
      )

      const input = screen.getByTestId('secure-input')

      // Rapid typing simulation
      await user.type(input, 'rapid', { delay: 1 })

      // Should not cause excessive validation calls due to debouncing
      // Note: In a real implementation, you might want to debounce validation
      expect(mockSecurityService.validateInput).toHaveBeenCalled()
    })

    it('should handle empty input gracefully', async () => {
      const user = userEvent.setup()

      render(
        <TestServiceProvider>
          <TestSecureInputComponent />
        </TestServiceProvider>
      )

      const input = screen.getByTestId('secure-input')
      await user.type(input, 'test')
      await user.clear(input)

      expect(mockSecurityService.validateInput).toHaveBeenCalledWith('', {
        type: 'text',
        maxLength: 100,
      })
    })

    it('should handle special characters properly', async () => {
      const user = userEvent.setup()

      render(
        <TestServiceProvider>
          <TestSecureInputComponent />
        </TestServiceProvider>
      )

      const input = screen.getByTestId('secure-input')
      const specialChars = '!@#$%^&*()_+{}[]|\\:";\'<>?,./'
      await user.type(input, specialChars)

      expect(mockSecurityService.validateInput).toHaveBeenCalledWith(
        specialChars,
        {
          type: 'text',
          maxLength: 100,
        }
      )
    })

    it('should handle unicode characters', async () => {
      const user = userEvent.setup()

      render(
        <TestServiceProvider>
          <TestSecureInputComponent />
        </TestServiceProvider>
      )

      const input = screen.getByTestId('secure-input')
      const unicodeText = '你好世界 🌍 Здравствуй мир'
      await user.type(input, unicodeText)

      expect(mockSecurityService.validateInput).toHaveBeenCalledWith(
        unicodeText,
        {
          type: 'text',
          maxLength: 100,
        }
      )
    })
  })
})
