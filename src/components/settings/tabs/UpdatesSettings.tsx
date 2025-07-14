import React from 'react'
import Icons from '../../Icons'

const UpdatesSettings: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-theme-text-primary mb-4">
          Updates
        </h3>
        <p className="text-sm text-theme-text-secondary mb-4">
          Manage app and plugin updates
        </p>
      </div>
      
      <div className="bg-theme-bg-secondary rounded-lg p-6 border border-theme-border-primary">
        <div className="text-center">
          <Icons.RefreshCw size={48} className="mx-auto mb-4 text-theme-text-muted opacity-50" />
          <h4 className="text-lg font-medium text-theme-text-primary mb-2">
            Update Management
          </h4>
          <p className="text-sm text-theme-text-secondary mb-4">
            Check for updates, manage auto-updates, and view update history.
          </p>
          <p className="text-xs text-theme-text-muted">
            Coming soon
          </p>
        </div>
      </div>
    </div>
  )
}

export default UpdatesSettings