// Refactored App component using Container/Presentational pattern
import React from 'react'
import { AppContainerWrapper } from './components/app/AppContainerWrapper'
import { OptionalAuthGuard } from './components/auth/OptionalAuthGuard'
import './App.css'
import './styles/auth.css'

/**
 * Main App component that delegates to the Container component
 * This follows the Container/Presentational pattern for better:
 * - Separation of concerns
 * - Testability
 * - Code reusability
 * - Maintainability
 */
export const AppSimple: React.FC = () => {
  return (
    <OptionalAuthGuard requireAuth={false}>
      <AppContainerWrapper />
    </OptionalAuthGuard>
  )
}
