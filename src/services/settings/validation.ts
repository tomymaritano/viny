import { z } from 'zod'
import type { SettingsSchema, SettingValue } from './types'

// Base validation schemas
export const settingValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.array(z.any()),
  z.record(z.any()),
  z.null(),
  z.undefined()
])

export const settingOptionSchema = z.object({
  value: z.any(),
  label: z.string(),
  icon: z.string().optional(),
  description: z.string().optional()
})

export const settingDependencySchema = z.object({
  condition: z.function(),
  targetKey: z.string(),
  targetValue: z.any()
})

export const settingsSchemaSchema = z.object({
  key: z.string(),
  type: z.enum(['string', 'number', 'boolean', 'select', 'array', 'object']),
  defaultValue: settingValueSchema,
  label: z.string(),
  description: z.string().optional(),
  category: z.string(),
  options: z.array(settingOptionSchema).optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  step: z.number().optional(),
  placeholder: z.string().optional(),
  experimental: z.boolean().optional(),
  requiresRestart: z.boolean().optional(),
  dependencies: z.array(settingDependencySchema).optional(),
  applyToDOM: z.boolean().optional()
})

// Category-specific validation schemas
export const generalSettingsSchema = z.object({
  appName: z.string().min(1).max(50),
  defaultNotebook: z.string(),
  language: z.enum(['en', 'es', 'fr', 'de', 'it', 'pt-br', 'zh-cn', 'ja', 'ko']),
  autoUpdates: z.boolean(),
  developmentMode: z.boolean()
})

export const themesSettingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']),
  accentColor: z.enum(['blue', 'green', 'orange', 'violet', 'red', 'cyan']),
  interfaceFontSize: z.number().min(10).max(24),
  compactMode: z.boolean(),
  animationSpeed: z.enum(['slow', 'normal', 'fast', 'none']),
  syntaxTheme: z.enum(['default-dark', 'default-light', 'github', 'monokai', 'solarized', 'dracula']),
  previewTheme: z.enum(['github', 'minimal', 'academic', 'modern']),
  editorFontSize: z.number().min(12).max(20),
  lineHeight: z.number().min(1.2).max(2.0),
  fontFamily: z.enum(['default', 'sf-mono', 'fira-code', 'jetbrains-mono', 'consolas', 'monaco']),
  customCSSEnabled: z.boolean(),
  customCSS: z.string()
})

export const editorSettingsSchema = z.object({
  editorMode: z.enum(['markdown', 'rich-text', 'hybrid']),
  fontSize: z.number().min(10).max(24),
  fontFamily: z.enum(['system-ui', 'fira-code', 'jetbrains-mono', 'source-code-pro', 'menlo', 'consolas']),
  lineHeight: z.number().min(1.0).max(3.0),
  tabSize: z.number().min(1).max(8),
  autoSave: z.boolean(),
  autoSaveDelay: z.number().min(500).max(10000),
  showLineNumbers: z.boolean(),
  wordWrap: z.boolean(),
  spellCheck: z.boolean(),
  vimMode: z.boolean(),
  emmetEnabled: z.boolean(),
  autoComplete: z.boolean(),
  autoCloseBrackets: z.boolean(),
  highlightActiveLine: z.boolean(),
  showInvisibles: z.boolean(),
  indentType: z.enum(['spaces', 'tabs']),
  cursorStyle: z.enum(['line', 'block', 'underline']),
  scrollBeyondLastLine: z.boolean(),
  smoothScrolling: z.boolean(),
  minimap: z.boolean(),
  folding: z.boolean(),
  bracketMatching: z.boolean()
})

export const previewSettingsSchema = z.object({
  previewMode: z.enum(['live', 'manual', 'off']),
  previewDelay: z.number().min(100).max(2000),
  syncScrolling: z.boolean(),
  previewTheme: z.enum(['github', 'minimal', 'academic', 'modern', 'classic']),
  renderMath: z.boolean(),
  mathEngine: z.enum(['katex', 'mathjax']),
  renderMermaid: z.boolean(),
  codeHighlighting: z.boolean(),
  codeTheme: z.enum(['github', 'monokai', 'solarized-light', 'solarized-dark', 'dracula', 'atom-one-dark', 'atom-one-light']),
  showLineNumbers: z.boolean(),
  copyCodeButton: z.boolean(),
  printStyles: z.boolean(),
  allowHTML: z.boolean(),
  sanitizeHTML: z.boolean(),
  linkPreview: z.boolean(),
  imageZoom: z.boolean(),
  embedEnabled: z.boolean(),
  tableOfContents: z.boolean(),
  tocPosition: z.enum(['top', 'sidebar', 'floating']),
  exportQuality: z.enum(['low', 'medium', 'high'])
})

export const privacySettingsSchema = z.object({
  telemetryEnabled: z.boolean(),
  crashReporting: z.boolean(),
  analyticsLevel: z.enum(['none', 'basic', 'detailed']),
  autoUpdateCheck: z.boolean(),
  shareUsageStats: z.boolean(),
  localOnlyMode: z.boolean(),
  clearDataOnExit: z.boolean(),
  cookiePolicy: z.enum(['essential', 'functional', 'all']),
  dataRetentionDays: z.number().min(1).max(365),
  encryptLocalData: z.boolean(),
  encryptionPassword: z.string().min(8).optional(),
  requirePasswordOnStartup: z.boolean(),
  autoLockMinutes: z.number().min(1).max(480),
  networkTimeout: z.number().min(5).max(120),
  blockTrackers: z.boolean(),
  sandboxWebContent: z.boolean(),
  allowExternalImages: z.boolean(),
  useSecureDNS: z.boolean(),
  privateMode: z.boolean(),
  disableNetworkOnBattery: z.boolean()
})

// Combined schema for all settings
export const allSettingsSchema = z.object({
  ...generalSettingsSchema.shape,
  ...themesSettingsSchema.shape,
  ...editorSettingsSchema.shape,
  ...previewSettingsSchema.shape,
  ...privacySettingsSchema.shape
}).partial() // All fields are optional

// Export data validation
export const settingsExportSchema = z.object({
  version: z.string(),
  timestamp: z.string(),
  settings: z.record(settingValueSchema)
})

// Backup validation
export const settingsBackupSchema = z.object({
  id: z.string(),
  timestamp: z.number(),
  version: z.string(),
  settings: z.record(settingValueSchema),
  metadata: z.object({
    userAgent: z.string().optional(),
    platform: z.string().optional(),
    appVersion: z.string().optional(),
    description: z.string().optional()
  }).optional()
})

/**
 * Validate a setting value based on its schema
 */
export function validateSetting(schema: SettingsSchema, value: SettingValue): z.SafeParseReturnType<any, any> {
  let zodSchema: z.ZodSchema

  switch (schema.type) {
    case 'string':
      zodSchema = z.string()
      if (schema.min !== undefined) {
        zodSchema = (zodSchema as z.ZodString).min(schema.min)
      }
      if (schema.max !== undefined) {
        zodSchema = (zodSchema as z.ZodString).max(schema.max)
      }
      break

    case 'number':
      zodSchema = z.number()
      if (schema.min !== undefined) {
        zodSchema = (zodSchema as z.ZodNumber).min(schema.min)
      }
      if (schema.max !== undefined) {
        zodSchema = (zodSchema as z.ZodNumber).max(schema.max)
      }
      break

    case 'boolean':
      zodSchema = z.boolean()
      break

    case 'select':
      if (schema.options && schema.options.length > 0) {
        const values = schema.options.map(opt => opt.value)
        zodSchema = z.enum(values as [string, ...string[]])
      } else {
        zodSchema = z.any()
      }
      break

    case 'array':
      zodSchema = z.array(z.any())
      break

    case 'object':
      zodSchema = z.record(z.any())
      break

    default:
      zodSchema = settingValueSchema
  }

  return zodSchema.safeParse(value)
}

/**
 * Validate all settings
 */
export function validateAllSettings(settings: Record<string, SettingValue>): z.SafeParseReturnType<any, any> {
  return allSettingsSchema.safeParse(settings)
}

/**
 * Validate settings export data
 */
export function validateExportData(data: any): z.SafeParseReturnType<any, any> {
  return settingsExportSchema.safeParse(data)
}

/**
 * Validate settings backup data
 */
export function validateBackupData(data: any): z.SafeParseReturnType<any, any> {
  return settingsBackupSchema.safeParse(data)
}