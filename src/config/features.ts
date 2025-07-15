/**
 * Feature flags for Viny application
 * Use these to enable/disable features for different environments
 */

export const FEATURES = {
  // Plugin system - disabled for production security
  PLUGINS_ENABLED: false, // TODO: Enable when secure plugin store is ready
  PLUGIN_STORE_ENABLED: false,

  // Future features
  COLLABORATIVE_EDITING: false,
  CLOUD_SYNC: false,
  ADVANCED_SEARCH: true,

  // Debug features (only in development)
  DEBUG_PANEL: process.env.NODE_ENV === 'development',
  CONSOLE_LOGGING: process.env.NODE_ENV === 'development',
}

// Helper function to check if a feature is enabled
export const isFeatureEnabled = featureName => {
  return FEATURES[featureName] === true
}

// Environment-specific overrides
if (process.env.NODE_ENV === 'development') {
  // You can enable features for development here if needed
  // FEATURES.PLUGINS_ENABLED = true; // Uncomment to test plugins in dev
}
