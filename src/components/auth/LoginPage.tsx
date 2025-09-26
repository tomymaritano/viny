import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '../ui/Button'
import AuthInputFixed from './AuthInputFixed'
import { Icons } from '../Icons'
import { useAppStore } from '../../stores/newSimpleStore'
import { useToast } from '../../hooks/useToast'
import { cn } from '../../lib/utils'
import VantaFog from './VantaFog'
import { AUTH_THEME } from '../../config/authTheme'

interface LoginPageProps {
  onLoginSuccess?: () => void
  onSuccess?: () => void
  canSkip?: boolean
  onSkip?: () => void
}

interface FormData {
  email: string
  password: string
}

const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onSuccess,
  canSkip = false,
  onSkip,
}) => {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState<Partial<FormData>>({})

  const { login, isLoading, error, clearError } = useAppStore()
  const { showSuccess, showError } = useToast()

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {}

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    if (!validateForm()) {
      return
    }

    try {
      await login(formData.email, formData.password)
      showSuccess('Welcome back! You have successfully logged in.')
      onLoginSuccess?.()
      onSuccess?.()
    } catch (error) {
      showError('Login failed. Please check your credentials.')
    }
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
    clearError()
  }

  const isFormValid = formData.email && formData.password

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ backgroundColor: 'transparent' }}
    >
      {/* Vanta Fog Background */}
      <VantaFog
        backgroundAlpha={AUTH_THEME.vantaFog.backgroundAlpha}
        baseColor={AUTH_THEME.colors.vantaFog.baseColor}
        blurFactor={AUTH_THEME.vantaFog.blurFactor}
        gyroControls={AUTH_THEME.vantaFog.gyroControls}
        highlightColor={AUTH_THEME.colors.vantaFog.highlightColor}
        lowlightColor={AUTH_THEME.colors.vantaFog.lowlightColor}
        midtoneColor={AUTH_THEME.colors.vantaFog.midtoneColor}
        minHeight={AUTH_THEME.vantaFog.minHeight}
        minWidth={AUTH_THEME.vantaFog.minWidth}
        mouseControls={AUTH_THEME.vantaFog.mouseControls}
        scale={AUTH_THEME.vantaFog.scale}
        scaleMobile={AUTH_THEME.vantaFog.scaleMobile}
        speed={AUTH_THEME.vantaFog.speed}
        touchControls={AUTH_THEME.vantaFog.touchControls}
        zoom={AUTH_THEME.vantaFog.zoom}
      />

      {/* Login Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        {/* Logo */}
        <motion.div
          {...AUTH_THEME.animations.motionVariants.logoScale}
          className="flex justify-center mb-8"
        >
          <div
            className={cn(
              AUTH_THEME.components.logo.size,
              AUTH_THEME.components.logo.borderRadius,
              'flex items-center justify-center shadow-2xl'
            )}
            style={{
              background: 'linear-gradient(135deg, #533061 0%, #375968 100%)',
            }}
          >
            <Icons.NotebookPen
              size={AUTH_THEME.components.logo.iconSize}
              className={cn('text-white')}
            />
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          {...AUTH_THEME.animations.motionVariants.titleSlide}
          className="text-center mb-8"
        >
          <h1
            className={cn(
              AUTH_THEME.typography.sizes.title,
              'font-bold mb-2 font-heading'
            )}
            style={{
              fontFamily: AUTH_THEME.typography.fonts.heading,
              color: AUTH_THEME.colors.text.primary,
            }}
          >
            Log In to Viny
          </h1>
        </motion.div>

        {/* Form */}
        <motion.form
          {...AUTH_THEME.animations.motionVariants.formSlide}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Email Field */}
          <AuthInputFixed
            id="email"
            type="email"
            label=""
            placeholder="Enter your email"
            value={formData.email}
            onChange={value => handleInputChange('email', value)}
            icon={<Icons.Mail size={18} />}
            disabled={isLoading}
            error={errors.email}
            required
            autoFocus
          />

          {/* Password Field */}
          <AuthInputFixed
            id="password"
            type="password"
            label=""
            placeholder="Enter your password"
            value={formData.password}
            onChange={value => handleInputChange('password', value)}
            icon={<Icons.Lock size={18} />}
            disabled={isLoading}
            error={errors.password}
            required
            showPasswordToggle
          />

          {/* Forgot Password */}
          <div className="text-right">
            <button
              type="button"
              className="text-white/80 hover:text-white text-sm transition-colors font-body"
              onClick={() => console.log('Forgot password')}
            >
              Forgot your password?
            </button>
          </div>

          {/* Server Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl backdrop-blur-sm"
              >
                <div className="flex items-center gap-2">
                  <Icons.AlertCircle size={16} className="text-red-500" />
                  <p className="text-red-500 text-sm">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="glassmorphism"
            size="lg"
            disabled={!isFormValid || isLoading}
            loading={isLoading}
            className="w-full font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 font-body"
            style={{
              backgroundColor: AUTH_THEME.colors.interactive.primary,
              borderColor: AUTH_THEME.colors.interactive.primary,
              backgroundImage: 'none',
            }}
          >
            Log In
          </Button>

          {/* Skip Option */}
          {canSkip && (
            <div className="text-center pt-4">
              <button
                type="button"
                onClick={() => {
                  onSkip?.()
                  onSuccess?.()
                }}
                className="text-white/60 text-sm hover:text-white/80 transition-colors font-body"
              >
                Continue without account →
              </button>
            </div>
          )}

          {/* Register Link */}
          <div className="text-center pt-4 border-t border-white/20">
            <p className="text-white/80 text-sm font-body">
              Just getting started?{' '}
              <button
                type="button"
                onClick={() => window.open('https://viny.app/signup', '_blank')}
                className="text-white font-medium hover:text-white/90 transition-colors underline decoration-2 underline-offset-4 font-body"
              >
                Create an Account
              </button>
            </p>
          </div>
        </motion.form>
      </motion.div>
    </div>
  )
}

export default LoginPage
