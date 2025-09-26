#!/usr/bin/env node

/**
 * Batch migration script for common localStorage patterns
 * This will automatically update simple localStorage calls
 */

const fs = require('fs')
const path = require('path')
const glob = require('glob')

// Files to skip
const skipFiles = [
  'StorageService.ts',
  'StorageRecoveryService.ts',
  'StorageMigrationService.ts',
  'LocalStorageMigrationRepository.ts',
  '.test.',
  '__tests__',
  '.backup',
]

// Simple replacements that can be done automatically
const simpleReplacements = [
  // Direct key replacements
  {
    pattern: /localStorage\.getItem\(['"]viny_notes['"]\)/g,
    replacement: 'storageService.getItem(StorageService.KEYS.NOTES)',
  },
  {
    pattern: /localStorage\.getItem\(['"]viny_notebooks['"]\)/g,
    replacement: 'storageService.getItem(StorageService.KEYS.NOTEBOOKS)',
  },
  {
    pattern: /localStorage\.getItem\(['"]viny-settings['"]\)/g,
    replacement: 'storageService.getItem(StorageService.KEYS.SETTINGS)',
  },
  {
    pattern: /localStorage\.getItem\(['"]viny_tag_colors['"]\)/g,
    replacement: 'storageService.getItem(StorageService.KEYS.TAG_COLORS)',
  },
  {
    pattern: /localStorage\.getItem\(['"]viny-images['"]\)/g,
    replacement: 'storageService.getItem(StorageService.KEYS.IMAGES)',
  },
  {
    pattern: /localStorage\.getItem\(['"]viny-initialized['"]\)/g,
    replacement: 'storageService.getItem(StorageService.KEYS.INITIALIZED)',
  },
  {
    pattern: /localStorage\.getItem\(['"]viny_error_reports['"]\)/g,
    replacement: 'storageService.getItem(StorageService.KEYS.ERROR_REPORTS)',
  },
  {
    pattern: /localStorage\.getItem\(['"]viny_use_dexie['"]\)/g,
    replacement: 'storageService.getItem(StorageService.KEYS.USE_DEXIE)',
  },
  // setItem patterns
  {
    pattern: /localStorage\.setItem\(['"]viny-settings['"],/g,
    replacement: 'storageService.setItem(StorageService.KEYS.SETTINGS,',
  },
  {
    pattern: /localStorage\.setItem\(['"]viny-initialized['"],/g,
    replacement: 'storageService.setItem(StorageService.KEYS.INITIALIZED,',
  },
  {
    pattern: /localStorage\.setItem\(['"]viny_error_reports['"],/g,
    replacement: 'storageService.setItem(StorageService.KEYS.ERROR_REPORTS,',
  },
  {
    pattern: /localStorage\.setItem\(['"]viny_use_dexie['"],/g,
    replacement: 'storageService.setItem(StorageService.KEYS.USE_DEXIE,',
  },
  // removeItem patterns
  {
    pattern: /localStorage\.removeItem\(['"]viny-initialized['"]\)/g,
    replacement: 'storageService.removeItem(StorageService.KEYS.INITIALIZED)',
  },
  {
    pattern: /localStorage\.removeItem\(['"]viny_analytics['"]\)/g,
    replacement: 'storageService.removeItem(StorageService.KEYS.ANALYTICS)',
  },
  {
    pattern: /localStorage\.removeItem\(['"]viny_telemetry['"]\)/g,
    replacement: 'storageService.removeItem(StorageService.KEYS.TELEMETRY)',
  },
  {
    pattern: /localStorage\.removeItem\(['"]viny_crash_reports['"]\)/g,
    replacement: 'storageService.removeItem(StorageService.KEYS.CRASH_REPORTS)',
  },
  // Simple methods
  {
    pattern: /localStorage\.clear\(\)/g,
    replacement: 'storageService.clear()',
  },
]

function shouldSkipFile(filePath) {
  return skipFiles.some(skip => filePath.includes(skip))
}

function addImportIfNeeded(content, filePath) {
  // Check if file already imports storageService
  if (
    content.includes('storageService') ||
    content.includes('StorageService') ||
    !content.includes('localStorage.')
  ) {
    return content
  }

  // Calculate relative path to StorageService
  const fileDir = path.dirname(filePath)
  const srcPath = path.join(__dirname, '..', 'src')
  const relativePath = path.relative(
    fileDir,
    path.join(srcPath, 'services', 'StorageService')
  )
  const importPath = relativePath.startsWith('.')
    ? relativePath
    : './' + relativePath

  // Add import after the last import statement
  const importStatement = `import { storageService, StorageService } from '${importPath.replace(/\\/g, '/')}'`

  // Find the last import line
  const lines = content.split('\n')
  let lastImportIndex = -1

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('import ')) {
      lastImportIndex = i
    }
  }

  if (lastImportIndex >= 0) {
    lines.splice(lastImportIndex + 1, 0, importStatement)
  } else {
    // No imports found, add at the top
    lines.unshift(importStatement)
  }

  return lines.join('\n')
}

function migrateFile(filePath) {
  if (shouldSkipFile(filePath)) {
    return { skipped: true }
  }

  let content = fs.readFileSync(filePath, 'utf8')
  const originalContent = content
  let changeCount = 0

  // Apply simple replacements
  simpleReplacements.forEach(({ pattern, replacement }) => {
    const matches = content.match(pattern)
    if (matches) {
      changeCount += matches.length
      content = content.replace(pattern, replacement)
    }
  })

  if (changeCount > 0) {
    // Add import if needed
    content = addImportIfNeeded(content, filePath)

    // Write the file
    fs.writeFileSync(filePath, content, 'utf8')

    return {
      migrated: true,
      changeCount,
      file: filePath.replace(path.join(__dirname, '..', 'src') + '/', ''),
    }
  }

  return { migrated: false }
}

function main() {
  console.log('Starting batch localStorage migration...\n')

  const srcPath = path.join(__dirname, '..', 'src')
  const files = glob.sync('**/*.{ts,tsx,js,jsx}', { cwd: srcPath })

  const results = {
    migrated: [],
    skipped: [],
    unchanged: [],
  }

  files.forEach(file => {
    const filePath = path.join(srcPath, file)
    const result = migrateFile(filePath)

    if (result.skipped) {
      results.skipped.push(file)
    } else if (result.migrated) {
      results.migrated.push(result)
    } else {
      results.unchanged.push(file)
    }
  })

  // Report results
  console.log(`✅ Migrated ${results.migrated.length} files:`)
  results.migrated.forEach(({ file, changeCount }) => {
    console.log(`   - ${file} (${changeCount} changes)`)
  })

  console.log(`\n⏭️  Skipped ${results.skipped.length} files`)
  console.log(`\n➖ No changes needed in ${results.unchanged.length} files`)

  const totalChanges = results.migrated.reduce(
    (sum, r) => sum + r.changeCount,
    0
  )
  console.log(`\n📊 Total: ${totalChanges} localStorage calls migrated`)

  // Save detailed report
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      filesModified: results.migrated.length,
      totalChanges: totalChanges,
      filesSkipped: results.skipped.length,
    },
    migrated: results.migrated,
  }

  fs.writeFileSync(
    path.join(__dirname, '..', 'batch-migration-report.json'),
    JSON.stringify(report, null, 2)
  )

  console.log('\nDetailed report saved to batch-migration-report.json')
}

main()
