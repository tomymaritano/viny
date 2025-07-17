import { z } from 'zod'
import { SettingsSchema } from '../types'

export const syncSettings: SettingsSchema[] = [
  {
    key: 'syncProvider',
    category: 'sync',
    label: 'Sync Provider',
    description: 'Choose synchronization service',
    type: 'select',
    defaultValue: 'none',
    options: [
      { value: 'none', label: 'Disabled' },
      { value: 'viny-sync', label: 'Viny Sync' },
      { value: 'webdav', label: 'WebDAV' },
      { value: 'custom', label: 'Custom Server' }
    ]
  },
  {
    key: 'autoSync',
    category: 'sync',
    label: 'Auto Sync',
    description: 'Automatically sync changes',
    type: 'boolean',
    defaultValue: false,
    dependencies: [{
      condition: (value) => value === true,
      targetKey: 'syncProvider',
      targetValue: 'viny-sync'
    }]
  },
  {
    key: 'syncInterval',
    category: 'sync',
    label: 'Sync Interval',
    description: 'Minutes between sync operations',
    type: 'number',
    defaultValue: 5,
    min: 1,
    max: 60,
    step: 1
  },
  {
    key: 'syncUrl',
    category: 'sync',
    label: 'Sync Server URL',
    description: 'Custom sync server endpoint',
    type: 'string',
    defaultValue: '',
    placeholder: 'https://sync.example.com',
    validation: z.string().url().optional().or(z.literal(''))
  },
  {
    key: 'syncUsername',
    category: 'sync',
    label: 'Username',
    description: 'Sync service username',
    type: 'string',
    defaultValue: '',
    placeholder: 'Enter username'
  },
  {
    key: 'syncEncryption',
    category: 'sync',
    label: 'End-to-End Encryption',
    description: 'Encrypt data before syncing',
    type: 'boolean',
    defaultValue: true
  },
  {
    key: 'syncConflictResolution',
    category: 'sync',
    label: 'Conflict Resolution',
    description: 'How to handle sync conflicts',
    type: 'select',
    defaultValue: 'ask',
    options: [
      { value: 'ask', label: 'Ask Each Time' },
      { value: 'local', label: 'Keep Local Version' },
      { value: 'remote', label: 'Keep Remote Version' },
      { value: 'merge', label: 'Merge Changes' }
    ]
  },
  {
    key: 'syncOnStartup',
    category: 'sync',
    label: 'Sync on Startup',
    description: 'Sync when opening the app',
    type: 'boolean',
    defaultValue: true
  },
  {
    key: 'syncOnClose',
    category: 'sync',
    label: 'Sync on Close',
    description: 'Sync before closing the app',
    type: 'boolean',
    defaultValue: true
  },
  {
    key: 'syncNotebooks',
    category: 'sync',
    label: 'Sync Notebooks',
    description: 'Include notebooks in sync',
    type: 'boolean',
    defaultValue: true
  },
  {
    key: 'syncTags',
    category: 'sync',
    label: 'Sync Tags',
    description: 'Include tags in sync',
    type: 'boolean',
    defaultValue: true
  },
  {
    key: 'syncSettings',
    category: 'sync',
    label: 'Sync Settings',
    description: 'Sync app settings across devices',
    type: 'boolean',
    defaultValue: false
  },
  {
    key: 'syncAttachments',
    category: 'sync',
    label: 'Sync Attachments',
    description: 'Include images and files',
    type: 'boolean',
    defaultValue: true
  },
  {
    key: 'syncBandwidthLimit',
    category: 'sync',
    label: 'Bandwidth Limit',
    description: 'Maximum KB/s for sync (0 = unlimited)',
    type: 'number',
    defaultValue: 0,
    min: 0,
    max: 10000,
    step: 100
  },
  {
    key: 'syncRetryAttempts',
    category: 'sync',
    label: 'Retry Attempts',
    description: 'Times to retry failed sync',
    type: 'number',
    defaultValue: 3,
    min: 0,
    max: 10,
    step: 1
  },
  {
    key: 'offlineMode',
    category: 'sync',
    label: 'Offline Mode',
    description: 'Work offline and sync later',
    type: 'boolean',
    defaultValue: false
  }
]