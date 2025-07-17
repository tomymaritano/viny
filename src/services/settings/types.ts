import { z } from 'zod'

// Basic setting value types
export type SettingValue = string | number | boolean | object | null | undefined | any[]

// Setting type definitions
export type SettingType = 'string' | 'number' | 'boolean' | 'select' | 'array' | 'object'

// Option for select type settings
export interface SettingOption {
  value: string
  label: string
  description?: string
  icon?: string
}

// Validation configuration
export interface SettingValidation {
  min?: number
  max?: number
  minLength?: number
  maxLength?: number
  pattern?: string
  minItems?: number
  maxItems?: number
  custom?: z.ZodSchema<any> | ((value: any) => boolean)
}

// Dependencies configuration - simplified
export type SettingDependencies = Record<string, SettingValue>

export interface SettingsSchema {
  key: string
  type: SettingType
  defaultValue: SettingValue
  label: string
  description?: string
  category: string
  options?: SettingOption[]
  dynamicOptions?: boolean
  min?: number
  max?: number
  step?: number
  placeholder?: string
  experimental?: boolean
  requiresRestart?: boolean
  dependencies?: SettingDependencies
  validation?: SettingValidation
  applyToDOM?: boolean
}

// Category grouping multiple settings
export interface SettingsCategory {
  id: string
  label: string
  description?: string
  icon?: string
  schemas: SettingsSchema[]
}

// Validation result
export interface ValidationResult {
  isValid: boolean
  value?: SettingValue
  error?: string
}

// Batch validation result
export interface BatchValidationResult {
  isValid: boolean
  errors: Record<string, string>
}

// Export/Import data format
export interface SettingsExportData {
  version: string
  timestamp: string
  settings: Record<string, SettingValue>
}

// Import result
export interface SettingsImportResult {
  success: boolean
  imported: number
  errors: Record<string, string>
}

// Event types
export interface SettingChangeEvent {
  key: string
  value: SettingValue
  previousValue?: SettingValue
}

export interface SettingBatchChangeEvent {
  changes: SettingChangeEvent[]
}

export interface SettingPreviewEvent {
  key: string
  value: SettingValue
}

export interface SettingResetEvent {
  key: string
  defaultValue: SettingValue
}

export interface SettingImportEvent {
  settings: Record<string, SettingValue>
  timestamp: string
}

export interface SettingErrorEvent {
  error: Error
  context: string
  key?: string
}

// Hook options
export interface UseSettingsServiceOptions {
  category?: string
  validateOnChange?: boolean
  autoSave?: boolean
  debounceMs?: number
}

// Backup info
export interface BackupInfo {
  id: string
  timestamp: number
}