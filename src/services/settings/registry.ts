import type { SettingsSchema, SettingsCategory } from './types'

export class SettingsRegistry {
  private schemas: Map<string, SettingsSchema> = new Map()
  private categories: Map<string, SettingsCategory> = new Map()

  /**
   * Register a single schema
   */
  registerSchema(schema: SettingsSchema): void {
    this.schemas.set(schema.key, schema)
  }

  /**
   * Register multiple schemas
   */
  registerSchemas(schemas: SettingsSchema[]): void {
    schemas.forEach(schema => this.registerSchema(schema))
  }

  /**
   * Register a category with its schemas
   */
  registerCategory(category: SettingsCategory): void {
    // Update schema categories to match the category
    const updatedSchemas = category.schemas.map(schema => ({
      ...schema,
      category: category.id
    }))
    
    // Register all schemas individually
    this.registerSchemas(updatedSchemas)
    
    // Store the category with updated schemas
    this.categories.set(category.id, {
      ...category,
      schemas: updatedSchemas
    })
  }

  /**
   * Get a schema by key
   */
  getSchema(key: string): SettingsSchema | undefined {
    return this.schemas.get(key)
  }

  /**
   * Get all schemas
   */
  getAllSchemas(): SettingsSchema[] {
    return Array.from(this.schemas.values())
  }

  /**
   * Get schemas by category
   */
  getSchemasByCategory(categoryId: string): SettingsSchema[] {
    return Array.from(this.schemas.values()).filter(
      schema => schema.category === categoryId
    )
  }

  /**
   * Get a category by id
   */
  getCategory(id: string): SettingsCategory | undefined {
    return this.categories.get(id)
  }

  /**
   * Get all categories
   */
  getCategories(): SettingsCategory[] {
    return Array.from(this.categories.values())
  }

  /**
   * Get schemas for multiple categories
   */
  getSchemasForCategories(categoryIds: string[]): SettingsSchema[] {
    return categoryIds.flatMap(id => this.getSchemasByCategory(id))
  }

  /**
   * Check if a schema exists
   */
  hasSchema(key: string): boolean {
    return this.schemas.has(key)
  }

  /**
   * Check if a category exists
   */
  hasCategory(id: string): boolean {
    return this.categories.has(id)
  }
}