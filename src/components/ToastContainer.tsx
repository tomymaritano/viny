import React from 'react'
import Toast from './Toast'

interface ToastData {
  id: string
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

interface ToastContainerProps {
  toasts: ToastData[]
  onRemove: (id: string) => void
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          className="pointer-events-auto animate-in slide-in-from-right duration-300"
          style={{
            transform: `translateY(${index * 4}px)`,
            zIndex: 50 - index,
          }}
        >
          <Toast
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => onRemove(toast.id)}
          />
        </div>
      ))}
    </div>
  )
}

export default ToastContainer
