import React, { useState, useEffect } from 'react'
import { useAppStore } from '../../../stores/newSimpleStore'
import { Icons } from '../../Icons'
import { StorageInfo, ElectronAPI, isElectronAPI } from '../../../types/settings'

const StorageSettings: React.FC = () => {
  const { settings, updateSettings, showSuccess, showError } = useAppStore()
  const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadStorageInfo()
  }, [])

  const loadStorageInfo = async () => {
    if (window.electronAPI?.isElectron) {
      try {
        const info = await window.electronAPI.getStorageInfo()
        setStorageInfo(info)
      } catch (error) {
        console.error('Failed to load storage info:', error)
      }
    }
  }

  const handleBackup = async () => {
    if (!window.electronAPI?.isElectron) return
    
    setLoading(true)
    try {
      await window.electronAPI.createBackup()
      await loadStorageInfo()
      showSuccess('Backup created successfully')
    } catch (error) {
      console.error('Backup failed:', error)
      showError('Failed to create backup. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    if (!window.electronAPI?.isElectron) return
    
    try {
      await window.electronAPI.exportData()
      showSuccess('Data exported successfully')
    } catch (error) {
      console.error('Export failed:', error)
      showError('Failed to export data. Please try again.')
    }
  }

  const handleImport = async () => {
    if (!window.electronAPI?.isElectron) return
    
    try {
      await window.electronAPI.importData()
      await loadStorageInfo()
      showSuccess('Data imported successfully')
    } catch (error) {
      console.error('Import failed:', error)
      showError('Failed to import data. Please check the file format and try again.')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-theme-text-primary mb-4">
          Storage Information
        </h3>
        
        {storageInfo ? (
          <div className="bg-theme-bg-secondary rounded-lg p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-theme-text-secondary">Notes Count:</span>
              <span className="text-sm font-medium text-theme-text-primary">
                {storageInfo.notesCount || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-theme-text-secondary">Notebooks Count:</span>
              <span className="text-sm font-medium text-theme-text-primary">
                {storageInfo.notebooksCount || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-theme-text-secondary">Storage Size:</span>
              <span className="text-sm font-medium text-theme-text-primary">
                {formatBytes(storageInfo.storageSize || 0)}
              </span>
            </div>
            {storageInfo.lastBackup && (
              <div className="flex justify-between">
                <span className="text-sm text-theme-text-secondary">Last Backup:</span>
                <span className="text-sm font-medium text-theme-text-primary">
                  {new Date(storageInfo.lastBackup).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-theme-bg-secondary rounded-lg p-4">
            <p className="text-sm text-theme-text-secondary">
              Storage information is only available in the desktop app.
            </p>
          </div>
        )}
      </div>

      <div className="border-t border-theme-border-primary pt-6">
        <h3 className="text-lg font-medium text-theme-text-primary mb-4">
          Backup & Sync
        </h3>
        
        <div className="space-y-4">
          {/* Auto Backup */}
          <label className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-theme-text-primary">
                Auto Backup
              </div>
              <div className="text-xs text-theme-text-muted">
                Automatically backup your data daily
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.autoBackup !== false}
              onChange={(e) => updateSettings({ autoBackup: e.target.checked })}
              className="w-4 h-4 text-theme-accent-primary bg-theme-bg-secondary border-theme-border-primary rounded"
            />
          </label>

          {/* Backup Retention */}
          <div>
            <label className="block text-sm font-medium text-theme-text-secondary mb-2">
              Backup Retention
            </label>
            <select
              value={settings.backupRetentionDays || 7}
              onChange={(e) => updateSettings({ backupRetentionDays: parseInt(e.target.value) })}
              className="w-full px-3 py-2 bg-theme-bg-secondary border border-theme-border-primary rounded-md text-theme-text-primary"
            >
              <option value="7">7 days</option>
              <option value="14">14 days</option>
              <option value="30">30 days</option>
              <option value="90">90 days</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={handleBackup}
              disabled={loading || !window.electronAPI?.isElectron}
              className="flex items-center space-x-2 px-4 py-2 bg-theme-accent-primary text-white rounded-md hover:bg-theme-accent-primary/90 disabled:opacity-50"
            >
              <Icons.Download size={16} />
              <span>Backup Now</span>
            </button>
            
            <button
              onClick={handleExport}
              disabled={!window.electronAPI?.isElectron}
              className="flex items-center space-x-2 px-4 py-2 border border-theme-border-primary text-theme-text-primary rounded-md hover:bg-theme-bg-secondary disabled:opacity-50"
            >
              <Icons.FolderOpen size={16} />
              <span>Export Data</span>
            </button>
            
            <button
              onClick={handleImport}
              disabled={!window.electronAPI?.isElectron}
              className="flex items-center space-x-2 px-4 py-2 border border-theme-border-primary text-theme-text-primary rounded-md hover:bg-theme-bg-secondary disabled:opacity-50"
            >
              <Icons.FileText size={16} />
              <span>Import Data</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export default StorageSettings