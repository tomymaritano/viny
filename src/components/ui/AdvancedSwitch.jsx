import { useState, useEffect } from 'react'

const AdvancedSwitch = ({
  checked,
  onChange,
  disabled = false,
  size = 'md',
  variant = 'default',
  loading = false,
  icon = null,
  label,
  description,
}) => {
  const [isAnimating, setIsAnimating] = useState(false)

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

  const variants = {
    default: {
      on: 'bg-solarized-blue',
      off: 'bg-solarized-base01',
      thumb: 'bg-white',
    },
    success: {
      on: 'bg-solarized-green',
      off: 'bg-solarized-base01',
      thumb: 'bg-white',
    },
    warning: {
      on: 'bg-solarized-yellow',
      off: 'bg-solarized-base01',
      thumb: 'bg-white',
    },
    danger: {
      on: 'bg-solarized-red',
      off: 'bg-solarized-base01',
      thumb: 'bg-white',
    },
  }

  const currentSize = sizes[size]
  const currentVariant = variants[variant]

  useEffect(() => {
    if (isAnimating) {
      const timeout = setTimeout(() => setIsAnimating(false), 200)
      return () => clearTimeout(timeout)
    }
  }, [isAnimating])

  const handleClick = () => {
    if (!disabled && !loading) {
      setIsAnimating(true)
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
        disabled={disabled || loading}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={`
          ${currentSize.container}
          ${checked ? currentVariant.on : currentVariant.off}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${loading ? 'animate-pulse' : ''}
          relative inline-flex items-center rounded-full border-2 border-transparent 
          transition-all duration-200 ease-in-out 
          focus:outline-none focus:ring-2 focus:ring-solarized-blue focus:ring-offset-2 focus:ring-offset-solarized-base03
          hover:shadow-lg
          ${isAnimating ? 'scale-95' : 'scale-100'}
        `}
      >
        <span
          className={`
            ${currentSize.thumb} 
            ${currentSize.translate}
            ${currentVariant.thumb}
            inline-block transform rounded-full shadow-lg ring-0 
            transition-all duration-200 ease-in-out
            ${loading ? 'animate-spin' : ''}
            flex items-center justify-center
          `}
        >
          {loading && (
            <div className="w-2 h-2 border border-solarized-base01 border-t-transparent rounded-full animate-spin" />
          )}
          {icon && !loading && (
            <div className="w-2 h-2 flex items-center justify-center">
              {icon}
            </div>
          )}
        </span>
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

export default AdvancedSwitch
