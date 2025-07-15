# useFormValidation Hook

A comprehensive React hook for managing form state with real-time validation, error handling, and user feedback.

## Import

```typescript
import { useFormValidation } from '../hooks/useFormValidation'
```

## Type Definitions

```typescript
interface UseFormValidationOptions<T> {
  initialValues: T
  validationRules: Record<
    string,
    (value: any, ...args: any[]) => FieldValidation
  >
  validateOnChange?: boolean
  validateOnBlur?: boolean
}

interface FieldValidation {
  field: string
  value: any
  isValid: boolean
  error?: string
  warning?: string
}
```

## Parameters

| Parameter          | Type                       | Required | Default | Description                         |
| ------------------ | -------------------------- | -------- | ------- | ----------------------------------- |
| `initialValues`    | `T`                        | ✅       | -       | Initial form values object          |
| `validationRules`  | `Record<string, Function>` | ✅       | -       | Validation functions for each field |
| `validateOnChange` | `boolean`                  | ❌       | `true`  | Enable validation on field change   |
| `validateOnBlur`   | `boolean`                  | ❌       | `true`  | Enable validation on field blur     |

## Return Value

```typescript
{
  // State
  values: T
  errors: Record<string, string>
  warnings: Record<string, string>
  touched: Record<string, boolean>
  isValidating: boolean
  isValid: boolean
  isDirty: boolean

  // Actions
  validateField: (fieldName: string, value: any) => FieldValidation
  validateAllFields: () => ValidationResult
  handleFieldChange: (fieldName: string, value: any) => void
  handleFieldBlur: (fieldName: string) => void
  resetForm: () => void
  getFieldProps: (fieldName: string) => FieldProps

  // Utilities
  setValues: (values: T) => void
  setErrors: (errors: Record<string, string>) => void
  setWarnings: (warnings: Record<string, string>) => void
}
```

## Basic Usage

### Simple Form Validation

```typescript
import { useFormValidation } from '../hooks/useFormValidation'
import { ValidationRules } from '../utils/validation'

const ContactForm = () => {
  const {
    values,
    errors,
    touched,
    handleFieldChange,
    handleFieldBlur,
    validateAllFields,
    isValid
  } = useFormValidation({
    initialValues: {
      name: '',
      email: '',
      age: 0
    },
    validationRules: {
      name: (value: string) => ValidationRules.required(value, 'name'),
      email: (value: string) => ValidationRules.email(value, 'email'),
      age: (value: number) => ValidationRules.range(value, 1, 120, 'age')
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const result = validateAllFields()

    if (result.isValid) {
      console.log('Form is valid:', values)
    } else {
      console.log('Form has errors:', result.errors)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input
          type="text"
          placeholder="Name"
          value={values.name}
          onChange={(e) => handleFieldChange('name', e.target.value)}
          onBlur={() => handleFieldBlur('name')}
        />
        {errors.name && touched.name && (
          <span className="error">{errors.name}</span>
        )}
      </div>

      <div>
        <input
          type="email"
          placeholder="Email"
          value={values.email}
          onChange={(e) => handleFieldChange('email', e.target.value)}
          onBlur={() => handleFieldBlur('email')}
        />
        {errors.email && touched.email && (
          <span className="error">{errors.email}</span>
        )}
      </div>

      <button type="submit" disabled={!isValid}>
        Submit
      </button>
    </form>
  )
}
```

### Using getFieldProps for Cleaner Code

```typescript
const SettingsForm = () => {
  const { getFieldProps, isValid, values } = useFormValidation({
    initialValues: {
      language: 'en',
      defaultNotebook: 'personal'
    },
    validationRules: {
      language: SettingsValidation.general.language,
      defaultNotebook: (value: string) =>
        SettingsValidation.general.defaultNotebook(value, availableNotebooks)
    }
  })

  return (
    <form>
      <select {...getFieldProps('language')}>
        <option value="en">English</option>
        <option value="es">Spanish</option>
      </select>

      <select {...getFieldProps('defaultNotebook')}>
        {notebooks.map(nb => (
          <option key={nb.id} value={nb.id}>{nb.name}</option>
        ))}
      </select>

      <button disabled={!isValid}>Save Settings</button>
    </form>
  )
}
```

## Advanced Usage

### Custom Validation Rules

```typescript
const customValidationRules = {
  password: (value: string) => {
    const hasUpperCase = /[A-Z]/.test(value)
    const hasLowerCase = /[a-z]/.test(value)
    const hasNumbers = /\d/.test(value)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value)

    if (!value) {
      return {
        field: 'password',
        value,
        isValid: false,
        error: 'Password is required',
      }
    }

    if (value.length < 8) {
      return {
        field: 'password',
        value,
        isValid: false,
        error: 'Password must be at least 8 characters',
      }
    }

    const strengthScore = [
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar,
    ].filter(Boolean).length

    return {
      field: 'password',
      value,
      isValid: true,
      warning:
        strengthScore < 3 ? 'Consider using a stronger password' : undefined,
    }
  },

  confirmPassword: (value: string, originalPassword: string) => ({
    field: 'confirmPassword',
    value,
    isValid: value === originalPassword,
    error: value !== originalPassword ? 'Passwords do not match' : undefined,
  }),
}
```

### Conditional Validation

```typescript
const ProfileForm = () => {
  const validation = useFormValidation({
    initialValues: {
      userType: 'individual',
      companyName: '',
      personalName: ''
    },
    validationRules: {
      userType: (value: string) => ValidationRules.required(value, 'userType'),
      companyName: (value: string, formValues: any) => {
        // Only validate company name if user type is 'company'
        if (formValues.userType === 'company') {
          return ValidationRules.required(value, 'companyName')
        }
        return { field: 'companyName', value, isValid: true }
      },
      personalName: (value: string, formValues: any) => {
        // Only validate personal name if user type is 'individual'
        if (formValues.userType === 'individual') {
          return ValidationRules.required(value, 'personalName')
        }
        return { field: 'personalName', value, isValid: true }
      }
    }
  })

  return (
    <form>
      <select {...validation.getFieldProps('userType')}>
        <option value="individual">Individual</option>
        <option value="company">Company</option>
      </select>

      {validation.values.userType === 'company' && (
        <input
          {...validation.getFieldProps('companyName')}
          placeholder="Company Name"
        />
      )}

      {validation.values.userType === 'individual' && (
        <input
          {...validation.getFieldProps('personalName')}
          placeholder="Personal Name"
        />
      )}
    </form>
  )
}
```

### Async Validation

```typescript
const useAsyncValidation = () => {
  const [asyncErrors, setAsyncErrors] = useState<Record<string, string>>({})

  const validateEmailUnique = async (email: string) => {
    try {
      const response = await api.checkEmailUnique(email)
      if (!response.isUnique) {
        setAsyncErrors(prev => ({
          ...prev,
          email: 'Email is already taken',
        }))
      } else {
        setAsyncErrors(prev => {
          const { email: _, ...rest } = prev
          return rest
        })
      }
    } catch (error) {
      console.error('Async validation error:', error)
    }
  }

  const formValidation = useFormValidation({
    initialValues: { email: '' },
    validationRules: {
      email: (value: string) => ValidationRules.email(value, 'email'),
    },
  })

  // Debounced async validation
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formValidation.values.email && formValidation.isValid) {
        validateEmailUnique(formValidation.values.email)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [formValidation.values.email])

  return {
    ...formValidation,
    errors: { ...formValidation.errors, ...asyncErrors },
  }
}
```

## State Management

### Form State Properties

```typescript
// values - Current form values
const { values } = useFormValidation(...)
console.log(values) // { name: "John", email: "john@example.com" }

// errors - Validation errors for each field
const { errors } = useFormValidation(...)
console.log(errors) // { email: "Invalid email format" }

// warnings - Non-blocking validation warnings
const { warnings } = useFormValidation(...)
console.log(warnings) // { password: "Consider using a stronger password" }

// touched - Fields that have been interacted with
const { touched } = useFormValidation(...)
console.log(touched) // { email: true, name: false }

// isValid - Overall form validity
const { isValid } = useFormValidation(...)
console.log(isValid) // true | false

// isDirty - Whether form has been modified
const { isDirty } = useFormValidation(...)
console.log(isDirty) // true | false
```

### Manual State Updates

```typescript
const { setValues, setErrors, setWarnings, resetForm } = useFormValidation(...)

// Update multiple values at once
setValues({ name: "John", email: "john@example.com" })

// Set custom errors
setErrors({ customField: "Custom error message" })

// Set warnings
setWarnings({ field: "Warning message" })

// Reset form to initial state
resetForm()
```

## Validation Timing

### Control When Validation Occurs

```typescript
// Validate only on blur (not on every keystroke)
const validation = useFormValidation({
  initialValues: { email: '' },
  validationRules: {
    /* ... */
  },
  validateOnChange: false, // Disable real-time validation
  validateOnBlur: true, // Validate when field loses focus
})

// Validate only on submit
const validation = useFormValidation({
  initialValues: { email: '' },
  validationRules: {
    /* ... */
  },
  validateOnChange: false,
  validateOnBlur: false,
})

// Manual validation trigger
const handleSubmit = () => {
  const result = validation.validateAllFields()
  if (result.isValid) {
    // Submit form
  }
}
```

## Integration Examples

### With Settings Forms

```typescript
import { SettingsValidation } from '../utils/validation'

const GeneralSettings = () => {
  const { values, errors, getFieldProps, isValid } = useFormValidation({
    initialValues: {
      language: settings.language || 'en',
      defaultNotebook: settings.defaultNotebook || 'personal'
    },
    validationRules: {
      language: SettingsValidation.general.language,
      defaultNotebook: (value: string) =>
        SettingsValidation.general.defaultNotebook(value, availableNotebooks)
    }
  })

  return (
    <form>
      <select {...getFieldProps('language')}>
        {languages.map(lang => (
          <option key={lang.value} value={lang.value}>
            {lang.label}
          </option>
        ))}
      </select>

      {errors.language && <ValidationMessage type="error" message={errors.language} />}

      <button disabled={!isValid}>Save Settings</button>
    </form>
  )
}
```

### With Custom Components

```typescript
const CustomInput = ({ label, fieldName, validation, ...props }) => {
  const fieldProps = validation.getFieldProps(fieldName)
  const hasError = validation.errors[fieldName] && validation.touched[fieldName]

  return (
    <div className="form-field">
      <label>{label}</label>
      <input
        {...fieldProps}
        {...props}
        className={`input ${hasError ? 'input-error' : ''}`}
      />
      {hasError && (
        <ValidationMessage type="error" message={validation.errors[fieldName]} />
      )}
    </div>
  )
}

// Usage
const MyForm = () => {
  const validation = useFormValidation({ /* ... */ })

  return (
    <form>
      <CustomInput
        label="Email"
        fieldName="email"
        validation={validation}
        type="email"
      />
    </form>
  )
}
```

## Best Practices

1. **Define validation rules clearly** - Use descriptive field names and error messages
2. **Validate at appropriate times** - Consider UX when choosing validation timing
3. **Show errors only after interaction** - Use `touched` state to avoid overwhelming users
4. **Provide helpful error messages** - Tell users exactly what they need to fix
5. **Use warnings for suggestions** - Non-blocking feedback for better UX
6. **Reset forms appropriately** - Clear form state when needed
7. **Handle async validation carefully** - Debounce network requests for validation

## Common Patterns

### Wizard/Multi-step Forms

```typescript
const WizardForm = () => {
  const [currentStep, setCurrentStep] = useState(0)

  const step1Validation = useFormValidation({
    initialValues: { name: '', email: '' },
    validationRules: { /* step 1 rules */ }
  })

  const step2Validation = useFormValidation({
    initialValues: { address: '', phone: '' },
    validationRules: { /* step 2 rules */ }
  })

  const canProceed = currentStep === 0 ? step1Validation.isValid : step2Validation.isValid

  return (
    <div>
      {currentStep === 0 && <Step1Form validation={step1Validation} />}
      {currentStep === 1 && <Step2Form validation={step2Validation} />}

      <button disabled={!canProceed} onClick={() => setCurrentStep(currentStep + 1)}>
        Next
      </button>
    </div>
  )
}
```

### Form Arrays/Dynamic Fields

```typescript
const DynamicFieldsForm = () => {
  const [fieldCount, setFieldCount] = useState(1)

  const validation = useFormValidation({
    initialValues: Array.from({ length: fieldCount }, (_, i) => ({ [`field_${i}`]: '' }))
      .reduce((acc, curr) => ({ ...acc, ...curr }), {}),
    validationRules: Array.from({ length: fieldCount }, (_, i) => ({
      [`field_${i}`]: (value: string) => ValidationRules.required(value, `Field ${i + 1}`)
    })).reduce((acc, curr) => ({ ...acc, ...curr }), {})
  })

  return (
    <form>
      {Array.from({ length: fieldCount }, (_, i) => (
        <input key={i} {...validation.getFieldProps(`field_${i}`)} />
      ))}

      <button type="button" onClick={() => setFieldCount(fieldCount + 1)}>
        Add Field
      </button>
    </form>
  )
}
```

## Testing

```typescript
import { renderHook, act } from '@testing-library/react'
import { useFormValidation } from '../useFormValidation'
import { ValidationRules } from '../../utils/validation'

describe('useFormValidation', () => {
  test('validates fields correctly', () => {
    const { result } = renderHook(() =>
      useFormValidation({
        initialValues: { email: '' },
        validationRules: {
          email: (value: string) => ValidationRules.email(value, 'email'),
        },
      })
    )

    act(() => {
      result.current.handleFieldChange('email', 'invalid-email')
    })

    expect(result.current.errors.email).toBe(
      'email must be a valid email address'
    )
    expect(result.current.isValid).toBe(false)

    act(() => {
      result.current.handleFieldChange('email', 'valid@email.com')
    })

    expect(result.current.errors.email).toBe('')
    expect(result.current.isValid).toBe(true)
  })
})
```
