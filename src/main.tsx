import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './AppSimple.tsx'
import SettingsStandalone from './SettingsStandalone.tsx'
import ErrorBoundary from './components/ErrorBoundary.tsx'
import { runMigration } from './utils/migration.js'

// Run migration before app initialization
runMigration()
// Migration completed

// Check if we should render settings based on URL hash
const isSettingsRoute = window.location.hash === '#/settings'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // Log to console in development
        console.error('Global Error Boundary:', error, errorInfo)

        // In production, you'd send this to an error reporting service
        // like Sentry, LogRocket, etc.
      }}
    >
      {isSettingsRoute ? <SettingsStandalone /> : <App />}
    </ErrorBoundary>
  </React.StrictMode>
)