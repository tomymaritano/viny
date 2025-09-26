import * as React from 'react'
import * as SliderPrimitive from '@radix-ui/react-slider'
import { cn } from '../../lib/utils'
import { radixStyles } from '../../lib/radix-theme'

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(radixStyles.slider.root, className)}
    {...props}
  >
    <SliderPrimitive.Track className={cn(radixStyles.slider.track)}>
      <SliderPrimitive.Range className={cn(radixStyles.slider.range)} />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className={cn(radixStyles.slider.thumb)} />
  </SliderPrimitive.Root>
))
Slider.displayName = SliderPrimitive.Root.displayName

// Enhanced Slider components for specific use cases
interface SliderWithLabelsProps
  extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  label?: string
  description?: string
  showValue?: boolean
  showRange?: boolean
  formatValue?: (value: number) => string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'success' | 'warning' | 'error'
}

/**
 * Slider component with labels and value display
 * Provides better UX with contextual information
 */
export const SliderWithLabels = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderWithLabelsProps
>(
  (
    {
      className,
      label,
      description,
      showValue = true,
      showRange = false,
      formatValue = value => value.toString(),
      size = 'md',
      variant = 'default',
      value,
      min = 0,
      max = 100,
      ...props
    },
    ref
  ) => {
    const currentValue = value?.[0] ?? 0

    const sizeClasses = {
      sm: 'h-1',
      md: 'h-2',
      lg: 'h-3',
    }

    const variantClasses = {
      default: 'bg-theme-accent-primary',
      success: 'bg-green-500',
      warning: 'bg-yellow-500',
      error: 'bg-red-500',
    }

    return (
      <div className={cn('space-y-2', className)}>
        {(label || showValue) && (
          <div className="flex justify-between items-center">
            {label && (
              <label className="text-sm font-medium text-theme-text-primary">
                {label}
              </label>
            )}
            {showValue && (
              <span className="text-sm text-theme-text-secondary">
                {formatValue(currentValue)}
              </span>
            )}
          </div>
        )}

        <SliderPrimitive.Root
          ref={ref}
          className="relative flex w-full touch-none select-none items-center"
          value={value}
          min={min}
          max={max}
          {...props}
        >
          <SliderPrimitive.Track
            className={cn(
              'relative h-2 w-full grow overflow-hidden rounded-full bg-theme-bg-tertiary',
              sizeClasses[size]
            )}
          >
            <SliderPrimitive.Range
              className={cn('absolute h-full', variantClasses[variant])}
            />
          </SliderPrimitive.Track>
          <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-theme-bg-primary bg-theme-accent-primary shadow transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
        </SliderPrimitive.Root>

        {showRange && (
          <div className="flex justify-between text-xs text-theme-text-muted">
            <span>{formatValue(min)}</span>
            <span>{formatValue(max)}</span>
          </div>
        )}

        {description && (
          <p className="text-xs text-theme-text-secondary">{description}</p>
        )}
      </div>
    )
  }
)
SliderWithLabels.displayName = 'SliderWithLabels'

interface RangeSliderProps
  extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  label?: string
  description?: string
  showValues?: boolean
  formatValue?: (value: number) => string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'success' | 'warning' | 'error'
}

/**
 * Range slider component for selecting a range of values
 * Supports dual thumb selection
 */
export const RangeSlider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  RangeSliderProps
>(
  (
    {
      className,
      label,
      description,
      showValues = true,
      formatValue = value => value.toString(),
      size = 'md',
      variant = 'default',
      value = [0, 100],
      min = 0,
      max = 100,
      ...props
    },
    ref
  ) => {
    const [minValue, maxValue] = value

    const sizeClasses = {
      sm: 'h-1',
      md: 'h-2',
      lg: 'h-3',
    }

    const variantClasses = {
      default: 'bg-theme-accent-primary',
      success: 'bg-green-500',
      warning: 'bg-yellow-500',
      error: 'bg-red-500',
    }

    return (
      <div className={cn('space-y-2', className)}>
        {(label || showValues) && (
          <div className="flex justify-between items-center">
            {label && (
              <label className="text-sm font-medium text-theme-text-primary">
                {label}
              </label>
            )}
            {showValues && (
              <span className="text-sm text-theme-text-secondary">
                {formatValue(minValue)} - {formatValue(maxValue)}
              </span>
            )}
          </div>
        )}

        <SliderPrimitive.Root
          ref={ref}
          className="relative flex w-full touch-none select-none items-center"
          value={value}
          min={min}
          max={max}
          {...props}
        >
          <SliderPrimitive.Track
            className={cn(
              'relative h-2 w-full grow overflow-hidden rounded-full bg-theme-bg-tertiary',
              sizeClasses[size]
            )}
          >
            <SliderPrimitive.Range
              className={cn('absolute h-full', variantClasses[variant])}
            />
          </SliderPrimitive.Track>
          <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-theme-bg-primary bg-theme-accent-primary shadow transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
          <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-theme-bg-primary bg-theme-accent-primary shadow transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
        </SliderPrimitive.Root>

        {description && (
          <p className="text-xs text-theme-text-secondary">{description}</p>
        )}
      </div>
    )
  }
)
RangeSlider.displayName = 'RangeSlider'

interface VolumeSliderProps
  extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  label?: string
  showIcon?: boolean
  muted?: boolean
  onMutedChange?: (muted: boolean) => void
}

/**
 * Volume slider component with mute functionality
 * Specialized for audio/video controls
 */
export const VolumeSlider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  VolumeSliderProps
>(
  (
    {
      className,
      label,
      showIcon = true,
      muted = false,
      onMutedChange,
      value = [50],
      ...props
    },
    ref
  ) => {
    const currentValue = value[0] ?? 0
    const isMuted = muted || currentValue === 0

    const VolumeIcon = () => {
      if (isMuted || currentValue === 0) {
        return (
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
            />
          </svg>
        )
      }

      if (currentValue < 33) {
        return (
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
            />
          </svg>
        )
      }

      return (
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
          />
        </svg>
      )
    }

    return (
      <div className={cn('flex items-center space-x-3', className)}>
        {showIcon && (
          <button
            onClick={() => onMutedChange?.(!muted)}
            className="p-1 rounded hover:bg-theme-bg-tertiary text-theme-text-secondary hover:text-theme-text-primary transition-colors"
          >
            <VolumeIcon />
          </button>
        )}

        <div className="flex-1">
          {label && (
            <label className="text-sm font-medium text-theme-text-primary mb-2 block">
              {label}
            </label>
          )}

          <SliderPrimitive.Root
            ref={ref}
            className="relative flex w-full touch-none select-none items-center"
            value={muted ? [0] : value}
            disabled={muted}
            {...props}
          >
            <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-theme-bg-tertiary">
              <SliderPrimitive.Range className="absolute h-full bg-theme-accent-primary" />
            </SliderPrimitive.Track>
            <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-theme-bg-primary bg-theme-accent-primary shadow transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
          </SliderPrimitive.Root>
        </div>

        <span className="text-xs text-theme-text-secondary w-8 text-right">
          {muted ? '0' : currentValue}
        </span>
      </div>
    )
  }
)
VolumeSlider.displayName = 'VolumeSlider'

interface SteppedSliderProps
  extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  label?: string
  description?: string
  steps: Array<{
    value: number
    label: string
  }>
  showSteps?: boolean
  formatValue?: (value: number) => string
}

/**
 * Stepped slider component with predefined steps
 * Useful for discrete value selection
 */
export const SteppedSlider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SteppedSliderProps
>(
  (
    {
      className,
      label,
      description,
      steps,
      showSteps = true,
      formatValue = value => value.toString(),
      value = [steps[0]?.value ?? 0],
      ...props
    },
    ref
  ) => {
    const currentValue = value[0] ?? 0
    const currentStep =
      steps.find(step => step.value === currentValue) || steps[0]

    return (
      <div className={cn('space-y-2', className)}>
        {(label || currentStep) && (
          <div className="flex justify-between items-center">
            {label && (
              <label className="text-sm font-medium text-theme-text-primary">
                {label}
              </label>
            )}
            {currentStep && (
              <span className="text-sm text-theme-text-secondary">
                {currentStep.label}
              </span>
            )}
          </div>
        )}

        <SliderPrimitive.Root
          ref={ref}
          className="relative flex w-full touch-none select-none items-center"
          value={value}
          min={Math.min(...steps.map(s => s.value))}
          max={Math.max(...steps.map(s => s.value))}
          step={1}
          {...props}
        >
          <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-theme-bg-tertiary">
            <SliderPrimitive.Range className="absolute h-full bg-theme-accent-primary" />
          </SliderPrimitive.Track>
          <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-theme-bg-primary bg-theme-accent-primary shadow transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
        </SliderPrimitive.Root>

        {showSteps && (
          <div className="flex justify-between text-xs text-theme-text-muted">
            {steps.map((step, index) => (
              <span
                key={step.value}
                className={cn(
                  'transition-colors',
                  step.value === currentValue
                    ? 'text-theme-accent-primary font-medium'
                    : ''
                )}
              >
                {step.label}
              </span>
            ))}
          </div>
        )}

        {description && (
          <p className="text-xs text-theme-text-secondary">{description}</p>
        )}
      </div>
    )
  }
)
SteppedSlider.displayName = 'SteppedSlider'

// Legacy compatibility component
interface LegacyRangeSliderProps {
  value: number
  min?: number
  max?: number
  step?: number
  onChange?: (value: number) => void
  label?: string
  disabled?: boolean
  className?: string
}

/**
 * Legacy compatibility wrapper for existing range slider usage
 * @deprecated Use SliderWithLabels or Slider instead
 */
export const LegacyRangeSlider = React.forwardRef<
  HTMLInputElement,
  LegacyRangeSliderProps
>(
  (
    {
      value,
      min = 0,
      max = 100,
      step = 1,
      onChange,
      label,
      disabled = false,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <div className={cn('space-y-2', className)}>
        {label && (
          <label className="text-sm font-medium text-theme-text-primary">
            {label}
          </label>
        )}
        <div className="flex items-center space-x-3">
          <input
            ref={ref}
            type="range"
            value={value}
            min={min}
            max={max}
            step={step}
            onChange={e => onChange?.(parseInt(e.target.value))}
            disabled={disabled}
            className="flex-1 h-2 bg-theme-bg-tertiary rounded-lg appearance-none cursor-pointer slider-thumb"
            {...props}
          />
          <span className="text-sm text-theme-text-secondary w-12 text-right">
            {value}
          </span>
        </div>
      </div>
    )
  }
)
LegacyRangeSlider.displayName = 'LegacyRangeSlider'

export { Slider }

// Default export for backward compatibility
export default Slider
