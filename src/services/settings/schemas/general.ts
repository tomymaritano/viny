import type { SettingsSchema } from '../types'

export const generalSchema: SettingsSchema[] = [
  {
    key: 'appName',
    type: 'string',
    defaultValue: 'Viny',
    label: 'Application Name',
    description: 'The name displayed in the application title bar',
    category: 'general'
  },
  {
    key: 'language',
    type: 'select',
    defaultValue: 'en',
    label: 'Language',
    description: 'Interface language',
    category: 'general',
    options: [
      { value: 'en', label: 'English' },
      { value: 'es', label: 'Español' },
      { value: 'fr', label: 'Français' },
      { value: 'de', label: 'Deutsch' },
      { value: 'it', label: 'Italiano' },
      { value: 'pt', label: 'Português' },
      { value: 'ru', label: 'Русский' },
      { value: 'zh', label: '中文' },
      { value: 'ja', label: '日本語' },
      { value: 'ko', label: '한국어' }
    ]
  },
  {
    key: 'autoSave',
    type: 'boolean',
    defaultValue: true,
    label: 'Auto Save',
    description: 'Automatically save notes while editing',
    category: 'general'
  },
  {
    key: 'autoSaveInterval',
    type: 'number',
    defaultValue: 30,
    label: 'Auto Save Interval',
    description: 'How often to auto-save (in seconds)',
    category: 'general',
    min: 5,
    max: 300,
    step: 5,
    dependencies: {
      autoSave: true
    }
  },
  {
    key: 'confirmDeletes',
    type: 'boolean',
    defaultValue: true,
    label: 'Confirm Deletions',
    description: 'Show confirmation dialog before deleting notes',
    category: 'general'
  },
  {
    key: 'startupBehavior',
    type: 'select',
    defaultValue: 'restore',
    label: 'Startup Behavior',
    description: 'What to do when the application starts',
    category: 'general',
    options: [
      { value: 'restore', label: 'Restore Last Session' },
      { value: 'new', label: 'Start with New Note' },
      { value: 'welcome', label: 'Show Welcome Screen' }
    ]
  },
  {
    key: 'showSidebar',
    type: 'boolean',
    defaultValue: true,
    label: 'Show Sidebar',
    description: 'Display the sidebar with notes list',
    category: 'general'
  },
  {
    key: 'sidebarWidth',
    type: 'number',
    defaultValue: 280,
    label: 'Sidebar Width',
    description: 'Width of the sidebar in pixels',
    category: 'general',
    min: 200,
    max: 500,
    step: 10,
    dependencies: {
      showSidebar: true
    }
  },
  {
    key: 'checkForUpdates',
    type: 'boolean',
    defaultValue: true,
    label: 'Check for Updates',
    description: 'Automatically check for application updates',
    category: 'general'
  },
  {
    key: 'updateChannel',
    type: 'select',
    defaultValue: 'stable',
    label: 'Update Channel',
    description: 'Which update channel to use',
    category: 'general',
    options: [
      { value: 'stable', label: 'Stable' },
      { value: 'beta', label: 'Beta' },
      { value: 'alpha', label: 'Alpha' }
    ],
    dependencies: {
      checkForUpdates: true
    }
  },
  {
    key: 'defaultNotebook',
    type: 'select',
    defaultValue: 'inbox',
    label: 'Default Notebook',
    description: 'Default notebook for new notes',
    category: 'general',
    options: [
      { value: 'inbox', label: 'Inbox' },
      { value: 'learn', label: 'Learn' },
      { value: 'personal', label: 'Personal' },
      { value: 'projects', label: 'Projects' },
      { value: 'work', label: 'Work' }
    ],
    dynamicOptions: true
  }
]