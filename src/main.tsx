import React, { lazy, Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { AppSimple as App } from './AppSimple.tsx'
import { ErrorBoundary } from './components/ErrorBoundary.tsx'
import { QueryProvider } from './lib/queryClientWithPersistence'
import { featureFlags } from './config/featureFlags'

// Storage recovery handled by repository pattern

// Lazy load standalone components for better initial performance
const SettingsStandalone = lazy(() =>
  import('./SettingsStandalone.tsx').then(module => ({
    default: module.SettingsStandalone,
  }))
)
const NoteStandalone = lazy(() =>
  import('./NoteStandalone.tsx').then(module => ({
    default: module.NoteStandalone,
  }))
)
import { ServiceProvider } from './services/ServiceProvider'
import { ServiceProviderV2 } from './contexts/ServiceProviderV2'
import { ModalProvider } from './contexts/ModalContext'
// import { MigrationService } from './lib/migration' // removed - not needed with new architecture
import { logComponentError } from './services/errorLogger'
import { setupDevHelpers } from './utils/devHelpers'
import './utils/debugNotebooks' // Import debug utilities
// import './utils/notebookDebug' // Import debug utilities - removed
// import './utils/notebookTesting' // Import testing utilities - removed

// Import simple titlebar CSS for manual dragging
import './styles/titlebar-simple.css'
import { initLogger } from './utils/logger'

// Add loading screen styles
const loadingStyles = `
  .loading-screen {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
    background: var(--background-color, #fff);
    color: var(--text-color, #333);
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 16px;
  }
  
  .loading-screen::after {
    content: '';
    width: 20px;
    height: 20px;
    margin-left: 10px;
    border: 2px solid transparent;
    border-top: 2px solid currentColor;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`

// Inject loading styles
const styleSheet = document.createElement('style')
styleSheet.textContent = loadingStyles
document.head.appendChild(styleSheet)

// Migration now handled automatically by storage services

// Setup development helpers
setupDevHelpers()

// Import AI test utility for development
if (import.meta.env.DEV) {
  import('./utils/ai-test')
}

initLogger.info('🚀 MAIN.TSX LOADED - APP STARTING')

// Preload popular syntax highlighting languages after app loads
import('./lib/markdown').then(module => {
  if (module.preloadPopularLanguages) {
    module.preloadPopularLanguages()
  }
})

// Preload critical components after initial render
import('./components/LazyComponents').then(module => {
  if (module.preloadCriticalComponents) {
    // Wait a bit before preloading to not interfere with initial render
    setTimeout(() => {
      module.preloadCriticalComponents()
    }, 1000)
  }
})

// Check which route to render based on URL hash
const isSettingsRoute = window.location.hash === '#/settings'
const isNoteRoute = window.location.hash.startsWith('#/note/')

// Select service provider based on feature flag
const ServiceProviderWrapper = featureFlags.useCleanArchitecture ? ServiceProviderV2 : ServiceProvider

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryProvider>
      <ServiceProviderWrapper>
        <ModalProvider>
          <ErrorBoundary
            onError={(error, errorInfo) => {
              // Log to centralized error service
              logComponentError('Global', error, errorInfo, {
                route: window.location.hash,
                timestamp: new Date().toISOString(),
              })
            }}
          >
            {isSettingsRoute ? (
              <Suspense
                fallback={
                  <div className="loading-screen">Loading Settings...</div>
                }
              >
                <SettingsStandalone />
              </Suspense>
            ) : isNoteRoute ? (
              <Suspense
                fallback={<div className="loading-screen">Loading Note...</div>}
              >
                <NoteStandalone />
              </Suspense>
            ) : (
              <App />
            )}
          </ErrorBoundary>
        </ModalProvider>
      </ServiceProviderWrapper>
    </QueryProvider>
  </React.StrictMode>
)
