import React from 'react'
import Icons from '../../Icons'

const PluginsSettings: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-theme-text-primary mb-4">
          Plugins
        </h3>
        <p className="text-sm text-theme-text-secondary mb-4">
          Manage installed plugins and their settings
        </p>
      </div>
      
      <div className="bg-theme-bg-secondary rounded-lg p-6 border border-theme-border-primary">
        <div className="text-center">
          <Icons.Package size={48} className="mx-auto mb-4 text-theme-text-muted opacity-50" />
          <h4 className="text-lg font-medium text-theme-text-primary mb-2">
            Plugin Management
          </h4>
          <p className="text-sm text-theme-text-secondary mb-4">
            Install, configure, and manage plugins to extend Nototo's functionality.
          </p>
          <p className="text-xs text-theme-text-muted">
            Coming in version 2.0
          </p>
        </div>
      </div>
    </div>
  )
}

export default PluginsSettings