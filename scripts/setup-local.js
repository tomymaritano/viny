#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

console.log('🏗️  Setting up local development environment...')

// Create .env.local if it doesn't exist
const envLocalPath = path.join(__dirname, '..', '.env.local')
const envExamplePath = path.join(__dirname, '..', '.env.local.example')

if (!fs.existsSync(envLocalPath)) {
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envLocalPath)
    console.log('✅ Created .env.local from example')
  } else {
    const defaultEnv = `# Local Development Configuration
NODE_ENV=development
VITE_API_BASE_URL=disabled
VITE_ENABLE_PLUGINS=true
VITE_DEBUG_MODE=true
`
    fs.writeFileSync(envLocalPath, defaultEnv)
    console.log('✅ Created default .env.local')
  }
} else {
  console.log('ℹ️  .env.local already exists')
}

// Create local data directory
const dataDir = path.join(__dirname, '..', 'data')
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
  console.log('✅ Created local data directory')
}

// Create local SQLite database if backend is enabled
const envContent = fs.readFileSync(envLocalPath, 'utf8')
if (envContent.includes('VITE_API_BASE_URL=http://localhost:3001')) {
  const serverDir = path.join(__dirname, '..', 'server')
  if (fs.existsSync(serverDir)) {
    try {
      console.log('🗄️  Setting up local database...')
      execSync('cd server && npm run db:push', { stdio: 'inherit' })
      console.log('✅ Local database setup complete')
    } catch (error) {
      console.log(
        '⚠️  Database setup failed (you may need to install backend dependencies)'
      )
      console.log('   Run: cd server && npm install && npm run db:push')
    }
  }
}

console.log('')
console.log('🎉 Local development environment is ready!')
console.log('')
console.log('Quick start commands:')
console.log('  npm run dev:local     # Start frontend only (localStorage mode)')
console.log('  npm run dev:smart     # Auto-detect best development mode')
console.log('  npm run dev:hybrid    # Backend in Docker + frontend local')
console.log('')
console.log('Configuration:')
console.log(`  Environment: ${envLocalPath}`)
console.log(`  Data folder: ${dataDir}`)
console.log('')
console.log('💡 Edit .env.local to customize your development setup')
