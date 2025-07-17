#!/usr/bin/env node

/**
 * Viny App Branding Fix Script
 * Automatically converts "nototo" references to "Viny" throughout the codebase
 *
 * Usage: node scripts/fix-branding.js
 */

const fs = require('fs')
const path = require('path')

// Configuration
const REPLACEMENTS = [
  // App names and branding
  { from: /nototo/g, to: 'viny' },
  { from: /Nototo/g, to: 'Viny' },
  { from: /NOTOTO/g, to: 'VINY' },

  // Domain and URLs
  { from: /nototo\.com/g, to: 'viny.app' },
  { from: /nototo-app/g, to: 'viny-app' },
  { from: /nototo-landing/g, to: 'viny-landing' },
  { from: /nototo-docs/g, to: 'viny-docs' },
  { from: /nototo-dashboard/g, to: 'viny-dashboard' },
  { from: /nototo-mobile/g, to: 'viny-mobile' },

  // Package and identifiers
  { from: /@nototo\//g, to: '@viny/' },
  { from: /com\.nototo\./g, to: 'com.viny.' },

  // Special cases - keep some technical references
  // (Add exclusions here if needed)
]

// Files to process
const INCLUDE_EXTENSIONS = [
  '.js',
  '.jsx',
  '.ts',
  '.tsx',
  '.json',
  '.md',
  '.html',
  '.css',
  '.scss',
  '.yml',
  '.yaml',
  '.xml',
  '.txt',
  '.config',
  '.env',
]

// Directories to exclude
const EXCLUDE_DIRS = [
  'node_modules',
  '.git',
  'dist',
  'dist-electron',
  'build',
  'coverage',
  'test-results',
  'playwright-report',
  '.vscode',
  '.idea',
  'logs',
]

// Files to exclude
const EXCLUDE_FILES = [
  'package-lock.json',
  'yarn.lock',
  'fix-branding.js', // Don't modify this script itself
]

class BrandingFixer {
  constructor() {
    this.changedFiles = []
    this.totalReplacements = 0
    this.errors = []
  }

  shouldProcessFile(filePath) {
    const fileName = path.basename(filePath)
    const ext = path.extname(filePath)

    // Check if file should be excluded
    if (EXCLUDE_FILES.includes(fileName)) return false

    // Check if extension should be included
    if (!INCLUDE_EXTENSIONS.includes(ext)) return false

    // Check if any parent directory should be excluded
    const pathParts = filePath.split(path.sep)
    for (const excludeDir of EXCLUDE_DIRS) {
      if (pathParts.includes(excludeDir)) return false
    }

    return true
  }

  processFile(filePath) {
    try {
      if (!fs.existsSync(filePath)) return

      const stats = fs.statSync(filePath)
      if (!stats.isFile()) return

      if (!this.shouldProcessFile(filePath)) return

      let content = fs.readFileSync(filePath, 'utf8')
      let modified = false
      let fileReplacements = 0

      // Apply all replacements
      for (const replacement of REPLACEMENTS) {
        const originalContent = content
        content = content.replace(replacement.from, replacement.to)

        if (content !== originalContent) {
          modified = true
          // Count replacements
          const matches = originalContent.match(replacement.from)
          if (matches) {
            fileReplacements += matches.length
          }
        }
      }

      // Write back if modified
      if (modified) {
        fs.writeFileSync(filePath, content, 'utf8')
        this.changedFiles.push({
          path: filePath,
          replacements: fileReplacements,
        })
        this.totalReplacements += fileReplacements
        console.log(`✅ Fixed: ${filePath} (${fileReplacements} replacements)`)
      }
    } catch (error) {
      this.errors.push({ path: filePath, error: error.message })
      console.error(`❌ Error processing ${filePath}:`, error.message)
    }
  }

  processDirectory(dirPath) {
    try {
      const entries = fs.readdirSync(dirPath)

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry)
        const stats = fs.statSync(fullPath)

        if (stats.isDirectory()) {
          // Skip excluded directories
          if (!EXCLUDE_DIRS.includes(entry)) {
            this.processDirectory(fullPath)
          }
        } else if (stats.isFile()) {
          this.processFile(fullPath)
        }
      }
    } catch (error) {
      this.errors.push({ path: dirPath, error: error.message })
      console.error(`❌ Error processing directory ${dirPath}:`, error.message)
    }
  }

  run() {
    console.log('🔧 Viny App Branding Fix - Starting...\n')

    const rootDir = path.resolve(__dirname, '..')
    console.log(`📁 Processing directory: ${rootDir}\n`)

    this.processDirectory(rootDir)

    console.log('\n📊 Branding Fix Results:')
    console.log(`✅ Files modified: ${this.changedFiles.length}`)
    console.log(`🔄 Total replacements: ${this.totalReplacements}`)

    if (this.errors.length > 0) {
      console.log(`❌ Errors: ${this.errors.length}`)
      this.errors.forEach(error => {
        console.log(`   - ${error.path}: ${error.error}`)
      })
    }

    if (this.changedFiles.length > 0) {
      console.log('\n📝 Modified files:')
      this.changedFiles.forEach(file => {
        console.log(`   - ${file.path} (${file.replacements} changes)`)
      })
    }

    console.log('\n🎉 Branding fix completed!')
    console.log('📋 Next steps:')
    console.log('   1. Review the changes with: git diff')
    console.log('   2. Test the application thoroughly')
    console.log('   3. Commit the changes if everything looks good')

    return {
      success: this.errors.length === 0,
      filesChanged: this.changedFiles.length,
      totalReplacements: this.totalReplacements,
      errors: this.errors,
    }
  }
}

// Run the script
if (require.main === module) {
  const fixer = new BrandingFixer()
  const result = fixer.run()

  process.exit(result.success ? 0 : 1)
}

module.exports = BrandingFixer
