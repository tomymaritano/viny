import React from 'react'
import { useOfflineIndicator, useOfflineStatus } from '../hooks/useOfflineStatus'
import { Icons } from './Icons'
import { cn } from '../lib/utils'

/**
 * Offline Indicator Component
 * 
 * Shows current offline/sync status with visual feedback
 */
export const OfflineIndicator: React.FC = () => {
  const { show, message, color, pendingCount } = useOfflineIndicator()
  const { retrySync, isOffline } = useOfflineStatus()

  if (!show) return null

  return (
    <div className="fixed bottom-4 left-4 z-50 animate-in slide-in-from-bottom-2">
      <div className={cn(
        'flex items-center gap-2 px-4 py-2 rounded-lg text-white shadow-lg',
        color
      )}>
        {/* Icon */}
        <div className="animate-pulse">
          {isOffline ? (
            <Icons.WifiOff className="w-4 h-4" />
          ) : (
            <Icons.RefreshCw className="w-4 h-4 animate-spin" />
          )}
        </div>

        {/* Message */}
        <span className="text-sm font-medium">{message}</span>

        {/* Pending count badge */}
        {pendingCount > 0 && (
          <span className="bg-white/20 px-2 py-0.5 rounded text-xs">
            {pendingCount}
          </span>
        )}

        {/* Retry button */}
        {isOffline && (
          <button
            onClick={retrySync}
            className="ml-2 text-xs underline hover:no-underline"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  )
}

/**
 * Minimal offline badge for header/status bar
 */
export const OfflineBadge: React.FC = () => {
  const { isOffline, pendingMutations } = useOfflineStatus()

  if (!isOffline && pendingMutations === 0) return null

  return (
    <div className="flex items-center gap-1.5">
      {isOffline ? (
        <>
          <div className="w-2 h-2 bg-gray-500 rounded-full" />
          <span className="text-xs text-gray-600">Offline</span>
        </>
      ) : pendingMutations > 0 ? (
        <>
          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
          <span className="text-xs text-gray-600">Syncing</span>
        </>
      ) : null}
    </div>
  )
}