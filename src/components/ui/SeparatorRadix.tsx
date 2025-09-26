import * as React from 'react'
import * as SeparatorPrimitive from '@radix-ui/react-separator'
import { cn } from '../../lib/utils'

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(
  (
    { className, orientation = 'horizontal', decorative = true, ...props },
    ref
  ) => (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cn(
        'shrink-0 bg-theme-border-primary',
        orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]',
        className
      )}
      {...props}
    />
  )
)
Separator.displayName = SeparatorPrimitive.Root.displayName

// Enhanced Separator components for specific use cases
interface EnhancedSeparatorProps
  extends React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root> {
  label?: string
  variant?: 'default' | 'dashed' | 'dotted' | 'double' | 'gradient'
  size?: 'sm' | 'md' | 'lg'
  color?: 'default' | 'muted' | 'accent' | 'success' | 'warning' | 'error'
}

/**
 * Enhanced separator with labels and different styles
 * Provides better visual separation with customization options
 */
export const EnhancedSeparator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  EnhancedSeparatorProps
>(
  (
    {
      className,
      label,
      variant = 'default',
      size = 'md',
      color = 'default',
      orientation = 'horizontal',
      decorative = true,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: orientation === 'horizontal' ? 'h-px' : 'w-px',
      md: orientation === 'horizontal' ? 'h-[1px]' : 'w-[1px]',
      lg: orientation === 'horizontal' ? 'h-[2px]' : 'w-[2px]',
    }

    const colorClasses = {
      default: 'bg-theme-border-primary',
      muted: 'bg-theme-border-secondary',
      accent: 'bg-theme-accent-primary',
      success: 'bg-green-500',
      warning: 'bg-yellow-500',
      error: 'bg-red-500',
    }

    const variantClasses = {
      default: '',
      dashed: 'border-dashed bg-transparent',
      dotted: 'border-dotted bg-transparent',
      double: 'border-double bg-transparent',
      gradient:
        'bg-gradient-to-r from-transparent via-theme-border-primary to-transparent',
    }

    const getBorderClass = () => {
      if (
        variant === 'dashed' ||
        variant === 'dotted' ||
        variant === 'double'
      ) {
        const borderSize =
          size === 'sm' ? 'border-t' : size === 'lg' ? 'border-t-2' : 'border-t'
        return orientation === 'horizontal' ? borderSize : 'border-l'
      }
      return ''
    }

    if (label && orientation === 'horizontal') {
      return (
        <div className={cn('flex items-center', className)}>
          <SeparatorPrimitive.Root
            ref={ref}
            decorative={decorative}
            orientation={orientation}
            className={cn(
              'shrink-0 flex-1',
              sizeClasses[size],
              colorClasses[color],
              variantClasses[variant],
              getBorderClass()
            )}
            {...props}
          />
          <span className="px-3 text-sm text-theme-text-secondary bg-theme-bg-primary">
            {label}
          </span>
          <SeparatorPrimitive.Root
            decorative={decorative}
            orientation={orientation}
            className={cn(
              'shrink-0 flex-1',
              sizeClasses[size],
              colorClasses[color],
              variantClasses[variant],
              getBorderClass()
            )}
          />
        </div>
      )
    }

    return (
      <SeparatorPrimitive.Root
        ref={ref}
        decorative={decorative}
        orientation={orientation}
        className={cn(
          'shrink-0',
          orientation === 'horizontal' ? 'w-full' : 'h-full',
          sizeClasses[size],
          colorClasses[color],
          variantClasses[variant],
          getBorderClass(),
          className
        )}
        {...props}
      />
    )
  }
)
EnhancedSeparator.displayName = 'EnhancedSeparator'

interface SectionSeparatorProps
  extends React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root> {
  title: string
  description?: string
  icon?: React.ReactNode
  actions?: React.ReactNode
}

/**
 * Section separator with title and optional description
 * Perfect for dividing content sections with meaningful headers
 */
export const SectionSeparator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  SectionSeparatorProps
>(({ className, title, description, icon, actions, ...props }, ref) => {
  return (
    <div className={cn('py-4', className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          {icon && (
            <div className="w-5 h-5 text-theme-accent-primary">{icon}</div>
          )}
          <h3 className="text-lg font-semibold text-theme-text-primary">
            {title}
          </h3>
        </div>
        {actions && (
          <div className="flex items-center space-x-2">{actions}</div>
        )}
      </div>
      {description && (
        <p className="text-sm text-theme-text-secondary mb-3">{description}</p>
      )}
      <SeparatorPrimitive.Root
        ref={ref}
        className="h-[1px] w-full bg-theme-border-primary"
        {...props}
      />
    </div>
  )
})
SectionSeparator.displayName = 'SectionSeparator'

interface MenuSeparatorProps
  extends React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root> {
  spacing?: 'sm' | 'md' | 'lg'
}

/**
 * Menu separator for navigation and dropdown menus
 * Provides consistent spacing for menu items
 */
export const MenuSeparator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  MenuSeparatorProps
>(({ className, spacing = 'md', ...props }, ref) => {
  const spacingClasses = {
    sm: 'my-1',
    md: 'my-2',
    lg: 'my-3',
  }

  return (
    <SeparatorPrimitive.Root
      ref={ref}
      className={cn(
        'h-[1px] bg-theme-border-primary',
        spacingClasses[spacing],
        className
      )}
      {...props}
    />
  )
})
MenuSeparator.displayName = 'MenuSeparator'

interface ContentSeparatorProps
  extends React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root> {
  spacing?: 'sm' | 'md' | 'lg' | 'xl'
  fade?: boolean
}

/**
 * Content separator for article and blog content
 * Provides visual breathing room between content sections
 */
export const ContentSeparator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  ContentSeparatorProps
>(({ className, spacing = 'lg', fade = false, ...props }, ref) => {
  const spacingClasses = {
    sm: 'my-4',
    md: 'my-6',
    lg: 'my-8',
    xl: 'my-12',
  }

  return (
    <div className={cn(spacingClasses[spacing], className)}>
      <SeparatorPrimitive.Root
        ref={ref}
        className={cn(
          'h-[1px] w-full',
          fade
            ? 'bg-gradient-to-r from-transparent via-theme-border-primary to-transparent'
            : 'bg-theme-border-primary'
        )}
        {...props}
      />
    </div>
  )
})
ContentSeparator.displayName = 'ContentSeparator'

interface VerticalSeparatorProps
  extends React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root> {
  height?: string | number
  spacing?: 'sm' | 'md' | 'lg'
}

/**
 * Vertical separator for inline content
 * Perfect for separating inline elements like breadcrumbs or tags
 */
export const VerticalSeparator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  VerticalSeparatorProps
>(({ className, height = '1rem', spacing = 'md', ...props }, ref) => {
  const spacingClasses = {
    sm: 'mx-1',
    md: 'mx-2',
    lg: 'mx-3',
  }

  return (
    <SeparatorPrimitive.Root
      ref={ref}
      orientation="vertical"
      className={cn(
        'w-[1px] bg-theme-border-primary',
        spacingClasses[spacing],
        className
      )}
      style={{ height: typeof height === 'number' ? `${height}px` : height }}
      {...props}
    />
  )
})
VerticalSeparator.displayName = 'VerticalSeparator'

// Legacy compatibility component
interface LegacySeparatorProps {
  type?: 'horizontal' | 'vertical'
  thickness?: number
  color?: string
  margin?: string
  className?: string
}

/**
 * Legacy compatibility wrapper for existing separator usage
 * @deprecated Use EnhancedSeparator or the base Separator component instead
 */
export const LegacySeparator = React.forwardRef<
  HTMLDivElement,
  LegacySeparatorProps
>(
  (
    { type = 'horizontal', thickness = 1, color, margin, className, ...props },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          type === 'horizontal'
            ? `h-[${thickness}px] w-full`
            : `w-[${thickness}px] h-full`,
          color || 'bg-theme-border-primary',
          margin || (type === 'horizontal' ? 'my-4' : 'mx-4'),
          className
        )}
        {...props}
      />
    )
  }
)
LegacySeparator.displayName = 'LegacySeparator'

export { Separator }

// Default export for backward compatibility
export default Separator
