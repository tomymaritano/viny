import React from 'react'

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
  valueFormatter = (v) => v.toString(),
  disabled = false,
  className = '',
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-theme-text-secondary">
          {label}
        </label>
      )}
      
      <div className="flex items-center space-x-4">
        {minLabel && (
          <span className="text-xs text-theme-text-muted">{minLabel}</span>
        )}
        
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          disabled={disabled}
          className={`
            flex-1 h-2 bg-theme-bg-tertiary rounded-lg appearance-none cursor-pointer
            focus:outline-none focus:ring-2 focus:ring-theme-accent-primary focus:ring-opacity-50
            disabled:opacity-50 disabled:cursor-not-allowed
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 
            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-theme-accent-primary 
            [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 
            [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-sm
            [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full 
            [&::-moz-range-thumb]:bg-theme-accent-primary [&::-moz-range-thumb]:cursor-pointer 
            [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white
          `}
        />
        
        {maxLabel && (
          <span className="text-xs text-theme-text-muted">{maxLabel}</span>
        )}
        
        {showValue && (
          <span className="text-sm font-medium text-theme-text-primary min-w-[3rem] text-right">
            {valueFormatter(value)}
          </span>
        )}
      </div>
    </div>
  )
}

export default RangeSlider