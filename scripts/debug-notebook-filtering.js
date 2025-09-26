#!/usr/bin/env node

// Script to debug notebook filtering issue

const fs = require('fs')
const path = require('path')
const os = require('os')

console.log('🔍 Debugging Notebook Filtering\n')

// Get the notes data from Electron storage
const appDataPath = path.join(os.homedir(), '.nototo', 'data', 'notes')

function analyzeNotes() {
  try {
    // Get all note files
    const noteFiles = fs
      .readdirSync(appDataPath)
      .filter(f => f.endsWith('.json'))
    console.log(`Found ${noteFiles.length} notes\n`)

    // Analyze notebook field in notes
    const notebookStats = {}
    const notes = []

    noteFiles.forEach(file => {
      try {
        const content = fs.readFileSync(path.join(appDataPath, file), 'utf8')
        const note = JSON.parse(content)
        notes.push(note)

        const notebook = note.notebook || 'NO_NOTEBOOK'
        notebookStats[notebook] = (notebookStats[notebook] || 0) + 1
      } catch (err) {
        console.error(`Error reading ${file}:`, err.message)
      }
    })

    console.log('📊 NOTEBOOK DISTRIBUTION:')
    Object.entries(notebookStats).forEach(([notebook, count]) => {
      console.log(`  ${notebook}: ${count} notes`)
    })
    console.log()

    // Check for common issues
    console.log('🐛 POTENTIAL ISSUES:')

    // Check for notes with notebook ID instead of name
    const notesWithIds = notes.filter(
      n => n.notebook && n.notebook.includes('_')
    )
    if (notesWithIds.length > 0) {
      console.log(
        `❌ Found ${notesWithIds.length} notes with notebook IDs instead of names:`
      )
      notesWithIds.slice(0, 5).forEach(n => {
        console.log(`   - ${n.title}: notebook="${n.notebook}"`)
      })
    }

    // Check for case sensitivity issues
    const lowercaseNotebooks = notes.filter(
      n => n.notebook && n.notebook === n.notebook.toLowerCase()
    )
    const mixedCaseNotebooks = notes.filter(
      n => n.notebook && n.notebook !== n.notebook.toLowerCase()
    )

    if (mixedCaseNotebooks.length > 0) {
      console.log(
        `⚠️  Found ${mixedCaseNotebooks.length} notes with mixed-case notebooks:`
      )
      const uniqueMixed = [...new Set(mixedCaseNotebooks.map(n => n.notebook))]
      uniqueMixed.forEach(nb => console.log(`   - "${nb}"`))
    }

    // Check for Inbox specifically
    const inboxVariations = {
      Inbox: notes.filter(n => n.notebook === 'Inbox').length,
      inbox: notes.filter(n => n.notebook === 'inbox').length,
      INBOX: notes.filter(n => n.notebook === 'INBOX').length,
    }

    console.log('\n📁 INBOX VARIATIONS:')
    Object.entries(inboxVariations).forEach(([variant, count]) => {
      if (count > 0) {
        console.log(`  "${variant}": ${count} notes`)
      }
    })

    // Sample notes from Inbox
    const inboxNotes = notes.filter(
      n => n.notebook && n.notebook.toLowerCase() === 'inbox'
    )
    if (inboxNotes.length > 0) {
      console.log(`\n📝 SAMPLE INBOX NOTES (first 3):`)
      inboxNotes.slice(0, 3).forEach(n => {
        console.log(`  - "${n.title}" (notebook: "${n.notebook}")`)
      })
    } else {
      console.log('\n❌ NO NOTES FOUND IN INBOX!')
    }

    // Check notebooks data
    console.log('\n📚 CHECKING NOTEBOOKS DATA:')
    const notebooksPath = path.join(
      os.homedir(),
      '.nototo',
      'data',
      'notebooks.json'
    )
    if (fs.existsSync(notebooksPath)) {
      const notebooksData = JSON.parse(fs.readFileSync(notebooksPath, 'utf8'))
      console.log(`Found ${notebooksData.length} notebooks:`)
      notebooksData.forEach(nb => {
        console.log(`  - "${nb.name}" (id: ${nb.id})`)
      })

      // Check if Inbox exists
      const inboxNotebook = notebooksData.find(
        nb => nb.name.toLowerCase() === 'inbox'
      )
      if (inboxNotebook) {
        console.log(
          `\n✅ Inbox notebook exists: "${inboxNotebook.name}" (id: ${inboxNotebook.id})`
        )
      } else {
        console.log('\n❌ Inbox notebook NOT FOUND in notebooks data!')
      }
    }

    console.log('\n💡 RECOMMENDATIONS:')
    console.log('1. Ensure all notes use notebook NAME, not ID')
    console.log('2. Use consistent casing (preferably exact notebook name)')
    console.log('3. Check that notebooks.json has the correct notebooks')
    console.log('4. Look at browser console logs when clicking Inbox')
  } catch (error) {
    console.error('Error analyzing notes:', error.message)
    console.log("\nMake sure you're running this in Electron mode")
  }
}

analyzeNotes()
