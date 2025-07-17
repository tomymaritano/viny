#!/usr/bin/env node

/**
 * Visual Testing Utilities
 * Helper scripts for managing visual test snapshots
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const SNAPSHOT_DIR = path.join(__dirname, '../test-results')
const E2E_DIR = path.join(__dirname, '../e2e')

/**
 * Commands available
 */
const commands = {
  'update-snapshots': updateSnapshots,
  'clean-snapshots': cleanSnapshots,
  'compare-snapshots': compareSnapshots,
  'generate-report': generateReport,
  help: showHelp,
}

/**
 * Update visual snapshots
 */
function updateSnapshots() {
  console.log('🔄 Updating visual test snapshots...')

  try {
    execSync(
      'npx playwright test e2e/tests/visual-regression.spec.ts --update-snapshots',
      {
        stdio: 'inherit',
        env: { ...process.env, UPDATE_SNAPSHOTS: 'true' },
      }
    )
    console.log('✅ Snapshots updated successfully')
  } catch (error) {
    console.error('❌ Failed to update snapshots:', error.message)
    process.exit(1)
  }
}

/**
 * Clean old snapshots
 */
function cleanSnapshots() {
  console.log('🧹 Cleaning old visual test snapshots...')

  const snapshotDirs = [
    path.join(E2E_DIR, 'tests/visual-regression.spec.ts-snapshots'),
    path.join(__dirname, '../test-results/visual-regression'),
  ]

  snapshotDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true })
      console.log(`🗑️  Removed: ${dir}`)
    }
  })

  console.log('✅ Snapshot cleanup completed')
}

/**
 * Compare snapshots and generate diff report
 */
function compareSnapshots() {
  console.log('🔍 Comparing visual test snapshots...')

  try {
    execSync(
      'npx playwright test e2e/tests/visual-regression.spec.ts --reporter=html',
      {
        stdio: 'inherit',
      }
    )
    console.log('✅ Visual comparison completed - check HTML report')
  } catch (error) {
    console.log(
      '⚠️  Visual differences detected - check HTML report for details'
    )
  }
}

/**
 * Generate visual test report
 */
function generateReport() {
  console.log('📊 Generating visual test report...')

  const reportPath = path.join(__dirname, '../visual-test-report.md')
  let report = '# Visual Test Report\n\n'
  report += `Generated: ${new Date().toISOString()}\n\n`

  // Find snapshot directories
  const snapshotDir = path.join(
    E2E_DIR,
    'tests/visual-regression.spec.ts-snapshots'
  )

  if (fs.existsSync(snapshotDir)) {
    const browsers = fs.readdirSync(snapshotDir)

    report += '## Browser Coverage\n\n'
    browsers.forEach(browser => {
      const browserDir = path.join(snapshotDir, browser)
      if (fs.statSync(browserDir).isDirectory()) {
        const screenshots = fs
          .readdirSync(browserDir)
          .filter(f => f.endsWith('.png'))
        report += `- **${browser}**: ${screenshots.length} screenshots\n`
      }
    })

    report += '\n## Screenshots by Category\n\n'

    // Categorize screenshots
    const categories = {
      'Main Interface': [],
      'Note Editor': [],
      Search: [],
      Modals: [],
      Themes: [],
      Responsive: [],
      Other: [],
    }

    browsers.forEach(browser => {
      const browserDir = path.join(snapshotDir, browser)
      if (fs.existsSync(browserDir)) {
        const screenshots = fs
          .readdirSync(browserDir)
          .filter(f => f.endsWith('.png'))

        screenshots.forEach(screenshot => {
          let categorized = false

          if (
            screenshot.includes('main-application') ||
            screenshot.includes('sidebar')
          ) {
            categories['Main Interface'].push(`${browser}/${screenshot}`)
            categorized = true
          }
          if (screenshot.includes('editor') || screenshot.includes('note-')) {
            categories['Note Editor'].push(`${browser}/${screenshot}`)
            categorized = true
          }
          if (screenshot.includes('search')) {
            categories['Search'].push(`${browser}/${screenshot}`)
            categorized = true
          }
          if (screenshot.includes('modal') || screenshot.includes('settings')) {
            categories['Modals'].push(`${browser}/${screenshot}`)
            categorized = true
          }
          if (
            screenshot.includes('theme') ||
            screenshot.includes('light') ||
            screenshot.includes('dark')
          ) {
            categories['Themes'].push(`${browser}/${screenshot}`)
            categorized = true
          }
          if (
            screenshot.includes('mobile') ||
            screenshot.includes('tablet') ||
            screenshot.includes('responsive')
          ) {
            categories['Responsive'].push(`${browser}/${screenshot}`)
            categorized = true
          }

          if (!categorized) {
            categories['Other'].push(`${browser}/${screenshot}`)
          }
        })
      }
    })

    Object.entries(categories).forEach(([category, screenshots]) => {
      if (screenshots.length > 0) {
        report += `### ${category}\n\n`
        screenshots.forEach(screenshot => {
          report += `- ${screenshot}\n`
        })
        report += '\n'
      }
    })
  } else {
    report += '⚠️ No snapshots found. Run visual tests first.\n\n'
  }

  // Add usage instructions
  report += '## Usage\n\n'
  report += '```bash\n'
  report += '# Run visual tests\n'
  report += 'npm run test:visual\n\n'
  report += '# Update snapshots\n'
  report += 'npm run test:visual:update\n\n'
  report += '# Clean snapshots\n'
  report += 'node scripts/visual-test-utils.js clean-snapshots\n'
  report += '```\n\n'

  fs.writeFileSync(reportPath, report)
  console.log(`✅ Report generated: ${reportPath}`)
}

/**
 * Show help
 */
function showHelp() {
  console.log(`
Visual Test Utilities

Usage: node scripts/visual-test-utils.js <command>

Commands:
  update-snapshots    Update all visual test snapshots
  clean-snapshots     Remove all existing snapshots
  compare-snapshots   Run visual comparison tests
  generate-report     Generate visual test coverage report
  help               Show this help message

Examples:
  node scripts/visual-test-utils.js update-snapshots
  node scripts/visual-test-utils.js clean-snapshots
  node scripts/visual-test-utils.js generate-report
  `)
}

/**
 * Main execution
 */
function main() {
  const command = process.argv[2]

  if (!command || !commands[command]) {
    console.error('❌ Invalid or missing command')
    showHelp()
    process.exit(1)
  }

  commands[command]()
}

// Run if called directly
if (require.main === module) {
  main()
}

module.exports = {
  updateSnapshots,
  cleanSnapshots,
  compareSnapshots,
  generateReport,
}
