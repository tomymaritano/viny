/**
 * OllamaInstaller - Automatic installation of Ollama for AI features
 */

import { logger } from '../../utils/logger'
import { ollamaService } from './OllamaService'

export interface InstallProgress {
  status: 'checking' | 'downloading' | 'installing' | 'downloading-model' | 'starting' | 'completed' | 'error'
  progress: number
  message: string
  error?: string
}

export class OllamaInstaller {
  private onProgressCallback?: (progress: InstallProgress) => void

  constructor() {}

  /**
   * Set progress callback
   */
  onProgress(callback: (progress: InstallProgress) => void) {
    this.onProgressCallback = callback
  }

  /**
   * Update progress
   */
  private updateProgress(progress: InstallProgress) {
    logger.info('Ollama installation progress:', progress)
    this.onProgressCallback?.(progress)
  }

  /**
   * Detect operating system
   */
  private detectOS(): 'mac' | 'windows' | 'linux' | 'unknown' {
    const platform = navigator.platform.toLowerCase()
    const userAgent = navigator.userAgent.toLowerCase()

    if (platform.includes('mac') || userAgent.includes('mac')) {
      return 'mac'
    } else if (platform.includes('win') || userAgent.includes('win')) {
      return 'windows'
    } else if (platform.includes('linux') || userAgent.includes('linux')) {
      return 'linux'
    }
    
    return 'unknown'
  }

  /**
   * Get installer URL based on OS
   */
  private getInstallerUrl(): string | null {
    const os = this.detectOS()
    
    switch (os) {
      case 'mac':
        return 'https://ollama.ai/download/Ollama-darwin.zip'
      case 'windows':
        return 'https://ollama.ai/download/OllamaSetup.exe'
      case 'linux':
        return 'https://ollama.ai/install.sh'
      default:
        return null
    }
  }

  /**
   * Check if Ollama is already installed
   */
  async isInstalled(): Promise<boolean> {
    try {
      return await ollamaService.checkAvailability()
    } catch {
      return false
    }
  }

  /**
   * Install Ollama automatically
   */
  async install(): Promise<void> {
    try {
      this.updateProgress({
        status: 'checking',
        progress: 0,
        message: 'Checking if Ollama is already installed...'
      })

      // Check if already installed
      if (await this.isInstalled()) {
        this.updateProgress({
          status: 'completed',
          progress: 100,
          message: 'Ollama is already installed!'
        })
        return
      }

      const os = this.detectOS()
      
      if (os === 'unknown') {
        throw new Error('Could not detect operating system')
      }

      // For Electron app, we can download and execute
      if (window.electronAPI) {
        await this.installViaElectron(os)
      } else {
        // For web version, we need to guide the user
        await this.installViaWeb(os)
      }

    } catch (error) {
      logger.error('Failed to install Ollama:', error)
      this.updateProgress({
        status: 'error',
        progress: 0,
        message: 'Failed to install Ollama',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      throw error
    }
  }

  /**
   * Install via Electron (can execute commands)
   */
  private async installViaElectron(os: 'mac' | 'windows' | 'linux'): Promise<void> {
    this.updateProgress({
      status: 'downloading',
      progress: 20,
      message: 'Downloading Ollama installer...'
    })

    // Use Electron's ability to download and execute
    if (!window.electronAPI?.downloadAndInstallOllama) {
      throw new Error('Electron API not available for installation')
    }

    // Download and install
    await window.electronAPI.downloadAndInstallOllama({
      os,
      onProgress: (percent: number) => {
        this.updateProgress({
          status: 'downloading',
          progress: 20 + (percent * 0.4), // 20-60%
          message: `Downloading Ollama... ${Math.round(percent * 100)}%`
        })
      }
    })

    this.updateProgress({
      status: 'installing',
      progress: 60,
      message: 'Installing Ollama...'
    })

    // Wait for installation to complete
    await this.waitForInstallation()

    // Download default model
    await this.downloadDefaultModel()

    // Start Ollama service
    await this.startService()

    this.updateProgress({
      status: 'completed',
      progress: 100,
      message: 'Ollama installed successfully!'
    })
  }

  /**
   * Install via Web (guide user through manual steps)
   */
  private async installViaWeb(os: 'mac' | 'windows' | 'linux'): Promise<void> {
    const installerUrl = this.getInstallerUrl()
    
    if (!installerUrl) {
      throw new Error('No installer available for your operating system')
    }

    this.updateProgress({
      status: 'downloading',
      progress: 50,
      message: 'Opening Ollama download page...'
    })

    // Open download page in new tab
    window.open('https://ollama.ai/download', '_blank')

    // Since we can't auto-install in browser, provide instructions
    this.updateProgress({
      status: 'installing',
      progress: 50,
      message: 'Please follow the installation instructions in the new tab. Click "Check Installation" when done.'
    })
  }

  /**
   * Wait for Ollama installation to complete
   */
  private async waitForInstallation(maxAttempts = 30): Promise<void> {
    for (let i = 0; i < maxAttempts; i++) {
      if (await this.isInstalled()) {
        return
      }
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
    throw new Error('Installation timeout - Ollama not detected')
  }

  /**
   * Download default AI model
   */
  async downloadDefaultModel(modelName = 'llama3.2:latest'): Promise<void> {
    this.updateProgress({
      status: 'downloading-model',
      progress: 70,
      message: `Downloading AI model ${modelName}...`
    })

    try {
      // Check if model already exists
      const models = await ollamaService.listModels()
      if (models.some(m => m.name === modelName)) {
        logger.info('Model already downloaded:', modelName)
        return
      }

      // Pull the model
      await ollamaService.pullModel(modelName)

      this.updateProgress({
        status: 'downloading-model',
        progress: 90,
        message: 'AI model downloaded successfully!'
      })
    } catch (error) {
      logger.error('Failed to download model:', error)
      throw error
    }
  }

  /**
   * Start Ollama service
   */
  private async startService(): Promise<void> {
    this.updateProgress({
      status: 'starting',
      progress: 95,
      message: 'Starting Ollama service...'
    })

    // For Electron, we can start the service
    if (window.electronAPI?.startOllamaService) {
      await window.electronAPI.startOllamaService()
    }

    // Wait for service to be available
    await this.waitForService()
  }

  /**
   * Wait for Ollama service to start
   */
  private async waitForService(maxAttempts = 10): Promise<void> {
    for (let i = 0; i < maxAttempts; i++) {
      if (await ollamaService.checkAvailability()) {
        return
      }
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    throw new Error('Service startup timeout')
  }

  /**
   * Get installation instructions based on OS
   */
  getInstallInstructions(): { os: string; steps: string[] } {
    const os = this.detectOS()
    
    switch (os) {
      case 'mac':
        return {
          os: 'macOS',
          steps: [
            'Click "Download Ollama" to get the installer',
            'Open the downloaded Ollama.zip file',
            'Drag Ollama.app to your Applications folder',
            'Open Ollama from Applications',
            'Click "Check Installation" below when done'
          ]
        }
      case 'windows':
        return {
          os: 'Windows',
          steps: [
            'Click "Download Ollama" to get the installer',
            'Run OllamaSetup.exe',
            'Follow the installation wizard',
            'Ollama will start automatically',
            'Click "Check Installation" below when done'
          ]
        }
      case 'linux':
        return {
          os: 'Linux',
          steps: [
            'Open a terminal',
            'Run: curl -fsSL https://ollama.ai/install.sh | sh',
            'Start Ollama with: ollama serve',
            'Click "Check Installation" below when done'
          ]
        }
      default:
        return {
          os: 'Unknown',
          steps: [
            'Visit https://ollama.ai/download',
            'Download and install Ollama for your system',
            'Start the Ollama service',
            'Click "Check Installation" below when done'
          ]
        }
    }
  }
}

// Export singleton instance
export const ollamaInstaller = new OllamaInstaller()