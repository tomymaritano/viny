import React, { useEffect, useState } from 'react'
import { useAppStore } from '../../stores/newSimpleStore'
import LoginPage from './LoginPage'
import LoadingSpinner from '../ui/LoadingSpinner'
import { useToast } from '../../hooks/useToast'
import { Icons } from '../Icons'
import { apiLogger } from '../../utils/logger'

interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children, fallback }) => {
  const { isAuthenticated, isLoading, user, verifyToken, accessToken } =
    useAppStore()
  const { showWarning } = useToast()
  const [isInitializing, setIsInitializing] = useState(true)
  const [showAuthModal, setShowAuthModal] = useState(false)

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // If we have a token, verify it
        if (accessToken) {
          const isValid = await verifyToken()
          if (!isValid) {
            setShowAuthModal(true)
            showWarning('Session Expired', {
              details: 'Please sign in again to continue.',
            })
          }
        } else {
          // No token, show auth modal
          setShowAuthModal(true)
        }
      } catch (error) {
        apiLogger.error('Auth initialization error:', error)
        setShowAuthModal(true)
      } finally {
        setIsInitializing(false)
      }
    }

    initializeAuth()
  }, [accessToken, verifyToken, showWarning])

  // Show loading spinner during initialization
  if (isInitializing || isLoading) {
    return (
      <div className="flex items-center justify-center h-screen auth-gradient-animated">
        <div className="relative z-10 text-center">
          <div className="mb-8">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-theme-accent-primary to-theme-accent-cyan rounded-3xl flex items-center justify-center shadow-2xl">
                <Icons.NotebookPen size={40} className="text-white" />
              </div>
            </div>
            <LoadingSpinner size="xl" className="mb-4" />
            <h2 className="text-2xl font-bold text-theme-text-primary mb-2">
              Initializing Viny
            </h2>
            <p className="text-theme-text-secondary">
              Setting up your workspace...
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Show login page if not authenticated
  if (!isAuthenticated || showAuthModal) {
    return (
      <LoginPage
        onLoginSuccess={() => {
          setShowAuthModal(false)
        }}
      />
    )
  }

  // User is authenticated, render children
  return <>{children}</>
}

export default AuthGuard
