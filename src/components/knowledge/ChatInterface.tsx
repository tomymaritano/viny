import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Sparkles, FileText, Hash, MoreVertical, X } from 'lucide-react'
import { useKnowledgeStore } from '../../stores/knowledgeStore'
import { useStreamingResponse } from '../../hooks/useStreamingResponse'
import { useChatContext } from '../../hooks/useChatContext'
import type { ChatMessage as ChatMessageType } from '../../types/knowledge'
import { useToast } from '../../hooks/useToast'
import { formatDistanceToNow } from 'date-fns'
import { CommandPalette } from './CommandPalette'
import type { SLASH_COMMANDS } from '../../config/slashCommands'

interface ChatInterfaceProps {
  className?: string
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  className = '',
}) => {
  const [input, setInput] = useState('')
  const [showCommandPalette, setShowCommandPalette] = useState(false)
  const [commandFilter, setCommandFilter] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const {
    activeConversationId,
    conversations,
    addMessage,
    streamingMessageId,
  } = useKnowledgeStore()

  const { showError } = useToast()
  const { streamedContent, isStreaming, startStreaming } =
    useStreamingResponse()
  const { context, clearContext } = useChatContext(activeConversationId || '')

  const activeConversation = conversations.find(
    c => c.id === activeConversationId
  )
  const messages = activeConversation?.messages || []

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, streamedContent, scrollToBottom])

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setInput(value)

    // Check for slash commands
    if (value.startsWith('/')) {
      const command = value.split(' ')[0]
      setCommandFilter(command)
      setShowCommandPalette(true)
    } else {
      setShowCommandPalette(false)
      setCommandFilter('')
    }
  }

  // Handle command selection
  const handleCommandSelect = (command: (typeof SLASH_COMMANDS)[0]) => {
    const args = input.substring(command.command.length).trim()
    setInput('')
    setShowCommandPalette(false)

    // Execute command
    handleCommandExecution(command, args)
  }

  // Execute slash command
  const handleCommandExecution = async (
    command: (typeof SLASH_COMMANDS)[0],
    args: string
  ) => {
    if (!activeConversationId) return

    // Add user message
    const userMessage: ChatMessageType = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: `${command.command} ${args}`,
      timestamp: new Date(),
      context,
    }

    addMessage(activeConversationId, userMessage)

    try {
      const result = await command.handler(args)

      // Add assistant response
      const assistantMessage: ChatMessageType = {
        id: `msg-${Date.now()}-response`,
        role: 'assistant',
        content: result,
        timestamp: new Date(),
        context,
      }

      addMessage(activeConversationId, assistantMessage)
    } catch (error) {
      showError(`Failed to execute ${command.command}`)
    }
  }

  // Handle message submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim() || !activeConversationId || isStreaming) return

    const userMessage: ChatMessageType = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
      context,
    }

    addMessage(activeConversationId, userMessage)
    setInput('')

    // Create streaming message
    const streamingMessage: ChatMessageType = {
      id: `msg-${Date.now()}-stream`,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      streaming: true,
      context,
    }

    addMessage(activeConversationId, streamingMessage)

    try {
      await startStreaming(userMessage.content, chunk => {
        // Update streaming message content
        const updatedMessage = {
          ...streamingMessage,
          content: streamingMessage.content + chunk,
        }

        // Update message in store
        useKnowledgeStore
          .getState()
          .updateMessage(
            activeConversationId,
            streamingMessage.id,
            updatedMessage
          )
      })

      // Mark streaming as complete
      useKnowledgeStore
        .getState()
        .updateMessage(activeConversationId, streamingMessage.id, {
          streaming: false,
        })
    } catch (error) {
      showError('Failed to get response')

      // Update message with error
      useKnowledgeStore
        .getState()
        .updateMessage(activeConversationId, streamingMessage.id, {
          streaming: false,
          error: 'Failed to get response',
        })
    }
  }

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as any)
    }
  }

  if (!activeConversation) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center space-y-4">
          <Sparkles className="w-16 h-16 mx-auto text-muted-foreground" />
          <h3 className="text-lg font-semibold">Start a new conversation</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Ask questions about your notes, explore connections, or get
            summaries of your knowledge base
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex flex-col h-full bg-background ${className}`}>
      {/* Header */}
      <ChatHeader conversation={activeConversation} />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map(message => (
            <ChatMessage
              key={message.id}
              message={message}
              isStreaming={message.streaming}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t p-4">
        <div className="max-w-3xl mx-auto relative">
          {showCommandPalette && (
            <CommandPalette
              filter={commandFilter}
              onSelect={handleCommandSelect}
              onClose={() => setShowCommandPalette(false)}
            />
          )}

          <div className="flex gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your notes..."
              className="flex-1 resize-none rounded-lg border bg-background px-4 py-3 min-h-[56px] max-h-32"
              rows={1}
              disabled={isStreaming}
            />

            <button
              type="submit"
              disabled={!input.trim() || isStreaming}
              className="px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            <span>Press / for commands</span>
            <span>Shift+Enter for new line</span>
          </div>
        </div>
      </form>
    </div>
  )
}

// Chat header component
const ChatHeader: React.FC<{
  conversation: any
}> = ({ conversation }) => {
  return (
    <div className="border-b px-4 py-3">
      <div className="max-w-3xl mx-auto flex items-center justify-between">
        <div>
          <h2 className="font-semibold">{conversation.title}</h2>
          <p className="text-sm text-muted-foreground">
            {conversation.messages.length} messages
          </p>
        </div>

        <button className="p-2 hover:bg-accent rounded-lg">
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// Chat message component
const ChatMessage: React.FC<{
  message: ChatMessageType
  isStreaming?: boolean
}> = ({ message, isStreaming }) => {
  const [showContext, setShowContext] = useState(false)

  return (
    <div
      className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}
    >
      {message.role === 'assistant' && (
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-4 h-4 text-primary" />
        </div>
      )}

      <div
        className={`flex-1 max-w-[80%] ${message.role === 'user' ? 'text-right' : ''}`}
      >
        <div
          className={`inline-block px-4 py-3 rounded-lg ${
            message.role === 'user'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted'
          }`}
        >
          <div className="whitespace-pre-wrap">{message.content}</div>

          {isStreaming && (
            <div className="mt-2 flex items-center gap-1">
              <div className="w-2 h-2 bg-current rounded-full animate-pulse" />
              <div className="w-2 h-2 bg-current rounded-full animate-pulse delay-75" />
              <div className="w-2 h-2 bg-current rounded-full animate-pulse delay-150" />
            </div>
          )}

          {message.error && (
            <div className="mt-2 text-sm text-destructive">{message.error}</div>
          )}
        </div>

        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
          <span>
            {formatDistanceToNow(message.timestamp, { addSuffix: true })}
          </span>

          {message.context &&
            (message.context.noteIds.length > 0 ||
              message.context.tags.length > 0) && (
              <button
                onClick={() => setShowContext(!showContext)}
                className="hover:text-foreground"
              >
                {showContext ? 'Hide' : 'Show'} context
              </button>
            )}
        </div>

        {showContext && message.context && (
          <ContextVisualization context={message.context} />
        )}
      </div>

      {message.role === 'user' && (
        <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-medium">You</span>
        </div>
      )}
    </div>
  )
}

// Context visualization component
const ContextVisualization: React.FC<{
  context: ChatMessageType['context']
}> = ({ context }) => {
  if (!context) return null

  return (
    <div className="mt-2 p-3 bg-muted/50 rounded-lg">
      <div className="text-xs text-muted-foreground mb-2">
        Context used for this response:
      </div>

      {context.noteIds.length > 0 && (
        <div className="space-y-1 mb-2">
          {context.noteIds.map(noteId => (
            <div
              key={noteId}
              className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary"
            >
              <FileText className="w-3 h-3" />
              <span>Note: {noteId}</span>
            </div>
          ))}
        </div>
      )}

      {context.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {context.tags.map(tag => (
            <div
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-1 bg-background rounded text-xs"
            >
              <Hash className="w-3 h-3" />
              <span>{tag}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ChatInterface
