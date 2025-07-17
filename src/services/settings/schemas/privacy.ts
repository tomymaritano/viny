import { z } from 'zod'
import type { SettingsSchema } from '../types'

export const privacySchema: SettingsSchema[] = [
  {
    key: 'analyticsEnabled',
    category: 'privacy',
    label: 'Usage Analytics',
    description: 'Help improve the app by sharing anonymous usage data',
    type: 'boolean',
    defaultValue: false
  },
  {
    key: 'crashReporting',
    category: 'privacy',
    label: 'Crash Reporting',
    description: 'Automatically send crash reports to help fix issues',
    type: 'boolean',
    defaultValue: true
  },
  {
    key: 'localDataOnly',
    category: 'privacy',
    label: 'Local Data Only',
    description: 'Keep all data on this device only',
    type: 'boolean',
    defaultValue: true
  },
  {
    key: 'encryptLocalStorage',
    category: 'privacy',
    label: 'Encrypt Local Storage',
    description: 'Encrypt notes stored on this device',
    type: 'boolean',
    defaultValue: false,
    experimental: true
  },
  {
    key: 'encryptionKey',
    category: 'privacy',
    label: 'Encryption Key',
    description: 'Key for encrypting local data',
    type: 'string',
    defaultValue: '',
    placeholder: 'Enter encryption key',
    validation: z.string().min(8, 'Key must be at least 8 characters'),
    dependencies: [{
      condition: (value) => value !== '',
      targetKey: 'encryptLocalStorage',
      targetValue: true
    }]
  },
  {
    key: 'clearDataOnExit',
    category: 'privacy',
    label: 'Clear Data on Exit',
    description: 'Remove temporary data when closing the app',
    type: 'boolean',
    defaultValue: false
  },
  {
    key: 'anonymousMode',
    category: 'privacy',
    label: 'Anonymous Mode',
    description: 'Disable all tracking and telemetry',
    type: 'boolean',
    defaultValue: false,
    dependencies: [
      {
        condition: (value) => value === true,
        targetKey: 'analyticsEnabled',
        targetValue: false
      },
      {
        condition: (value) => value === true,
        targetKey: 'crashReporting',
        targetValue: false
      }
    ]
  },
  {
    key: 'exportIncludeMetadata',
    category: 'privacy',
    label: 'Include Metadata in Exports',
    description: 'Include creation dates and tags when exporting',
    type: 'boolean',
    defaultValue: true
  },
  {
    key: 'exportIncludeHistory',
    category: 'privacy',
    label: 'Include History in Exports',
    description: 'Include revision history when exporting',
    type: 'boolean',
    defaultValue: false
  },
  {
    key: 'dataRetentionDays',
    category: 'privacy',
    label: 'Data Retention Period',
    description: 'Days to keep deleted notes (0 = immediate deletion)',
    type: 'number',
    defaultValue: 30,
    min: 0,
    max: 365,
    step: 1
  },
  {
    key: 'autoDeleteOldData',
    category: 'privacy',
    label: 'Auto Delete Old Data',
    description: 'Automatically remove data older than retention period',
    type: 'boolean',
    defaultValue: false
  },
  {
    key: 'secureNoteDeletion',
    category: 'privacy',
    label: 'Secure Deletion',
    description: 'Overwrite data when deleting notes',
    type: 'boolean',
    defaultValue: true
  },
  {
    key: 'lockAfterInactivity',
    category: 'privacy',
    label: 'Lock After Inactivity',
    description: 'Require authentication after being idle',
    type: 'boolean',
    defaultValue: false
  },
  {
    key: 'inactivityTimeoutMinutes',
    category: 'privacy',
    label: 'Inactivity Timeout',
    description: 'Minutes before requiring authentication',
    type: 'number',
    defaultValue: 15,
    min: 1,
    max: 60,
    step: 1,
    dependencies: [{
      condition: (value) => value > 0,
      targetKey: 'lockAfterInactivity',
      targetValue: true
    }]
  },
  {
    key: 'requirePasswordOnStart',
    category: 'privacy',
    label: 'Password on Start',
    description: 'Require password when opening the app',
    type: 'boolean',
    defaultValue: false
  },
  {
    key: 'biometricUnlock',
    category: 'privacy',
    label: 'Biometric Unlock',
    description: 'Use fingerprint or face unlock',
    type: 'boolean',
    defaultValue: false,
    experimental: true
  },
  {
    key: 'clipboardTimeout',
    category: 'privacy',
    label: 'Clear Clipboard',
    description: 'Clear clipboard after copying (seconds, 0 = disabled)',
    type: 'number',
    defaultValue: 0,
    min: 0,
    max: 300,
    step: 10
  }
]