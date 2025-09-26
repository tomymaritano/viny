import React, { useState } from 'react'
import { ConfirmDialog } from '../../ui/ConfirmDialog'

interface DialogState {
  isOpen: boolean
  title: string
  description: string
  onConfirm: () => void
  variant?: 'default' | 'destructive'
  confirmText?: string
}

interface ToastState {
  isOpen: boolean
  message: string
  type: 'success' | 'error'
}

export const useSettingsDialogs = () => {
  const [confirmDialog, setConfirmDialog] = useState<DialogState>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {},
    variant: 'default',
  })

  const [toast, setToast] = useState<ToastState>({
    isOpen: false,
    message: '',
    type: 'success',
  })

  const showConfirmDialog = (
    title: string,
    description: string,
    onConfirm: () => void,
    variant: 'default' | 'destructive' = 'default',
    confirmText?: string
  ) => {
    setConfirmDialog({
      isOpen: true,
      title,
      description,
      onConfirm,
      variant,
      confirmText,
    })
  }

  const showToast = (
    message: string,
    type: 'success' | 'error' = 'success'
  ) => {
    setToast({
      isOpen: true,
      message,
      type,
    })

    // Auto hide toast after 3 seconds
    setTimeout(() => {
      setToast(prev => ({ ...prev, isOpen: false }))
    }, 3000)
  }

  const closeConfirmDialog = () => {
    setConfirmDialog(prev => ({ ...prev, isOpen: false }))
  }

  const DialogComponents = () => (
    <>
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={closeConfirmDialog}
        onConfirm={() => {
          confirmDialog.onConfirm()
          closeConfirmDialog()
        }}
        title={confirmDialog.title}
        description={confirmDialog.description}
        variant={confirmDialog.variant}
        confirmText={
          confirmDialog.confirmText ||
          (confirmDialog.variant === 'destructive' ? 'Reset' : 'Confirm')
        }
      />

      {/* Simple toast notification */}
      {toast.isOpen && (
        <div className="fixed top-4 right-4 z-50 bg-theme-bg-primary border border-theme-border-primary rounded-lg shadow-lg p-4 max-w-sm">
          <div
            className={`flex items-center gap-2 ${toast.type === 'error' ? 'text-red-500' : 'text-green-500'}`}
          >
            <div className="text-sm font-medium text-theme-text-primary">
              {toast.message}
            </div>
          </div>
        </div>
      )}
    </>
  )

  return {
    showConfirmDialog,
    showToast,
    DialogComponents,
  }
}
