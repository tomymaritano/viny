import * as React from 'react'
import * as SelectPrimitive from '@radix-ui/react-select'
import { cn } from '../../lib/utils'
import { radixStyles } from '../../lib/radix-theme'
import { Icons } from '../Icons'

const Select = SelectPrimitive.Root

const SelectGroup = SelectPrimitive.Group

const SelectValue = SelectPrimitive.Value

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(radixStyles.select.trigger, className)}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <Icons.ChevronDown className="h-4 w-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
))
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(
      'flex cursor-default items-center justify-center py-1',
      className
    )}
    {...props}
  >
    <Icons.ChevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
))
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(
      'flex cursor-default items-center justify-center py-1',
      className
    )}
    {...props}
  >
    <Icons.ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
))
SelectScrollDownButton.displayName =
  SelectPrimitive.ScrollDownButton.displayName

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = 'popper', ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(radixStyles.select.content, className)}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          'p-1',
          position === 'popper' &&
            'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]'
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
))
SelectContent.displayName = SelectPrimitive.Content.displayName

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn('py-1.5 pl-8 pr-2 text-sm font-semibold', className)}
    {...props}
  />
))
SelectLabel.displayName = SelectPrimitive.Label.displayName

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item> & {
    icon?: React.ReactNode
  }
>(({ className, children, icon, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(radixStyles.select.item, className)}
    {...props}
  >
    <span className={cn(radixStyles.select.itemIndicator)}>
      <SelectPrimitive.ItemIndicator>
        <Icons.Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>
    {icon && <span className="mr-2 h-4 w-4 flex-shrink-0">{icon}</span>}
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
SelectItem.displayName = SelectPrimitive.Item.displayName

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn('-mx-1 my-1 h-px bg-theme-border-primary', className)}
    {...props}
  />
))
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

// Legacy compatibility components
export interface LegacySelectOption {
  value: string | number
  label: string
}

export interface LegacySelectProps {
  value: string | number
  onChange: (value: string) => void
  options: LegacySelectOption[]
  className?: string
}

/**
 * Legacy compatibility wrapper for simple select usage
 * @deprecated Use the new Radix-based Select components instead
 */
export const LegacySelect: React.FC<LegacySelectProps> = ({
  value,
  onChange,
  options,
  className = '',
}) => (
  <select
    value={value}
    onChange={e => onChange(e.target.value)}
    className={`px-2 py-1 bg-theme-bg-secondary border border-theme-border-primary rounded text-sm text-theme-text-secondary focus:border-theme-accent-primary focus:outline-none ${className}`}
  >
    {options.map(option => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
)

// Advanced dropdown option interface
export interface AdvancedDropdownOption {
  value: string | number
  label: string
  icon?: string | React.ReactNode
  color?: string
  disabled?: boolean
}

export interface AdvancedSelectProps {
  value?: string | number | null
  onValueChange?: (value: string) => void
  options: (string | AdvancedDropdownOption)[]
  placeholder?: string
  className?: string
  disabled?: boolean
  size?: 'xs' | 'sm' | 'md' | 'lg'
}

/**
 * Advanced Select component that maintains compatibility with the existing Dropdown component API
 * while using Radix UI underneath for better accessibility and functionality
 */
export const AdvancedSelect = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  AdvancedSelectProps
>(
  (
    {
      value,
      onValueChange,
      options,
      placeholder = 'Select...',
      className,
      disabled = false,
      size = 'sm',
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      xs: 'h-8 px-2 text-xs',
      sm: 'h-10 px-3 text-sm',
      md: 'h-12 px-4 text-base',
      lg: 'h-14 px-6 text-lg',
    }

    return (
      <Select
        value={value?.toString()}
        onValueChange={onValueChange}
        disabled={disabled}
      >
        <SelectTrigger
          ref={ref}
          className={cn(sizeClasses[size], className)}
          {...props}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option, index) => {
            const optionValue =
              typeof option === 'string' ? option : option.value
            const optionLabel =
              typeof option === 'string' ? option : option.label
            const optionIcon = typeof option === 'object' ? option.icon : null
            const optionDisabled =
              typeof option === 'object' ? option.disabled : false

            return (
              <SelectItem
                key={optionValue || index}
                value={optionValue.toString()}
                disabled={optionDisabled}
                icon={optionIcon}
              >
                {optionLabel}
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>
    )
  }
)

AdvancedSelect.displayName = 'AdvancedSelect'

// Simple Select component for basic use cases
export interface SimpleSelectProps {
  value?: string
  onValueChange?: (value: string) => void
  options: { value: string; label: string; disabled?: boolean }[]
  placeholder?: string
  className?: string
  disabled?: boolean
}

/**
 * Simple Select component for basic use cases
 */
export const SimpleSelect = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  SimpleSelectProps
>(
  (
    {
      value,
      onValueChange,
      options,
      placeholder = 'Select...',
      className,
      disabled = false,
      ...props
    },
    ref
  ) => (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger ref={ref} className={className} {...props}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map(option => (
          <SelectItem
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
)

SimpleSelect.displayName = 'SimpleSelect'

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
}
