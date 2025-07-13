import React from 'react'
import ModernSpinner from './ui/LoadingSpinner'
import CenteredLoader from './ui/CenteredLoader'

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
  // Map legacy sizes to new sizes
  const sizeMap = {
    small: 'sm' as const,
    medium: 'md' as const,
    large: 'lg' as const,
    xlarge: 'xl' as const
  }

  // Map legacy colors to new colors
  const colorMap = {
    primary: 'primary' as const,
    secondary: 'secondary' as const,
    success: 'primary' as const,
    warning: 'primary' as const,
    error: 'primary' as const,
    white: 'white' as const
  }

  if (overlay) {
    return (
      <CenteredLoader 
        message={text || 'Loading...'}
        size={sizeMap[size]}
        variant="spinner"
        className={className}
      />
    )
  }

  if (text) {
    return (
      <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
        <ModernSpinner 
          size={sizeMap[size]} 
          color={colorMap[color]} 
          variant="spinner"
        />
        <span className="text-sm text-theme-text-secondary animate-pulse">
          {text}
        </span>
      </div>
    )
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <ModernSpinner 
        size={sizeMap[size]} 
        color={colorMap[color]} 
        variant="spinner"
      />
    </div>
  )
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
        relative inline-flex items-center justify-center gap-2 px-4 py-2
        transition-all duration-200
        ${loading || disabled ? 'opacity-60 cursor-not-allowed' : 'hover:opacity-90'}
        ${className}
      `}
      {...props}
    >
      {loading && (
        <ModernSpinner
          size="sm"
          color="white"
          variant="dots"
        />
      )}
      <span className={loading ? 'opacity-75' : ''}>{children}</span>
    </button>
  )
}
