import { z } from 'zod'
import { SettingsSchema } from '../types'

export const backupSettings: SettingsSchema[] = [
  {
    key: 'autoBackup',
    category: 'backup',
    label: 'Automatic Backup',
    description: 'Enable automatic backups of your notes',
    type: 'boolean',
    defaultValue: true
  },
  {
    key: 'backupFrequency',
    category: 'backup',
    label: 'Backup Frequency',
    description: 'How often to create backups',
    type: 'select',
    defaultValue: 'daily',
    options: [
      { value: 'hourly', label: 'Every Hour' },
      { value: 'daily', label: 'Daily' },
      { value: 'weekly', label: 'Weekly' },
      { value: 'monthly', label: 'Monthly' }
    ],
    dependencies: [{
      condition: (value) => value !== 'never',
      targetKey: 'autoBackup',
      targetValue: true
    }]
  },
  {
    key: 'backupLocation',
    category: 'backup',
    label: 'Backup Location',
    description: 'Where to store backups',
    type: 'string',
    defaultValue: '',
    placeholder: 'Choose backup folder'
  },
  {
    key: 'backupRetentionDays',
    category: 'backup',
    label: 'Backup Retention',
    description: 'Days to keep old backups (0 = forever)',
    type: 'number',
    defaultValue: 30,
    min: 0,
    max: 365,
    step: 1
  },
  {
    key: 'backupOnClose',
    category: 'backup',
    label: 'Backup on Close',
    description: 'Create a backup when closing the app',
    type: 'boolean',
    defaultValue: false
  },
  {
    key: 'backupCompression',
    category: 'backup',
    label: 'Compress Backups',
    description: 'Use compression to save space',
    type: 'boolean',
    defaultValue: true
  },
  {
    key: 'backupEncryption',
    category: 'backup',
    label: 'Encrypt Backups',
    description: 'Protect backups with encryption',
    type: 'boolean',
    defaultValue: false
  },
  {
    key: 'backupIncludeSettings',
    category: 'backup',
    label: 'Include Settings',
    description: 'Include app settings in backups',
    type: 'boolean',
    defaultValue: true
  },
  {
    key: 'backupIncludeAttachments',
    category: 'backup',
    label: 'Include Attachments',
    description: 'Include images and files in backups',
    type: 'boolean',
    defaultValue: true
  },
  {
    key: 'backupIncludeTrash',
    category: 'backup',
    label: 'Include Trash',
    description: 'Include deleted notes in backups',
    type: 'boolean',
    defaultValue: false
  },
  {
    key: 'maxBackupSize',
    category: 'backup',
    label: 'Max Backup Size',
    description: 'Maximum size for backup files (MB)',
    type: 'number',
    defaultValue: 100,
    min: 10,
    max: 1000,
    step: 10
  },
  {
    key: 'backupNotifications',
    category: 'backup',
    label: 'Backup Notifications',
    description: 'Show notifications for backup status',
    type: 'boolean',
    defaultValue: true
  },
  {
    key: 'cloudBackup',
    category: 'backup',
    label: 'Cloud Backup',
    description: 'Enable cloud backup integration',
    type: 'boolean',
    defaultValue: false,
    experimental: true
  },
  {
    key: 'cloudProvider',
    category: 'backup',
    label: 'Cloud Provider',
    description: 'Choose cloud storage provider',
    type: 'select',
    defaultValue: 'none',
    options: [
      { value: 'none', label: 'None' },
      { value: 'gdrive', label: 'Google Drive' },
      { value: 'dropbox', label: 'Dropbox' },
      { value: 'onedrive', label: 'OneDrive' },
      { value: 's3', label: 'Amazon S3' }
    ],
    dependencies: [{
      condition: (value) => value !== 'none',
      targetKey: 'cloudBackup',
      targetValue: true
    }]
  }
]