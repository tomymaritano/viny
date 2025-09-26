import * as React from 'react'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { cn } from '../../lib/utils'
import { radixStyles } from '../../lib/radix-theme'

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(radixStyles.checkbox.root, className)}
    {...props}
  >
    <CheckboxPrimitive.Indicator className={cn(radixStyles.checkbox.indicator)}>
      <svg
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 13l4 4L19 7"
        />
      </svg>
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

// Enhanced Checkbox components for specific use cases
interface CheckboxWithLabelProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  label?: string
  description?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'success' | 'warning' | 'error'
}

/**
 * Checkbox component with label and description
 * Provides better UX with contextual information
 */
export const CheckboxWithLabel = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxWithLabelProps
>(
  (
    {
      className,
      label,
      description,
      size = 'md',
      variant = 'default',
      id,
      ...props
    },
    ref
  ) => {
    const checkboxId = id || `checkbox-${React.useId()}`

    const sizeClasses = {
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6',
    }

    const variantClasses = {
      default:
        'data-[state=checked]:bg-theme-accent-primary data-[state=checked]:text-white',
      success:
        'data-[state=checked]:bg-green-600 data-[state=checked]:text-white',
      warning:
        'data-[state=checked]:bg-yellow-600 data-[state=checked]:text-white',
      error: 'data-[state=checked]:bg-red-600 data-[state=checked]:text-white',
    }

    return (
      <div className="flex items-start space-x-3">
        <CheckboxPrimitive.Root
          ref={ref}
          id={checkboxId}
          className={cn(
            'peer shrink-0 rounded-sm border border-theme-border-primary shadow',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent-primary',
            'focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            sizeClasses[size],
            variantClasses[variant],
            className
          )}
          {...props}
        >
          <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </CheckboxPrimitive.Indicator>
        </CheckboxPrimitive.Root>

        <div className="grid gap-1.5 leading-none">
          {label && (
            <label
              htmlFor={checkboxId}
              className="text-sm font-medium text-theme-text-primary cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {label}
            </label>
          )}
          {description && (
            <p className="text-xs text-theme-text-secondary">{description}</p>
          )}
        </div>
      </div>
    )
  }
)
CheckboxWithLabel.displayName = 'CheckboxWithLabel'

interface CheckboxGroupProps {
  items: Array<{
    id: string
    label: string
    description?: string
    checked?: boolean
    disabled?: boolean
  }>
  value?: string[]
  onValueChange?: (value: string[]) => void
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'success' | 'warning' | 'error'
}

/**
 * Checkbox group component for multiple selection
 * Manages state for multiple checkboxes
 */
export const CheckboxGroup = React.forwardRef<
  HTMLDivElement,
  CheckboxGroupProps
>(
  (
    {
      items,
      value = [],
      onValueChange,
      className,
      size = 'md',
      variant = 'default',
      ...props
    },
    ref
  ) => {
    const handleCheckedChange = (itemId: string, checked: boolean) => {
      if (!onValueChange) return

      if (checked) {
        onValueChange([...value, itemId])
      } else {
        onValueChange(value.filter(id => id !== itemId))
      }
    }

    return (
      <div ref={ref} className={cn('space-y-3', className)} {...props}>
        {items.map(item => (
          <CheckboxWithLabel
            key={item.id}
            checked={value.includes(item.id)}
            onCheckedChange={checked =>
              handleCheckedChange(item.id, checked as boolean)
            }
            label={item.label}
            description={item.description}
            disabled={item.disabled}
            size={size}
            variant={variant}
          />
        ))}
      </div>
    )
  }
)
CheckboxGroup.displayName = 'CheckboxGroup'

interface IndeterminateCheckboxProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  indeterminate?: boolean
}

/**
 * Checkbox with indeterminate state support
 * Useful for "select all" functionality
 */
export const IndeterminateCheckbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  IndeterminateCheckboxProps
>(({ className, indeterminate, ...props }, ref) => {
  return (
    <CheckboxPrimitive.Root
      ref={ref}
      className={cn(radixStyles.checkbox.root, className)}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        className={cn(radixStyles.checkbox.indicator)}
      >
        {indeterminate ? (
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 12H4"
            />
          </svg>
        ) : (
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
})
IndeterminateCheckbox.displayName = 'IndeterminateCheckbox'

interface SelectAllCheckboxProps {
  items: Array<{ id: string; label: string }>
  selectedItems: string[]
  onSelectionChange: (selectedItems: string[]) => void
  label?: string
  className?: string
}

/**
 * Select all checkbox component
 * Manages "select all" functionality for a list of items
 */
export const SelectAllCheckbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  SelectAllCheckboxProps
>(
  (
    {
      items,
      selectedItems,
      onSelectionChange,
      label = 'Select all',
      className,
      ...props
    },
    ref
  ) => {
    const allSelected =
      items.length > 0 && selectedItems.length === items.length
    const someSelected =
      selectedItems.length > 0 && selectedItems.length < items.length
    const noneSelected = selectedItems.length === 0

    const handleCheckedChange = (checked: boolean) => {
      if (checked) {
        onSelectionChange(items.map(item => item.id))
      } else {
        onSelectionChange([])
      }
    }

    return (
      <div className={cn('flex items-center space-x-2', className)}>
        <IndeterminateCheckbox
          ref={ref}
          checked={allSelected}
          indeterminate={someSelected}
          onCheckedChange={handleCheckedChange}
          {...props}
        />
        <label className="text-sm font-medium text-theme-text-primary cursor-pointer">
          {label}
        </label>
      </div>
    )
  }
)
SelectAllCheckbox.displayName = 'SelectAllCheckbox'

// Legacy compatibility component
interface LegacyCheckboxProps {
  checked?: boolean
  onChange?: (checked: boolean) => void
  label?: string
  disabled?: boolean
  className?: string
}

/**
 * Legacy compatibility wrapper for existing checkbox usage
 * @deprecated Use CheckboxWithLabel or Checkbox instead
 */
export const LegacyCheckbox = React.forwardRef<
  HTMLInputElement,
  LegacyCheckboxProps
>(
  (
    { checked = false, onChange, label, disabled = false, className, ...props },
    ref
  ) => {
    return (
      <div className={cn('flex items-center space-x-2', className)}>
        <input
          ref={ref}
          type="checkbox"
          checked={checked}
          onChange={e => onChange?.(e.target.checked)}
          disabled={disabled}
          className="h-4 w-4 rounded border-theme-border-primary focus:ring-2 focus:ring-theme-accent-primary"
          {...props}
        />
        {label && (
          <label className="text-sm text-theme-text-primary">{label}</label>
        )}
      </div>
    )
  }
)
LegacyCheckbox.displayName = 'LegacyCheckbox'

export { Checkbox }

// Default export for backward compatibility
export default Checkbox
