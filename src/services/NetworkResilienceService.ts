/**
 * Network Resilience Service
 * Provides robust network handling with retry logic, offline support, and graceful degradation
 */

import { logger } from '../utils/logger'

export interface NetworkRequest {
  url: string
  options?: RequestInit
  timeout?: number
  retries?: number
  retryDelay?: number
}

export interface NetworkResponse<T = any> {
  data: T
  status: number
  statusText: string
  headers: Headers
}

export interface RetryConfig {
  maxRetries: number
  initialDelay: number
  maxDelay: number
  backoffFactor: number
  retryCondition: (error: Error, attempt: number) => boolean
}

export class NetworkResilienceService {
  private static instance: NetworkResilienceService
  private isOnline: boolean = navigator.onLine
  private retryConfig: RetryConfig = {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 10000,
    backoffFactor: 2,
    retryCondition: (error: Error, attempt: number) => {
      // Retry on network errors, timeouts, and server errors (5xx)
      const retryableErrors = [
        'NetworkError',
        'TimeoutError',
        'AbortError',
        'fetch',
      ]

      if (retryableErrors.some(type => error.message.includes(type))) {
        return true
      }

      // Retry on HTTP 5xx errors
      if (error.message.includes('HTTP')) {
        const statusMatch = error.message.match(/HTTP (\d+)/)
        if (statusMatch) {
          const status = parseInt(statusMatch[1])
          return status >= 500 && status < 600
        }
      }

      return false
    },
  }

  private offlineQueue: Array<{
    request: NetworkRequest
    resolve: (value: any) => void
    reject: (error: Error) => void
  }> = []

  private constructor() {
    this.setupOnlineDetection()
  }

  public static getInstance(): NetworkResilienceService {
    if (!NetworkResilienceService.instance) {
      NetworkResilienceService.instance = new NetworkResilienceService()
    }
    return NetworkResilienceService.instance
  }

  private setupOnlineDetection(): void {
    window.addEventListener('online', () => {
      this.isOnline = true
      logger.info('Network connection restored')
      this.processOfflineQueue()
    })

    window.addEventListener('offline', () => {
      this.isOnline = false
      logger.warn('Network connection lost')
    })

    // Periodic connectivity check
    setInterval(() => {
      this.checkConnectivity()
    }, 30000) // Check every 30 seconds
  }

  private async checkConnectivity(): Promise<void> {
    try {
      // Try to fetch a small resource to verify actual connectivity
      const response = await fetch('/favicon.ico', {
        method: 'HEAD',
        cache: 'no-cache',
        signal: AbortSignal.timeout(5000),
      })

      const wasOffline = !this.isOnline
      this.isOnline = response.ok

      if (wasOffline && this.isOnline) {
        logger.info('Network connectivity verified')
        this.processOfflineQueue()
      }
    } catch (error) {
      if (this.isOnline) {
        this.isOnline = false
        logger.warn('Network connectivity lost (verified by check)')
      }
    }
  }

  public async fetch<T = any>(
    request: NetworkRequest
  ): Promise<NetworkResponse<T>> {
    const {
      url,
      options = {},
      timeout = 30000,
      retries = this.retryConfig.maxRetries,
      retryDelay = this.retryConfig.initialDelay,
    } = request

    // If offline, queue the request
    if (!this.isOnline) {
      return this.queueOfflineRequest<T>(request)
    }

    return this.executeWithRetry<T>({
      url,
      options: {
        ...options,
        signal: AbortSignal.timeout(timeout),
      },
      retries,
      retryDelay,
    })
  }

  private async executeWithRetry<T>(
    request: NetworkRequest & { retries: number; retryDelay: number }
  ): Promise<NetworkResponse<T>> {
    let lastError: Error | null = null

    for (let attempt = 0; attempt <= request.retries; attempt++) {
      try {
        logger.debug('Network request attempt', {
          url: request.url,
          attempt: attempt + 1,
          maxRetries: request.retries + 1,
        })

        const response = await fetch(request.url, request.options)

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const data = await this.parseResponse<T>(response)

        return {
          data,
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        }
      } catch (error) {
        lastError = error as Error

        logger.warn('Network request failed', {
          url: request.url,
          attempt: attempt + 1,
          error: lastError.message,
        })

        // Check if we should retry
        if (
          attempt < request.retries &&
          this.retryConfig.retryCondition(lastError, attempt)
        ) {
          const delay = Math.min(
            request.retryDelay *
              Math.pow(this.retryConfig.backoffFactor, attempt),
            this.retryConfig.maxDelay
          )

          logger.debug('Retrying network request', {
            url: request.url,
            retryIn: delay,
            attempt: attempt + 1,
          })

          await this.delay(delay)
          continue
        }

        // If this was the last attempt or retry condition not met, throw
        break
      }
    }

    // All retries exhausted
    throw new Error(
      `Network request failed after ${request.retries + 1} attempts: ${lastError?.message}`
    )
  }

  private async parseResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type')

    if (contentType?.includes('application/json')) {
      return await response.json()
    }

    if (contentType?.includes('text/')) {
      return (await response.text()) as unknown as T
    }

    return (await response.blob()) as unknown as T
  }

  private async queueOfflineRequest<T>(
    request: NetworkRequest
  ): Promise<NetworkResponse<T>> {
    return new Promise((resolve, reject) => {
      this.offlineQueue.push({
        request,
        resolve,
        reject,
      })

      logger.info('Request queued for offline processing', {
        url: request.url,
        queueSize: this.offlineQueue.length,
      })
    })
  }

  private async processOfflineQueue(): Promise<void> {
    if (this.offlineQueue.length === 0) {
      return
    }

    logger.info('Processing offline request queue', {
      queueSize: this.offlineQueue.length,
    })

    const queue = [...this.offlineQueue]
    this.offlineQueue = []

    for (const item of queue) {
      try {
        const response = await this.executeWithRetry({
          ...item.request,
          retries: item.request.retries ?? this.retryConfig.maxRetries,
          retryDelay: item.request.retryDelay ?? this.retryConfig.initialDelay,
        })
        item.resolve(response)
      } catch (error) {
        item.reject(error as Error)
      }
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Utility methods
  public isNetworkOnline(): boolean {
    return this.isOnline
  }

  public getOfflineQueueSize(): number {
    return this.offlineQueue.length
  }

  public clearOfflineQueue(): void {
    this.offlineQueue.forEach(item => {
      item.reject(new Error('Offline queue cleared'))
    })
    this.offlineQueue = []
    logger.info('Offline queue cleared')
  }

  public updateRetryConfig(config: Partial<RetryConfig>): void {
    this.retryConfig = {
      ...this.retryConfig,
      ...config,
    }
    logger.info('Network retry configuration updated', config)
  }
}

// Convenience function for making resilient network requests
export const resilientFetch = <T = any>(
  request: NetworkRequest
): Promise<NetworkResponse<T>> => {
  return NetworkResilienceService.getInstance().fetch<T>(request)
}

// Export singleton instance
export const networkResilience = NetworkResilienceService.getInstance()
