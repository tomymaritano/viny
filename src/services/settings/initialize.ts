import { SettingsService } from './SettingsService'
import { generalSchema } from './schemas/general'
import { themesSchema } from './schemas/themes'
import { editorSchema } from './schemas/editor'
import { previewSchema } from './schemas/preview'
import { privacySchema } from './schemas/privacy'
import type { SettingsCategory } from './types'

/**
 * Initialize the settings system with schemas and categories
 */
export async function initializeSettings(): Promise<void> {
  const service = SettingsService.getInstance()
  const registry = service.getRegistry()

  // Define categories with their schemas
  const categories: SettingsCategory[] = [
    {
      id: 'general',
      label: 'General',
      description: 'Basic application settings',
      schemas: generalSchema
    },
    {
      id: 'themes',
      label: 'Themes',
      description: 'Appearance and theme settings',
      schemas: themesSchema
    },
    {
      id: 'editor',
      label: 'Editor',
      description: 'Editor behavior and preferences',
      schemas: editorSchema
    },
    {
      id: 'preview',
      label: 'Preview',
      description: 'Preview pane and rendering settings',
      schemas: previewSchema
    },
    {
      id: 'privacy',
      label: 'Privacy',
      description: 'Privacy and security settings',
      schemas: privacySchema
    }
  ]

  // Register all categories
  categories.forEach(category => {
    registry.registerCategory(category)
  })

  // Initialize the service
  await service.init()
}