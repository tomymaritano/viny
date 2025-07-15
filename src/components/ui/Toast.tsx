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
  onDismiss
}) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />
    }
  }

  const getBorderColor = () => {
    switch (type) {
      case 'success':
        return 'border-l-green-500'
      case 'error':
        return 'border-l-red-500'
      case 'warning':
        return 'border-l-yellow-500'
      case 'info':
        return 'border-l-blue-500'
    }
  }

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20'
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20'
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20'
      case 'info':
        return 'bg-blue-50 dark:bg-blue-900/20'
    }
  }

  const getTextColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-800 dark:text-green-200'
      case 'error':
        return 'text-red-800 dark:text-red-200'
      case 'warning':
        return 'text-yellow-800 dark:text-yellow-200'
      case 'info':
        return 'text-blue-800 dark:text-blue-200'
    }
  }

  const getButtonColor = () => {
    switch (type) {
      case 'success':
        return 'hover:bg-green-100 dark:hover:bg-green-800/30 text-green-600 dark:text-green-400'
      case 'error':
        return 'hover:bg-red-100 dark:hover:bg-red-800/30 text-red-600 dark:text-red-400'
      case 'warning':
        return 'hover:bg-yellow-100 dark:hover:bg-yellow-800/30 text-yellow-600 dark:text-yellow-400'
      case 'info':
        return 'hover:bg-blue-100 dark:hover:bg-blue-800/30 text-blue-600 dark:text-blue-400'
    }
  }

  return (
    <div className={`
      max-w-md w-full shadow-lg rounded-lg pointer-events-auto overflow-hidden
      border-l-4 ${getBorderColor()} ${getBackgroundColor()}
      transform transition-all duration-300 ease-in-out
    `}>
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="ml-3 w-0 flex-1">
            <p className={`text-sm font-medium ${getTextColor()}`}>
              {message}
            </p>
            {details && (
              <p className={`mt-1 text-xs ${getTextColor()} opacity-75`}>
                {details}
              </p>
            )}
            {actions.length > 0 && (
              <div className="mt-3 flex space-x-2">
                {actions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.action}
                    className={`
                      text-xs font-medium px-3 py-1 rounded-md transition-colors
                      ${getButtonColor()}
                    `}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          {dismissible && (
            <div className="ml-4 flex-shrink-0 flex">
              <button
                onClick={() => onDismiss(id)}
                className={`
                  inline-flex rounded-md p-1.5 transition-colors
                  ${getButtonColor()}
                  focus:outline-none focus:ring-2 focus:ring-offset-2
                `}
              >
                <span className="sr-only">Dismiss</span>
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Toast