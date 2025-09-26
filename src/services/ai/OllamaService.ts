/**
 * OllamaService - Local LLM integration for Viny
 *
 * Provides free, private, and offline AI capabilities using Ollama
 */

import { notebookLogger as logger } from '../../utils/logger'

export interface OllamaModel {
  name: string
  size: string
  parameter_size: string
  quantization_level: string
  modified_at: string
}

export interface OllamaResponse {
  model: string
  created_at: string
  response: string
  done: boolean
  context?: number[]
  total_duration?: number
  load_duration?: number
  prompt_eval_duration?: number
  eval_duration?: number
  eval_count?: number
}

export interface OllamaGenerateOptions {
  model?: string
  prompt: string
  system?: string
  template?: string
  context?: number[]
  stream?: boolean
  raw?: boolean
  format?: 'json'
  options?: {
    temperature?: number
    top_k?: number
    top_p?: number
    num_predict?: number
    stop?: string[]
  }
}

export interface OllamaChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface OllamaChatOptions {
  model?: string
  messages: OllamaChatMessage[]
  stream?: boolean
  format?: 'json'
  options?: {
    temperature?: number
    top_k?: number
    top_p?: number
    num_predict?: number
  }
}

class OllamaService {
  private baseUrl: string
  private defaultModel: string
  private isAvailable = false

  constructor(
    baseUrl = 'http://localhost:11434',
    defaultModel = 'llama3.2:latest'
  ) {
    this.baseUrl = baseUrl
    this.defaultModel = defaultModel
    this.checkAvailability()
  }

  /**
   * Check if Ollama is running and available
   */
  async checkAvailability(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000), // 5 second timeout
      })

      this.isAvailable = response.ok
      if (this.isAvailable) {
        logger.info('Ollama service is available')
      }
      return this.isAvailable
    } catch (error) {
      this.isAvailable = false
      logger.warn('Ollama service is not available', error)
      return false
    }
  }

  /**
   * Get list of available models
   */
  async listModels(): Promise<OllamaModel[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`)
      if (!response.ok) throw new Error('Failed to fetch models')

      const data = await response.json()
      return data.models || []
    } catch (error) {
      logger.error('Failed to list Ollama models', error)
      return []
    }
  }

  /**
   * Generate completion using Ollama
   */
  async generate(options: OllamaGenerateOptions): Promise<OllamaResponse> {
    if (!this.isAvailable) {
      throw new Error(
        'Ollama service is not available. Please ensure Ollama is running.'
      )
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: options.model || this.defaultModel,
          prompt: options.prompt,
          system: options.system,
          template: options.template,
          context: options.context,
          stream: options.stream ?? false,
          raw: options.raw ?? false,
          format: options.format,
          options: options.options,
        }),
      })

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      logger.error('Failed to generate with Ollama', error)
      throw error
    }
  }

  /**
   * Chat with Ollama (for conversational AI)
   */
  async chat(options: OllamaChatOptions): Promise<OllamaResponse> {
    if (!this.isAvailable) {
      throw new Error(
        'Ollama service is not available. Please ensure Ollama is running.'
      )
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: options.model || this.defaultModel,
          messages: options.messages,
          stream: options.stream ?? false,
          format: options.format,
          options: options.options,
        }),
      })

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      logger.error('Failed to chat with Ollama', error)
      throw error
    }
  }

  /**
   * Stream chat responses for real-time UI updates
   */
  async *streamChat(options: OllamaChatOptions): AsyncGenerator<string> {
    if (!this.isAvailable) {
      throw new Error('Ollama service is not available')
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...options,
          model: options.model || this.defaultModel,
          stream: true,
        }),
      })

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`)
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response body')

      const decoder = new TextDecoder()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n').filter(line => line.trim())

        for (const line of lines) {
          try {
            const data = JSON.parse(line)
            if (data.message?.content) {
              yield data.message.content
            }
          } catch (e) {
            // Skip invalid JSON lines
          }
        }
      }
    } catch (error) {
      logger.error('Failed to stream chat', error)
      throw error
    }
  }

  /**
   * Generate embeddings using Ollama (if model supports it)
   */
  async generateEmbedding(
    text: string,
    model = 'nomic-embed-text'
  ): Promise<number[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/embeddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          prompt: text,
        }),
      })

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`)
      }

      const data = await response.json()
      return data.embedding
    } catch (error) {
      logger.error('Failed to generate embedding with Ollama', error)
      throw error
    }
  }

  /**
   * Pull/download a model
   */
  async pullModel(modelName: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/pull`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: modelName,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to pull model: ${response.statusText}`)
      }

      // Handle streaming response for progress
      const reader = response.body?.getReader()
      if (!reader) return

      const decoder = new TextDecoder()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        logger.info('Model pull progress:', chunk)
      }
    } catch (error) {
      logger.error('Failed to pull model', error)
      throw error
    }
  }

  /**
   * Get availability status
   */
  getIsAvailable(): boolean {
    return this.isAvailable
  }

  /**
   * Set default model
   */
  setDefaultModel(model: string): void {
    this.defaultModel = model
  }

  /**
   * Get default model
   */
  getDefaultModel(): string {
    return this.defaultModel
  }
}

// Export singleton instance
export const ollamaService = new OllamaService()

// Export class for testing
export { OllamaService }
