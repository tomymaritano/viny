import { useState, useEffect } from 'react'
import { usePluginStore } from '../stores/pluginStore'

// Plugin store with curated plugins
const PLUGIN_STORE = {
  featured: [
    // Plugin examples have been removed for cleanup
    // Real plugins can be added here when available
  ],
  categories: [
    'All',
    'Testing',
    'Editor',
    'Markdown',
    'Productivity',
    'Version Control',
    'Themes',
    'Export',
  ],
}

export default function PluginStore({ isVisible, onClose, onInstall }) {
  const { installPluginFromUrl, loading } = usePluginStore()
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedPlugin, setSelectedPlugin] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  if (!isVisible) return null

  const filteredPlugins = PLUGIN_STORE.featured.filter(plugin => {
    const matchesCategory =
      selectedCategory === 'All' || plugin.category === selectedCategory
    const matchesSearch =
      plugin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plugin.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plugin.tags.some(tag =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      )
    return matchesCategory && matchesSearch
  })

  const handleInstallPlugin = async plugin => {
    try {
      await installPluginFromUrl(plugin.url)
      onInstall?.(plugin)
    } catch (error) {
      console.error('Failed to install plugin:', error)
      // Error is handled by the store, UI will show it
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-solarized-base02 border border-solarized-base01 rounded-lg shadow-xl w-full max-w-6xl max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-solarized-base01">
          <div>
            <h2 className="text-xl font-bold text-solarized-base3">
              Plugin Store
            </h2>
            <p className="text-solarized-base1 text-sm">
              Discover and install plugins to enhance Nototo
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-solarized-base1 hover:text-solarized-base3 transition-colors"
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

        <div className="flex h-[calc(85vh-120px)]">
          {/* Sidebar */}
          <div className="w-64 border-r border-solarized-base01 p-4">
            {/* Search */}
            <div className="mb-6">
              <input
                type="text"
                placeholder="Search plugins..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-solarized-base01 border border-solarized-base00 rounded px-3 py-2 text-solarized-base3 placeholder-solarized-base0 focus:border-solarized-blue focus:outline-none"
              />
            </div>

            {/* Categories */}
            <div>
              <h3 className="text-sm font-semibold text-solarized-base3 mb-3">
                Categories
              </h3>
              <div className="space-y-1">
                {PLUGIN_STORE.categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                      selectedCategory === category
                        ? 'bg-solarized-blue text-solarized-base03'
                        : 'text-solarized-base1 hover:bg-solarized-base01 hover:text-solarized-base3'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">
            {!selectedPlugin ? (
              /* Plugin Grid */
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredPlugins.map(plugin => (
                    <div
                      key={plugin.id}
                      className="bg-solarized-base01 rounded-lg p-4 border border-solarized-base00 hover:border-solarized-blue transition-colors cursor-pointer"
                    >
                      <div onClick={() => setSelectedPlugin(plugin)}>
                        <div className="flex items-start justify-between mb-3">
                          <div className="text-2xl">{plugin.icon}</div>
                          <div className="flex items-center space-x-1 text-xs text-solarized-orange">
                            <span>★</span>
                            <span>{plugin.rating}</span>
                          </div>
                        </div>

                        <h3 className="font-semibold text-solarized-base3 mb-2">
                          {plugin.name}
                        </h3>
                        <p className="text-solarized-base1 text-sm mb-3 line-clamp-2">
                          {plugin.description}
                        </p>

                        <div className="flex items-center justify-between text-xs text-solarized-base0 mb-3">
                          <span>by {plugin.author}</span>
                          <span>
                            {plugin.downloads.toLocaleString()} downloads
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-1 mb-3">
                          {plugin.tags.slice(0, 3).map(tag => (
                            <span
                              key={tag}
                              className="bg-solarized-base00 text-solarized-base1 px-2 py-1 rounded text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={e => {
                          e.stopPropagation()
                          console.log(
                            '🔥 Install button clicked for plugin:',
                            plugin.name
                          )
                          handleInstallPlugin(plugin)
                        }}
                        disabled={loading}
                        className="w-full bg-solarized-green text-solarized-base03 py-2 rounded text-sm font-medium hover:bg-solarized-green/80 transition-colors disabled:opacity-50"
                      >
                        {loading ? 'Installing...' : 'Install'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Plugin Details */
              <div className="p-6">
                <button
                  onClick={() => setSelectedPlugin(null)}
                  className="flex items-center text-solarized-blue hover:text-solarized-blue/80 mb-6"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="mr-2"
                  >
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                  Back to store
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center space-x-4">
                        <div className="text-4xl">{selectedPlugin.icon}</div>
                        <div>
                          <h1 className="text-2xl font-bold text-solarized-base3">
                            {selectedPlugin.name}
                          </h1>
                          <p className="text-solarized-base1">
                            {selectedPlugin.description}
                          </p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-solarized-base0">
                            <span>by {selectedPlugin.author}</span>
                            <span>v{selectedPlugin.version}</span>
                            <span>
                              {selectedPlugin.downloads.toLocaleString()}{' '}
                              downloads
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h2 className="text-lg font-semibold text-solarized-base3 mb-3">
                        Features
                      </h2>
                      <ul className="space-y-2">
                        {selectedPlugin.features.map((feature, index) => (
                          <li
                            key={index}
                            className="flex items-start text-solarized-base1"
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              className="mr-2 mt-0.5 text-solarized-green"
                            >
                              <polyline points="20,6 9,17 4,12" />
                            </svg>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div>
                    <div className="bg-solarized-base01 rounded-lg p-4 border border-solarized-base00">
                      <button
                        onClick={() => {
                          console.log(
                            '🔥 Install Plugin button clicked for:',
                            selectedPlugin.name
                          )
                          handleInstallPlugin(selectedPlugin)
                        }}
                        disabled={loading}
                        className="w-full bg-solarized-green text-solarized-base03 py-3 rounded font-medium hover:bg-solarized-green/80 transition-colors disabled:opacity-50 mb-4"
                      >
                        {loading ? 'Installing...' : 'Install Plugin'}
                      </button>

                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-solarized-base1">Version</span>
                          <span className="text-solarized-base3">
                            {selectedPlugin.version}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-solarized-base1">Category</span>
                          <span className="text-solarized-base3">
                            {selectedPlugin.category}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-solarized-base1">Rating</span>
                          <div className="flex items-center text-solarized-orange">
                            <span>★</span>
                            <span className="ml-1 text-solarized-base3">
                              {selectedPlugin.rating}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-solarized-base00">
                        <h4 className="text-sm font-semibold text-solarized-base3 mb-2">
                          Tags
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {selectedPlugin.tags.map(tag => (
                            <span
                              key={tag}
                              className="bg-solarized-base00 text-solarized-base1 px-2 py-1 rounded text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
