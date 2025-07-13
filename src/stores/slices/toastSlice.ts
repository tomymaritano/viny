import { StateCreator } from 'zustand'

export interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  duration?: number
  timestamp: string
}

export interface ToastSlice {
  // Toast state
  toasts: Toast[]

  // Toast actions
  addToast: (toast: Omit<Toast, 'id' | 'timestamp'>) => void
  removeToast: (id: string) => void
  clearAllToasts: () => void
}

export const createToastSlice: StateCreator<ToastSlice> = (set) => ({
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

  removeToast: (toastId) =>
    set((state) => ({
      toasts: state.toasts.filter(toast => toast.id !== toastId)
    })),

  clearAllToasts: () => set({ toasts: [] })
})