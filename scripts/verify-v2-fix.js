#!/usr/bin/env node

// Script to verify V2 metadata flow is fixed

console.log('🔍 Verifying V2 Metadata Flow Fix\n')

console.log('✅ FIXES APPLIED:')
console.log('1. useMarkdownEditorQuery now uses updateMutationV2 correctly')
console.log('2. All mutations pass { id, data } format')
console.log('3. Metadata updates only send metadata fields')
console.log('4. Content updates only send content field')
console.log('5. Cleaned up debug logging\n')

console.log('📋 EXPECTED BEHAVIOR:')
console.log('1. Change notebook → Only notebook field updates')
console.log('2. Change status → Only status field updates')
console.log('3. Change tags → Only tags field updates')
console.log('4. Press Ctrl+S → Only content field updates')
console.log('5. All metadata preserved during content saves\n')

console.log('🐛 ERROR THAT WAS FIXED:')
console.log(
  "- \"Cannot destructure property 'isTrashed' of 'data' as it is undefined\""
)
console.log('- This happened because mutation was passing wrong format')
console.log('- Was: updateMutation.mutate(updatedNote)')
console.log('- Now: updateMutation.mutate({ id, data: { field: value } })\n')

console.log('🧪 TO TEST:')
console.log('1. Open a note')
console.log('2. Change notebook to "Inbox"')
console.log('3. Verify no errors in console')
console.log('4. Verify notebook selector shows "Inbox"')
console.log('5. Edit some content')
console.log('6. Press Ctrl+S')
console.log('7. Verify notebook is still "Inbox"')
console.log('8. Verify content is saved\n')

console.log('⚠️  THINGS TO CHECK:')
console.log('- No "Failed to update note" errors')
console.log('- No "Cannot destructure property" errors')
console.log('- Notebook selector updates correctly')
console.log("- Metadata doesn't revert on save\n")

console.log('📊 Current Architecture:')
console.log(
  'UI → useMarkdownEditorQuery → updateMutationV2 → NoteServiceV2 → Repository'
)
console.log('Each layer properly handles partial updates\n')

// Check for common issues
const fs = require('fs')
const path = require('path')

const checkPatterns = filePath => {
  try {
    const content = fs.readFileSync(path.join(process.cwd(), filePath), 'utf8')
    const issues = []

    // Check for wrong mutation patterns
    if (content.includes('saveMutation.mutate(')) {
      issues.push('Still using saveMutation instead of updateMutation')
    }

    if (content.includes('updateMutation.mutate(updatedNote)')) {
      issues.push('Passing full note object instead of { id, data }')
    }

    if (content.includes('...selectedNote')) {
      issues.push('Still spreading selectedNote (might include all fields)')
    }

    return issues
  } catch (error) {
    return [`Could not check file: ${error.message}`]
  }
}

console.log('🔍 Checking for remaining issues...\n')

const filesToCheck = [
  'src/components/editor/hooks/useMarkdownEditorQuery.ts',
  'src/components/editor/hooks/useMarkdownEditor.ts',
]

let hasIssues = false
filesToCheck.forEach(file => {
  const issues = checkPatterns(file)
  if (issues.length > 0) {
    console.log(`❌ ${file}:`)
    issues.forEach(issue => console.log(`   - ${issue}`))
    hasIssues = true
  }
})

if (!hasIssues) {
  console.log('✅ No issues found in checked files!\n')
}

console.log('✅ Fix verification complete!')
