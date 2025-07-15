import React, { useState } from 'react'
import { RefreshCw, AlertTriangle, Cloud, WifiOff } from 'lucide-react'
import { useSync } from '../../hooks/useSync'
import { SyncStatus } from '../../utils/syncManager'
import ConflictResolutionModal from './ConflictResolutionModal'

interface SyncButtonProps {
  className?: string
  showText?: boolean
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

const SyncButton: React.FC<SyncButtonProps> = ({
  className = '',
  showText = false,
  variant = 'ghost',
  size = 'md'
}) => {
  const {
    syncState,
    isOnline,
    isSyncing,
    hasUnresolvedConflicts,
    forceSync,
    getUnresolvedConflicts,
    resolveConflict
  } = useSync()

  const [showConflictModal, setShowConflictModal] = useState(false)
  const [selectedConflict, setSelectedConflict] = useState<string | null>(null)

  const handleSyncClick = () => {
    if (hasUnresolvedConflicts) {
      setShowConflictModal(true)
    } else {
      forceSync()
    }
  }

  const handleConflictResolve = (conflictId: string, resolution: any) => {
    resolveConflict(conflictId, resolution)
    setShowConflictModal(false)
  }

  const getButtonClass = () => {
    const baseClass = 'flex items-center space-x-2 font-medium transition-colors rounded-md'
    
    const sizeClass = {
      sm: 'px-2 py-1 text-xs',
      md: 'px-3 py-1.5 text-sm',
      lg: 'px-4 py-2 text-base'
    }[size]

    const variantClass = {
      primary: 'bg-theme-accent-primary text-white hover:bg-theme-accent-primary/90',
      secondary: 'bg-theme-bg-secondary text-theme-text-primary border border-theme-border-primary hover:bg-theme-bg-tertiary',
      ghost: 'text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg-secondary'
    }[variant]

    return `${baseClass} ${sizeClass} ${variantClass} ${className}`
  }

  const getIcon = () => {
    const iconSize = size === 'sm' ? 14 : size === 'md' ? 16 : 20

    if (!isOnline) {
      return <WifiOff size={iconSize} className="text-red-500" />
    }

    if (hasUnresolvedConflicts) {
      return <AlertTriangle size={iconSize} className="text-yellow-500" />
    }

    if (isSyncing) {
      return <RefreshCw size={iconSize} className="animate-spin" />
    }

    return <Cloud size={iconSize} />
  }

  const getButtonText = () => {
    if (!isOnline) {
      return 'Offline'
    }

    if (hasUnresolvedConflicts) {
      const count = getUnresolvedConflicts().length
      return `${count} Conflict${count > 1 ? 's' : ''}`
    }

    if (isSyncing) {
      return 'Syncing...'
    }

    return 'Sync'
  }

  const getButtonTitle = () => {
    if (!isOnline) {
      return 'Cannot sync while offline'
    }

    if (hasUnresolvedConflicts) {
      return 'Click to resolve sync conflicts'
    }

    if (isSyncing) {
      return 'Synchronization in progress...'
    }

    return 'Sync your notes'
  }

  const unresolvedConflicts = getUnresolvedConflicts()
  const currentConflict = selectedConflict 
    ? unresolvedConflicts.find(c => c.id === selectedConflict)
    : unresolvedConflicts[0]

  return (
    <>
      <button
        onClick={handleSyncClick}
        disabled={isSyncing || !isOnline}
        title={getButtonTitle()}
        className={getButtonClass()}
      >
        {getIcon()}
        {showText && <span>{getButtonText()}</span>}
      </button>

      <ConflictResolutionModal
        isOpen={showConflictModal}
        onClose={() => setShowConflictModal(false)}
        conflict={currentConflict || null}
        onResolve={handleConflictResolve}
      />
    </>
  )
}

export default SyncButton