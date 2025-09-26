/**
 * Viny Plugin Manager UI Component
 * Complete interface for plugin installation, management, and security monitoring
 */

import React, { useState, useEffect, useCallback } from 'react'
import { logger } from '../utils/logger'
import {
  pluginService,
  type PluginInstance,
  type PluginError,
} from '../services/PluginService'
import type { SecurityViolation } from '../services/PluginSecurityService'
import { CheckboxWithLabel } from './ui/CheckboxRadix'
import { RadioGroupWithLabels } from './ui/RadioGroupRadix'

interface PluginManagerProps {
  isOpen: boolean
  onClose: () => void
}

interface PluginInstallation {
  method: 'file' | 'url'
  source: File | string | null
  trusted: boolean
  permissions: string[]
}

const defaultInstallation: PluginInstallation = {
  method: 'file',
  source: null,
  trusted: false,
  permissions: ['notes.read', 'ui.toast', 'storage.basic'],
}

export const PluginManager: React.FC<PluginManagerProps> = ({
  isOpen,
  onClose,
}) => {
  const [plugins, setPlugins] = useState<PluginInstance[]>([])
  const [errors, setErrors] = useState<PluginError[]>([])
  const [violations, setViolations] = useState<SecurityViolation[]>([])
  const [installation, setInstallation] =
    useState<PluginInstallation>(defaultInstallation)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<
    'installed' | 'install' | 'security'
  >('installed')
  const [selectedPlugin, setSelectedPlugin] = useState<string | null>(null)

  // Refresh plugin data
  const refreshData = useCallback(() => {
    setPlugins(pluginService.getPlugins())
    setErrors(pluginService.getErrors())
    setViolations(pluginService.getSecurityViolations())
  }, [])

  useEffect(() => {
    if (isOpen) {
      refreshData()
    }
  }, [isOpen, refreshData])

  // Install plugin
  const handleInstallPlugin = async () => {
    if (!installation.source) return

    setLoading(true)
    try {
      const success = await pluginService.loadPlugin(installation.source, {
        trusted: installation.trusted,
        permissions: installation.permissions,
      })

      if (success) {
        refreshData()
        setInstallation(defaultInstallation)
        setActiveTab('installed')
        logger.info('Plugin installed successfully')
      }
    } catch (error) {
      logger.error('Plugin installation failed:', error)
    } finally {
      setLoading(false)
    }
  }

  // Activate/Deactivate plugin
  const handleTogglePlugin = async (pluginName: string, activate: boolean) => {
    setLoading(true)
    try {
      if (activate) {
        await pluginService.activatePlugin(pluginName)
      } else {
        await pluginService.deactivatePlugin(pluginName)
      }
      refreshData()
    } catch (error) {
      logger.error(
        `Failed to ${activate ? 'activate' : 'deactivate'} plugin:`,
        error
      )
    } finally {
      setLoading(false)
    }
  }

  // Uninstall plugin
  const handleUninstallPlugin = async (pluginName: string) => {
    if (!confirm(`Are you sure you want to uninstall "${pluginName}"?`)) return

    setLoading(true)
    try {
      await pluginService.unloadPlugin(pluginName)
      refreshData()
      logger.info(`Plugin "${pluginName}" uninstalled`)
    } catch (error) {
      logger.error('Plugin uninstall failed:', error)
    } finally {
      setLoading(false)
    }
  }

  // File upload handler
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setInstallation({ ...installation, source: file })
    }
  }

  // Get security status for plugin
  const getSecurityStatus = (pluginName: string) => {
    const pluginViolations = violations.filter(v => v.pluginName === pluginName)
    const quarantine = pluginService.shouldQuarantinePlugin(pluginName)

    if (quarantine) return { status: 'critical', text: 'Quarantined' }
    if (pluginViolations.some(v => v.severity === 'high'))
      return { status: 'warning', text: 'Security Issues' }
    if (pluginViolations.length > 0)
      return { status: 'info', text: 'Minor Issues' }
    return { status: 'success', text: 'Secure' }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-theme-bg-primary rounded-lg w-full max-w-6xl h-5/6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-theme-border">
          <h2 className="text-xl font-semibold text-theme-text-primary">
            Plugin Manager
          </h2>
          <button
            onClick={onClose}
            className="text-theme-text-secondary hover:text-theme-text-primary"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-theme-border">
          {[
            { id: 'installed', label: 'Installed Plugins', icon: 'PKG' },
            { id: 'install', label: 'Install Plugin', icon: 'DL' },
            { id: 'security', label: 'Security', icon: 'SEC' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-theme-accent text-theme-accent'
                  : 'border-transparent text-theme-text-secondary hover:text-theme-text-primary'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'installed' && (
            <div className="h-full overflow-y-auto p-6">
              <div className="space-y-4">
                {plugins.length === 0 ? (
                  <div className="text-center py-12 text-theme-text-secondary">
                    <div className="text-4xl mb-4 text-theme-text-muted">
                      [ ]
                    </div>
                    <p>No plugins installed</p>
                    <p className="text-sm mt-2">
                      Install your first plugin to get started
                    </p>
                  </div>
                ) : (
                  plugins.map(plugin => {
                    const security = getSecurityStatus(plugin.manifest.name)
                    const resourceUsage = pluginService.getPluginResourceUsage(
                      plugin.manifest.name
                    )

                    return (
                      <div
                        key={plugin.manifest.name}
                        className="border border-theme-border rounded-lg p-4 bg-theme-bg-secondary"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-theme-text-primary">
                                {plugin.manifest.name}
                              </h3>
                              <span className="text-xs px-2 py-1 bg-theme-bg-tertiary rounded text-theme-text-secondary">
                                v{plugin.manifest.version}
                              </span>
                              <span
                                className={`text-xs px-2 py-1 rounded ${
                                  security.status === 'success'
                                    ? 'bg-green-100 text-green-800'
                                    : security.status === 'warning'
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : security.status === 'critical'
                                        ? 'bg-red-100 text-red-800'
                                        : 'bg-blue-100 text-blue-800'
                                }`}
                              >
                                {security.text}
                              </span>
                            </div>

                            <p className="text-theme-text-secondary text-sm mb-3">
                              {plugin.manifest.description}
                            </p>

                            <div className="flex items-center gap-4 text-xs text-theme-text-secondary">
                              <span>Author: {plugin.manifest.author}</span>
                              <span>
                                Loaded:{' '}
                                {new Date(plugin.loadedAt).toLocaleDateString()}
                              </span>
                              {plugin.activatedAt && (
                                <span>
                                  Activated:{' '}
                                  {new Date(
                                    plugin.activatedAt
                                  ).toLocaleDateString()}
                                </span>
                              )}
                            </div>

                            {resourceUsage && (
                              <div className="mt-2 text-xs text-theme-text-secondary">
                                Memory:{' '}
                                {Math.round(resourceUsage.memory / 1024 / 1024)}
                                MB | Requests: {resourceUsage.networkRequests} |
                                Execution:{' '}
                                {Math.round(resourceUsage.executionTime)}ms
                              </div>
                            )}

                            {plugin.error && (
                              <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                                Error: {plugin.error}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2 ml-4">
                            <button
                              onClick={() =>
                                handleTogglePlugin(
                                  plugin.manifest.name,
                                  !plugin.activated
                                )
                              }
                              disabled={loading}
                              className={`px-3 py-1 text-xs rounded transition-colors ${
                                plugin.activated
                                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                  : 'bg-green-100 text-green-700 hover:bg-green-200'
                              }`}
                            >
                              {plugin.activated ? 'Deactivate' : 'Activate'}
                            </button>

                            <button
                              onClick={() =>
                                setSelectedPlugin(
                                  selectedPlugin === plugin.manifest.name
                                    ? null
                                    : plugin.manifest.name
                                )
                              }
                              className="px-3 py-1 text-xs bg-theme-bg-tertiary text-theme-text-primary rounded hover:bg-theme-bg-quaternary"
                            >
                              Details
                            </button>

                            <button
                              onClick={() =>
                                handleUninstallPlugin(plugin.manifest.name)
                              }
                              disabled={loading}
                              className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                            >
                              Uninstall
                            </button>
                          </div>
                        </div>

                        {/* Plugin Details */}
                        {selectedPlugin === plugin.manifest.name && (
                          <div className="mt-4 pt-4 border-t border-theme-border">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <h4 className="font-medium text-theme-text-primary mb-2">
                                  Manifest
                                </h4>
                                <pre className="bg-theme-bg-tertiary p-3 rounded text-xs overflow-auto">
                                  {JSON.stringify(plugin.manifest, null, 2)}
                                </pre>
                              </div>
                              <div>
                                <h4 className="font-medium text-theme-text-primary mb-2">
                                  Configuration
                                </h4>
                                <pre className="bg-theme-bg-tertiary p-3 rounded text-xs overflow-auto">
                                  {JSON.stringify(plugin.config, null, 2)}
                                </pre>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )}

          {activeTab === 'install' && (
            <div className="h-full overflow-y-auto p-6">
              <div className="max-w-2xl mx-auto">
                <h3 className="text-lg font-semibold text-theme-text-primary mb-6">
                  Install New Plugin
                </h3>

                {/* Installation Method */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-theme-text-primary mb-2">
                    Installation Method
                  </label>
                  <RadioGroupWithLabels
                    value={installation.method}
                    onValueChange={value =>
                      setInstallation({
                        ...installation,
                        method: value as 'file' | 'url',
                      })
                    }
                    orientation="horizontal"
                    options={[
                      {
                        value: 'file',
                        label: 'Upload File',
                        description: 'Install from a local plugin file',
                      },
                      {
                        value: 'url',
                        label: 'From URL',
                        description: 'Install from a remote URL',
                      },
                    ]}
                  />
                </div>

                {/* Source Input */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-theme-text-primary mb-2">
                    Plugin Source
                  </label>
                  {installation.method === 'file' ? (
                    <input
                      type="file"
                      accept=".js,.json"
                      onChange={handleFileUpload}
                      className="w-full p-3 border border-theme-border rounded-lg bg-theme-bg-secondary"
                    />
                  ) : (
                    <input
                      type="url"
                      placeholder="https://example.com/plugin.js"
                      value={
                        typeof installation.source === 'string'
                          ? installation.source
                          : ''
                      }
                      onChange={e =>
                        setInstallation({
                          ...installation,
                          source: e.target.value,
                        })
                      }
                      className="w-full p-3 border border-theme-border rounded-lg bg-theme-bg-secondary"
                    />
                  )}
                </div>

                {/* Security Options */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-theme-text-primary mb-2">
                    Security Settings
                  </label>

                  <div className="space-y-3">
                    <CheckboxWithLabel
                      checked={installation.trusted}
                      onCheckedChange={checked =>
                        setInstallation({
                          ...installation,
                          trusted: checked,
                        })
                      }
                      label="Trusted Plugin"
                      description="Grants additional permissions for enhanced functionality"
                    />
                  </div>
                </div>

                {/* Permissions */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-theme-text-primary mb-2">
                    Permissions
                  </label>
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      {
                        id: 'notes.read',
                        label: 'Read Notes',
                        description: 'Access to read note content',
                      },
                      {
                        id: 'notes.write',
                        label: 'Write Notes',
                        description: 'Permission to create and modify notes',
                      },
                      {
                        id: 'ui.toast',
                        label: 'Show Toasts',
                        description: 'Display notification messages',
                      },
                      {
                        id: 'ui.modal',
                        label: 'Show Modals',
                        description: 'Open dialog windows',
                      },
                      {
                        id: 'ui.sidebar',
                        label: 'Sidebar Access',
                        description: 'Interact with the sidebar',
                      },
                      {
                        id: 'editor.read',
                        label: 'Read Editor',
                        description: 'Access editor content and state',
                      },
                      {
                        id: 'editor.write',
                        label: 'Write Editor',
                        description: 'Modify editor content and settings',
                      },
                      {
                        id: 'storage.basic',
                        label: 'Basic Storage',
                        description: 'Store plugin configuration',
                      },
                      {
                        id: 'network',
                        label: 'Network Access',
                        description: 'Make HTTP requests',
                      },
                      {
                        id: 'timers',
                        label: 'Timers',
                        description: 'Use setTimeout and setInterval',
                      },
                    ].map(permission => (
                      <CheckboxWithLabel
                        key={permission.id}
                        checked={installation.permissions.includes(
                          permission.id
                        )}
                        onCheckedChange={checked => {
                          const newPermissions = checked
                            ? [...installation.permissions, permission.id]
                            : installation.permissions.filter(
                                p => p !== permission.id
                              )
                          setInstallation({
                            ...installation,
                            permissions: newPermissions,
                          })
                        }}
                        label={permission.label}
                        description={permission.description}
                        size="sm"
                      />
                    ))}
                  </div>
                </div>

                {/* Install Button */}
                <button
                  onClick={handleInstallPlugin}
                  disabled={!installation.source || loading}
                  className="w-full py-3 px-4 bg-theme-accent text-white rounded-lg hover:bg-theme-accent-dark disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Installing...' : 'Install Plugin'}
                </button>

                {/* Plugin Examples */}
                <div className="mt-8 p-4 bg-theme-bg-secondary rounded-lg">
                  <h4 className="font-medium text-theme-text-primary mb-3">
                    Example Plugins
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong>Hello World:</strong>{' '}
                      public/examples/hello-world-plugin.js
                    </div>
                    <div>
                      <strong>Vim Mode:</strong>{' '}
                      public/examples/vim-mode-plugin.js
                    </div>
                    <div>
                      <strong>Emoji Picker:</strong>{' '}
                      public/examples/emoji-picker-plugin.js
                    </div>
                    <div>
                      <strong>Note Counter:</strong>{' '}
                      public/examples/note-counter-plugin.js
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="h-full overflow-y-auto p-6">
              <h3 className="text-lg font-semibold text-theme-text-primary mb-6">
                Security Monitor
              </h3>

              {/* Security Overview */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-theme-bg-secondary p-4 rounded-lg">
                  <div className="text-2xl font-bold text-theme-text-primary">
                    {plugins.length}
                  </div>
                  <div className="text-sm text-theme-text-secondary">
                    Active Plugins
                  </div>
                </div>
                <div className="bg-theme-bg-secondary p-4 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {
                      violations.filter(
                        v => v.severity === 'high' || v.severity === 'critical'
                      ).length
                    }
                  </div>
                  <div className="text-sm text-theme-text-secondary">
                    High-Risk Violations
                  </div>
                </div>
                <div className="bg-theme-bg-secondary p-4 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {
                      plugins.filter(p =>
                        pluginService.shouldQuarantinePlugin(p.manifest.name)
                      ).length
                    }
                  </div>
                  <div className="text-sm text-theme-text-secondary">
                    Quarantined Plugins
                  </div>
                </div>
              </div>

              {/* Security Violations */}
              <div className="mb-6">
                <h4 className="font-medium text-theme-text-primary mb-3">
                  Recent Security Violations
                </h4>
                <div className="space-y-2">
                  {violations.slice(0, 10).map((violation, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border-l-4 ${
                        violation.severity === 'critical'
                          ? 'border-red-500 bg-red-50'
                          : violation.severity === 'high'
                            ? 'border-orange-500 bg-orange-50'
                            : violation.severity === 'medium'
                              ? 'border-yellow-500 bg-yellow-50'
                              : 'border-blue-500 bg-blue-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">
                            {violation.pluginName}: {violation.violation}
                          </div>
                          <div className="text-sm text-gray-600">
                            {new Date(violation.timestamp).toLocaleString()}
                          </div>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs rounded ${
                            violation.severity === 'critical'
                              ? 'bg-red-100 text-red-800'
                              : violation.severity === 'high'
                                ? 'bg-orange-100 text-orange-800'
                                : violation.severity === 'medium'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {violation.severity.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))}
                  {violations.length === 0 && (
                    <div className="text-center py-8 text-theme-text-secondary">
                      <div className="text-4xl mb-2">[ ]</div>
                      <p>No security violations detected</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Plugin Errors */}
              <div>
                <h4 className="font-medium text-theme-text-primary mb-3">
                  Plugin Errors
                </h4>
                <div className="space-y-2">
                  {errors.slice(0, 10).map((error, index) => (
                    <div
                      key={index}
                      className="p-3 bg-red-50 border border-red-200 rounded-lg"
                    >
                      <div className="font-medium text-red-900">
                        {error.plugin}: {error.error}
                      </div>
                      <div className="text-sm text-red-600">
                        {new Date(error.timestamp).toLocaleString()}
                      </div>
                      {error.stack && (
                        <details className="mt-2">
                          <summary className="text-sm text-red-600 cursor-pointer">
                            Stack Trace
                          </summary>
                          <pre className="text-xs mt-1 text-red-700 whitespace-pre-wrap">
                            {error.stack}
                          </pre>
                        </details>
                      )}
                    </div>
                  ))}
                  {errors.length === 0 && (
                    <div className="text-center py-8 text-theme-text-secondary">
                      <div className="text-4xl mb-2">[ ]</div>
                      <p>No plugin errors</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PluginManager
