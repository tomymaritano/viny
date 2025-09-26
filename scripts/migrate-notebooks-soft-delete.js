#!/usr/bin/env node

/**
 * Migration script to add soft delete fields to existing notebooks
 * This script updates the database schema and adds isTrashed and trashedAt fields
 */

import Dexie from 'dexie'

const DB_NAME = 'VinyDatabase'

class VinyDatabase extends Dexie {
  constructor() {
    super(DB_NAME)

    // Latest schema version
    this.version(3).stores({
      notes:
        '++id, title, [status+updatedAt], [notebookId+updatedAt], *tags, isTrashed, createdAt, updatedAt, embeddingVersion',
      notebooks:
        '++id, name, parentId, isTrashed, createdAt, updatedAt, trashedAt',
      metadata: '++key',
      embeddings: '++id, noteId, position, model, createdAt',
    })
  }
}

async function migrateNotebooks() {
  console.log('🔄 Starting notebooks soft delete migration...')

  const db = new VinyDatabase()

  try {
    await db.open()
    console.log('✅ Database opened successfully')

    // Get all notebooks
    const notebooks = await db.notebooks.toArray()
    console.log(`📚 Found ${notebooks.length} notebooks to migrate`)

    let migrated = 0
    let skipped = 0

    // Update each notebook
    for (const notebook of notebooks) {
      // Skip if already has isTrashed field
      if (typeof notebook.isTrashed === 'boolean') {
        skipped++
        continue
      }

      // Add soft delete fields
      await db.notebooks.update(notebook.id, {
        isTrashed: false,
        trashedAt: null,
      })

      migrated++
      console.log(`  ✓ Migrated notebook: ${notebook.name}`)
    }

    console.log('\n📊 Migration Summary:')
    console.log(`  - Total notebooks: ${notebooks.length}`)
    console.log(`  - Migrated: ${migrated}`)
    console.log(`  - Skipped (already migrated): ${skipped}`)

    // Verify migration
    const verifyNotebooks = await db.notebooks
      .where('isTrashed')
      .equals(false)
      .count()

    console.log(
      `\n✅ Verification: ${verifyNotebooks} notebooks are not trashed`
    )

    await db.close()
    console.log('✅ Migration completed successfully!')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

// Run migration
migrateNotebooks()
  .then(() => {
    console.log('\n🎉 All done! Your notebooks now support soft delete.')
    process.exit(0)
  })
  .catch(error => {
    console.error('❌ Unexpected error:', error)
    process.exit(1)
  })
