#!/usr/bin/env node

/**
 * Test creating a note with correct notebook field
 */

console.log('🧪 Testing Note Creation with Notebook\n')

console.log('📋 EXPECTED BEHAVIOR:')
console.log('1. When creating a note while "Inbox" is selected')
console.log('2. The note should have notebook: "Inbox" (the name, not ID)')
console.log('3. The note should immediately appear in the Inbox view\n')

console.log('🔍 TO TEST:')
console.log('1. Open the app and click on "Inbox" in sidebar')
console.log('2. Create a new note (Cmd/Ctrl + N)')
console.log('3. Check browser console for:')
console.log('   - "🆕 Creating new note with notebook name: Inbox"')
console.log('4. Save the note and click on "All Notes"')
console.log('5. Click back on "Inbox" - the note should still be there\n')

console.log('📊 DEBUGGING IN CONSOLE:')
console.log('Run this in browser console to check a note:\n')
console.log(`// Get all notes
const notes = await window.electronAPI.storage.loadAllNotes()
console.log('Total notes:', notes.length)

// Check notebook values
const notebookValues = [...new Set(notes.map(n => n.notebook))]
console.log('Unique notebook values:', notebookValues)

// Find notes in Inbox
const inboxNotes = notes.filter(n => n.notebook === 'Inbox' || n.notebook === 'inbox')
console.log('Inbox notes:', inboxNotes.length)
inboxNotes.forEach(n => console.log('  -', n.title, 'notebook:', n.notebook))`)

console.log('\n\n💡 QUICK FIX:')
console.log('If notes have wrong notebook values, run:')
console.log('  node scripts/fix-notebook-names.js')
