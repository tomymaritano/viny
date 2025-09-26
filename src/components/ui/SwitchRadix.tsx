import * as React from 'react'
import * as SwitchPrimitive from '@radix-ui/react-switch'
import { cn } from '../../lib/utils'
import { radixStyles } from '../../lib/radix-theme'

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root> & {
    size?: 'sm' | 'md' | 'lg'
  }
>(({ className, size = 'md', ...props }, ref) => {
  const sizeClasses = {
    sm: {
      root: 'h-4 w-7',
      thumb:
        'h-3 w-3 data-[state=checked]:translate-x-3 data-[state=unchecked]:translate-x-0.5',
    },
    md: {
      root: 'h-6 w-11',
      thumb:
        'h-5 w-5 data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0',
    },
    lg: {
      root: 'h-8 w-14',
      thumb:
        'h-7 w-7 data-[state=checked]:translate-x-6 data-[state=unchecked]:translate-x-0.5',
    },
  }

  return (
    <SwitchPrimitive.Root
      className={cn(radixStyles.switch.root, sizeClasses[size].root, className)}
      {...props}
      ref={ref}
    >
      <SwitchPrimitive.Thumb
        className={cn(radixStyles.switch.thumb, sizeClasses[size].thumb)}
      />
    </SwitchPrimitive.Root>
  )
})
Switch.displayName = SwitchPrimitive.Root.displayName

// Enhanced Switch with Label and Description
interface SwitchWithLabelProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root> {
  label?: string
  description?: string
  size?: 'sm' | 'md' | 'lg'
  labelPosition?: 'left' | 'right'
}

const SwitchWithLabel = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  SwitchWithLabelProps
>(
  (
    {
      className,
      label,
      description,
      size = 'md',
      labelPosition = 'right',
      id,
      ...props
    },
    ref
  ) => {
    const switchId = id || `switch-${React.useId()}`

    const switchElement = (
      <Switch
        id={switchId}
        ref={ref}
        size={size}
        className={className}
        {...props}
      />
    )

    const labelElement = (label || description) && (
      <div className="flex flex-col space-y-1">
        {label && (
          <label
            htmlFor={switchId}
            className="text-sm font-medium text-theme-text-primary cursor-pointer"
          >
            {label}
          </label>
        )}
        {description && (
          <p className="text-xs text-theme-text-secondary">{description}</p>
        )}
      </div>
    )

    if (!label && !description) {
      return switchElement
    }

    return (
      <div
        className={cn(
          'flex items-center space-x-3',
          labelPosition === 'left' && 'flex-row-reverse space-x-reverse'
        )}
      >
        {switchElement}
        {labelElement}
      </div>
    )
  }
)
SwitchWithLabel.displayName = 'SwitchWithLabel'

// Legacy compatibility components
interface LegacyCustomSwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  label?: string
  description?: string
}

/**
 * Legacy compatibility wrapper for CustomSwitch
 * @deprecated Use the new Radix-based Switch components instead
 */
export const LegacyCustomSwitch: React.FC<LegacyCustomSwitchProps> = ({
  checked,
  onChange,
  disabled = false,
  size = 'md',
  label,
  description,
}) => {
  return (
    <SwitchWithLabel
      checked={checked}
      onCheckedChange={onChange}
      disabled={disabled}
      size={size}
      label={label}
      description={description}
    />
  )
}

interface LegacyToggleSwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

/**
 * Legacy compatibility wrapper for ToggleSwitch
 * @deprecated Use the new Radix-based Switch components instead
 */
export const LegacyToggleSwitch: React.FC<LegacyToggleSwitchProps> = ({
  checked,
  onChange,
  disabled = false,
  size = 'md',
  className,
}) => {
  return (
    <Switch
      checked={checked}
      onCheckedChange={onChange}
      disabled={disabled}
      size={size}
      className={className}
    />
  )
}

// Settings Switch - specialized for settings pages
interface SettingsSwitchProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root> {
  title: string
  description?: string
  size?: 'sm' | 'md' | 'lg'
}

const SettingsSwitch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  SettingsSwitchProps
>(({ title, description, size = 'md', className, ...props }, ref) => (
  <div className="flex items-center justify-between p-4 bg-theme-bg-secondary rounded-lg">
    <div className="flex-1 space-y-1">
      <h3 className="text-sm font-medium text-theme-text-primary">{title}</h3>
      {description && (
        <p className="text-xs text-theme-text-secondary">{description}</p>
      )}
    </div>
    <Switch ref={ref} size={size} className={className} {...props} />
  </div>
))
SettingsSwitch.displayName = 'SettingsSwitch'

export { Switch, SwitchWithLabel, SettingsSwitch }
