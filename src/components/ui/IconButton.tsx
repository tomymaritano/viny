// Enhanced IconButton using Radix primitives for better accessibility and state management
import React from 'react'
import { IconButton as IconButtonRadix } from './ButtonRadix'

interface IconButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  icon: React.ComponentType<{ size?: number; 'aria-hidden'?: string }>
  onClick: (e?: React.MouseEvent) => void
  isActive?: boolean
  title?: string
  size?: number
  variant?: 'default' | 'floating' | 'ghost' | 'toggle'
  'aria-label'?: string
  'aria-pressed'?: boolean
  'aria-keyshortcuts'?: string
  className?: string
}

const IconButton: React.FC<IconButtonProps> = props => {
  return <IconButtonRadix {...props} />
}

export default IconButton
