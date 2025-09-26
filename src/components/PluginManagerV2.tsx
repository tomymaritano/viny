/**
 * PluginManagerV2 - Clean Architecture Implementation
 * Uses Service Layer + TanStack Query V2
 */

import React, { memo, useState } from 'react'
import { useModalStore } from '../stores/cleanUIStore'
import { StandardModal } from './ui/StandardModal'
import { Icons } from './Icons'
import { useToast } from '../hooks/useToast'
import { pluginService } from '../services/PluginService'
import { PluginPanel } from './plugins/PluginPanel'
import { PluginCatalog } from './plugins/PluginCatalog'

export const PluginManagerV2: React.FC = memo(() => {
  const { modals, setModal } = useModalStore()
  const { showToast } = useToast()
  const [activeTab, setActiveTab] = useState<'installed' | 'catalog'>('installed')
  
  const installedPlugins = pluginService.getInstalledPlugins()

  const handleClose = () => {
    setModal('plugins', false)
  }

  const handleTogglePlugin = async (pluginId: string, enabled: boolean) => {
    try {
      if (enabled) {
        await pluginService.enablePlugin(pluginId)
      } else {
        await pluginService.disablePlugin(pluginId)
      }
      showToast(`Plugin ${enabled ? 'enabled' : 'disabled'}`, 'success')
    } catch (error) {
      showToast(`Failed to ${enabled ? 'enable' : 'disable'} plugin`, 'error')
    }
  }

  const handleUninstallPlugin = async (pluginId: string) => {
    if (!confirm('Are you sure you want to uninstall this plugin?')) return
    
    try {
      await pluginService.uninstallPlugin(pluginId)
      showToast('Plugin uninstalled', 'success')
    } catch (error) {
      showToast('Failed to uninstall plugin', 'error')
    }
  }

  const handleInstallPlugin = async (pluginUrl: string) => {
    try {
      await pluginService.installPlugin(pluginUrl)
      showToast('Plugin installed successfully', 'success')
      setActiveTab('installed')
    } catch (error) {
      showToast('Failed to install plugin', 'error')
    }
  }

  if (!modals.plugins) return null

  return (
    <StandardModal
      isOpen={modals.plugins}
      onClose={handleClose}
      title="Plugin Manager"
      className="max-w-4xl"
    >
      <div className="flex flex-col h-[600px]">
        {/* Tabs */}
        <div className="flex border-b border-theme-border">
          <button
            onClick={() => setActiveTab('installed')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'installed'
                ? 'text-theme-primary border-b-2 border-theme-primary'
                : 'text-theme-text-secondary hover:text-theme-text-primary'
            }`}
          >
            <Icons.Package className="w-4 h-4 inline-block mr-2" />
            Installed ({installedPlugins.length})
          </button>
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'catalog'
                ? 'text-theme-primary border-b-2 border-theme-primary'
                : 'text-theme-text-secondary hover:text-theme-text-primary'
            }`}
          >
            <Icons.Store className="w-4 h-4 inline-block mr-2" />
            Catalog
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'installed' ? (
            <div className="space-y-4">
              {installedPlugins.length === 0 ? (
                <div className="text-center py-12">
                  <Icons.Package className="w-12 h-12 text-theme-text-secondary mx-auto mb-4" />
                  <p className="text-theme-text-secondary">No plugins installed</p>
                  <button
                    onClick={() => setActiveTab('catalog')}
                    className="mt-4 text-sm text-theme-primary hover:underline"
                  >
                    Browse catalog
                  </button>
                </div>
              ) : (
                installedPlugins.map(plugin => (
                  <PluginPanel
                    key={plugin.id}
                    plugin={plugin}
                    onToggle={(enabled) => handleTogglePlugin(plugin.id, enabled)}
                    onUninstall={() => handleUninstallPlugin(plugin.id)}
                  />
                ))
              )}
            </div>
          ) : (
            <PluginCatalog onInstall={handleInstallPlugin} />
          )}
        </div>

        {/* Help text */}
        <div className="border-t border-theme-border px-4 py-3">
          <p className="text-xs text-theme-text-secondary">
            <Icons.Info className="w-3 h-3 inline-block mr-1" />
            Plugins extend Viny with additional features. Be cautious when installing plugins from unknown sources.
          </p>
        </div>
      </div>
    </StandardModal>
  )
})

PluginManagerV2.displayName = 'PluginManagerV2'

export default PluginManagerV2