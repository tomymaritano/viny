/**
 * Debug utility for notebook filtering issues
 * Can be used in both Electron and Web environments
 */

export async function debugNotebookFiltering() {
  console.log('🔍 DEBUGGING NOTEBOOK FILTERING\n')
  
  try {
    // Check if we're in Electron
    const isElectron = window.electronAPI?.isElectron
    console.log(`Environment: ${isElectron ? 'Electron' : 'Web'}`)
    
    if (isElectron && window.electronAPI?.storage) {
      // Electron mode - direct access to storage
      const notes = await window.electronAPI.storage.loadAllNotes()
      const notebooks = await window.electronAPI.storage.loadNotebooks()
      
      console.log('\n📚 NOTEBOOKS:')
      notebooks.forEach((nb: any) => {
        console.log(`  - "${nb.name}" (id: ${nb.id})`)
      })
      
      console.log('\n📝 NOTES:')
      console.log(`Total notes: ${notes.length}`)
      
      // Group notes by notebook
      const notesByNotebook: Record<string, any[]> = {}
      notes.forEach((note: any) => {
        const notebook = note.notebook || 'NO_NOTEBOOK'
        if (!notesByNotebook[notebook]) {
          notesByNotebook[notebook] = []
        }
        notesByNotebook[notebook].push(note)
      })
      
      console.log('\n📊 NOTES BY NOTEBOOK:')
      Object.entries(notesByNotebook).forEach(([notebook, notesInNotebook]) => {
        console.log(`  "${notebook}": ${notesInNotebook.length} notes`)
        if (notesInNotebook.length > 0 && notesInNotebook.length <= 3) {
          notesInNotebook.forEach(n => console.log(`    - ${n.title}`))
        }
      })
      
      // Check for issues
      console.log('\n🐛 POTENTIAL ISSUES:')
      
      // Check for notebook IDs instead of names
      const notesWithIds = notes.filter((n: any) => n.notebook && n.notebook.includes('_'))
      if (notesWithIds.length > 0) {
        console.log(`❌ Found ${notesWithIds.length} notes with notebook IDs instead of names`)
        notesWithIds.slice(0, 3).forEach((n: any) => {
          console.log(`  - "${n.title}" has notebook: "${n.notebook}"`)
        })
      }
      
      // Check case sensitivity
      const inboxVariations = {
        'Inbox': notes.filter((n: any) => n.notebook === 'Inbox').length,
        'inbox': notes.filter((n: any) => n.notebook === 'inbox').length,
        'INBOX': notes.filter((n: any) => n.notebook === 'INBOX').length
      }
      
      console.log('\n📁 INBOX VARIATIONS:')
      Object.entries(inboxVariations).forEach(([variant, count]) => {
        if (count > 0) {
          console.log(`  "${variant}": ${count} notes`)
        }
      })
      
    } else {
      // Web mode - use repository
      console.log('In web mode - checking localStorage/IndexedDB...')
      
      // Try to access Dexie directly
      if ((window as any).Dexie) {
        const db = new (window as any).Dexie('NotesDB')
        await db.open()
        
        if (db.notes) {
          const notes = await db.notes.toArray()
          console.log(`Found ${notes.length} notes in Dexie`)
          
          const notesByNotebook: Record<string, number> = {}
          notes.forEach((note: any) => {
            const notebook = note.notebook || 'NO_NOTEBOOK'
            notesByNotebook[notebook] = (notesByNotebook[notebook] || 0) + 1
          })
          
          console.log('\n📊 NOTES BY NOTEBOOK:')
          Object.entries(notesByNotebook).forEach(([notebook, count]) => {
            console.log(`  "${notebook}": ${count} notes`)
          })
        }
      }
    }
    
    console.log('\n💡 TESTING NOTEBOOK CLICK:')
    console.log('1. Click on a notebook in the sidebar')
    console.log('2. Look for red 🔴 debug logs in console')
    console.log('3. Check what activeSection is set to')
    console.log('4. Check what notebook values the notes have')
    
  } catch (error) {
    console.error('Error during debugging:', error)
  }
}

// Make it available globally for console access
if (typeof window !== 'undefined') {
  (window as any).debugNotebooks = debugNotebookFiltering
}