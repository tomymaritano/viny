/**
 * Toast notification hook
 */
import { useState, useCallback } from 'react'
import { ToastAction } from '../components/ui/Toast'
import { generateToastId } from '../utils/idUtils'

export interface ToastData {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  details?: string
  duration?: number
  dismissible?: boolean
  actions?: ToastAction[]
}

export interface ShowToastOptions {
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  details?: string
  duration?: number
  dismissible?: boolean
  actions?: ToastAction[]
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastData[]>([])

  const showToast = useCallback((options: ShowToastOptions) => {
    const id = generateToastId()
    
    const newToast: ToastData = {
      id,
      ...options,
      duration: options.duration ?? getDefaultDuration(options.type),
      dismissible: options.dismissible ?? true
    }

    setToasts(prev => [...prev, newToast])

    // Auto-dismiss if duration is set
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        dismissToast(id)
      }, newToast.duration)
    }

    return id
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const dismissAllToasts = useCallback(() => {
    setToasts([])
  }, [])

  // Convenience methods
  const showSuccess = useCallback((message: string, options?: Partial<ShowToastOptions>) => {
    return showToast({ type: 'success', message, ...options })
  }, [showToast])

  const showError = useCallback((message: string, options?: Partial<ShowToastOptions>) => {
    return showToast({ type: 'error', message, ...options })
  }, [showToast])

  const showWarning = useCallback((message: string, options?: Partial<ShowToastOptions>) => {
    return showToast({ type: 'warning', message, ...options })
  }, [showToast])

  const showInfo = useCallback((message: string, options?: Partial<ShowToastOptions>) => {
    return showToast({ type: 'info', message, ...options })
  }, [showToast])

  return {
    toasts,
    showToast,
    dismissToast,
    dismissAllToasts,
    showSuccess,
    showError,
    showWarning,
    showInfo
  }
}

function getDefaultDuration(type: 'success' | 'error' | 'warning' | 'info'): number {
  switch (type) {
    case 'success':
      return 3000
    case 'info':
      return 4000
    case 'warning':
      return 5000
    case 'error':
      return 6000
    default:
      return 4000
  }
}