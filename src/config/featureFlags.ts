/**
 * Feature Flags for Gradual Migration to TanStack Query
 * 
 * These flags allow us to gradually migrate components from the old
 * forceRefresh pattern to TanStack Query without breaking the app
 */

// Check if feature flag is enabled via localStorage or environment variable
const getFeatureFlag = (flagName: string, defaultValue = false): boolean => {
  // Check localStorage first (for runtime toggling)
  if (typeof window !== 'undefined' && window.localStorage) {
    const storedValue = localStorage.getItem(`feature_${flagName}`)
    if (storedValue !== null) {
      return storedValue === 'true'
    }
  }
  
  // Check environment variable
  const envVar = import.meta.env[`VITE_FEATURE_${flagName.toUpperCase()}`]
  if (envVar !== undefined) {
    return envVar === 'true' || envVar === true
  }
  
  return defaultValue
}

// Feature flags for TanStack Query migration
export const featureFlags = {
  // Enable TanStack Query for notes list - DEFAULT ON
  useQueryForNotesList: getFeatureFlag('useQueryForNotesList', true),
  
  // Enable TanStack Query for notebooks - DEFAULT ON
  useQueryForNotebooks: getFeatureFlag('useQueryForNotebooks', true),
  
  // Enable TanStack Query for settings - DEFAULT ON
  useQueryForSettings: getFeatureFlag('useQueryForSettings', true),
  
  // Enable TanStack Query for search - DEFAULT OFF to use semantic search
  useQueryForSearch: getFeatureFlag('useQueryForSearch', false),
  
  // Enable optimistic updates for mutations
  useOptimisticUpdates: getFeatureFlag('useOptimisticUpdates', true),
  
  // Enable React Query DevTools
  showReactQueryDevTools: getFeatureFlag('showReactQueryDevTools', import.meta.env.DEV),
  
  // Enable offline persistence
  enableOfflinePersistence: getFeatureFlag('enableOfflinePersistence', true),
  
  // Enable clean architecture with pure CRUD repositories
  useCleanArchitecture: getFeatureFlag('useCleanArchitecture', true),
  
  // Enable service layer pattern
  useServiceLayer: getFeatureFlag('useServiceLayer', true),
}

// Helper to toggle feature flags at runtime (for testing)
export const toggleFeatureFlag = (flagName: keyof typeof featureFlags, value: boolean) => {
  localStorage.setItem(`feature_${flagName}`, value.toString())
  // Reload to apply changes
  window.location.reload()
}

// Export to window for easy testing in development
if (import.meta.env.DEV && typeof window !== 'undefined') {
  (window as any).featureFlags = featureFlags;
  (window as any).toggleFeatureFlag = toggleFeatureFlag;
}