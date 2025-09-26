import React from 'react'
import ConfirmModal from './ConfirmModal'
import { useConfirmDialogState } from '../../hooks/useConfirmDialog'

/**
 * Global Confirm Modal Component
 *
 * This component should be placed at the root of your app (e.g., in App.tsx)
 * It listens to the global confirm dialog state and renders the modal when needed.
 *
 * @example
 * // In App.tsx or AppLayout
 * import GlobalConfirmModal from './components/modals/GlobalConfirmModal'
 *
 * function App() {
 *   return (
 *     <>
 *       <YourAppContent />
 *       <GlobalConfirmModal />
 *     </>
 *   )
 * }
 */
const GlobalConfirmModal: React.FC = () => {
  const {
    isOpen,
    title,
    message,
    confirmText,
    cancelText,
    type,
    onConfirm,
    onCancel,
  } = useConfirmDialogState()

  if (!onConfirm || !onCancel) return null

  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={onCancel}
      onConfirm={onConfirm}
      title={title}
      message={message}
      confirmText={confirmText}
      cancelText={cancelText}
      type={type}
    />
  )
}

export default GlobalConfirmModal