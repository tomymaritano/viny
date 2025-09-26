import React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { Toggle } from '@radix-ui/react-toggle'
import { cn } from '../../lib/utils'

// Base button variants and sizes
const buttonVariants = {
  variant: {
    default:
      'bg-theme-accent-primary text-white hover:bg-theme-accent-primary/90',
    destructive: 'bg-red-500 text-white hover:bg-red-600',
    outline:
      'border border-theme-border-primary bg-transparent hover:bg-theme-bg-tertiary text-theme-text-primary',
    secondary:
      'bg-theme-bg-tertiary text-theme-text-primary hover:bg-theme-bg-tertiary/80',
    ghost: 'hover:bg-theme-bg-tertiary text-theme-text-primary',
    link: 'text-theme-accent-primary underline-offset-4 hover:underline',
  },
  size: {
    xs: 'h-6 px-2 text-xs',
    sm: 'h-8 px-3 text-sm',
    default: 'h-9 px-4 py-2',
    lg: 'h-10 px-8',
    icon: 'h-9 w-9',
  },
}

const baseButtonStyles =
  'inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof buttonVariants.variant
  size?: keyof typeof buttonVariants.size
  asChild?: boolean
  isLoading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'default',
      size = 'default',
      asChild = false,
      isLoading = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button'

    return (
      <Comp
        className={cn(
          baseButtonStyles,
          buttonVariants.variant[variant],
          buttonVariants.size[size],
          isLoading && 'opacity-50 cursor-not-allowed',
          className
        )}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        {children}
      </Comp>
    )
  }
)
Button.displayName = 'Button'

// Enhanced IconButton using Radix primitives
export interface IconButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  icon: React.ComponentType<{ size?: number; 'aria-hidden'?: string }>
  onClick: (e?: React.MouseEvent) => void
  isActive?: boolean
  variant?: 'default' | 'floating' | 'ghost' | 'toggle'
  size?: number
  asChild?: boolean
  'aria-label'?: string
  'aria-pressed'?: boolean
  'aria-keyshortcuts'?: string
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      icon: Icon,
      onClick,
      isActive = false,
      variant = 'default',
      size = 16,
      asChild = false,
      className,
      title,
      'aria-label': ariaLabel,
      'aria-pressed': ariaPressed,
      'aria-keyshortcuts': ariaKeyshortcuts,
      ...props
    },
    ref
  ) => {
    // Use Toggle for stateful buttons
    if (variant === 'toggle') {
      return (
        <Toggle
          ref={ref}
          pressed={isActive}
          onPressedChange={pressed => {
            // Create a synthetic event for compatibility
            const syntheticEvent = {
              preventDefault: () => {},
              stopPropagation: () => {},
              target: { pressed },
            } as unknown as React.MouseEvent
            onClick(syntheticEvent)
          }}
          className={cn(
            'p-1.5 rounded-md transition-all duration-200 border data-[state=on]:bg-theme-accent-primary/10 data-[state=on]:text-theme-accent-primary data-[state=off]:text-theme-text-secondary hover:text-theme-text-primary data-[state=off]:border-transparent hover:border-theme-border-primary data-[state=on]:border-theme-accent-primary/20',
            className
          )}
          title={title}
          aria-label={ariaLabel || title}
          aria-keyshortcuts={ariaKeyshortcuts}
          {...props}
        >
          <Icon size={size} aria-hidden="true" />
        </Toggle>
      )
    }

    // Floating variant with enhanced styling
    if (variant === 'floating') {
      const Comp = asChild ? Slot : 'button'
      return (
        <Comp
          ref={ref}
          onClick={onClick}
          className={cn(
            'p-2 rounded-full transition-all duration-300 border border-white/10 shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent-primary focus-visible:ring-offset-2',
            isActive
              ? 'text-white shadow-[#323D4B]/25 bg-[rgba(50,61,75,0.7)]'
              : 'text-theme-text-primary hover:scale-105 shadow-[#323D4B]/10 bg-[rgba(50,61,75,0.15)] hover:bg-[rgba(50,61,75,0.25)]',
            className
          )}
          title={title}
          aria-label={ariaLabel || title}
          aria-pressed={ariaPressed}
          aria-keyshortcuts={ariaKeyshortcuts}
          {...props}
        >
          <Icon size={size} aria-hidden="true" />
        </Comp>
      )
    }

    // Ghost variant (minimal)
    if (variant === 'ghost') {
      const Comp = asChild ? Slot : 'button'
      return (
        <Comp
          ref={ref}
          onClick={onClick}
          className={cn(
            'p-0.5 rounded transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent-primary focus-visible:ring-offset-1',
            isActive
              ? 'text-theme-accent-primary'
              : 'text-theme-text-muted hover:text-theme-text-primary',
            className
          )}
          title={title}
          aria-label={ariaLabel || title}
          aria-pressed={ariaPressed}
          aria-keyshortcuts={ariaKeyshortcuts}
          {...props}
        >
          <Icon size={size} aria-hidden="true" />
        </Comp>
      )
    }

    // Default variant (enhanced with Radix accessibility)
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        ref={ref}
        onClick={onClick}
        className={cn(
          'p-1.5 rounded-full transition-all duration-200 border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent-primary focus-visible:ring-offset-2',
          isActive
            ? 'text-white border-white/20 bg-white/10'
            : 'text-theme-text-secondary hover:text-theme-text-primary border-transparent hover:border-white/10 hover:bg-white/5',
          className
        )}
        title={title}
        aria-label={ariaLabel || title}
        aria-pressed={ariaPressed}
        aria-keyshortcuts={ariaKeyshortcuts}
        {...props}
      >
        <Icon size={size} aria-hidden="true" />
      </Comp>
    )
  }
)
IconButton.displayName = 'IconButton'

// Enhanced StyledButton using Radix Slot
export interface StyledButtonProps extends ButtonProps {
  variant?: keyof typeof buttonVariants.variant
  isLoading?: boolean
}

const StyledButton = React.forwardRef<HTMLButtonElement, StyledButtonProps>(
  (
    {
      variant = 'default',
      size = 'default',
      isLoading = false,
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        isLoading={isLoading}
        className={className}
        {...props}
      >
        {children}
      </Button>
    )
  }
)
StyledButton.displayName = 'StyledButton'

export { Button, IconButton, StyledButton }
export default Button
