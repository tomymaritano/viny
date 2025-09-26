/**
 * ChatPanel - AI Chat Interface for Viny
 *
 * Provides a conversational interface to interact with your notes using RAG
 */

import React, { useState, useRef, useEffect } from 'react'
import { ollamaService, ragService, type RAGContext } from '../../services/ai'
import { Icons } from '../Icons'
import { Button } from '../ui/ButtonRadix'
import { useToast } from '../../hooks/useToast'
import { useAppStore } from '../../stores/newSimpleStore'
import { cn } from '../../lib/utils'
import { apiLogger } from '../../utils/logger'

interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  context?: RAGContext[]
  isStreaming?: boolean
}

interface ChatPanelProps {
  className?: string
  onClose?: () => void
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ className, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isOllamaAvailable, setIsOllamaAvailable] = useState(false)
  const [isDexieEnabled, setIsDexieEnabled] = useState(false)
  const [currentStreamingId, setCurrentStreamingId] = useState<string | null>(
    null
  )
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const { showToast } = useToast()
  const { currentNote } = useAppStore()

  useEffect(() => {
    checkServices()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const checkServices = async () => {
    try {
      const availability = await ragService.checkAvailability()
      setIsOllamaAvailable(availability.ollama)
      setIsDexieEnabled(availability.repository)

      if (!availability.ollama) {
        showToast({
          title: 'Ollama Not Available',
          description: 'Please install and run Ollama to use AI features',
          variant: 'warning',
        })
      }

      if (!availability.repository) {
        showToast({
          title: 'Dexie Not Enabled',
          description: 'Enable Dexie in Settings → Storage for AI features',
          variant: 'warning',
        })
      }
    } catch (error) {
      apiLogger.error('Failed to check services:', error)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()

    if (!input.trim() || isLoading || !isOllamaAvailable || !isDexieEnabled)
      return

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    const assistantMessage: Message = {
      id: `msg_${Date.now() + 1}`,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    }

    setMessages(prev => [...prev, assistantMessage])
    setCurrentStreamingId(assistantMessage.id)

    try {
      let fullResponse = ''
      const stream = ragService.streamQuery(userMessage.content, {
        maxContextNotes: 3,
        similarityThreshold: 0.6,
      })

      for await (const chunk of stream) {
        fullResponse += chunk
        setMessages(prev =>
          prev.map(msg =>
            msg.id === assistantMessage.id
              ? { ...msg, content: fullResponse }
              : msg
          )
        )
      }

      // Get the context that was used
      const result = await ragService.query(userMessage.content, {
        maxContextNotes: 3,
        similarityThreshold: 0.6,
      })

      setMessages(prev =>
        prev.map(msg =>
          msg.id === assistantMessage.id
            ? {
                ...msg,
                content: fullResponse,
                context: result.context,
                isStreaming: false,
              }
            : msg
        )
      )
    } catch (error) {
      apiLogger.error('Chat error:', error)
      showToast({
        title: 'Chat Error',
        description:
          error instanceof Error ? error.message : 'Failed to get response',
        variant: 'destructive',
      })

      setMessages(prev =>
        prev.map(msg =>
          msg.id === assistantMessage.id
            ? {
                ...msg,
                content: 'Sorry, I encountered an error. Please try again.',
                isStreaming: false,
              }
            : msg
        )
      )
    } finally {
      setIsLoading(false)
      setCurrentStreamingId(null)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const clearChat = () => {
    setMessages([])
  }

  const renderMessage = (message: Message) => {
    const isUser = message.role === 'user'

    return (
      <div
        key={message.id}
        className={cn(
          'flex gap-3 p-4',
          isUser ? 'bg-theme-bg-secondary' : 'bg-theme-bg-primary'
        )}
      >
        <div
          className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
            isUser
              ? 'bg-theme-accent-primary text-white'
              : 'bg-theme-bg-tertiary'
          )}
        >
          {isUser ? (
            <Icons.user className="w-4 h-4" />
          ) : (
            <Icons.bot className="w-4 h-4" />
          )}
        </div>

        <div className="flex-1 space-y-2">
          <div className="prose prose-sm dark:prose-invert max-w-none">
            {message.content ||
              (message.isStreaming && (
                <span className="text-theme-text-secondary">Thinking...</span>
              ))}
            {message.isStreaming && <span className="animate-pulse">▊</span>}
          </div>

          {message.context &&
            message.context.length > 0 &&
            !message.isStreaming && (
              <div className="mt-3 pt-3 border-t border-theme-border-primary">
                <p className="text-xs text-theme-text-secondary mb-2">
                  Based on {message.context.length} relevant notes:
                </p>
                <div className="space-y-1">
                  {message.context.slice(0, 3).map((ctx, idx) => (
                    <div
                      key={idx}
                      className="text-xs text-theme-text-secondary hover:text-theme-text-primary cursor-pointer"
                      onClick={() => {
                        // Navigate to note
                        useAppStore.getState().setCurrentNote(ctx.noteId)
                      }}
                    >
                      •{' '}
                      {ctx.chunk?.substring(0, 100) ||
                        ctx.content.substring(0, 100)}
                      ...
                      <span className="ml-1 text-theme-accent-primary">
                        ({(ctx.similarity * 100).toFixed(0)}% match)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>
      </div>
    )
  }

  const suggestedQuestions = [
    'What are my recent notes about?',
    'Summarize my notes from this week',
    'Find connections between my notes',
    'What topics have I been focusing on?',
  ]

  return (
    <div className={cn('flex flex-col h-full bg-theme-bg-primary', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-theme-border-primary">
        <div className="flex items-center gap-2">
          <Icons.Sparkles className="w-5 h-5 text-theme-accent-primary" />
          <h2 className="text-lg font-semibold text-theme-text-primary">
            AI Assistant
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={clearChat}
            disabled={messages.length === 0}
          >
            <Icons.Trash className="w-4 h-4" />
          </Button>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <Icons.X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Service Status */}
      {(!isOllamaAvailable || !isDexieEnabled) && (
        <div className="px-4 py-2 bg-theme-warning/10 border-b border-theme-warning/20">
          <p className="text-xs text-theme-warning">
            {!isOllamaAvailable && 'Ollama is not running. '}
            {!isDexieEnabled && 'Dexie is not enabled. '}
            AI features are limited.
          </p>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="p-8 text-center">
            <Icons.MessageSquare className="w-12 h-12 mx-auto mb-4 text-theme-text-muted" />
            <p className="text-theme-text-secondary mb-6">
              Ask me anything about your notes!
            </p>
            <div className="space-y-2 max-w-md mx-auto">
              {suggestedQuestions.map((question, idx) => (
                <button
                  key={idx}
                  onClick={() => setInput(question)}
                  className="w-full text-left px-4 py-2 text-sm text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg-secondary rounded-md transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map(renderMessage)}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="p-4 border-t border-theme-border-primary"
      >
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your notes..."
            disabled={isLoading || !isOllamaAvailable || !isDexieEnabled}
            className="flex-1 px-3 py-2 bg-theme-bg-secondary border border-theme-border-primary rounded-md text-theme-text-primary placeholder-theme-text-muted resize-none focus:outline-none focus:ring-2 focus:ring-theme-accent-primary"
            rows={1}
            style={{ minHeight: '40px', maxHeight: '120px' }}
          />
          <Button
            type="submit"
            disabled={
              !input.trim() ||
              isLoading ||
              !isOllamaAvailable ||
              !isDexieEnabled
            }
            className="self-end"
          >
            {isLoading ? (
              <Icons.loader className="w-4 h-4 animate-spin" />
            ) : (
              <Icons.send className="w-4 h-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-theme-text-muted mt-2">
          Powered by Ollama (local) • Press Enter to send, Shift+Enter for new
          line
        </p>
      </form>
    </div>
  )
}

export default ChatPanel
