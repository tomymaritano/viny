import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import Toast, { ToastProps } from './Toast'

interface ToastData extends Omit<ToastProps, 'onDismiss'> {
  id: string
  duration?: number
}

interface ToastContainerProps {
  toasts: ToastData[]
  onDismiss: (id: string) => void
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
  maxToasts?: number
}

const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onDismiss,
  position = 'top-right',
  maxToasts = 5
}) => {
  const [mountedToasts, setMountedToasts] = useState<ToastData[]>([])

  // Auto-dismiss toasts with duration
  useEffect(() => {
    toasts.forEach(toast => {
      if (toast.duration && toast.duration > 0) {
        const timer = setTimeout(() => {
          onDismiss(toast.id)
        }, toast.duration)

        return () => clearTimeout(timer)
      }
    })
  }, [toasts, onDismiss])

  // Update mounted toasts
  useEffect(() => {
    setMountedToasts(toasts.slice(0, maxToasts))
  }, [toasts, maxToasts])

  const getPositionClasses = () => {
    switch (position) {
      case 'top-right':
        return 'top-0 right-0 items-end'
      case 'top-left':
        return 'top-0 left-0 items-start'
      case 'bottom-right':
        return 'bottom-0 right-0 items-end'
      case 'bottom-left':
        return 'bottom-0 left-0 items-start'
      case 'top-center':
        return 'top-0 left-1/2 transform -translate-x-1/2 items-center'
      case 'bottom-center':
        return 'bottom-0 left-1/2 transform -translate-x-1/2 items-center'
      default:
        return 'top-0 right-0 items-end'
    }
  }

  const getAnimationClasses = () => {
    const isTop = position.includes('top')
    const isRight = position.includes('right')
    const isLeft = position.includes('left')
    const isCenter = position.includes('center')

    if (isTop && isRight) return 'animate-slide-in-right'
    if (isTop && isLeft) return 'animate-slide-in-left'
    if (isTop && isCenter) return 'animate-slide-in-top'
    if (!isTop && isRight) return 'animate-slide-in-right'
    if (!isTop && isLeft) return 'animate-slide-in-left'
    if (!isTop && isCenter) return 'animate-slide-in-bottom'
    
    return 'animate-slide-in-right'
  }

  if (mountedToasts.length === 0) return null

  const toastContainer = (
    <div 
      className={`
        fixed z-50 flex flex-col space-y-4 p-6 pointer-events-none
        ${getPositionClasses()}
      `}
      style={{ maxHeight: '100vh', overflow: 'hidden' }}
    >
      {mountedToasts.map((toast) => (
        <div
          key={toast.id}
          className={`transform transition-all duration-300 ${getAnimationClasses()}`}
        >
          <Toast
            {...toast}
            onDismiss={onDismiss}
          />
        </div>
      ))}
    </div>
  )

  return createPortal(toastContainer, document.body)
}

export default ToastContainer