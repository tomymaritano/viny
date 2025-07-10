// Modern loading spinner component
import React from 'react'
import { LoadingProps } from '../../../types'

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6', 
  lg: 'w-8 h-8'
}

export const LoadingSpinner: React.FC<LoadingProps> = ({ 
  size = 'md', 
  text, 
  className = '' 
}) => {
  return (
    <div className={`flex flex-col items-center justify-center space-y-2 ${className}`}>
      <div 
        className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-theme-border-primary border-t-theme-accent-primary`}
        role="status"
        aria-label="Loading"
      />
      {text && (
        <p className="text-sm text-theme-text-muted animate-pulse">
          {text}
        </p>
      )}
    </div>
  )
}

export const LoadingOverlay: React.FC<LoadingProps> = ({ 
  text = 'Loading...', 
  className = '' 
}) => {
  return (
    <div className={`fixed inset-0 bg-theme-bg-primary/80 backdrop-blur-sm flex items-center justify-center z-50 ${className}`}>
      <div className="bg-theme-bg-secondary p-6 rounded-lg shadow-lg border border-theme-border-primary">
        <LoadingSpinner size="lg" text={text} />
      </div>
    </div>
  )
}

export const LoadingPage: React.FC<LoadingProps> = ({ 
  text = 'Loading Nototo...', 
  className = '' 
}) => {
  return (
    <div className={`min-h-screen bg-theme-bg-primary flex items-center justify-center ${className}`}>
      <div className="text-center space-y-4">
        <LoadingSpinner size="lg" />
        <div>
          <h2 className="text-xl font-semibold text-theme-text-primary mb-2">
            {text}
          </h2>
          <p className="text-theme-text-muted">
            Initializing your notes...
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoadingSpinner