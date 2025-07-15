/**
 * Centralized error logging service
 * Handles error reporting, logging, and monitoring for production environments
 */

export interface ErrorReport {
  error: Error
  errorInfo?: React.ErrorInfo
  context?: string
  component?: string
  userId?: string
  sessionId?: string
  timestamp: string
  userAgent: string
  url: string
  stack?: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  metadata?: Record<string, unknown>
}

export interface ErrorLoggerConfig {
  enabled: boolean
  logToConsole: boolean
  maxReports: number
  apiEndpoint?: string
  environment: 'development' | 'production' | 'test'
}

class ErrorLogger {
  private config: ErrorLoggerConfig
  private errorQueue: ErrorReport[] = []
  private sessionId: string

  constructor(config: Partial<ErrorLoggerConfig> = {}) {
    this.config = {
      enabled: process.env.NODE_ENV === 'production',
      logToConsole: process.env.NODE_ENV === 'development',
      maxReports: 100,
      environment: (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development',
      ...config
    }

    this.sessionId = this.generateSessionId()
    
    // Set up global error handlers
    if (this.config.enabled) {
      this.setupGlobalErrorHandlers()
    }
  }

  /**
   * Log an error with context information
   */
  logError(
    error: Error,
    options: {
      errorInfo?: React.ErrorInfo
      context?: string
      component?: string
      severity?: ErrorReport['severity']
      metadata?: Record<string, unknown>
    } = {}
  ): void {
    if (!this.config.enabled && !this.config.logToConsole) {
      return
    }

    const errorReport: ErrorReport = {
      error,
      errorInfo: options.errorInfo,
      context: options.context || 'Unknown',
      component: options.component,
      severity: options.severity || this.determineSeverity(error),
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      stack: error.stack,
      sessionId: this.sessionId,
      metadata: {
        ...options.metadata,
        notesCount: this.getNotesCount(),
        memoryUsage: this.getMemoryUsage(),
        connectionType: this.getConnectionType()
      }
    }

    // Console logging for development
    if (this.config.logToConsole) {
      this.logToConsole(errorReport)
    }

    // Store error report
    this.storeErrorReport(errorReport)

    // Send to external service if configured
    if (this.config.apiEndpoint && this.config.enabled) {
      this.sendErrorReport(errorReport)
    }
  }

  /**
   * Log component-specific errors
   */
  logComponentError(
    component: string,
    error: Error,
    errorInfo?: React.ErrorInfo,
    metadata?: Record<string, unknown>
  ): void {
    this.logError(error, {
      component,
      errorInfo,
      context: `Component: ${component}`,
      severity: 'medium',
      metadata
    })
  }

  /**
   * Log storage-related errors
   */
  logStorageError(
    operation: string,
    error: Error,
    metadata?: Record<string, unknown>
  ): void {
    this.logError(error, {
      context: `Storage: ${operation}`,
      severity: 'high',
      metadata: {
        ...metadata,
        operation,
        storageType: this.getStorageType()
      }
    })
  }

  /**
   * Log search-related errors
   */
  logSearchError(
    query: string,
    error: Error,
    metadata?: Record<string, unknown>
  ): void {
    this.logError(error, {
      context: `Search: "${query}"`,
      severity: 'low',
      metadata: {
        ...metadata,
        searchQuery: query,
        queryLength: query.length
      }
    })
  }

  /**
   * Get all stored error reports
   */
  getErrorReports(): ErrorReport[] {
    return [...this.errorQueue]
  }

  /**
   * Clear all stored error reports
   */
  clearErrorReports(): void {
    this.errorQueue = []
  }

  /**
   * Get error statistics
   */
  getErrorStats(): {
    total: number
    bySeverity: Record<string, number>
    byComponent: Record<string, number>
    recent: ErrorReport[]
  } {
    const total = this.errorQueue.length
    const bySeverity = this.errorQueue.reduce((acc, report) => {
      acc[report.severity] = (acc[report.severity] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const byComponent = this.errorQueue.reduce((acc, report) => {
      const component = report.component || 'Unknown'
      acc[component] = (acc[component] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const recent = this.errorQueue.slice(-10).reverse()

    return { total, bySeverity, byComponent, recent }
  }

  private generateSessionId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
  }

  private determineSeverity(error: Error): ErrorReport['severity'] {
    const message = error.message.toLowerCase()
    
    if (message.includes('storage') || message.includes('quota')) {
      return 'critical'
    }
    if (message.includes('network') || message.includes('fetch')) {
      return 'high'
    }
    if (message.includes('render') || message.includes('component')) {
      return 'medium'
    }
    
    return 'low'
  }

  private logToConsole(errorReport: ErrorReport): void {
    const { error, component, context, severity, metadata } = errorReport
    
    const style = this.getConsoleStyle(severity)
    console.group(`%c🚨 ${severity.toUpperCase()} ERROR`, style)
    console.log(`Context: ${context}`)
    if (component) console.log(`Component: ${component}`)
    console.log(`Message: ${error.message}`)
    if (metadata) console.log('Metadata:', metadata)
    console.log('Full Error:', error)
    if (errorReport.errorInfo) {
      console.log('Component Stack:', errorReport.errorInfo.componentStack)
    }
    console.groupEnd()
  }

  private getConsoleStyle(severity: ErrorReport['severity']): string {
    const styles = {
      low: 'color: #3b82f6; font-weight: bold;',
      medium: 'color: #f59e0b; font-weight: bold;',
      high: 'color: #ef4444; font-weight: bold;',
      critical: 'color: #dc2626; font-weight: bold; background: #fee2e2;'
    }
    return styles[severity]
  }

  private storeErrorReport(errorReport: ErrorReport): void {
    this.errorQueue.push(errorReport)
    
    // Keep only the most recent reports
    if (this.errorQueue.length > this.config.maxReports) {
      this.errorQueue = this.errorQueue.slice(-this.config.maxReports)
    }

    // Store in localStorage for persistence
    try {
      const stored = localStorage.getItem('viny_error_reports')
      const reports = stored ? JSON.parse(stored) : []
      reports.push({
        ...errorReport,
        error: {
          name: errorReport.error.name,
          message: errorReport.error.message,
          stack: errorReport.error.stack
        }
      })
      
      // Keep only recent reports in localStorage
      const recentReports = reports.slice(-20)
      localStorage.setItem('viny_error_reports', JSON.stringify(recentReports))
    } catch (storageError) {
      console.warn('Failed to store error report in localStorage:', storageError)
    }
  }

  private async sendErrorReport(errorReport: ErrorReport): Promise<void> {
    try {
      const response = await fetch(this.config.apiEndpoint!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...errorReport,
          error: {
            name: errorReport.error.name,
            message: errorReport.error.message,
            stack: errorReport.error.stack
          }
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to send error report: ${response.status}`)
      }
    } catch (sendError) {
      console.warn('Failed to send error report to external service:', sendError)
    }
  }

  private setupGlobalErrorHandlers(): void {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.logError(new Error(event.reason), {
        context: 'Unhandled Promise Rejection',
        severity: 'high',
        metadata: { reason: event.reason }
      })
    })

    // Handle global JavaScript errors
    window.addEventListener('error', (event) => {
      this.logError(event.error || new Error(event.message), {
        context: 'Global JavaScript Error',
        severity: 'high',
        metadata: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        }
      })
    })
  }

  private getNotesCount(): number {
    try {
      // Try to get notes count from storage
      const notes = localStorage.getItem('viny_notes')
      return notes ? JSON.parse(notes).length : 0
    } catch {
      return 0
    }
  }

  private getMemoryUsage(): { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } | null {
    try {
      // @ts-ignore - performance.memory is not in all browsers
      return performance.memory ? {
        usedJSHeapSize: performance.memory.usedJSHeapSize,
        totalJSHeapSize: performance.memory.totalJSHeapSize,
        jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
      } : null
    } catch {
      return null
    }
  }

  private getConnectionType(): string {
    try {
      // @ts-ignore - navigator.connection is experimental
      return navigator.connection?.effectiveType || 'unknown'
    } catch {
      return 'unknown'
    }
  }

  private getStorageType(): string {
    // Determine if using Electron storage or localStorage
    return window.electronAPI ? 'electron' : 'localStorage'
  }
}

// Create singleton instance
export const errorLogger = new ErrorLogger()

// Export helper functions for common use cases
export const logError = errorLogger.logError.bind(errorLogger)
export const logComponentError = errorLogger.logComponentError.bind(errorLogger)
export const logStorageError = errorLogger.logStorageError.bind(errorLogger)
export const logSearchError = errorLogger.logSearchError.bind(errorLogger)

export default errorLogger