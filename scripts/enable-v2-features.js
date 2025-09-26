#!/usr/bin/env node

/**
 * Script to enable/disable V2 Clean Architecture features
 * Usage: node scripts/enable-v2-features.js [enable|disable|status]
 */

const features = {
  feature_useCleanArchitecture: 'Clean Architecture V2',
  feature_useQueryForNotesList: 'TanStack Query for Notes List',
  feature_useQueryForNotebooks: 'TanStack Query for Notebooks',
  feature_useQueryForSettings: 'TanStack Query for Settings',
  feature_useQueryForSearch: 'TanStack Query for Search',
  feature_enableOfflinePersistence: 'Offline Persistence',
}

function enableAllFeatures() {
  console.log('🚀 Enabling all V2 features...\n')

  const script = Object.keys(features)
    .map(key => `localStorage.setItem('${key}', 'true')`)
    .join('\n')

  console.log('Copy and paste this in your browser console:')
  console.log('='.repeat(50))
  console.log(script)
  console.log('window.location.reload()')
  console.log('='.repeat(50))
  console.log('\n✅ All features will be enabled after reload')
}

function disableAllFeatures() {
  console.log('🔴 Disabling all V2 features...\n')

  const script = Object.keys(features)
    .map(key => `localStorage.removeItem('${key}')`)
    .join('\n')

  console.log('Copy and paste this in your browser console:')
  console.log('='.repeat(50))
  console.log(script)
  console.log('window.location.reload()')
  console.log('='.repeat(50))
  console.log('\n✅ All features will be disabled after reload')
}

function checkStatus() {
  console.log('📊 V2 Features Status Check\n')
  console.log('Copy and paste this in your browser console:')
  console.log('='.repeat(50))

  const script = `
// Check V2 Features Status
console.log('\\n🔍 V2 Features Status:\\n');
${Object.entries(features)
  .map(
    ([key, name]) =>
      `console.log('${name}:', localStorage.getItem('${key}') === 'true' ? '✅ Enabled' : '❌ Disabled');`
  )
  .join('\n')}
console.log('\\n');
`

  console.log(script)
  console.log('='.repeat(50))
}

// Main execution
const command = process.argv[2]

console.log('\n🎯 Viny V2 Feature Manager\n')

switch (command) {
  case 'enable':
    enableAllFeatures()
    break
  case 'disable':
    disableAllFeatures()
    break
  case 'status':
    checkStatus()
    break
  default:
    console.log(
      'Usage: node scripts/enable-v2-features.js [enable|disable|status]\n'
    )
    console.log('Commands:')
    console.log('  enable  - Enable all V2 features')
    console.log('  disable - Disable all V2 features')
    console.log('  status  - Check current feature status')
    console.log('\nExample:')
    console.log('  node scripts/enable-v2-features.js enable')
}

console.log('\n')

// Helper function for CLI output
function log(message) {
  console.log(message)
}

// Export for potential programmatic use
module.exports = {
  features,
  enableAllFeatures,
  disableAllFeatures,
  checkStatus,
}
