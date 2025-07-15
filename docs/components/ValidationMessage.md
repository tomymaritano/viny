# ValidationMessage Component

A reusable component for displaying validation feedback with appropriate styling and icons.

## Import

```typescript
import ValidationMessage from '../ui/ValidationMessage'
```

## Props

| Prop        | Type                                | Required | Default | Description                    |
| ----------- | ----------------------------------- | -------- | ------- | ------------------------------ |
| `type`      | `'error' \| 'warning' \| 'success'` | ✅       | -       | The type of validation message |
| `message`   | `string`                            | ✅       | -       | The message to display         |
| `className` | `string`                            | ❌       | `''`    | Additional CSS classes         |

## Usage Examples

### Basic Error Message

```typescript
<ValidationMessage
  type="error"
  message="This field is required"
/>
```

### Warning Message

```typescript
<ValidationMessage
  type="warning"
  message="Password should be stronger"
/>
```

### Success Message

```typescript
<ValidationMessage
  type="success"
  message="Email is valid"
/>
```

### With Custom Styling

```typescript
<ValidationMessage
  type="error"
  message="Invalid input"
  className="mt-4"
/>
```

## Visual Examples

### Error State

- **Icon**: Red alert circle
- **Text Color**: Red (light mode) / Light red (dark mode)
- **Use Case**: Form validation errors, required fields

### Warning State

- **Icon**: Yellow warning triangle
- **Text Color**: Yellow/Orange (light mode) / Light yellow (dark mode)
- **Use Case**: Warnings, suggestions, non-critical issues

### Success State

- **Icon**: Green check circle
- **Text Color**: Green (light mode) / Light green (dark mode)
- **Use Case**: Successful validation, confirmation messages

## Integration with Forms

### With useFormValidation Hook

```typescript
import { useFormValidation } from '../../hooks/useFormValidation'
import { ValidationRules } from '../../utils/validation'
import ValidationMessage from '../ui/ValidationMessage'

const MyForm = () => {
  const {
    values,
    errors,
    warnings,
    touched,
    handleFieldChange,
    handleFieldBlur
  } = useFormValidation({
    initialValues: { email: '' },
    validationRules: {
      email: (value: string) => ValidationRules.email(value, 'email')
    }
  })

  return (
    <form>
      <div>
        <input
          type="email"
          value={values.email}
          onChange={(e) => handleFieldChange('email', e.target.value)}
          onBlur={() => handleFieldBlur('email')}
          className={errors.email && touched.email ? 'border-red-500' : ''}
        />

        {/* Show error message only if field is touched and has error */}
        {errors.email && touched.email && (
          <ValidationMessage
            type="error"
            message={errors.email}
          />
        )}

        {/* Show warning message if field is touched and has warning */}
        {warnings.email && touched.email && (
          <ValidationMessage
            type="warning"
            message={warnings.email}
          />
        )}
      </div>
    </form>
  )
}
```

### Manual Validation

```typescript
const [email, setEmail] = useState('')
const [emailError, setEmailError] = useState('')

const validateEmail = (value: string) => {
  const result = ValidationRules.email(value, 'email')
  setEmailError(result.error || '')
}

return (
  <div>
    <input
      type="email"
      value={email}
      onChange={(e) => {
        setEmail(e.target.value)
        validateEmail(e.target.value)
      }}
    />

    {emailError && (
      <ValidationMessage
        type="error"
        message={emailError}
      />
    )}
  </div>
)
```

## Styling

The component uses Tailwind CSS classes and supports both light and dark themes:

```css
/* Error styling */
.text-red-600.dark:text-red-400

/* Warning styling */
.text-yellow-600.dark:text-yellow-400

/* Success styling */
.text-green-600.dark:text-green-400
```

## Accessibility

- Uses semantic color coding
- Includes descriptive icons
- Maintains proper color contrast ratios
- Works well with screen readers

## Testing

```typescript
import { render, screen } from '@testing-library/react'
import ValidationMessage from '../ValidationMessage'

test('renders error message correctly', () => {
  render(
    <ValidationMessage
      type="error"
      message="This field is required"
    />
  )

  expect(screen.getByText('This field is required')).toBeInTheDocument()
})
```

## Common Patterns

### Conditional Rendering

```typescript
{error && <ValidationMessage type="error" message={error} />}
{warning && <ValidationMessage type="warning" message={warning} />}
{success && <ValidationMessage type="success" message={success} />}
```

### Dynamic Message Types

```typescript
const getMessageType = (isValid: boolean, hasWarning: boolean) => {
  if (!isValid) return 'error'
  if (hasWarning) return 'warning'
  return 'success'
}

<ValidationMessage
  type={getMessageType(isValid, hasWarning)}
  message={message}
/>
```

## Best Practices

1. **Use appropriate message types** - Reserve errors for actual validation failures
2. **Keep messages concise** - Users should understand the issue quickly
3. **Show messages at the right time** - Usually after user interaction (blur, submit)
4. **Provide actionable feedback** - Tell users how to fix the issue
5. **Consider message hierarchy** - Show errors first, then warnings, then success

## Related Components

- `useFormValidation` - Hook for form validation logic
- `ValidationRules` - Utility functions for validation
- `SettingsValidation` - Pre-configured validation rules
