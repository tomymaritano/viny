import React from 'react'
import { useSyncStatus } from '../../hooks/useSync'
import { SyncStatus } from '../../utils/syncManager'

interface SyncProgressBarProps {
  className?: string
  showPercentage?: boolean
  showText?: boolean
  height?: 'sm' | 'md' | 'lg'
}

const SyncProgressBar: React.FC<SyncProgressBarProps> = ({
  className = '',
  showPercentage = false,
  showText = false,
  height = 'md'
}) => {
  const { status, progress, isSyncing } = useSyncStatus()

  if (!isSyncing && status !== SyncStatus.SYNCING) {
    return null
  }

  const getHeightClass = () => {
    switch (height) {
      case 'sm':
        return 'h-1'
      case 'md':
        return 'h-2'
      case 'lg':
        return 'h-3'
      default:
        return 'h-2'
    }
  }

  const getProgressColor = () => {
    if (progress < 30) return 'bg-red-500'
    if (progress < 70) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  return (
    <div className={`w-full ${className}`}>
      {showText && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-theme-text-secondary">
            Syncing...
          </span>
          {showPercentage && (
            <span className="text-sm text-theme-text-secondary">
              {Math.round(progress)}%
            </span>
          )}
        </div>
      )}
      
      <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full ${getHeightClass()}`}>
        <div
          className={`${getProgressColor()} ${getHeightClass()} rounded-full transition-all duration-300 ease-out`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

export default SyncProgressBar