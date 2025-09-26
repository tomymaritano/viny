/**
 * Centralized Logging Service
 * Integrates with the repository pattern and provides enterprise-grade logging
 * with security features, audit trails, and performance monitoring
 */

import {
  logger,
  securityLogger,
  perfLogger,
  logError,
  logPerformance,
  logSecurityEvent,
  type LogLevel,
  type LogContext,
  type LogEntry,
  type AuditEvent,
} from '../utils/logger'

export interface LoggingServiceConfig {
  readonly enableRemoteLogging: boolean
  readonly remoteEndpoint?: string
  readonly bufferSize: number
  readonly flushInterval: number
  readonly enableMetrics: boolean
  readonly enableCorrelation: boolean
}

export interface CorrelationContext {
  readonly traceId: string
  readonly userId?: string
  readonly sessionId: string
  readonly operation?: string
}

export interface LogMetrics {
  readonly totalLogs: number
  readonly errorCount: number
  readonly warningCount: number
  readonly averageResponseTime: number
  readonly topErrors: Array<{ message: string; count: number }>
  readonly performanceMetrics: Array<{ operation: string; avgDuration: number }>
}

/**
 * Enterprise logging service that provides centralized logging with security,
 * audit trails, correlation tracking, and performance monitoring
 */
export class LoggingService {
  private readonly config: LoggingServiceConfig
  private readonly correlationStack: CorrelationContext[] = []
  private readonly metricsBuffer: Map<string, number[]> = new Map()
  private readonly errorCounts = new Map<string, number>()
  private readonly performanceData: Array<{
    operation: string
    duration: number
    timestamp: number
  }> = []
  private flushTimer?: NodeJS.Timeout

  constructor(config: Partial<LoggingServiceConfig> = {}) {
    this.config = {
      enableRemoteLogging: false,
      bufferSize: 1000,
      flushInterval: 30000, // 30 seconds
      enableMetrics: true,
      enableCorrelation: true,
      ...config,
    }

    this.setupAutoFlush()
    this.setupLogListeners()
  }

  private setupAutoFlush(): void {
    if (this.config.enableRemoteLogging && this.config.flushInterval > 0) {
      this.flushTimer = setInterval(() => {
        this.flushLogs()
      }, this.config.flushInterval)
    }
  }

  private setupLogListeners(): void {
    // Listen to logger events for metrics collection
    logger.addListener((entry: LogEntry) => {
      if (this.config.enableMetrics) {
        this.collectMetrics(entry)
      }
    })
  }

  private collectMetrics(entry: LogEntry): void {
    // Track error counts
    if (entry.level === 'error') {
      const count = this.errorCounts.get(entry.message) || 0
      this.errorCounts.set(entry.message, count + 1)
    }

    // Track performance data if present
    if (entry.data?.duration && entry.data?.operation) {
      const duration = parseFloat(entry.data.duration as string)
      this.performanceData.push({
        operation: entry.data.operation as string,
        duration,
        timestamp: Date.now(),
      })

      // Keep only recent performance data
      const cutoff = Date.now() - 3600000 // 1 hour
      while (
        this.performanceData.length > 0 &&
        this.performanceData[0]!.timestamp < cutoff
      ) {
        this.performanceData.shift()
      }
    }
  }

  /**
   * Start a correlation context for tracking related operations
   */
  startCorrelation(operation: string, userId?: string): CorrelationContext {
    const context: CorrelationContext = {
      traceId: this.generateTraceId(),
      userId,
      sessionId: this.generateSessionId(),
      operation,
    }

    if (this.config.enableCorrelation) {
      this.correlationStack.push(context)
    }

    logger.info('Operation started', {
      traceId: context.traceId,
      operation,
      userId,
    })

    return context
  }

  /**
   * End a correlation context
   */
  endCorrelation(context: CorrelationContext, success = true): void {
    if (!this.config.enableCorrelation) return

    const index = this.correlationStack.findIndex(
      c => c.traceId === context.traceId
    )
    if (index > -1) {
      this.correlationStack.splice(index, 1)
    }

    logger.info('Operation completed', {
      traceId: context.traceId,
      operation: context.operation,
      success,
      userId: context.userId,
    })
  }

  /**
   * Log with automatic correlation context
   */
  log(level: LogLevel, message: string, data?: Record<string, unknown>): void {
    const currentContext = this.getCurrentContext()
    const enrichedData = {
      ...data,
      ...currentContext,
    }

    switch (level) {
      case 'debug':
        logger.debug(message, enrichedData)
        break
      case 'info':
        logger.info(message, enrichedData)
        break
      case 'warn':
        logger.warn(message, enrichedData)
        break
      case 'error':
        logger.error(message, enrichedData)
        break
    }
  }

  /**
   * Log performance metrics
   */
  logPerformance(
    operation: string,
    duration: number,
    metadata?: Record<string, unknown>
  ): void {
    const context = this.getCurrentContext()
    logPerformance(operation, duration, {
      ...metadata,
      ...context,
    })
  }

  /**
   * Log security events with automatic audit trail
   */
  logSecurity(
    event: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    details?: Record<string, unknown>
  ): void {
    const context = this.getCurrentContext()
    logSecurityEvent(event, severity, {
      ...details,
      ...context,
    })
  }

  /**
   * Log errors with full context and stack traces
   */
  logError(error: Error, context?: Record<string, unknown>): void {
    const correlationContext = this.getCurrentContext()
    logError(error, {
      ...context,
      ...correlationContext,
    })
  }

  /**
   * Time an operation and log performance metrics
   */
  timeOperation<T>(operation: string, fn: () => Promise<T>): Promise<T>
  timeOperation<T>(operation: string, fn: () => T): T
  timeOperation<T>(
    operation: string,
    fn: () => T | Promise<T>
  ): T | Promise<T> {
    const startTime = performance.now()
    logger.time(operation)

    try {
      const result = fn()

      if (result instanceof Promise) {
        return result.finally(() => {
          const duration = performance.now() - startTime
          logger.timeEnd(operation)
          this.logPerformance(operation, duration)
        })
      } else {
        const duration = performance.now() - startTime
        logger.timeEnd(operation)
        this.logPerformance(operation, duration)
        return result
      }
    } catch (error) {
      const duration = performance.now() - startTime
      logger.timeEnd(operation)
      this.logPerformance(operation, duration, { error: true })
      this.logError(error as Error, { operation })
      throw error
    }
  }

  /**
   * Get current correlation context
   */
  private getCurrentContext(): Partial<CorrelationContext> {
    if (!this.config.enableCorrelation || this.correlationStack.length === 0) {
      return {}
    }

    const context = this.correlationStack[this.correlationStack.length - 1]!
    return {
      traceId: context.traceId,
      userId: context.userId,
      sessionId: context.sessionId,
      operation: context.operation,
    }
  }

  /**
   * Get logging metrics for monitoring
   */
  getMetrics(): LogMetrics {
    const logHistory = logger.getLogHistory()
    const totalLogs = logHistory.length
    const errorCount = logHistory.filter(
      entry => entry.level === 'error'
    ).length
    const warningCount = logHistory.filter(
      entry => entry.level === 'warn'
    ).length

    // Calculate top errors
    const topErrors = Array.from(this.errorCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([message, count]) => ({ message, count }))

    // Calculate performance metrics
    const performanceByOperation = new Map<string, number[]>()
    this.performanceData.forEach(({ operation, duration }) => {
      const durations = performanceByOperation.get(operation) || []
      durations.push(duration)
      performanceByOperation.set(operation, durations)
    })

    const performanceMetrics = Array.from(performanceByOperation.entries())
      .map(([operation, durations]) => ({
        operation,
        avgDuration:
          durations.reduce((sum, d) => sum + d, 0) / durations.length,
      }))
      .sort((a, b) => b.avgDuration - a.avgDuration)

    const allDurations = this.performanceData.map(d => d.duration)
    const averageResponseTime =
      allDurations.length > 0
        ? allDurations.reduce((sum, d) => sum + d, 0) / allDurations.length
        : 0

    return {
      totalLogs,
      errorCount,
      warningCount,
      averageResponseTime,
      topErrors,
      performanceMetrics,
    }
  }

  /**
   * Get audit trail for security analysis
   */
  getAuditTrail(): readonly AuditEvent[] {
    return logger.getAuditTrail()
  }

  /**
   * Flush logs to remote endpoint (if configured)
   */
  private async flushLogs(): Promise<void> {
    if (!this.config.enableRemoteLogging || !this.config.remoteEndpoint) {
      return
    }

    try {
      const logs = logger.getLogHistory()
      const audits = logger.getAuditTrail()

      if (logs.length === 0 && audits.length === 0) {
        return
      }

      // In a real implementation, you would send these to your logging service
      // For now, we just log that we would flush
      logger.debug('Would flush logs to remote endpoint', {
        endpoint: this.config.remoteEndpoint,
        logCount: logs.length,
        auditCount: audits.length,
      })

      // Clear buffers after successful flush
      logger.clearBuffers()
    } catch (error) {
      logger.error('Failed to flush logs to remote endpoint', {
        endpoint: this.config.remoteEndpoint,
        error: (error as Error).message,
      })
    }
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer)
    }

    // Flush any remaining logs
    this.flushLogs()
  }

  private generateTraceId(): string {
    return `trace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

// Singleton instance for global use
export const loggingService = new LoggingService({
  enableMetrics: true,
  enableCorrelation: true,
  bufferSize: 1000,
})

// Convenience functions that use the singleton
export const startOperation = (
  operation: string,
  userId?: string
): CorrelationContext => loggingService.startCorrelation(operation, userId)

export const endOperation = (
  context: CorrelationContext,
  success = true
): void => loggingService.endCorrelation(context, success)

export const timeAsync = <T>(
  operation: string,
  fn: () => Promise<T>
): Promise<T> => loggingService.timeOperation(operation, fn)

export const timeSync = <T>(operation: string, fn: () => T): T =>
  loggingService.timeOperation(operation, fn)

export const logWithContext = (
  level: LogLevel,
  message: string,
  data?: Record<string, unknown>
): void => loggingService.log(level, message, data)

export type { CorrelationContext, LogMetrics }
