import React from 'react'
import LoadingSpinner from './LoadingSpinner'

interface ContentLoaderProps {
  message?: string
  submessage?: string
  icon?: React.ReactNode
  variant?: 'spinner' | 'dots' | 'pulse' | 'gradient'
  className?: string
  compact?: boolean
}

const ContentLoader: React.FC<ContentLoaderProps> = ({
  message = 'Loading content...',
  submessage,
  icon,
  variant = 'spinner',
  className = '',
  compact = false
}) => {
  if (compact) {
    return (
      <div className={`flex items-center justify-center gap-3 py-8 ${className}`}>
        <LoadingSpinner size="md" variant={variant} />
        <span className="text-theme-text-secondary text-sm">{message}</span>
      </div>
    )
  }

  return (
    <div className={`flex flex-col items-center justify-center gap-6 py-12 px-6 ${className}`}>
      {/* Icon or default spinner */}
      <div className="relative">
        {icon ? (
          <div className="text-theme-accent-primary text-4xl">
            {icon}
          </div>
        ) : (
          <div className="relative">
            {/* Outer ring */}
            <div className="absolute inset-0 w-12 h-12 border-2 border-theme-accent-primary/20 rounded-full animate-spin"
                 style={{ animationDuration: '3s' }} />
            {/* Inner spinner */}
            <LoadingSpinner size="lg" variant={variant} />
          </div>
        )}
      </div>

      {/* Text content */}
      <div className="text-center space-y-3 max-w-sm">
        <h3 className="text-theme-text-primary font-medium text-lg">
          {message}
        </h3>
        
        {submessage && (
          <p className="text-theme-text-secondary text-sm leading-relaxed">
            {submessage}
          </p>
        )}

        {/* Progress indicator */}
        <div className="flex justify-center pt-2">
          <div className="flex gap-1">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 bg-theme-accent-primary rounded-full animate-pulse"
                style={{
                  animationDelay: `${i * 0.3}s`,
                  animationDuration: '1.5s'
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContentLoader