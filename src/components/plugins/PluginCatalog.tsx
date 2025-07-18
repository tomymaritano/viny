import React, { useState, useEffect } from 'react'
import { pluginService } from '../../services/PluginService'
import { Icons } from '../Icons'
import { logger } from '../../utils/logger'

interface CatalogPlugin {
  id: string
  name: string
  description: string
  author: string
  version: string
  category: string
  features: string[]
  permissions: string[]
  sourceUrl?: string
  localPath?: string
  installed?: boolean
  activated?: boolean
}

const PLUGIN_CATALOG: CatalogPlugin[] = [
  {
    id: 'simple-hello-test',
    name: 'Hello World Test',
    description: 'Simple test plugin to verify basic functionality',
    author: 'Viny Team',
    version: '1.0.0',
    category: 'Development',
    features: ['Toast notifications', 'Basic API testing'],
    permissions: ['ui.toast'],
    localPath: '/examples/simple-hello-test.js'
  },
  {
    id: 'test-note-counter',
    name: 'Note Counter',
    description: 'Displays note statistics and counts in the sidebar',
    author: 'Viny Team',
    version: '1.0.0',
    category: 'Productivity',
    features: ['Note statistics', 'Sidebar integration', 'Storage persistence'],
    permissions: ['notes.read', 'ui.toast', 'ui.sidebar', 'storage.basic'],
    localPath: '/examples/test-note-counter.js'
  },
  {
    id: 'test-quick-note',
    name: 'Quick Note Creator',
    description: 'Rapid note creation with templates and toolbar integration',
    author: 'Viny Team',
    version: '1.0.0',
    category: 'Productivity',
    features: ['Quick note creation', 'Templates', 'Toolbar integration'],
    permissions: ['notes.read', 'notes.write', 'ui.toast', 'ui.toolbar', 'editor.write', 'storage.basic'],
    localPath: '/examples/test-quick-note.js'
  },
  {
    id: 'test-advanced-search',
    name: 'Advanced Search',
    description: 'Enhanced search capabilities with analytics and filters',
    author: 'Viny Team',
    version: '1.0.0',
    category: 'Search',
    features: ['Advanced search', 'Search analytics', 'Custom filters'],
    permissions: ['notes.read', 'ui.toast', 'ui.sidebar', 'ui.modal', 'storage.basic'],
    localPath: '/examples/test-advanced-search.js'
  },
  {
    id: 'test-full-integration',
    name: 'Full Integration Test',
    description: 'Comprehensive plugin testing all available APIs',
    author: 'Viny Team',
    version: '1.0.0',
    category: 'Development',
    features: ['Complete API testing', 'Performance monitoring', 'Error handling'],
    permissions: ['notes.read', 'notes.write', 'ui.toast', 'ui.modal', 'ui.sidebar', 'ui.toolbar', 'editor.read', 'editor.write', 'storage.basic', 'network'],
    localPath: '/examples/test-full-integration.js'
  }
]

interface PluginCatalogProps {
  onInstall?: (plugin: CatalogPlugin) => void
  onClose?: () => void
}

export const PluginCatalog: React.FC<PluginCatalogProps> = ({ onInstall, onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [catalogPlugins, setCatalogPlugins] = useState<CatalogPlugin[]>(PLUGIN_CATALOG)
  const [installing, setInstalling] = useState<string | null>(null)

  const categories = ['All', ...new Set(PLUGIN_CATALOG.map(p => p.category))]

  useEffect(() => {
    // Update installed/activated status
    const updatePluginStatus = () => {
      const installedPlugins = pluginService.getPlugins()
      const updatedCatalog = PLUGIN_CATALOG.map(catalogPlugin => {
        const installed = installedPlugins.find(p => p.manifest.name === catalogPlugin.id)
        return {
          ...catalogPlugin,
          installed: !!installed,
          activated: installed?.activated || false
        }
      })
      setCatalogPlugins(updatedCatalog)
    }

    updatePluginStatus()
    // Update every 2 seconds to reflect changes
    const interval = setInterval(updatePluginStatus, 2000)
    return () => clearInterval(interval)
  }, [])

  const filteredPlugins = catalogPlugins.filter(plugin => 
    selectedCategory === 'All' || plugin.category === selectedCategory
  )

  const handleInstall = async (plugin: CatalogPlugin) => {
    if (plugin.installed) {
      logger.info(`Plugin ${plugin.name} is already installed`)
      return
    }

    setInstalling(plugin.id)
    try {
      let success = false
      
      if (plugin.localPath) {
        // Install from local path (for example plugins)
        const response = await fetch(plugin.localPath)
        if (response.ok) {
          const pluginCode = await response.text()
          // Create a temporary file-like object
          const blob = new Blob([pluginCode], { type: 'text/javascript' })
          const file = new File([blob], `${plugin.id}.js`, { type: 'text/javascript' })
          
          success = await pluginService.loadPlugin(file, {
            trusted: true, // Example plugins are trusted
            permissions: plugin.permissions
          })
        }
      } else if (plugin.sourceUrl) {
        // Install from URL
        success = await pluginService.loadPlugin(plugin.sourceUrl, {
          trusted: false,
          permissions: plugin.permissions
        })
      }

      if (success) {
        logger.info(`Plugin ${plugin.name} installed successfully`)
        onInstall?.(plugin)
      } else {
        logger.error(`Failed to install plugin ${plugin.name}`)
      }
    } catch (error) {
      logger.error(`Error installing plugin ${plugin.name}:`, error)
    } finally {
      setInstalling(null)
    }
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Development': 'bg-blue-100 text-blue-800',
      'Productivity': 'bg-green-100 text-green-800',
      'Search': 'bg-purple-100 text-purple-800',
      'Editor': 'bg-yellow-100 text-yellow-800',
      'Utilities': 'bg-gray-100 text-gray-800'
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-theme-text-primary">Plugin Catalog</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-theme-text-secondary hover:text-theme-text-primary"
            title="Close catalog"
          >
            <Icons.X size={24} />
          </button>
        )}
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              selectedCategory === category
                ? 'bg-theme-accent text-white'
                : 'bg-theme-bg-secondary text-theme-text-secondary hover:bg-theme-bg-tertiary'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Plugin Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlugins.map(plugin => (
          <div
            key={plugin.id}
            className="border border-theme-border rounded-lg p-4 bg-theme-bg-secondary hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-theme-text-primary mb-1">
                  {plugin.name}
                </h3>
                <span className={`text-xs px-2 py-1 rounded ${getCategoryColor(plugin.category)}`}>
                  {plugin.category}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {plugin.activated && (
                  <div className="w-2 h-2 bg-green-500 rounded-full" title="Active" />
                )}
                {plugin.installed && !plugin.activated && (
                  <div className="w-2 h-2 bg-yellow-500 rounded-full" title="Installed" />
                )}
              </div>
            </div>

            <p className="text-sm text-theme-text-secondary mb-3 line-clamp-2">
              {plugin.description}
            </p>

            <div className="text-xs text-theme-text-muted mb-3">
              <div>By {plugin.author} • v{plugin.version}</div>
            </div>

            {/* Features */}
            <div className="mb-3">
              <div className="text-xs font-medium text-theme-text-secondary mb-1">Features:</div>
              <div className="flex flex-wrap gap-1">
                {plugin.features.slice(0, 3).map((feature, index) => (
                  <span
                    key={index}
                    className="text-xs px-2 py-0.5 bg-theme-bg-tertiary text-theme-text-secondary rounded"
                  >
                    {feature}
                  </span>
                ))}
                {plugin.features.length > 3 && (
                  <span className="text-xs text-theme-text-muted">
                    +{plugin.features.length - 3} more
                  </span>
                )}
              </div>
            </div>

            {/* Permissions */}
            <div className="mb-4">
              <div className="text-xs font-medium text-theme-text-secondary mb-1">
                Permissions ({plugin.permissions.length}):
              </div>
              <div className="text-xs text-theme-text-muted">
                {plugin.permissions.slice(0, 2).join(', ')}
                {plugin.permissions.length > 2 && (
                  <span> +{plugin.permissions.length - 2} more</span>
                )}
              </div>
            </div>

            {/* Install Button */}
            <button
              onClick={() => handleInstall(plugin)}
              disabled={plugin.installed || installing === plugin.id}
              className={`w-full py-2 px-4 rounded text-sm transition-colors ${
                plugin.installed
                  ? 'bg-green-100 text-green-800 cursor-not-allowed'
                  : installing === plugin.id
                  ? 'bg-gray-100 text-gray-600 cursor-not-allowed'
                  : 'bg-theme-accent text-white hover:bg-theme-accent-dark'
              }`}
            >
              {plugin.installed
                ? plugin.activated
                  ? 'Installed & Active'
                  : 'Installed'
                : installing === plugin.id
                ? 'Installing...'
                : 'Install Plugin'
              }
            </button>
          </div>
        ))}
      </div>

      {filteredPlugins.length === 0 && (
        <div className="text-center py-12 text-theme-text-secondary">
          <Icons.Package size={48} className="mx-auto mb-4 opacity-50" />
          <p>No plugins found in this category</p>
        </div>
      )}
    </div>
  )
}

export default PluginCatalog