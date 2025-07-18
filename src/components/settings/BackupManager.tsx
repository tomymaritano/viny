import React, { useState, useEffect, useRef } from 'react'
import { SettingsBackupManager, type SettingsBackup } from '../../services/settings/backup'
import { useSettings } from '../../hooks/useSettings'
import { Icons } from '../Icons'

export const BackupManager: React.FC = () => {
  const [backups, setBackups] = useState<SettingsBackup[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const { exportSettings, importSettings } = useSettings()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const loadBackups = async () => {
    try {
      const backupList = await SettingsBackupManager.getBackups()
      setBackups(backupList)
    } catch (err) {
      setError('Failed to load backups')
    }
  }

  useEffect(() => {
    loadBackups()
  }, [])

  const handleCreateBackup = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)
    
    try {
      const settingsData = exportSettings()
      const backupId = await SettingsBackupManager.createBackup(settingsData.settings, {
        description: 'Manual backup'
      })
      
      setSuccess(`Backup created: ${backupId}`)
      await loadBackups()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create backup')
    } finally {
      setLoading(false)
    }
  }

  const handleRestoreBackup = async (backupId: string) => {
    if (!confirm('This will replace your current settings. Continue?')) {
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)
    
    try {
      const settings = await SettingsBackupManager.restoreBackup(backupId)
      if (settings) {
        const result = await importSettings(JSON.stringify(settings))
        if (result.success) {
          setSuccess('Settings restored successfully')
        } else {
          setError('Failed to restore settings')
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to restore backup')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteBackup = async (backupId: string) => {
    if (!confirm('Delete this backup permanently?')) {
      return
    }

    try {
      const deleted = await SettingsBackupManager.deleteBackup(backupId)
      if (deleted) {
        setSuccess('Backup deleted')
        await loadBackups()
      } else {
        setError('Backup not found')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete backup')
    }
  }

  const handleExportBackup = async (backupId: string) => {
    try {
      const backupData = await SettingsBackupManager.exportBackup(backupId)
      const blob = new Blob([backupData], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `viny-backup-${backupId}.json`
      a.click()
      URL.revokeObjectURL(url)
      
      setSuccess('Backup exported')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export backup')
    }
  }

  const handleImportBackup = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const backupData = e.target?.result as string
        const backupId = await SettingsBackupManager.importBackup(backupData)
        setSuccess(`Backup imported: ${backupId}`)
        await loadBackups()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to import backup')
      }
    }
    reader.readAsText(file)
    
    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  const formatSize = (settings: Record<string, any>) => {
    const size = JSON.stringify(settings).length
    return size < 1024 ? `${size} B` : `${(size / 1024).toFixed(1)} KB`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-theme-text-primary">
            Backup Manager
          </h3>
          <p className="text-sm text-theme-text-muted">
            Create and manage settings backups
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <label className="px-3 py-2 bg-theme-bg-secondary border border-theme-border-primary rounded-md hover:bg-theme-bg-tertiary transition-colors cursor-pointer text-sm">
            <Icons.Upload size={16} className="inline mr-2" />
            Import
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              className="hidden"
            />
          </label>
          
          <button
            onClick={handleCreateBackup}
            disabled={loading}
            className="px-3 py-2 bg-theme-accent-primary text-white rounded-md hover:opacity-90 disabled:opacity-50 text-sm"
          >
            <Icons.Plus size={16} className="inline mr-2" />
            Create Backup
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-800">{success}</p>
        </div>
      )}

      {/* Backups List */}
      <div className="space-y-3">
        {backups.length === 0 ? (
          <div className="text-center py-8 text-theme-text-muted">
            <Icons.Archive size={48} className="mx-auto mb-4 opacity-50" />
            <p>No backups found</p>
            <p className="text-sm">Create your first backup to get started</p>
          </div>
        ) : (
          backups.map((backup) => (
            <div
              key={backup.id}
              className="p-4 bg-theme-bg-secondary border border-theme-border-primary rounded-lg"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-medium text-theme-text-primary">
                      {backup.metadata?.description || backup.id}
                    </h4>
                    <span className="text-xs bg-theme-bg-tertiary px-2 py-1 rounded">
                      v{backup.version}
                    </span>
                  </div>
                  
                  <div className="mt-2 text-xs text-theme-text-muted space-y-1">
                    <p>Created: {formatDate(backup.timestamp)}</p>
                    <p>Size: {formatSize(backup.settings)}</p>
                    {backup.metadata?.platform && (
                      <p>Platform: {backup.metadata.platform}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleExportBackup(backup.id)}
                    className="p-2 text-theme-text-muted hover:text-theme-text-primary transition-colors"
                    title="Export backup"
                  >
                    <Icons.Download size={16} />
                  </button>
                  
                  <button
                    onClick={() => handleRestoreBackup(backup.id)}
                    disabled={loading}
                    className="p-2 text-theme-accent-primary hover:text-theme-accent-primary/80 transition-colors disabled:opacity-50"
                    title="Restore backup"
                  >
                    <Icons.RotateCcw size={16} />
                  </button>
                  
                  <button
                    onClick={() => handleDeleteBackup(backup.id)}
                    className="p-2 text-red-500 hover:text-red-600 transition-colors"
                    title="Delete backup"
                  >
                    <Icons.Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Auto Backup Info */}
      <div className="p-4 bg-theme-accent-primary/10 border border-theme-accent-primary/20 rounded-lg">
        <div className="flex items-start space-x-3">
          <Icons.Info size={20} className="text-theme-accent-primary mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-theme-text-primary">Auto Backup</h4>
            <p className="text-xs text-theme-text-muted mt-1">
              Backups are automatically created daily. A maximum of 10 backups are kept.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}