export { SettingsService } from './SettingsService'
export { SettingsRegistry } from './registry'
export { SettingsValidator } from './validator'
export { SettingsStorage } from './storage'
export { initializeSettings } from './initialize'
export * from './types'

// Re-export convenience instance getter
export const getSettingsService = () => SettingsService.getInstance()