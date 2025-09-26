/**
 * Comprehensive tests for NetworkResilienceService
 * Tests network resilience, offline handling, and retry mechanisms
 */

import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { NetworkResilienceService } from '../NetworkResilienceService'

// Mock fetch for network operations
const mockFetch = vi.fn()
global.fetch = mockFetch

// Mock navigator.onLine
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: true,
})

describe('NetworkResilienceService', () => {
  let service: NetworkResilienceService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new NetworkResilienceService()
    navigator.onLine = true
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Initialization', () => {
    it('should initialize with default configuration', () => {
      expect(service).toBeDefined()
      expect(service.isOnline()).toBe(true)
      expect(service.getQueuedRequests()).toEqual([])
    })

    it('should detect initial offline state', () => {
      navigator.onLine = false
      const offlineService = new NetworkResilienceService()
      expect(offlineService.isOnline()).toBe(false)
    })
  })

  describe('Network Status Detection', () => {
    it('should detect online status changes', () => {
      expect(service.isOnline()).toBe(true)

      // Simulate going offline
      navigator.onLine = false
      window.dispatchEvent(new Event('offline'))

      expect(service.isOnline()).toBe(false)
    })

    it('should detect offline status changes', () => {
      navigator.onLine = false
      const offlineService = new NetworkResilienceService()
      expect(offlineService.isOnline()).toBe(false)

      // Simulate coming online
      navigator.onLine = true
      window.dispatchEvent(new Event('online'))

      expect(offlineService.isOnline()).toBe(true)
    })

    it('should handle network status listeners', () => {
      const statusHandler = vi.fn()
      service.onNetworkStatusChange(statusHandler)

      // Simulate network change
      navigator.onLine = false
      window.dispatchEvent(new Event('offline'))

      expect(statusHandler).toHaveBeenCalledWith(false)
    })
  })

  describe('Request Execution with Retry', () => {
    it('should execute successful requests normally', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ data: 'success' }),
      }
      mockFetch.mockResolvedValueOnce(mockResponse)

      const operation = () => fetch('https://api.example.com/data')
      const result = await service.executeWithRetry(operation)

      expect(result).toBe(mockResponse)
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    it('should retry failed requests with exponential backoff', async () => {
      const networkError = new Error('Network error')
      mockFetch
        .mockRejectedValueOnce(networkError)
        .mockRejectedValueOnce(networkError)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ data: 'success' }),
        })

      const operation = () => fetch('https://api.example.com/data')
      const result = await service.executeWithRetry(operation)

      expect(result.ok).toBe(true)
      expect(mockFetch).toHaveBeenCalledTimes(3)
    })

    it('should fail after maximum retry attempts', async () => {
      const networkError = new Error('Persistent network error')
      mockFetch.mockRejectedValue(networkError)

      const operation = () => fetch('https://api.example.com/data')

      await expect(service.executeWithRetry(operation)).rejects.toThrow(
        'Persistent network error'
      )
      expect(mockFetch).toHaveBeenCalledTimes(4) // 1 initial + 3 retries
    })

    it('should handle timeout errors', async () => {
      const timeoutError = new Error('Request timeout')
      timeoutError.name = 'TimeoutError'
      mockFetch.mockRejectedValue(timeoutError)

      const operation = () => fetch('https://api.example.com/data')

      await expect(service.executeWithRetry(operation)).rejects.toThrow(
        'Request timeout'
      )
      expect(mockFetch).toHaveBeenCalledTimes(4) // Should retry timeout errors
    })

    it('should not retry non-retryable errors', async () => {
      const clientError = new Error('Bad request')
      clientError.name = 'ClientError'
      mockFetch.mockRejectedValue(clientError)

      const operation = () => fetch('https://api.example.com/data')

      await expect(service.executeWithRetry(operation)).rejects.toThrow(
        'Bad request'
      )
      expect(mockFetch).toHaveBeenCalledTimes(1) // Should not retry
    })
  })

  describe('Offline Queue Management', () => {
    it('should queue requests when offline', async () => {
      navigator.onLine = false
      service = new NetworkResilienceService()

      const operation = () => fetch('https://api.example.com/data')
      const promise = service.executeWithRetry(operation)

      // Request should be queued
      expect(service.getQueuedRequests()).toHaveLength(1)
      expect(mockFetch).not.toHaveBeenCalled()

      // Simulate coming online
      navigator.onLine = true
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: 'queued' }),
      })

      service.processQueue()

      const result = await promise
      expect(result.ok).toBe(true)
      expect(service.getQueuedRequests()).toHaveLength(0)
    })

    it('should process queued requests when coming online', async () => {
      navigator.onLine = false
      service = new NetworkResilienceService()

      const operations = [
        () => fetch('https://api.example.com/data1'),
        () => fetch('https://api.example.com/data2'),
        () => fetch('https://api.example.com/data3'),
      ]

      const promises = operations.map(op => service.executeWithRetry(op))

      expect(service.getQueuedRequests()).toHaveLength(3)

      // Simulate coming online
      navigator.onLine = true
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: 'success' }),
      })

      service.processQueue()

      await Promise.all(promises)
      expect(service.getQueuedRequests()).toHaveLength(0)
      expect(mockFetch).toHaveBeenCalledTimes(3)
    })

    it('should handle queue processing errors', async () => {
      navigator.onLine = false
      service = new NetworkResilienceService()

      const operation = () => fetch('https://api.example.com/data')
      const promise = service.executeWithRetry(operation)

      // Simulate coming online with error
      navigator.onLine = true
      mockFetch.mockRejectedValue(new Error('Queue processing error'))

      service.processQueue()

      await expect(promise).rejects.toThrow('Queue processing error')
    })

    it('should limit queue size', async () => {
      navigator.onLine = false
      service = new NetworkResilienceService()

      // Queue many requests
      const operations = Array(200)
        .fill(0)
        .map((_, i) => () => fetch(`https://api.example.com/data${i}`))

      const promises = operations.map(op => service.executeWithRetry(op))

      // Should limit queue size (assuming limit is 100)
      expect(service.getQueuedRequests().length).toBeLessThanOrEqual(100)
    })
  })

  describe('Request Timeout Handling', () => {
    it('should timeout long-running requests', async () => {
      const slowOperation = () =>
        new Promise(resolve => setTimeout(resolve, 35000)) // 35 seconds

      await expect(
        service.executeWithRetry(slowOperation, { timeoutMs: 1000 })
      ).rejects.toThrow('Request timeout')
    })

    it('should use default timeout when not specified', async () => {
      const slowOperation = () =>
        new Promise(resolve => setTimeout(resolve, 35000))

      await expect(service.executeWithRetry(slowOperation)).rejects.toThrow(
        'Request timeout'
      )
    })

    it('should respect custom timeout values', async () => {
      const operation = () =>
        new Promise(resolve => setTimeout(() => resolve('success'), 500))

      const result = await service.executeWithRetry(operation, {
        timeoutMs: 1000,
      })
      expect(result).toBe('success')
    })
  })

  describe('Network Health Monitoring', () => {
    it('should track network health metrics', () => {
      const metrics = service.getNetworkMetrics()

      expect(metrics).toHaveProperty('totalRequests')
      expect(metrics).toHaveProperty('successfulRequests')
      expect(metrics).toHaveProperty('failedRequests')
      expect(metrics).toHaveProperty('averageResponseTime')
      expect(metrics).toHaveProperty('isOnline')
    })

    it('should update metrics on successful requests', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ data: 'success' }),
      }
      mockFetch.mockResolvedValue(mockResponse)

      const operation = () => fetch('https://api.example.com/data')
      await service.executeWithRetry(operation)

      const metrics = service.getNetworkMetrics()
      expect(metrics.totalRequests).toBe(1)
      expect(metrics.successfulRequests).toBe(1)
      expect(metrics.failedRequests).toBe(0)
    })

    it('should update metrics on failed requests', async () => {
      const networkError = new Error('Network error')
      mockFetch.mockRejectedValue(networkError)

      const operation = () => fetch('https://api.example.com/data')

      try {
        await service.executeWithRetry(operation)
      } catch (error) {
        // Expected to fail
      }

      const metrics = service.getNetworkMetrics()
      expect(metrics.totalRequests).toBe(1)
      expect(metrics.successfulRequests).toBe(0)
      expect(metrics.failedRequests).toBe(1)
    })

    it('should calculate average response time', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ data: 'success' }),
      }
      mockFetch.mockResolvedValue(mockResponse)

      const operation = () => fetch('https://api.example.com/data')
      await service.executeWithRetry(operation)

      const metrics = service.getNetworkMetrics()
      expect(metrics.averageResponseTime).toBeGreaterThan(0)
    })
  })

  describe('Circuit Breaker Pattern', () => {
    it('should open circuit after threshold failures', async () => {
      const networkError = new Error('Network error')
      mockFetch.mockRejectedValue(networkError)

      const operation = () => fetch('https://api.example.com/data')

      // Trigger multiple failures to open circuit
      for (let i = 0; i < 5; i++) {
        try {
          await service.executeWithRetry(operation)
        } catch (error) {
          // Expected to fail
        }
      }

      const metrics = service.getNetworkMetrics()
      expect(metrics.circuitBreakerState).toBe('open')
    })

    it('should reject requests when circuit is open', async () => {
      const networkError = new Error('Network error')
      mockFetch.mockRejectedValue(networkError)

      const operation = () => fetch('https://api.example.com/data')

      // Open circuit
      for (let i = 0; i < 5; i++) {
        try {
          await service.executeWithRetry(operation)
        } catch (error) {
          // Expected to fail
        }
      }

      // Next request should be rejected immediately
      await expect(service.executeWithRetry(operation)).rejects.toThrow(
        'Circuit breaker is open'
      )
    })

    it('should transition to half-open state after timeout', async () => {
      const networkError = new Error('Network error')
      mockFetch.mockRejectedValue(networkError)

      const operation = () => fetch('https://api.example.com/data')

      // Open circuit
      for (let i = 0; i < 5; i++) {
        try {
          await service.executeWithRetry(operation)
        } catch (error) {
          // Expected to fail
        }
      }

      // Wait for circuit breaker timeout
      await new Promise(resolve => setTimeout(resolve, 1100)) // Assuming 1s timeout

      const metrics = service.getNetworkMetrics()
      expect(metrics.circuitBreakerState).toBe('half-open')
    })
  })

  describe('Request Prioritization', () => {
    it('should prioritize high-priority requests', async () => {
      navigator.onLine = false
      service = new NetworkResilienceService()

      const lowPriority = () => fetch('https://api.example.com/low')
      const highPriority = () => fetch('https://api.example.com/high')

      service.executeWithRetry(lowPriority, { priority: 'low' })
      service.executeWithRetry(highPriority, { priority: 'high' })

      const queue = service.getQueuedRequests()
      expect(queue[0].priority).toBe('high')
      expect(queue[1].priority).toBe('low')
    })

    it('should handle request cancellation', async () => {
      navigator.onLine = false
      service = new NetworkResilienceService()

      const operation = () => fetch('https://api.example.com/data')
      const controller = new AbortController()

      const promise = service.executeWithRetry(operation, {
        signal: controller.signal,
      })

      controller.abort()

      await expect(promise).rejects.toThrow('Request cancelled')
    })
  })

  describe('Error Classification', () => {
    it('should classify network errors correctly', () => {
      const networkError = new Error('fetch failed')
      networkError.name = 'TypeError'

      expect(service.isRetryableError(networkError)).toBe(true)
    })

    it('should classify timeout errors as retryable', () => {
      const timeoutError = new Error('Request timeout')
      timeoutError.name = 'TimeoutError'

      expect(service.isRetryableError(timeoutError)).toBe(true)
    })

    it('should classify client errors as non-retryable', () => {
      const clientError = new Error('Bad request')
      clientError.name = 'ClientError'

      expect(service.isRetryableError(clientError)).toBe(false)
    })

    it('should classify server errors as retryable', () => {
      const serverError = new Error('Internal server error')
      serverError.name = 'ServerError'

      expect(service.isRetryableError(serverError)).toBe(true)
    })
  })

  describe('Performance Optimization', () => {
    it('should handle concurrent requests efficiently', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ data: 'success' }),
      }
      mockFetch.mockResolvedValue(mockResponse)

      const operations = Array(10)
        .fill(0)
        .map((_, i) => () => fetch(`https://api.example.com/data${i}`))

      const startTime = performance.now()
      const promises = operations.map(op => service.executeWithRetry(op))
      await Promise.all(promises)
      const endTime = performance.now()

      expect(endTime - startTime).toBeLessThan(1000) // Should complete quickly
      expect(mockFetch).toHaveBeenCalledTimes(10)
    })

    it('should clean up old metrics', () => {
      // Add some metrics
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ data: 'success' }),
      }
      mockFetch.mockResolvedValue(mockResponse)

      const operation = () => fetch('https://api.example.com/data')
      service.executeWithRetry(operation)

      // Trigger cleanup
      service.cleanup()

      // Metrics should be reset or cleaned up
      const metrics = service.getNetworkMetrics()
      expect(metrics.totalRequests).toBe(0)
    })
  })

  describe('Configuration Management', () => {
    it('should accept custom configuration', () => {
      const customConfig = {
        maxRetries: 5,
        baseDelay: 2000,
        timeoutMs: 60000,
        queueLimit: 200,
      }

      const customService = new NetworkResilienceService(customConfig)
      expect(customService).toBeDefined()
    })

    it('should update configuration dynamically', () => {
      const newConfig = {
        maxRetries: 10,
        baseDelay: 3000,
      }

      service.updateConfiguration(newConfig)

      // Configuration should be updated
      expect(service.getConfiguration().maxRetries).toBe(10)
      expect(service.getConfiguration().baseDelay).toBe(3000)
    })
  })
})
