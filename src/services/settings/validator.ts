import { z } from 'zod'
import type { SettingsRegistry } from './registry'
import type { 
  SettingValue, 
  ValidationResult, 
  BatchValidationResult,
  SettingDependencies 
} from './types'

export class SettingsValidator {
  constructor(private registry: SettingsRegistry) {}

  /**
   * Validate a single setting value
   */
  validate(key: string, value: SettingValue): ValidationResult {
    const schema = this.registry.getSchema(key)
    
    if (!schema) {
      return {
        isValid: false,
        error: `Schema not found for key: ${key}`
      }
    }

    try {
      // Create Zod schema based on setting type and constraints
      const zodSchema = this.createZodSchema(schema)
      
      // Parse and validate the value
      const parsedValue = zodSchema.parse(value)
      
      return {
        isValid: true,
        value: parsedValue
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          isValid: false,
          error: error.errors[0]?.message || 'Validation failed'
        }
      }
      
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Unknown validation error'
      }
    }
  }

  /**
   * Validate a setting with its dependencies
   */
  validateWithDependencies(
    key: string, 
    value: SettingValue, 
    allSettings: Record<string, SettingValue>
  ): ValidationResult {
    const schema = this.registry.getSchema(key)
    
    if (!schema) {
      return {
        isValid: false,
        error: `Schema not found for key: ${key}`
      }
    }

    // Check dependencies first
    if (schema.dependencies) {
      const dependenciesMet = this.checkDependencies(schema.dependencies, allSettings)
      if (!dependenciesMet) {
        return {
          isValid: false,
          error: 'Dependencies not met for this setting'
        }
      }
    }

    // If dependencies are met, validate the value normally
    return this.validate(key, value)
  }

  /**
   * Validate all settings in a batch
   */
  validateAll(settings: Record<string, SettingValue>): BatchValidationResult {
    const errors: Record<string, string> = {}
    const schemas = this.registry.getAllSchemas()

    for (const schema of schemas) {
      const value = settings[schema.key] ?? schema.defaultValue
      const result = this.validate(schema.key, value)
      
      if (!result.isValid && result.error) {
        errors[schema.key] = result.error
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  }

  /**
   * Validate export data structure
   */
  validateExport(data: any): ValidationResult {
    try {
      const exportSchema = z.object({
        version: z.string(),
        timestamp: z.string(),
        settings: z.record(z.any())
      })
      
      exportSchema.parse(data)
      
      return {
        isValid: true
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          isValid: false,
          error: error.errors[0]?.message || 'Invalid export format'
        }
      }
      
      return {
        isValid: false,
        error: 'Export validation failed'
      }
    }
  }

  /**
   * Validate backup data structure
   */
  validateBackup(data: any): ValidationResult {
    try {
      const backupSchema = z.object({
        id: z.string(),
        timestamp: z.number(),
        version: z.string(),
        settings: z.record(z.any()),
        metadata: z.object({
          userAgent: z.string().optional(),
          platform: z.string().optional(),
          appVersion: z.string().optional(),
          description: z.string().optional()
        }).optional()
      })
      
      backupSchema.parse(data)
      
      return {
        isValid: true
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          isValid: false,
          error: error.errors[0]?.message || 'Invalid backup format'
        }
      }
      
      return {
        isValid: false,
        error: 'Backup validation failed'
      }
    }
  }

  /**
   * Check if dependencies are satisfied
   */
  private checkDependencies(
    dependencies: SettingDependencies, 
    settings: Record<string, SettingValue>
  ): boolean {
    return Object.entries(dependencies).every(([depKey, expectedValue]) => {
      const actualValue = settings[depKey]
      return actualValue === expectedValue
    })
  }

  /**
   * Create a Zod schema based on the setting configuration
   */
  private createZodSchema(schema: any): z.ZodSchema {
    // If custom validation is provided, use it
    if (schema.validation?.custom) {
      if (typeof schema.validation.custom === 'function') {
        return z.any().refine(schema.validation.custom, { message: 'Invalid value' })
      } else {
        return schema.validation.custom as z.ZodSchema
      }
    }

    // Create schema based on type
    let zodSchema: z.ZodSchema

    switch (schema.type) {
      case 'string':
        zodSchema = z.string()
        if (schema.validation?.minLength) {
          zodSchema = (zodSchema as z.ZodString).min(schema.validation.minLength)
        }
        if (schema.validation?.maxLength) {
          zodSchema = (zodSchema as z.ZodString).max(schema.validation.maxLength)
        }
        if (schema.validation?.pattern) {
          zodSchema = (zodSchema as z.ZodString).regex(new RegExp(schema.validation.pattern))
        }
        break

      case 'number':
        zodSchema = z.union([z.number(), z.string().transform(val => {
          const num = parseFloat(val)
          if (isNaN(num)) throw new Error('Invalid number')
          return num
        })])
        if (schema.min !== undefined) {
          zodSchema = (zodSchema as any).refine((val: number) => val >= schema.min, {
            message: `Value must be at least ${schema.min}`
          })
        }
        if (schema.max !== undefined) {
          zodSchema = (zodSchema as any).refine((val: number) => val <= schema.max, {
            message: `Value must be at most ${schema.max}`
          })
        }
        break

      case 'boolean':
        zodSchema = z.boolean()
        break

      case 'array':
        zodSchema = z.array(z.any())
        if (schema.validation?.minItems) {
          zodSchema = (zodSchema as z.ZodArray<any>).min(schema.validation.minItems)
        }
        if (schema.validation?.maxItems) {
          zodSchema = (zodSchema as z.ZodArray<any>).max(schema.validation.maxItems)
        }
        break

      case 'object':
        zodSchema = z.object({}).passthrough()
        break

      case 'select':
        if (schema.options && schema.options.length > 0) {
          const values = schema.options.map((opt: any) => opt.value)
          zodSchema = z.enum(values as [string, ...string[]])
        } else {
          zodSchema = z.string()
        }
        break

      default:
        zodSchema = z.any()
    }

    return zodSchema
  }
}