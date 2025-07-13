import React from 'react'

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  color?: 'primary' | 'secondary' | 'muted' | 'white'
  variant?: 'spinner' | 'dots' | 'pulse' | 'gradient'
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className = '',
  color = 'primary',
  variant = 'spinner'
}) => {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  }

  const colorClasses = {
    primary: 'text-theme-accent-primary',
    secondary: 'text-theme-text-secondary',
    muted: 'text-theme-text-muted',
    white: 'text-white'
  }

  if (variant === 'dots') {
    const dotSize = {
      xs: 'w-1 h-1',
      sm: 'w-1.5 h-1.5',
      md: 'w-2 h-2',
      lg: 'w-2.5 h-2.5',
      xl: 'w-3 h-3'
    }

    return (
      <div className={`flex items-center justify-center gap-1 ${className}`}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`${dotSize[size]} ${colorClasses[color]} bg-current rounded-full animate-pulse`}
            style={{
              animationDelay: `${i * 0.2}s`,
              animationDuration: '1.2s'
            }}
          />
        ))}
      </div>
    )
  }

  if (variant === 'pulse') {
    return (
      <div className={`${sizeClasses[size]} ${colorClasses[color]} ${className}`}>
        <div className="w-full h-full rounded-full bg-current animate-ping opacity-75" />
      </div>
    )
  }

  if (variant === 'gradient') {
    return (
      <div className={`relative ${sizeClasses[size]} ${className}`}>
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-theme-accent-primary via-theme-accent-cyan to-theme-accent-primary animate-spin opacity-75">
          <div 
            className="absolute inset-1 rounded-full bg-theme-bg-primary"
            style={{ background: 'inherit' }}
          />
        </div>
      </div>
    )
  }

  // Default spinner variant
  return (
    <div className={`inline-block animate-spin ${sizeClasses[size]} ${colorClasses[color]} ${className}`}>
      <svg
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-20"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="3"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  )
}

export default LoadingSpinner