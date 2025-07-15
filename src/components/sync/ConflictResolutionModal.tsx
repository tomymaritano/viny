import React, { useState } from 'react'
import { SyncConflict, ConflictResolution } from '../../utils/syncManager'
import { Note, Notebook } from '../../types'
import StandardModal from '../ui/StandardModal'
import { 
  AlertTriangle, 
  User, 
  Cloud, 
  GitMerge, 
  Copy,
  Clock,
  FileText,
  Folder
} from 'lucide-react'

interface ConflictResolutionModalProps {
  isOpen: boolean
  onClose: () => void
  conflict: SyncConflict | null
  onResolve: (conflictId: string, resolution: ConflictResolution) => void
}

const ConflictResolutionModal: React.FC<ConflictResolutionModalProps> = ({
  isOpen,
  onClose,
  conflict,
  onResolve
}) => {
  const [selectedStrategy, setSelectedStrategy] = useState<ConflictResolution['strategy']>('merge')

  if (!conflict) return null

  const isNote = conflict.type === 'note'
  const localItem = conflict.localVersion as Note | Notebook
  const remoteItem = conflict.remoteVersion as Note | Notebook

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getItemPreview = (item: Note | Notebook) => {
    if (isNote) {
      const note = item as Note
      return {
        title: note.title,
        content: note.content,
        preview: note.content.slice(0, 200) + (note.content.length > 200 ? '...' : ''),
        tags: note.tags
      }
    } else {
      const notebook = item as Notebook
      return {
        title: notebook.name,
        content: notebook.description || '',
        preview: notebook.description || 'No description',
        color: notebook.color
      }
    }
  }

  const localPreview = getItemPreview(localItem)
  const remotePreview = getItemPreview(remoteItem)

  const handleResolve = () => {
    const resolution: ConflictResolution = {
      strategy: selectedStrategy,
      timestamp: new Date()
    }

    onResolve(conflict.id, resolution)
    onClose()
  }

  const strategies = [
    {
      value: 'use_local' as const,
      label: 'Use Local Version',
      description: 'Keep your local changes and discard remote changes',
      icon: <User className="w-5 h-5" />
    },
    {
      value: 'use_remote' as const,
      label: 'Use Remote Version',
      description: 'Use the remote version and discard local changes',
      icon: <Cloud className="w-5 h-5" />
    },
    {
      value: 'merge' as const,
      label: 'Merge Changes',
      description: 'Automatically merge both versions (recommended)',
      icon: <GitMerge className="w-5 h-5" />
    },
    {
      value: 'create_both' as const,
      label: 'Keep Both',
      description: 'Create separate copies of both versions',
      icon: <Copy className="w-5 h-5" />
    }
  ]

  return (
    <StandardModal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      title={
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-yellow-500" />
          <span>Resolve Sync Conflict</span>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Conflict Info */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            {isNote ? (
              <FileText className="w-5 h-5 text-yellow-600" />
            ) : (
              <Folder className="w-5 h-5 text-yellow-600" />
            )}
            <span className="font-medium text-yellow-800 dark:text-yellow-200">
              {isNote ? 'Note' : 'Notebook'} Conflict Detected
            </span>
          </div>
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            The same {isNote ? 'note' : 'notebook'} was modified both locally and remotely. 
            Choose how to resolve this conflict.
          </p>
        </div>

        {/* Side by Side Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Local Version */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-blue-500" />
              <h3 className="font-medium text-theme-text-primary">Local Version</h3>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="space-y-2">
                <h4 className="font-medium text-blue-900 dark:text-blue-100">
                  {localPreview.title}
                </h4>
                
                <div className="flex items-center space-x-2 text-xs text-blue-700 dark:text-blue-300">
                  <Clock className="w-3 h-3" />
                  <span>Modified: {formatDate(localItem.updatedAt)}</span>
                </div>
                
                <div className="text-sm text-blue-800 dark:text-blue-200 bg-blue-100 dark:bg-blue-800/30 rounded p-2 max-h-32 overflow-y-auto">
                  {localPreview.preview}
                </div>
                
                {isNote && (localPreview as any).tags && (
                  <div className="flex flex-wrap gap-1">
                    {(localPreview as any).tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-blue-200 dark:bg-blue-700 text-blue-800 dark:text-blue-200 text-xs rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Remote Version */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Cloud className="w-4 h-4 text-green-500" />
              <h3 className="font-medium text-theme-text-primary">Remote Version</h3>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="space-y-2">
                <h4 className="font-medium text-green-900 dark:text-green-100">
                  {remotePreview.title}
                </h4>
                
                <div className="flex items-center space-x-2 text-xs text-green-700 dark:text-green-300">
                  <Clock className="w-3 h-3" />
                  <span>Modified: {formatDate(remoteItem.updatedAt)}</span>
                </div>
                
                <div className="text-sm text-green-800 dark:text-green-200 bg-green-100 dark:bg-green-800/30 rounded p-2 max-h-32 overflow-y-auto">
                  {remotePreview.preview}
                </div>
                
                {isNote && (remotePreview as any).tags && (
                  <div className="flex flex-wrap gap-1">
                    {(remotePreview as any).tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-green-200 dark:bg-green-700 text-green-800 dark:text-green-200 text-xs rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Resolution Strategy Selection */}
        <div className="space-y-4">
          <h3 className="font-medium text-theme-text-primary">Choose Resolution Strategy</h3>
          
          <div className="space-y-3">
            {strategies.map((strategy) => (
              <label
                key={strategy.value}
                className={`
                  flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-colors
                  ${selectedStrategy === strategy.value
                    ? 'border-theme-accent-primary bg-theme-accent-primary/10'
                    : 'border-theme-border-primary hover:bg-theme-bg-secondary'
                  }
                `}
              >
                <input
                  type="radio"
                  name="strategy"
                  value={strategy.value}
                  checked={selectedStrategy === strategy.value}
                  onChange={(e) => setSelectedStrategy(e.target.value as ConflictResolution['strategy'])}
                  className="text-theme-accent-primary"
                />
                
                <div className="flex-shrink-0">
                  {strategy.icon}
                </div>
                
                <div className="flex-1">
                  <div className="font-medium text-theme-text-primary">
                    {strategy.label}
                  </div>
                  <div className="text-sm text-theme-text-secondary">
                    {strategy.description}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-theme-border-primary">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-theme-text-secondary hover:text-theme-text-primary transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleResolve}
            className="px-4 py-2 bg-theme-accent-primary text-white text-sm font-medium rounded-md hover:bg-theme-accent-primary/90 transition-colors"
          >
            Resolve Conflict
          </button>
        </div>
      </div>
    </StandardModal>
  )
}

export default ConflictResolutionModal