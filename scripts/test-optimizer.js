#!/usr/bin/env node

/**
 * Test Execution Optimizer
 * Intelligent test execution with prioritization and performance optimization
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

// Test categories and their priorities
const TEST_CATEGORIES = {
  smoke: {
    priority: 1,
    timeout: 30000,
    pattern: '**/smoke*.spec.ts',
    description: 'Quick smoke tests for basic functionality',
  },
  core: {
    priority: 2,
    timeout: 60000,
    pattern: '**/note-management.spec.ts',
    description: 'Core application functionality',
  },
  ui: {
    priority: 3,
    timeout: 90000,
    pattern: '**/visual-regression.spec.ts',
    description: 'Visual regression and UI tests',
  },
  accessibility: {
    priority: 4,
    timeout: 90000,
    pattern: '**/accessibility.spec.ts',
    description: 'Accessibility and keyboard navigation',
  },
  workflows: {
    priority: 5,
    timeout: 120000,
    pattern: '**/user-workflows.spec.ts',
    description: 'End-to-end user workflows',
  },
  organization: {
    priority: 6,
    timeout: 60000,
    pattern: '**/organization.spec.ts',
    description: 'Organization features (notebooks, tags)',
  },
  errors: {
    priority: 7,
    timeout: 60000,
    pattern: '**/error-states.spec.ts',
    description: 'Error handling and edge cases',
  },
}

const EXECUTION_STRATEGIES = {
  fast: {
    description: 'Run only smoke and core tests',
    categories: ['smoke', 'core'],
    parallel: true,
    retries: 1,
  },
  standard: {
    description: 'Run core functionality tests',
    categories: ['smoke', 'core', 'accessibility', 'organization'],
    parallel: true,
    retries: 2,
  },
  comprehensive: {
    description: 'Run all tests except visual regression',
    categories: [
      'smoke',
      'core',
      'accessibility',
      'workflows',
      'organization',
      'errors',
    ],
    parallel: true,
    retries: 2,
  },
  full: {
    description: 'Run complete test suite including visual tests',
    categories: Object.keys(TEST_CATEGORIES),
    parallel: true,
    retries: 3,
  },
  'visual-only': {
    description: 'Run only visual regression tests',
    categories: ['ui'],
    parallel: false, // Visual tests are better sequential for consistency
    retries: 1,
  },
  ci: {
    description: 'Optimized for CI environment',
    categories: ['smoke', 'core', 'accessibility', 'organization', 'errors'],
    parallel: true,
    retries: 3,
  },
}

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2)
  const options = {
    strategy: 'standard',
    browser: 'all',
    headed: false,
    debug: false,
    updateSnapshots: false,
    grep: null,
    maxFailures: null,
    workers: null,
    help: false,
  }

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    const nextArg = args[i + 1]

    switch (arg) {
      case '--strategy':
      case '-s':
        options.strategy = nextArg
        i++
        break
      case '--browser':
      case '-b':
        options.browser = nextArg
        i++
        break
      case '--headed':
        options.headed = true
        break
      case '--debug':
        options.debug = true
        break
      case '--update-snapshots':
        options.updateSnapshots = true
        break
      case '--grep':
      case '-g':
        options.grep = nextArg
        i++
        break
      case '--max-failures':
        options.maxFailures = parseInt(nextArg)
        i++
        break
      case '--workers':
      case '-j':
        options.workers = parseInt(nextArg)
        i++
        break
      case '--help':
      case '-h':
        options.help = true
        break
    }
  }

  return options
}

/**
 * Show help information
 */
function showHelp() {
  console.log(`
Test Execution Optimizer

Usage: node scripts/test-optimizer.js [options]

Options:
  -s, --strategy <strategy>     Test execution strategy
  -b, --browser <browser>       Browser to run tests on (chromium|firefox|webkit|all)
  --headed                      Run tests in headed mode
  --debug                       Run tests in debug mode
  --update-snapshots           Update visual test snapshots
  -g, --grep <pattern>         Run tests matching pattern
  --max-failures <number>      Stop after N failures
  -j, --workers <number>       Number of parallel workers
  -h, --help                   Show this help

Strategies:
${Object.entries(EXECUTION_STRATEGIES)
  .map(([name, config]) => `  ${name.padEnd(15)} ${config.description}`)
  .join('\n')}

Examples:
  node scripts/test-optimizer.js --strategy fast
  node scripts/test-optimizer.js --strategy comprehensive --browser chromium
  node scripts/test-optimizer.js --strategy visual-only --update-snapshots
  node scripts/test-optimizer.js --strategy ci --max-failures 5
  `)
}

/**
 * Resolve test files from categories
 */
function resolveTestFiles(categories) {
  const path = require('path')

  const testFiles = []
  const e2eDir = path.join(__dirname, '../e2e/tests')

  for (const category of categories) {
    const testCategory = TEST_CATEGORIES[category]
    if (!testCategory) continue

    // Handle different patterns
    let pattern = testCategory.pattern

    // Convert glob pattern to actual file search
    if (pattern.includes('**/smoke*.spec.ts')) {
      // Look for smoke tests - if none exist, use basic tests
      const smokeFile = path.join(e2eDir, 'smoke.spec.ts')
      if (fs.existsSync(smokeFile)) {
        testFiles.push(smokeFile)
      } else {
        // Fallback to app-initialization for smoke tests
        const fallbackFile = path.join(e2eDir, 'app-initialization.spec.ts')
        if (fs.existsSync(fallbackFile)) {
          testFiles.push(fallbackFile)
        }
      }
    } else if (pattern.includes('**/')) {
      // Remove ** prefix and search directly
      const fileName = pattern.replace('**/', '')
      const fullPath = path.join(e2eDir, fileName)
      if (fs.existsSync(fullPath)) {
        testFiles.push(fullPath)
      }
    } else {
      // Direct file reference
      const fullPath = path.join(e2eDir, pattern)
      if (fs.existsSync(fullPath)) {
        testFiles.push(fullPath)
      }
    }
  }

  // Remove duplicates and return relative paths
  const uniqueFiles = [...new Set(testFiles)]
  return uniqueFiles.map(file => path.relative(process.cwd(), file))
}

/**
 * Build Playwright command based on options
 */
function buildPlaywrightCommand(options) {
  const strategy = EXECUTION_STRATEGIES[options.strategy]

  if (!strategy) {
    throw new Error(`Unknown strategy: ${options.strategy}`)
  }

  let cmd = 'npx playwright test'

  // Add test files based on strategy
  if (strategy.categories.length > 0) {
    const testFiles = resolveTestFiles(strategy.categories)

    if (testFiles.length === 0) {
      throw new Error(`No test files found for strategy: ${options.strategy}`)
    }

    cmd += ` ${testFiles.join(' ')}`
  }

  // Browser selection
  if (options.browser !== 'all') {
    cmd += ` --project=${options.browser}`
  }

  // Execution mode
  if (options.headed) {
    cmd += ' --headed'
  }

  if (options.debug) {
    cmd += ' --debug'
  }

  // Snapshots
  if (options.updateSnapshots) {
    cmd += ' --update-snapshots'
  }

  // Filtering
  if (options.grep) {
    cmd += ` --grep "${options.grep}"`
  }

  // Failure handling
  if (options.maxFailures) {
    cmd += ` --max-failures=${options.maxFailures}`
  }

  // Worker configuration
  if (options.workers) {
    cmd += ` --workers=${options.workers}`
  } else if (!strategy.parallel) {
    cmd += ' --workers=1'
  }

  // Retries based on strategy
  if (strategy.retries > 0) {
    cmd += ` --retries=${strategy.retries}`
  }

  return cmd
}

/**
 * Execute tests with performance monitoring
 */
async function executeTests(options) {
  const strategy = EXECUTION_STRATEGIES[options.strategy]

  console.log(`🚀 Starting test execution with strategy: ${options.strategy}`)
  console.log(`📋 Description: ${strategy.description}`)
  console.log(`🎯 Categories: ${strategy.categories.join(', ')}`)
  console.log(`🔧 Browser: ${options.browser}`)

  const startTime = Date.now()
  let success = false

  try {
    const command = buildPlaywrightCommand(options)
    console.log(`💻 Command: ${command}\n`)

    execSync(command, {
      stdio: 'inherit',
      env: {
        ...process.env,
        TEST_STRATEGY: options.strategy,
        TEST_START_TIME: startTime.toString(),
      },
    })

    success = true
    const duration = Date.now() - startTime
    console.log(
      `\n✅ Tests completed successfully in ${Math.round(duration / 1000)}s`
    )
  } catch (error) {
    const duration = Date.now() - startTime
    console.log(`\n❌ Tests failed after ${Math.round(duration / 1000)}s`)

    if (error.status) {
      console.log(`Exit code: ${error.status}`)
    }

    process.exit(error.status || 1)
  }

  // Generate performance report
  generatePerformanceReport(options.strategy, success, Date.now() - startTime)
}

/**
 * Generate performance report
 */
function generatePerformanceReport(strategy, success, duration) {
  const report = {
    timestamp: new Date().toISOString(),
    strategy,
    success,
    duration,
    durationFormatted: `${Math.round(duration / 1000)}s`,
    environment: {
      ci: !!process.env.CI,
      node: process.version,
      platform: process.platform,
    },
  }

  // Append to performance log
  const logFile = path.join(__dirname, '../test-results/performance-log.jsonl')
  const logDir = path.dirname(logFile)

  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true })
  }

  fs.appendFileSync(logFile, JSON.stringify(report) + '\n')
  console.log(`📊 Performance data logged to ${logFile}`)
}

/**
 * List available test files
 */
function listTests() {
  console.log('📋 Available test categories:\n')

  Object.entries(TEST_CATEGORIES).forEach(([name, config]) => {
    console.log(`${name.padEnd(15)} ${config.description}`)
    console.log(`${''.padEnd(15)} Pattern: ${config.pattern}`)
    console.log(`${''.padEnd(15)} Timeout: ${config.timeout}ms`)
    console.log('')
  })
}

/**
 * Main execution
 */
async function main() {
  const options = parseArgs()

  if (options.help) {
    showHelp()
    return
  }

  if (process.argv.includes('--list')) {
    listTests()
    return
  }

  if (!EXECUTION_STRATEGIES[options.strategy]) {
    console.error(`❌ Unknown strategy: ${options.strategy}`)
    console.error(
      `Available strategies: ${Object.keys(EXECUTION_STRATEGIES).join(', ')}`
    )
    process.exit(1)
  }

  await executeTests(options)
}

// Export for use as module
module.exports = {
  TEST_CATEGORIES,
  EXECUTION_STRATEGIES,
  buildPlaywrightCommand,
  executeTests,
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Execution failed:', error)
    process.exit(1)
  })
}
