import React from 'react'

interface NumberInputProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  className?: string
  placeholder?: string
}

const NumberInput: React.FC<NumberInputProps> = ({
  value,
  onChange,
  min,
  max,
  step = 1,
  className = '',
  placeholder,
}) => (
  <input
    type="number"
    value={value}
    onChange={(e) => onChange(Number(e.target.value))}
    min={min}
    max={max}
    step={step}
    placeholder={placeholder}
    className={`px-2 py-1 bg-theme-bg-secondary border border-theme-border-primary rounded text-sm text-theme-text-secondary focus:border-theme-accent-primary focus:outline-none w-16 ${className}`}
  />
)

export default NumberInput
