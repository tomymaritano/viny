import React, { useState } from 'react'
import { Icons } from '../../Icons'
import { PluginManager } from '../../PluginManager'

const PluginsSettings: React.FC = () => {
  const [isPluginManagerOpen, setIsPluginManagerOpen] = useState(false)

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-theme-text-primary mb-4">
          Plugin System
        </h3>
        <p className="text-sm text-theme-text-secondary mb-4">
          Extend Viny with powerful plugins. Install, manage, and configure
          plugins safely.
        </p>
      </div>

      <div className="bg-theme-bg-secondary rounded-lg p-6 border border-theme-border-primary">
        <div className="text-center">
          <Icons.Package size={48} className="mx-auto mb-4 text-theme-accent" />
          <h4 className="text-lg font-medium text-theme-text-primary mb-2">
            Enterprise Plugin System
          </h4>
          <p className="text-sm text-theme-text-secondary mb-4">
            Secure, sandboxed plugin execution with enterprise-grade security
            monitoring.
          </p>

          <button
            onClick={() => setIsPluginManagerOpen(true)}
            className="px-6 py-3 bg-theme-accent text-white rounded-lg hover:bg-theme-accent-dark transition-colors font-medium"
          >
            Open Plugin Manager
          </button>

          <div className="mt-4 text-xs text-theme-text-muted">
            <p>Sandboxed execution • Permission system • Security monitoring</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-theme-bg-tertiary rounded-lg p-4 border border-theme-border">
          <div className="text-center">
            <div className="w-8 h-8 mx-auto mb-2 bg-theme-accent rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">S</span>
            </div>
            <h5 className="font-medium text-theme-text-primary mb-1">
              Secure by Design
            </h5>
            <p className="text-xs text-theme-text-secondary">
              Sandboxed execution with permission controls
            </p>
          </div>
        </div>

        <div className="bg-theme-bg-tertiary rounded-lg p-4 border border-theme-border">
          <div className="text-center">
            <div className="w-8 h-8 mx-auto mb-2 bg-theme-accent rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">A</span>
            </div>
            <h5 className="font-medium text-theme-text-primary mb-1">
              Rich API
            </h5>
            <p className="text-xs text-theme-text-secondary">
              Full access to notes, UI, editor, and storage
            </p>
          </div>
        </div>

        <div className="bg-theme-bg-tertiary rounded-lg p-4 border border-theme-border">
          <div className="text-center">
            <div className="w-8 h-8 mx-auto mb-2 bg-theme-accent rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">M</span>
            </div>
            <h5 className="font-medium text-theme-text-primary mb-1">
              Monitoring
            </h5>
            <p className="text-xs text-theme-text-secondary">
              Real-time security and resource monitoring
            </p>
          </div>
        </div>
      </div>

      {/* Plugin Manager Modal */}
      <PluginManager
        isOpen={isPluginManagerOpen}
        onClose={() => setIsPluginManagerOpen(false)}
      />
    </div>
  )
}

export default PluginsSettings
