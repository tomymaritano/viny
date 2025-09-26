/**
 * OptionalAuthGuard - Authentication wrapper that allows the app to work without auth server
 *
 * Features:
 * - Works offline without auth server
 * - Optional authentication for sync features
 * - Graceful degradation
 */

import React, { useEffect, useState } from 'react'
import { useAppStore } from '../../stores/newSimpleStore'
import LoginPage from './LoginPage'
import { useToast } from '../../hooks/useToast'
import { Icons } from '../Icons'
import { apiLogger } from '../../utils/logger'

interface OptionalAuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
}

export const OptionalAuthGuard: React.FC<OptionalAuthGuardProps> = ({
  children,
  requireAuth = false,
}) => {
  const { isAuthenticated, isLoading, verifyToken, accessToken, logout } =
    useAppStore()
  const { showInfo } = useToast()
  const [isInitializing, setIsInitializing] = useState(true)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authCheckFailed, setAuthCheckFailed] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if auth is required by environment
        const authRequired =
          import.meta.env.VITE_AUTH_REQUIRED === 'true' || requireAuth

        // If we have a token, try to verify it
        if (accessToken) {
          try {
            const isValid = await verifyToken()
            if (!isValid && authRequired) {
              setShowAuthModal(true)
            }
          } catch (error) {
            // Auth server not available - continue without auth
            apiLogger.info('Auth server not available, continuing in offline mode')
            setAuthCheckFailed(true)

            // Clear invalid token
            logout()

            if (!authRequired) {
              showInfo('Working offline', {
                details:
                  'Authentication server not available. Some features may be limited.',
              })
            }
          }
        } else if (authRequired) {
          // No token and auth is required
          setShowAuthModal(true)
        }
      } catch (error) {
        apiLogger.error('Auth check error:', error)
        setAuthCheckFailed(true)
      } finally {
        setIsInitializing(false)
      }
    }

    checkAuth()
  }, [accessToken, verifyToken, logout, showInfo, requireAuth])

  // Show loading during initialization
  if (isInitializing || (isLoading && !authCheckFailed)) {
    return (
      <div className="flex items-center justify-center h-screen bg-theme-bg-primary">
        <div className="text-center">
          <Icons.Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-theme-accent-primary" />
          <p className="text-theme-text-secondary">Loading...</p>
        </div>
      </div>
    )
  }

  // Show auth modal if required
  if (showAuthModal && !isAuthenticated) {
    return (
      <LoginPage
        onSuccess={() => setShowAuthModal(false)}
        canSkip={!requireAuth}
        onSkip={() => setShowAuthModal(false)}
      />
    )
  }

  // Render children - app works with or without auth
  return <>{children}</>
}

// Export a hook to check auth status in components
export const useOptionalAuth = () => {
  const { isAuthenticated, user } = useAppStore()
  const isOffline = !isAuthenticated && !user

  return {
    isAuthenticated,
    isOffline,
    user,
    canSync: isAuthenticated,
    canShare: isAuthenticated,
    canCollaborate: isAuthenticated,
  }
}
