import React from 'react'
import {
  Cloud,
  CloudOff,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  WifiOff,
  Clock,
} from 'lucide-react'
import { useSyncStatus } from '../../hooks/useSync'
import { SyncStatus } from '../../utils/syncManager'

interface SyncStatusIndicatorProps {
  showText?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const SyncStatusIndicator: React.FC<SyncStatusIndicatorProps> = ({
  showText = false,
  size = 'md',
  className = '',
}) => {
  const { status, isOnline, isSyncing, lastSync, hasConflicts, progress } =
    useSyncStatus()

  const getIcon = () => {
    const iconSize = size === 'sm' ? 14 : size === 'md' ? 16 : 20

    if (!isOnline) {
      return <WifiOff size={iconSize} className="text-red-500" />
    }

    switch (status) {
      case SyncStatus.SYNCING:
        return (
          <RefreshCw size={iconSize} className="text-blue-500 animate-spin" />
        )
      case SyncStatus.SUCCESS:
        return <CheckCircle size={iconSize} className="text-green-500" />
      case SyncStatus.CONFLICT:
        return <AlertTriangle size={iconSize} className="text-yellow-500" />
      case SyncStatus.ERROR:
        return <CloudOff size={iconSize} className="text-red-500" />
      default:
        return (
          <Cloud size={iconSize} className="text-gray-500 dark:text-gray-400" />
        )
    }
  }

  const getStatusText = () => {
    if (!isOnline) {
      return 'Offline'
    }

    switch (status) {
      case SyncStatus.SYNCING:
        return progress > 0 ? `Syncing... ${progress}%` : 'Syncing...'
      case SyncStatus.SUCCESS:
        return 'Synced'
      case SyncStatus.CONFLICT:
        return hasConflicts ? 'Conflicts' : 'Resolved'
      case SyncStatus.ERROR:
        return 'Sync Error'
      default:
        return 'Ready'
    }
  }

  const getStatusColor = () => {
    if (!isOnline) {
      return 'text-red-600 dark:text-red-400'
    }

    switch (status) {
      case SyncStatus.SYNCING:
        return 'text-blue-600 dark:text-blue-400'
      case SyncStatus.SUCCESS:
        return 'text-green-600 dark:text-green-400'
      case SyncStatus.CONFLICT:
        return 'text-yellow-600 dark:text-yellow-400'
      case SyncStatus.ERROR:
        return 'text-red-600 dark:text-red-400'
      default:
        return 'text-gray-600 dark:text-gray-400'
    }
  }

  const getLastSyncText = () => {
    if (!lastSync) return null

    const now = new Date()
    const syncTime = new Date(lastSync)
    const diffMinutes = Math.floor(
      (now.getTime() - syncTime.getTime()) / (1000 * 60)
    )

    if (diffMinutes < 1) {
      return 'Just now'
    } else if (diffMinutes < 60) {
      return `${diffMinutes}m ago`
    } else {
      const diffHours = Math.floor(diffMinutes / 60)
      return `${diffHours}h ago`
    }
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {getIcon()}

      {showText && (
        <div className="flex flex-col">
          <span className={`text-sm font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </span>

          {lastSync && status !== SyncStatus.SYNCING && (
            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
              <Clock size={10} className="mr-1" />
              {getLastSyncText()}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

export default SyncStatusIndicator
