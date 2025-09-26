import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import type { FieldValidation, ValidationResult } from '../utils/validation'

interface ValidationRule {
  validator: (value: any, ...args: any[]) => FieldValidation
  args?: any[]
  debounceMs?: number
}

interface UseAdvancedValidationOptions<T> {
  initialValues: T
  validationRules: Record<string, ValidationRule>
  validateOnChange?: boolean
  validateOnBlur?: boolean
  validateOnMount?: boolean
  debounceMs?: number
}

interface ValidationState {
  errors: Record<string, string>
  warnings: Record<string, string>
  isValidating: Record<string, boolean>
  touched: Record<string, boolean>
  validated: Record<string, boolean>
}

export function useAdvancedValidation<T extends Record<string, any>>({
  initialValues,
  validationRules,
  validateOnChange = true,
  validateOnBlur = true,
  validateOnMount = false,
  debounceMs = 300,
}: UseAdvancedValidationOptions<T>) {
  const [values, setValues] = useState<T>(initialValues)
  const [validationState, setValidationState] = useState<ValidationState>({
    errors: {},
    warnings: {},
    isValidating: {},
    touched: {},
    validated: {},
  })

  const debounceTimers = useRef<Record<string, NodeJS.Timeout>>({})

  // Clear debounce timers on unmount
  useEffect(() => {
    return () => {
      Object.values(debounceTimers.current).forEach(timer =>
        clearTimeout(timer)
      )
    }
  }, [])

  // Validate on mount if requested
  useEffect(() => {
    if (validateOnMount) {
      validateAllFields()
    }
  }, [validateOnMount])

  // Validate a single field with debouncing
  const validateField = useCallback(
    (fieldName: string, value: any, immediate = false) => {
      const rule = validationRules[fieldName]
      if (!rule) return

      // Clear existing timer
      if (debounceTimers.current[fieldName]) {
        clearTimeout(debounceTimers.current[fieldName])
      }

      const performValidation = () => {
        setValidationState(prev => ({
          ...prev,
          isValidating: { ...prev.isValidating, [fieldName]: true },
        }))

        const result = rule.validator(value, ...(rule.args || []))

        setValidationState(prev => ({
          ...prev,
          errors: {
            ...prev.errors,
            [fieldName]: result.error || '',
          },
          warnings: {
            ...prev.warnings,
            [fieldName]: result.warning || '',
          },
          isValidating: { ...prev.isValidating, [fieldName]: false },
          validated: { ...prev.validated, [fieldName]: true },
        }))

        return result
      }

      if (immediate) {
        return performValidation()
      } else {
        const delay = rule.debounceMs ?? debounceMs
        debounceTimers.current[fieldName] = setTimeout(performValidation, delay)
      }
    },
    [validationRules, debounceMs]
  )

  // Validate all fields
  const validateAllFields = useCallback((): ValidationResult => {
    const errors: string[] = []
    const warnings: string[] = []
    const newErrors: Record<string, string> = {}
    const newWarnings: Record<string, string> = {}
    const newValidated: Record<string, boolean> = {}

    Object.keys(validationRules).forEach(fieldName => {
      const rule = validationRules[fieldName]
      const result = rule.validator(values[fieldName], ...(rule.args || []))

      newValidated[fieldName] = true

      if (!result.isValid && result.error) {
        errors.push(result.error)
        newErrors[fieldName] = result.error
      } else {
        newErrors[fieldName] = ''
      }

      if (result.warning) {
        warnings.push(result.warning)
        newWarnings[fieldName] = result.warning
      } else {
        newWarnings[fieldName] = ''
      }
    })

    setValidationState(prev => ({
      ...prev,
      errors: newErrors,
      warnings: newWarnings,
      validated: newValidated,
      isValidating: Object.keys(validationRules).reduce(
        (acc, key) => ({ ...acc, [key]: false }),
        {}
      ),
    }))

    return {
      isValid: errors.length === 0,
      errors,
      warnings: warnings.length > 0 ? warnings : undefined,
    }
  }, [values, validationRules])

  // Handle field value change
  const handleFieldChange = useCallback(
    (fieldName: string, value: any) => {
      setValues(prev => ({ ...prev, [fieldName]: value }))

      if (validateOnChange) {
        validateField(fieldName, value)
      }
    },
    [validateField, validateOnChange]
  )

  // Handle field blur
  const handleFieldBlur = useCallback(
    (fieldName: string) => {
      setValidationState(prev => ({
        ...prev,
        touched: { ...prev.touched, [fieldName]: true },
      }))

      if (validateOnBlur) {
        validateField(fieldName, values[fieldName], true) // Immediate validation on blur
      }
    },
    [validateField, validateOnBlur, values]
  )

  // Reset form
  const resetForm = useCallback(() => {
    setValues(initialValues)
    setValidationState({
      errors: {},
      warnings: {},
      isValidating: {},
      touched: {},
      validated: {},
    })

    // Clear all debounce timers
    Object.values(debounceTimers.current).forEach(timer => clearTimeout(timer))
    debounceTimers.current = {}
  }, [initialValues])

  // Check if form is valid
  const isValid = useMemo(() => {
    return Object.keys(validationState.errors).every(
      key => !validationState.errors[key]
    )
  }, [validationState.errors])

  // Check if form has been modified
  const isDirty = useMemo(() => {
    return JSON.stringify(values) !== JSON.stringify(initialValues)
  }, [values, initialValues])

  // Check if any field is currently validating
  const isValidating = useMemo(() => {
    return Object.values(validationState.isValidating).some(Boolean)
  }, [validationState.isValidating])

  // Get field props for easy integration
  const getFieldProps = useCallback(
    (fieldName: string) => ({
      value: values[fieldName] || '',
      onChange: (value: any) => handleFieldChange(fieldName, value),
      onBlur: () => handleFieldBlur(fieldName),
      error: validationState.touched[fieldName]
        ? validationState.errors[fieldName]
        : undefined,
      warning: validationState.touched[fieldName]
        ? validationState.warnings[fieldName]
        : undefined,
      isValid: validationState.touched[fieldName]
        ? !validationState.errors[fieldName]
        : undefined,
      isValidating: validationState.isValidating[fieldName] || false,
    }),
    [values, handleFieldChange, handleFieldBlur, validationState]
  )

  // Get validation summary
  const getValidationSummary = useCallback(() => {
    const touchedErrors = Object.keys(validationState.errors)
      .filter(
        key => validationState.touched[key] && validationState.errors[key]
      )
      .map(key => validationState.errors[key])

    const touchedWarnings = Object.keys(validationState.warnings)
      .filter(
        key => validationState.touched[key] && validationState.warnings[key]
      )
      .map(key => validationState.warnings[key])

    return {
      hasErrors: touchedErrors.length > 0,
      hasWarnings: touchedWarnings.length > 0,
      errorCount: touchedErrors.length,
      warningCount: touchedWarnings.length,
      errors: touchedErrors,
      warnings: touchedWarnings,
    }
  }, [validationState])

  return {
    // State
    values,
    errors: validationState.errors,
    warnings: validationState.warnings,
    touched: validationState.touched,
    validated: validationState.validated,
    isValidating,
    isValid,
    isDirty,

    // Actions
    validateField,
    validateAllFields,
    handleFieldChange,
    handleFieldBlur,
    resetForm,
    getFieldProps,
    getValidationSummary,

    // Utilities
    setValues,
    setErrors: (errors: Record<string, string>) =>
      setValidationState(prev => ({ ...prev, errors })),
    setWarnings: (warnings: Record<string, string>) =>
      setValidationState(prev => ({ ...prev, warnings })),
  }
}
