import React from 'react'
import { SwitchWithLabel } from './SwitchRadix'

interface CustomSwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  label?: string
  description?: string
}

/**
 * CustomSwitch component migrated to use Radix Switch internally
 * while maintaining backward compatibility
 */
const CustomSwitch: React.FC<CustomSwitchProps> = ({
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

export default CustomSwitch
