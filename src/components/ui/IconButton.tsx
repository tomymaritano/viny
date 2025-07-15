import React from 'react'

interface IconButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  icon: React.ComponentType<{ size?: number; 'aria-hidden'?: string }>
  onClick: (e?: React.MouseEvent) => void
  isActive?: boolean
  title?: string
  size?: number
  variant?: 'default' | 'floating' | 'ghost'
  'aria-label'?: string
  'aria-pressed'?: boolean
  'aria-keyshortcuts'?: string
  className?: string
}

const IconButton: React.FC<IconButtonProps> = ({
  icon: Icon,
  onClick,
  isActive = false,
  title,
  size = 16,
  variant = 'default',
  className,
  'aria-label': ariaLabel,
  'aria-pressed': ariaPressed,
  'aria-keyshortcuts': ariaKeyshortcuts,
  ...restProps
}) => {
  if (variant === 'floating') {
    return (
      <button
        onClick={onClick}
        className={`p-2 rounded-full transition-all duration-300 border border-white/10 shadow-lg ${
          isActive
            ? 'text-white shadow-[#323D4B]/25'
            : 'text-theme-text-primary hover:scale-105 shadow-[#323D4B]/10'
        } ${className || ''}`}
        style={{
          backgroundColor: isActive
            ? 'rgba(50, 61, 75, 0.7)'
            : 'rgba(50, 61, 75, 0.15)',
          '--tw-shadow-color': '#323D4B',
        } as React.CSSProperties}
        onMouseEnter={(e) => {
          if (!isActive) {
            (e.target as HTMLButtonElement).style.backgroundColor = 'rgba(50, 61, 75, 0.25)'
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            (e.target as HTMLButtonElement).style.backgroundColor = 'rgba(50, 61, 75, 0.15)'
          }
        }}
        title={title}
        aria-label={ariaLabel || title}
        aria-pressed={ariaPressed}
        aria-keyshortcuts={ariaKeyshortcuts}
        {...restProps}
      >
        <Icon size={size} aria-hidden="true" />
      </button>
    )
  }

  // Ghost variant (minimal padding for sidebars)
  if (variant === 'ghost') {
    return (
      <button
        onClick={onClick}
        className={`p-0.5 rounded transition-all duration-200 ${
          isActive
            ? 'text-theme-accent-primary'
            : 'text-theme-text-muted hover:text-theme-text-primary'
        } ${className || ''}`}
        title={title}
        aria-label={ariaLabel || title}
        aria-pressed={ariaPressed}
        aria-keyshortcuts={ariaKeyshortcuts}
        {...restProps}
      >
        <Icon size={size} aria-hidden="true" />
      </button>
    )
  }

  // Default variant (toolbar style)
  return (
    <button
      onClick={onClick}
      className={`p-1.5 rounded-full transition-all duration-200 border ${
        isActive
          ? 'text-white border-white/20 bg-white/10'
          : 'text-theme-text-secondary hover:text-theme-text-primary border-transparent hover:border-white/10 hover:bg-white/5'
      } ${className || ''}`}
      title={title}
      aria-label={ariaLabel || title}
      aria-pressed={ariaPressed}
      aria-keyshortcuts={ariaKeyshortcuts}
      {...restProps}
    >
      <Icon size={size} aria-hidden="true" />
    </button>
  )
}

export default IconButton
