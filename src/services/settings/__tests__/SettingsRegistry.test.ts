import { describe, it, expect, beforeEach } from 'vitest'
import { SettingsRegistry } from '../registry'
import type { SettingsSchema, SettingsCategory } from '../types'

describe('SettingsRegistry', () => {
  let registry: SettingsRegistry

  beforeEach(() => {
    registry = new SettingsRegistry()
  })

  const createMockSchema = (key: string, overrides?: Partial<SettingsSchema>): SettingsSchema => ({
    key,
    type: 'string',
    defaultValue: 'default',
    label: `${key} Label`,
    description: `${key} Description`,
    category: 'test',
    ...overrides
  })

  const createMockCategory = (id: string, schemas: SettingsSchema[]): SettingsCategory => ({
    id,
    label: `${id} Category`,
    description: `${id} Description`,
    schemas
  })

  describe('Schema Registration', () => {
    it('should register a single schema', () => {
      const schema = createMockSchema('testKey')
      
      registry.registerSchema(schema)
      
      expect(registry.getSchema('testKey')).toEqual(schema)
    })

    it('should register multiple schemas', () => {
      const schemas = [
        createMockSchema('key1'),
        createMockSchema('key2'),
        createMockSchema('key3')
      ]
      
      registry.registerSchemas(schemas)
      
      expect(registry.getSchema('key1')).toBeDefined()
      expect(registry.getSchema('key2')).toBeDefined()
      expect(registry.getSchema('key3')).toBeDefined()
    })

    it('should overwrite existing schema with same key', () => {
      const schema1 = createMockSchema('testKey', { defaultValue: 'first' })
      const schema2 = createMockSchema('testKey', { defaultValue: 'second' })
      
      registry.registerSchema(schema1)
      registry.registerSchema(schema2)
      
      expect(registry.getSchema('testKey')?.defaultValue).toBe('second')
    })

    it('should handle empty schema array', () => {
      expect(() => registry.registerSchemas([])).not.toThrow()
    })
  })

  describe('Category Registration', () => {
    it('should register a category', () => {
      const schemas = [
        createMockSchema('key1'),
        createMockSchema('key2')
      ]
      const category = createMockCategory('general', schemas)
      
      registry.registerCategory(category)
      
      expect(registry.getCategory('general')).toEqual(category)
      // Schemas should also be registered individually
      expect(registry.getSchema('key1')).toBeDefined()
      expect(registry.getSchema('key2')).toBeDefined()
    })

    it('should overwrite existing category', () => {
      const category1 = createMockCategory('general', [
        createMockSchema('key1')
      ])
      const category2 = createMockCategory('general', [
        createMockSchema('key2')
      ])
      
      registry.registerCategory(category1)
      registry.registerCategory(category2)
      
      const result = registry.getCategory('general')
      expect(result?.schemas).toHaveLength(1)
      expect(result?.schemas[0].key).toBe('key2')
    })

    it('should update schema category references', () => {
      const schemas = [
        createMockSchema('key1', { category: 'old' }),
        createMockSchema('key2', { category: 'old' })
      ]
      const category = createMockCategory('new', schemas)
      
      registry.registerCategory(category)
      
      expect(registry.getSchema('key1')?.category).toBe('new')
      expect(registry.getSchema('key2')?.category).toBe('new')
    })
  })

  describe('Schema Retrieval', () => {
    beforeEach(() => {
      registry.registerSchemas([
        createMockSchema('key1', { category: 'general' }),
        createMockSchema('key2', { category: 'general' }),
        createMockSchema('key3', { category: 'themes' }),
        createMockSchema('key4', { category: 'themes' })
      ])
    })

    it('should get schema by key', () => {
      const schema = registry.getSchema('key1')
      expect(schema).toBeDefined()
      expect(schema?.key).toBe('key1')
    })

    it('should return undefined for non-existent schema', () => {
      expect(registry.getSchema('nonExistent')).toBeUndefined()
    })

    it('should get all schemas', () => {
      const all = registry.getAllSchemas()
      expect(all).toHaveLength(4)
      expect(all.map(s => s.key)).toContain('key1')
      expect(all.map(s => s.key)).toContain('key4')
    })

    it('should get schemas by category', () => {
      const generalSchemas = registry.getSchemasByCategory('general')
      expect(generalSchemas).toHaveLength(2)
      expect(generalSchemas.every(s => s.category === 'general')).toBe(true)
      
      const themeSchemas = registry.getSchemasByCategory('themes')
      expect(themeSchemas).toHaveLength(2)
      expect(themeSchemas.every(s => s.category === 'themes')).toBe(true)
    })

    it('should return empty array for non-existent category', () => {
      const schemas = registry.getSchemasByCategory('nonExistent')
      expect(schemas).toEqual([])
    })
  })

  describe('Category Retrieval', () => {
    beforeEach(() => {
      const generalSchemas = [
        createMockSchema('key1'),
        createMockSchema('key2')
      ]
      const themeSchemas = [
        createMockSchema('key3'),
        createMockSchema('key4')
      ]
      
      registry.registerCategory(createMockCategory('general', generalSchemas))
      registry.registerCategory(createMockCategory('themes', themeSchemas))
    })

    it('should get category by id', () => {
      const category = registry.getCategory('general')
      expect(category).toBeDefined()
      expect(category?.id).toBe('general')
      expect(category?.schemas).toHaveLength(2)
    })

    it('should return undefined for non-existent category', () => {
      expect(registry.getCategory('nonExistent')).toBeUndefined()
    })

    it('should get all categories', () => {
      const categories = registry.getCategories()
      expect(categories).toHaveLength(2)
      expect(categories.map(c => c.id)).toContain('general')
      expect(categories.map(c => c.id)).toContain('themes')
    })

    it('should return categories in registration order', () => {
      const categories = registry.getCategories()
      expect(categories[0].id).toBe('general')
      expect(categories[1].id).toBe('themes')
    })
  })

  describe('Schema Properties', () => {
    it('should handle all schema types', () => {
      const schemas: SettingsSchema[] = [
        createMockSchema('string', { type: 'string', defaultValue: 'text' }),
        createMockSchema('number', { type: 'number', defaultValue: 42 }),
        createMockSchema('boolean', { type: 'boolean', defaultValue: true }),
        createMockSchema('select', { 
          type: 'select', 
          defaultValue: 'option1',
          options: [
            { value: 'option1', label: 'Option 1' },
            { value: 'option2', label: 'Option 2' }
          ]
        }),
        createMockSchema('array', { type: 'array', defaultValue: ['item1', 'item2'] }),
        createMockSchema('object', { type: 'object', defaultValue: { key: 'value' } })
      ]
      
      registry.registerSchemas(schemas)
      
      schemas.forEach(schema => {
        const retrieved = registry.getSchema(schema.key)
        expect(retrieved).toEqual(schema)
      })
    })

    it('should handle optional schema properties', () => {
      const schema = createMockSchema('test', {
        min: 0,
        max: 100,
        step: 5,
        placeholder: 'Enter value',
        experimental: true,
        requiresRestart: true,
        dependencies: { otherKey: true },
        validation: { min: 0, max: 100 }
      })
      
      registry.registerSchema(schema)
      const retrieved = registry.getSchema('test')
      
      expect(retrieved?.min).toBe(0)
      expect(retrieved?.max).toBe(100)
      expect(retrieved?.step).toBe(5)
      expect(retrieved?.placeholder).toBe('Enter value')
      expect(retrieved?.experimental).toBe(true)
      expect(retrieved?.requiresRestart).toBe(true)
      expect(retrieved?.dependencies).toEqual({ otherKey: true })
      expect(retrieved?.validation).toEqual({ min: 0, max: 100 })
    })
  })

  describe('Schema Validation', () => {
    it('should check if schema exists', () => {
      registry.registerSchema(createMockSchema('exists'))
      
      expect(registry.hasSchema('exists')).toBe(true)
      expect(registry.hasSchema('notExists')).toBe(false)
    })

    it('should check if category exists', () => {
      registry.registerCategory(createMockCategory('exists', []))
      
      expect(registry.hasCategory('exists')).toBe(true)
      expect(registry.hasCategory('notExists')).toBe(false)
    })
  })

  describe('Bulk Operations', () => {
    it('should get schemas for multiple categories', () => {
      registry.registerCategory(createMockCategory('cat1', [
        createMockSchema('key1'),
        createMockSchema('key2')
      ]))
      registry.registerCategory(createMockCategory('cat2', [
        createMockSchema('key3'),
        createMockSchema('key4')
      ]))
      registry.registerCategory(createMockCategory('cat3', [
        createMockSchema('key5')
      ]))
      
      const schemas = registry.getSchemasForCategories(['cat1', 'cat3'])
      
      expect(schemas).toHaveLength(3)
      expect(schemas.map(s => s.key)).toContain('key1')
      expect(schemas.map(s => s.key)).toContain('key2')
      expect(schemas.map(s => s.key)).toContain('key5')
      expect(schemas.map(s => s.key)).not.toContain('key3')
      expect(schemas.map(s => s.key)).not.toContain('key4')
    })

    it('should handle non-existent categories in bulk operations', () => {
      registry.registerCategory(createMockCategory('exists', [
        createMockSchema('key1')
      ]))
      
      const schemas = registry.getSchemasForCategories(['exists', 'notExists'])
      
      expect(schemas).toHaveLength(1)
      expect(schemas[0].key).toBe('key1')
    })
  })

  describe('Edge Cases', () => {
    it('should handle schema with undefined properties', () => {
      const schema: SettingsSchema = {
        key: 'minimal',
        type: 'string',
        defaultValue: '',
        label: 'Minimal',
        category: 'test'
        // No description or other optional properties
      }
      
      registry.registerSchema(schema)
      expect(registry.getSchema('minimal')).toEqual(schema)
    })

    it('should handle category with empty schemas array', () => {
      const category = createMockCategory('empty', [])
      
      registry.registerCategory(category)
      
      expect(registry.getCategory('empty')).toEqual(category)
      expect(registry.getSchemasByCategory('empty')).toEqual([])
    })

    it('should maintain schema references across operations', () => {
      const schema = createMockSchema('shared')
      
      registry.registerSchema(schema)
      const retrieved1 = registry.getSchema('shared')
      
      // Register a category that includes the same schema
      registry.registerCategory(createMockCategory('cat', [schema]))
      const retrieved2 = registry.getSchema('shared')
      
      // Should be the same reference
      expect(retrieved1).toBe(retrieved2)
    })
  })

  describe('Type Safety', () => {
    it('should preserve schema types', () => {
      const numberSchema = createMockSchema('num', {
        type: 'number',
        defaultValue: 42,
        min: 0,
        max: 100
      })
      
      registry.registerSchema(numberSchema)
      const retrieved = registry.getSchema('num')
      
      expect(retrieved?.type).toBe('number')
      expect(typeof retrieved?.defaultValue).toBe('number')
      expect(typeof retrieved?.min).toBe('number')
      expect(typeof retrieved?.max).toBe('number')
    })

    it('should handle select options correctly', () => {
      const selectSchema = createMockSchema('select', {
        type: 'select',
        defaultValue: 'opt1',
        options: [
          { value: 'opt1', label: 'Option 1', icon: 'Icon1' },
          { value: 'opt2', label: 'Option 2', description: 'Desc' }
        ]
      })
      
      registry.registerSchema(selectSchema)
      const retrieved = registry.getSchema('select')
      
      expect(retrieved?.options).toHaveLength(2)
      expect(retrieved?.options?.[0]).toHaveProperty('icon', 'Icon1')
      expect(retrieved?.options?.[1]).toHaveProperty('description', 'Desc')
    })
  })
})