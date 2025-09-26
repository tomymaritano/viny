/**
 * Security Validator Component
 * Real-time input validation with security enforcement
 */

import React, { useState, useCallback, useMemo } from 'react'
import { useServices } from '../../services/ServiceProvider'
import type { ValidationResult } from '../../services/SecurityService'

interface SecurityValidatorProps {
  children: (props: {
    validate: (input: string, options?: ValidationOptions) => ValidationResult
    isSecure: boolean
    violations: number
  }) => React.ReactNode
}

interface ValidationOptions {
  type?: 'text' | 'html' | 'url' | 'email'
  maxLength?: number
  allowedTags?: string[]
  stripTags?: boolean
}

export const SecurityValidator: React.FC<SecurityValidatorProps> = ({
  children,
}) => {
  const { securityService } = useServices()
  const [violationCount, setViolationCount] = useState(0)

  const validate = useCallback(
    (input: string, options: ValidationOptions = {}) => {
      const result = securityService.validateInput(input, options)

      if (!result.isValid) {
        setViolationCount(prev => prev + 1)
      }

      return result
    },
    [securityService]
  )

  const securityMetrics = useMemo(() => {
    return securityService.getSecurityMetrics()
  }, [securityService, violationCount])

  const isSecure =
    securityMetrics.cspEnabled && securityMetrics.validationEnabled

  return (
    <>
      {children({
        validate,
        isSecure,
        violations: securityMetrics.violationCount,
      })}
    </>
  )
}

/**
 * Secure Input Component with built-in validation
 */
interface SecureInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  validationType?: 'text' | 'html' | 'url' | 'email'
  maxLength?: number
  onValidationChange?: (result: ValidationResult) => void
  showValidationFeedback?: boolean
}

export const SecureInput: React.FC<SecureInputProps> = ({
  validationType = 'text',
  maxLength = 50000,
  onValidationChange,
  showValidationFeedback = false,
  onChange,
  className = '',
  ...props
}) => {
  const { securityService } = useServices()
  const [validationResult, setValidationResult] =
    useState<ValidationResult | null>(null)

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value

      const result = securityService.validateInput(value, {
        type: validationType,
        maxLength,
      })

      setValidationResult(result)
      onValidationChange?.(result)

      // Update the input value with sanitized content if available
      if (result.sanitized && result.sanitized !== value) {
        e.target.value = result.sanitized
      }

      onChange?.(e)
    },
    [securityService, validationType, maxLength, onValidationChange, onChange]
  )

  const inputClassName = `${className} ${
    validationResult && !validationResult.isValid
      ? 'border-red-500 focus:border-red-500'
      : 'border-gray-300 focus:border-blue-500'
  }`

  return (
    <div className="relative">
      <input
        {...props}
        onChange={handleChange}
        className={inputClassName}
        maxLength={maxLength}
      />

      {showValidationFeedback && validationResult && (
        <div className="mt-1 text-sm">
          {validationResult.errors.length > 0 && (
            <div className="text-red-600">
              {validationResult.errors.map((error, index) => (
                <div key={index}>⚠️ {error}</div>
              ))}
            </div>
          )}

          {validationResult.warnings.length > 0 && (
            <div className="text-yellow-600">
              {validationResult.warnings.map((warning, index) => (
                <div key={index}>⚡ {warning}</div>
              ))}
            </div>
          )}

          {validationResult.isValid && (
            <div className="text-green-600">✅ Input is secure</div>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * Secure Textarea Component with built-in validation
 */
interface SecureTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  validationType?: 'text' | 'html'
  maxLength?: number
  onValidationChange?: (result: ValidationResult) => void
  showValidationFeedback?: boolean
}

export const SecureTextarea: React.FC<SecureTextareaProps> = ({
  validationType = 'text',
  maxLength = 50000,
  onValidationChange,
  showValidationFeedback = false,
  onChange,
  className = '',
  ...props
}) => {
  const { securityService } = useServices()
  const [validationResult, setValidationResult] =
    useState<ValidationResult | null>(null)

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value

      const result = securityService.validateInput(value, {
        type: validationType,
        maxLength,
      })

      setValidationResult(result)
      onValidationChange?.(result)

      // Update the textarea value with sanitized content if available
      if (result.sanitized && result.sanitized !== value) {
        e.target.value = result.sanitized
      }

      onChange?.(e)
    },
    [securityService, validationType, maxLength, onValidationChange, onChange]
  )

  const textareaClassName = `${className} ${
    validationResult && !validationResult.isValid
      ? 'border-red-500 focus:border-red-500'
      : 'border-gray-300 focus:border-blue-500'
  }`

  return (
    <div className="relative">
      <textarea
        {...props}
        onChange={handleChange}
        className={textareaClassName}
        maxLength={maxLength}
      />

      {showValidationFeedback && validationResult && (
        <div className="mt-1 text-sm">
          {validationResult.errors.length > 0 && (
            <div className="text-red-600">
              {validationResult.errors.map((error, index) => (
                <div key={index}>⚠️ {error}</div>
              ))}
            </div>
          )}

          {validationResult.warnings.length > 0 && (
            <div className="text-yellow-600">
              {validationResult.warnings.map((warning, index) => (
                <div key={index}>⚡ {warning}</div>
              ))}
            </div>
          )}

          {validationResult.isValid && (
            <div className="text-green-600">✅ Content is secure</div>
          )}
        </div>
      )}
    </div>
  )
}
