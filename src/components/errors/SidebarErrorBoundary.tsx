/**
 * Sidebar Error Boundary - Handles sidebar-specific errors
 * Provides fallback UI that maintains app functionality
 */

import type { ReactNode } from 'react'
import React, { Component } from 'react'
import { logger } from '../../utils/logger'
import { Icons } from '../Icons'

interface SidebarErrorBoundaryProps {
  children: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface SidebarErrorBoundaryState {
  hasError: boolean
  error: Error | null
  isCollapsed: boolean
}

export class SidebarErrorBoundary extends Component<
  SidebarErrorBoundaryProps,
  SidebarErrorBoundaryState
> {
  constructor(props: SidebarErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      isCollapsed: false,
    }
  }

  static getDerivedStateFromError(
    error: Error
  ): Partial<SidebarErrorBoundaryState> {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('Sidebar Error Boundary triggered', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorBoundary: 'SidebarErrorBoundary',
    })

    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
    })
  }

  private handleCollapse = () => {
    this.setState({ isCollapsed: !this.state.isCollapsed })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-64 h-full bg-theme-bg-secondary border-r border-theme-border-primary flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-theme-border-primary">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-theme-text-primary">
                Sidebar Error
              </h2>
              <button
                onClick={this.handleCollapse}
                className="p-1 hover:bg-theme-bg-tertiary rounded transition-colors"
                title="Toggle details"
              >
                {this.state.isCollapsed ? (
                  <Icons.ChevronDown size={16} />
                ) : (
                  <Icons.ChevronUp size={16} />
                )}
              </button>
            </div>
          </div>

          {/* Error Content */}
          <div className="flex-1 p-4">
            <div className="text-center">
              <Icons.AlertTriangle
                size={32}
                className="text-red-500 mx-auto mb-3"
              />
              <p className="text-sm text-theme-text-secondary mb-4">
                The sidebar encountered an error and couldn't load properly.
              </p>

              {!this.state.isCollapsed && this.state.error && (
                <div className="mb-4 p-3 bg-theme-bg-tertiary rounded border text-left">
                  <div className="text-xs font-mono text-red-600 break-words">
                    {this.state.error.message}
                  </div>
                </div>
              )}

              <button
                onClick={this.handleRetry}
                className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors flex items-center justify-center"
              >
                <Icons.RotateCcw size={14} className="mr-2" />
                Retry
              </button>
            </div>
          </div>

          {/* Minimal Navigation Fallback */}
          <div className="p-4 border-t border-theme-border-primary">
            <div className="space-y-2">
              <button
                onClick={() => (window.location.hash = '#notes')}
                className="w-full text-left px-3 py-2 text-sm text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg-tertiary rounded transition-colors"
              >
                📝 Notes
              </button>
              <button
                onClick={() => (window.location.hash = '#settings')}
                className="w-full text-left px-3 py-2 text-sm text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg-tertiary rounded transition-colors"
              >
                ⚙️ Settings
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default SidebarErrorBoundary
