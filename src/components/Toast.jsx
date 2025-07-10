import { useState, useEffect } from 'react'
import Icons from './Icons'

const Toast = ({ message, type = 'success', duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true)
  const [isExiting, setIsExiting] = useState(false)

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

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(() => {
      setIsVisible(false)
      onClose?.()
    }, 300)
  }

  if (!isVisible) return null

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-theme-accent-green text-theme-text-primary border-theme-accent-green'
      case 'error':
        return 'bg-theme-accent-red text-theme-text-primary border-theme-accent-red'
      case 'warning':
        return 'bg-theme-accent-orange text-theme-text-primary border-theme-accent-orange'
      case 'info':
        return 'bg-theme-accent-primary text-theme-text-primary border-theme-accent-primary'
      default:
        return 'bg-theme-accent-green text-theme-text-primary border-theme-accent-green'
    }
  }

  const getIcon = () => {
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
        fixed top-4 right-4 z-50 min-w-80 max-w-96
        ${getTypeStyles()}
        border rounded-lg shadow-xl p-4
        transform transition-all duration-300 ease-in-out
        ${isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}
      `}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {getIcon()}
          <span className="text-sm font-medium">{message}</span>
        </div>
        <button
          onClick={handleClose}
          className="text-current hover:opacity-70 transition-opacity border-0 bg-transparent hover:bg-transparent p-1 ml-2"
        >
          <Icons.X size={14} />
        </button>
      </div>
    </div>
  )
}

export default Toast
