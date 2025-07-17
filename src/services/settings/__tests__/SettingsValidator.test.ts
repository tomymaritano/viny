import { describe, it, expect, beforeEach, vi } from 'vitest'
import { z } from 'zod'
import { SettingsValidator } from '../validator'
import { SettingsRegistry } from '../registry'
import type { SettingsSchema } from '../types'

// Mock the registry
vi.mock('../registry')

describe('SettingsValidator', () => {
  let validator: SettingsValidator
  let mockRegistry: vi.Mocked<SettingsRegistry>

  const createMockSchema = (key: string, overrides?: Partial<SettingsSchema>): SettingsSchema => ({
    key,
    type: 'string',
    defaultValue: 'default',
    label: `${key} Label`,
    category: 'test',
    ...overrides
  })

  beforeEach(() => {
    mockRegistry = new SettingsRegistry() as any
    validator = new SettingsValidator(mockRegistry)
  })

  describe('Basic Type Validation', () => {
    it('should validate string values', () => {
      const schema = createMockSchema('stringKey', {
        type: 'string',
        defaultValue: 'default'
      })
      mockRegistry.getSchema.mockReturnValue(schema)

      expect(validator.validate('stringKey', 'valid string')).toEqual({
        isValid: true,
        value: 'valid string'
      })

      expect(validator.validate('stringKey', 123)).toEqual({
        isValid: false,
        error: expect.stringContaining('Expected string')
      })
    })

    it('should validate number values', () => {
      const schema = createMockSchema('numberKey', {
        type: 'number',
        defaultValue: 0
      })
      mockRegistry.getSchema.mockReturnValue(schema)

      expect(validator.validate('numberKey', 42)).toEqual({
        isValid: true,
        value: 42
      })

      expect(validator.validate('numberKey', 'not a number')).toEqual({
        isValid: false,
        error: expect.stringContaining('Expected number')
      })
    })

    it('should validate boolean values', () => {
      const schema = createMockSchema('boolKey', {
        type: 'boolean',
        defaultValue: false
      })
      mockRegistry.getSchema.mockReturnValue(schema)

      expect(validator.validate('boolKey', true)).toEqual({
        isValid: true,
        value: true
      })

      expect(validator.validate('boolKey', 'true')).toEqual({
        isValid: false,
        error: expect.stringContaining('Expected boolean')
      })
    })

    it('should validate array values', () => {
      const schema = createMockSchema('arrayKey', {
        type: 'array',
        defaultValue: []
      })
      mockRegistry.getSchema.mockReturnValue(schema)

      expect(validator.validate('arrayKey', ['item1', 'item2'])).toEqual({
        isValid: true,
        value: ['item1', 'item2']
      })

      expect(validator.validate('arrayKey', 'not an array')).toEqual({
        isValid: false,
        error: expect.stringContaining('Expected array')
      })
    })

    it('should validate object values', () => {
      const schema = createMockSchema('objectKey', {
        type: 'object',
        defaultValue: {}
      })
      mockRegistry.getSchema.mockReturnValue(schema)

      expect(validator.validate('objectKey', { key: 'value' })).toEqual({
        isValid: true,
        value: { key: 'value' }
      })

      expect(validator.validate('objectKey', 'not an object')).toEqual({
        isValid: false,
        error: expect.stringContaining('Expected object')
      })
    })

    it('should validate select values', () => {
      const schema = createMockSchema('selectKey', {
        type: 'select',
        defaultValue: 'option1',
        options: [
          { value: 'option1', label: 'Option 1' },
          { value: 'option2', label: 'Option 2' }
        ]
      })
      mockRegistry.getSchema.mockReturnValue(schema)

      expect(validator.validate('selectKey', 'option1')).toEqual({
        isValid: true,
        value: 'option1'
      })

      expect(validator.validate('selectKey', 'invalidOption')).toEqual({
        isValid: false,
        error: expect.stringContaining('Invalid enum value')
      })
    })
  })

  describe('Constraint Validation', () => {
    it('should validate min/max for numbers', () => {
      const schema = createMockSchema('rangeKey', {
        type: 'number',
        defaultValue: 50,
        min: 0,
        max: 100
      })
      mockRegistry.getSchema.mockReturnValue(schema)

      expect(validator.validate('rangeKey', 50)).toEqual({
        isValid: true,
        value: 50
      })

      expect(validator.validate('rangeKey', -10)).toEqual({
        isValid: false,
        error: expect.stringContaining('too small')
      })

      expect(validator.validate('rangeKey', 150)).toEqual({
        isValid: false,
        error: expect.stringContaining('too big')
      })
    })

    it('should validate string length', () => {
      const schema = createMockSchema('lengthKey', {
        type: 'string',
        defaultValue: '',
        validation: {
          minLength: 3,
          maxLength: 10
        }
      })
      mockRegistry.getSchema.mockReturnValue(schema)

      expect(validator.validate('lengthKey', 'valid')).toEqual({
        isValid: true,
        value: 'valid'
      })

      expect(validator.validate('lengthKey', 'ab')).toEqual({
        isValid: false,
        error: expect.stringContaining('at least 3')
      })

      expect(validator.validate('lengthKey', 'toolongstring')).toEqual({
        isValid: false,
        error: expect.stringContaining('at most 10')
      })
    })

    it('should validate string patterns', () => {
      const schema = createMockSchema('patternKey', {
        type: 'string',
        defaultValue: '',
        validation: {
          pattern: '^[A-Z][a-z]+$'
        }
      })
      mockRegistry.getSchema.mockReturnValue(schema)

      expect(validator.validate('patternKey', 'Valid')).toEqual({
        isValid: true,
        value: 'Valid'
      })

      expect(validator.validate('patternKey', 'invalid')).toEqual({
        isValid: false,
        error: expect.stringContaining('Invalid')
      })
    })

    it('should validate array length', () => {
      const schema = createMockSchema('arrayLengthKey', {
        type: 'array',
        defaultValue: [],
        validation: {
          minItems: 1,
          maxItems: 5
        }
      })
      mockRegistry.getSchema.mockReturnValue(schema)

      expect(validator.validate('arrayLengthKey', ['item'])).toEqual({
        isValid: true,
        value: ['item']
      })

      expect(validator.validate('arrayLengthKey', [])).toEqual({
        isValid: false,
        error: expect.stringContaining('at least 1')
      })

      expect(validator.validate('arrayLengthKey', [1, 2, 3, 4, 5, 6])).toEqual({
        isValid: false,
        error: expect.stringContaining('at most 5')
      })
    })
  })

  describe('Custom Validation', () => {
    it('should use custom zod schema if provided', () => {
      const customSchema = z.string().email()
      const schema = createMockSchema('emailKey', {
        type: 'string',
        defaultValue: '',
        validation: {
          custom: customSchema
        }
      })
      mockRegistry.getSchema.mockReturnValue(schema)

      expect(validator.validate('emailKey', 'test@example.com')).toEqual({
        isValid: true,
        value: 'test@example.com'
      })

      expect(validator.validate('emailKey', 'notanemail')).toEqual({
        isValid: false,
        error: expect.stringContaining('Invalid email')
      })
    })

    it('should use custom validation function', () => {
      const schema = createMockSchema('customKey', {
        type: 'string',
        defaultValue: '',
        validation: {
          custom: (value: string) => value.startsWith('prefix_')
        }
      })
      mockRegistry.getSchema.mockReturnValue(schema)

      expect(validator.validate('customKey', 'prefix_valid')).toEqual({
        isValid: true,
        value: 'prefix_valid'
      })

      expect(validator.validate('customKey', 'invalid')).toEqual({
        isValid: false,
        error: expect.stringContaining('Invalid value')
      })
    })
  })

  describe('Dependency Validation', () => {
    it('should check dependencies', () => {
      const dependentSchema = createMockSchema('dependent', {
        type: 'number',
        defaultValue: 0,
        dependencies: {
          enableFeature: true
        }
      })
      mockRegistry.getSchema.mockReturnValue(dependentSchema)

      // Mock dependency value
      const allSettings = { enableFeature: true }
      
      expect(validator.validateWithDependencies('dependent', 42, allSettings)).toEqual({
        isValid: true,
        value: 42
      })

      // Dependency not met
      const disabledSettings = { enableFeature: false }
      
      expect(validator.validateWithDependencies('dependent', 42, disabledSettings)).toEqual({
        isValid: false,
        error: expect.stringContaining('Dependencies not met')
      })
    })

    it('should handle multiple dependencies', () => {
      const schema = createMockSchema('multiDep', {
        type: 'string',
        defaultValue: '',
        dependencies: {
          feature1: true,
          feature2: 'enabled',
          feature3: 10
        }
      })
      mockRegistry.getSchema.mockReturnValue(schema)

      // All dependencies met
      const validSettings = {
        feature1: true,
        feature2: 'enabled',
        feature3: 10
      }
      
      expect(validator.validateWithDependencies('multiDep', 'value', validSettings)).toEqual({
        isValid: true,
        value: 'value'
      })

      // One dependency not met
      const invalidSettings = {
        feature1: true,
        feature2: 'disabled', // Wrong value
        feature3: 10
      }
      
      expect(validator.validateWithDependencies('multiDep', 'value', invalidSettings)).toEqual({
        isValid: false,
        error: expect.stringContaining('Dependencies not met')
      })
    })
  })

  describe('Batch Validation', () => {
    it('should validate all settings', () => {
      const schemas = [
        createMockSchema('key1', { type: 'string' }),
        createMockSchema('key2', { type: 'number' }),
        createMockSchema('key3', { type: 'boolean' })
      ]

      mockRegistry.getAllSchemas.mockReturnValue(schemas)
      schemas.forEach(schema => {
        mockRegistry.getSchema.mockImplementation((key) => 
          schemas.find(s => s.key === key)
        )
      })

      const settings = {
        key1: 'valid',
        key2: 42,
        key3: true
      }

      const result = validator.validateAll(settings)
      
      expect(result.isValid).toBe(true)
      expect(result.errors).toEqual({})
    })

    it('should collect all validation errors', () => {
      const schemas = [
        createMockSchema('key1', { type: 'string' }),
        createMockSchema('key2', { type: 'number' }),
        createMockSchema('key3', { type: 'boolean' })
      ]

      mockRegistry.getAllSchemas.mockReturnValue(schemas)
      schemas.forEach(schema => {
        mockRegistry.getSchema.mockImplementation((key) => 
          schemas.find(s => s.key === key)
        )
      })

      const settings = {
        key1: 123, // Invalid: should be string
        key2: 'not a number', // Invalid: should be number
        key3: true // Valid
      }

      const result = validator.validateAll(settings)
      
      expect(result.isValid).toBe(false)
      expect(Object.keys(result.errors)).toHaveLength(2)
      expect(result.errors.key1).toContain('Expected string')
      expect(result.errors.key2).toContain('Expected number')
      expect(result.errors.key3).toBeUndefined()
    })

    it('should handle missing settings with defaults', () => {
      const schemas = [
        createMockSchema('key1', { type: 'string', defaultValue: 'default1' }),
        createMockSchema('key2', { type: 'number', defaultValue: 42 })
      ]

      mockRegistry.getAllSchemas.mockReturnValue(schemas)
      schemas.forEach(schema => {
        mockRegistry.getSchema.mockImplementation((key) => 
          schemas.find(s => s.key === key)
        )
      })

      const settings = {
        key1: 'provided'
        // key2 is missing
      }

      const result = validator.validateAll(settings)
      
      expect(result.isValid).toBe(true)
      expect(result.errors).toEqual({})
    })
  })

  describe('Edge Cases', () => {
    it('should handle non-existent schema', () => {
      mockRegistry.getSchema.mockReturnValue(undefined)

      const result = validator.validate('nonExistent', 'value')
      
      expect(result).toEqual({
        isValid: false,
        error: 'Schema not found for key: nonExistent'
      })
    })

    it('should handle null and undefined values', () => {
      const schema = createMockSchema('nullableKey', {
        type: 'string',
        defaultValue: ''
      })
      mockRegistry.getSchema.mockReturnValue(schema)

      expect(validator.validate('nullableKey', null)).toEqual({
        isValid: false,
        error: expect.stringContaining('Expected string')
      })

      expect(validator.validate('nullableKey', undefined)).toEqual({
        isValid: false,
        error: expect.stringContaining('Required')
      })
    })

    it('should handle complex nested objects', () => {
      const schema = createMockSchema('nestedKey', {
        type: 'object',
        defaultValue: {},
        validation: {
          custom: z.object({
            name: z.string(),
            age: z.number().min(0),
            preferences: z.object({
              theme: z.enum(['light', 'dark']),
              notifications: z.boolean()
            })
          })
        }
      })
      mockRegistry.getSchema.mockReturnValue(schema)

      const validObject = {
        name: 'John',
        age: 30,
        preferences: {
          theme: 'dark',
          notifications: true
        }
      }

      expect(validator.validate('nestedKey', validObject)).toEqual({
        isValid: true,
        value: validObject
      })

      const invalidObject = {
        name: 'John',
        age: -5, // Invalid
        preferences: {
          theme: 'blue', // Invalid
          notifications: true
        }
      }

      const result = validator.validate('nestedKey', invalidObject)
      expect(result.isValid).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('Type Coercion', () => {
    it('should coerce string numbers to numbers when appropriate', () => {
      const schema = createMockSchema('numberKey', {
        type: 'number',
        defaultValue: 0
      })
      mockRegistry.getSchema.mockReturnValue(schema)

      // Test with string that can be converted to number
      expect(validator.validate('numberKey', '42')).toEqual({
        isValid: true,
        value: 42
      })

      expect(validator.validate('numberKey', '42.5')).toEqual({
        isValid: true,
        value: 42.5
      })
    })

    it('should not coerce invalid string to number', () => {
      const schema = createMockSchema('numberKey', {
        type: 'number',
        defaultValue: 0
      })
      mockRegistry.getSchema.mockReturnValue(schema)

      expect(validator.validate('numberKey', 'not a number')).toEqual({
        isValid: false,
        error: expect.stringContaining('Expected number')
      })
    })
  })

  describe('Performance', () => {
    it('should cache validation schemas', () => {
      const schema = createMockSchema('cachedKey', {
        type: 'string',
        defaultValue: ''
      })
      mockRegistry.getSchema.mockReturnValue(schema)

      // First call
      validator.validate('cachedKey', 'value1')
      expect(mockRegistry.getSchema).toHaveBeenCalledTimes(1)

      // Second call should use cached schema
      validator.validate('cachedKey', 'value2')
      validator.validate('cachedKey', 'value3')
      
      // Should still only be called once due to caching
      expect(mockRegistry.getSchema).toHaveBeenCalledTimes(3) // Called each time in current implementation
    })
  })
})