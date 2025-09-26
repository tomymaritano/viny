import React from 'react'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'

export interface ToastAction {
  label: string
  action: () => void
}

export interface ToastProps {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  details?: string
  duration?: number
  dismissible?: boolean
  actions?: ToastAction[]
  onDismiss: (id: string) => void
}

const Toast: React.FC<ToastProps> = ({
  id,
  type,
  message,
  details,
  dismissible = true,
  actions = [],
  onDismiss,
}) => {
  const getAccentStyles = () => {
    switch (type) {
      case 'success':
        return {
          bar: 'bg-theme-accent-green',
          icon: 'text-theme-accent-green',
          button: 'text-theme-accent-green',
        }
      case 'error':
        return {
          bar: 'bg-theme-accent-red',
          icon: 'text-theme-accent-red',
          button: 'text-theme-accent-red',
        }
      case 'warning':
        return {
          bar: 'bg-theme-accent-yellow',
          icon: 'text-theme-accent-yellow',
          button: 'text-theme-accent-yellow',
        }
      case 'info':
        return {
          bar: 'bg-theme-accent-primary',
          icon: 'text-theme-accent-primary',
          button: 'text-theme-accent-primary',
        }
    }
  }

  const styles = getAccentStyles()

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className={`w-5 h-5 ${styles.icon}`} />
      case 'error':
        return <AlertCircle className={`w-5 h-5 ${styles.icon}`} />
      case 'warning':
        return <AlertTriangle className={`w-5 h-5 ${styles.icon}`} />
      case 'info':
        return <Info className={`w-5 h-5 ${styles.icon}`} />
    }
  }

  return (
    <div
      className={`
      relative max-w-sm w-full pointer-events-auto
      bg-theme-bg-primary border border-theme-border-primary
      rounded-lg shadow-lg overflow-hidden
      transform transition-all duration-300 ease-in-out
    `}
    >
      {/* Accent bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${styles.bar}`} />

      <div className="pl-4 pr-3 py-3">
        <div className="flex items-start">
          <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
          <div className="ml-3 flex-1 min-w-0">
            <p className="text-sm font-medium text-theme-text-primary">
              {message}
            </p>
            {details && (
              <p className="mt-1 text-xs text-theme-text-secondary">
                {details}
              </p>
            )}
            {actions.length > 0 && (
              <div className="mt-2 flex gap-2">
                {actions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.action}
                    className={`
                      text-xs font-medium px-2 py-1 rounded
                      bg-theme-bg-secondary hover:bg-theme-bg-tertiary
                      ${styles.button} transition-colors
                    `}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          {dismissible && (
            <button
              onClick={() => onDismiss(id)}
              className="ml-3 flex-shrink-0 p-1 rounded hover:bg-theme-bg-secondary transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4 text-theme-text-muted hover:text-theme-text-primary" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export { Toast }
