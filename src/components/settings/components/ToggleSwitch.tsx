import React from 'react'

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
  className = '',
}) => {
  const sizes = {
    sm: 'w-8 h-4',
    md: 'w-11 h-6',
    lg: 'w-14 h-8',
  }

  const thumbSizes = {
    sm: 'h-3 w-3 after:h-3 after:w-3',
    md: 'h-5 w-5 after:h-5 after:w-5',
    lg: 'h-7 w-7 after:h-7 after:w-7',
  }

  const thumbPositions = {
    sm: 'peer-checked:after:translate-x-4',
    md: 'peer-checked:after:translate-x-full',
    lg: 'peer-checked:after:translate-x-6',
  }

  return (
    <label className={`relative inline-flex items-center cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="sr-only peer"
      />
      <div className={`
        ${sizes[size]} bg-theme-bg-tertiary peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-theme-accent-primary/25 rounded-full peer 
        ${thumbPositions[size]} peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
        after:bg-white after:rounded-full ${thumbSizes[size]} after:transition-all peer-checked:bg-theme-accent-primary
        ${disabled ? 'cursor-not-allowed' : ''}
      `} />
    </label>
  )
}

export default ToggleSwitch