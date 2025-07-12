import React from 'react'

type SpinnerSize = 'small' | 'medium' | 'large' | 'xlarge'
type SpinnerColor = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'white'

interface LoadingSpinnerProps {
  size?: SpinnerSize
  color?: SpinnerColor
  text?: string
  className?: string
  overlay?: boolean
}

interface SkeletonLoaderProps {
  lines?: number
  className?: string
  height?: string
}

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  loading?: boolean
  disabled?: boolean
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
  className?: string
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  color = 'primary',
  text = '',
  className = '',
  overlay = false,
}) => {
  const sizeClasses: Record<SpinnerSize, string> = {
    small: 'w-4 h-4',
    medium: 'w-6 h-6',
    large: 'w-8 h-8',
    xlarge: 'w-12 h-12',
  }

  const colorClasses: Record<SpinnerColor, string> = {
    primary: 'text-blue-500',
    secondary: 'text-gray-500',
    success: 'text-green-500',
    warning: 'text-yellow-500',
    error: 'text-red-500',
    white: 'text-white',
  }

  const spinner = (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="flex flex-col items-center space-y-2">
        <svg
          className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]}`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        {text && (
          <span className={`text-sm ${colorClasses[color]} animate-pulse`}>
            {text}
          </span>
        )}
      </div>
    </div>
  )

  if (overlay) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-theme-bg-secondary rounded-lg p-6">{spinner}</div>
      </div>
    )
  }

  return spinner
}

export default LoadingSpinner

// Skeleton loading component
export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  lines = 3,
  className = '',
  height = 'h-4',
}) => {
  return (
    <div className={`animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={`bg-theme-bg-tertiary rounded ${height} mb-2`}
          style={{
            width: `${Math.random() * 40 + 60}%`,
          }}
        />
      ))}
    </div>
  )
}

// Loading button component
export const LoadingButton: React.FC<LoadingButtonProps> = ({
  children,
  loading = false,
  disabled = false,
  onClick,
  className = '',
  ...props
}) => {
  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      className={`
        relative inline-flex items-center justify-center
        ${loading || disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      {...props}
    >
      {loading && (
        <LoadingSpinner
          size="small"
          color="white"
          className="absolute inset-0"
        />
      )}
      <span className={loading ? 'invisible' : ''}>{children}</span>
    </button>
  )
}
