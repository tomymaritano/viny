import React from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/SelectRadix'

interface SelectOption {
  value: string | number
  label: string
}

interface SelectProps {
  value: string | number
  onChange: (value: string) => void
  options: SelectOption[]
  className?: string
  placeholder?: string
  disabled?: boolean
}

/**
 * Radix-based Select component that maintains compatibility with the legacy Select API
 * This wrapper allows gradual migration while providing all Radix benefits
 */
const SelectRadixWrapper: React.FC<SelectProps> = ({
  value,
  onChange,
  options,
  className = '',
  placeholder,
  disabled = false,
}) => {
  // Convert value to string for Radix compatibility
  const stringValue = String(value)

  // Find the current option to display
  const currentOption = options.find(
    option => String(option.value) === stringValue
  )

  return (
    <Select value={stringValue} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder}>
          {currentOption?.label || placeholder}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {options.map(option => (
          <SelectItem key={option.value} value={String(option.value)}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export default SelectRadixWrapper
export type { SelectOption, SelectProps }
