import * as React from 'react'
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'
import { cn } from '../../lib/utils'
import { radixStyles } from '../../lib/radix-theme'

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => (
  <RadioGroupPrimitive.Root
    className={cn(radixStyles.radioGroup.root, className)}
    {...props}
    ref={ref}
  />
))
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, ref) => (
  <RadioGroupPrimitive.Item
    ref={ref}
    className={cn(radixStyles.radioGroup.item, className)}
    {...props}
  >
    <RadioGroupPrimitive.Indicator
      className={cn(radixStyles.radioGroup.indicator)}
    />
  </RadioGroupPrimitive.Item>
))
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName

// Enhanced RadioGroup components for specific use cases
interface RadioOption {
  value: string
  label: string
  description?: string
  disabled?: boolean
}

interface RadioGroupWithLabelsProps
  extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root> {
  options: RadioOption[]
  value?: string
  onValueChange?: (value: string) => void
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'success' | 'warning' | 'error'
  orientation?: 'horizontal' | 'vertical'
}

/**
 * Radio group component with labels and descriptions
 * Provides better UX with contextual information
 */
export const RadioGroupWithLabels = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  RadioGroupWithLabelsProps
>(
  (
    {
      className,
      options,
      value,
      onValueChange,
      size = 'md',
      variant = 'default',
      orientation = 'vertical',
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6',
    }

    const variantClasses = {
      default:
        'data-[state=checked]:bg-theme-accent-primary data-[state=checked]:border-theme-accent-primary',
      success:
        'data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600',
      warning:
        'data-[state=checked]:bg-yellow-600 data-[state=checked]:border-yellow-600',
      error:
        'data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600',
    }

    const orientationClasses = {
      horizontal: 'flex flex-row space-x-6',
      vertical: 'flex flex-col space-y-3',
    }

    return (
      <RadioGroupPrimitive.Root
        ref={ref}
        className={cn(orientationClasses[orientation], className)}
        value={value}
        onValueChange={onValueChange}
        {...props}
      >
        {options.map(option => {
          const itemId = `radio-${option.value}`
          return (
            <div key={option.value} className="flex items-start space-x-3">
              <RadioGroupPrimitive.Item
                id={itemId}
                value={option.value}
                disabled={option.disabled}
                className={cn(
                  'aspect-square rounded-full border border-theme-border-primary shadow',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent-primary',
                  'focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                  sizeClasses[size],
                  variantClasses[variant]
                )}
              >
                <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-current" />
                </RadioGroupPrimitive.Indicator>
              </RadioGroupPrimitive.Item>

              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor={itemId}
                  className="text-sm font-medium text-theme-text-primary cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {option.label}
                </label>
                {option.description && (
                  <p className="text-xs text-theme-text-secondary">
                    {option.description}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </RadioGroupPrimitive.Root>
    )
  }
)
RadioGroupWithLabels.displayName = 'RadioGroupWithLabels'

interface RadioCardGroupProps
  extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root> {
  options: Array<{
    value: string
    label: string
    description?: string
    icon?: React.ReactNode
    disabled?: boolean
  }>
  value?: string
  onValueChange?: (value: string) => void
  className?: string
}

/**
 * Radio group with card-style options
 * Provides a more visual selection interface
 */
export const RadioCardGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  RadioCardGroupProps
>(({ className, options, value, onValueChange, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      ref={ref}
      className={cn('grid gap-3', className)}
      value={value}
      onValueChange={onValueChange}
      {...props}
    >
      {options.map(option => (
        <div key={option.value} className="relative">
          <RadioGroupPrimitive.Item
            value={option.value}
            disabled={option.disabled}
            className="peer sr-only"
          >
            <RadioGroupPrimitive.Indicator />
          </RadioGroupPrimitive.Item>

          <label
            htmlFor={`radio-card-${option.value}`}
            className={cn(
              'flex items-center space-x-3 rounded-lg border border-theme-border-primary p-4 cursor-pointer',
              'hover:bg-theme-bg-tertiary peer-data-[state=checked]:border-theme-accent-primary',
              'peer-data-[state=checked]:bg-theme-accent-primary/5 peer-disabled:cursor-not-allowed',
              'peer-disabled:opacity-50 transition-colors duration-200'
            )}
          >
            {option.icon && (
              <div className="flex-shrink-0 w-5 h-5 text-theme-text-muted">
                {option.icon}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-theme-text-primary">
                {option.label}
              </div>
              {option.description && (
                <div className="text-xs text-theme-text-secondary mt-1">
                  {option.description}
                </div>
              )}
            </div>

            <div className="flex-shrink-0">
              <div className="w-4 h-4 rounded-full border border-theme-border-primary peer-data-[state=checked]:border-theme-accent-primary peer-data-[state=checked]:bg-theme-accent-primary flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-current opacity-0 peer-data-[state=checked]:opacity-100" />
              </div>
            </div>
          </label>
        </div>
      ))}
    </RadioGroupPrimitive.Root>
  )
})
RadioCardGroup.displayName = 'RadioCardGroup'

interface RadioButtonGroupProps
  extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root> {
  options: Array<{
    value: string
    label: string
    disabled?: boolean
  }>
  value?: string
  onValueChange?: (value: string) => void
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'outline' | 'ghost'
  className?: string
}

/**
 * Radio group styled as button group
 * Provides a button-like interface for radio selection
 */
export const RadioButtonGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  RadioButtonGroupProps
>(
  (
    {
      className,
      options,
      value,
      onValueChange,
      size = 'md',
      variant = 'default',
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: 'text-xs px-2 py-1',
      md: 'text-sm px-3 py-2',
      lg: 'text-base px-4 py-3',
    }

    const variantClasses = {
      default:
        'border-theme-border-primary bg-theme-bg-secondary hover:bg-theme-bg-tertiary peer-data-[state=checked]:bg-theme-accent-primary peer-data-[state=checked]:text-white peer-data-[state=checked]:border-theme-accent-primary',
      outline:
        'border-theme-border-primary bg-transparent hover:bg-theme-bg-secondary peer-data-[state=checked]:bg-theme-accent-primary peer-data-[state=checked]:text-white peer-data-[state=checked]:border-theme-accent-primary',
      ghost:
        'border-transparent bg-transparent hover:bg-theme-bg-secondary peer-data-[state=checked]:bg-theme-accent-primary peer-data-[state=checked]:text-white',
    }

    return (
      <RadioGroupPrimitive.Root
        ref={ref}
        className={cn(
          'flex rounded-lg border border-theme-border-primary',
          className
        )}
        value={value}
        onValueChange={onValueChange}
        {...props}
      >
        {options.map((option, index) => (
          <div key={option.value} className="relative flex-1">
            <RadioGroupPrimitive.Item
              value={option.value}
              disabled={option.disabled}
              className="peer sr-only"
            >
              <RadioGroupPrimitive.Indicator />
            </RadioGroupPrimitive.Item>

            <label
              htmlFor={`radio-button-${option.value}`}
              className={cn(
                'flex items-center justify-center border-r border-theme-border-primary last:border-r-0',
                'cursor-pointer transition-colors duration-200',
                'first:rounded-l-lg last:rounded-r-lg',
                'peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
                sizeClasses[size],
                variantClasses[variant]
              )}
            >
              {option.label}
            </label>
          </div>
        ))}
      </RadioGroupPrimitive.Root>
    )
  }
)
RadioButtonGroup.displayName = 'RadioButtonGroup'

// Legacy compatibility component
interface LegacyRadioGroupProps {
  options: Array<{
    value: string
    label: string
    disabled?: boolean
  }>
  value?: string
  onChange?: (value: string) => void
  name?: string
  className?: string
}

/**
 * Legacy compatibility wrapper for existing radio group usage
 * @deprecated Use RadioGroupWithLabels or RadioGroup instead
 */
export const LegacyRadioGroup = React.forwardRef<
  HTMLDivElement,
  LegacyRadioGroupProps
>(({ options, value, onChange, name, className, ...props }, ref) => {
  return (
    <div ref={ref} className={cn('space-y-3', className)} {...props}>
      {options.map(option => (
        <div key={option.value} className="flex items-center space-x-2">
          <input
            type="radio"
            id={`${name}-${option.value}`}
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={e => onChange?.(e.target.value)}
            disabled={option.disabled}
            className="h-4 w-4 border-theme-border-primary focus:ring-2 focus:ring-theme-accent-primary text-theme-accent-primary"
          />
          <label
            htmlFor={`${name}-${option.value}`}
            className="text-sm text-theme-text-primary cursor-pointer"
          >
            {option.label}
          </label>
        </div>
      ))}
    </div>
  )
})
LegacyRadioGroup.displayName = 'LegacyRadioGroup'

export { RadioGroup, RadioGroupItem }

// Default export for backward compatibility
export default RadioGroup
