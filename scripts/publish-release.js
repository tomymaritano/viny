#!/usr/bin/env node

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config()

const GH_TOKEN = process.env.GH_TOKEN
const REPO = 'tomymaritano/markdown'

if (!GH_TOKEN) {
  console.error('❌ Error: GH_TOKEN not found in .env file')
  console.error('Please add your GitHub Personal Access Token to .env file')
  process.exit(1)
}

// Get version from package.json
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
const version = packageJson.version
const tagName = `v${version}`

console.log(`📦 Publishing Viny ${version} to GitHub...`)

try {
  // Check if tag already exists
  try {
    execSync(`git rev-parse ${tagName}`, { stdio: 'ignore' })
    console.log(`⚠️  Tag ${tagName} already exists. Deleting and recreating...`)
    execSync(`git tag -d ${tagName}`)
    execSync(`git push origin :refs/tags/${tagName}`)
  } catch (e) {
    // Tag doesn't exist, which is fine
  }

  // Create and push tag
  console.log('🏷️  Creating tag...')
  execSync(`git tag ${tagName}`)
  execSync(`git push origin ${tagName}`)

  // Create GitHub release
  console.log('📝 Creating GitHub release...')
  const releaseNotes = `
# Viny ${version}

## What's New
- Renamed from Nototo to Viny
- Improved performance and stability
- Auto-update support for private repositories

## Downloads
- **macOS Intel**: Viny-${version}.dmg
- **macOS Apple Silicon**: Viny-${version}-arm64.dmg
`

  // Create release using GitHub CLI
  const createReleaseCmd = `gh release create ${tagName} \
    --repo ${REPO} \
    --title "Viny ${version}" \
    --notes "${releaseNotes.trim()}" \
    --draft`

  execSync(createReleaseCmd, { stdio: 'inherit' })

  // Upload artifacts
  console.log('📤 Uploading release artifacts...')
  const artifacts = [
    `dist-electron/Viny-${version}.dmg`,
    `dist-electron/Viny-${version}-arm64.dmg`,
    `dist-electron/Viny-${version}-mac.zip`,
    `dist-electron/Viny-${version}-arm64-mac.zip`,
    `dist-electron/latest-mac.yml`,
  ]

  for (const artifact of artifacts) {
    if (fs.existsSync(artifact)) {
      console.log(`  ↗️  Uploading ${path.basename(artifact)}...`)
      execSync(`gh release upload ${tagName} "${artifact}" --repo ${REPO}`, {
        stdio: 'inherit',
      })
    } else {
      console.warn(`  ⚠️  Warning: ${artifact} not found`)
    }
  }

  // Publish the release
  console.log('🚀 Publishing release...')
  execSync(`gh release edit ${tagName} --draft=false --repo ${REPO}`, {
    stdio: 'inherit',
  })

  console.log(`
✅ Release ${version} published successfully!

Users with auto-update enabled will receive the update automatically.

To manually check the release:
https://github.com/${REPO}/releases/tag/${tagName}
`)
} catch (error) {
  console.error('❌ Error publishing release:', error.message)
  process.exit(1)
}
