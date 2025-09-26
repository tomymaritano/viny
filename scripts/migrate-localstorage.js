#!/usr/bin/env node

/**
 * Script to help migrate localStorage usage to StorageService
 * This script will:
 * 1. Find all localStorage usage
 * 2. Generate migration patches
 * 3. Help identify which files need manual review
 */

const fs = require('fs')
const path = require('path')
const glob = require('glob')

// Common localStorage method patterns
const localStoragePatterns = [
  /localStorage\.getItem\(['"]([^'"]+)['"]\)/g,
  /localStorage\.setItem\(['"]([^'"]+)['"],\s*([^)]+)\)/g,
  /localStorage\.removeItem\(['"]([^'"]+)['"]\)/g,
  /localStorage\.clear\(\)/g,
  /localStorage\.key\(/g,
  /localStorage\.length/g,
]

// Known storage keys mapping
const keyMappings = {
  viny_notes: 'StorageService.KEYS.NOTES',
  viny_notebooks: 'StorageService.KEYS.NOTEBOOKS',
  'viny-settings': 'StorageService.KEYS.SETTINGS',
  viny_tag_colors: 'StorageService.KEYS.TAG_COLORS',
  'viny-images': 'StorageService.KEYS.IMAGES',
  'viny-initialized': 'StorageService.KEYS.INITIALIZED',
  viny_error_reports: 'StorageService.KEYS.ERROR_REPORTS',
  viny_use_dexie: 'StorageService.KEYS.USE_DEXIE',
  viny_analytics: 'StorageService.KEYS.ANALYTICS',
  viny_telemetry: 'StorageService.KEYS.TELEMETRY',
  viny_crash_reports: 'StorageService.KEYS.CRASH_REPORTS',
  viny_search_history: 'StorageService.KEYS.SEARCH_HISTORY',
  viny_security_config: 'StorageService.KEYS.SECURITY_CONFIG',
  viny_settings_backups: 'StorageService.KEYS.SETTINGS_BACKUPS',
  language: 'StorageService.KEYS.LANGUAGE',
  theme: 'StorageService.KEYS.THEME',
  viny_usage_data: 'StorageService.KEYS.USAGE_DATA',
  viny_current_session: 'StorageService.KEYS.CURRENT_SESSION',
  'viny-templates': 'StorageService.KEYS.TEMPLATES',
}

function findLocalStorageUsage(filePath) {
  const content = fs.readFileSync(filePath, 'utf8')
  const issues = []
  const lines = content.split('\n')

  lines.forEach((line, index) => {
    // Skip test files for now
    if (filePath.includes('.test.') || filePath.includes('__tests__')) {
      return
    }

    // Check for localStorage usage
    if (line.includes('localStorage.')) {
      issues.push({
        file: filePath,
        line: index + 1,
        content: line.trim(),
        type: detectLocalStorageMethod(line),
      })
    }
  })

  return issues
}

function detectLocalStorageMethod(line) {
  if (line.includes('localStorage.getItem')) return 'getItem'
  if (line.includes('localStorage.setItem')) return 'setItem'
  if (line.includes('localStorage.removeItem')) return 'removeItem'
  if (line.includes('localStorage.clear')) return 'clear'
  if (line.includes('localStorage.key')) return 'key'
  if (line.includes('localStorage.length')) return 'length'
  return 'unknown'
}

function generateMigrationSuggestion(issue) {
  const { content, type } = issue

  switch (type) {
    case 'getItem': {
      const match = content.match(/localStorage\.getItem\(['"]([^'"]+)['"]\)/)
      if (match) {
        const key = match[1]
        const mappedKey = keyMappings[key] || `'${key}'`
        return `storageService.getItem(${mappedKey})`
      }
      break
    }
    case 'setItem': {
      const match = content.match(
        /localStorage\.setItem\(['"]([^'"]+)['"],\s*(.+)\)/
      )
      if (match) {
        const key = match[1]
        const value = match[2]
        const mappedKey = keyMappings[key] || `'${key}'`
        return `storageService.setItem(${mappedKey}, ${value})`
      }
      break
    }
    case 'removeItem': {
      const match = content.match(
        /localStorage\.removeItem\(['"]([^'"]+)['"]\)/
      )
      if (match) {
        const key = match[1]
        const mappedKey = keyMappings[key] || `'${key}'`
        return `storageService.removeItem(${mappedKey})`
      }
      break
    }
    case 'clear':
      return 'storageService.clear()'
    case 'length':
      return 'storageService.getAllKeys().length'
    case 'key':
      return '// Manual migration needed: storageService.getAllKeys()[index]'
  }

  return '// Manual migration needed'
}

function main() {
  const srcPath = path.join(__dirname, '..', 'src')
  const files = glob.sync('**/*.{ts,tsx,js,jsx}', { cwd: srcPath })

  const allIssues = []

  files.forEach(file => {
    const filePath = path.join(srcPath, file)
    const issues = findLocalStorageUsage(filePath)
    if (issues.length > 0) {
      allIssues.push(...issues)
    }
  })

  // Group by file
  const issuesByFile = {}
  allIssues.forEach(issue => {
    if (!issuesByFile[issue.file]) {
      issuesByFile[issue.file] = []
    }
    issuesByFile[issue.file].push(issue)
  })

  // Generate report
  console.log('# localStorage Migration Report\n')
  console.log(
    `Found ${allIssues.length} localStorage usages in ${Object.keys(issuesByFile).length} files\n`
  )

  // Files that need import
  console.log('## Files needing import:\n')
  console.log('Add this import to the following files:')
  console.log('```typescript')
  console.log(
    "import { storageService, StorageService } from '../services/StorageService'"
  )
  console.log('```\n')

  Object.keys(issuesByFile).forEach(file => {
    console.log(`- ${file.replace(srcPath + '/', '')}`)
  })

  console.log('\n## Migration suggestions by file:\n')

  Object.entries(issuesByFile).forEach(([file, issues]) => {
    console.log(`### ${file.replace(srcPath + '/', '')}\n`)

    issues.forEach(issue => {
      const suggestion = generateMigrationSuggestion(issue)
      console.log(`Line ${issue.line}: ${issue.type}`)
      console.log(`Current:    ${issue.content}`)
      console.log(`Suggested:  ${suggestion}`)
      console.log()
    })
  })

  // Summary
  const typeCounts = {}
  allIssues.forEach(issue => {
    typeCounts[issue.type] = (typeCounts[issue.type] || 0) + 1
  })

  console.log('\n## Summary by method:\n')
  Object.entries(typeCounts).forEach(([type, count]) => {
    console.log(`- ${type}: ${count}`)
  })

  // Export to JSON for further processing
  const report = {
    totalIssues: allIssues.length,
    fileCount: Object.keys(issuesByFile).length,
    typeCounts,
    issuesByFile: Object.entries(issuesByFile).map(([file, issues]) => ({
      file: file.replace(srcPath + '/', ''),
      count: issues.length,
      issues: issues.map(issue => ({
        line: issue.line,
        type: issue.type,
        content: issue.content,
        suggestion: generateMigrationSuggestion(issue),
      })),
    })),
  }

  fs.writeFileSync(
    path.join(__dirname, '..', 'localStorage-migration-report.json'),
    JSON.stringify(report, null, 2)
  )

  console.log('\nReport saved to localStorage-migration-report.json')
}

main()
