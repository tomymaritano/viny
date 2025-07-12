/**
 * Centralized theme constants to replace hard-coded colors
 * All color references should use these constants instead of direct hex values
 */

// CSS Custom Properties (CSS Variables) - used with CSS
export const CSS_THEME_VARS = {
  // Base colors
  BASE_03: 'var(--color-base03)',
  BASE_02: 'var(--color-base02)',
  BASE_01: 'var(--color-base01)',
  BASE_00: 'var(--color-base00)',
  BASE_0: 'var(--color-base0)',
  BASE_1: 'var(--color-base1)',
  BASE_2: 'var(--color-base2)',
  BASE_3: 'var(--color-base3)',
  BASE_4: 'var(--color-base4)',
  BASE_5: 'var(--color-base5)',

  // Accent colors
  BLUE: 'var(--color-blue)',
  CYAN: 'var(--color-cyan)',
  GREEN: 'var(--color-green)',
  YELLOW: 'var(--color-yellow)',
  ORANGE: 'var(--color-orange)',
  RED: 'var(--color-red)',
  MAGENTA: 'var(--color-magenta)',
  VIOLET: 'var(--color-violet)',

  // Sidebar
  SIDEBAR: 'var(--color-sidebar)',

  // Interaction colors
  HOVER_BG: 'var(--color-hover-bg)',
  ACTIVE_BG: 'var(--color-active-bg)',
  ACTIVE_TEXT: 'var(--color-active-text)',
  ACTIVE_BORDER: 'var(--color-active-border)',
} as const

// Tailwind CSS class names for theme colors
export const THEME_CLASSES = {
  // Background classes
  BG: {
    PRIMARY: 'bg-theme-bg-primary',
    SECONDARY: 'bg-theme-bg-secondary',
    TERTIARY: 'bg-theme-bg-tertiary',
    ACTIVE: 'bg-theme-bg-active',
    HOVER: 'bg-theme-bg-hover',
  },

  // Text classes
  TEXT: {
    PRIMARY: 'text-theme-text-primary',
    SECONDARY: 'text-theme-text-secondary',
    MUTED: 'text-theme-text-muted',
    ACCENT: 'text-theme-accent-primary',
  },

  // Border classes
  BORDER: {
    PRIMARY: 'border-theme-border-primary',
    SECONDARY: 'border-theme-border-secondary',
    ACCENT: 'border-theme-accent-primary',
  },

  // Accent color classes
  ACCENT: {
    PRIMARY: 'bg-theme-accent-primary',
    BLUE: 'bg-theme-accent-blue',
    GREEN: 'bg-theme-accent-green',
    YELLOW: 'bg-theme-accent-yellow',
    RED: 'bg-theme-accent-red',
    ORANGE: 'bg-theme-accent-orange',
  },
} as const

// Status color mappings
export const STATUS_COLORS = {
  DRAFT: THEME_CLASSES.TEXT.MUTED,
  IN_PROGRESS: 'text-theme-accent-blue',
  REVIEW: 'text-theme-accent-yellow',
  COMPLETED: 'text-theme-accent-green',
  ARCHIVED: 'text-theme-accent-red',
} as const

export const STATUS_BG_COLORS = {
  DRAFT: THEME_CLASSES.ACCENT.PRIMARY,
  IN_PROGRESS: THEME_CLASSES.ACCENT.BLUE,
  REVIEW: THEME_CLASSES.ACCENT.YELLOW,
  COMPLETED: THEME_CLASSES.ACCENT.GREEN,
  ARCHIVED: THEME_CLASSES.ACCENT.RED,
} as const

// Theme configuration
export const THEME_CONFIG = {
  DEFAULT: 'dark',
  AVAILABLE: ['dark', 'light', 'solarized', 'system'] as const,
} as const

// Color values for direct use (when CSS vars can't be used)
export const DIRECT_COLORS = {
  DARK: {
    BASE_03: '#1a1a1a',
    BASE_02: '#2a2a2a',
    BASE_01: '#3a3a3a',
    TEXT_PRIMARY: '#cccccc',
    TEXT_SECONDARY: '#888888',
    ACCENT_BLUE: '#4fc3f7',
    ACCENT_GREEN: '#66bb6a',
    ACCENT_YELLOW: '#ffca28',
    ACCENT_RED: '#ef5350',
    ACCENT_ORANGE: '#ff8a65',
  },
  LIGHT: {
    BASE_03: '#ffffff',
    BASE_02: '#f5f5f5',
    BASE_01: '#e0e0e0',
    TEXT_PRIMARY: '#333333',
    TEXT_SECONDARY: '#666666',
    ACCENT_BLUE: '#1976d2',
    ACCENT_GREEN: '#388e3c',
    ACCENT_YELLOW: '#f57c00',
    ACCENT_RED: '#d32f2f',
    ACCENT_ORANGE: '#e64a19',
  },
} as const

// Font configuration
export const FONT_CONFIG = {
  EDITOR: "'SF Mono', 'Monaco', 'Consolas', 'Fira Code', monospace",
  UI: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  MARKDOWN: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  KBD: "'SF Mono', 'Monaco', 'Consolas', 'Fira Code', monospace",
} as const

// KBD (keyboard) styling constants
export const KBD_STYLES = {
  DARK: {
    backgroundColor: '#292828',
    color: '#ffffff',
    borderColor: '#1a1a1a',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
  },
  LIGHT: {
    backgroundColor: '#f5f5f5',
    color: '#333333',
    borderColor: '#d0d0d0',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
  },
  COMMON: {
    padding: '0.1em 0.4em',
    borderRadius: '4px',
    borderWidth: '1px',
    borderStyle: 'solid',
    fontSize: '0.85em',
    fontWeight: '600',
    fontFamily: FONT_CONFIG.KBD,
  },
} as const

// Size configuration
export const SIZE_CONFIG = {
  FONT: {
    EDITOR: '15px',
    UI: '14px',
    MARKDOWN: '16px',
  },
  LINE_HEIGHT: '1.6',
} as const

export type ThemeType = typeof THEME_CONFIG.AVAILABLE[number]
export type StatusType = keyof typeof STATUS_COLORS