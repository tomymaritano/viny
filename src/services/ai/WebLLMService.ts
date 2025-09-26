/**
 * WebLLMService - Browser-based AI using WebLLM
 * Alternative to Ollama for web users
 */

import { logger } from '../../utils/logger'

interface WebLLMConfig {
  model: string
  temperature?: number
  maxTokens?: number
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

class WebLLMService {
  private engine: any = null
  private isInitializing = false
  private initPromise: Promise<void> | null = null
  private currentModel: string | null = null

  async initialize(config: WebLLMConfig = { model: 'Llama-3.2-1B-Instruct-q4f32_1-MLC' }): Promise<void> {
    if (this.engine && this.currentModel === config.model) {
      return
    }

    if (this.isInitializing) {
      return this.initPromise!
    }

    this.isInitializing = true
    this.initPromise = this._doInitialize(config)
    
    try {
      await this.initPromise
    } finally {
      this.isInitializing = false
    }
  }

  private async _doInitialize(config: WebLLMConfig): Promise<void> {
    try {
      logger.info('Initializing WebLLM with model:', config.model)
      
      // Dynamically import WebLLM to avoid bundling it if not used
      const webllm = await import('@mlc-ai/web-llm')
      
      // Create engine with progress callback
      const engineConfig = {
        initProgressCallback: (progress: any) => {
          logger.debug('WebLLM initialization progress:', progress)
          // Emit progress events if needed
          window.dispatchEvent(new CustomEvent('webllm-progress', { detail: progress }))
        }
      }
      
      this.engine = await webllm.CreateMLCEngine(config.model, engineConfig)
      
      this.currentModel = config.model
      logger.info('WebLLM initialized successfully')
    } catch (error) {
      logger.error('Failed to initialize WebLLM:', error)
      throw error
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      // Check if WebGPU is available
      if (!('gpu' in navigator)) {
        logger.warn('WebGPU not available in this browser')
        return false
      }

      // Check if we can get an adapter
      const gpu = (navigator as any).gpu
      const adapter = await gpu.requestAdapter()
      if (!adapter) {
        logger.warn('No WebGPU adapter available')
        return false
      }

      return true
    } catch (error) {
      logger.error('WebLLM availability check failed:', error)
      return false
    }
  }

  async chat(messages: ChatMessage[], options?: { temperature?: number; maxTokens?: number }): Promise<string> {
    if (!this.engine) {
      throw new Error('WebLLM not initialized. Call initialize() first.')
    }

    try {
      const response = await this.engine.chat.completions.create({
        messages,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 500,
      })

      return response.choices[0]?.message?.content || ''
    } catch (error) {
      logger.error('WebLLM chat error:', error)
      throw error
    }
  }

  async generateAnswer(question: string, context: string): Promise<string> {
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: 'You are a helpful assistant that answers questions based solely on the provided context. Keep answers concise and relevant. If the answer is not in the context, say so.'
      },
      {
        role: 'user',
        content: `Context:\n${context}\n\nQuestion: ${question}`
      }
    ]

    return this.chat(messages)
  }

  async reset(): Promise<void> {
    if (this.engine) {
      await this.engine.resetChat()
    }
  }

  async unload(): Promise<void> {
    if (this.engine) {
      await this.engine.unload()
      this.engine = null
      this.currentModel = null
    }
  }

  getModelOptions(): Array<{ id: string; name: string; size: string }> {
    return [
      {
        id: 'Llama-3.2-1B-Instruct-q4f32_1-MLC',
        name: 'Llama 3.2 1B',
        size: '~650MB'
      },
      {
        id: 'Llama-3.2-3B-Instruct-q4f16_1-MLC',
        name: 'Llama 3.2 3B',
        size: '~1.7GB'
      },
      {
        id: 'Phi-3.5-mini-instruct-q4f16_1-MLC',
        name: 'Phi 3.5 Mini',
        size: '~2GB'
      },
      {
        id: 'gemma-2-2b-it-q4f32_1-MLC',
        name: 'Gemma 2 2B',
        size: '~1.3GB'
      }
    ]
  }

  async getMemoryUsage(): Promise<{ used: number; limit: number }> {
    if (!this.engine) {
      return { used: 0, limit: 0 }
    }

    try {
      // Get GPU memory info if available
      if ('gpu' in navigator) {
        const gpu = (navigator as any).gpu
        const adapter = await gpu.requestAdapter()
        if (adapter && 'requestAdapterInfo' in adapter) {
          const info = await (adapter as any).requestAdapterInfo()
          return {
            used: info.memoryHeaps?.[0]?.used || 0,
            limit: info.memoryHeaps?.[0]?.size || 0
          }
        }
      }
    } catch (error) {
      logger.warn('Could not get GPU memory info:', error)
    }

    return { used: 0, limit: 0 }
  }
}

export const webLLMService = new WebLLMService()