import React, { forwardRef } from 'react'

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
 * Provides consistent styling and positioning
 */
const DropdownMenu = forwardRef<HTMLDivElement, DropdownMenuProps>(({
  isOpen,
  children,
  className = '',
  style = {},
  width = 'w-full',
  maxHeight = 'max-h-60',
  position = 'top-full left-0',
  zIndex = 'z-50',
  ...props
}, ref) => {
  if (!isOpen) return null

  const baseClasses = `absolute ${position} mt-1 ${width} min-w-fit bg-theme-bg-secondary border border-theme-border-primary rounded-md shadow-lg py-1 ${zIndex} ${maxHeight} overflow-y-auto`

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
})

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
 * Provides consistent styling for menu options
 */
export const DropdownMenuItem = forwardRef<HTMLButtonElement, DropdownMenuItemProps>(({
  children,
  onClick,
  className = '',
  disabled = false,
  selected = false,
  icon = null,
  ...props
}, ref) => {
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
      className={`${baseClasses} ${stateClasses} ${className}`}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      role="menuitem"
      {...props}
    >
      {icon && (
        <span className="opacity-75 flex-shrink-0">
          {icon}
        </span>
      )}
      <span className="flex-1 truncate">{children}</span>
    </button>
  )
})

DropdownMenuItem.displayName = 'DropdownMenuItem'

export interface DropdownDividerProps {
  className?: string
}

/**
 * Standard dropdown divider
 */
export const DropdownDivider = ({ className = '' }: DropdownDividerProps) => (
  <div className={`border-t border-theme-border-primary my-1 ${className}`} />
)

export interface DropdownHeaderProps {
  children: React.ReactNode
  className?: string
}

/**
 * Standard dropdown header/section
 */
export const DropdownHeader = ({ children, className = '' }: DropdownHeaderProps) => (
  <div className={`px-3 py-2 text-xs font-medium text-theme-text-muted uppercase tracking-wide ${className}`}>
    {children}
  </div>
)

export default DropdownMenu