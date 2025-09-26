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
    error:
      value === null || value === undefined || value === ''
        ? `${fieldName} is required`
        : undefined,
  }),

  minLength: (
    value: string,
    min: number,
    fieldName: string
  ): FieldValidation => ({
    field: fieldName,
    value,
    isValid: !value || value.length >= min,
    error:
      value && value.length < min
        ? `${fieldName} must be at least ${min} characters`
        : undefined,
  }),

  maxLength: (
    value: string,
    max: number,
    fieldName: string
  ): FieldValidation => ({
    field: fieldName,
    value,
    isValid: !value || value.length <= max,
    error:
      value && value.length > max
        ? `${fieldName} must be no more than ${max} characters`
        : undefined,
  }),

  email: (value: string, fieldName: string): FieldValidation => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return {
      field: fieldName,
      value,
      isValid: !value || emailRegex.test(value),
      error:
        value && !emailRegex.test(value)
          ? `${fieldName} must be a valid email address`
          : undefined,
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
        error: `${fieldName} must be a valid URL`,
      }
    }
  },

  number: (value: any, fieldName: string): FieldValidation => ({
    field: fieldName,
    value,
    isValid:
      value === '' ||
      value === null ||
      value === undefined ||
      !isNaN(Number(value)),
    error:
      value !== '' &&
      value !== null &&
      value !== undefined &&
      isNaN(Number(value))
        ? `${fieldName} must be a valid number`
        : undefined,
  }),

  range: (
    value: number,
    min: number,
    max: number,
    fieldName: string
  ): FieldValidation => {
    const numValue = Number(value)
    return {
      field: fieldName,
      value,
      isValid: !isNaN(numValue) && numValue >= min && numValue <= max,
      error:
        isNaN(numValue) || numValue < min || numValue > max
          ? `${fieldName} must be between ${min} and ${max}`
          : undefined,
    }
  },

  positive: (value: number, fieldName: string): FieldValidation => ({
    field: fieldName,
    value,
    isValid: Number(value) > 0,
    error:
      Number(value) <= 0 ? `${fieldName} must be a positive number` : undefined,
  }),

  fileSize: (
    size: number,
    maxSizeMB: number,
    fieldName: string
  ): FieldValidation => {
    const maxBytes = maxSizeMB * 1024 * 1024
    return {
      field: fieldName,
      value: size,
      isValid: size <= maxBytes,
      error:
        size > maxBytes
          ? `${fieldName} must be smaller than ${maxSizeMB}MB`
          : undefined,
    }
  },

  pattern: (
    value: string,
    pattern: RegExp,
    fieldName: string,
    message?: string
  ): FieldValidation => ({
    field: fieldName,
    value,
    isValid: !value || pattern.test(value),
    error:
      value && !pattern.test(value)
        ? message || `${fieldName} format is invalid`
        : undefined,
  }),
}

// Settings-specific validations
export const SettingsValidation = {
  general: {
    language: (value: string): FieldValidation => {
      const supportedLanguages = [
        'en',
        'en-gb',
        'es',
        'es-mx',
        'fr',
        'de',
        'it',
        'pt-br',
        'zh-cn',
        'ja',
        'ko',
      ]
      return {
        field: 'language',
        value,
        isValid: !value || supportedLanguages.includes(value),
        error:
          value && !supportedLanguages.includes(value)
            ? 'Unsupported language selected'
            : undefined,
      }
    },

    defaultNotebook: (
      value: string,
      availableNotebooks: string[]
    ): FieldValidation => ({
      field: 'defaultNotebook',
      value,
      isValid: !value || availableNotebooks.includes(value),
      error:
        value && !availableNotebooks.includes(value)
          ? 'Selected notebook does not exist'
          : undefined,
    }),
  },

  themes: {
    theme: (value: string): FieldValidation => {
      const validThemes = ['light', 'dark', 'solarized', 'hacklab', 'system']
      return {
        field: 'theme',
        value,
        isValid: !value || validThemes.includes(value),
        error:
          value && !validThemes.includes(value)
            ? 'Invalid theme selected'
            : undefined,
      }
    },

    syntaxTheme: (value: string): FieldValidation => {
      const validSyntaxThemes = [
        'default-dark',
        'default-light',
        'github',
        'monokai',
        'solarized',
      ]
      return {
        field: 'syntaxTheme',
        value,
        isValid: !value || validSyntaxThemes.includes(value),
        error:
          value && !validSyntaxThemes.includes(value)
            ? 'Invalid syntax theme selected'
            : undefined,
      }
    },

    previewTheme: (value: string): FieldValidation => {
      const validPreviewThemes = ['github', 'gitlab', 'minimal', 'academic']
      return {
        field: 'previewTheme',
        value,
        isValid: !value || validPreviewThemes.includes(value),
        error:
          value && !validPreviewThemes.includes(value)
            ? 'Invalid preview theme selected'
            : undefined,
      }
    },

    customCSS: (value: string): FieldValidation => {
      // Basic CSS validation - check for obvious syntax errors
      if (!value) return { field: 'customCSS', value, isValid: true }

      // Check for balanced braces
      const openBraces = (value.match(/\{/g) || []).length
      const closeBraces = (value.match(/\}/g) || []).length

      // Check for dangerous CSS patterns
      const hasDangerousContent =
        /(@import|javascript:|data:text\/html|expression\()/i.test(value)

      return {
        field: 'customCSS',
        value,
        isValid: openBraces === closeBraces && !hasDangerousContent,
        error:
          openBraces !== closeBraces
            ? 'CSS syntax error: unmatched braces'
            : hasDangerousContent
              ? 'CSS contains potentially dangerous content'
              : undefined,
        warning:
          value.length > 10000
            ? 'Large CSS files may impact performance'
            : value.includes('!important')
              ? 'Excessive use of !important may cause styling conflicts'
              : undefined,
      }
    },
  },

  editing: {
    fontSize: (value: number): FieldValidation => {
      const result = ValidationRules.range(value, 8, 32, 'Font size')
      if (result.isValid && value < 10) {
        result.warning = 'Very small font size may be hard to read'
      }
      if (result.isValid && value > 24) {
        result.warning = 'Large font size may reduce visible content'
      }
      return result
    },

    lineHeight: (value: number): FieldValidation => {
      const result = ValidationRules.range(value, 1.0, 3.0, 'Line height')
      if (result.isValid && value < 1.2) {
        result.warning = 'Very tight line height may reduce readability'
      }
      return result
    },

    tabSize: (value: number): FieldValidation => {
      const result = ValidationRules.range(value, 1, 8, 'Tab size')
      if (result.isValid && value > 4) {
        result.warning = 'Large tab size may cause horizontal scrolling'
      }
      return result
    },

    indentUnit: (value: number): FieldValidation =>
      ValidationRules.range(value, 1, 8, 'Indent unit'),

    fontFamily: (value: string): FieldValidation => {
      if (!value) return { field: 'fontFamily', value, isValid: true }

      // Basic font family validation
      const hasValidChars = /^[a-zA-Z0-9\s\-'",.]+$/.test(value)

      return {
        field: 'fontFamily',
        value,
        isValid: hasValidChars,
        error: !hasValidChars
          ? 'Font family contains invalid characters'
          : undefined,
      }
    },

    autoSaveDelay: (value: number): FieldValidation => {
      const result = ValidationRules.range(value, 100, 10000, 'Auto-save delay')
      if (result.isValid && value < 500) {
        result.warning = 'Very fast auto-save may impact performance'
      }
      return result
    },

    wordWrapColumn: (value: number): FieldValidation =>
      ValidationRules.range(value, 40, 200, 'Word wrap column'),

    cursorScrollMargin: (value: number): FieldValidation =>
      ValidationRules.range(value, 0, 300, 'Cursor scroll margin'),
  },

  sync: {
    syncUrl: (value: string): FieldValidation =>
      ValidationRules.url(value, 'Sync URL'),

    syncApiKey: (value: string): FieldValidation => ({
      field: 'syncApiKey',
      value,
      isValid: !value || (value.length >= 16 && value.length <= 128),
      error:
        value && (value.length < 16 || value.length > 128)
          ? 'API key must be between 16 and 128 characters'
          : undefined,
    }),
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
        error: !isValidPath ? 'Invalid backup location path' : undefined,
      }
    },

    backupRetentionDays: (value: number): FieldValidation =>
      ValidationRules.range(value, 1, 365, 'Backup retention days'),
  },

  privacy: {
    dataRetentionDays: (value: number): FieldValidation => {
      if (value === 0) {
        return {
          field: 'dataRetentionDays',
          value,
          isValid: true,
          warning: 'Data will never be automatically deleted',
        }
      }

      return ValidationRules.range(value, 1, 3650, 'Data retention period')
    },

    inactivityTimeoutMinutes: (value: number): FieldValidation => {
      const result = ValidationRules.range(value, 1, 1440, 'Inactivity timeout')

      if (result.isValid && value < 5) {
        result.warning = 'Very short timeout may be inconvenient'
      }

      return result
    },

    exportDataSize: (value: string): FieldValidation => {
      try {
        const sizeInBytes = new TextEncoder().encode(value).length
        const sizeInMB = sizeInBytes / (1024 * 1024)

        return {
          field: 'exportDataSize',
          value,
          isValid: sizeInMB < 100,
          error:
            sizeInMB >= 100 ? 'Export data is too large (>100MB)' : undefined,
          warning:
            sizeInMB > 10 ? 'Large export may take time to process' : undefined,
        }
      } catch {
        return { field: 'exportDataSize', value, isValid: true }
      }
    },
  },

  preview: {
    previewFontSize: (value: number): FieldValidation => {
      const result = ValidationRules.range(value, 8, 32, 'Preview font size')
      if (result.isValid && value < 10) {
        result.warning = 'Very small preview font may be hard to read'
      }
      return result
    },

    previewPosition: (value: string): FieldValidation => {
      const validPositions = ['right', 'bottom', 'hidden']
      return {
        field: 'previewPosition',
        value,
        isValid: !value || validPositions.includes(value),
        error:
          value && !validPositions.includes(value)
            ? 'Invalid preview position'
            : undefined,
      }
    },
  },

  keybindings: {
    keymapPreset: (value: string): FieldValidation => {
      const validPresets = ['default', 'vim', 'vscode', 'sublime']
      return {
        field: 'keymapPreset',
        value,
        isValid: !value || validPresets.includes(value),
        error:
          value && !validPresets.includes(value)
            ? 'Invalid keymap preset'
            : undefined,
      }
    },

    customKeybinding: (value: string, commandName: string): FieldValidation => {
      if (!value) return { field: 'customKeybinding', value, isValid: true }

      // Basic keyboard shortcut validation
      const hasValidFormat = /^(Ctrl|Cmd|Alt|Shift|\+|[A-Za-z0-9])+$/i.test(
        value.replace(/\s/g, '')
      )

      return {
        field: 'customKeybinding',
        value,
        isValid: hasValidFormat,
        error: !hasValidFormat
          ? `Invalid keyboard shortcut format for ${commandName}`
          : undefined,
      }
    },
  },
}

// Field validation helper
export function validateField(
  value: any,
  validators: ((value: any) => FieldValidation)[]
): FieldValidation {
  for (const validator of validators) {
    const result = validator(value)
    if (!result.isValid) {
      return result
    }
  }

  return { field: 'field', value, isValid: true }
}

// Form validation helper
export function validateForm(
  values: Record<string, any>,
  validations: Record<string, (value: any, ...args: any[]) => FieldValidation>
): ValidationResult {
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
    warnings: warnings.length > 0 ? warnings : undefined,
  }
}
