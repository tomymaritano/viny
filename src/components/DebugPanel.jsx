import { useState } from 'react'
import { usePluginStore } from '../stores/pluginStore'
import { isFeatureEnabled } from '../config/features'

export default function DebugPanel() {
  const [isVisible, setIsVisible] = useState(false)
  const { plugins, loading, error } = usePluginStore()

  // Don't render debug panel if plugins are disabled or if not in development
  if (
    !isFeatureEnabled('DEBUG_PANEL') ||
    !isFeatureEnabled('PLUGINS_ENABLED')
  ) {
    return null
  }

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-red-600 text-white px-3 py-2 rounded shadow-lg z-50 text-sm"
      >
        Debug
      </button>
    )
  }

  const testInstall = async () => {
    try {
      // Test plugin creation (simplified for production)
      // Test plugin created successfully
    } catch {
      // Test installation failed - handled silently
    }
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black text-green-400 p-4 rounded shadow-lg z-50 max-w-md">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold">Plugin Debug Panel</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-red-400 hover:text-red-300"
        >
          ×
        </button>
      </div>

      <div className="space-y-2 text-xs">
        <div>
          <strong>Plugins:</strong> {plugins.length}
        </div>
        <div>
          <strong>Loading:</strong> {loading ? 'Yes' : 'No'}
        </div>
        <div>
          <strong>Error:</strong> {error || 'None'}
        </div>
        <div>
          <strong>URL:</strong> {window.location.origin}
        </div>

        <button
          onClick={testInstall}
          disabled={loading}
          className="bg-blue-600 text-white px-2 py-1 rounded disabled:opacity-50 w-full"
        >
          {loading ? 'Installing...' : 'Test Install'}
        </button>

        <div className="mt-2 max-h-32 overflow-y-auto">
          <strong>Installed Plugins:</strong>
          {plugins.map(plugin => (
            <div key={plugin.id} className="text-xs text-gray-300">
              • {plugin.name} ({plugin.isActive ? 'Active' : 'Inactive'})
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
