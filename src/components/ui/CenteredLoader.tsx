import React from 'react'
import LoadingSpinner from './LoadingSpinner'

interface CenteredLoaderProps {
  message?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'spinner' | 'dots' | 'pulse' | 'gradient'
  showLogo?: boolean
  className?: string
  fullScreen?: boolean
}

const CenteredLoader: React.FC<CenteredLoaderProps> = ({
  message = 'Loading...',
  size = 'lg',
  variant = 'gradient',
  showLogo = true,
  className = '',
  fullScreen = true
}) => {
  const containerClasses = fullScreen 
    ? 'fixed inset-0 z-50 flex items-center justify-center bg-theme-bg-primary'
    : 'flex items-center justify-center min-h-[200px]'

  return (
    <div className={`${containerClasses} ${className}`}>
      <div className="flex flex-col items-center gap-8 text-center">
        {/* Logo/Brand Section */}
        {showLogo && (
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              {/* Animated ring */}
              <div className="absolute inset-0 w-16 h-16 border-4 border-theme-accent-primary/20 rounded-full animate-pulse" />
              <div className="absolute inset-0 w-16 h-16 border-t-4 border-theme-accent-primary rounded-full animate-spin" 
                   style={{ animationDuration: '2s' }} />
              
              {/* Logo placeholder */}
              <div className="w-16 h-16 flex items-center justify-center">
                <div className="w-8 h-8 bg-theme-accent-primary rounded-lg flex items-center justify-center">
                  <div className="w-4 h-4 bg-white rounded-sm" />
                </div>
              </div>
            </div>
            
            <div className="text-xl font-semibold text-theme-text-primary">
              Nototo
            </div>
          </div>
        )}

        {/* Loading Spinner */}
        <div className="flex flex-col items-center gap-4">
          <LoadingSpinner size={size} variant={variant} />
          
          {/* Message */}
          <div className="space-y-2">
            <p className="text-theme-text-primary font-medium text-lg">
              {message}
            </p>
            <div className="flex justify-center">
              <LoadingSpinner size="sm" variant="dots" color="muted" />
            </div>
          </div>
        </div>

        {/* Subtle animation */}
        <div className="flex gap-1">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 bg-theme-accent-primary/30 rounded-full animate-bounce"
              style={{
                animationDelay: `${i * 0.1}s`,
                animationDuration: '1s'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default CenteredLoader