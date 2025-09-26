import React from 'react'
import { Icons } from '../Icons'
import ComponentErrorBoundary from '../errors/ComponentErrorBoundary'

interface SettingsErrorBoundaryProps {
  children: React.ReactNode
  settingsCategory?: string
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  onReset?: () => void
}

const SettingsErrorFallback: React.FC<{
  settingsCategory?: string
  onReset?: () => void
}> = ({ settingsCategory, onReset }) => (
  <div className="flex flex-col items-center justify-center p-8 bg-theme-bg-secondary rounded-lg border border-theme-border-primary">
    <div className="text-center max-w-md">
      <Icons.Settings
        size={48}
        className="text-theme-accent-primary mx-auto mb-4 opacity-50"
      />
      <h3 className="text-lg font-semibold text-theme-text-primary mb-2">
        Settings Error
      </h3>
      <p className="text-theme-text-secondary mb-4 text-sm">
        There was a problem loading{' '}
        {settingsCategory ? `the ${settingsCategory}` : 'this'} settings panel.
        Your settings are safe and this error won't affect your data.
      </p>

      <div className="bg-theme-accent-yellow/10 border border-theme-accent-yellow/20 rounded-lg p-3 mb-4">
        <div className="flex items-start space-x-2">
          <Icons.Info
            size={16}
            className="text-theme-accent-yellow mt-0.5 flex-shrink-0"
          />
          <div className="text-xs text-theme-text-muted">
            <strong>What this means:</strong>
            <ul className="mt-1 space-y-1 text-left">
              <li>• Your existing settings are preserved</li>
              <li>• Other settings panels should work normally</li>
              <li>• You can try refreshing or restart the app</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <button
          onClick={onReset}
          className="px-4 py-2 bg-theme-accent-primary hover:bg-theme-accent-primary/90 text-white text-sm rounded transition-colors"
        >
          <Icons.RefreshCw size={14} className="inline mr-2" />
          Try Again
        </button>

        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-theme-bg-tertiary hover:bg-theme-bg-quaternary text-theme-text-secondary text-sm rounded transition-colors"
        >
          <Icons.RotateCcw size={14} className="inline mr-2" />
          Refresh App
        </button>
      </div>
    </div>
  </div>
)

const SettingsErrorBoundary: React.FC<SettingsErrorBoundaryProps> = ({
  children,
  settingsCategory,
  onError,
  onReset,
}) => {
  return (
    <ComponentErrorBoundary
      componentName={`Settings${settingsCategory ? ` (${settingsCategory})` : ''}`}
      fallback={
        <SettingsErrorFallback
          settingsCategory={settingsCategory}
          onReset={onReset}
        />
      }
      onError={onError}
      onReset={onReset}
      allowReload={true}
      showDetails={process.env.NODE_ENV === 'development'}
    >
      {children}
    </ComponentErrorBoundary>
  )
}

export default SettingsErrorBoundary
