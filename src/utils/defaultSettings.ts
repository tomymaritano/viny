/**
 * Default settings for the application
 */

import type { AppSettings } from '../types/settings'

export const defaultSettings: AppSettings = {
  // Theme
  theme: 'dark',
  
  // Layout
  sidebarWidth: 240,
  notesListWidth: 320,
  
  // Editor
  editor: {
    fontSize: 16,
    lineHeight: 1.6,
    fontFamily: 'system-ui',
    tabSize: 2,
    wordWrap: true,
    showLineNumbers: false,
    showIndentGuides: true,
    minimap: false,
  },
  
  // Markdown Preview
  markdownPreview: {
    fontSize: 16,
    lineHeight: 1.7,
    codeTheme: 'github-dark',
    enableMath: true,
    enableMermaid: true,
    enableCheckboxes: true,
    enableFootnotes: true,
    enableEmoji: true,
  },
  
  // Features
  features: {
    autoSave: true,
    autoSaveDelay: 3000,
    spellCheck: true,
    wordCount: true,
    readingTime: true,
    focusMode: false,
    typewriterMode: false,
    showTableOfContents: true,
  },
  
  // Privacy
  privacy: {
    enableAnalytics: false,
    enableCrashReports: false,
    enableUsageStats: false,
  },
  
  // Sync
  sync: {
    enabled: false,
    interval: 300000, // 5 minutes
    conflictResolution: 'manual',
  },
  
  // Advanced
  advanced: {
    enableDevTools: false,
    enableExperimentalFeatures: false,
    logLevel: 'info',
  },
  
  // Tag colors
  tagColors: {},
  
  // Keybindings (defaults)
  keybindings: {
    'newNote': 'Cmd+N',
    'saveNote': 'Cmd+S',
    'deleteNote': 'Cmd+Delete',
    'search': 'Cmd+F',
    'togglePreview': 'Cmd+P',
    'toggleSidebar': 'Cmd+\\',
    'focusMode': 'Cmd+Shift+F',
  },
  
  // Version
  version: '1.5.0',
}