#!/usr/bin/env node

/**
 * Script to enable Dexie database
 */

console.log('🚀 Enabling Dexie database...')

// Set the flag in localStorage (for browser environment)
if (typeof window !== 'undefined' && window.localStorage) {
  window.localStorage.setItem('viny_use_dexie', 'true')
  console.log('✅ Dexie enabled in browser storage')
}

// For Node.js environment, we'll create a .env.local file
const fs = require('fs')
const path = require('path')

const envPath = path.join(__dirname, '..', '.env.local')
const envContent = `# Local environment variables
VITE_USE_DEXIE=true
`

try {
  fs.writeFileSync(envPath, envContent)
  console.log('✅ Created .env.local with VITE_USE_DEXIE=true')
  console.log(
    '📝 Please restart your development server for changes to take effect'
  )
} catch (error) {
  console.error('❌ Failed to create .env.local:', error.message)
}
