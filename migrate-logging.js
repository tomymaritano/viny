#!/usr/bin/env node
/**
 * Migration script to replace console.log statements with proper logger usage
 * This script helps automate the cleanup of console statements for production
 */

const fs = require('fs')
const path = require('path')
const glob = require('glob')

// Configuration
const sourceDir = './src'
const excludePatterns = [
  '**/node_modules/**',
  '**/*.test.ts',
  '**/*.test.tsx',
  '**/*.spec.ts',
  '**/*.spec.tsx',
  '**/migrate-logging.js',
]

// Replacement patterns
const replacements = [
  {
    pattern: /console\.log\((.*)\)/g,
    replacement: 'logger.debug($1)',
    description: 'Replace console.log with logger.debug',
  },
  {
    pattern: /console\.info\((.*)\)/g,
    replacement: 'logger.info($1)',
    description: 'Replace console.info with logger.info',
  },
  {
    pattern: /console\.warn\((.*)\)/g,
    replacement: 'logger.warn($1)',
    description: 'Replace console.warn with logger.warn',
  },
  {
    pattern: /console\.error\((.*)\)/g,
    replacement: 'logger.error($1)',
    description: 'Replace console.error with logger.error',
  },
]

// Import patterns to add
const importPatterns = [
  {
    // For files that use general logging
    pattern: /logger\.(debug|info|warn|error)/,
    import: "import { logger } from '../utils/logger'",
  },
  {
    // For specific module loggers
    pattern: /initLogger|storageLogger|noteLogger|sidebarLogger/,
    import:
      "import { initLogger, storageLogger, noteLogger, sidebarLogger } from '../utils/logger'",
  },
]

function findTSFiles() {
  const patterns = [
    path.join(sourceDir, '**/*.ts'),
    path.join(sourceDir, '**/*.tsx'),
  ]

  let files = []
  patterns.forEach(pattern => {
    files = files.concat(
      glob.sync(pattern, {
        ignore: excludePatterns,
        absolute: true,
      })
    )
  })

  return [...new Set(files)] // Remove duplicates
}

function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8')
  const issues = []

  replacements.forEach(({ pattern, description }) => {
    const matches = content.match(pattern)
    if (matches) {
      issues.push({
        type: 'console-usage',
        description,
        count: matches.length,
        lines: getLineNumbers(content, pattern),
      })
    }
  })

  return {
    path: filePath,
    hasIssues: issues.length > 0,
    issues,
  }
}

function getLineNumbers(content, pattern) {
  const lines = content.split('\n')
  const lineNumbers = []

  lines.forEach((line, index) => {
    if (pattern.test(line)) {
      lineNumbers.push(index + 1)
    }
  })

  return lineNumbers
}

function migrateFile(filePath, dryRun = false) {
  let content = fs.readFileSync(filePath, 'utf8')
  let modified = false
  const changes = []

  // Apply replacements
  replacements.forEach(({ pattern, replacement, description }) => {
    const beforeCount = (content.match(pattern) || []).length
    if (beforeCount > 0) {
      content = content.replace(pattern, replacement)
      modified = true
      changes.push({
        description,
        count: beforeCount,
      })
    }
  })

  // Add import if needed and not already present
  if (modified && !content.includes("from '../utils/logger'")) {
    const importToAdd = "import { logger } from '../utils/logger'"

    // Find the right place to insert the import
    const lines = content.split('\n')
    let insertIndex = 0

    // Find last import statement
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('import ')) {
        insertIndex = i + 1
      }
    }

    lines.splice(insertIndex, 0, importToAdd)
    content = lines.join('\n')
  }

  if (modified && !dryRun) {
    fs.writeFileSync(filePath, content, 'utf8')
  }

  return {
    modified,
    changes,
    newContent: content,
  }
}

function generateReport() {
  console.log('🔍 Analyzing TypeScript files for console usage...\n')

  const files = findTSFiles()
  const issues = []
  let totalIssues = 0

  files.forEach(file => {
    const analysis = analyzeFile(file)
    if (analysis.hasIssues) {
      issues.push(analysis)
      totalIssues += analysis.issues.reduce(
        (sum, issue) => sum + issue.count,
        0
      )
    }
  })

  // Generate report
  console.log(`📊 Console Usage Report`)
  console.log(`========================`)
  console.log(`Files analyzed: ${files.length}`)
  console.log(`Files with issues: ${issues.length}`)
  console.log(`Total console statements: ${totalIssues}\n`)

  if (issues.length > 0) {
    console.log('📋 Files with console usage:\n')

    issues.forEach(({ path, issues: fileIssues }) => {
      const relativePath = path.replace(process.cwd(), '.')
      console.log(`📁 ${relativePath}`)

      fileIssues.forEach(issue => {
        console.log(`   ${issue.description}: ${issue.count} occurrence(s)`)
        console.log(`   Lines: ${issue.lines.join(', ')}`)
      })
      console.log()
    })
  }

  return { files, issues, totalIssues }
}

function runMigration(dryRun = false) {
  console.log(
    `🚀 ${dryRun ? 'Simulating' : 'Running'} console logging migration...\n`
  )

  const files = findTSFiles()
  const results = []

  files.forEach(file => {
    const result = migrateFile(file, dryRun)
    if (result.modified) {
      results.push({
        file,
        ...result,
      })
    }
  })

  // Generate migration report
  console.log(`✅ Migration ${dryRun ? 'simulation' : 'completed'}!`)
  console.log(`Files processed: ${files.length}`)
  console.log(`Files modified: ${results.length}\n`)

  if (results.length > 0) {
    console.log('📝 Modified files:\n')

    results.forEach(({ file, changes }) => {
      const relativePath = file.replace(process.cwd(), '.')
      console.log(`📁 ${relativePath}`)

      changes.forEach(change => {
        console.log(`   ✨ ${change.description}: ${change.count} replacements`)
      })
      console.log()
    })
  }

  if (!dryRun && results.length > 0) {
    console.log(
      '🎉 All console statements have been migrated to use the logger utility!'
    )
    console.log('📝 Remember to import the logger in files that need it.')
  }
}

// CLI interface
const command = process.argv[2]

switch (command) {
  case 'report':
    generateReport()
    break

  case 'migrate':
    runMigration(false)
    break

  case 'dry-run':
    runMigration(true)
    break

  default:
    console.log('📝 Console Logging Migration Tool')
    console.log('==================================')
    console.log('')
    console.log('Usage:')
    console.log('  node migrate-logging.js report   - Analyze console usage')
    console.log('  node migrate-logging.js dry-run  - Simulate migration')
    console.log('  node migrate-logging.js migrate  - Run migration')
    console.log('')
    console.log('This tool helps migrate console.log statements to use the')
    console.log('conditional logger utility for production-ready code.')
    break
}
