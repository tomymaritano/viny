/**
 * Centralized error handling utilities
 */
import { logger } from './logger'

export enum ErrorType {
  VALIDATION = 'validation',
  NETWORK = 'network',
  PERMISSION = 'permission',
  STORAGE = 'storage',
  SYNC = 'sync',
  IMPORT_EXPORT = 'import_export',
  SEARCH = 'search',
  FILE_SYSTEM = 'file_system',
  UNKNOWN = 'unknown'
}

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface AppError {
  id: string
  type: ErrorType
  severity: ErrorSeverity
  message: string
  details?: string
  timestamp: Date
  context?: Record<string, any>
  stack?: string
  retry?: () => Promise<void>
  dismiss?: () => void
}

export class ErrorHandler {
  private static instance: ErrorHandler
  private errorListeners: ((error: AppError) => void)[] = []
  private errorHistory: AppError[] = []
  private maxHistorySize = 100

  private constructor() {}

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler()
    }
    return ErrorHandler.instance
  }

  // Subscribe to error events
  subscribe(listener: (error: AppError) => void): () => void {
    this.errorListeners.push(listener)
    return () => {
      this.errorListeners = this.errorListeners.filter(l => l !== listener)
    }
  }

  // Handle different types of errors
  handleError(error: Error | AppError | string, context?: Record<string, any>): AppError {
    const appError = this.normalizeError(error, context)
    
    // Log error
    this.logError(appError)
    
    // Store in history
    this.addToHistory(appError)
    
    // Notify listeners
    this.notifyListeners(appError)
    
    return appError
  }

  private normalizeError(error: Error | AppError | string, context?: Record<string, any>): AppError {
    // If already an AppError, return as is
    if (this.isAppError(error)) {
      return error
    }

    // Generate unique ID
    const id = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Handle string errors
    if (typeof error === 'string') {
      return {
        id,
        type: ErrorType.UNKNOWN,
        severity: ErrorSeverity.MEDIUM,
        message: error,
        timestamp: new Date(),
        context
      }
    }

    // Handle Error objects
    const errorObj = error as Error
    return {
      id,
      type: this.classifyError(errorObj),
      severity: this.determineSeverity(errorObj),
      message: this.getUserFriendlyMessage(errorObj),
      details: errorObj.message,
      timestamp: new Date(),
      context,
      stack: errorObj.stack
    }
  }

  private isAppError(error: any): error is AppError {
    return error && typeof error === 'object' && 'id' in error && 'type' in error
  }

  private classifyError(error: Error): ErrorType {
    const message = error.message.toLowerCase()
    const name = error.name.toLowerCase()

    if (message.includes('network') || message.includes('fetch') || name.includes('network')) {
      return ErrorType.NETWORK
    }
    if (message.includes('permission') || message.includes('access')) {
      return ErrorType.PERMISSION
    }
    if (message.includes('storage') || message.includes('quota')) {
      return ErrorType.STORAGE
    }
    if (message.includes('sync') || message.includes('synchronization')) {
      return ErrorType.SYNC
    }
    if (message.includes('import') || message.includes('export')) {
      return ErrorType.IMPORT_EXPORT
    }
    if (message.includes('search') || message.includes('index')) {
      return ErrorType.SEARCH
    }
    if (message.includes('file') || message.includes('path')) {
      return ErrorType.FILE_SYSTEM
    }

    return ErrorType.UNKNOWN
  }

  private determineSeverity(error: Error): ErrorSeverity {
    const message = error.message.toLowerCase()

    if (message.includes('critical') || message.includes('fatal') || message.includes('corruption')) {
      return ErrorSeverity.CRITICAL
    }
    if (message.includes('warning') || message.includes('deprecated')) {
      return ErrorSeverity.LOW
    }
    if (message.includes('permission') || message.includes('quota') || message.includes('network')) {
      return ErrorSeverity.HIGH
    }

    return ErrorSeverity.MEDIUM
  }

  private getUserFriendlyMessage(error: Error): string {
    const message = error.message.toLowerCase()

    // Network errors
    if (message.includes('fetch') || message.includes('network')) {
      return 'Network connection failed. Please check your internet connection.'
    }

    // Permission errors
    if (message.includes('permission') || message.includes('access')) {
      return 'Permission denied. Please check your access permissions.'
    }

    // Storage errors
    if (message.includes('quota') || message.includes('storage')) {
      return 'Storage quota exceeded. Please free up some space.'
    }

    // Sync errors
    if (message.includes('sync')) {
      return 'Synchronization failed. Your changes are saved locally.'
    }

    // Import/Export errors
    if (message.includes('import') || message.includes('export')) {
      return 'File operation failed. Please check the file format.'
    }

    // Search errors
    if (message.includes('search')) {
      return 'Search operation failed. Please try again.'
    }

    // Default to original message if no specific match
    return error.message
  }

  private logError(error: AppError): void {
    const logMethod = this.getLogMethod(error.severity)
    logMethod(`[${error.type}] ${error.message}`, {
      id: error.id,
      details: error.details,
      context: error.context,
      stack: error.stack
    })
  }

  private getLogMethod(severity: ErrorSeverity): (message: string, meta?: any) => void {
    switch (severity) {
      case ErrorSeverity.LOW:
        return (message: string, meta?: any) => logger.info(message, meta)
      case ErrorSeverity.MEDIUM:
        return (message: string, meta?: any) => logger.warn(message, meta)
      case ErrorSeverity.HIGH:
      case ErrorSeverity.CRITICAL:
        return (message: string, meta?: any) => logger.error(message, meta)
      default:
        return (message: string, meta?: any) => logger.error(message, meta)
    }
  }

  private addToHistory(error: AppError): void {
    this.errorHistory.unshift(error)
    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory = this.errorHistory.slice(0, this.maxHistorySize)
    }
  }

  private notifyListeners(error: AppError): void {
    this.errorListeners.forEach(listener => {
      try {
        listener(error)
      } catch (err) {
        logger.error('Error in error listener:', err)
      }
    })
  }

  // Public methods for retrieving errors
  getErrorHistory(): AppError[] {
    return [...this.errorHistory]
  }

  getErrorsBy(filter: Partial<Pick<AppError, 'type' | 'severity'>>): AppError[] {
    return this.errorHistory.filter(error => {
      return Object.entries(filter).every(([key, value]) => 
        error[key as keyof AppError] === value
      )
    })
  }

  clearErrorHistory(): void {
    this.errorHistory = []
  }

  // Helper methods for common error scenarios
  static handleNetworkError(error: Error, context?: Record<string, any>): AppError {
    const handler = ErrorHandler.getInstance()
    return handler.handleError(error, { ...context, type: ErrorType.NETWORK })
  }

  static handleValidationError(message: string, context?: Record<string, any>): AppError {
    const handler = ErrorHandler.getInstance()
    return handler.handleError({
      id: `validation_${Date.now()}`,
      type: ErrorType.VALIDATION,
      severity: ErrorSeverity.MEDIUM,
      message,
      timestamp: new Date(),
      context
    })
  }

  static handleStorageError(error: Error, context?: Record<string, any>): AppError {
    const handler = ErrorHandler.getInstance()
    return handler.handleError(error, { ...context, type: ErrorType.STORAGE })
  }

  static handleSyncError(error: Error, context?: Record<string, any>): AppError {
    const handler = ErrorHandler.getInstance()
    return handler.handleError(error, { ...context, type: ErrorType.SYNC })
  }
}

// Global error handler setup
export const setupGlobalErrorHandler = () => {
  const errorHandler = ErrorHandler.getInstance()

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason))
    errorHandler.handleError(error, { source: 'unhandledrejection' })
  })

  // Handle global JavaScript errors
  window.addEventListener('error', (event) => {
    const error = event.error || new Error(event.message)
    errorHandler.handleError(error, { 
      source: 'global',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    })
  })
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance()