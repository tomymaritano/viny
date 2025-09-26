#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const glob = require('glob')

// Files to exclude
const excludePatterns = [
  '**/__tests__/**',
  '**/*.test.*',
  '**/*.spec.*',
  '**/node_modules/**',
  '**/dist/**',
  '**/build/**',
  '**/coverage/**',
  '**/logger.ts',
  '**/devHelpers.ts',
  '**/ai-test.ts',
  '.next/**',
  '.turbo/**',
]

// Logger mappings based on context
const loggerMappings = {
  'main.tsx': 'initLogger',
  ServiceContext: 'initLogger',
  editorLinkPreview: 'editorLogger',
  'env.ts': 'initLogger',
  editorSmartPaste: 'editorLogger',
  authSlice: 'apiLogger',
  notebooksSlice: 'notebookLogger',
  notebookTree: 'notebookLogger',
  errorUtils: 'logger',
  imageUtils: 'storageLogger',
  codeHighlighting: 'editorLogger',
  markdownRenderer: 'editorLogger',
  SidebarContent: 'sidebarLogger',
  NoteActions: 'noteLogger',
  CreateNotebookModal: 'notebookLogger',
  AISettings: 'settingsLogger',
  BackupSettings: 'settingsLogger',
  StorageSettings: 'storageLogger',
  MCPSettings: 'settingsLogger',
  DatabaseMigration: 'storageLogger',
  LivePreview: 'editorLogger',
  SettingsPanel: 'settingsLogger',
  LoginPage: 'apiLogger',
  UserProfile: 'apiLogger',
  AuthGuard: 'apiLogger',
  OptionalAuthGuard: 'apiLogger',
  ChatPanel: 'apiLogger',
  ResizableLayout: 'logger',
  StorageErrorBoundary: 'storageLogger',
  MarkdownItEditor: 'editorLogger',
  SplitEditor: 'editorLogger',
  ZenMode: 'editorLogger',
  EditorToolbar: 'editorLogger',
  MarkdownPreview: 'editorLogger',
  ComponentErrorBoundary: 'logger',
  SearchErrorBoundary: 'searchLogger',
  useEditorState: 'editorLogger',
  useSettingsEffects: 'settingsLogger',
  useSettingsErrorHandler: 'settingsLogger',
  useNoteSync: 'noteLogger',
  useExport: 'noteLogger',
  useAppHandlers: 'logger',
  useStreamingResponse: 'apiLogger',
  AppInitializationService: 'initLogger',
  RepositoryFactory: 'storageLogger',
  RepositoryErrorHandler: 'storageLogger',
  VantaFog: 'logger',
  TagManager: 'noteLogger',
  TagModal: 'noteLogger',
  ContextMenuRadix: 'logger',
  PluginPanel: 'logger',
  'embedding.worker': 'logger',
  'markdown.ts': 'editorLogger',
  defaultNotes: 'logger',
}

// Function to determine appropriate logger based on file path
function getLogger(filePath) {
  const fileName = path.basename(filePath)
  const fileNameNoExt = fileName.replace(/\.[^/.]+$/, '')

  // Check mappings
  for (const [key, logger] of Object.entries(loggerMappings)) {
    if (filePath.includes(key) || fileNameNoExt.includes(key)) {
      return logger
    }
  }

  // Default based on directory
  if (filePath.includes('/components/')) return 'logger'
  if (filePath.includes('/hooks/')) return 'logger'
  if (filePath.includes('/stores/')) return 'logger'
  if (filePath.includes('/services/')) return 'logger'
  if (filePath.includes('/lib/')) return 'logger'
  if (filePath.includes('/utils/')) return 'logger'
  if (filePath.includes('/config/')) return 'logger'

  return 'logger'
}

// Calculate relative import path for logger
function getLoggerImportPath(fromFile) {
  const fromDir = path.dirname(fromFile)
  const toFile = path.join(process.cwd(), 'src/utils/logger')
  let relativePath = path.relative(fromDir, toFile)

  // Ensure path starts with ./ or ../
  if (!relativePath.startsWith('.')) {
    relativePath = './' + relativePath
  }

  // Convert backslashes to forward slashes for Windows
  relativePath = relativePath.replace(/\\/g, '/')

  return relativePath
}

// Function to add logger import if not present
function addLoggerImport(content, filePath, loggerName) {
  // Check if logger is already imported
  const importRegex = new RegExp(
    `import.*{.*${loggerName}.*}.*from.*['"].*logger['"]`
  )
  if (importRegex.test(content)) {
    return content
  }

  // Find the last import statement
  const importMatches = [...content.matchAll(/^import\s+.*$/gm)]
  let insertPosition = 0

  if (importMatches.length > 0) {
    const lastImport = importMatches[importMatches.length - 1]
    insertPosition = lastImport.index + lastImport[0].length
  } else {
    // No imports found, add at the beginning after any comments
    const firstNonComment = content.search(/^(?!\/\/|\/\*|\s*$)/m)
    insertPosition = firstNonComment >= 0 ? firstNonComment : 0
  }

  const loggerPath = getLoggerImportPath(filePath)
  const newImport = `\nimport { ${loggerName} } from '${loggerPath}'`

  return (
    content.slice(0, insertPosition) + newImport + content.slice(insertPosition)
  )
}

// Function to replace console statements in a file
function replaceInFile(filePath, dryRun = false) {
  let content = fs.readFileSync(filePath, 'utf8')
  const originalContent = content
  const loggerName = getLogger(filePath)
  let hasChanges = false

  // Replace console.error
  content = content.replace(/console\.error\(/g, match => {
    hasChanges = true
    return `${loggerName}.error(`
  })

  // Replace console.warn
  content = content.replace(/console\.warn\(/g, match => {
    hasChanges = true
    return `${loggerName}.warn(`
  })

  // Replace console.log with info (except in specific contexts)
  content = content.replace(/console\.log\(/g, match => {
    hasChanges = true
    return `${loggerName}.info(`
  })

  // Replace console.info
  content = content.replace(/console\.info\(/g, match => {
    hasChanges = true
    return `${loggerName}.info(`
  })

  // Replace console.debug
  content = content.replace(/console\.debug\(/g, match => {
    hasChanges = true
    return `${loggerName}.debug(`
  })

  // If we made changes, add the import
  if (hasChanges) {
    content = addLoggerImport(content, filePath, loggerName)

    if (!dryRun) {
      fs.writeFileSync(filePath, content)
      console.log(`✅ Updated: ${path.relative(process.cwd(), filePath)}`)
    } else {
      console.log(`Would update: ${path.relative(process.cwd(), filePath)}`)
    }

    return true
  }

  return false
}

// Main function
async function main() {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')

  if (dryRun) {
    console.log('🔍 DRY RUN MODE - No files will be modified\n')
  } else {
    console.log('🚀 Replacing console statements with logger calls...\n')
  }

  const files = glob.sync('src/**/*.{ts,tsx,js,jsx}', {
    ignore: excludePatterns,
  })

  let updatedCount = 0
  let skippedCount = 0

  for (const file of files) {
    try {
      const content = fs.readFileSync(file, 'utf8')

      // Skip files with specific comments
      if (
        content.includes('// eslint-disable-next-line no-console') ||
        content.includes('/* eslint-disable no-console */')
      ) {
        console.log(
          `⏭️  Skipped (has eslint disable): ${path.relative(process.cwd(), file)}`
        )
        skippedCount++
        continue
      }

      // Special handling for certain files
      if (
        file.includes('LoginPage.tsx') &&
        content.includes("onClick={() => console.log('Forgot password')")
      ) {
        // This is a placeholder onClick handler, skip it
        console.log(
          `⏭️  Skipped (placeholder handler): ${path.relative(process.cwd(), file)}`
        )
        skippedCount++
        continue
      }

      if (
        file.includes('ContextMenuRadix.tsx') &&
        content.includes('console.log(')
      ) {
        // These are example handlers, skip them
        console.log(
          `⏭️  Skipped (example handlers): ${path.relative(process.cwd(), file)}`
        )
        skippedCount++
        continue
      }

      if (replaceInFile(file, dryRun)) {
        updatedCount++
      }
    } catch (error) {
      console.error(`❌ Error processing ${file}:`, error.message)
    }
  }

  console.log('\n=== SUMMARY ===')
  console.log(`Files updated: ${updatedCount}`)
  console.log(`Files skipped: ${skippedCount}`)
  console.log(`Total files scanned: ${files.length}`)

  if (dryRun) {
    console.log('\n💡 Run without --dry-run to apply changes')
  } else {
    console.log('\n✨ Console cleanup complete!')
    console.log(
      '🔍 Run `npm run type-check` to verify no TypeScript errors were introduced'
    )
  }
}

// Run the script
main().catch(console.error)
