#!/usr/bin/env node

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

// Colores para console
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function run(command, description) {
  log(`\n📋 ${description}...`, 'blue')
  try {
    execSync(command, { stdio: 'inherit' })
    log(`✅ ${description} completed!`, 'green')
  } catch (error) {
    log(`❌ ${description} failed!`, 'red')
    process.exit(1)
  }
}

function getVersion() {
  const packagePath = path.join(process.cwd(), 'package.json')
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'))
  return packageJson.version
}

function main() {
  const version = getVersion()

  log(`\n🚀 Building Viny v${version} for macOS`, 'cyan')
  log('═══════════════════════════════════════', 'cyan')

  // Step 1: Clean previous builds
  log('\n🧹 Cleaning previous builds...', 'yellow')
  run('rm -rf dist dist-electron', 'Clean build directories')

  // Step 2: Install dependencies
  log('\n📦 Installing dependencies...', 'yellow')
  run('npm install', 'Install dependencies')

  // Step 3: Build the app
  log('\n🔨 Building application...', 'yellow')
  run('npm run build', 'Build web assets')
  run('npm run build:electron-src', 'Build Electron source')

  // Step 4: Build DMG for macOS
  log('\n💿 Creating DMG installer...', 'yellow')
  run('npm run build:electron', 'Build Electron app with DMG')

  // Step 5: Show output
  log('\n✨ Build complete!', 'green')
  log('\nBuilt files:', 'cyan')

  const distPath = path.join(process.cwd(), 'dist-electron')
  if (fs.existsSync(distPath)) {
    const files = fs.readdirSync(distPath)
    files.forEach(file => {
      if (file.endsWith('.dmg') || file.endsWith('.zip')) {
        const filePath = path.join(distPath, file)
        const stats = fs.statSync(filePath)
        const sizeMB = (stats.size / 1024 / 1024).toFixed(2)
        log(`  📦 ${file} (${sizeMB} MB)`, 'green')
      }
    })
  }

  log('\n🎉 Ready for distribution!', 'green')
  log('You can now upload the DMG file to your release.', 'yellow')
}

main()
