import React from 'react'
import Icons from '../../Icons'

const BackupSettings: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-theme-text-primary mb-4">
          Backup
        </h3>
        <p className="text-sm text-theme-text-secondary mb-4">
          Configure automatic backups and data recovery
        </p>
      </div>
      
      <div className="bg-theme-bg-secondary rounded-lg p-6 border border-theme-border-primary">
        <div className="text-center">
          <Icons.HardDrive size={48} className="mx-auto mb-4 text-theme-text-muted opacity-50" />
          <h4 className="text-lg font-medium text-theme-text-primary mb-2">
            Backup System
          </h4>
          <p className="text-sm text-theme-text-secondary mb-4">
            Automatic local backups, retention policies, and restore functionality.
          </p>
          <p className="text-xs text-theme-text-muted">
            Enhanced backup coming soon
          </p>
        </div>
      </div>
    </div>
  )
}

export default BackupSettings