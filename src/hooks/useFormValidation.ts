import { useState, useCallback, useMemo } from 'react'
import type { FieldValidation } from '../utils/validation'
import { ValidationResult, validateForm } from '../utils/validation'

interface UseFormValidationOptions<T> {
  initialValues: T
  validationRules: Record<
    string,
    (value: any, ...args: any[]) => FieldValidation
  >
  validateOnChange?: boolean
  validateOnBlur?: boolean
}

export function useFormValidation<T extends Record<string, any>>({
  initialValues,
  validationRules,
  validateOnChange = true,
  validateOnBlur = true,
}: UseFormValidationOptions<T>) {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [warnings, setWarnings] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [isValidating, setIsValidating] = useState(false)

  // Validate a single field
  const validateField = useCallback(
    (fieldName: string, value: any): FieldValidation => {
      const validator = validationRules[fieldName]
      if (!validator)
        return {
          field: fieldName,
          value,
          isValid: true,
          error: undefined,
          warning: undefined,
        }

      const result = validator(value)
      return result
    },
    [validationRules]
  )

  // Validate all fields
  const validateAllFields = useCallback(() => {
    setIsValidating(true)
    const result = validateForm(values, validationRules)

    const newErrors: Record<string, string> = {}
    const newWarnings: Record<string, string> = {}

    // Process individual field validations
    Object.keys(validationRules).forEach(fieldName => {
      const fieldResult = validateField(fieldName, values[fieldName])
      if (!fieldResult.isValid && fieldResult.error) {
        newErrors[fieldName] = fieldResult.error
      }
      if (fieldResult.warning) {
        newWarnings[fieldName] = fieldResult.warning
      }
    })

    setErrors(newErrors)
    setWarnings(newWarnings)
    setIsValidating(false)

    return result
  }, [values, validationRules, validateField])

  // Handle field value change
  const handleFieldChange = useCallback(
    (fieldName: string, value: any) => {
      setValues(prev => ({ ...prev, [fieldName]: value }))

      if (validateOnChange) {
        const result = validateField(fieldName, value)

        setErrors(prev => ({
          ...prev,
          [fieldName]: result.error || '',
        }))

        setWarnings(prev => ({
          ...prev,
          [fieldName]: result.warning || '',
        }))
      }
    },
    [validateField, validateOnChange]
  )

  // Handle field blur
  const handleFieldBlur = useCallback(
    (fieldName: string) => {
      setTouched(prev => ({ ...prev, [fieldName]: true }))

      if (validateOnBlur) {
        const result = validateField(fieldName, values[fieldName])

        setErrors(prev => ({
          ...prev,
          [fieldName]: result.error || '',
        }))

        setWarnings(prev => ({
          ...prev,
          [fieldName]: result.warning || '',
        }))
      }
    },
    [validateField, validateOnBlur, values]
  )

  // Reset form
  const resetForm = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setWarnings({})
    setTouched({})
    setIsValidating(false)
  }, [initialValues])

  // Check if form is valid
  const isValid = useMemo(() => {
    return Object.keys(errors).every(key => !errors[key])
  }, [errors])

  // Check if form has been modified
  const isDirty = useMemo(() => {
    return JSON.stringify(values) !== JSON.stringify(initialValues)
  }, [values, initialValues])

  // Get field props for easy integration
  const getFieldProps = useCallback(
    (fieldName: string) => ({
      value: values[fieldName] || '',
      onChange: (value: any) => handleFieldChange(fieldName, value),
      onBlur: () => handleFieldBlur(fieldName),
      error: touched[fieldName] ? errors[fieldName] : undefined,
      warning: touched[fieldName] ? warnings[fieldName] : undefined,
      isValid: touched[fieldName] ? !errors[fieldName] : undefined,
    }),
    [values, handleFieldChange, handleFieldBlur, errors, warnings, touched]
  )

  return {
    // State
    values,
    errors,
    warnings,
    touched,
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

    // Utilities
    setValues,
    setErrors,
    setWarnings,
  }
}
