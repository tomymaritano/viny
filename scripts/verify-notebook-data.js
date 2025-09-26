#!/usr/bin/env node

/**
 * Verify notebook data structure and note associations
 */

const fs = require('fs')
const path = require('path')
const os = require('os')

console.log('🔍 Verifying Notebook Data Structure\n')

const dataPath = path.join(os.homedir(), '.nototo', 'data')
const notesPath = path.join(dataPath, 'notes')
const notebooksPath = path.join(dataPath, 'notebooks.json')

// Read notebooks
let notebooks = []
if (fs.existsSync(notebooksPath)) {
  notebooks = JSON.parse(fs.readFileSync(notebooksPath, 'utf8'))
  console.log('📚 NOTEBOOKS FOUND:')
  notebooks.forEach(nb => {
    console.log(`  - Name: "${nb.name}" | ID: "${nb.id}"`)
  })
} else {
  console.log('❌ No notebooks.json found!')
  process.exit(1)
}

// Read all notes
console.log('\n📝 ANALYZING NOTES:')
const noteFiles = fs.readdirSync(notesPath).filter(f => f.endsWith('.json'))
const notesByNotebook = {}
const problemNotes = []

noteFiles.forEach(file => {
  try {
    const note = JSON.parse(fs.readFileSync(path.join(notesPath, file), 'utf8'))
    const notebookValue = note.notebook || 'NO_NOTEBOOK'

    if (!notesByNotebook[notebookValue]) {
      notesByNotebook[notebookValue] = []
    }
    notesByNotebook[notebookValue].push({
      id: note.id,
      title: note.title,
      notebook: note.notebook,
    })

    // Check if notebook value matches any notebook name or ID
    const matchesName = notebooks.some(nb => nb.name === note.notebook)
    const matchesId = notebooks.some(nb => nb.id === note.notebook)

    if (note.notebook && !matchesName && !matchesId) {
      problemNotes.push({
        title: note.title,
        notebook: note.notebook,
        issue: 'Unknown notebook value',
      })
    }
  } catch (err) {
    console.error(`Error reading ${file}:`, err.message)
  }
})

// Show results
console.log('\n📊 NOTES BY NOTEBOOK:')
Object.entries(notesByNotebook).forEach(([notebook, notes]) => {
  console.log(`\n"${notebook}": ${notes.length} notes`)
  if (notes.length <= 5) {
    notes.forEach(n => console.log(`  - ${n.title}`))
  } else {
    notes.slice(0, 3).forEach(n => console.log(`  - ${n.title}`))
    console.log(`  ... and ${notes.length - 3} more`)
  }
})

// Check for specific notebooks
console.log('\n🎯 CHECKING SPECIFIC NOTEBOOKS:')
const notebooksToCheck = ['inbox', 'Inbox', 'default', 'Default']
notebooksToCheck.forEach(name => {
  const count = notesByNotebook[name]?.length || 0
  if (count > 0) {
    console.log(`  ✓ "${name}": ${count} notes`)
  }
})

// Show problems
if (problemNotes.length > 0) {
  console.log('\n⚠️  PROBLEM NOTES:')
  problemNotes.forEach(p => {
    console.log(`  - "${p.title}" has notebook: "${p.notebook}" (${p.issue})`)
  })
}

// Recommendations
console.log('\n💡 ANALYSIS:')
const hasInboxNotebook = notebooks.some(nb => nb.name.toLowerCase() === 'inbox')
const hasNotesInInbox = Object.keys(notesByNotebook).some(
  k => k.toLowerCase() === 'inbox'
)

if (!hasInboxNotebook) {
  console.log('❌ No Inbox notebook found in notebooks.json')
} else {
  console.log('✅ Inbox notebook exists')
}

if (!hasNotesInInbox) {
  console.log('❌ No notes found with Inbox as notebook value')
} else {
  console.log('✅ Found notes in Inbox')
}

// Check case sensitivity
const caseSensitiveIssues = []
notebooks.forEach(nb => {
  const lowercaseName = nb.name.toLowerCase()
  const notesWithLowercase = notesByNotebook[lowercaseName]?.length || 0
  const notesWithOriginal = notesByNotebook[nb.name]?.length || 0

  if (
    notesWithLowercase > 0 &&
    notesWithOriginal > 0 &&
    lowercaseName !== nb.name
  ) {
    caseSensitiveIssues.push({
      notebook: nb.name,
      original: notesWithOriginal,
      lowercase: notesWithLowercase,
    })
  }
})

if (caseSensitiveIssues.length > 0) {
  console.log('\n⚠️  CASE SENSITIVITY ISSUES:')
  caseSensitiveIssues.forEach(issue => {
    console.log(`  - "${issue.notebook}": ${issue.original} notes`)
    console.log(
      `    "${issue.notebook.toLowerCase()}": ${issue.lowercase} notes`
    )
  })
}
