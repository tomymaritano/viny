#!/usr/bin/env node

/**
 * Script to verify CI/CD setup is working correctly
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const GREEN = '\x1b[32m'
const RED = '\x1b[31m'
const YELLOW = '\x1b[33m'
const BLUE = '\x1b[34m'
const RESET = '\x1b[0m'

function log(message, color = RESET) {
  console.log(`${color}${message}${RESET}`)
}

function checkFileExists(filePath, description) {
  const exists = fs.existsSync(filePath)
  log(
    `${exists ? '✅' : '❌'} ${description}: ${filePath}`,
    exists ? GREEN : RED
  )
  return exists
}

function runCommand(command, description) {
  try {
    log(`🔄 ${description}...`, BLUE)
    execSync(command, { stdio: 'pipe' })
    log(`✅ ${description} passed`, GREEN)
    return true
  } catch (error) {
    log(`❌ ${description} failed`, RED)
    return false
  }
}

async function verifyCI() {
  log('🔍 Verifying CI/CD Setup for Viny', BLUE)
  log('=====================================\n', BLUE)

  let allChecks = true

  // Check workflow files
  log('📁 Checking GitHub Actions workflows:', YELLOW)
  allChecks &= checkFileExists('.github/workflows/ci.yml', 'Main CI Pipeline')
  allChecks &= checkFileExists(
    '.github/workflows/release.yml',
    'Release Workflow'
  )
  allChecks &= checkFileExists(
    '.github/workflows/dev-checks.yml',
    'Development Checks'
  )

  // Check husky setup
  log('\n🪝 Checking Git hooks:', YELLOW)
  allChecks &= checkFileExists('.husky/pre-commit', 'Pre-commit hook')

  // Check package.json scripts
  log('\n📦 Checking package.json scripts:', YELLOW)
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
  const requiredScripts = [
    'test',
    'test:run',
    'test:coverage',
    'lint',
    'format:check',
    'build',
    'build:electron',
    'build:electron:test',
  ]

  for (const script of requiredScripts) {
    const exists = packageJson.scripts[script]
    log(`${exists ? '✅' : '❌'} Script "${script}"`, exists ? GREEN : RED)
    allChecks &= !!exists
  }

  // Run actual tests
  log('\n🧪 Running test commands:', YELLOW)
  allChecks &= runCommand('npm run lint', 'Linting')
  allChecks &= runCommand('npm run format:check', 'Format check')
  allChecks &= runCommand('npm run test:run', 'Tests')
  allChecks &= runCommand('npm run build', 'Web build')
  allChecks &= runCommand(
    'npm run build:electron-src',
    'TypeScript compilation'
  )

  // Final report
  log('\n' + '='.repeat(50), BLUE)
  if (allChecks) {
    log('🎉 All CI/CD checks passed! Your setup is ready.', GREEN)
    log('📋 Summary:', BLUE)
    log('  • GitHub Actions workflows are configured', GREEN)
    log('  • Pre-commit hooks are working', GREEN)
    log('  • All required npm scripts exist', GREEN)
    log('  • Tests, linting, and builds are working', GREEN)
    log('\n💡 Next steps:', YELLOW)
    log('  • Push to GitHub to trigger CI pipeline')
    log('  • Create a PR to test the full workflow')
    log('  • Tag a version (v1.x.x) to test the release pipeline')
  } else {
    log('❌ Some CI/CD checks failed. Please fix the issues above.', RED)
    process.exit(1)
  }
}

verifyCI().catch(error => {
  log(`💥 Error during verification: ${error.message}`, RED)
  process.exit(1)
})
