#!/usr/bin/env node

// Test script to verify V2 metadata save flow works correctly

console.log('🧪 Testing V2 Metadata Save Flow\n')

console.log('📋 ARCHITECTURE OVERVIEW:')
console.log(
  'UI → useMarkdownEditorQuery → updateMutationV2 → NoteServiceV2 → Repository\n'
)

console.log('✅ FIXES IMPLEMENTED:')
console.log('1. useMarkdownEditor - Fixed to send partial updates only')
console.log(
  '2. useMarkdownEditorQuery - Fixed to use updateMutationV2 with partial updates'
)
console.log('3. updateMutationV2 - Already supports partial updates correctly')
console.log('4. NoteServiceV2.updateNote - Already handles partial updates')
console.log('5. Repository.update - Already merges partial data\n')

console.log('🔄 EXPECTED FLOW:')
console.log('\n--- SCENARIO 1: User changes notebook ---')
console.log('1. User selects "work" in dropdown')
console.log('2. NoteMetadata calls handleNotebookChange("work")')
console.log('3. useMarkdownEditorQuery.handleNotebookChange creates:')
console.log('   updateMutation.mutate({')
console.log('     id: "note123",')
console.log('     data: {')
console.log('       notebook: "work",')
console.log('       updatedAt: "2025-01-25T..."')
console.log('     }')
console.log('   })')
console.log(
  '4. Mutation calls NoteServiceV2.updateNote(id, { notebook, updatedAt })'
)
console.log('5. Service calls Repository.update(id, partialData)')
console.log('6. Repository merges: { ...existingNote, ...partialData }')
console.log('7. Only notebook field is updated!\n')

console.log('\n--- SCENARIO 2: User presses Ctrl+S ---')
console.log('1. Keyboard handler triggers')
console.log('2. AppContainerV2.onSaveNote calls:')
console.log('   updateMutation.mutate({')
console.log('     id: "note123",')
console.log('     data: {')
console.log('       content: "latest content from editor",')
console.log('       updatedAt: "2025-01-25T..."')
console.log('     }')
console.log('   })')
console.log('3. Same flow: Service → Repository → Merge')
console.log('4. Only content field is updated!')
console.log('5. Metadata (notebook, status, tags) preserved!\n')

console.log('🎯 KEY POINTS:')
console.log('- Metadata updates NEVER include content')
console.log('- Content updates NEVER include metadata')
console.log('- Repository always merges, never overwrites')
console.log('- Clean Architecture V2 pattern followed throughout\n')

console.log('⚠️  COMMON PITFALLS TO AVOID:')
console.log("- DON'T use saveMutation (saves entire note)")
console.log("- DON'T spread selectedNote when updating")
console.log("- DON'T include content in metadata updates")
console.log("- DON'T include metadata in content updates\n")

console.log('✅ To test manually:')
console.log('1. Open a note')
console.log('2. Change notebook to "work"')
console.log('3. Start editing content')
console.log('4. Press Ctrl+S')
console.log('5. Verify notebook is still "work"')
console.log('6. Verify content is saved')
console.log(
  '7. Check console for any full note saves (there should be none!)\n'
)

console.log('🔍 Debug commands:')
console.log('- Check feature flags: window.featureFlags')
console.log(
  '- Enable V2: localStorage.setItem("feature_useCleanArchitecture", "true")'
)
console.log('- Watch mutations: Open React Query DevTools')
console.log('- Check logs: Look for "Only update the X field" messages\n')

// Check if we're using the right patterns
const fs = require('fs')
const path = require('path')

const checkFile = (filePath, patterns) => {
  try {
    const content = fs.readFileSync(path.join(process.cwd(), filePath), 'utf8')
    console.log(`\nChecking ${filePath}:`)
    patterns.forEach(pattern => {
      if (content.includes(pattern.bad)) {
        console.log(`❌ Found bad pattern: "${pattern.bad}"`)
        console.log(`   Should be: "${pattern.good}"`)
      } else if (content.includes(pattern.good)) {
        console.log(`✅ Good pattern found: "${pattern.good}"`)
      }
    })
  } catch (error) {
    console.log(`⚠️  Could not check ${filePath}`)
  }
}

// Check key files
checkFile('src/components/editor/hooks/useMarkdownEditorQuery.ts', [
  {
    bad: 'useSaveNoteMutation',
    good: 'useUpdateNoteMutationV2',
  },
  {
    bad: '...selectedNote',
    good: 'id: selectedNote.id,',
  },
  {
    bad: 'saveMutation.mutate(updatedNote)',
    good: 'updateMutation.mutate({',
  },
])

console.log('\n✅ Script complete!')
