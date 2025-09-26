// Enhanced StyledButton using Radix primitives for backward compatibility
import React from 'react'
import { StyledButton as StyledButtonRadix } from './ButtonRadix'
import { useStyles, type StyleVariants } from '../../hooks/useStyles'

// Map legacy variants to new Radix variants
const variantMap: Record<
  StyleVariants['button'],
  'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
> = {
  default: 'default',
  primary: 'default',
  secondary: 'secondary',
  danger: 'destructive',
  ghost: 'ghost',
  outline: 'outline',
}

interface StyledButtonProps {
  variant?: StyleVariants['button']
  onClick?: () => void
  children: React.ReactNode
  disabled?: boolean
  className?: string
  type?: 'button' | 'submit' | 'reset'
  isLoading?: boolean
}

const StyledButton: React.FC<StyledButtonProps> = ({
  variant = 'default',
  onClick,
  children,
  disabled = false,
  className = '',
  type = 'button',
  isLoading = false,
  ...props
}) => {
  const radixVariant = variantMap[variant] || 'default'

  return (
    <StyledButtonRadix
      variant={radixVariant}
      onClick={onClick}
      disabled={disabled}
      className={className}
      type={type}
      isLoading={isLoading}
      {...props}
    >
      {children}
    </StyledButtonRadix>
  )
}

export default StyledButton
