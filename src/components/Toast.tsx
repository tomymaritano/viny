import React, { useState, useEffect } from 'react'
import Icons from './Icons'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastProps {
  message: string
  type?: ToastType
  duration?: number
  onClose?: () => void
}

const Toast: React.FC<ToastProps> = ({
  message,
  type = 'success',
  duration = 5000,
  onClose
}) => {
  const [isVisible, setIsVisible] = useState<boolean>(true)
  const [isExiting, setIsExiting] = useState<boolean>(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true)
      setTimeout(() => {
        setIsVisible(false)
        onClose?.()
      }, 300) // Animation duration
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const handleClose = (): void => {
    setIsExiting(true)
    setTimeout(() => {
      setIsVisible(false)
      onClose?.()
    }, 300)
  }

  if (!isVisible) return null

  const getTypeStyles = (): string => {
    switch (type) {
      case 'success':
        return 'bg-green-600 text-white border-green-700'
      case 'error':
        return 'bg-red-600 text-white border-red-700'
      case 'warning':
        return 'bg-orange-600 text-white border-orange-700'
      case 'info':
        return 'bg-blue-600 text-white border-blue-700'
      default:
        return 'bg-green-600 text-white border-green-700'
    }
  }

  const getIcon = (): React.ReactNode => {
    switch (type) {
      case 'success':
        return <Icons.Check size={16} />
      case 'error':
        return <Icons.X size={16} />
      case 'warning':
        return <Icons.AlertTriangle size={16} />
      case 'info':
        return <Icons.Info size={16} />
      default:
        return <Icons.Check size={16} />
    }
  }

  return (
    <div
      className={`
        fixed top-4 right-4 z-50 min-w-[320px] max-w-md
        ${getTypeStyles()}
        border-2 rounded-lg shadow-2xl p-4
        transform transition-all duration-300 ease-in-out
        ${isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}
      `}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">{getIcon()}</div>
          <span className="text-sm font-medium whitespace-pre-wrap">
            {message}
          </span>
        </div>
        <button
          onClick={handleClose}
          className="text-white hover:text-gray-200 transition-colors p-1 ml-2"
        >
          <Icons.X size={14} />
        </button>
      </div>
    </div>
  )
}

export default Toast
