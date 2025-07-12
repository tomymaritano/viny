// Migration utilities for rebranding from Inkrun to Nototo
// This handles migrating localStorage data to new keys

const MIGRATION_KEY = 'nototo_migration_completed'

export const runMigration = () => {
  // Check if migration already completed
  if (localStorage.getItem(MIGRATION_KEY)) {
    return { completed: true, migrated: false }
  }

  const migratedData = {
    settings: false,
    notes: false,
    errors: [],
  }

  try {
    // Migrate settings
    const oldSettings = localStorage.getItem('inkrun-settings')
    if (oldSettings && !localStorage.getItem('nototo-settings')) {
      localStorage.setItem('nototo-settings', oldSettings)
      migratedData.settings = true
    }

    // Migrate notes
    const oldNotes = localStorage.getItem('inkrun_notes')
    if (oldNotes && !localStorage.getItem('nototo_notes')) {
      localStorage.setItem('nototo_notes', oldNotes)
      migratedData.notes = true
    }

    // Mark migration as completed
    localStorage.setItem(MIGRATION_KEY, 'true')

    return {
      completed: true,
      migrated: migratedData.settings || migratedData.notes,
      details: migratedData,
    }
  } catch (error) {
    console.error('Migration failed:', error)
    return {
      completed: false,
      migrated: false,
      error: error.message,
    }
  }
}

export const cleanupOldData = () => {
  // Optional cleanup function to remove old keys after successful migration
  // This should only be called after user confirmation or after some time
  try {
    localStorage.removeItem('inkrun-settings')
    localStorage.removeItem('inkrun_notes')
    return true
  } catch (error) {
    console.error('Cleanup failed:', error)
    return false
  }
}
