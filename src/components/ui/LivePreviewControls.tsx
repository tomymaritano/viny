import React from 'react'
import { Check, X, RotateCcw, Eye, EyeOff } from 'lucide-react'

interface LivePreviewControlsProps {
  isActive: boolean
  modifiedCount: number
  modifiedKeys: string[]
  onApply: () => void
  onRevert: () => void
  onCancel: () => void
  className?: string
  showDetails?: boolean
}

const LivePreviewControls: React.FC<LivePreviewControlsProps> = ({
  isActive,
  modifiedCount,
  modifiedKeys,
  onApply,
  onRevert,
  onCancel,
  className = '',
  showDetails = false,
}) => {
  if (!isActive || modifiedCount === 0) {
    return null
  }

  return (
    <div
      className={`bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-2">
          <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <div>
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Live Preview Active
            </h4>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
              {modifiedCount} {modifiedCount === 1 ? 'setting' : 'settings'}{' '}
              modified
              {showDetails && modifiedKeys.length > 0 && (
                <span className="ml-1">({modifiedKeys.join(', ')})</span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onRevert}
            className="flex items-center space-x-1 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            title="Revert changes"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Revert</span>
          </button>

          <button
            onClick={onCancel}
            className="flex items-center space-x-1 px-2 py-1 text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
            title="Cancel preview"
          >
            <X className="w-3 h-3" />
            <span>Cancel</span>
          </button>

          <button
            onClick={onApply}
            className="flex items-center space-x-1 px-2 py-1 text-xs bg-blue-600 dark:bg-blue-500 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
            title="Apply changes"
          >
            <Check className="w-3 h-3" />
            <span>Apply</span>
          </button>
        </div>
      </div>

      <div className="mt-3 text-xs text-blue-600 dark:text-blue-400">
        <div className="flex items-center space-x-4">
          <span>• Changes will auto-revert in a few seconds</span>
          <span>• Click Apply to make changes permanent</span>
        </div>
      </div>
    </div>
  )
}

export default LivePreviewControls
