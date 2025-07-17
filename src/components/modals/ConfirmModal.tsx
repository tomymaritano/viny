import React from 'react'
import BaseModal from '../ui/BaseModal'
import { Icons } from '../Icons'

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'info'
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning'
}) => {
  if (!isOpen) return null

  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return <Icons.AlertTriangle size={20} className="text-red-500" />
      case 'warning':
        return <Icons.AlertCircle size={20} className="text-yellow-500" />
      case 'info':
      default:
        return <Icons.Info size={20} className="text-blue-500" />
    }
  }

  const getButtonClass = () => {
    switch (type) {
      case 'danger':
        return 'bg-red-600 hover:bg-red-700'
      case 'warning':
        return 'bg-yellow-600 hover:bg-yellow-700'
      case 'info':
      default:
        return 'bg-theme-accent-primary hover:bg-theme-accent-primary-hover'
    }
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      icon={getIcon()}
      maxWidth="sm"
      closeOnEscape={true}
    >
      <div className="p-4">
        <p className="text-sm text-theme-text-secondary mb-4">
          {message}
        </p>
        
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-theme-text-secondary hover:text-theme-text-primary transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={`px-4 py-2 text-sm text-white rounded-md transition-colors ${getButtonClass()}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </BaseModal>
  )
}

export default ConfirmModal