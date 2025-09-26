/**
 * AIService - Unified AI service that manages both Ollama and WebLLM
 */

import { ollamaService } from './OllamaService'
// WebLLM temporarily disabled due to dependency issues
// Will be re-enabled once properly configured
const webLLMService: any = null
import { logger } from '../../utils/logger'
import type { AppSettings } from '../../types/settings'

export type AIProvider = 'ollama' | 'none' // webllm temporarily disabled

interface AIServiceConfig {
  provider: AIProvider
  ollamaModel?: string
  webllmModel?: string
}

class AIService {
  private currentProvider: AIProvider = 'none'
  private isInitialized = false

  async initialize(settings: AppSettings): Promise<void> {
    if (!settings.ai?.enableAIAssistant) {
      this.currentProvider = 'none'
      return
    }

    // Determine best provider based on environment and availability
    const provider = await this.determineBestProvider(settings)
    
    if (provider === 'none') {
      logger.warn('No AI provider available')
      return
    }

    try {
      if (provider === 'ollama') {
        // Ollama doesn't need initialization, just check availability
        const isAvailable = await ollamaService.checkAvailability()
        if (isAvailable) {
          this.currentProvider = 'ollama'
          this.isInitialized = true
          logger.info('AI Service initialized with Ollama')
        }
      } else if (provider === 'webllm') {
        await webLLMService.initialize({
          model: settings.ai?.webllmModel || 'Llama-3.2-1B-Instruct-q4f32_1-MLC'
        })
        this.currentProvider = 'webllm'
        this.isInitialized = true
        logger.info('AI Service initialized with WebLLM')
      }
    } catch (error) {
      logger.error('Failed to initialize AI provider:', error)
      this.currentProvider = 'none'
    }
  }

  private async determineBestProvider(settings: AppSettings): Promise<AIProvider> {
    const preferredProvider = settings.ai?.provider || 'ollama'

    // If user has a preference, try that first
    if (preferredProvider === 'ollama') {
      const isOllamaAvailable = await ollamaService.checkAvailability()
      if (isOllamaAvailable) return 'ollama'
      
      // Fallback to WebLLM if Ollama not available
      if (webLLMService) {
        const isWebLLMAvailable = await webLLMService.isAvailable()
        if (isWebLLMAvailable) return 'webllm'
      }
    } else if (preferredProvider === 'webllm' && webLLMService) {
      const isWebLLMAvailable = await webLLMService.isAvailable()
      if (isWebLLMAvailable) return 'webllm'
      
      // Fallback to Ollama if WebLLM not available
      const isOllamaAvailable = await ollamaService.checkAvailability()
      if (isOllamaAvailable) return 'ollama'
    }

    return 'none'
  }

  async isAvailable(): Promise<boolean> {
    return this.isInitialized && this.currentProvider !== 'none'
  }

  getCurrentProvider(): AIProvider {
    return this.currentProvider
  }

  async generateAnswer(question: string, context: string): Promise<string> {
    if (!this.isInitialized || this.currentProvider === 'none') {
      throw new Error('AI Service not initialized')
    }

    try {
      if (this.currentProvider === 'ollama') {
        return await ollamaService.generateAnswer(question, context)
      } else if (this.currentProvider === 'webllm' && webLLMService) {
        return await webLLMService.generateAnswer(question, context)
      }
      
      throw new Error('No AI provider available')
    } catch (error) {
      logger.error('AI generateAnswer error:', error)
      throw error
    }
  }

  async checkProviderAvailability(): Promise<{
    ollama: boolean
    webllm: boolean
  }> {
    const ollamaAvailable = await ollamaService.checkAvailability()
    const webllmAvailable = webLLMService ? await webLLMService.isAvailable() : false

    return {
      ollama: ollamaAvailable,
      webllm: webllmAvailable
    }
  }

  async switchProvider(provider: AIProvider, settings?: AppSettings): Promise<boolean> {
    if (provider === this.currentProvider) {
      return true
    }

    try {
      // Cleanup current provider
      if (this.currentProvider === 'webllm' && webLLMService) {
        await webLLMService.unload()
      }

      // Initialize new provider
      if (provider === 'ollama') {
        const isAvailable = await ollamaService.checkAvailability()
        if (!isAvailable) {
          throw new Error('Ollama is not available')
        }
        this.currentProvider = 'ollama'
        this.isInitialized = true
      } else if (provider === 'webllm' && webLLMService) {
        await webLLMService.initialize({
          model: settings?.ai?.webllmModel || 'Llama-3.2-1B-Instruct-q4f32_1-MLC'
        })
        this.currentProvider = 'webllm'
        this.isInitialized = true
      } else {
        this.currentProvider = 'none'
        this.isInitialized = false
      }

      return true
    } catch (error) {
      logger.error('Failed to switch AI provider:', error)
      return false
    }
  }

  getProviderInfo(): {
    name: string
    description: string
    requiresInstall: boolean
    isLocal: boolean
  } {
    switch (this.currentProvider) {
      case 'ollama':
        return {
          name: 'Ollama',
          description: 'Fast, local AI with desktop app',
          requiresInstall: true,
          isLocal: true
        }
      case 'webllm':
        return {
          name: 'WebLLM',
          description: 'Browser-based AI (requires WebGPU)',
          requiresInstall: false,
          isLocal: true
        }
      default:
        return {
          name: 'None',
          description: 'No AI provider active',
          requiresInstall: false,
          isLocal: false
        }
    }
  }
}

export const aiService = new AIService()