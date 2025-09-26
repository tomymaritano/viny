/**
 * Chat Interface for RAG System
 * Interactive Q&A with your notes
 */

import React, { useState, useRef, useEffect } from 'react'
import { Icons } from '../Icons'
import type { RAGSystem } from '@/lib/rag'
import { type RAGResponse } from '@/lib/rag'
import { useAppStore } from '@/stores/newSimpleStore'
import { logger } from '@/utils/logger'

interface Message {
  id: string
  type: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  sources?: RAGResponse['sources']
  isStreaming?: boolean
}

interface ChatInterfaceProps {
  ragSystem: RAGSystem
  onClose?: () => void
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  ragSystem,
  onClose,
}) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showSources, setShowSources] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const { notes, selectedNote } = useAppStore()

  useEffect(() => {
    // Add welcome message
    setMessages([
      {
        id: 'welcome',
        type: 'system',
        content:
          'Hi! I can help you explore your notes. Ask me anything about your knowledge base.',
        timestamp: new Date(),
      },
    ])
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      // Create assistant message for streaming
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        type: 'assistant',
        content: '',
        timestamp: new Date(),
        isStreaming: true,
      }

      setMessages(prev => [...prev, assistantMessage])

      // Stream response
      let fullContent = ''
      const startTime = Date.now()

      for await (const chunk of ragSystem.streamQuery({
        query: input.trim(),
        noteIds: selectedNote ? [selectedNote.id] : undefined,
        limit: 5,
        includeMetadata: true,
      })) {
        fullContent += chunk
        setMessages(prev =>
          prev.map(msg =>
            msg.id === assistantMessage.id
              ? { ...msg, content: fullContent }
              : msg
          )
        )
      }

      // Get full response with sources
      const response = await ragSystem.query({
        query: input.trim(),
        noteIds: selectedNote ? [selectedNote.id] : undefined,
        limit: 5,
        includeMetadata: true,
      })

      // Update message with sources
      setMessages(prev =>
        prev.map(msg =>
          msg.id === assistantMessage.id
            ? {
                ...msg,
                content: response.answer,
                sources: response.sources,
                isStreaming: false,
              }
            : msg
        )
      )

      logger.debug('RAG query completed', {
        query: input.trim(),
        latency: Date.now() - startTime,
        sources: response.sources.length,
      })
    } catch (error) {
      logger.error('Failed to get RAG response:', error)

      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        type: 'system',
        content:
          'Sorry, I encountered an error while processing your question. Please try again.',
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as any)
    }
  }

  const formatSource = (source: RAGResponse['sources'][0]) => {
    return (
      <div className="text-xs bg-gray-100 dark:bg-gray-800 rounded p-2 mt-2">
        <div className="font-medium text-gray-700 dark:text-gray-300">
          {source.noteTitle}
        </div>
        <div className="text-gray-600 dark:text-gray-400 mt-1">
          {source.snippet}
        </div>
        <div className="text-gray-500 dark:text-gray-500 mt-1">
          Relevance: {(source.score * 100).toFixed(1)}%
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Icons.MessageSquare className="w-5 h-5" />
          <h2 className="text-lg font-semibold">Ask Your Notes</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSources(!showSources)}
            className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 
                     dark:hover:text-gray-100 rounded-lg hover:bg-gray-100 
                     dark:hover:bg-gray-800"
            title={showSources ? 'Hide sources' : 'Show sources'}
          >
            <Icons.FileText className="w-4 h-4" />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 
                       dark:hover:text-gray-100 rounded-lg hover:bg-gray-100 
                       dark:hover:bg-gray-800"
            >
              <Icons.X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(message => (
          <div
            key={message.id}
            className={`flex ${
              message.type === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.type === 'user'
                  ? 'bg-blue-500 text-white'
                  : message.type === 'system'
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
              }`}
            >
              <div className="whitespace-pre-wrap">{message.content}</div>

              {message.isStreaming && (
                <div className="inline-block w-2 h-4 bg-current animate-pulse ml-1" />
              )}

              {showSources && message.sources && message.sources.length > 0 && (
                <div className="mt-3 space-y-2">
                  <div className="text-xs font-medium opacity-70">Sources:</div>
                  {message.sources.map((source, idx) => (
                    <div key={idx}>{formatSource(source)}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="p-4 border-t dark:border-gray-700"
      >
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about your notes..."
            className="flex-1 px-3 py-2 border rounded-lg resize-none
                     dark:bg-gray-800 dark:border-gray-600 dark:text-white
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={2}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg
                     hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed
                     transition-colors"
          >
            {isLoading ? (
              <Icons.Loader className="w-5 h-5 animate-spin" />
            ) : (
              <Icons.Send className="w-5 h-5" />
            )}
          </button>
        </div>

        {selectedNote && (
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Searching in: {selectedNote.title}
          </div>
        )}
      </form>
    </div>
  )
}
