import { z } from 'zod'
import { SettingsSchema } from '../types'

export const pluginSettings: SettingsSchema[] = [
  {
    key: 'enablePlugins',
    category: 'plugins',
    label: 'Enable Plugins',
    description: 'Allow third-party extensions',
    type: 'boolean',
    defaultValue: false,
    experimental: true
  },
  {
    key: 'autoUpdatePlugins',
    category: 'plugins',
    label: 'Auto Update Plugins',
    description: 'Automatically update installed plugins',
    type: 'boolean',
    defaultValue: true,
    dependencies: [{
      condition: (value) => value === true,
      targetKey: 'enablePlugins',
      targetValue: true
    }]
  },
  {
    key: 'pluginSandbox',
    category: 'plugins',
    label: 'Plugin Sandbox',
    description: 'Run plugins in isolated environment',
    type: 'boolean',
    defaultValue: true
  },
  {
    key: 'pluginPermissions',
    category: 'plugins',
    label: 'Plugin Permissions',
    description: 'Default permissions for new plugins',
    type: 'select',
    defaultValue: 'minimal',
    options: [
      { value: 'minimal', label: 'Minimal' },
      { value: 'standard', label: 'Standard' },
      { value: 'full', label: 'Full Access' }
    ]
  },
  {
    key: 'enabledPlugins',
    category: 'plugins',
    label: 'Enabled Plugins',
    description: 'List of active plugins',
    type: 'array',
    defaultValue: []
  },
  {
    key: 'pluginSettings',
    category: 'plugins',
    label: 'Plugin Settings',
    description: 'Individual plugin configurations',
    type: 'object',
    defaultValue: {}
  },
  {
    key: 'pluginDevMode',
    category: 'plugins',
    label: 'Developer Mode',
    description: 'Enable plugin development features',
    type: 'boolean',
    defaultValue: false
  },
  {
    key: 'pluginDirectory',
    category: 'plugins',
    label: 'Plugin Directory',
    description: 'Custom plugin installation directory',
    type: 'string',
    defaultValue: '',
    placeholder: 'Default: ~/.viny/plugins'
  },
  {
    key: 'pluginMarketplace',
    category: 'plugins',
    label: 'Plugin Marketplace',
    description: 'Connect to plugin marketplace',
    type: 'boolean',
    defaultValue: true
  },
  {
    key: 'pluginUpdateInterval',
    category: 'plugins',
    label: 'Update Check Interval',
    description: 'Hours between plugin update checks',
    type: 'number',
    defaultValue: 24,
    min: 1,
    max: 168,
    step: 1
  },
  {
    key: 'pluginLoadTimeout',
    category: 'plugins',
    label: 'Load Timeout',
    description: 'Maximum seconds to load a plugin',
    type: 'number',
    defaultValue: 10,
    min: 1,
    max: 60,
    step: 1
  },
  {
    key: 'pluginMemoryLimit',
    category: 'plugins',
    label: 'Memory Limit',
    description: 'Maximum memory per plugin (MB)',
    type: 'number',
    defaultValue: 50,
    min: 10,
    max: 500,
    step: 10
  },
  {
    key: 'pluginNetworkAccess',
    category: 'plugins',
    label: 'Network Access',
    description: 'Allow plugins to make network requests',
    type: 'boolean',
    defaultValue: false
  },
  {
    key: 'pluginFileAccess',
    category: 'plugins',
    label: 'File System Access',
    description: 'Allow plugins to access files',
    type: 'select',
    defaultValue: 'none',
    options: [
      { value: 'none', label: 'No Access' },
      { value: 'read', label: 'Read Only' },
      { value: 'limited', label: 'Limited Write' },
      { value: 'full', label: 'Full Access' }
    ]
  },
  {
    key: 'pluginAnalytics',
    category: 'plugins',
    label: 'Plugin Analytics',
    description: 'Share usage data with plugin developers',
    type: 'boolean',
    defaultValue: false
  }
]