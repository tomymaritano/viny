// Refactored App component using Container/Presentational pattern
import React from 'react'
import { AppContainer } from './components/app/AppContainer'
import './App.css'

/**
 * Main App component that delegates to the Container component
 * This follows the Container/Presentational pattern for better:
 * - Separation of concerns
 * - Testability
 * - Code reusability
 * - Maintainability
 */
export const AppSimple: React.FC = () => {
  return <AppContainer />
}