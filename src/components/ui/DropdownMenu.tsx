import React, { forwardRef } from 'react'
import {
  DropdownMenu as RadixDropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem as RadixDropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuPortal,
} from './DropdownMenuRadix'
import { cn } from '../../lib/utils'

export interface DropdownMenuProps {
  isOpen: boolean
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  width?: string
  maxHeight?: string
  position?: string
  zIndex?: string
  onBlur?: () => void
  onClick?: (e: React.MouseEvent) => void
}

/**
 * Standard dropdown menu container for all dropdowns in the app
 * Now uses Radix UI internally for better accessibility and functionality
 *
 * @deprecated - Consider using the new Radix DropdownMenu components directly for new code
 */
const DropdownMenu = forwardRef<HTMLDivElement, DropdownMenuProps>(
  (
    {
      isOpen,
      children,
      className = '',
      style = {},
      width = 'w-full',
      maxHeight = 'max-h-60',
      position = 'top-full left-0',
      zIndex = 'z-50',
      ...props
    },
    ref
  ) => {
    if (!isOpen) return null

    const baseClasses = `absolute ${position} mt-1 ${width} min-w-fit bg-theme-bg-secondary border border-theme-border-primary rounded-lg shadow-xl backdrop-blur-sm py-1 ${zIndex} ${maxHeight} overflow-y-auto`

    return (
      <div
        ref={ref}
        className={cn(baseClasses, className)}
        style={style}
        {...props}
      >
        {children}
      </div>
    )
  }
)

DropdownMenu.displayName = 'DropdownMenu'

export interface DropdownMenuItemProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  disabled?: boolean
  selected?: boolean
  icon?: React.ReactNode
}

/**
 * Standard dropdown menu item
 * Now uses Radix UI internally for better accessibility
 */
export const DropdownMenuItem = forwardRef<
  HTMLButtonElement,
  DropdownMenuItemProps
>(
  (
    {
      children,
      onClick,
      className = '',
      disabled = false,
      selected = false,
      icon = null,
      ...props
    },
    ref
  ) => {
    const baseClasses = `w-full px-3 py-2 text-left text-xs text-theme-text-primary transition-colors flex items-center space-x-2`
    const stateClasses = disabled
      ? 'opacity-50 cursor-not-allowed'
      : selected
        ? 'bg-theme-bg-tertiary text-theme-text-primary'
        : 'hover:bg-theme-bg-tertiary hover:text-theme-text-primary cursor-pointer'

    return (
      <button
        ref={ref}
        type="button"
        className={cn(baseClasses, stateClasses, className, 'group')}
        onClick={disabled ? undefined : onClick}
        disabled={disabled}
        role="menuitem"
        {...props}
      >
        {icon && <span className="opacity-75 flex-shrink-0">{icon}</span>}
        <span className="flex-1 truncate">{children}</span>
      </button>
    )
  }
)

DropdownMenuItem.displayName = 'DropdownMenuItem'

export interface DropdownDividerProps {
  className?: string
}

/**
 * Standard dropdown divider
 */
export const DropdownDivider = ({ className = '' }: DropdownDividerProps) => (
  <div className={cn('border-t border-theme-border-primary my-1', className)} />
)

export interface DropdownHeaderProps {
  children: React.ReactNode
  className?: string
}

/**
 * Standard dropdown header/section
 */
export const DropdownHeader = ({
  children,
  className = '',
}: DropdownHeaderProps) => (
  <div
    className={cn(
      'px-3 py-2 text-xs font-medium text-theme-text-muted uppercase tracking-wide',
      className
    )}
  >
    {children}
  </div>
)

// New Radix-based components for modern usage
export interface ModernDropdownMenuProps {
  trigger: React.ReactNode
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  className?: string
  align?: 'start' | 'center' | 'end'
  side?: 'top' | 'right' | 'bottom' | 'left'
  sideOffset?: number
}

/**
 * Modern dropdown menu using Radix UI primitives
 * Recommended for new code - provides better accessibility and functionality
 */
export const ModernDropdownMenu = forwardRef<
  React.ElementRef<typeof RadixDropdownMenu>,
  ModernDropdownMenuProps
>(
  (
    {
      trigger,
      children,
      open,
      onOpenChange,
      className,
      align = 'start',
      side = 'bottom',
      sideOffset = 4,
      ...props
    },
    ref
  ) => {
    return (
      <RadixDropdownMenu open={open} onOpenChange={onOpenChange} {...props}>
        <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
        <DropdownMenuPortal>
          <DropdownMenuContent
            className={className}
            align={align}
            side={side}
            sideOffset={sideOffset}
          >
            {children}
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </RadixDropdownMenu>
    )
  }
)

ModernDropdownMenu.displayName = 'ModernDropdownMenu'

/**
 * Modern dropdown menu item using Radix UI
 * Recommended for new code
 */
export const ModernDropdownMenuItem = forwardRef<
  React.ElementRef<typeof RadixDropdownMenuItem>,
  React.ComponentPropsWithoutRef<typeof RadixDropdownMenuItem> & {
    icon?: React.ReactNode
  }
>(({ className, icon, children, ...props }, ref) => (
  <RadixDropdownMenuItem
    ref={ref}
    className={cn(
      'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors',
      'focus:bg-theme-accent-primary focus:text-theme-text-primary data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className
    )}
    {...props}
  >
    {icon && <span className="mr-2 h-4 w-4">{icon}</span>}
    {children}
  </RadixDropdownMenuItem>
))

ModernDropdownMenuItem.displayName = 'ModernDropdownMenuItem'

/**
 * Modern dropdown separator using Radix UI
 */
export const ModernDropdownSeparator = forwardRef<
  React.ElementRef<typeof DropdownMenuSeparator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuSeparator>
>(({ className, ...props }, ref) => (
  <DropdownMenuSeparator
    ref={ref}
    className={cn('-mx-1 my-1 h-px bg-theme-border-primary', className)}
    {...props}
  />
))

ModernDropdownSeparator.displayName = 'ModernDropdownSeparator'

/**
 * Modern dropdown label using Radix UI
 */
export const ModernDropdownLabel = forwardRef<
  React.ElementRef<typeof DropdownMenuLabel>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuLabel>
>(({ className, ...props }, ref) => (
  <DropdownMenuLabel
    ref={ref}
    className={cn('px-2 py-1.5 text-sm font-semibold', className)}
    {...props}
  />
))

ModernDropdownLabel.displayName = 'ModernDropdownLabel'

// Export the Radix components for direct usage
export {
  RadixDropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem as RadixDropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuPortal,
}

export default DropdownMenu
