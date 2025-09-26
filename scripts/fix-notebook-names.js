#!/usr/bin/env node

/**
 * Script to fix notes that have notebook IDs instead of names
 * This will update all notes to use the notebook name
 */

const fs = require('fs').promises
const path = require('path')
const os = require('os')

async function fixNotebookNames() {
  console.log('🔧 Fixing notebook names in notes...\n')

  const dataPath = path.join(os.homedir(), '.nototo', 'data')
  const notesPath = path.join(dataPath, 'notes')
  const notebooksPath = path.join(dataPath, 'notebooks.json')

  try {
    // Read notebooks data
    const notebooksData = await fs.readFile(notebooksPath, 'utf8')
    const notebooks = JSON.parse(notebooksData)

    // Create ID to name mapping
    const idToName = {}
    notebooks.forEach(nb => {
      idToName[nb.id] = nb.name
    })

    console.log('📚 Found notebooks:')
    notebooks.forEach(nb => {
      console.log(`  - "${nb.name}" (id: ${nb.id})`)
    })
    console.log()

    // Get all note files
    const noteFiles = await fs.readdir(notesPath)
    const jsonFiles = noteFiles.filter(f => f.endsWith('.json'))

    console.log(`📝 Found ${jsonFiles.length} notes to check\n`)

    let fixed = 0
    let alreadyCorrect = 0
    let errors = 0

    // Process each note
    for (const file of jsonFiles) {
      try {
        const filePath = path.join(notesPath, file)
        const content = await fs.readFile(filePath, 'utf8')
        const note = JSON.parse(content)

        // Check if notebook field looks like an ID (contains underscore or is in our ID map)
        if (
          note.notebook &&
          (note.notebook.includes('_') || idToName[note.notebook])
        ) {
          const oldValue = note.notebook

          // If it's an ID, convert to name
          if (idToName[note.notebook]) {
            note.notebook = idToName[note.notebook]
          } else {
            // Try to find a matching notebook by checking if the ID matches any notebook
            const matchingNotebook = notebooks.find(
              nb => nb.id === note.notebook
            )
            if (matchingNotebook) {
              note.notebook = matchingNotebook.name
            } else {
              console.warn(
                `⚠️  Note "${note.title}" has unknown notebook ID: ${note.notebook}`
              )
              continue
            }
          }

          // Update the file
          await fs.writeFile(filePath, JSON.stringify(note, null, 2))
          fixed++
          console.log(
            `✅ Fixed: "${note.title}" - notebook: "${oldValue}" → "${note.notebook}"`
          )
        } else {
          alreadyCorrect++
        }
      } catch (err) {
        errors++
        console.error(`❌ Error processing ${file}:`, err.message)
      }
    }

    console.log('\n📊 SUMMARY:')
    console.log(`  ✅ Fixed: ${fixed} notes`)
    console.log(`  ✓  Already correct: ${alreadyCorrect} notes`)
    if (errors > 0) {
      console.log(`  ❌ Errors: ${errors} notes`)
    }

    if (fixed > 0) {
      console.log(
        '\n🎉 Migration complete! Notes should now appear in their notebooks.'
      )
      console.log('   Restart the app or refresh to see the changes.')
    } else {
      console.log('\n✨ All notes already have correct notebook names!')
    }
  } catch (error) {
    console.error('❌ Fatal error:', error.message)
    console.error("   Make sure you're running this in Electron mode")
  }
}

// Run the migration
fixNotebookNames()
