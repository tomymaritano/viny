import React, { useState, useEffect } from 'react'
import { Icons } from '../Icons'
import { pluginService } from '../../services/PluginService'
import PluginCatalog from './PluginCatalog'
import { PluginManager } from '../PluginManager'
import type { PluginInstance } from '../../services/PluginService'

type PluginTab = 'catalog' | 'updates' | 'manager'

interface PluginPanelProps {
  isActive: boolean
}

export const PluginPanel: React.FC<PluginPanelProps> = ({ isActive }) => {
  const [activeTab, setActiveTab] = useState<PluginTab>('catalog')
  const [plugins, setPlugins] = useState<PluginInstance[]>([])
  const [showPluginManager, setShowPluginManager] = useState(false)

  useEffect(() => {
    if (isActive) {
      // Refresh plugin data when panel becomes active
      setPlugins(pluginService.getPlugins())
    }
  }, [isActive])

  useEffect(() => {
    // Refresh plugin data periodically
    const interval = setInterval(() => {
      if (isActive) {
        setPlugins(pluginService.getPlugins())
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [isActive])

  if (!isActive) {
    return null
  }

  const getUpdateCount = () => {
    // For now, return 0 as we don't have update functionality yet
    // In the future, this would check for available updates
    return 0
  }

  const getInstalledCount = () => {
    return plugins.length
  }

  const getActiveCount = () => {
    return plugins.filter(p => p.activated).length
  }

  const tabs = [
    {
      id: 'catalog' as PluginTab,
      label: 'Install',
      icon: <Icons.Download size={16} />,
      description: 'Browse and install plugins'
    },
    {
      id: 'updates' as PluginTab,
      label: 'Updates',
      icon: <Icons.RefreshCw size={16} />,
      description: 'Check for plugin updates',
      count: getUpdateCount()
    },
    {
      id: 'manager' as PluginTab,
      label: 'Manager',
      icon: <Icons.Settings size={16} />,
      description: 'Manage installed plugins',
      count: getInstalledCount()
    }
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'catalog':
        return (
          <PluginCatalog
            onInstall={() => {
              // Refresh plugins after installation
              setPlugins(pluginService.getPlugins())
            }}
          />
        )
      
      case 'updates':
        return (
          <div className="p-6 text-center">
            <Icons.RefreshCw size={48} className="mx-auto mb-4 text-theme-text-muted" />
            <h3 className="text-lg font-medium text-theme-text-primary mb-2">
              Plugin Updates
            </h3>
            <p className="text-theme-text-secondary mb-4">
              Update functionality coming soon. All plugins are up to date.
            </p>
            <div className="text-sm text-theme-text-muted">
              Check back later for automatic update detection and one-click updates.
            </div>
          </div>
        )
      
      case 'manager':
        return (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-medium text-theme-text-primary">
                  Plugin Manager
                </h3>
                <p className="text-sm text-theme-text-secondary">
                  Manage your installed plugins ({getInstalledCount()} installed, {getActiveCount()} active)
                </p>
              </div>
              <button
                onClick={() => setShowPluginManager(true)}
                className="px-4 py-2 bg-theme-accent text-white rounded-lg hover:bg-theme-accent-dark transition-colors"
              >
                Advanced Manager
              </button>
            </div>

            {plugins.length === 0 ? (
              <div className="text-center py-12 text-theme-text-secondary">
                <Icons.Package size={48} className="mx-auto mb-4 opacity-50" />
                <p>No plugins installed</p>
                <button
                  onClick={() => setActiveTab('catalog')}
                  className="mt-4 text-theme-accent hover:underline"
                >
                  Browse plugin catalog
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {plugins.map(plugin => (
                  <div
                    key={plugin.manifest.name}
                    className="border border-theme-border rounded-lg p-4 bg-theme-bg-secondary"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-medium text-theme-text-primary">
                            {plugin.manifest.name}
                          </h4>
                          <span className="text-xs px-2 py-1 bg-theme-bg-tertiary rounded text-theme-text-secondary">
                            v{plugin.manifest.version}
                          </span>
                          <div className={`w-2 h-2 rounded-full ${
                            plugin.activated ? 'bg-green-500' : 'bg-gray-400'
                          }`} />
                        </div>
                        <p className="text-sm text-theme-text-secondary">
                          {plugin.manifest.description}
                        </p>
                        <div className="text-xs text-theme-text-muted mt-1">
                          By {plugin.manifest.author} • Loaded {new Date(plugin.loadedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={async () => {
                            try {
                              if (plugin.activated) {
                                await pluginService.deactivatePlugin(plugin.manifest.name)
                              } else {
                                await pluginService.activatePlugin(plugin.manifest.name)
                              }
                              setPlugins(pluginService.getPlugins())
                            } catch (error) {
                              console.error('Failed to toggle plugin:', error)
                            }
                          }}
                          className={`px-3 py-1 text-xs rounded transition-colors ${
                            plugin.activated
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {plugin.activated ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Tab Navigation */}
      <div className="border-b border-theme-border bg-theme-bg-primary">
        <div className="flex">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-theme-accent text-theme-accent bg-theme-bg-secondary'
                  : 'border-transparent text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg-secondary'
              }`}
              title={tab.description}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span className="text-xs px-1.5 py-0.5 bg-theme-accent text-white rounded-full min-w-[18px] text-center">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          {renderTabContent()}
        </div>
      </div>

      {/* Advanced Plugin Manager Modal */}
      {showPluginManager && (
        <PluginManager
          isOpen={showPluginManager}
          onClose={() => setShowPluginManager(false)}
        />
      )}
    </div>
  )
}

export default PluginPanel