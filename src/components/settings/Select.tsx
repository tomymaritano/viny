import React from 'react'

interface SelectOption {
  value: string | number
  label: string
}

interface SelectProps {
  value: string | number
  onChange: (value: string) => void
  options: SelectOption[]
  className?: string
}

const Select: React.FC<SelectProps> = ({ value, onChange, options, className = '' }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className={`px-2 py-1 bg-theme-bg-secondary border border-theme-border-primary rounded text-sm text-theme-text-secondary focus:border-theme-accent-primary focus:outline-none ${className}`}
  >
    {options.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
)

export default Select
