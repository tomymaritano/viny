import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAdvancedValidation } from '../useAdvancedValidation'
import type { FieldValidation } from '../../utils/validation'

describe('useAdvancedValidation', () => {
  const mockValidator = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockValidator.mockReturnValue({
      field: 'test',
      value: 'test',
      isValid: true,
    } as FieldValidation)
  })

  it('should initialize with correct default values', () => {
    const { result } = renderHook(() =>
      useAdvancedValidation({
        initialValues: { name: 'John', age: 25 },
        validationRules: {
          name: { validator: mockValidator },
        },
      })
    )

    expect(result.current.values).toEqual({ name: 'John', age: 25 })
    expect(result.current.isValid).toBe(true)
    expect(result.current.isDirty).toBe(false)
    expect(result.current.isValidating).toBe(false)
  })

  it('should validate on mount when validateOnMount is true', () => {
    renderHook(() =>
      useAdvancedValidation({
        initialValues: { name: 'John' },
        validationRules: {
          name: { validator: mockValidator },
        },
        validateOnMount: true,
      })
    )

    expect(mockValidator).toHaveBeenCalledWith('John')
  })

  it('should handle field changes correctly', () => {
    const { result } = renderHook(() =>
      useAdvancedValidation({
        initialValues: { name: '' },
        validationRules: {
          name: { validator: mockValidator },
        },
        validateOnChange: true,
      })
    )

    act(() => {
      result.current.handleFieldChange('name', 'John')
    })

    expect(result.current.values.name).toBe('John')
    expect(result.current.isDirty).toBe(true)
  })

  it('should handle validation errors correctly', () => {
    const errorValidator = vi.fn().mockReturnValue({
      field: 'name',
      value: '',
      isValid: false,
      error: 'Name is required',
    } as FieldValidation)

    const { result } = renderHook(() =>
      useAdvancedValidation({
        initialValues: { name: '' },
        validationRules: {
          name: { validator: errorValidator },
        },
        validateOnMount: true,
      })
    )

    expect(result.current.isValid).toBe(false)
    expect(result.current.errors.name).toBe('Name is required')
  })

  it('should handle validation warnings correctly', () => {
    const warningValidator = vi.fn().mockReturnValue({
      field: 'name',
      value: 'Jo',
      isValid: true,
      warning: 'Name is very short',
    } as FieldValidation)

    const { result } = renderHook(() =>
      useAdvancedValidation({
        initialValues: { name: 'Jo' },
        validationRules: {
          name: { validator: warningValidator },
        },
        validateOnMount: true,
      })
    )

    expect(result.current.isValid).toBe(true)
    expect(result.current.warnings.name).toBe('Name is very short')
  })

  it('should provide correct validation summary', () => {
    const errorValidator = vi.fn().mockReturnValue({
      field: 'name',
      value: '',
      isValid: false,
      error: 'Name is required',
    } as FieldValidation)

    const { result } = renderHook(() =>
      useAdvancedValidation({
        initialValues: { name: '' },
        validationRules: {
          name: { validator: errorValidator },
        },
        validateOnMount: true,
      })
    )

    act(() => {
      result.current.handleFieldBlur('name')
    })

    const summary = result.current.getValidationSummary()
    expect(summary.hasErrors).toBe(true)
    expect(summary.errorCount).toBe(1)
    expect(summary.errors).toContain('Name is required')
  })

  it('should reset form correctly', () => {
    const { result } = renderHook(() =>
      useAdvancedValidation({
        initialValues: { name: 'John' },
        validationRules: {
          name: { validator: mockValidator },
        },
      })
    )

    act(() => {
      result.current.handleFieldChange('name', 'Jane')
    })

    expect(result.current.isDirty).toBe(true)

    act(() => {
      result.current.resetForm()
    })

    expect(result.current.values.name).toBe('John')
    expect(result.current.isDirty).toBe(false)
    expect(result.current.errors).toEqual({})
  })

  it('should provide correct field props', () => {
    const { result } = renderHook(() =>
      useAdvancedValidation({
        initialValues: { name: 'John' },
        validationRules: {
          name: { validator: mockValidator },
        },
      })
    )

    const fieldProps = result.current.getFieldProps('name')

    expect(fieldProps.value).toBe('John')
    expect(typeof fieldProps.onChange).toBe('function')
    expect(typeof fieldProps.onBlur).toBe('function')
    expect(fieldProps.isValidating).toBe(false)
  })

  it('should validate all fields correctly', () => {
    const nameValidator = vi.fn().mockReturnValue({
      field: 'name',
      value: '',
      isValid: false,
      error: 'Name is required',
    } as FieldValidation)

    const ageValidator = vi.fn().mockReturnValue({
      field: 'age',
      value: 25,
      isValid: true,
    } as FieldValidation)

    const { result } = renderHook(() =>
      useAdvancedValidation({
        initialValues: { name: '', age: 25 },
        validationRules: {
          name: { validator: nameValidator },
          age: { validator: ageValidator },
        },
      })
    )

    let validationResult: any
    act(() => {
      validationResult = result.current.validateAllFields()
    })

    expect(validationResult.isValid).toBe(false)
    expect(validationResult.errors).toContain('Name is required')
    expect(nameValidator).toHaveBeenCalledWith('')
    expect(ageValidator).toHaveBeenCalledWith(25)
  })

  it('should handle debounced validation', async () => {
    vi.useFakeTimers()

    const debouncedValidator = vi.fn().mockReturnValue({
      field: 'name',
      value: 'John',
      isValid: true,
    } as FieldValidation)

    const { result } = renderHook(() =>
      useAdvancedValidation({
        initialValues: { name: '' },
        validationRules: {
          name: { validator: debouncedValidator, debounceMs: 100 },
        },
        validateOnChange: true,
        debounceMs: 100,
      })
    )

    // Multiple rapid changes
    act(() => {
      result.current.handleFieldChange('name', 'J')
    })
    act(() => {
      result.current.handleFieldChange('name', 'Jo')
    })
    act(() => {
      result.current.handleFieldChange('name', 'John')
    })

    // Should only validate once after debounce
    expect(debouncedValidator).not.toHaveBeenCalled()

    // Fast forward time
    act(() => {
      vi.advanceTimersByTime(150)
    })

    expect(debouncedValidator).toHaveBeenCalledTimes(1)
    expect(debouncedValidator).toHaveBeenCalledWith('John')

    vi.useRealTimers()
  })
})
