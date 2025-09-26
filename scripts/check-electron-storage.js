#!/usr/bin/env node

/**
 * Check Electron storage to see what's actually stored
 */

const fs = require('fs')
const path = require('path')
const os = require('os')

console.log('🔍 Checking Electron Storage\n')

// Get the notes data from Electron storage
const appDataPath = path.join(os.homedir(), '.nototo', 'data')
const notesPath = path.join(appDataPath, 'notes')
const notebooksPath = path.join(appDataPath, 'notebooks.json')

// Check if paths exist
if (!fs.existsSync(appDataPath)) {
  console.log('❌ App data directory not found:', appDataPath)
  console.log('Make sure you are running this in Electron mode')
  process.exit(1)
}

// Read notebooks
console.log('📚 NOTEBOOKS:')
if (fs.existsSync(notebooksPath)) {
  try {
    const notebooks = JSON.parse(fs.readFileSync(notebooksPath, 'utf8'))
    notebooks.forEach(nb => {
      console.log(`  - "${nb.name}" (id: ${nb.id})`)
    })
  } catch (err) {
    console.error('Error reading notebooks:', err.message)
  }
} else {
  console.log('  No notebooks.json found')
}

// Read notes
console.log('\n📝 NOTES:')
if (fs.existsSync(notesPath)) {
  const noteFiles = fs.readdirSync(notesPath).filter(f => f.endsWith('.json'))
  console.log(`Found ${noteFiles.length} note files\n`)

  // Show first 5 notes
  noteFiles.slice(0, 5).forEach(file => {
    try {
      const note = JSON.parse(
        fs.readFileSync(path.join(notesPath, file), 'utf8')
      )
      console.log(`📄 ${note.title}`)
      console.log(`   ID: ${note.id}`)
      console.log(`   Notebook: "${note.notebook}"`)
      console.log(`   Status: ${note.status}`)
      console.log(`   Tags: ${note.tags?.join(', ') || 'none'}`)
      console.log()
    } catch (err) {
      console.error(`Error reading ${file}:`, err.message)
    }
  })
} else {
  console.log('  No notes directory found')
}

// Check for specific issues
console.log('🔍 CHECKING FOR ISSUES:\n')

if (fs.existsSync(notesPath)) {
  const noteFiles = fs.readdirSync(notesPath).filter(f => f.endsWith('.json'))
  let issueCount = 0

  noteFiles.forEach(file => {
    try {
      const note = JSON.parse(
        fs.readFileSync(path.join(notesPath, file), 'utf8')
      )

      // Check for missing notebook field
      if (!note.notebook) {
        console.log(`⚠️  Note "${note.title}" has no notebook field`)
        issueCount++
      }

      // Check for notebook ID instead of name
      else if (note.notebook.includes('_')) {
        console.log(
          `⚠️  Note "${note.title}" has notebook ID: "${note.notebook}"`
        )
        issueCount++
      }
    } catch (err) {
      // Skip
    }
  })

  if (issueCount === 0) {
    console.log('✅ No issues found with note notebooks')
  } else {
    console.log(`\n❌ Found ${issueCount} issues`)
    console.log('Run: node scripts/fix-notebook-names.js')
  }
}
