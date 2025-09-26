/**
 * Centralized Logging Service with Security Features
 * Provides structured logging with PII filtering, rate limiting, and audit trails
 * Compatible with TypeScript strict mode and repository pattern
 */

// EventHandler type will be defined locally if needed

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'
export type LogContext =
  | 'app'
  | 'storage'
  | 'security'
  | 'performance'
  | 'user'
  | 'api'

interface SecurityConfig {
  readonly enablePIIFiltering: boolean
  readonly enableRateLimiting: boolean
  readonly enableAuditTrail: boolean
  readonly maxLogSize: number
  readonly sensitiveFields: readonly string[]
}

interface LogConfig {
  readonly enabled: boolean
  readonly level: LogLevel
  readonly prefix?: string
  readonly context?: LogContext
  readonly security: SecurityConfig
  readonly maxEntriesPerSecond: number
  readonly enableStructuredLogging: boolean
}

export interface LogEntry {
  readonly timestamp: string
  readonly level: LogLevel
  readonly message: string
  readonly context: LogContext
  readonly data?: Record<string, unknown>
  readonly sessionId?: string
  readonly userId?: string
  readonly sanitized: boolean
}

export interface AuditEvent {
  readonly type: 'security' | 'data' | 'auth' | 'error'
  readonly action: string
  readonly timestamp: string
  readonly severity: 'low' | 'medium' | 'high' | 'critical'
  readonly details: Record<string, unknown>
}

class Logger {
  private readonly config: LogConfig
  private readonly isDev: boolean
  private readonly logBuffer: LogEntry[] = []
  private readonly auditBuffer: AuditEvent[] = []
  private readonly rateLimitMap = new Map<string, number[]>()
  private readonly sessionId: string
  private logListeners: EventHandler<LogEntry>[] = []

  constructor(config: Partial<LogConfig> = {}) {
    this.isDev = process.env.NODE_ENV === 'development'
    this.sessionId = this.generateSessionId()

    this.config = {
      enabled: this.isDev,
      level: 'debug',
      prefix: '',
      context: 'app',
      maxEntriesPerSecond: 10,
      enableStructuredLogging: true,
      security: {
        enablePIIFiltering: true,
        enableRateLimiting: true,
        enableAuditTrail: true,
        maxLogSize: 1000,
        sensitiveFields: [
          'password',
          'token',
          'email',
          'apiKey',
          'secret',
          'privateKey',
        ],
      },
      ...config,
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.config.enabled) return false

    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
    }

    return levels[level] >= levels[this.config.level]
  }

  private isRateLimited(level: LogLevel): boolean {
    if (!this.config.security.enableRateLimiting) return false

    const now = Date.now()
    const key = `${level}_${this.config.context}`
    const timestamps = this.rateLimitMap.get(key) || []

    // Remove timestamps older than 1 second
    const recentTimestamps = timestamps.filter(ts => now - ts < 1000)

    if (recentTimestamps.length >= this.config.maxEntriesPerSecond) {
      return true
    }

    recentTimestamps.push(now)
    this.rateLimitMap.set(key, recentTimestamps)
    return false
  }

  private sanitizeData(data: unknown): unknown {
    if (!this.config.security.enablePIIFiltering) return data

    if (typeof data === 'string') {
      return this.sanitizeString(data)
    }

    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeData(item))
    }

    if (data && typeof data === 'object') {
      const sanitized: Record<string, unknown> = {}
      for (const [key, value] of Object.entries(data)) {
        if (this.config.security.sensitiveFields.includes(key.toLowerCase())) {
          sanitized[key] = '[REDACTED]'
        } else {
          sanitized[key] = this.sanitizeData(value)
        }
      }
      return sanitized
    }

    return data
  }

  private sanitizeString(str: string): string {
    // Remove potential PII patterns
    return str
      .replace(
        /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
        '[EMAIL]'
      )
      .replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, '[CARD]')
      .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN]')
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    data?: Record<string, unknown>
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message: this.formatMessage(message),
      context: this.config.context || 'app',
      data: data
        ? (this.sanitizeData(data) as Record<string, unknown>)
        : undefined,
      sessionId: this.sessionId,
      sanitized: this.config.security.enablePIIFiltering,
    }
  }

  private formatMessage(message: string, context?: string): string {
    if (this.config.enableStructuredLogging) {
      return message // Structured logs don't need prefix formatting
    }

    const timestamp = new Date().toISOString().split('T')[1].split('.')[0]
    const prefix = this.config.prefix ? `[${this.config.prefix}]` : ''
    const contextStr = context ? `[${context}]` : ''

    return `${timestamp} ${prefix}${contextStr} ${message}`
  }

  private emit(entry: LogEntry): void {
    // Add to buffer for audit trail
    if (this.config.security.enableAuditTrail) {
      this.logBuffer.push(entry)
      if (this.logBuffer.length > this.config.security.maxLogSize) {
        this.logBuffer.shift()
      }
    }

    // Notify listeners
    this.logListeners.forEach(listener => {
      try {
        listener(entry)
      } catch (error) {
        console.error('Log listener error:', error)
      }
    })
  }

  private outputLog(entry: LogEntry): void {
    if (this.config.enableStructuredLogging) {
      const logOutput = {
        ...entry,
        prefix: this.config.prefix,
      }

      switch (entry.level) {
        case 'debug':
          if (this.isDev) console.log(JSON.stringify(logOutput, null, 2))
          break
        case 'info':
          if (this.isDev) console.info(JSON.stringify(logOutput, null, 2))
          break
        case 'warn':
          console.warn(JSON.stringify(logOutput, null, 2))
          break
        case 'error':
          console.error(JSON.stringify(logOutput, null, 2))
          break
      }
    } else {
      // Legacy console output
      const message = this.formatMessage(entry.message)
      const args = entry.data ? [entry.data] : []

      switch (entry.level) {
        case 'debug':
          if (this.isDev) console.log(message, ...args)
          break
        case 'info':
          if (this.isDev) console.info(message, ...args)
          break
        case 'warn':
          console.warn(message, ...args)
          break
        case 'error':
          console.error(message, ...args)
          break
      }
    }
  }

  debug(message: string, data?: Record<string, unknown>): void {
    if (!this.shouldLog('debug') || this.isRateLimited('debug')) return

    const entry = this.createLogEntry('debug', message, data)
    this.emit(entry)
    this.outputLog(entry)
  }

  info(message: string, data?: Record<string, unknown>): void {
    if (!this.shouldLog('info') || this.isRateLimited('info')) return

    const entry = this.createLogEntry('info', message, data)
    this.emit(entry)
    this.outputLog(entry)
  }

  warn(message: string, data?: Record<string, unknown>): void {
    if (!this.shouldLog('warn') || this.isRateLimited('warn')) return

    const entry = this.createLogEntry('warn', message, data)
    this.emit(entry)
    this.outputLog(entry)

    // Create audit event for warnings
    this.audit('error', 'warning_logged', 'medium', { message, data })
  }

  error(message: string, data?: Record<string, unknown>, error?: Error): void {
    if (!this.shouldLog('error') || this.isRateLimited('error')) return

    const errorData = {
      ...data,
      stack: error?.stack,
      name: error?.name,
      cause: error?.cause,
    }

    const entry = this.createLogEntry('error', message, errorData)
    this.emit(entry)
    this.outputLog(entry)

    // Create audit event for errors
    this.audit('error', 'error_logged', 'high', { message, error: errorData })
  }

  // Performance logging with metrics
  private readonly activeTimers = new Map<string, number>()

  time(label: string): void {
    const startTime = globalThis.performance.now()
    this.activeTimers.set(label, startTime)
    this.debug(`Performance timer started: ${label}`)
  }

  timeEnd(label: string): void {
    const startTime = this.activeTimers.get(label)
    if (!startTime) {
      this.warn(`Timer '${label}' was not found`)
      return
    }

    const duration = globalThis.performance.now() - startTime
    this.activeTimers.delete(label)

    this.info(`Performance timer completed: ${label}`, {
      duration: `${duration.toFixed(2)}ms`,
      label,
      category: 'performance',
    })

    // Create audit event for performance metrics
    if (duration > 1000) {
      // Log slow operations
      this.audit('performance', 'slow_operation', 'medium', {
        operation: label,
        duration,
        threshold: 1000,
      })
    }
  }

  // Security audit logging
  audit(
    type: AuditEvent['type'],
    action: string,
    severity: AuditEvent['severity'],
    details: Record<string, unknown>
  ): void {
    if (!this.config.security.enableAuditTrail) return

    const auditEvent: AuditEvent = {
      type,
      action,
      timestamp: new Date().toISOString(),
      severity,
      details: this.sanitizeData(details) as Record<string, unknown>,
    }

    this.auditBuffer.push(auditEvent)
    if (this.auditBuffer.length > this.config.security.maxLogSize) {
      this.auditBuffer.shift()
    }

    // Log critical audit events immediately
    if (severity === 'critical') {
      this.error(`AUDIT: ${action}`, { auditEvent })
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
  child(prefix: string, context?: LogContext): Logger {
    const childPrefix = this.config.prefix
      ? `${this.config.prefix}:${prefix}`
      : prefix
    return new Logger({
      ...this.config,
      prefix: childPrefix,
      context: context || this.config.context,
    })
  }

  // Event listener management
  addListener(listener: EventHandler<LogEntry>): void {
    this.logListeners.push(listener)
  }

  removeListener(listener: EventHandler<LogEntry>): void {
    const index = this.logListeners.indexOf(listener)
    if (index > -1) {
      this.logListeners.splice(index, 1)
    }
  }

  // Get audit trail for security analysis
  getAuditTrail(): readonly AuditEvent[] {
    return Object.freeze([...this.auditBuffer])
  }

  // Get log history
  getLogHistory(): readonly LogEntry[] {
    return Object.freeze([...this.logBuffer])
  }

  // Clear buffers (useful for testing)
  clearBuffers(): void {
    this.logBuffer.length = 0
    this.auditBuffer.length = 0
    this.rateLimitMap.clear()
  }

  // Security-focused methods
  security(action: string, data?: Record<string, unknown>): void {
    this.info(`SECURITY: ${action}`, data)
    this.audit('security', action, 'high', data || {})
  }

  dataAccess(
    action: string,
    resource: string,
    data?: Record<string, unknown>
  ): void {
    this.info(`DATA: ${action} - ${resource}`, data)
    this.audit('data', action, 'medium', { resource, ...data })
  }

  authentication(
    action: string,
    userId?: string,
    data?: Record<string, unknown>
  ): void {
    this.info(`AUTH: ${action}`, { userId, ...data })
    this.audit('auth', action, 'high', { userId, ...data })
  }
}

// Default logger instance with security configuration
export const logger = new Logger({
  security: {
    enablePIIFiltering: true,
    enableRateLimiting: true,
    enableAuditTrail: true,
    maxLogSize: 1000,
    sensitiveFields: [
      'password',
      'token',
      'email',
      'apiKey',
      'secret',
      'privateKey',
      'sessionId',
    ],
  },
})

// Specialized loggers for different contexts
export const initLogger = logger.child('Init', 'app')
export const storageLogger = logger.child('Storage', 'storage')
export const noteLogger = logger.child('Notes', 'user')
export const sidebarLogger = logger.child('Sidebar', 'user')
export const notebookLogger = logger.child('Notebooks', 'user')
export const themeLogger = logger.child('Theme', 'user')
export const searchLogger = logger.child('Search', 'user')
export const editorLogger = logger.child('Editor', 'user')
export const settingsLogger = logger.child('Settings', 'user')
export const securityLogger = logger.child('Security', 'security')
export const apiLogger = logger.child('API', 'api')

// Performance logger with structured output
export const perfLogger = new Logger({
  level: 'info',
  prefix: 'Perf',
  context: 'performance',
  enableStructuredLogging: true,
})

// Production-safe assertions with audit trail
export const assert = (
  condition: unknown,
  message: string,
  context?: Record<string, unknown>
): asserts condition => {
  if (!condition) {
    logger.error('Assertion failed', { message, ...context })
    logger.audit('error', 'assertion_failed', 'critical', { message, context })

    if (process.env.NODE_ENV === 'development') {
      throw new Error(`Assertion failed: ${message}`)
    }
  }
}

// Development-only logger that never logs in production
export const devLogger = new Logger({
  enabled: process.env.NODE_ENV === 'development',
  level: 'debug',
  security: {
    enablePIIFiltering: false, // Less filtering in dev
    enableRateLimiting: false,
    enableAuditTrail: false,
    maxLogSize: 500,
    sensitiveFields: [],
  },
})

// Utility functions for common logging patterns
export const logError = (
  error: Error,
  context?: Record<string, unknown>
): void => {
  logger.error(error.message, context, error)
}

export const logPerformance = (
  operation: string,
  duration: number,
  metadata?: Record<string, unknown>
): void => {
  perfLogger.info(`${operation} completed`, {
    duration: `${duration.toFixed(2)}ms`,
    operation,
    ...metadata,
  })
}

export const logSecurityEvent = (
  event: string,
  severity: 'low' | 'medium' | 'high' | 'critical',
  details?: Record<string, unknown>
): void => {
  securityLogger.security(event, details)
  logger.audit('security', event, severity, details || {})
}

// Type exports
export type {
  LogLevel,
  LogConfig,
  LogContext,
  LogEntry,
  AuditEvent,
  SecurityConfig,
}
export default Logger
