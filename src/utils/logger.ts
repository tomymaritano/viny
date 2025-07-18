/**
 * Conditional logging utility to replace console.log statements
 * Only logs in development environment to keep production clean
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogConfig {
  enabled: boolean
  level: LogLevel
  prefix?: string
}

class Logger {
  private config: LogConfig
  private isDev: boolean

  constructor(config: Partial<LogConfig> = {}) {
    this.isDev = process.env.NODE_ENV === 'development'
    this.config = {
      enabled: this.isDev,
      level: 'debug',
      prefix: '',
      ...config
    }
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.config.enabled) return false
    
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    }
    
    return levels[level] >= levels[this.config.level]
  }

  private formatMessage(message: string, context?: string): string {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0]
    const prefix = this.config.prefix ? `[${this.config.prefix}]` : ''
    const contextStr = context ? `[${context}]` : ''
    
    return `${timestamp} ${prefix}${contextStr} ${message}`
  }

  debug(message: string, ...args: unknown[]): void
  debug(message: string, context: string, ...args: unknown[]): void
  debug(message: string, contextOrArg?: string | unknown, ...args: unknown[]): void {
    if (!this.shouldLog('debug')) return
    
    const isContext = typeof contextOrArg === 'string' && args.length >= 0
    const context = isContext ? contextOrArg as string : undefined
    const logArgs = isContext ? args : [contextOrArg, ...args].filter(arg => arg !== undefined)
    
    if (this.isDev) {
      console.log(this.formatMessage(message, context), ...logArgs)
    }
  }

  info(message: string, ...args: unknown[]): void
  info(message: string, context: string, ...args: unknown[]): void  
  info(message: string, contextOrArg?: string | unknown, ...args: unknown[]): void {
    if (!this.shouldLog('info')) return
    
    const isContext = typeof contextOrArg === 'string' && args.length >= 0
    const context = isContext ? contextOrArg as string : undefined
    const logArgs = isContext ? args : [contextOrArg, ...args].filter(arg => arg !== undefined)
    
    if (this.isDev) {
      console.info(this.formatMessage(message, context), ...logArgs)
    }
  }

  warn(message: string, ...args: unknown[]): void
  warn(message: string, context: string, ...args: unknown[]): void
  warn(message: string, contextOrArg?: string | unknown, ...args: unknown[]): void {
    if (!this.shouldLog('warn')) return
    
    const isContext = typeof contextOrArg === 'string' && args.length >= 0
    const context = isContext ? contextOrArg as string : undefined
    const logArgs = isContext ? args : [contextOrArg, ...args].filter(arg => arg !== undefined)
    
    // Warnings should show in production for important issues
    console.warn(this.formatMessage(message, context), ...logArgs)
  }

  error(message: string, ...args: unknown[]): void
  error(message: string, context: string, ...args: unknown[]): void
  error(message: string, contextOrArg?: string | unknown, ...args: unknown[]): void {
    if (!this.shouldLog('error')) return
    
    const isContext = typeof contextOrArg === 'string' && args.length >= 0
    const context = isContext ? contextOrArg as string : undefined
    const logArgs = isContext ? args : [contextOrArg, ...args].filter(arg => arg !== undefined)
    
    // Errors should always show
    console.error(this.formatMessage(message, context), ...logArgs)
  }

  // Performance logging
  private activeTimers = new Set<string>()
  
  time(label: string): void {
    if (this.isDev && this.shouldLog('debug')) {
      const timerKey = this.formatMessage(`Timer: ${label}`)
      if (this.activeTimers.has(timerKey)) {
        console.warn(`${timerKey} already exists`)
        return
      }
      this.activeTimers.add(timerKey)
      console.time(timerKey)
    }
  }

  timeEnd(label: string): void {
    if (this.isDev && this.shouldLog('debug')) {
      const timerKey = this.formatMessage(`Timer: ${label}`)
      if (!this.activeTimers.has(timerKey)) {
        console.warn(`${timerKey} does not exist`)
        return
      }
      this.activeTimers.delete(timerKey)
      console.timeEnd(timerKey)
    }
  }

  // Group logging for related operations
  group(label: string): void {
    if (this.isDev && this.shouldLog('debug')) {
      console.group(this.formatMessage(label))
    }
  }

  groupEnd(): void {
    if (this.isDev && this.shouldLog('debug')) {
      console.groupEnd()
    }
  }

  // Create child logger with additional context
  child(prefix: string): Logger {
    const childPrefix = this.config.prefix ? `${this.config.prefix}:${prefix}` : prefix
    return new Logger({ ...this.config, prefix: childPrefix })
  }
}

// Default logger instance
export const logger = new Logger()

// Specialized loggers for different modules
export const initLogger = logger.child('Init')
export const storageLogger = logger.child('Storage')
export const noteLogger = logger.child('Notes')
export const sidebarLogger = logger.child('Sidebar')
export const notebookLogger = logger.child('Notebooks')
export const themeLogger = logger.child('Theme')
export const searchLogger = logger.child('Search')
export const editorLogger = logger.child('Editor')

// Performance logger
export const perfLogger = new Logger({ level: 'info', prefix: 'Perf' })

// Production-safe assertions
export const assert = (condition: unknown, message: string): asserts condition => {
  if (!condition) {
    logger.error('Assertion failed:', message)
    if (process.env.NODE_ENV === 'development') {
      throw new Error(`Assertion failed: ${message}`)
    }
  }
}

// Development-only logger that never logs in production
export const devLogger = new Logger({ 
  enabled: process.env.NODE_ENV === 'development',
  level: 'debug'
})

export type { LogLevel, LogConfig }
export default Logger