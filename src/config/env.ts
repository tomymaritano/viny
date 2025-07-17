// Environment Configuration
// All environment variables accessed through this module

// Vite environment variables type definition
interface ImportMetaEnv {
  readonly VITE_APP_NAME: string
  readonly VITE_APP_VERSION: string
  readonly VITE_APP_DESCRIPTION: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_API_TIMEOUT: string
  readonly VITE_ENABLE_ANALYTICS: string
  readonly VITE_ENABLE_TELEMETRY: string
  readonly VITE_ENABLE_PLUGINS: string
  readonly VITE_ENABLE_SYNC: string
  readonly VITE_DEFAULT_THEME: string
  readonly VITE_CUSTOM_THEMES: string
  readonly VITE_ENABLE_CUSTOM_CSS: string
  readonly VITE_SENTRY_DSN: string
  readonly VITE_SENTRY_ENVIRONMENT: string
  readonly VITE_MIXPANEL_TOKEN: string
  readonly VITE_GOOGLE_ANALYTICS_ID: string
  readonly VITE_ENABLE_DEV_TOOLS: string
  readonly VITE_DEBUG_MODE: string
  readonly MODE: string
  readonly DEV: boolean
  readonly PROD: boolean
  readonly SSR: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

export const env = {
  // App Configuration
  APP_NAME: import.meta.env.VITE_APP_NAME || 'Viny',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.4.1',
  APP_DESCRIPTION: import.meta.env.VITE_APP_DESCRIPTION || 'Professional markdown editor',

  // API Configuration
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || '',
  API_TIMEOUT: Number(import.meta.env.VITE_API_TIMEOUT) || 5000,

  // Feature Flags
  ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  ENABLE_TELEMETRY: import.meta.env.VITE_ENABLE_TELEMETRY === 'true',
  ENABLE_PLUGINS: import.meta.env.VITE_ENABLE_PLUGINS !== 'false', // Default true
  ENABLE_SYNC: import.meta.env.VITE_ENABLE_SYNC !== 'false', // Default true

  // Theme Configuration
  DEFAULT_THEME: import.meta.env.VITE_DEFAULT_THEME || 'dark',
  AVAILABLE_THEMES: (import.meta.env.VITE_AVAILABLE_THEMES || 'dark,light,solarized').split(','),

  // Editor Configuration
  DEFAULT_EDITOR: import.meta.env.VITE_DEFAULT_EDITOR || 'markdown-it',
  ENABLE_VIM_MODE: import.meta.env.VITE_ENABLE_VIM_MODE !== 'false', // Default true
  ENABLE_LIVE_PREVIEW: import.meta.env.VITE_ENABLE_LIVE_PREVIEW !== 'false', // Default true

  // Storage Configuration
  MAX_NOTES: Number(import.meta.env.VITE_MAX_NOTES) || 1000,
  MAX_FILE_SIZE: Number(import.meta.env.VITE_MAX_FILE_SIZE) || 10485760, // 10MB

  // Debug Configuration
  DEBUG_MODE: import.meta.env.VITE_DEBUG_MODE === 'true',
  ENABLE_LOGGING: import.meta.env.VITE_ENABLE_LOGGING === 'true',

  // Build Information
  DEV: import.meta.env.DEV,
  PROD: import.meta.env.PROD,
  MODE: import.meta.env.MODE,
} as const

// Type-safe environment access
export type Environment = typeof env

// Validation function to ensure required environment variables are set
export function validateEnvironment() {
  const errors: string[] = []

  // Add validation for required variables here
  // Example:
  // if (!env.API_BASE_URL && env.ENABLE_SYNC) {
  //   errors.push('VITE_API_BASE_URL is required when sync is enabled')
  // }

  if (errors.length > 0) {
    console.error('Environment validation failed:')
    errors.forEach(error => console.error(`- ${error}`))
    throw new Error('Invalid environment configuration')
  }

  if (env.DEBUG_MODE) {
    console.log('Environment configuration:', env)
  }
}

// Helper functions for common checks
export const isProduction = () => env.PROD
export const isDevelopment = () => env.DEV
export const isFeatureEnabled = (feature: keyof Pick<Environment, 'ENABLE_ANALYTICS' | 'ENABLE_TELEMETRY' | 'ENABLE_PLUGINS' | 'ENABLE_SYNC' | 'ENABLE_VIM_MODE' | 'ENABLE_LIVE_PREVIEW' | 'DEBUG_MODE' | 'ENABLE_LOGGING'>) => env[feature]

export default env