#!/usr/bin/env node

const { spawn } = require('child_process')
const waitOn = require('wait-on')

let vitePort = 5173
let viteProcess
let electronProcess

async function startDev() {
  console.log('🚀 Starting Nototo development environment...')

  try {
    // Start Vite dev server
    console.log('📦 Starting Vite dev server...')
    viteProcess = spawn('npm', ['run', 'dev'], {
      stdio: 'inherit',
      shell: true,
    })

    // Wait for Vite to be ready
    console.log(`⏳ Waiting for Vite server on http://localhost:${vitePort}...`)
    await waitOn({
      resources: [`http://localhost:${vitePort}`],
      delay: 1000,
      interval: 100,
      timeout: 30000,
    })

    console.log('✅ Vite server is ready!')

    // Set environment variable for Electron
    process.env.VITE_DEV_SERVER_URL = `http://localhost:${vitePort}`

    // Start Electron
    console.log('🖥️  Starting Electron...')
    electronProcess = spawn('npm', ['run', 'electron-dev'], {
      stdio: 'inherit',
      shell: true,
      env: { ...process.env, NODE_ENV: 'development' },
    })

    console.log('🎉 Nototo is running!')
    console.log(`   Vite:     http://localhost:${vitePort}`)
    console.log(`   Electron: Desktop app should open`)
  } catch (error) {
    console.error('❌ Failed to start development environment:', error)
    process.exit(1)
  }
}

// Handle cleanup on exit
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down development environment...')

  if (electronProcess) {
    electronProcess.kill('SIGTERM')
  }

  if (viteProcess) {
    viteProcess.kill('SIGTERM')
  }

  setTimeout(() => {
    process.exit(0)
  }, 1000)
})

// Start the development environment
startDev().catch(console.error)
