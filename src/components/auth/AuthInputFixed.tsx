import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Icons } from '../Icons'
import { cn } from '../../lib/utils'
import { AUTH_THEME } from '../../config/authTheme'

interface AuthInputProps {
  id: string
  type: 'email' | 'password' | 'text'
  label: string
  placeholder?: string
  value: string
  onChange: (value: string) => void
  error?: string
  disabled?: boolean
  required?: boolean
  autoFocus?: boolean
  icon?: React.ReactNode
  showPasswordToggle?: boolean
  className?: string
}

const AuthInputFixed: React.FC<AuthInputProps> = ({
  id,
  type,
  label,
  placeholder,
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  autoFocus = false,
  icon,
  showPasswordToggle = false,
  className,
}) => {
  const [showPassword, setShowPassword] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  const inputType =
    type === 'password' ? (showPassword ? 'text' : 'password') : type
  const hasValue = value.length > 0
  const hasError = !!error

  /*
   * CÁLCULOS MATEMÁTICOS PRECISOS PARA EVITAR SOLAPAMIENTO:
   *
   * ICONO IZQUIERDO:
   * - Posición del icono: left-4 (16px desde el borde)
   * - Ancho del icono: 18px
   * - Espaciado mínimo después del icono: 10px
   * - Total padding izquierdo necesario: 16px + 18px + 10px = 44px = pl-11
   *
   * BOTÓN TOGGLE DERECHO:
   * - Posición del botón: right-4 (16px desde el borde)
   * - Ancho del botón: 18px
   * - Espaciado mínimo antes del botón: 10px
   * - Total padding derecho necesario: 16px + 18px + 10px = 44px = pr-11
   *
   * NOTA: Esta matemática garantiza que NO haya solapamiento entre iconos y texto
   */
  const getPaddingClasses = () => {
    if (icon && showPasswordToggle && type === 'password') {
      return AUTH_THEME.components.input.padding.withBoth
    } else if (icon) {
      return AUTH_THEME.components.input.padding.withIcon
    } else if (showPasswordToggle && type === 'password') {
      return AUTH_THEME.components.input.padding.withToggle
    } else {
      return AUTH_THEME.components.input.padding.default
    }
  }

  const getInputClasses = () => {
    return cn(
      // Base styles
      'w-full',
      AUTH_THEME.components.input.height,
      AUTH_THEME.components.input.borderRadius,
      AUTH_THEME.components.input.borderWidth,
      AUTH_THEME.animations.transitions.default,
      'focus:outline-none font-body',
      // Custom styling
      AUTH_THEME.effects.blur.backdrop,
      'placeholder-gray-400',
      // Dynamic padding based on icons
      getPaddingClasses(),
      // State-based styles
      hasError
        ? 'border-red-400 text-red-300 shadow-md'
        : isFocused
          ? cn(
              AUTH_THEME.effects.shadows.focus,
              AUTH_THEME.effects.transforms.scale.focus,
              'ring-2 ring-blue-200/50'
            )
          : hasValue
            ? AUTH_THEME.effects.shadows.default
            : '',
      // Hover effect
      'hover:border-gray-500 hover:shadow-lg',
      // Disabled state
      disabled && 'opacity-50 cursor-not-allowed'
    )
  }

  return (
    <div className={cn('relative space-y-2', className)}>
      {/* Label */}
      {label && (
        <label
          htmlFor={id}
          className={cn(
            'block text-sm font-medium transition-colors duration-200',
            hasError ? 'text-red-500' : 'text-theme-text-primary'
          )}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Input Container */}
      <div className="relative">
        {/* Left Icon - Positioned at 16px from left */}
        {icon && (
          <div
            className={cn(
              'absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none transition-colors duration-300 z-10',
              hasError
                ? AUTH_THEME.colors.interactive.iconError
                : isFocused
                  ? AUTH_THEME.colors.interactive.iconFocus
                  : AUTH_THEME.colors.interactive.icon
            )}
          >
            {icon}
          </div>
        )}

        {/* Input Field */}
        <input
          id={id}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          autoFocus={autoFocus}
          className={getInputClasses()}
          style={{
            backgroundColor: AUTH_THEME.colors.background.input,
            borderColor: AUTH_THEME.colors.background.inputBorder,
            color: AUTH_THEME.colors.text.primary,
            ...(!hasError &&
              isFocused && {
                backgroundColor: AUTH_THEME.colors.background.input,
                borderColor: AUTH_THEME.colors.background.inputBorderFocus,
              }),
            ...(!hasError &&
              hasValue && {
                backgroundColor: AUTH_THEME.colors.background.input,
                borderColor: AUTH_THEME.colors.background.inputBorder,
              }),
            ...(!hasError &&
              !isFocused &&
              !hasValue && {
                backgroundColor: AUTH_THEME.colors.background.input,
                borderColor: AUTH_THEME.colors.background.inputBorder,
              }),
          }}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${id}-error` : undefined}
        />

        {/* Password Toggle Button - Positioned at 16px from right */}
        {showPasswordToggle && type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 rounded-lg text-gray-700 hover:text-gray-900 hover:bg-white/30 transition-all duration-200 focus:outline-none z-10"
            disabled={disabled}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <Icons.EyeOff size={AUTH_THEME.components.input.iconSize} />
            ) : (
              <Icons.Eye size={AUTH_THEME.components.input.iconSize} />
            )}
          </button>
        )}
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {hasError && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2 p-3 bg-red-50/20 border border-red-200/50 rounded-lg text-red-600 text-sm"
            id={`${id}-error`}
            role="alert"
          >
            <Icons.AlertCircle size={16} className="flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AuthInputFixed
