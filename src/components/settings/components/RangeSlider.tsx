import React from 'react'
import { SliderWithLabels } from '../../ui/SliderRadix'

interface RangeSliderProps {
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step?: number
  label?: string
  minLabel?: string
  maxLabel?: string
  showValue?: boolean
  valueFormatter?: (value: number) => string
  disabled?: boolean
  className?: string
}

const RangeSlider: React.FC<RangeSliderProps> = ({
  value,
  onChange,
  min,
  max,
  step = 1,
  label,
  minLabel,
  maxLabel,
  showValue = true,
  valueFormatter = v => v.toString(),
  disabled = false,
  className = '',
}) => {
  // Convert single value to array format for Radix Slider
  const handleValueChange = (values: number[]) => {
    onChange(values[0])
  }

  return (
    <div className={className}>
      <SliderWithLabels
        value={[value]}
        onValueChange={handleValueChange}
        min={min}
        max={max}
        step={step}
        label={label}
        showValue={showValue}
        formatValue={valueFormatter}
        disabled={disabled}
        showRange={!!(minLabel || maxLabel)}
        className="space-y-2"
      />

      {/* Custom min/max labels if provided */}
      {(minLabel || maxLabel) && (
        <div className="flex justify-between text-xs text-theme-text-muted mt-1">
          <span>{minLabel || ''}</span>
          <span>{maxLabel || ''}</span>
        </div>
      )}
    </div>
  )
}

export default RangeSlider
