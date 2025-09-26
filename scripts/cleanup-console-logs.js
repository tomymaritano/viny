#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const glob = require('glob')

// Patterns to identify different types of console statements
const patterns = {
  error: /console\.error\(/g,
  warn: /console\.warn\(/g,
  log: /console\.log\(/g,
  info: /console\.info\(/g,
  debug: /console\.debug\(/g,
}

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

// Function to analyze console statements in a file
function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8')
  const results = []

  for (const [type, pattern] of Object.entries(patterns)) {
    let match
    const regex = new RegExp(pattern)
    while ((match = regex.exec(content)) !== null) {
      const lineNumber = content.substring(0, match.index).split('\n').length
      const line = content.split('\n')[lineNumber - 1]
      results.push({
        file: filePath,
        line: lineNumber,
        type,
        content: line.trim(),
        logger: getLogger(filePath),
      })
    }
  }

  return results
}

// Main function
async function main() {
  console.log('Analyzing console statements in src/ directory...\n')

  const files = glob.sync('src/**/*.{ts,tsx,js,jsx}', {
    ignore: excludePatterns,
  })

  let allResults = []

  for (const file of files) {
    const results = analyzeFile(file)
    if (results.length > 0) {
      allResults = allResults.concat(results)
    }
  }

  // Group by type
  const byType = {}
  for (const result of allResults) {
    if (!byType[result.type]) {
      byType[result.type] = []
    }
    byType[result.type].push(result)
  }

  // Print summary
  console.log('=== CONSOLE STATEMENT SUMMARY ===\n')
  console.log(`Total console statements found: ${allResults.length}`)
  console.log(`Files affected: ${new Set(allResults.map(r => r.file)).size}\n`)

  for (const [type, results] of Object.entries(byType)) {
    console.log(`${type.toUpperCase()}: ${results.length} occurrences`)
  }

  // Generate replacement suggestions
  console.log('\n=== REPLACEMENT SUGGESTIONS ===\n')

  const fileGroups = {}
  for (const result of allResults) {
    if (!fileGroups[result.file]) {
      fileGroups[result.file] = []
    }
    fileGroups[result.file].push(result)
  }

  // Output file with replacements
  const outputPath = path.join(process.cwd(), 'console-cleanup-report.md')
  let report = '# Console Cleanup Report\n\n'
  report += `Generated: ${new Date().toISOString()}\n\n`
  report += `## Summary\n\n`
  report += `- Total console statements: ${allResults.length}\n`
  report += `- Files affected: ${Object.keys(fileGroups).length}\n\n`

  report += `## Files to Update\n\n`

  for (const [file, results] of Object.entries(fileGroups)) {
    const relPath = path.relative(process.cwd(), file)
    report += `### ${relPath}\n\n`
    report += `Suggested logger: \`import { ${getLogger(file)} } from '../utils/logger'\`\n\n`

    for (const result of results) {
      report += `**Line ${result.line}** (${result.type}):\n`
      report += '```typescript\n'
      report += `// Current:\n${result.content}\n\n`

      // Generate replacement
      let replacement = result.content
      if (result.type === 'error') {
        replacement = replacement.replace(
          /console\.error\(/,
          `${result.logger}.error(`
        )
      } else if (result.type === 'warn') {
        replacement = replacement.replace(
          /console\.warn\(/,
          `${result.logger}.warn(`
        )
      } else if (result.type === 'log') {
        replacement = replacement.replace(
          /console\.log\(/,
          `${result.logger}.info(`
        )
      } else if (result.type === 'info') {
        replacement = replacement.replace(
          /console\.info\(/,
          `${result.logger}.info(`
        )
      } else if (result.type === 'debug') {
        replacement = replacement.replace(
          /console\.debug\(/,
          `${result.logger}.debug(`
        )
      }

      report += `// Suggested:\n${replacement}\n`
      report += '```\n\n'
    }
    report += '---\n\n'
  }

  fs.writeFileSync(outputPath, report)
  console.log(`\nDetailed report written to: ${outputPath}`)

  // Print quick stats
  console.log('\n=== QUICK FIXES ===\n')
  console.log('Files with the most console statements:')
  const topFiles = Object.entries(fileGroups)
    .map(([file, results]) => ({
      file: path.relative(process.cwd(), file),
      count: results.length,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  for (const { file, count } of topFiles) {
    console.log(`  ${file}: ${count} statements`)
  }
}

// Run the script
main().catch(console.error)
