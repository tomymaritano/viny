/**
 * Performance Monitoring Service
 * Tracks application performance metrics and provides optimization insights
 */

import { logger } from '../utils/logger'

export interface PerformanceMetrics {
  // Timing metrics
  appInitTime: number
  firstRenderTime: number
  timeToInteractive: number

  // Memory metrics
  memoryUsage: {
    used: number
    total: number
    percentage: number
  }

  // Bundle metrics
  bundleSize: {
    total: number
    chunks: Record<string, number>
    compression: number
  }

  // User interaction metrics
  interactions: {
    averageResponseTime: number
    slowInteractions: number
    totalInteractions: number
  }

  // Search performance
  searchMetrics: {
    averageSearchTime: number
    indexSize: number
    searchResultsCount: number
  }

  // Error metrics
  errorRate: number
  criticalErrors: number

  // Network metrics
  networkLatency: number
  failedRequests: number

  timestamp: string
}

export interface PerformanceThresholds {
  appInitTime: number
  firstRenderTime: number
  timeToInteractive: number
  memoryUsagePercentage: number
  bundleSizeLimit: number
  interactionResponseTime: number
  searchTime: number
  errorRate: number
  networkLatency: number
}

export interface PerformanceAlert {
  type: 'warning' | 'critical'
  metric: keyof PerformanceThresholds
  currentValue: number
  threshold: number
  message: string
  timestamp: string
  suggestions: string[]
}

export class PerformanceMonitoringService {
  private static instance: PerformanceMonitoringService
  private metrics: PerformanceMetrics[] = []
  private thresholds: PerformanceThresholds
  private alerts: PerformanceAlert[] = []
  private observers: PerformanceObserver[] = []
  private startTime: number
  private interactionTimes: number[] = []
  private searchTimes: number[] = []
  private errorCount = 0
  private interactionCount = 0

  private constructor() {
    this.startTime = performance.now()
    this.thresholds = {
      appInitTime: 3000, // 3 seconds
      firstRenderTime: 1000, // 1 second
      timeToInteractive: 5000, // 5 seconds
      memoryUsagePercentage: 80, // 80%
      bundleSizeLimit: 5000000, // 5MB
      interactionResponseTime: 100, // 100ms
      searchTime: 200, // 200ms
      errorRate: 0.05, // 5%
      networkLatency: 1000, // 1 second
    }

    this.initializeMonitoring()
  }

  static getInstance(): PerformanceMonitoringService {
    if (!PerformanceMonitoringService.instance) {
      PerformanceMonitoringService.instance = new PerformanceMonitoringService()
    }
    return PerformanceMonitoringService.instance
  }

  private initializeMonitoring(): void {
    this.setupWebVitalsMonitoring()
    this.setupErrorTracking()
    this.setupMemoryMonitoring()
    this.setupNetworkMonitoring()
    this.setupUserInteractionTracking()

    logger.info('Performance monitoring initialized', {
      correlationId: this.generateCorrelationId(),
      thresholds: this.thresholds,
    })
  }

  private setupWebVitalsMonitoring(): void {
    // Monitor Core Web Vitals
    if (typeof PerformanceObserver === 'undefined') return

    // First Contentful Paint
    const fcpObserver = new PerformanceObserver(list => {
      const entries = list.getEntries()
      entries.forEach(entry => {
        if (entry.name === 'first-contentful-paint') {
          this.recordMetric('firstRenderTime', entry.startTime)
        }
      })
    })

    try {
      fcpObserver.observe({ entryTypes: ['paint'] })
      this.observers.push(fcpObserver)
    } catch (error) {
      logger.warn('Failed to observe paint entries', { error })
    }

    // Largest Contentful Paint
    const lcpObserver = new PerformanceObserver(list => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]
      if (lastEntry) {
        this.recordMetric('timeToInteractive', lastEntry.startTime)
      }
    })

    try {
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
      this.observers.push(lcpObserver)
    } catch (error) {
      logger.warn('Failed to observe LCP entries', { error })
    }

    // Layout Shift
    const clsObserver = new PerformanceObserver(list => {
      const entries = list.getEntries()
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput && entry.value > 0.1) {
          this.recordAlert('critical', 'Layout shift detected', {
            value: entry.value,
            sources: entry.sources,
          })
        }
      })
    })

    try {
      clsObserver.observe({ entryTypes: ['layout-shift'] })
      this.observers.push(clsObserver)
    } catch (error) {
      logger.warn('Failed to observe layout shift entries', { error })
    }
  }

  private setupErrorTracking(): void {
    window.addEventListener('error', event => {
      this.errorCount++
      this.recordAlert('critical', 'JavaScript error detected', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
      })
    })

    window.addEventListener('unhandledrejection', event => {
      this.errorCount++
      this.recordAlert('critical', 'Unhandled promise rejection', {
        reason: event.reason,
        promise: event.promise,
      })
    })
  }

  private setupMemoryMonitoring(): void {
    if (!('memory' in performance)) return

    setInterval(() => {
      const memory = (performance as any).memory
      if (memory) {
        const memoryUsage = {
          used: memory.usedJSHeapSize,
          total: memory.totalJSHeapSize,
          percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100,
        }

        if (memoryUsage.percentage > this.thresholds.memoryUsagePercentage) {
          this.recordAlert('warning', 'High memory usage detected', {
            currentUsage: memoryUsage.percentage,
            threshold: this.thresholds.memoryUsagePercentage,
            suggestions: [
              'Consider implementing lazy loading for large components',
              'Check for memory leaks in event listeners',
              'Optimize image and asset loading',
              'Review large data structures and caching strategies',
            ],
          })
        }
      }
    }, 30000) // Check every 30 seconds
  }

  private setupNetworkMonitoring(): void {
    if (typeof PerformanceObserver === 'undefined') return

    const resourceObserver = new PerformanceObserver(list => {
      const entries = list.getEntries()
      entries.forEach((entry: any) => {
        if (entry.entryType === 'resource') {
          const duration = entry.responseEnd - entry.requestStart

          if (duration > this.thresholds.networkLatency) {
            this.recordAlert('warning', 'Slow network request detected', {
              url: entry.name,
              duration,
              threshold: this.thresholds.networkLatency,
              suggestions: [
                'Implement request caching',
                'Optimize API response sizes',
                'Consider using CDN for static assets',
                'Implement request prioritization',
              ],
            })
          }
        }
      })
    })

    try {
      resourceObserver.observe({ entryTypes: ['resource'] })
      this.observers.push(resourceObserver)
    } catch (error) {
      logger.warn('Failed to observe resource entries', { error })
    }
  }

  private setupUserInteractionTracking(): void {
    const interactionTypes = ['click', 'keydown', 'scroll', 'resize']

    interactionTypes.forEach(type => {
      document.addEventListener(
        type,
        event => {
          const startTime = performance.now()

          // Use requestAnimationFrame to measure interaction response time
          requestAnimationFrame(() => {
            const endTime = performance.now()
            const responseTime = endTime - startTime

            this.interactionTimes.push(responseTime)
            this.interactionCount++

            if (responseTime > this.thresholds.interactionResponseTime) {
              this.recordAlert('warning', 'Slow interaction response', {
                type,
                responseTime,
                threshold: this.thresholds.interactionResponseTime,
                suggestions: [
                  'Optimize event handlers',
                  'Consider debouncing frequent events',
                  'Use virtual scrolling for large lists',
                  'Implement progressive loading',
                ],
              })
            }
          })
        },
        { passive: true }
      )
    })
  }

  recordSearchPerformance(
    searchTime: number,
    resultCount: number,
    indexSize: number
  ): void {
    this.searchTimes.push(searchTime)

    if (searchTime > this.thresholds.searchTime) {
      this.recordAlert('warning', 'Slow search performance', {
        searchTime,
        threshold: this.thresholds.searchTime,
        resultCount,
        indexSize,
        suggestions: [
          'Implement search result caching',
          'Optimize search index structure',
          'Consider using web workers for search',
          'Implement search debouncing',
        ],
      })
    }
  }

  recordAppInitTime(): void {
    const initTime = performance.now() - this.startTime
    this.recordMetric('appInitTime', initTime)

    if (initTime > this.thresholds.appInitTime) {
      this.recordAlert('warning', 'Slow app initialization', {
        initTime,
        threshold: this.thresholds.appInitTime,
        suggestions: [
          'Implement code splitting',
          'Optimize bundle size',
          'Use lazy loading for non-critical components',
          'Minimize initial data loading',
        ],
      })
    }
  }

  private recordMetric(metric: string, value: number): void {
    logger.debug('Performance metric recorded', {
      correlationId: this.generateCorrelationId(),
      metric,
      value,
      timestamp: new Date().toISOString(),
    })
  }

  private recordAlert(
    type: 'warning' | 'critical',
    message: string,
    details: any
  ): void {
    const alert: PerformanceAlert = {
      type,
      metric: details.metric || 'unknown',
      currentValue: details.currentValue || details.value || 0,
      threshold: details.threshold || 0,
      message,
      timestamp: new Date().toISOString(),
      suggestions: details.suggestions || [],
    }

    this.alerts.push(alert)

    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100)
    }

    logger.warn('Performance alert generated', {
      correlationId: this.generateCorrelationId(),
      alert,
      details,
    })
  }

  getCurrentMetrics(): PerformanceMetrics {
    const memory = (performance as any).memory
    const memoryUsage = memory
      ? {
          used: memory.usedJSHeapSize,
          total: memory.totalJSHeapSize,
          percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100,
        }
      : { used: 0, total: 0, percentage: 0 }

    const averageInteractionTime =
      this.interactionTimes.length > 0
        ? this.interactionTimes.reduce((sum, time) => sum + time, 0) /
          this.interactionTimes.length
        : 0

    const averageSearchTime =
      this.searchTimes.length > 0
        ? this.searchTimes.reduce((sum, time) => sum + time, 0) /
          this.searchTimes.length
        : 0

    const slowInteractions = this.interactionTimes.filter(
      time => time > this.thresholds.interactionResponseTime
    ).length

    return {
      appInitTime: performance.now() - this.startTime,
      firstRenderTime: 0, // Will be updated by observer
      timeToInteractive: 0, // Will be updated by observer
      memoryUsage,
      bundleSize: {
        total: 0, // Would be populated by build process
        chunks: {},
        compression: 0,
      },
      interactions: {
        averageResponseTime: averageInteractionTime,
        slowInteractions,
        totalInteractions: this.interactionCount,
      },
      searchMetrics: {
        averageSearchTime,
        indexSize: 0, // Would be populated by search service
        searchResultsCount: 0,
      },
      errorRate:
        this.interactionCount > 0 ? this.errorCount / this.interactionCount : 0,
      criticalErrors: this.errorCount,
      networkLatency: 0, // Would be populated by network monitoring
      failedRequests: 0,
      timestamp: new Date().toISOString(),
    }
  }

  getPerformanceAlerts(): PerformanceAlert[] {
    return [...this.alerts]
  }

  getActiveAlerts(): PerformanceAlert[] {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    return this.alerts.filter(alert => new Date(alert.timestamp) > oneHourAgo)
  }

  generatePerformanceReport(): {
    metrics: PerformanceMetrics
    alerts: PerformanceAlert[]
    recommendations: string[]
    score: number
  } {
    const metrics = this.getCurrentMetrics()
    const alerts = this.getActiveAlerts()

    const recommendations = this.generateRecommendations(metrics, alerts)
    const score = this.calculatePerformanceScore(metrics, alerts)

    return {
      metrics,
      alerts,
      recommendations,
      score,
    }
  }

  private generateRecommendations(
    metrics: PerformanceMetrics,
    alerts: PerformanceAlert[]
  ): string[] {
    const recommendations: string[] = []

    // Memory recommendations
    if (metrics.memoryUsage.percentage > 70) {
      recommendations.push(
        'Consider implementing memory optimization strategies'
      )
    }

    // Interaction recommendations
    if (metrics.interactions.averageResponseTime > 50) {
      recommendations.push('Optimize user interface responsiveness')
    }

    // Error recommendations
    if (metrics.errorRate > 0.02) {
      recommendations.push('Implement better error handling and monitoring')
    }

    // Search recommendations
    if (metrics.searchMetrics.averageSearchTime > 100) {
      recommendations.push(
        'Optimize search performance with indexing or caching'
      )
    }

    // Alert-based recommendations
    const criticalAlerts = alerts.filter(alert => alert.type === 'critical')
    if (criticalAlerts.length > 0) {
      recommendations.push('Address critical performance issues immediately')
    }

    return recommendations
  }

  private calculatePerformanceScore(
    metrics: PerformanceMetrics,
    alerts: PerformanceAlert[]
  ): number {
    let score = 100

    // Deduct points for slow metrics
    if (metrics.appInitTime > this.thresholds.appInitTime) {
      score -= 10
    }

    if (
      metrics.interactions.averageResponseTime >
      this.thresholds.interactionResponseTime
    ) {
      score -= 10
    }

    if (
      metrics.memoryUsage.percentage > this.thresholds.memoryUsagePercentage
    ) {
      score -= 15
    }

    if (metrics.errorRate > this.thresholds.errorRate) {
      score -= 20
    }

    // Deduct points for alerts
    const criticalAlerts = alerts.filter(alert => alert.type === 'critical')
    const warningAlerts = alerts.filter(alert => alert.type === 'warning')

    score -= criticalAlerts.length * 5
    score -= warningAlerts.length * 2

    return Math.max(0, Math.min(100, score))
  }

  updateThresholds(newThresholds: Partial<PerformanceThresholds>): void {
    this.thresholds = { ...this.thresholds, ...newThresholds }

    logger.info('Performance thresholds updated', {
      correlationId: this.generateCorrelationId(),
      thresholds: this.thresholds,
    })
  }

  startPerformanceProfile(name: string): { end: () => number } {
    const startTime = performance.now()
    const startMark = `${name}_start`
    const endMark = `${name}_end`

    performance.mark(startMark)

    return {
      end: () => {
        performance.mark(endMark)
        performance.measure(name, startMark, endMark)

        const endTime = performance.now()
        const duration = endTime - startTime

        logger.debug('Performance profile completed', {
          correlationId: this.generateCorrelationId(),
          name,
          duration,
        })

        return duration
      },
    }
  }

  clearMetrics(): void {
    this.metrics = []
    this.alerts = []
    this.interactionTimes = []
    this.searchTimes = []
    this.errorCount = 0
    this.interactionCount = 0

    logger.info('Performance metrics cleared', {
      correlationId: this.generateCorrelationId(),
    })
  }

  destroy(): void {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
    this.clearMetrics()

    logger.info('Performance monitoring service destroyed', {
      correlationId: this.generateCorrelationId(),
    })
  }

  private generateCorrelationId(): string {
    return `perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

// Export singleton instance
export const performanceMonitoringService =
  PerformanceMonitoringService.getInstance()
