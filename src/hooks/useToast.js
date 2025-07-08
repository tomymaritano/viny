import { useState, useCallback } from 'react'

export const useToast = () => {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'success', duration = 3000) => {
    const id = Date.now() + Math.random()
    const toast = {
      id,
      message,
      type,
      duration,
    }

    setToasts(current => [...current, toast])

    // Auto remove after duration
    setTimeout(() => {
      setToasts(current => current.filter(t => t.id !== id))
    }, duration + 300) // Add 300ms for exit animation

    return id
  }, [])

  const removeToast = useCallback(id => {
    setToasts(current => current.filter(toast => toast.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    setToasts([])
  }, [])

  return {
    toasts,
    addToast,
    removeToast,
    clearAll,
    // Convenience methods
    success: (message, duration) => addToast(message, 'success', duration),
    error: (message, duration) => addToast(message, 'error', duration),
    warning: (message, duration) => addToast(message, 'warning', duration),
    info: (message, duration) => addToast(message, 'info', duration),
  }
}
