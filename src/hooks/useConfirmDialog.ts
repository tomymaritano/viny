import { useState, useCallback, useRef } from 'react'
import { create } from 'zustand'

interface ConfirmDialogState {
  isOpen: boolean
  title: string
  message: string
  confirmText: string
  cancelText: string
  type: 'danger' | 'warning' | 'info'
  onConfirm: (() => void | Promise<void>) | null
  onCancel: (() => void) | null
}

interface ConfirmDialogStore extends ConfirmDialogState {
  showConfirm: (options: ConfirmDialogOptions) => Promise<boolean>
  confirm: () => void
  cancel: () => void
  reset: () => void
}

interface ConfirmDialogOptions {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'info'
  onConfirm?: () => void | Promise<void>
  onCancel?: () => void
}

const initialState: ConfirmDialogState = {
  isOpen: false,
  title: '',
  message: '',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  type: 'warning',
  onConfirm: null,
  onCancel: null,
}

/**
 * Global store for confirm dialog state
 * This allows any component to trigger a confirmation dialog
 */
export const useConfirmDialogStore = create<ConfirmDialogStore>((set, get) => ({
  ...initialState,

  showConfirm: (options: ConfirmDialogOptions) => {
    return new Promise<boolean>((resolve) => {
      set({
        isOpen: true,
        title: options.title,
        message: options.message,
        confirmText: options.confirmText || 'Confirm',
        cancelText: options.cancelText || 'Cancel',
        type: options.type || 'warning',
        onConfirm: options.onConfirm || null,
        onCancel: options.onCancel || null,
      })

      // Store the resolve function to be called when dialog is closed
      const originalConfirm = get().onConfirm
      const originalCancel = get().onCancel

      set({
        onConfirm: async () => {
          if (originalConfirm) {
            await originalConfirm()
          }
          resolve(true)
          get().reset()
        },
        onCancel: () => {
          if (originalCancel) {
            originalCancel()
          }
          resolve(false)
          get().reset()
        },
      })
    })
  },

  confirm: () => {
    const { onConfirm } = get()
    if (onConfirm) {
      onConfirm()
    }
  },

  cancel: () => {
    const { onCancel } = get()
    if (onCancel) {
      onCancel()
    } else {
      get().reset()
    }
  },

  reset: () => {
    set(initialState)
  },
}))

/**
 * Hook to show confirmation dialogs from any component
 *
 * @example
 * const { showConfirm } = useConfirmDialog()
 *
 * const handleDelete = async () => {
 *   const confirmed = await showConfirm({
 *     title: 'Delete Item',
 *     message: 'Are you sure you want to delete this item?',
 *     type: 'danger',
 *     confirmText: 'Delete',
 *   })
 *
 *   if (confirmed) {
 *     // Perform delete operation
 *   }
 * }
 */
export const useConfirmDialog = () => {
  const store = useConfirmDialogStore()

  const showConfirm = useCallback(
    (options: ConfirmDialogOptions) => store.showConfirm(options),
    [store.showConfirm]
  )

  const showDeleteConfirm = useCallback(
    (itemName: string, onConfirm?: () => void | Promise<void>) =>
      showConfirm({
        title: 'Delete Item',
        message: `Are you sure you want to delete "${itemName}"? This action cannot be undone.`,
        type: 'danger',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        onConfirm,
      }),
    [showConfirm]
  )

  const showWarning = useCallback(
    (title: string, message: string, onConfirm?: () => void | Promise<void>) =>
      showConfirm({
        title,
        message,
        type: 'warning',
        confirmText: 'Continue',
        cancelText: 'Cancel',
        onConfirm,
      }),
    [showConfirm]
  )

  const showInfo = useCallback(
    (title: string, message: string, onConfirm?: () => void | Promise<void>) =>
      showConfirm({
        title,
        message,
        type: 'info',
        confirmText: 'OK',
        cancelText: 'Cancel',
        onConfirm,
      }),
    [showConfirm]
  )

  return {
    // Dialog state
    isOpen: store.isOpen,
    title: store.title,
    message: store.message,
    confirmText: store.confirmText,
    cancelText: store.cancelText,
    type: store.type,

    // Actions
    showConfirm,
    showDeleteConfirm,
    showWarning,
    showInfo,
    confirm: store.confirm,
    cancel: store.cancel,
    reset: store.reset,
  }
}

/**
 * Hook to get the current confirm dialog state
 * Used by the ConfirmModal component
 */
export const useConfirmDialogState = () => {
  const store = useConfirmDialogStore()
  return {
    isOpen: store.isOpen,
    title: store.title,
    message: store.message,
    confirmText: store.confirmText,
    cancelText: store.cancelText,
    type: store.type,
    onConfirm: store.confirm,
    onCancel: store.cancel,
  }
}