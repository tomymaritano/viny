import { useState } from 'react'

const CustomSwitch = ({
  checked,
  onChange,
  disabled = false,
  size = 'md',
  label,
  description,
}) => {
  const [isPressed, setIsPressed] = useState(false)

  const sizes = {
    sm: {
      container: 'h-4 w-7',
      thumb: 'h-3 w-3',
      translate: checked ? 'translate-x-3' : 'translate-x-0.5',
    },
    md: {
      container: 'h-5 w-9',
      thumb: 'h-4 w-4',
      translate: checked ? 'translate-x-4' : 'translate-x-0.5',
    },
    lg: {
      container: 'h-6 w-11',
      thumb: 'h-5 w-5',
      translate: checked ? 'translate-x-5' : 'translate-x-0.5',
    },
  }

  const currentSize = sizes[size]

  const handleClick = () => {
    if (!disabled) {
      onChange(!checked)
    }
  }

  const handleKeyDown = e => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      handleClick()
    }
  }

  return (
    <div className="flex items-center space-x-3">
      <button
        role="switch"
        aria-checked={checked}
        aria-label={label}
        aria-describedby={description}
        disabled={disabled}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onMouseLeave={() => setIsPressed(false)}
        className={`
          ${currentSize.container}
          ${checked ? 'bg-solarized-blue' : 'bg-solarized-base01'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-opacity-80'}
          ${isPressed ? 'scale-95' : 'scale-100'}
          relative inline-flex items-center rounded-full border-2 border-transparent 
          transition-all duration-200 ease-in-out 
          focus:outline-none focus:ring-2 focus:ring-solarized-blue focus:ring-offset-2 focus:ring-offset-solarized-base03
          active:scale-95
        `}
      >
        <span
          className={`
            ${currentSize.thumb} 
            ${currentSize.translate}
            ${checked ? 'bg-white' : 'bg-solarized-base3'}
            inline-block transform rounded-full shadow-lg ring-0 
            transition-all duration-200 ease-in-out
            ${isPressed ? 'shadow-md' : 'shadow-lg'}
          `}
        />
      </button>

      {(label || description) && (
        <div className="flex-1">
          {label && (
            <div className="text-sm font-medium text-solarized-base3">
              {label}
            </div>
          )}
          {description && (
            <div className="text-xs text-solarized-base1">{description}</div>
          )}
        </div>
      )}
    </div>
  )
}

export default CustomSwitch
