#!/usr/bin/env node

/**
 * Script to reset Dexie database and force reimport
 */

console.log('🗑️  Resetting Dexie database...\n')

console.log('To reset Dexie database:')
console.log('1. Open your browser DevTools (F12)')
console.log('2. Go to Application tab')
console.log('3. Find IndexedDB in the left sidebar')
console.log('4. Delete "VinyDatabase"')
console.log('5. Refresh the page')
console.log('\nOR run this in the browser console:')
console.log(`
indexedDB.deleteDatabase('VinyDatabase').onsuccess = () => {
  console.log('Database deleted successfully');
  location.reload();
};
`)

console.log(
  '\nThis will force Dexie to reimport all notes from file storage on next load.'
)
