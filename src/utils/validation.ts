/**
 * Validation utilities for forms and user input
 */

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings?: string[]
}

export interface FieldValidation {
  field: string
  value: any
  isValid: boolean
  error?: string
  warning?: string
}

// Generic validation rules
export const ValidationRules = {
  required: (value: any, fieldName: string): FieldValidation => ({
    field: fieldName,
    value,
    isValid: value !== null && value !== undefined && value !== '',
    error: value === null || value === undefined || value === '' ? `${fieldName} is required` : undefined
  }),

  minLength: (value: string, min: number, fieldName: string): FieldValidation => ({
    field: fieldName,
    value,
    isValid: !value || value.length >= min,
    error: value && value.length < min ? `${fieldName} must be at least ${min} characters` : undefined
  }),

  maxLength: (value: string, max: number, fieldName: string): FieldValidation => ({
    field: fieldName,
    value,
    isValid: !value || value.length <= max,
    error: value && value.length > max ? `${fieldName} must be no more than ${max} characters` : undefined
  }),

  email: (value: string, fieldName: string): FieldValidation => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return {
      field: fieldName,
      value,
      isValid: !value || emailRegex.test(value),
      error: value && !emailRegex.test(value) ? `${fieldName} must be a valid email address` : undefined
    }
  },

  url: (value: string, fieldName: string): FieldValidation => {
    try {
      if (!value) return { field: fieldName, value, isValid: true }
      new URL(value)
      return { field: fieldName, value, isValid: true }
    } catch {
      return {
        field: fieldName,
        value,
        isValid: false,
        error: `${fieldName} must be a valid URL`
      }
    }
  },

  number: (value: any, fieldName: string): FieldValidation => ({
    field: fieldName,
    value,
    isValid: value === '' || value === null || value === undefined || !isNaN(Number(value)),
    error: value !== '' && value !== null && value !== undefined && isNaN(Number(value)) 
      ? `${fieldName} must be a valid number` : undefined
  }),

  range: (value: number, min: number, max: number, fieldName: string): FieldValidation => {
    const numValue = Number(value)
    return {
      field: fieldName,
      value,
      isValid: !isNaN(numValue) && numValue >= min && numValue <= max,
      error: isNaN(numValue) || numValue < min || numValue > max 
        ? `${fieldName} must be between ${min} and ${max}` : undefined
    }
  },

  positive: (value: number, fieldName: string): FieldValidation => ({
    field: fieldName,
    value,
    isValid: Number(value) > 0,
    error: Number(value) <= 0 ? `${fieldName} must be a positive number` : undefined
  }),

  fileSize: (size: number, maxSizeMB: number, fieldName: string): FieldValidation => {
    const maxBytes = maxSizeMB * 1024 * 1024
    return {
      field: fieldName,
      value: size,
      isValid: size <= maxBytes,
      error: size > maxBytes ? `${fieldName} must be smaller than ${maxSizeMB}MB` : undefined
    }
  },

  pattern: (value: string, pattern: RegExp, fieldName: string, message?: string): FieldValidation => ({
    field: fieldName,
    value,
    isValid: !value || pattern.test(value),
    error: value && !pattern.test(value) ? (message || `${fieldName} format is invalid`) : undefined
  })
}

// Settings-specific validations
export const SettingsValidation = {
  general: {
    language: (value: string): FieldValidation => {
      const supportedLanguages = ['en', 'en-gb', 'es', 'es-mx', 'fr', 'de', 'it', 'pt-br', 'zh-cn', 'ja', 'ko']
      return {
        field: 'language',
        value,
        isValid: !value || supportedLanguages.includes(value),
        error: value && !supportedLanguages.includes(value) ? 'Unsupported language selected' : undefined
      }
    },

    defaultNotebook: (value: string, availableNotebooks: string[]): FieldValidation => ({
      field: 'defaultNotebook',
      value,
      isValid: !value || availableNotebooks.includes(value),
      error: value && !availableNotebooks.includes(value) ? 'Selected notebook does not exist' : undefined
    })
  },

  themes: {
    uiTheme: (value: string): FieldValidation => {
      const validThemes = ['light', 'dark', 'solarized', 'system']
      return {
        field: 'uiTheme',
        value,
        isValid: !value || validThemes.includes(value),
        error: value && !validThemes.includes(value) ? 'Invalid theme selected' : undefined
      }
    },

    customCSS: (value: string): FieldValidation => {
      // Basic CSS validation - check for obvious syntax errors
      if (!value) return { field: 'customCSS', value, isValid: true }
      
      // Check for balanced braces
      const openBraces = (value.match(/\{/g) || []).length
      const closeBraces = (value.match(/\}/g) || []).length
      
      return {
        field: 'customCSS',
        value,
        isValid: openBraces === closeBraces,
        error: openBraces !== closeBraces ? 'CSS syntax error: unmatched braces' : undefined,
        warning: value.length > 10000 ? 'Large CSS files may impact performance' : undefined
      }
    }
  },

  editing: {
    fontSize: (value: number): FieldValidation => 
      ValidationRules.range(value, 8, 32, 'Font size'),

    lineHeight: (value: number): FieldValidation => 
      ValidationRules.range(value, 1.0, 3.0, 'Line height'),

    tabSize: (value: number): FieldValidation => 
      ValidationRules.range(value, 1, 8, 'Tab size'),

    fontFamily: (value: string): FieldValidation => {
      if (!value) return { field: 'fontFamily', value, isValid: true }
      
      // Basic font family validation
      const hasValidChars = /^[a-zA-Z0-9\s\-'",.]+$/.test(value)
      
      return {
        field: 'fontFamily',
        value,
        isValid: hasValidChars,
        error: !hasValidChars ? 'Font family contains invalid characters' : undefined
      }
    }
  },

  sync: {
    syncUrl: (value: string): FieldValidation => ValidationRules.url(value, 'Sync URL'),
    
    syncApiKey: (value: string): FieldValidation => ({
      field: 'syncApiKey',
      value,
      isValid: !value || (value.length >= 16 && value.length <= 128),
      error: value && (value.length < 16 || value.length > 128) 
        ? 'API key must be between 16 and 128 characters' : undefined
    })
  },

  backup: {
    backupLocation: (value: string): FieldValidation => {
      if (!value) return { field: 'backupLocation', value, isValid: true }
      
      // Check if it looks like a valid path
      const isValidPath = /^[^<>:"|?*]+$/.test(value)
      
      return {
        field: 'backupLocation',
        value,
        isValid: isValidPath,
        error: !isValidPath ? 'Invalid backup location path' : undefined
      }
    },

    backupRetentionDays: (value: number): FieldValidation => 
      ValidationRules.range(value, 1, 365, 'Backup retention days')
  }
}

// Form validation helper
export function validateForm(values: Record<string, any>, validations: Record<string, (value: any, ...args: any[]) => FieldValidation>): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  
  Object.entries(validations).forEach(([field, validator]) => {
    const value = values[field]
    const result = validator(value)
    
    if (!result.isValid && result.error) {
      errors.push(result.error)
    }
    
    if (result.warning) {
      warnings.push(result.warning)
    }
  })
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined
  }
}

// Real-time validation hook
export function validateField(value: any, validators: ((value: any) => FieldValidation)[]): FieldValidation {
  for (const validator of validators) {
    const result = validator(value)
    if (!result.isValid) {
      return result
    }
  }
  
  return { field: 'unknown', value, isValid: true }
}