import * as React from 'react'
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'
import { cn } from '../../lib/utils'
import { radixStyles } from '../../lib/radix-theme'

const DropdownMenu = DropdownMenuPrimitive.Root

const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger

const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(radixStyles.dropdownMenu.content, className)}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
))
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName

const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
    inset?: boolean
    icon?: React.ReactNode
  }
>(({ className, inset, icon, children, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(radixStyles.dropdownMenu.item, inset && 'pl-8', className)}
    {...props}
  >
    {icon && <span className="mr-2 h-4 w-4 flex-shrink-0">{icon}</span>}
    {children}
  </DropdownMenuPrimitive.Item>
))
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName

const DropdownMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <DropdownMenuPrimitive.CheckboxItem
    ref={ref}
    className={cn(radixStyles.dropdownMenu.item, 'pl-8', className)}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
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
            d="M5 13l4 4L19 7"
          />
        </svg>
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.CheckboxItem>
))
DropdownMenuCheckboxItem.displayName =
  DropdownMenuPrimitive.CheckboxItem.displayName

const DropdownMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <DropdownMenuPrimitive.RadioItem
    ref={ref}
    className={cn(radixStyles.dropdownMenu.item, 'pl-8', className)}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <svg className="h-2 w-2 fill-current" viewBox="0 0 8 8">
          <circle cx={4} cy={4} r={2} />
        </svg>
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.RadioItem>
))
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName

const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    className={cn(radixStyles.dropdownMenu.label, inset && 'pl-8', className)}
    {...props}
  />
))
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName

const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={cn(radixStyles.dropdownMenu.separator, className)}
    {...props}
  />
))
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName

const DropdownMenuShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn(radixStyles.dropdownMenu.shortcut, className)}
      {...props}
    />
  )
}
DropdownMenuShortcut.displayName = 'DropdownMenuShortcut'

const DropdownMenuGroup = DropdownMenuPrimitive.Group

const DropdownMenuPortal = DropdownMenuPrimitive.Portal

const DropdownMenuSub = DropdownMenuPrimitive.Sub

const DropdownMenuSubContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.SubContent
    ref={ref}
    className={cn(radixStyles.dropdownMenu.content, className)}
    {...props}
  />
))
DropdownMenuSubContent.displayName =
  DropdownMenuPrimitive.SubContent.displayName

const DropdownMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> & {
    inset?: boolean
  }
>(({ className, inset, children, ...props }, ref) => (
  <DropdownMenuPrimitive.SubTrigger
    ref={ref}
    className={cn(radixStyles.dropdownMenu.item, inset && 'pl-8', className)}
    {...props}
  >
    {children}
    <svg
      className="ml-auto h-4 w-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5l7 7-7 7"
      />
    </svg>
  </DropdownMenuPrimitive.SubTrigger>
))
DropdownMenuSubTrigger.displayName =
  DropdownMenuPrimitive.SubTrigger.displayName

const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup

// Legacy compatibility components
export interface LegacyDropdownMenuProps {
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
 * Legacy compatibility wrapper for existing DropdownMenu usage
 * @deprecated Use the new Radix-based DropdownMenu components instead
 */
export const LegacyDropdownMenu = React.forwardRef<
  HTMLDivElement,
  LegacyDropdownMenuProps
>(
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
        className={`${baseClasses} ${className}`}
        style={style}
        {...props}
      >
        {children}
      </div>
    )
  }
)

LegacyDropdownMenu.displayName = 'LegacyDropdownMenu'

export interface LegacyDropdownMenuItemProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  disabled?: boolean
  selected?: boolean
  icon?: React.ReactNode
}

/**
 * Legacy compatibility wrapper for existing DropdownMenuItem usage
 * @deprecated Use the new Radix-based DropdownMenuItem instead
 */
export const LegacyDropdownMenuItem = React.forwardRef<
  HTMLButtonElement,
  LegacyDropdownMenuItemProps
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
        className={`${baseClasses} ${stateClasses} ${className} group`}
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

LegacyDropdownMenuItem.displayName = 'LegacyDropdownMenuItem'

export interface LegacyDropdownDividerProps {
  className?: string
}

/**
 * Legacy compatibility wrapper for existing DropdownDivider usage
 * @deprecated Use the new Radix-based DropdownMenuSeparator instead
 */
export const LegacyDropdownDivider = ({
  className = '',
}: LegacyDropdownDividerProps) => (
  <div className={`border-t border-theme-border-primary my-1 ${className}`} />
)

export interface LegacyDropdownHeaderProps {
  children: React.ReactNode
  className?: string
}

/**
 * Legacy compatibility wrapper for existing DropdownHeader usage
 * @deprecated Use the new Radix-based DropdownMenuLabel instead
 */
export const LegacyDropdownHeader = ({
  children,
  className = '',
}: LegacyDropdownHeaderProps) => (
  <div
    className={`px-3 py-2 text-xs font-medium text-theme-text-muted uppercase tracking-wide ${className}`}
  >
    {children}
  </div>
)

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
}

// Default export for backward compatibility
export default DropdownMenu
