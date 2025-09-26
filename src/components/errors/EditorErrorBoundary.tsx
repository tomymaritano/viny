/**
 * Editor Error Boundary - Handles editor-specific errors
 * Provides fallback editor that preserves user content
 */

import type { ReactNode } from 'react'
import React, { Component } from 'react'
import { logger } from '../../utils/logger'
import { Icons } from '../Icons'

interface EditorErrorBoundaryProps {
  children: ReactNode
  noteContent?: string
  onContentSave?: (content: string) => void
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface EditorErrorBoundaryState {
  hasError: boolean
  error: Error | null
  fallbackContent: string
  isEditing: boolean
}

export class EditorErrorBoundary extends Component<
  EditorErrorBoundaryProps,
  EditorErrorBoundaryState
> {
  private textareaRef = React.createRef<HTMLTextAreaElement>()

  constructor(props: EditorErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      fallbackContent: props.noteContent || '',
      isEditing: false,
    }
  }

  static getDerivedStateFromError(
    error: Error
  ): Partial<EditorErrorBoundaryState> {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('Editor Error Boundary triggered', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorBoundary: 'EditorErrorBoundary',
      hasContent: !!this.props.noteContent,
      contentLength: this.props.noteContent?.length || 0,
    })

    // Preserve the content from props when error occurs
    if (
      this.props.noteContent &&
      this.props.noteContent !== this.state.fallbackContent
    ) {
      this.setState({
        fallbackContent: this.props.noteContent,
      })
    }

    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  private handleRetry = () => {
    // Save current content before retrying
    if (this.state.isEditing && this.props.onContentSave) {
      this.props.onContentSave(this.state.fallbackContent)
    }

    this.setState({
      hasError: false,
      error: null,
      isEditing: false,
    })
  }

  private handleContentChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    this.setState({
      fallbackContent: event.target.value,
    })
  }

  private handleStartEditing = () => {
    this.setState({ isEditing: true }, () => {
      // Focus the textarea when entering edit mode
      if (this.textareaRef.current) {
        this.textareaRef.current.focus()
      }
    })
  }

  private handleSave = () => {
    if (this.props.onContentSave) {
      this.props.onContentSave(this.state.fallbackContent)
    }
    this.setState({ isEditing: false })

    logger.info('Content saved from editor error boundary', {
      contentLength: this.state.fallbackContent.length,
    })
  }

  private handleCopyContent = () => {
    navigator.clipboard.writeText(this.state.fallbackContent).then(
      () => {
        alert('Content copied to clipboard!')
      },
      () => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea')
        textArea.value = this.state.fallbackContent
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        alert('Content copied to clipboard!')
      }
    )
  }

  componentDidUpdate(prevProps: EditorErrorBoundaryProps) {
    // Update fallback content if props change and we're not currently editing
    if (
      !this.state.isEditing &&
      this.props.noteContent !== prevProps.noteContent &&
      this.props.noteContent !== this.state.fallbackContent
    ) {
      this.setState({
        fallbackContent: this.props.noteContent || '',
      })
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-full flex flex-col bg-theme-bg-primary">
          {/* Error Header */}
          <div className="flex items-center justify-between p-4 border-b border-theme-border-primary bg-theme-bg-secondary">
            <div className="flex items-center">
              <Icons.AlertTriangle size={20} className="text-red-500 mr-2" />
              <h3 className="text-sm font-medium text-theme-text-primary">
                Editor Error - Fallback Mode
              </h3>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={this.handleCopyContent}
                className="px-3 py-1 text-xs bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors flex items-center"
                title="Copy content to clipboard"
              >
                <Icons.Copy size={14} className="mr-1" />
                Copy
              </button>
              <button
                onClick={this.handleRetry}
                className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors flex items-center"
              >
                <Icons.RotateCcw size={14} className="mr-1" />
                Retry
              </button>
            </div>
          </div>

          {/* Error Description */}
          <div className="p-4 bg-yellow-50 border-b border-yellow-200">
            <div className="flex items-start">
              <Icons.Info
                size={16}
                className="text-yellow-600 mr-2 mt-0.5 flex-shrink-0"
              />
              <div className="text-sm">
                <p className="text-yellow-800 mb-1">
                  The advanced editor encountered an error. You can continue
                  editing in basic mode.
                </p>
                <p className="text-yellow-700 text-xs">
                  Your content is preserved and can be saved. Click "Retry" to
                  restore the full editor.
                </p>
              </div>
            </div>
          </div>

          {/* Fallback Editor */}
          <div className="flex-1 p-4">
            {this.state.isEditing ? (
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-theme-text-secondary">
                    Basic Text Editor
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={this.handleSave}
                      className="px-3 py-1 text-sm bg-green-600 hover:bg-green-700 text-white rounded transition-colors flex items-center"
                    >
                      <Icons.Save size={14} className="mr-1" />
                      Save
                    </button>
                    <button
                      onClick={() => this.setState({ isEditing: false })}
                      className="px-3 py-1 text-sm bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
                <textarea
                  ref={this.textareaRef}
                  value={this.state.fallbackContent}
                  onChange={this.handleContentChange}
                  className="flex-1 w-full p-3 border border-theme-border-primary rounded bg-theme-bg-primary text-theme-text-primary resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  placeholder="Start typing your note content..."
                />
              </div>
            ) : (
              <div className="h-full">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-theme-text-secondary">
                    Content Preview
                  </span>
                  <button
                    onClick={this.handleStartEditing}
                    className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors flex items-center"
                  >
                    <Icons.Edit size={14} className="mr-1" />
                    Edit
                  </button>
                </div>
                <div className="h-full p-3 border border-theme-border-primary rounded bg-theme-bg-secondary overflow-auto">
                  {this.state.fallbackContent ? (
                    <pre className="whitespace-pre-wrap text-sm text-theme-text-primary font-mono">
                      {this.state.fallbackContent}
                    </pre>
                  ) : (
                    <div className="flex items-center justify-center h-full text-theme-text-secondary">
                      <div className="text-center">
                        <Icons.FileText
                          size={48}
                          className="mx-auto mb-2 opacity-50"
                        />
                        <p className="text-sm">No content available</p>
                        <button
                          onClick={this.handleStartEditing}
                          className="mt-2 text-blue-600 hover:text-blue-700 text-sm underline"
                        >
                          Start writing
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Error Details (Collapsible) */}
          {this.state.error && (
            <details className="border-t border-theme-border-primary">
              <summary className="p-3 cursor-pointer text-sm text-theme-text-secondary hover:text-theme-text-primary transition-colors">
                Technical Details
              </summary>
              <div className="p-3 bg-theme-bg-tertiary text-xs font-mono text-red-600 max-h-32 overflow-y-auto">
                {this.state.error.message}
              </div>
            </details>
          )}
        </div>
      )
    }

    return this.props.children
  }
}

export default EditorErrorBoundary
