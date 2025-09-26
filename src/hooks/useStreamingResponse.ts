import { useState, useCallback } from 'react'
import { useToast } from './useToast'
import { apiLogger } from '../utils/logger'

export const useStreamingResponse = () => {
  const [streamedContent, setStreamedContent] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const { showError } = useToast()

  const startStreaming = useCallback(
    async (
      prompt: string,
      onChunk: (chunk: string) => void,
      options?: {
        maxTokens?: number
        temperature?: number
        model?: string
      }
    ) => {
      setIsStreaming(true)
      setStreamedContent('')

      try {
        const response = await fetch('/api/chat/stream', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'text/event-stream',
          },
          body: JSON.stringify({
            prompt,
            ...options,
          }),
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const reader = response.body?.getReader()
        const decoder = new TextDecoder()

        if (!reader) {
          throw new Error('No response body')
        }

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })

          // Parse SSE data
          const lines = chunk.split('\n')
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6)
              if (data === '[DONE]') {
                break
              }

              try {
                const parsed = JSON.parse(data)
                if (parsed.content) {
                  setStreamedContent(prev => prev + parsed.content)
                  onChunk(parsed.content)
                }
              } catch (e) {
                apiLogger.error('Failed to parse SSE data:', e)
              }
            }
          }
        }
      } catch (error) {
        apiLogger.error('Streaming error:', error)
        showError('Failed to stream response')
        throw error
      } finally {
        setIsStreaming(false)
      }
    },
    [showError]
  )

  const cancelStreaming = useCallback(() => {
    // In a real implementation, you'd cancel the fetch request
    setIsStreaming(false)
  }, [])

  return {
    streamedContent,
    isStreaming,
    startStreaming,
    cancelStreaming,
  }
}
