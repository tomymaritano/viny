#!/usr/bin/env node

/**
 * Script to check database status and data location
 */

const fs = require('fs')
const path = require('path')

console.log('🔍 Checking database status...\n')

// Check .env.local
const envPath = path.join(__dirname, '..', '.env.local')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8')
  console.log('📄 .env.local content:')
  console.log(envContent)

  if (envContent.includes('VITE_USE_DEXIE=true')) {
    console.log('✅ Dexie is ENABLED via .env.local\n')
  } else {
    console.log('❌ Dexie is DISABLED in .env.local\n')
  }
} else {
  console.log('❌ .env.local not found\n')
}

// Check for data directories (Electron)
const electronDataPath = path.join(
  process.env.HOME || process.env.USERPROFILE,
  'Library/Application Support/viny/viny-data'
)

if (fs.existsSync(electronDataPath)) {
  console.log('📁 Electron data directory found:', electronDataPath)

  try {
    const files = fs.readdirSync(electronDataPath)
    console.log(
      'Files:',
      files.filter(f => f.endsWith('.json')).length,
      'JSON files found'
    )

    // Check for notes
    const notesDir = path.join(electronDataPath, 'notes')
    if (fs.existsSync(notesDir)) {
      const noteFiles = fs.readdirSync(notesDir)
      console.log('📝 Notes found:', noteFiles.length)
    }
  } catch (error) {
    console.log('❌ Could not read data directory:', error.message)
  }
} else {
  console.log('❌ Electron data directory not found')
}

console.log('\n💡 Recommendations:')
console.log(
  '1. If Dexie is enabled but you see no data, you need to run the migration'
)
console.log(
  '2. Go to Settings > Storage > Database Engine and click "Start Migration"'
)
console.log('3. Or temporarily disable Dexie by removing/editing .env.local')
console.log('4. Then restart the development server')
