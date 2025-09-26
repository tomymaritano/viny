import React, { useEffect, useState, useMemo } from 'react'
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react'
import {
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
} from './RadixToast'

export interface ToastAction {
  label: string
  action: () => void
}

interface ToastData {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  details?: string
  duration?: number
  dismissible?: boolean
  actions?: ToastAction[]
}

interface ToastContainerProps {
  toasts: ToastData[]
  onDismiss: (id: string) => void
  maxToasts?: number
}

const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts = [],
  onDismiss,
  maxToasts = 5,
}) => {
  const [mountedToasts, setMountedToasts] = useState<ToastData[]>([])

  // Memoize the sliced toasts to prevent unnecessary updates
  const limitedToasts = useMemo(
    () => (toasts || []).slice(0, maxToasts),
    [toasts, maxToasts]
  )

  // Update mounted toasts only when limitedToasts actually changes
  useEffect(() => {
    setMountedToasts(prevToasts => {
      // Only update if the toast IDs have changed
      const currentIds = prevToasts.map(t => t.id).join(',')
      const newIds = limitedToasts.map(t => t.id).join(',')
      
      if (currentIds !== newIds) {
        return limitedToasts
      }
      return prevToasts
    })
  }, [limitedToasts])

  if (mountedToasts.length === 0) return null

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-theme-accent-green" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-theme-accent-red" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-theme-accent-yellow" />
      case 'info':
        return <Info className="w-5 h-5 text-theme-accent-primary" />
    }
  }

  const getVariant = (type: string) => {
    return type === 'error' ? 'destructive' : 'default'
  }

  return (
    <>
      {mountedToasts.map(toast => (
        <Toast
          key={toast.id}
          variant={getVariant(toast.type)}
          duration={toast.duration || 5000}
          onOpenChange={open => {
            if (!open) {
              onDismiss(toast.id)
            }
          }}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">{getIcon(toast.type)}</div>
            <div className="flex-1 min-w-0">
              <ToastTitle className="text-sm font-medium text-theme-text-primary">
                {toast.message}
              </ToastTitle>
              {toast.details && (
                <ToastDescription className="mt-1 text-xs text-theme-text-secondary">
                  {toast.details}
                </ToastDescription>
              )}
              {toast.actions && toast.actions.length > 0 && (
                <div className="mt-2 flex gap-2">
                  {toast.actions.map((action, index) => (
                    <ToastAction
                      key={index}
                      onClick={action.action}
                      className="text-xs font-medium px-2 py-1 rounded bg-theme-bg-secondary hover:bg-theme-bg-tertiary transition-colors"
                    >
                      {action.label}
                    </ToastAction>
                  ))}
                </div>
              )}
            </div>
          </div>
          {toast.dismissible !== false && (
            <ToastClose className="flex-shrink-0">
              <X className="w-4 h-4" />
            </ToastClose>
          )}
        </Toast>
      ))}
    </>
  )
}

export { ToastContainer }
