import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useFormValidation } from '../useFormValidation'
import { ValidationRules } from '../../utils/validation'

describe('useFormValidation', () => {
  const initialValues = {
    name: '',
    email: '',
    age: 0,
  }

  const validationRules = {
    name: (value: string) => ValidationRules.required(value, 'name'),
    email: (value: string) => ValidationRules.email(value, 'email'),
    age: (value: number) => ValidationRules.range(value, 1, 120, 'age'),
  }

  describe('Initial state', () => {
    it('should initialize with correct values', () => {
      const { result } = renderHook(() =>
        useFormValidation({
          initialValues,
          validationRules,
          validateOnChange: false,
          validateOnBlur: false,
        })
      )

      expect(result.current.values).toEqual(initialValues)
      expect(result.current.errors).toEqual({})
      expect(result.current.warnings).toEqual({})
      expect(result.current.touched).toEqual({})
      expect(result.current.isValidating).toBe(false)
      expect(result.current.isValid).toBe(true)
      expect(result.current.isDirty).toBe(false)
    })
  })

  describe('Field changes', () => {
    it('should update field values', () => {
      const { result } = renderHook(() =>
        useFormValidation({
          initialValues,
          validationRules,
          validateOnChange: false,
        })
      )

      act(() => {
        result.current.handleFieldChange('name', 'John Doe')
      })

      expect(result.current.values.name).toBe('John Doe')
      expect(result.current.isDirty).toBe(true)
    })

    it('should validate on change when enabled', () => {
      const { result } = renderHook(() =>
        useFormValidation({
          initialValues,
          validationRules,
          validateOnChange: true,
        })
      )

      act(() => {
        result.current.handleFieldChange('name', '')
      })

      expect(result.current.errors.name).toBe('name is required')
      expect(result.current.isValid).toBe(false)
    })

    it('should not validate on change when disabled', () => {
      const { result } = renderHook(() =>
        useFormValidation({
          initialValues,
          validationRules,
          validateOnChange: false,
        })
      )

      act(() => {
        result.current.handleFieldChange('name', '')
      })

      expect(result.current.errors.name).toBeUndefined()
    })

    it('should clear errors when field becomes valid', () => {
      const { result } = renderHook(() =>
        useFormValidation({
          initialValues,
          validationRules,
          validateOnChange: true,
        })
      )

      // Set invalid value
      act(() => {
        result.current.handleFieldChange('name', '')
      })

      expect(result.current.errors.name).toBe('name is required')

      // Set valid value
      act(() => {
        result.current.handleFieldChange('name', 'John Doe')
      })

      expect(result.current.errors.name).toBe('')
    })
  })

  describe('Field blur', () => {
    it('should mark field as touched on blur', () => {
      const { result } = renderHook(() =>
        useFormValidation({
          initialValues,
          validationRules,
          validateOnBlur: false,
        })
      )

      act(() => {
        result.current.handleFieldBlur('name')
      })

      expect(result.current.touched.name).toBe(true)
    })

    it('should validate on blur when enabled', () => {
      const { result } = renderHook(() =>
        useFormValidation({
          initialValues,
          validationRules,
          validateOnBlur: true,
        })
      )

      act(() => {
        result.current.handleFieldBlur('name')
      })

      expect(result.current.errors.name).toBe('name is required')
      expect(result.current.touched.name).toBe(true)
    })

    it('should not validate on blur when disabled', () => {
      const { result } = renderHook(() =>
        useFormValidation({
          initialValues,
          validationRules,
          validateOnBlur: false,
        })
      )

      act(() => {
        result.current.handleFieldBlur('name')
      })

      expect(result.current.errors.name).toBeUndefined()
      expect(result.current.touched.name).toBe(true)
    })
  })

  describe('Form validation', () => {
    it('should validate all fields', () => {
      const { result } = renderHook(() =>
        useFormValidation({
          initialValues: {
            name: '',
            email: 'invalid-email',
            age: 150,
          },
          validationRules,
        })
      )

      let validationResult: any

      act(() => {
        validationResult = result.current.validateAllFields()
      })

      expect(validationResult.isValid).toBe(false)
      expect(validationResult.errors).toContain('name is required')
      expect(validationResult.errors).toContain(
        'email must be a valid email address'
      )
      expect(validationResult.errors).toContain('age must be between 1 and 120')
    })

    it('should return valid result for valid form', () => {
      const { result } = renderHook(() =>
        useFormValidation({
          initialValues: {
            name: 'John Doe',
            email: 'john@example.com',
            age: 25,
          },
          validationRules,
        })
      )

      let validationResult: any

      act(() => {
        validationResult = result.current.validateAllFields()
      })

      expect(validationResult.isValid).toBe(true)
      expect(validationResult.errors).toHaveLength(0)
    })
  })

  describe('Field props helper', () => {
    it('should return correct field props', () => {
      const { result } = renderHook(() =>
        useFormValidation({
          initialValues: { name: 'John' },
          validationRules: {
            name: (value: string) => ValidationRules.required(value, 'name'),
          },
          validateOnChange: true,
          validateOnBlur: true,
        })
      )

      const fieldProps = result.current.getFieldProps('name')

      expect(fieldProps.value).toBe('John')
      expect(typeof fieldProps.onChange).toBe('function')
      expect(typeof fieldProps.onBlur).toBe('function')
    })

    it('should show error for touched fields', () => {
      const { result } = renderHook(() =>
        useFormValidation({
          initialValues: { name: '' },
          validationRules: {
            name: (value: string) => ValidationRules.required(value, 'name'),
          },
          validateOnBlur: true,
        })
      )

      // Blur field to mark as touched and validate
      act(() => {
        result.current.handleFieldBlur('name')
      })

      const fieldProps = result.current.getFieldProps('name')

      expect(fieldProps.error).toBe('name is required')
      expect(fieldProps.isValid).toBe(false)
    })

    it('should not show error for untouched fields', () => {
      const { result } = renderHook(() =>
        useFormValidation({
          initialValues: { name: '' },
          validationRules: {
            name: (value: string) => ValidationRules.required(value, 'name'),
          },
        })
      )

      const fieldProps = result.current.getFieldProps('name')

      expect(fieldProps.error).toBeUndefined()
      expect(fieldProps.isValid).toBeUndefined()
    })
  })

  describe('Form reset', () => {
    it('should reset form to initial values', () => {
      const { result } = renderHook(() =>
        useFormValidation({
          initialValues,
          validationRules,
        })
      )

      // Change some values
      act(() => {
        result.current.handleFieldChange('name', 'John Doe')
        result.current.handleFieldChange('email', 'john@example.com')
        result.current.handleFieldBlur('name')
      })

      expect(result.current.values.name).toBe('John Doe')
      expect(result.current.isDirty).toBe(true)
      expect(result.current.touched.name).toBe(true)

      // Reset form
      act(() => {
        result.current.resetForm()
      })

      expect(result.current.values).toEqual(initialValues)
      expect(result.current.errors).toEqual({})
      expect(result.current.warnings).toEqual({})
      expect(result.current.touched).toEqual({})
      expect(result.current.isDirty).toBe(false)
      expect(result.current.isValidating).toBe(false)
    })
  })

  describe('Warnings', () => {
    const validationRulesWithWarnings = {
      name: (value: string) => ({
        field: 'name',
        value,
        isValid: true,
        warning: value.length > 20 ? 'Name is quite long' : undefined,
      }),
    }

    it('should handle warnings correctly', () => {
      const { result } = renderHook(() =>
        useFormValidation({
          initialValues: { name: '' },
          validationRules: validationRulesWithWarnings,
          validateOnChange: true,
        })
      )

      act(() => {
        result.current.handleFieldChange(
          'name',
          'This is a very long name that exceeds twenty characters'
        )
      })

      expect(result.current.warnings.name).toBe('Name is quite long')
      expect(result.current.isValid).toBe(true) // Should still be valid
    })

    it('should show warnings in field props for touched fields', () => {
      const { result } = renderHook(() =>
        useFormValidation({
          initialValues: {
            name: 'This is a very long name that exceeds twenty characters',
          },
          validationRules: validationRulesWithWarnings,
          validateOnBlur: true,
        })
      )

      act(() => {
        result.current.handleFieldBlur('name')
      })

      const fieldProps = result.current.getFieldProps('name')

      expect(fieldProps.warning).toBe('Name is quite long')
    })
  })

  describe('State setters', () => {
    it('should allow manual state updates', () => {
      const { result } = renderHook(() =>
        useFormValidation({
          initialValues,
          validationRules,
        })
      )

      act(() => {
        result.current.setValues({
          name: 'Manual',
          email: 'manual@test.com',
          age: 30,
        })
      })

      expect(result.current.values.name).toBe('Manual')
      expect(result.current.values.email).toBe('manual@test.com')
      expect(result.current.values.age).toBe(30)

      act(() => {
        result.current.setErrors({ name: 'Custom error' })
      })

      expect(result.current.errors.name).toBe('Custom error')

      act(() => {
        result.current.setWarnings({ email: 'Custom warning' })
      })

      expect(result.current.warnings.email).toBe('Custom warning')
    })
  })

  describe('Individual field validation', () => {
    it('should validate individual fields correctly', () => {
      const { result } = renderHook(() =>
        useFormValidation({
          initialValues,
          validationRules,
        })
      )

      let fieldResult: any

      act(() => {
        fieldResult = result.current.validateField('name', '')
      })

      expect(fieldResult.isValid).toBe(false)
      expect(fieldResult.error).toBe('name is required')

      act(() => {
        fieldResult = result.current.validateField('name', 'John Doe')
      })

      expect(fieldResult.isValid).toBe(true)
      expect(fieldResult.error).toBeUndefined()
    })

    it('should handle missing validators gracefully', () => {
      const { result } = renderHook(() =>
        useFormValidation({
          initialValues,
          validationRules,
        })
      )

      let fieldResult: any

      act(() => {
        fieldResult = result.current.validateField('nonexistent', 'value')
      })

      expect(fieldResult.isValid).toBe(true)
    })
  })
})
