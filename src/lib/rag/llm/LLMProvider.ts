/**
 * LLM Provider Interface
 * Unified interface for multiple LLM providers (local and API)
 */

import { logger } from '@/utils/logger'

export interface LLMConfig {
  model: string
  temperature?: number
  maxTokens?: number
  topP?: number
  frequencyPenalty?: number
  presencePenalty?: number
  apiKey?: string
  baseUrl?: string
}

export interface LLMResponse {
  text: string
  tokensUsed?: number
  model: string
  provider: string
}

export abstract class BaseLLMProvider {
  protected config: LLMConfig
  protected provider: string

  constructor(provider: string, config: LLMConfig) {
    this.provider = provider
    this.config = config
  }

  abstract initialize(): Promise<void>
  abstract generate(prompt: string): Promise<LLMResponse>
  abstract stream(prompt: string): AsyncGenerator<string>
  abstract destroy(): Promise<void>

  getStats() {
    return {
      provider: this.provider,
      model: this.config.model,
      configured: true,
    }
  }
}

/**
 * Ollama Provider - Local LLM
 */
class OllamaProvider extends BaseLLMProvider {
  constructor(config: LLMConfig) {
    super('ollama', {
      baseUrl: 'http://localhost:11434',
      ...config,
    })
  }

  async initialize(): Promise<void> {
    try {
      // Check if Ollama is running
      const response = await fetch(`${this.config.baseUrl}/api/tags`)
      if (!response.ok) {
        throw new Error('Ollama server not responding')
      }
      logger.info('Ollama provider initialized')
    } catch (error) {
      logger.error('Failed to initialize Ollama:', error)
      throw new Error('Ollama is not running. Please start Ollama first.')
    }
  }

  async generate(prompt: string): Promise<LLMResponse> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.config.model,
          prompt,
          temperature: this.config.temperature,
          options: {
            num_predict: this.config.maxTokens,
          },
          stream: false,
        }),
      })

      if (!response.ok) {
        throw new Error(`Ollama error: ${response.statusText}`)
      }

      const data = await response.json()

      return {
        text: data.response,
        tokensUsed: data.eval_count,
        model: this.config.model,
        provider: this.provider,
      }
    } catch (error) {
      logger.error('Ollama generation failed:', error)
      throw error
    }
  }

  async *stream(prompt: string): AsyncGenerator<string> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.config.model,
          prompt,
          temperature: this.config.temperature,
          stream: true,
        }),
      })

      if (!response.ok) {
        throw new Error(`Ollama error: ${response.statusText}`)
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
            if (data.response) {
              yield data.response
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    } catch (error) {
      logger.error('Ollama streaming failed:', error)
      throw error
    }
  }

  async destroy(): Promise<void> {
    // No cleanup needed for Ollama
  }
}

/**
 * OpenAI Provider
 */
class OpenAIProvider extends BaseLLMProvider {
  constructor(config: LLMConfig) {
    super('openai', {
      baseUrl: 'https://api.openai.com/v1',
      ...config,
    })
  }

  async initialize(): Promise<void> {
    if (!this.config.apiKey) {
      throw new Error('OpenAI API key not provided')
    }
    logger.info('OpenAI provider initialized')
  }

  async generate(prompt: string): Promise<LLMResponse> {
    try {
      const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: this.config.model || 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          temperature: this.config.temperature,
          max_tokens: this.config.maxTokens,
          top_p: this.config.topP,
          frequency_penalty: this.config.frequencyPenalty,
          presence_penalty: this.config.presencePenalty,
        }),
      })

      if (!response.ok) {
        throw new Error(`OpenAI error: ${response.statusText}`)
      }

      const data = await response.json()

      return {
        text: data.choices[0].message.content,
        tokensUsed: data.usage?.total_tokens,
        model: data.model,
        provider: this.provider,
      }
    } catch (error) {
      logger.error('OpenAI generation failed:', error)
      throw error
    }
  }

  async *stream(prompt: string): AsyncGenerator<string> {
    try {
      const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: this.config.model || 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          temperature: this.config.temperature,
          stream: true,
        }),
      })

      if (!response.ok) {
        throw new Error(`OpenAI error: ${response.statusText}`)
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response body')

      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk
          .split('\n')
          .filter(line => line.startsWith('data: '))

        for (const line of lines) {
          const data = line.replace('data: ', '')
          if (data === '[DONE]') continue

          try {
            const parsed = JSON.parse(data)
            const content = parsed.choices[0]?.delta?.content
            if (content) yield content
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    } catch (error) {
      logger.error('OpenAI streaming failed:', error)
      throw error
    }
  }

  async destroy(): Promise<void> {
    // No cleanup needed
  }
}

/**
 * Claude Provider (Anthropic)
 */
class ClaudeProvider extends BaseLLMProvider {
  constructor(config: LLMConfig) {
    super('claude', {
      baseUrl: 'https://api.anthropic.com/v1',
      ...config,
    })
  }

  async initialize(): Promise<void> {
    if (!this.config.apiKey) {
      throw new Error('Claude API key not provided')
    }
    logger.info('Claude provider initialized')
  }

  async generate(prompt: string): Promise<LLMResponse> {
    try {
      const response = await fetch(`${this.config.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.config.apiKey!,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: this.config.model || 'claude-3-sonnet-20240229',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: this.config.maxTokens || 1024,
          temperature: this.config.temperature,
        }),
      })

      if (!response.ok) {
        throw new Error(`Claude error: ${response.statusText}`)
      }

      const data = await response.json()

      return {
        text: data.content[0].text,
        tokensUsed: data.usage?.input_tokens + data.usage?.output_tokens,
        model: data.model,
        provider: this.provider,
      }
    } catch (error) {
      logger.error('Claude generation failed:', error)
      throw error
    }
  }

  async *stream(prompt: string): AsyncGenerator<string> {
    // Similar to OpenAI but with Claude's format
    throw new Error('Streaming not implemented for Claude yet')
  }

  async destroy(): Promise<void> {
    // No cleanup needed
  }
}

/**
 * LLM Provider Factory
 */
export class LLMProvider {
  private provider: BaseLLMProvider | null = null

  constructor(providerName: string) {
    this.providerName = providerName
  }

  private providerName: string

  async initialize(config: LLMConfig): Promise<void> {
    switch (this.providerName) {
      case 'ollama':
        this.provider = new OllamaProvider(config)
        break
      case 'openai':
        this.provider = new OpenAIProvider(config)
        break
      case 'claude':
        this.provider = new ClaudeProvider(config)
        break
      default:
        throw new Error(`Unknown LLM provider: ${this.providerName}`)
    }

    await this.provider.initialize()
  }

  async generate(prompt: string): Promise<LLMResponse> {
    if (!this.provider) {
      throw new Error('LLM provider not initialized')
    }
    return this.provider.generate(prompt)
  }

  async *stream(prompt: string): AsyncGenerator<string> {
    if (!this.provider) {
      throw new Error('LLM provider not initialized')
    }
    yield* this.provider.stream(prompt)
  }

  getStats() {
    return (
      this.provider?.getStats() || {
        provider: this.providerName,
        configured: false,
      }
    )
  }

  async destroy(): Promise<void> {
    if (this.provider) {
      await this.provider.destroy()
    }
  }
}
