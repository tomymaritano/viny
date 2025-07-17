import { StateCreator } from 'zustand'

export interface ToastAction {
  label: string
  action: () => void
}

export interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  details?: string
  duration?: number
  timestamp: string
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

export interface ToastSlice {
  // Toast state
  toasts: Toast[]

  // Toast actions
  addToast: (toast: Omit<Toast, 'id' | 'timestamp'>) => void
  removeToast: (id: string) => void
  clearAllToasts: () => void
  showToast: (options: ShowToastOptions) => string
  showSuccess: (message: string, options?: Partial<ShowToastOptions>) => string
  showError: (message: string, options?: Partial<ShowToastOptions>) => string
  showWarning: (message: string, options?: Partial<ShowToastOptions>) => string
  showInfo: (message: string, options?: Partial<ShowToastOptions>) => string
}

export const createToastSlice: StateCreator<ToastSlice> = (set, get) => ({
  // Initial state
  toasts: [],

  // Actions
  addToast: (toast) =>
    set((state) => ({
      toasts: [...state.toasts, {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        ...toast
      }]
    })),

  removeToast: (toastId) => {
    set((state) => ({
      toasts: state.toasts.filter(toast => toast.id !== toastId)
    }))
  },

  clearAllToasts: () => set({ toasts: [] }),

  showToast: (options) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const newToast: Toast = {
      id,
      timestamp: new Date().toISOString(),
      duration: options.duration ?? getDefaultDuration(options.type),
      dismissible: options.dismissible ?? true,
      ...options
    }

    set((state) => ({
      toasts: [...state.toasts, newToast]
    }))

    // Auto-dismiss if duration is set
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        // Check if toast still exists before removing
        const currentToasts = get().toasts
        if (currentToasts.some(t => t.id === id)) {
          // Call set directly to update state
          set((state) => ({
            toasts: state.toasts.filter(toast => toast.id !== id)
          }))
        }
      }, newToast.duration)
    }

    return id
  },

  showSuccess: (message, options = {}) => {
    return get().showToast({ type: 'success', message, ...options })
  },

  showError: (message, options = {}) => {
    return get().showToast({ type: 'error', message, ...options })
  },

  showWarning: (message, options = {}) => {
    return get().showToast({ type: 'warning', message, ...options })
  },

  showInfo: (message, options = {}) => {
    return get().showToast({ type: 'info', message, ...options })
  }
})

function getDefaultDuration(type: 'success' | 'error' | 'warning' | 'info'): number {
  switch (type) {
    case 'success':
      return 2000  // 2 seconds for success
    case 'info':
      return 3000  // 3 seconds for info
    case 'warning':
      return 4000  // 4 seconds for warning
    case 'error':
      return 5000  // 5 seconds for errors (need more time to read)
    default:
      return 3000
  }
}