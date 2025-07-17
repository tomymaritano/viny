#!/usr/bin/env node

/**
 * Script to convert default exports to named exports
 * This helps with tree-shaking and makes imports more explicit
 */

const fs = require('fs')
const path = require('path')
const glob = require('glob')

// Components that should be converted
const COMPONENTS_TO_CONVERT = [
  // Main components
  'src/components/ErrorBoundary.tsx',
  'src/components/LoadingSpinner.tsx',
  'src/components/Icons.tsx',
  'src/components/MarkdownPreview.tsx',
  'src/components/NotePreview.tsx',
  'src/components/ExportDialog.tsx',
  'src/components/SearchModal.tsx',
  'src/components/ResizableLayout.tsx',

  // App components
  'src/components/app/AppPresentation.tsx',
  'src/components/app/AppLayout.tsx',
  'src/components/app/AppModals.tsx',

  // UI components
  'src/components/ui/Toast.tsx',
  'src/components/ui/ToastContainer.tsx',
  'src/components/ui/IconButton.tsx',
  'src/components/ui/BaseModal.tsx',
  'src/components/ui/Dropdown.tsx',

  // Editor components
  'src/components/editor/SplitEditor.tsx',
  'src/components/editor/FloatingViewControls.tsx',
  'src/components/editor/toolbar/EditorToolbar.tsx',

  // Settings components
  'src/components/settings/SettingsModal.tsx',

  // Hooks
  'src/hooks/useSearch.ts',
  'src/hooks/useDropdown.ts',
  'src/hooks/useAutoSave.ts',

  // Services and stores
  'src/stores/newSimpleStore.ts',
  'src/services/errorLogger.ts',
]

function convertFile(filePath) {
  console.log(`Converting ${filePath}...`)

  let content = fs.readFileSync(filePath, 'utf8')

  // Pattern 1: export default ComponentName
  content = content.replace(
    /export\s+default\s+(\w+)(\s*;?\s*)$/gm,
    'export { $1 }'
  )

  // Pattern 2: const ComponentName = ... export default ComponentName
  content = content.replace(
    /const\s+(\w+)\s*=\s*(.*?)\n\nexport\s+default\s+\1/gs,
    'export const $1 = $2'
  )

  // Pattern 3: function ComponentName ... export default ComponentName
  content = content.replace(
    /function\s+(\w+)(.*?)\n\nexport\s+default\s+\1/gs,
    'export function $1$2'
  )

  // Pattern 4: export default function ComponentName
  content = content.replace(
    /export\s+default\s+function\s+(\w+)/g,
    'export function $1'
  )

  // Pattern 5: export default const ComponentName (invalid syntax but sometimes appears)
  content = content.replace(
    /export\s+default\s+const\s+(\w+)/g,
    'export const $1'
  )

  // Write back
  fs.writeFileSync(filePath, content)
  console.log(`✓ Converted ${filePath}`)
}

function findImportsToUpdate(componentName, searchDir = 'src') {
  const patterns = [
    `import ${componentName} from`,
    `import.*${componentName}.*from`,
    `lazy\\(\\(\\)\\s*=>\\s*import\\(['"].*${componentName}`,
  ]

  const files = glob.sync(`${searchDir}/**/*.{ts,tsx,js,jsx}`, {
    ignore: ['**/node_modules/**', '**/dist/**', '**/build/**'],
  })

  const imports = []

  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8')
    patterns.forEach(pattern => {
      const regex = new RegExp(pattern, 'g')
      if (regex.test(content)) {
        imports.push(file)
      }
    })
  })

  return [...new Set(imports)]
}

function updateImports(filePath, componentName) {
  console.log(`Updating imports in ${filePath}...`)

  let content = fs.readFileSync(filePath, 'utf8')

  // Update regular imports
  const importRegex = new RegExp(
    `import\\s+${componentName}\\s+from\\s+(['"])(.*?)\\1`,
    'g'
  )
  content = content.replace(
    importRegex,
    `import { ${componentName} } from $1$2$1`
  )

  // Update lazy imports
  const lazyRegex = new RegExp(
    `lazy\\(\\(\\)\\s*=>\\s*import\\((['"])(.*?${componentName}.*?)\\1\\)\\)`,
    'g'
  )
  content = content.replace(
    lazyRegex,
    `lazy(() => import($1$2$1).then(module => ({ default: module.${componentName} })))`
  )

  fs.writeFileSync(filePath, content)
  console.log(`✓ Updated imports in ${filePath}`)
}

// Main execution
console.log('Starting conversion to named exports...\n')

COMPONENTS_TO_CONVERT.forEach(componentPath => {
  if (fs.existsSync(componentPath)) {
    // Extract component name from path
    const componentName = path.basename(
      componentPath,
      path.extname(componentPath)
    )

    // Convert the component file
    convertFile(componentPath)

    // Find and update all imports
    const importsToUpdate = findImportsToUpdate(componentName)
    importsToUpdate.forEach(importPath => {
      if (importPath !== componentPath) {
        updateImports(importPath, componentName)
      }
    })

    console.log('')
  } else {
    console.log(`⚠️  File not found: ${componentPath}`)
  }
})

console.log('\n✅ Conversion complete!')
console.log(
  '\nNote: Please run your tests to ensure everything works correctly.'
)
console.log('Some complex cases might need manual review.')
