// Simplified StyledButton for backward compatibility
import React from 'react'
import { useStyles, type StyleVariants } from '../../hooks/useStyles'

interface StyledButtonProps {
  variant?: StyleVariants['button']
  onClick?: () => void
  children: React.ReactNode
  disabled?: boolean
  className?: string
}

const StyledButton: React.FC<StyledButtonProps> = ({
  variant = 'default',
  onClick,
  children,
  disabled = false,
  className = ''
}) => {
  const styles = useStyles()
  
  const buttonClass = styles.cn(
    styles.button(variant),
    disabled && 'opacity-50 cursor-not-allowed',
    className
  )
  
  return (
    <button
      className={buttonClass}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

export default StyledButton