/**
 * Enhanced Plugin Security Service
 * Advanced security framework with Repository Pattern integration
 */

import { logger } from '../utils/logger'
import { createDocumentRepository } from '../lib/repositories/RepositoryFactory'
import type { IDocumentRepository } from '../lib/repositories/IRepository'

export interface SecurityPolicy {
  pluginName: string
  permissions: string[]
  resourceLimits: ResourceLimits
  sandboxLevel: 'strict' | 'moderate' | 'permissive'
  trustedOrigins?: string[]
  allowedDomains?: string[]
}

export interface ResourceLimits {
  maxMemoryMB: number
  maxExecutionTimeMs: number
  maxNetworkRequests: number
  maxStorageMB: number
  maxConcurrentOperations: number
}

export interface SecurityViolation {
  pluginName: string
  violation: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  timestamp: number
  details?: any
  stackTrace?: string
}

export interface PluginMetrics {
  pluginName: string
  memoryUsage: number
  executionTime: number
  networkRequests: number
  storageUsed: number
  operationsCount: number
  lastActivity: number
  violations: number
}

/**
 * Enhanced Plugin Security Service with Repository Integration
 */
export class EnhancedPluginSecurityService {
  private policies: Map<string, SecurityPolicy> = new Map()
  private violations: SecurityViolation[] = []
  private metrics: Map<string, PluginMetrics> = new Map()
  private activeOperations: Map<string, Set<string>> = new Map()
  private repository: IDocumentRepository | null = null

  constructor() {
    this.initializeRepository()
  }

  private async initializeRepository(): Promise<void> {
    try {
      this.repository = createDocumentRepository()
      await this.repository.initialize()
      await this.loadSecurityData()
    } catch (error) {
      logger.error('Failed to initialize security service repository:', error)
    }
  }

  /**
   * Register a plugin with security policy
   */
  async registerPlugin(
    pluginName: string,
    policy: Partial<SecurityPolicy>
  ): Promise<void> {
    const defaultPolicy: SecurityPolicy = {
      pluginName,
      permissions: ['notes.read'],
      resourceLimits: {
        maxMemoryMB: 50,
        maxExecutionTimeMs: 5000,
        maxNetworkRequests: 10,
        maxStorageMB: 10,
        maxConcurrentOperations: 3,
      },
      sandboxLevel: 'strict',
      trustedOrigins: [],
      allowedDomains: [],
    }

    const finalPolicy: SecurityPolicy = {
      ...defaultPolicy,
      ...policy,
      resourceLimits: {
        ...defaultPolicy.resourceLimits,
        ...policy.resourceLimits,
      },
    }

    this.policies.set(pluginName, finalPolicy)
    this.metrics.set(pluginName, {
      pluginName,
      memoryUsage: 0,
      executionTime: 0,
      networkRequests: 0,
      storageUsed: 0,
      operationsCount: 0,
      lastActivity: Date.now(),
      violations: 0,
    })

    await this.persistSecurityData()
    logger.info(`Plugin security policy registered for: ${pluginName}`)
  }

  /**
   * Validate permission for plugin operation
   */
  validatePermission(pluginName: string, permission: string): boolean {
    const policy = this.policies.get(pluginName)
    if (!policy) {
      this.recordViolation(pluginName, `No security policy found`, 'critical')
      return false
    }

    const hasPermission =
      policy.permissions.includes(permission) ||
      policy.permissions.includes('*')

    if (!hasPermission) {
      this.recordViolation(
        pluginName,
        `Permission denied: ${permission}`,
        'high'
      )
    }

    return hasPermission
  }

  /**
   * Start tracking an operation for resource monitoring
   */
  startOperation(pluginName: string, operationId: string): OperationTracker {
    const policy = this.policies.get(pluginName)
    if (!policy) {
      throw new Error(`No security policy for plugin: ${pluginName}`)
    }

    // Check concurrent operations limit
    const activeOps = this.activeOperations.get(pluginName) || new Set()
    if (activeOps.size >= policy.resourceLimits.maxConcurrentOperations) {
      this.recordViolation(
        pluginName,
        `Exceeded concurrent operations limit: ${activeOps.size}/${policy.resourceLimits.maxConcurrentOperations}`,
        'high'
      )
      throw new Error('Too many concurrent operations')
    }

    activeOps.add(operationId)
    this.activeOperations.set(pluginName, activeOps)

    const startTime = Date.now()
    const startMemory = this.getCurrentMemoryUsage()

    return new OperationTracker(
      pluginName,
      operationId,
      startTime,
      startMemory,
      () =>
        this.finishOperation(pluginName, operationId, startTime, startMemory)
    )
  }

  /**
   * Finish tracking an operation
   */
  private finishOperation(
    pluginName: string,
    operationId: string,
    startTime: number,
    startMemory: number
  ): void {
    const endTime = Date.now()
    const endMemory = this.getCurrentMemoryUsage()
    const executionTime = endTime - startTime
    const memoryDelta = endMemory - startMemory

    // Remove from active operations
    const activeOps = this.activeOperations.get(pluginName)
    if (activeOps) {
      activeOps.delete(operationId)
    }

    // Update metrics
    const metrics = this.metrics.get(pluginName)
    if (metrics) {
      metrics.executionTime += executionTime
      metrics.memoryUsage = Math.max(metrics.memoryUsage, memoryDelta)
      metrics.operationsCount += 1
      metrics.lastActivity = endTime

      // Check resource limits
      const policy = this.policies.get(pluginName)
      if (policy) {
        if (executionTime > policy.resourceLimits.maxExecutionTimeMs) {
          this.recordViolation(
            pluginName,
            `Operation exceeded time limit: ${executionTime}ms > ${policy.resourceLimits.maxExecutionTimeMs}ms`,
            'medium'
          )
        }

        if (memoryDelta > policy.resourceLimits.maxMemoryMB * 1024 * 1024) {
          this.recordViolation(
            pluginName,
            `Operation exceeded memory limit: ${memoryDelta} bytes`,
            'high'
          )
        }
      }
    }
  }

  /**
   * Record a security violation
   */
  recordViolation(
    pluginName: string,
    violation: string,
    severity: SecurityViolation['severity'],
    details?: any
  ): void {
    const violationRecord: SecurityViolation = {
      pluginName,
      violation,
      severity,
      timestamp: Date.now(),
      details,
      stackTrace: new Error().stack,
    }

    this.violations.push(violationRecord)

    // Update metrics
    const metrics = this.metrics.get(pluginName)
    if (metrics) {
      metrics.violations += 1
    }

    logger.warn(
      `Security violation [${severity}] for plugin ${pluginName}: ${violation}`,
      details
    )

    // Auto-disable plugin for critical violations
    if (severity === 'critical') {
      this.suspendPlugin(
        pluginName,
        `Critical security violation: ${violation}`
      )
    }

    // Persist violation data
    this.persistSecurityData().catch(error => {
      logger.error('Failed to persist security violation data:', error)
    })
  }

  /**
   * Suspend a plugin due to security violations
   */
  suspendPlugin(pluginName: string, reason: string): void {
    const policy = this.policies.get(pluginName)
    if (policy) {
      // Clear all permissions
      policy.permissions = []

      logger.error(`Plugin ${pluginName} suspended: ${reason}`)

      // Notify system about suspension
      this.notifyPluginSuspension(pluginName, reason)
    }
  }

  /**
   * Get security audit report for a plugin
   */
  getAuditReport(pluginName: string): {
    policy: SecurityPolicy | null
    metrics: PluginMetrics | null
    violations: SecurityViolation[]
    riskLevel: 'low' | 'medium' | 'high' | 'critical'
  } {
    const policy = this.policies.get(pluginName) || null
    const metrics = this.metrics.get(pluginName) || null
    const violations = this.violations.filter(v => v.pluginName === pluginName)

    // Calculate risk level
    const criticalViolations = violations.filter(
      v => v.severity === 'critical'
    ).length
    const highViolations = violations.filter(v => v.severity === 'high').length
    const mediumViolations = violations.filter(
      v => v.severity === 'medium'
    ).length

    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low'
    if (criticalViolations > 0) riskLevel = 'critical'
    else if (highViolations > 2) riskLevel = 'high'
    else if (highViolations > 0 || mediumViolations > 5) riskLevel = 'medium'

    return {
      policy,
      metrics,
      violations,
      riskLevel,
    }
  }

  /**
   * Get system-wide security summary
   */
  getSecuritySummary(): {
    totalPlugins: number
    activePlugins: number
    suspendedPlugins: number
    totalViolations: number
    highRiskPlugins: string[]
    resourceUsage: {
      totalMemory: number
      totalOperations: number
      averageExecutionTime: number
    }
  } {
    const totalPlugins = this.policies.size
    const suspendedPlugins = Array.from(this.policies.values()).filter(
      p => p.permissions.length === 0
    ).length
    const activePlugins = totalPlugins - suspendedPlugins

    const highRiskPlugins = Array.from(this.policies.keys()).filter(
      pluginName =>
        this.getAuditReport(pluginName).riskLevel === 'high' ||
        this.getAuditReport(pluginName).riskLevel === 'critical'
    )

    const allMetrics = Array.from(this.metrics.values())
    const resourceUsage = {
      totalMemory: allMetrics.reduce((sum, m) => sum + m.memoryUsage, 0),
      totalOperations: allMetrics.reduce(
        (sum, m) => sum + m.operationsCount,
        0
      ),
      averageExecutionTime:
        allMetrics.length > 0
          ? allMetrics.reduce((sum, m) => sum + m.executionTime, 0) /
            allMetrics.length
          : 0,
    }

    return {
      totalPlugins,
      activePlugins,
      suspendedPlugins,
      totalViolations: this.violations.length,
      highRiskPlugins,
      resourceUsage,
    }
  }

  /**
   * Load security data from repository
   */
  private async loadSecurityData(): Promise<void> {
    if (!this.repository) return

    try {
      // Load security policies and violations from storage
      const securityData = await this.repository.getSettings('plugin-security')
      if (securityData) {
        const { policies, violations, metrics } = securityData as any

        if (policies) {
          this.policies = new Map(Object.entries(policies))
        }
        if (violations) {
          this.violations = violations
        }
        if (metrics) {
          this.metrics = new Map(Object.entries(metrics))
        }
      }
    } catch (error) {
      logger.warn('Failed to load security data:', error)
    }
  }

  /**
   * Persist security data to repository
   */
  private async persistSecurityData(): Promise<void> {
    if (!this.repository) return

    try {
      const securityData = {
        policies: Object.fromEntries(this.policies),
        violations: this.violations.slice(-1000), // Keep last 1000 violations
        metrics: Object.fromEntries(this.metrics),
        lastUpdated: Date.now(),
      }

      await this.repository.setSettings('plugin-security', securityData)
    } catch (error) {
      logger.error('Failed to persist security data:', error)
    }
  }

  /**
   * Get current memory usage (simplified)
   */
  private getCurrentMemoryUsage(): number {
    if (typeof performance !== 'undefined' && performance.memory) {
      return performance.memory.usedJSHeapSize
    }
    return 0
  }

  /**
   * Notify about plugin suspension
   */
  private notifyPluginSuspension(pluginName: string, reason: string): void {
    // Emit event or call notification service
    if (typeof window !== 'undefined' && (window as any).showToast) {
      ;(window as any).showToast({
        type: 'error',
        message: `Plugin "${pluginName}" suspended due to security violation`,
        duration: 5000,
      })
    }
  }
}

/**
 * Operation Tracker for monitoring plugin operations
 */
export class OperationTracker {
  constructor(
    private pluginName: string,
    private operationId: string,
    private startTime: number,
    private startMemory: number,
    private finishCallback: () => void
  ) {}

  finish(): void {
    this.finishCallback()
  }

  getElapsedTime(): number {
    return Date.now() - this.startTime
  }

  getPluginName(): string {
    return this.pluginName
  }

  getOperationId(): string {
    return this.operationId
  }
}

// Export singleton instance
export const enhancedPluginSecurityService = new EnhancedPluginSecurityService()
