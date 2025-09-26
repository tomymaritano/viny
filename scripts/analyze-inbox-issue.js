#!/usr/bin/env node

/**
 * Script to analyze why notes don't appear in Inbox
 */

const fs = require('fs')
const path = require('path')
const os = require('os')

console.log('🔍 Analyzing Inbox Issue\n')

// Function to read JSON file safely
function readJsonFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    return JSON.parse(content)
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err.message)
    return null
  }
}

// Get data paths
const dataPath = path.join(os.homedir(), '.nototo', 'data')
const notesPath = path.join(dataPath, 'notes')
const notebooksPath = path.join(dataPath, 'notebooks.json')

// Read notebooks
const notebooks = readJsonFile(notebooksPath) || []
console.log('📚 NOTEBOOKS:')
notebooks.forEach(nb => {
  console.log(`  - "${nb.name}" (id: ${nb.id})`)
})

// Find Inbox notebook
const inboxNotebook = notebooks.find(nb => nb.name.toLowerCase() === 'inbox')
if (inboxNotebook) {
  console.log(
    `\n✅ Inbox notebook found: "${inboxNotebook.name}" (id: ${inboxNotebook.id})`
  )
} else {
  console.log('\n❌ Inbox notebook NOT FOUND!')
  process.exit(1)
}

// Analyze notes
console.log('\n📝 ANALYZING NOTES:')

try {
  const noteFiles = fs.readdirSync(notesPath).filter(f => f.endsWith('.json'))
  console.log(`Total notes: ${noteFiles.length}`)

  const notesByNotebook = {}
  const inboxNotes = []
  const problematicNotes = []

  noteFiles.forEach(file => {
    const note = readJsonFile(path.join(notesPath, file))
    if (!note) return

    const notebookValue = note.notebook || 'NO_NOTEBOOK'
    notesByNotebook[notebookValue] = (notesByNotebook[notebookValue] || 0) + 1

    // Check if this note should be in Inbox
    const belongsToInbox =
      note.notebook === inboxNotebook.id ||
      note.notebook === inboxNotebook.name ||
      note.notebook?.toLowerCase() === 'inbox'

    if (belongsToInbox) {
      inboxNotes.push({
        id: note.id,
        title: note.title,
        notebook: note.notebook,
        createdAt: note.createdAt,
      })
    }

    // Check for problematic notes
    if (note.notebook && note.notebook.includes('_')) {
      problematicNotes.push({
        id: note.id,
        title: note.title,
        notebook: note.notebook,
      })
    }
  })

  console.log('\n📊 NOTES BY NOTEBOOK:')
  Object.entries(notesByNotebook)
    .sort((a, b) => b[1] - a[1])
    .forEach(([nb, count]) => {
      console.log(`  "${nb}": ${count} notes`)
    })

  console.log(`\n📁 INBOX NOTES: ${inboxNotes.length}`)
  if (inboxNotes.length > 0) {
    console.log('Sample Inbox notes:')
    inboxNotes.slice(0, 5).forEach(n => {
      console.log(`  - "${n.title}" (notebook: "${n.notebook}")`)
    })
  }

  if (problematicNotes.length > 0) {
    console.log(
      `\n⚠️  PROBLEMATIC NOTES (with IDs): ${problematicNotes.length}`
    )
    console.log('These notes need to be fixed:')
    problematicNotes.slice(0, 10).forEach(n => {
      console.log(`  - "${n.title}" (notebook: "${n.notebook}")`)
    })
  }

  console.log('\n🔧 SOLUTION:')
  if (problematicNotes.length > 0) {
    console.log('Run the fix script to update notebook IDs to names:')
    console.log('  node scripts/fix-notebook-names.js')
  } else if (inboxNotes.length === 0) {
    console.log(
      'No notes found in Inbox. Create a new note while Inbox is selected.'
    )
  } else {
    console.log(
      'Notes exist in Inbox. Check the browser console for filtering issues.'
    )
  }
} catch (error) {
  console.error('Error analyzing notes:', error.message)
}
