import React from 'react'
import { Switch } from '../../ui/SwitchRadix'

interface ToggleSwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
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

export default ToggleSwitch
