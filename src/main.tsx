import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './AppSimple.tsx'
import SettingsStandalone from './SettingsStandalone.tsx'
import ErrorBoundary from './components/ErrorBoundary.tsx'
import { runMigration } from './utils/migration.js'
import { logComponentError } from './services/errorLogger'
import { setupDevHelpers } from './utils/devHelpers'

// Import simple titlebar CSS for manual dragging
import './styles/titlebar-simple.css'

// Run migration before app initialization
runMigration()
// Migration completed

// Setup development helpers
setupDevHelpers()

// Check if we should render settings based on URL hash
const isSettingsRoute = window.location.hash === '#/settings'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // Log to centralized error service
        logComponentError('Global', error, errorInfo, {
          route: window.location.hash,
          timestamp: new Date().toISOString()
        })
      }}
    >
      {isSettingsRoute ? <SettingsStandalone /> : <App />}
    </ErrorBoundary>
  </React.StrictMode>
)
