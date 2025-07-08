#!/usr/bin/env node

const { spawn, exec } = require('child_process')
const waitOn = require('wait-on')
const fs = require('fs')

const DEV_MODES = {
  HYBRID: 'hybrid',
  DOCKER: 'docker',
  LOCAL: 'local',
}

const TARGET_MODES = {
  WEB: 'web',
  ELECTRON: 'electron',
}

let vitePort = 5173
let backendPort = 3001
let processes = []

class DevEnvironment {
  constructor() {
    this.mode = this.detectMode()
    this.target = this.detectTarget()
    this.setupCleanup()
  }

  detectMode() {
    const args = process.argv.slice(2)

    if (args.includes('--local')) return DEV_MODES.LOCAL
    if (args.includes('--docker')) return DEV_MODES.DOCKER
    if (args.includes('--hybrid')) return DEV_MODES.HYBRID

    // Auto-detect based on system
    return this.autoDetectMode()
  }

  detectTarget() {
    const args = process.argv.slice(2)

    if (args.includes('--electron')) return TARGET_MODES.ELECTRON
    if (args.includes('--web')) return TARGET_MODES.WEB

    // Auto-detect: if electron is available, prefer it
    try {
      require.resolve('electron')
      return TARGET_MODES.ELECTRON
    } catch (e) {
      return TARGET_MODES.WEB
    }
  }

  autoDetectMode() {
    // Check if Docker is available
    try {
      exec('docker --version', error => {
        if (error) {
          console.log('🔍 Docker not available, using local mode')
          return DEV_MODES.LOCAL
        }
      })
    } catch (e) {
      return DEV_MODES.LOCAL
    }

    // Default to hybrid for best performance
    return DEV_MODES.HYBRID
  }

  async checkBackendHealth() {
    try {
      const response = await fetch(`http://localhost:${backendPort}/health`)
      return response.ok
    } catch (e) {
      return false
    }
  }

  async startHybridMode() {
    const targetName =
      this.target === TARGET_MODES.ELECTRON ? 'Electron desktop app' : 'Browser'
    console.log('🚀 Starting HYBRID development mode (FASTEST)')
    console.log('   Backend: Docker container')
    console.log('   Frontend: Local npm server')
    console.log(`   Target: ${targetName}`)
    console.log('')

    // Start backend container
    console.log('🐳 Starting backend container...')
    const backendProcess = spawn(
      'docker-compose',
      ['-f', 'docker-compose.hybrid.yml', 'up', '--build'],
      {
        stdio: ['inherit', 'pipe', 'pipe'],
        shell: true,
      }
    )

    processes.push(backendProcess)

    // Wait for backend to be healthy
    console.log(`⏳ Waiting for backend on http://localhost:${backendPort}...`)
    await waitOn({
      resources: [`http://localhost:${backendPort}/health`],
      delay: 2000,
      interval: 1000,
      timeout: 60000,
    })

    console.log('✅ Backend is ready!')

    // Start frontend locally
    console.log('⚡ Starting frontend locally...')
    const frontendProcess = spawn('npm', ['run', 'dev'], {
      stdio: 'inherit',
      shell: true,
      env: {
        ...process.env,
        VITE_API_BASE_URL: `http://localhost:${backendPort}/api`,
      },
    })

    processes.push(frontendProcess)

    // Start Electron if target is electron
    if (this.target === TARGET_MODES.ELECTRON) {
      console.log('🖥️  Starting Electron...')

      // Wait for frontend to be ready
      await waitOn({
        resources: [`http://localhost:${vitePort}`],
        delay: 1000,
        interval: 500,
        timeout: 30000,
      })

      const electronProcess = spawn('npm', ['run', 'electron-dev'], {
        stdio: 'inherit',
        shell: true,
        env: {
          ...process.env,
          NODE_ENV: 'development',
        },
      })

      processes.push(electronProcess)
    }

    console.log('🎉 Hybrid development environment ready!')
    console.log(`   Frontend: http://localhost:${vitePort}`)
    console.log(`   Backend:  http://localhost:${backendPort}`)
    console.log(`   API:      http://localhost:${backendPort}/api`)
    if (this.target === TARGET_MODES.ELECTRON) {
      console.log('   Electron: Desktop app should open automatically')
    }
    console.log('')
    console.log('💡 Changes to frontend are instant!')
    console.log('💡 Backend changes auto-reload in container')
  }

  async startDockerMode() {
    console.log('🐳 Starting FULL Docker development mode')
    console.log('   Both frontend and backend in containers')
    console.log('')

    const dockerProcess = spawn(
      'docker-compose',
      ['-f', 'docker-compose.dev.yml', 'up', '--build'],
      {
        stdio: 'inherit',
        shell: true,
      }
    )

    processes.push(dockerProcess)

    console.log('🎉 Full Docker development environment started!')
    console.log(`   Frontend: http://localhost:${vitePort}`)
    console.log(`   Backend:  http://localhost:${backendPort}`)
  }

  async startLocalMode() {
    const targetName =
      this.target === TARGET_MODES.ELECTRON ? 'Electron desktop app' : 'Browser'
    console.log('🏃‍♂️ Starting LOCAL development mode (NO BACKEND)')
    console.log('   Frontend only with localStorage')
    console.log(`   Target: ${targetName}`)
    console.log('')

    if (this.target === TARGET_MODES.ELECTRON) {
      // Start Electron local mode
      const electronProcess = spawn('npm', ['run', 'dev:electron:local'], {
        stdio: 'inherit',
        shell: true,
      })

      processes.push(electronProcess)

      console.log('🎉 Local Electron development environment ready!')
      console.log(`   Frontend: http://localhost:${vitePort}`)
      console.log('   Electron: Desktop app should open automatically')
      console.log('   ⚠️  Using localStorage only (no API backend)')
    } else {
      // Start web local mode
      const frontendProcess = spawn('npm', ['run', 'dev:local'], {
        stdio: 'inherit',
        shell: true,
      })

      processes.push(frontendProcess)

      console.log('🎉 Local web development environment ready!')
      console.log(`   Frontend: http://localhost:${vitePort}`)
      console.log('   ⚠️  Using localStorage only (no API backend)')
    }
  }

  async start() {
    try {
      switch (this.mode) {
        case DEV_MODES.HYBRID:
          await this.startHybridMode()
          break
        case DEV_MODES.DOCKER:
          await this.startDockerMode()
          break
        case DEV_MODES.LOCAL:
          await this.startLocalMode()
          break
        default:
          throw new Error(`Unknown development mode: ${this.mode}`)
      }
    } catch (error) {
      console.error(
        '❌ Failed to start development environment:',
        error.message
      )
      this.cleanup()
      process.exit(1)
    }
  }

  setupCleanup() {
    process.on('SIGINT', () => this.cleanup())
    process.on('SIGTERM', () => this.cleanup())
    process.on('exit', () => this.cleanup())
  }

  cleanup() {
    console.log('\n🛑 Shutting down development environment...')

    processes.forEach(proc => {
      if (proc && !proc.killed) {
        proc.kill('SIGTERM')
      }
    })

    // Stop Docker containers if needed
    if (this.mode === DEV_MODES.HYBRID) {
      exec('docker-compose -f docker-compose.hybrid.yml down', () => {})
    } else if (this.mode === DEV_MODES.DOCKER) {
      exec('docker-compose -f docker-compose.dev.yml down', () => {})
    }

    setTimeout(() => {
      process.exit(0)
    }, 2000)
  }

  static showUsage() {
    console.log('Usage: node start-dev-smart.js [options]')
    console.log('')
    console.log('Development Mode Options:')
    console.log(
      '  --hybrid    Backend in Docker + Frontend local (fastest) [DEFAULT]'
    )
    console.log('  --docker    Full Docker development environment')
    console.log('  --local     Local development only (no backend)')
    console.log('')
    console.log('Target Options:')
    console.log(
      '  --electron  Start Electron desktop app [DEFAULT if available]'
    )
    console.log('  --web       Start in browser only')
    console.log('')
    console.log('Examples:')
    console.log(
      '  npm run dev:smart                    # Auto-detect best mode and target'
    )
    console.log(
      '  npm run dev:smart --electron         # Force Electron target'
    )
    console.log('  npm run dev:smart --web              # Force web target')
    console.log(
      '  npm run dev:smart --hybrid --electron # Backend Docker + Electron'
    )
    console.log(
      '  npm run dev:smart --local --electron  # Electron with localStorage only'
    )
  }
}

// Show usage if help requested
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  DevEnvironment.showUsage()
  process.exit(0)
}

// Start the development environment
const devEnv = new DevEnvironment()
devEnv.start().catch(console.error)
