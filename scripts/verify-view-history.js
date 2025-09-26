#!/usr/bin/env node

// Quick script to verify View History handlers are properly connected

const fs = require('fs')
const path = require('path')

console.log('Checking View History implementation...\n')

const filesToCheck = [
  'src/components/app/AppContainerV2.tsx',
  'src/components/app/AppPresentationV2.tsx',
  'src/components/app/AppLayout.tsx',
  'src/components/MarkdownItEditor.tsx',
  'src/components/NotePreview.tsx',
  'src/components/preview/NotePreviewHeader.tsx',
  'src/components/ui/NoteActionsDrawerPortal.tsx',
  'src/components/GlobalContextMenuV2.tsx',
  'electron/main/ipc/contextMenus.ts',
]

filesToCheck.forEach(file => {
  const filePath = path.join(process.cwd(), file)
  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${file}`)
    return
  }

  const content = fs.readFileSync(filePath, 'utf8')
  const hasViewHistory =
    content.includes('onViewHistory') ||
    content.includes('handleViewHistory') ||
    content.includes('view-note-history')

  if (hasViewHistory) {
    console.log(`✅ ${file} - Has View History`)

    // Check for specific patterns
    if (content.includes('handleViewHistory = useCallback')) {
      console.log(`   └─ Defines handleViewHistory callback`)
    }
    if (content.includes('onViewHistory?.(')) {
      console.log(`   └─ Calls onViewHistory handler`)
    }
    if (content.includes('view-note-history')) {
      console.log(`   └─ Handles view-note-history event`)
    }
  } else {
    console.log(`⚠️  ${file} - Missing View History`)
  }
})

console.log('\nChecking modal registration...')
const modalSlicePath = path.join(
  process.cwd(),
  'src/stores/slices/modalSlice.ts'
)
if (fs.existsSync(modalSlicePath)) {
  const modalContent = fs.readFileSync(modalSlicePath, 'utf8')
  if (modalContent.includes('revisionHistory: boolean')) {
    console.log('✅ revisionHistory modal is registered in modalSlice')
  } else {
    console.log('❌ revisionHistory modal NOT registered in modalSlice')
  }
}

console.log('\nDone!')
