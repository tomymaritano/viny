import { useState } from 'react'
import { usePluginStore } from '../stores/pluginStore'
import PluginStore from './PluginStore'

export default function PluginManager({ isVisible, onClose }) {
  const {
    plugins,
    loading,
    error,
    installPlugin,
    installPluginFromUrl,
    activatePlugin,
    deactivatePlugin,
    uninstallPlugin,
    clearError,
    showPluginStore,
    openPluginStore,
    closePluginStore,
  } = usePluginStore()

  const [activeTab, setActiveTab] = useState('installed')
  const [installUrl, setInstallUrl] = useState('')
  const [dragOver, setDragOver] = useState(false)

  if (!isVisible) return null

  const handleFileUpload = async file => {
    try {
      if (!file.name.endsWith('.js')) {
        throw new Error('Please select a .js file')
      }

      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        throw new Error('File too large. Maximum size is 5MB')
      }

      const text = await file.text()

      if (!text.trim()) {
        throw new Error('File is empty')
      }

      await installPlugin(text, file.name)

      // Reset file input
      const fileInput = document.querySelector('input[type="file"]')
      if (fileInput) {
        fileInput.value = ''
      }
    } catch (err) {
      console.error('Failed to install plugin:', err)
      // Error will be shown via the error state from usePlugins hook
    }
  }

  const handleDrop = e => {
    e.preventDefault()
    setDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    const jsFiles = files.filter(file => file.name.endsWith('.js'))

    if (jsFiles.length > 0) {
      handleFileUpload(jsFiles[0])
    }
  }

  const handleDragOver = e => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = e => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleInstallFromUrl = async () => {
    if (!installUrl.trim()) return

    try {
      await installPluginFromUrl(installUrl)
      setInstallUrl('')
    } catch (err) {
      console.error('Failed to install plugin from URL:', err)
    }
  }

  const handleTogglePlugin = async plugin => {
    try {
      if (plugin.isActive) {
        await deactivatePlugin(plugin.id)
      } else {
        await activatePlugin(plugin.id)
      }
    } catch (err) {
      console.error('Failed to toggle plugin:', err)
    }
  }

  const handleUninstall = async plugin => {
    if (
      window.confirm(`Are you sure you want to uninstall "${plugin.name}"?`)
    ) {
      try {
        await uninstallPlugin(plugin.id)
      } catch (err) {
        console.error('Failed to uninstall plugin:', err)
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="theme-bg-secondary border border-theme-border-primary rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-theme-border-primary">
          <h2 className="text-xl font-bold text-theme-text-secondary">
            Plugin Manager
          </h2>
          <button
            onClick={onClose}
            className="text-theme-text-tertiary hover:text-theme-text-secondary transition-colors"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-theme-border-primary">
          <button
            onClick={() => setActiveTab('store')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'store'
                ? 'text-theme-accent-primary border-b-2 border-theme-accent-primary theme-bg-tertiary'
                : 'text-theme-text-tertiary hover:text-theme-text-secondary'
            }`}
          >
            🏪 Plugin Store
          </button>
          <button
            onClick={() => setActiveTab('installed')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'installed'
                ? 'text-theme-accent-primary border-b-2 border-theme-accent-primary theme-bg-tertiary'
                : 'text-theme-text-tertiary hover:text-theme-text-secondary'
            }`}
          >
            Installed Plugins ({plugins.length})
          </button>
          <button
            onClick={() => setActiveTab('install')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'install'
                ? 'text-theme-accent-primary border-b-2 border-theme-accent-primary theme-bg-tertiary'
                : 'text-theme-text-tertiary hover:text-theme-text-secondary'
            }`}
          >
            Manual Install
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {error && (
            <div className="bg-theme-accent-red/10 border border-theme-accent-red/20 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-theme-accent-red font-medium">
                    Plugin Installation Error
                  </p>
                  <p className="text-theme-accent-red/80 text-sm mt-1">
                    {error}
                  </p>
                </div>
                <button
                  onClick={clearError}
                  className="text-theme-accent-red hover:text-theme-accent-red/80"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {loading && (
            <div className="bg-theme-accent-primary/10 border border-theme-accent-primary/20 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-3">
                <div className="animate-spin w-5 h-5 border-2 border-theme-accent-primary border-t-transparent rounded-full"></div>
                <p className="text-theme-accent-primary">
                  Installing plugin...
                </p>
              </div>
            </div>
          )}

          {activeTab === 'store' && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🏪</div>
              <h3 className="text-lg font-semibold mb-4 text-theme-text-secondary">
                Plugin Store
              </h3>
              <p className="text-theme-text-tertiary mb-6">
                Discover and install curated plugins with one click
              </p>
              <button
                onClick={openPluginStore}
                className="bg-theme-accent-primary text-theme-text-muted3 px-6 py-3 rounded font-medium hover:bg-theme-accent-primary/80 transition-colors"
              >
                Open Plugin Store
              </button>
            </div>
          )}

          {activeTab === 'installed' && (
            <div className="space-y-4">
              {plugins.length === 0 ? (
                <div className="text-center py-12 text-theme-text-tertiary">
                  <div className="text-4xl mb-4">🧩</div>
                  <h3 className="text-lg font-semibold mb-2">
                    No plugins installed
                  </h3>
                  <p className="text-sm">
                    Install your first plugin to extend Nototo's functionality
                  </p>
                </div>
              ) : (
                plugins.map(plugin => (
                  <div
                    key={plugin.id}
                    className="theme-bg-tertiary rounded-lg p-4 border border-theme-border-secondary"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-theme-text-secondary">
                            {plugin.name}
                          </h3>
                          <span className="text-xs theme-bg-quaternary text-theme-text-tertiary px-2 py-1 rounded">
                            v{plugin.version}
                          </span>
                          {plugin.isActive && (
                            <span className="text-xs bg-theme-accent-green text-theme-text-muted3 px-2 py-1 rounded font-medium">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-theme-text-tertiary text-sm mb-2">
                          {plugin.description}
                        </p>
                        {plugin.author && (
                          <p className="text-theme-text-muted text-xs">
                            by {plugin.author}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => handleTogglePlugin(plugin)}
                          disabled={loading}
                          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                            plugin.isActive
                              ? 'bg-theme-accent-orange text-theme-text-muted3 hover:bg-theme-accent-orange/80'
                              : 'bg-theme-accent-green text-theme-text-muted3 hover:bg-theme-accent-green/80'
                          } disabled:opacity-50`}
                        >
                          {plugin.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleUninstall(plugin)}
                          disabled={loading}
                          className="px-3 py-1 rounded text-sm font-medium bg-theme-accent-red text-theme-text-muted3 hover:bg-theme-accent-red/80 transition-colors disabled:opacity-50"
                        >
                          Uninstall
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'install' && (
            <div className="space-y-6">
              {/* Install from file */}
              <div>
                <h3 className="text-lg font-semibold text-theme-text-secondary mb-3">
                  Install from File
                </h3>
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragOver
                      ? 'border-theme-accent-primary bg-theme-accent-primary/5'
                      : 'border-theme-border-primary hover:border-solarized-base0'
                  }`}
                >
                  <div className="text-4xl mb-4">📁</div>
                  <p className="text-theme-text-tertiary mb-2">
                    Drag and drop a .js plugin file here, or
                  </p>
                  <label className="inline-block bg-theme-accent-primary text-theme-text-muted3 px-4 py-2 rounded font-medium cursor-pointer hover:bg-theme-accent-primary/80 transition-colors">
                    Choose File
                    <input
                      type="file"
                      accept=".js"
                      onChange={e => {
                        const file = e.target.files[0]
                        if (file) handleFileUpload(file)
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Install from URL */}
              <div>
                <h3 className="text-lg font-semibold text-theme-text-secondary mb-3">
                  Install from URL
                </h3>
                <div className="flex space-x-3">
                  <input
                    type="url"
                    placeholder="https://example.com/plugin.js"
                    value={installUrl}
                    onChange={e => setInstallUrl(e.target.value)}
                    className="flex-1 theme-bg-tertiary border border-theme-border-secondary rounded px-3 py-2 text-theme-text-secondary placeholder-solarized-base0 focus:border-theme-accent-primary focus:outline-none"
                  />
                  <button
                    onClick={handleInstallFromUrl}
                    disabled={loading || !installUrl.trim()}
                    className="bg-theme-accent-primary text-theme-text-muted3 px-4 py-2 rounded font-medium hover:bg-theme-accent-primary/80 transition-colors disabled:opacity-50"
                  >
                    Install
                  </button>
                </div>
              </div>

              {/* Plugin development info */}
              <div className="theme-bg-tertiary rounded-lg p-4 border border-theme-border-secondary">
                <h4 className="font-semibold text-theme-text-secondary mb-2">
                  Developing Plugins
                </h4>
                <p className="text-theme-text-tertiary text-sm mb-3">
                  Plugins are JavaScript modules that extend Nototo's
                  functionality. Check the documentation for the Plugin API
                  reference.
                </p>
                <button className="text-theme-accent-primary hover:text-theme-accent-primary/80 text-sm font-medium">
                  View Documentation →
                </button>
              </div>
            </div>
          )}
        </div>

        {loading && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <div className="theme-bg-secondary border border-theme-border-primary rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="animate-spin w-5 h-5 border-2 border-theme-accent-primary border-t-transparent rounded-full"></div>
                <span className="text-theme-text-secondary">Processing...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Plugin Store Modal */}
      <PluginStore
        isVisible={showPluginStore}
        onClose={closePluginStore}
        onInstall={plugin => {
          closePluginStore()
          setActiveTab('installed')
        }}
      />
    </div>
  )
}
