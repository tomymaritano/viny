#!/usr/bin/env node

const { spawn } = require('child_process')
const fs = require('fs')
const path = require('path')

const serverDir = path.join(__dirname, '..', 'server')

console.log('🚀 Starting local backend server...')

// Check if server directory exists
if (!fs.existsSync(serverDir)) {
  console.error('❌ Server directory not found')
  console.log('   This seems to be a frontend-only setup')
  process.exit(1)
}

// Check if dependencies are installed
const nodeModulesPath = path.join(serverDir, 'node_modules')
if (!fs.existsSync(nodeModulesPath)) {
  console.log('📦 Installing backend dependencies...')
  try {
    const installProcess = spawn('npm', ['install'], {
      cwd: serverDir,
      stdio: 'inherit',
      shell: true,
    })

    installProcess.on('close', code => {
      if (code !== 0) {
        console.error('❌ Failed to install dependencies')
        process.exit(1)
      }
      startServer()
    })
  } catch (error) {
    console.error('❌ Failed to install dependencies:', error.message)
    process.exit(1)
  }
} else {
  startServer()
}

function startServer() {
  console.log('🗄️  Setting up database...')

  // Setup database
  const dbSetup = spawn('npm', ['run', 'db:push'], {
    cwd: serverDir,
    stdio: 'inherit',
    shell: true,
  })

  dbSetup.on('close', code => {
    if (code !== 0) {
      console.log('⚠️  Database setup had issues, but continuing...')
    }

    console.log('🎯 Starting development server...')

    // Start the backend server
    const serverProcess = spawn('npm', ['run', 'dev'], {
      cwd: serverDir,
      stdio: 'inherit',
      shell: true,
      env: {
        ...process.env,
        NODE_ENV: 'development',
        PORT: '3001',
        DATABASE_URL: 'file:./local-viny.db',
      },
    })

    // Handle cleanup
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down local backend...')
      serverProcess.kill('SIGTERM')
      setTimeout(() => process.exit(0), 1000)
    })

    serverProcess.on('close', code => {
      console.log(`Backend server exited with code ${code}`)
      process.exit(code)
    })
  })
}
