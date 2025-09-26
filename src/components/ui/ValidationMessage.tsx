import React from 'react'
import { AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react'

interface ValidationMessageProps {
  type: 'error' | 'warning' | 'success'
  message: string
  className?: string
}

const ValidationMessage: React.FC<ValidationMessageProps> = ({
  type,
  message,
  className = '',
}) => {
  const getIcon = () => {
    switch (type) {
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />
    }
  }

  const getTextColor = () => {
    switch (type) {
      case 'error':
        return 'text-red-600 dark:text-red-400'
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400'
      case 'success':
        return 'text-green-600 dark:text-green-400'
    }
  }

  return (
    <div className={`flex items-center gap-2 text-sm mt-1 ${className}`}>
      {getIcon()}
      <span className={getTextColor()}>{message}</span>
    </div>
  )
}

export default ValidationMessage
