import * as React from 'react'
import * as ProgressPrimitive from '@radix-ui/react-progress'
import { cn } from '../../lib/utils'
import { radixStyles } from '../../lib/radix-theme'

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(radixStyles.progress.root, className)}
    value={value}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={cn(radixStyles.progress.indicator)}
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

// Enhanced Progress components for specific use cases
interface ProgressWithLabelProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  value: number
  label?: string
  showValue?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'success' | 'warning' | 'error'
}

/**
 * Progress component with label and value display
 * Provides better UX with contextual information
 */
export const ProgressWithLabel = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressWithLabelProps
>(
  (
    {
      className,
      value,
      label,
      showValue = true,
      size = 'md',
      variant = 'default',
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: 'h-2',
      md: 'h-4',
      lg: 'h-6',
    }

    const variantClasses = {
      default: 'bg-theme-accent-primary',
      success: 'bg-green-500',
      warning: 'bg-yellow-500',
      error: 'bg-red-500',
    }

    return (
      <div className="w-full space-y-2">
        {(label || showValue) && (
          <div className="flex justify-between items-center">
            {label && (
              <span className="text-sm font-medium text-theme-text-primary">
                {label}
              </span>
            )}
            {showValue && (
              <span className="text-sm text-theme-text-secondary">
                {value}%
              </span>
            )}
          </div>
        )}
        <ProgressPrimitive.Root
          ref={ref}
          className={cn(
            'relative h-4 w-full overflow-hidden rounded-full bg-theme-bg-tertiary',
            sizeClasses[size],
            className
          )}
          value={value}
          {...props}
        >
          <ProgressPrimitive.Indicator
            className={cn(
              'h-full w-full flex-1 transition-all duration-300 ease-out',
              variantClasses[variant]
            )}
            style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
          />
        </ProgressPrimitive.Root>
      </div>
    )
  }
)
ProgressWithLabel.displayName = 'ProgressWithLabel'

interface SteppedProgressProps {
  steps: string[]
  currentStep: number
  className?: string
}

/**
 * Stepped progress component for multi-step processes
 * Shows progress through a sequence of steps
 */
export const SteppedProgress = React.forwardRef<
  HTMLDivElement,
  SteppedProgressProps
>(({ steps, currentStep, className, ...props }, ref) => {
  const progress = ((currentStep + 1) / steps.length) * 100

  return (
    <div ref={ref} className={cn('w-full space-y-4', className)} {...props}>
      {/* Progress bar */}
      <div className="relative">
        <ProgressPrimitive.Root
          className="relative h-2 w-full overflow-hidden rounded-full bg-theme-bg-tertiary"
          value={progress}
        >
          <ProgressPrimitive.Indicator
            className="h-full w-full flex-1 bg-theme-accent-primary transition-all duration-500 ease-out"
            style={{ transform: `translateX(-${100 - progress}%)` }}
          />
        </ProgressPrimitive.Root>

        {/* Step indicators */}
        <div className="absolute -top-1 left-0 w-full flex justify-between">
          {steps.map((_, index) => (
            <div
              key={index}
              className={cn(
                'w-4 h-4 rounded-full border-2 bg-theme-bg-primary transition-colors duration-300',
                index <= currentStep
                  ? 'border-theme-accent-primary bg-theme-accent-primary'
                  : 'border-theme-bg-tertiary'
              )}
            />
          ))}
        </div>
      </div>

      {/* Steps list */}
      <div className="space-y-2">
        {steps.map((step, index) => (
          <div
            key={index}
            className={cn(
              'flex items-center space-x-3 text-sm transition-colors duration-300',
              index <= currentStep
                ? 'text-theme-text-primary'
                : 'text-theme-text-secondary'
            )}
          >
            <div
              className={cn(
                'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-colors duration-300',
                index < currentStep
                  ? 'bg-theme-accent-primary text-white'
                  : index === currentStep
                    ? 'bg-theme-accent-primary text-white'
                    : 'bg-theme-bg-tertiary text-theme-text-muted'
              )}
            >
              {index < currentStep ? '✓' : index + 1}
            </div>
            <span className="flex-1">{step}</span>
          </div>
        ))}
      </div>
    </div>
  )
})
SteppedProgress.displayName = 'SteppedProgress'

interface CircularProgressProps {
  value: number
  size?: number
  strokeWidth?: number
  className?: string
  showValue?: boolean
  variant?: 'default' | 'success' | 'warning' | 'error'
}

/**
 * Circular progress component
 * Useful for compact progress indicators
 */
export const CircularProgress = React.forwardRef<
  HTMLDivElement,
  CircularProgressProps
>(
  (
    {
      value,
      size = 60,
      strokeWidth = 6,
      className,
      showValue = true,
      variant = 'default',
      ...props
    },
    ref
  ) => {
    const center = size / 2
    const radius = center - strokeWidth / 2
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (value / 100) * circumference

    const variantColors = {
      default: 'stroke-theme-accent-primary',
      success: 'stroke-green-500',
      warning: 'stroke-yellow-500',
      error: 'stroke-red-500',
    }

    return (
      <div
        ref={ref}
        className={cn(
          'relative inline-flex items-center justify-center',
          className
        )}
        style={{ width: size, height: size }}
        {...props}
      >
        <svg className="transform -rotate-90" width={size} height={size}>
          {/* Background circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-theme-bg-tertiary"
          />
          {/* Progress circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={cn(
              'transition-all duration-300 ease-out',
              variantColors[variant]
            )}
          />
        </svg>
        {showValue && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-medium text-theme-text-primary">
              {value}%
            </span>
          </div>
        )}
      </div>
    )
  }
)
CircularProgress.displayName = 'CircularProgress'

// Legacy compatibility component
interface LegacyProgressProps {
  value: number
  max?: number
  className?: string
  showLabel?: boolean
  label?: string
}

/**
 * Legacy compatibility wrapper for existing progress usage
 * @deprecated Use ProgressWithLabel or Progress instead
 */
export const LegacyProgress = React.forwardRef<
  HTMLDivElement,
  LegacyProgressProps
>(
  (
    { value, max = 100, className, showLabel = false, label, ...props },
    ref
  ) => {
    const progressValue = (value / max) * 100

    return (
      <div ref={ref} className={cn('w-full', className)} {...props}>
        {showLabel && label && (
          <div className="mb-2">
            <span className="text-sm font-medium text-theme-text-primary">
              {label}
            </span>
          </div>
        )}
        <div className="w-full bg-theme-bg-tertiary rounded-full h-2">
          <div
            className="bg-theme-accent-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressValue}%` }}
          />
        </div>
        {showLabel && (
          <div className="mt-1 text-right">
            <span className="text-xs text-theme-text-secondary">
              {value} / {max}
            </span>
          </div>
        )}
      </div>
    )
  }
)
LegacyProgress.displayName = 'LegacyProgress'

export { Progress }

// Default export for backward compatibility
export default Progress
